from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
import os
import sys

# Ensure stdout handles Windows console encoding nicely
sys.stdout.reconfigure(encoding='utf-8')

app = FastAPI(
    title="Glucose Prediction API v6",
    description="Backend API v6 using a clinically validated, leak-free Random Forest model trained on the Hb-PPG dataset.",
    version="6.0.0"
)

# Paths to artifacts
model_path = "model_v6.joblib"
scaler_path = "scaler_v6.joblib"
metadata_path = "metadata_v6.joblib"

# Load artifacts
if not (os.path.exists(model_path) and os.path.exists(scaler_path) and os.path.exists(metadata_path)):
    print("[ERROR] Model files missing! Please run train_v6.py first.")
    sys.exit(1)

model = joblib.load(model_path)
scaler = joblib.load(scaler_path)
metadata = joblib.load(metadata_path)

print(f"[OK] Model Loaded: {metadata['model_name']}")
print(f"     Train samples: {metadata['train_samples']}")
print(f"     CV R2: {metadata['r2_cv_mean']:.4f} +/- {metadata['r2_cv_std']:.4f}")
print(f"     CV MAE: {metadata['mae_cv_mean']:.2f} +/- {metadata['mae_cv_std']:.2f} mg/dL")

# Pydantic schema for inputs
class PredictionRequest(BaseModel):
    gender: str = Field(..., description="Gender: 'M' or 'F' (case-insensitive)")
    age: int = Field(..., ge=1, le=120, description="Age in years")
    height: float = Field(..., ge=50, le=250, description="Height in cm")
    weight: float = Field(..., ge=10, le=300, description="Weight in kg")
    sbp: float = Field(..., ge=50, le=250, description="Systolic Blood Pressure (mmHg) from Omron")
    dbp: float = Field(..., ge=30, le=150, description="Diastolic Blood Pressure (mmHg) from Omron")
    bpm: float = Field(..., ge=30, le=220, description="Heart Rate (BPM) from MAX30102")
    ratio_r: float = Field(..., ge=0.0, le=10.0, description="PPG Ratio of Ratios R from MAX30102")
    
    # Optional raw optical signal details (if not sent, API will automatically impute using dataset means)
    ac_red: float = Field(default=None, description="AC component of Red channel (optional)")
    dc_red: float = Field(default=None, description="DC component of Red channel (optional)")
    ac_ir: float = Field(default=None, description="AC component of IR channel (optional)")
    dc_ir: float = Field(default=None, description="DC component of IR channel (optional)")

@app.get("/")
def get_root():
    return {
        "message": "Glucose Prediction API v6 (Hb-PPG Clinical Model) is running!",
        "version": "6.0.0",
        "model_info": {
            "name": metadata['model_name'],
            "train_samples": metadata['train_samples'],
            "cv_metrics": {
                "r2_cross_val": f"{metadata['r2_cv_mean']:.4f}",
                "mae_cross_val_mg_dl": f"{metadata['mae_cv_mean']:.2f}"
            }
        },
        "endpoints": {
            "predict": "POST /predict",
            "health": "GET /health"
        }
    }

