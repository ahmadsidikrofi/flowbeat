// import { useMemo,useState} from "react"
// import { BleManager } from "react-native-ble-plx";

// const useBLE = () => {
//     const bleManager = useMemo(() => new BleManager(), [])
//     const [isScanning, setIsScanning] = useState(false)
//     const [device, setDevice] = useState(null)

//     const checkBluetoothStatus = async () => {
//         const state = await bleManager.state();
//         if (state !== 'PoweredOn') {
//             Alert.alert(
//                 'Bluetooth Disabled',
//                 'Please enable Bluetooth to use this feature.',
//                 [{ text: 'OK' }]
//             );
//             return false;
//         }
//         return true;
//     };


//     const requestAndroid31Permissions = async () => {
//         console.log("Requesting permissions for Android 31+...");
//         const bluetoothScanPermission = await PermissionsAndroid.request(
//             PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
//             {
//                 title: "Location Permission",
//                 message: "Bluetooth scanning requires permission",
//                 buttonPositive: "OK",
//             }
//         );
//         const bluetoothConnectPermission = await PermissionsAndroid.request(
//             PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
//             {
//                 title: "Location Permission",
//                 message: "Bluetooth connection requires permission",
//                 buttonPositive: "OK",
//             }
//         );
//         const fineLocationPermission = await PermissionsAndroid.request(
//             PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
//             {
//                 title: "Location Permission",
//                 message: "Location access is required for Bluetooth",
//                 buttonPositive: "OK",
//             }
//         );
//         return (
//             bluetoothScanPermission === "granted" &&
//             bluetoothConnectPermission === "granted" &&
//             fineLocationPermission === "granted"
//         );
//     };

//     const requestPermissions = async () => {
//         if (Platform.OS === "android") {
//             const isBluetoothEnabled = await checkBluetoothStatus();
//             if (!isBluetoothEnabled) return false;

//             if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
//                 const granted = await PermissionsAndroid.request(
//                     PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
//                     {
//                         title: "Location Permission",
//                         message: "Bluetooth Low Energy requires Location.",
//                         buttonPositive: "OK",
//                     }
//                 );
//                 return granted === PermissionsAndroid.RESULTS.GRANTED;
//             } else {
//                 return await requestAndroid31Permissions();
//             }
//         }
//         return true
//     }

//     return { requestPermissions, checkBluetoothStatus, isScanning, device }
// }

// export default useBLE