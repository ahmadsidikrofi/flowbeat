// app/index.jsx
// import Home from "./home";
import React, { useEffect } from "react";
import FirstPage from "./firstpage";
import * as Brightness from "expo-brightness";

export default function Index() {
    // useEffect(() => {
    //     const setFullBrightness = async () => {
    //     try {
    //         const { status } = await Brightness.requestPermissionsAsync();
    //         if (status === 'granted') {
    //         await Brightness.setBrightnessAsync(1);
    //         }
    //     } catch (err) {
    //         console.error("Gagal mengatur brightness:", err);
    //     }
    //     };

    //     setFullBrightness();
    // }, []);
    return <FirstPage />;
}
