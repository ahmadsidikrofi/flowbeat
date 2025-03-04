import { View, Text, TouchableOpacity, Image, ToastAndroid, Platform, ActivityIndicator } from "react-native";
import LatestBPRead from "./LatestBPRead"
  
const LatestReadings = ({ title, latestBP,latestBPFromDB,  getBloodPressure, syncData, isSuccess }) => {
    function notifyMessage(msg) {
        if (Platform.OS === 'android') {
            ToastAndroid.show(msg, ToastAndroid.SHORT)
        } else {
            AlertIOS.alert(msg);
        }
    }
    return ( 
        <View className="mt-8">
            <View style={{ width: '100%',flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 10 }}>
                <Text style={{ fontSize: 23, fontWeight: '400', flexShrink: 1 }}>{title}</Text>
                <TouchableOpacity disabled={syncData || isSuccess === false} onPress={getBloodPressure} style={{ minWidth: 120, padding: 10, borderRadius: 10, borderWidth: 0.1, elevation: 2, backgroundColor: syncData ? '#e5e5e5' : '#2563eb' }} >
                    {syncData ? (
                        <>
                            {notifyMessage('Memulai proses sinkronisasi')}
                            {notifyMessage('Berkomunikasi dengan kesehatanmu')}
                            {/* <Image 
                                source={require('../assets/images/sync-animation.gif')} 
                                style={{ height: 20, width: 80 }}  
                            /> */}
                            <ActivityIndicator />
                        </>
                    ) : isSuccess === false ? (
                        <>
                           {notifyMessage('Silahkan coba ulang sinkronisasi')}
                           {notifyMessage('Dengan menekan tombol bluetooth pada alat selama 3 detik')}
                            <Image 
                                source={require('../assets/images/failed-animation.gif')} 
                                style={{ height: 20, width: 80, objectFit: 'contain' }}  
                            />
                        </>
                    ) : isSuccess === true ? (
                        <>
                            {notifyMessage('Sinkronisasi berhasil dilakukan')}
                            <Text style={{ textAlign: 'center',color: '#fff', fontWeight: '600', lineHeight: 24 }}>Ambil Data Terbaru</Text>
                        </>
                    ) : (
                        <>
                            <Text style={{ textAlign: 'center', color: '#fff', fontWeight: '600', lineHeight: 24 }}>Ambil Data Terbaru</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
            <View>
                <LatestBPRead latestBP={latestBP} latestBPFromDB={latestBPFromDB} syncData={syncData}/>
            </View>
        </View>
     );
}
 
export default LatestReadings;