@app.get("/health")
def get_health():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/predict")
def predict_glucose(payload: PredictionRequest):
    # 1. Process Gender
    gender_str = payload.gender.strip().upper()
    if gender_str in ('M', 'MALE'):
        gender_male = 1
    elif gender_str in ('F', 'FEMALE'):
        gender_male = 0
    else:
        raise HTTPException(status_code=420, detail="Gender must be 'M' or 'F'")
        
    # 2. Extract input values
    age = payload.age
    height_cm = payload.height
    weight_kg = payload.weight
    sbp = payload.sbp
    dbp = payload.dbp
    bpm = payload.bpm
    ratio_r = payload.ratio_r
    
    # 3. Impute optional parameters using training set means
    imputed_fields = []
    means = metadata['feature_means']
    
    ac_red = payload.ac_red
    if ac_red is None:
        ac_red = means['AC_Red']
        imputed_fields.append("ac_red")
        
    dc_red = payload.dc_red
    if dc_red is None:
        dc_red = means['DC_Red']
        imputed_fields.append("dc_red")
        
    ac_ir = payload.ac_ir
    if ac_ir is None:
        ac_ir = means['AC_IR']
        imputed_fields.append("ac_ir")
        
    dc_ir = payload.dc_ir
    if dc_ir is None:
        dc_ir = means['DC_IR']
        imputed_fields.append("dc_ir")
        
    # 4. Construct input vector in exact training order
    # ['Gender_Male', 'Age', 'Height_cm', 'Weight_kg', 'SBP', 'DBP', 'BPM', 'Ratio_R', 'AC_Red', 'DC_Red', 'AC_IR', 'DC_IR']
    input_vector = np.array([[
        gender_male, age, height_cm, weight_kg, sbp, dbp, bpm, ratio_r, ac_red, dc_red, ac_ir, dc_ir
    ]])
    
    # 5. Scale and Predict
    input_df = pd.DataFrame(input_vector, columns=metadata['features'])
    input_scaled = scaler.transform(input_df)
    predicted_val = model.predict(input_scaled)[0]
    
    # Clip prediction to a physiologically possible range (e.g. 50 to 300)
    predicted_val = float(np.clip(predicted_val, 50.0, 300.0))
    
    # 6. ADA glucose classification
    if predicted_val < 70.0:
        category = "Hypoglycemia (Rendah)"
        risk = "TINGGI"
    elif 70.0 <= predicted_val <= 99.0:
        category = "Normal"
        risk = "RENDAH"
    elif 100.0 <= predicted_val <= 125.0:
        category = "Prediabetes (IFG)"
        risk = "SEDANG"
    elif 126.0 <= predicted_val <= 199.0:
        category = "Diabetes"
        risk = "TINGGI"
    else:
        category = "Diabetes Berat"
        risk = "KRITIS"
        
    # 7. Additional cardiovascular parameters calculation
    bmi = weight_kg / ((height_cm / 100.0) ** 2)
    if bmi < 18.5:
        bmi_cat = "Underweight"
    elif 18.5 <= bmi < 25.0:
        bmi_cat = "Normal"
    elif 25.0 <= bmi < 30.0:
        bmi_cat = "Overweight"
    else:
        bmi_cat = "Obese"
        
    pulse_pressure = sbp - dbp
    map_val = dbp + (pulse_pressure / 3.0)
    
    if sbp < 120 and dbp < 80:
        bp_cat = "Normal"
    elif 120 <= sbp < 130 and dbp < 80:
        bp_cat = "Elevated"
    elif (130 <= sbp < 140) or (80 <= dbp < 90):
        bp_cat = "Hypertension Stage 1"
    else:
        bp_cat = "Hypertension Stage 2"
        
    rpp = bpm * sbp
    if rpp < 10000:
        rpp_cat = "Normal (Rendah)"
    elif 10000 <= rpp <= 12000:
        rpp_cat = "Normal (Aktif)"
    else:
        rpp_cat = "Tinggi (Stres Miokardial)"
        
    return {
        "status": "success",
        "predicted_glucose_mg_dl": round(predicted_val, 2),
        "glucose_category": category,
        "risk_level": risk,
        "inputs": {
            "gender": payload.gender,
            "age": age,
            "height_cm": height_cm,
            "weight_kg": weight_kg,
            "sbp_mmHg": sbp,
            "dbp_mmHg": dbp,
            "bpm": bpm,
            "ratio_r": ratio_r,
            "imputed_fields": imputed_fields
        },
        "cardiovascular_analysis": {
            "bmi": round(bmi, 2),
            "bmi_category": bmi_cat,
            "pulse_pressure_mmHg": round(pulse_pressure, 2),
            "mean_arterial_pressure_mmHg": round(map_val, 2),
            "bp_category": bp_cat,
            "rate_pressure_product_bpm_mmHg": int(rpp),
            "rpp_category": rpp_cat
        },
        "model_version": "6.0.0-rf-clinical",
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    # Automatically running on port 8005
    uvicorn.run(app, host="0.0.0.0", port=8005)
