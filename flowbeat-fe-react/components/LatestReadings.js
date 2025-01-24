import { View, Text, TouchableOpacity, Image, ToastAndroid, Platform } from "react-native";
import LatestBPRead from "./LatestBPRead"
  
const LatestReadings = ({ title, latestBP, getBloodPressure, syncData, isSuccess }) => {
    function notifyMessage(msg) {
        if (Platform.OS === 'android') {
            ToastAndroid.show(msg, ToastAndroid.SHORT)
        } else {
            AlertIOS.alert(msg);
        }
    }
    return ( 
        <View className="mt-8">
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 10 }}>
                <Text style={{ fontSize: 20, fontWeight: '400' }}>{title}</Text>
                <TouchableOpacity disabled={syncData || isSuccess === false} onPress={getBloodPressure} style={{ padding: 10, width: '25%', borderRadius: 10, borderWidth: 0.1, elevation: 2, backgroundColor: syncData ? '#e5e5e5' : '#fff' }}>
                    {syncData ? (
                        <>
                            {notifyMessage('Memulai proses sinkronisasi')}
                            {notifyMessage('Berkomunikasi dengan kesehatanmu')}
                            <Image 
                                source={require('../assets/images/sync-animation.gif')} 
                                style={{ height: 20, width: 80 }}  
                            />
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
                            <Text style={{ textAlign: 'center' }}>Sync Data</Text>
                        </>
                    ) : (
                        <>
                            <Text style={{ textAlign: 'center' }}>Sync Data</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
            <View>
                <LatestBPRead latestBP={latestBP}/>
            </View>
        </View>
     );
}
 
export default LatestReadings;