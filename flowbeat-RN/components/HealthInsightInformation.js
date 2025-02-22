import { ScrollView, StyleSheet, View } from "react-native";
import { Dialog, Portal, Text } from "react-native-paper";

const HealthInsightInformation = ({ insightInformation, setInsightInformation }) => {
    const hideDialog = () => setInsightInformation(false);
    return (
        <Portal>
            <Dialog visible={insightInformation} onDismiss={hideDialog}>
                <Dialog.Title style={styles.title}>Informasi Tekanan Darah</Dialog.Title>
                <Dialog.ScrollArea style={{ paddingHorizontal: 30, flexDirection: 'col' }}>
                    <ScrollView>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start'}}>
                            <Dialog.Icon icon="water" color="#dc2626" size={30} />
                            <View style={{ padding: 20 }}>
                                <Text variant="bodyLarge" style={{ fontSize: 20 }}>Darah Rendah</Text>
                                <Text variant="bodyMedium">Sistolik di bawah 90 mmHg atau diastolik di bawah 60 mmHg. Terjadi apabila mengalami pusing, lemas, atau mudah pingsan. Biasanya terjadi kalau kurang minum, kurang makan, atau habis berdiri lama.</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                            <Dialog.Icon icon="account-heart" color="#16a34a" size={30} />
                            <View style={{ padding: 20 }}>
                                <Text variant="bodyLarge" style={{ fontSize: 20 }}>Rentang Normal</Text>
                                <Text variant="bodyMedium">Sistolik antara 90-120 mmHg dan diastolik antara 60-80 mmHg. Ini tekanan darah yang sehat. Artinya, jantung bekerja dengan baik, dan risiko penyakit jantung lebih kecil. Supaya tetap sehat, tetap jaga pola makan seimbang, olahraga ringan, dan istirahat cukup.</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                            <Dialog.Icon icon="alert-rhombus" color="#eab308"  size={30} />
                            <View style={{ padding: 20 }}>
                                <Text variant="bodyLarge" style={{ fontSize: 20 }}>Normal Tinggi</Text>
                                <Text variant="bodyMedium">Sistolik antara 120-129 mmHg dan diastolik kurang dari 80 mmHg. Belum termasuk tekanan darah tinggi, tapi kalau nggak dijaga, bisa meningkat. Mulai kurangi garam, jaga berat badan, dan perbanyak aktivitas fisik supaya tekanan darah tetap normal.</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                            <Dialog.Icon icon="alarm-light" color="#e11d48" size={30} />
                            <View style={{ padding: 20 }}>
                                <Text variant="bodyLarge" style={{ fontSize: 20 }}>Hipertensi Tinggi</Text>
                                <Text variant="bodyMedium">Sistolik 130 mmHg ke atas atau diastolik 80 mmHg ke atas. Memicu risiko stroke atau serangan jantung meningkat. Hindari makanan tinggi garam, perbanyak sayur dan buah, serta kontrol tekanan darah secara rutin. Kalau sering, sebaiknya konsultasi ke dokter.</Text>
                            </View>
                        </View>
                    </ScrollView>
                </Dialog.ScrollArea>
            </Dialog>
        </Portal>
    )
}

const styles = StyleSheet.create({
    title: {
        textAlign: 'center',
    },
})

export default HealthInsightInformation;