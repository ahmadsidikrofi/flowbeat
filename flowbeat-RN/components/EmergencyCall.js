import { useState } from "react"
import { Linking, View } from "react-native"
import { Card, Text, Button, Portal, Dialog } from "react-native-paper"
import { Ionicons } from "@expo/vector-icons"

const EmergencyCall = () => {
  const [visible, setVisible] = useState(false)

  const showDialog = () => setVisible(true)
  const hideDialog = () => setVisible(false)

  const makeEmergencyCall = () => {
    hideDialog()
    Linking.openURL("tel:112")
  }

  return (
    <>
      <Card
        style={{
          backgroundColor: "#fee2e2",
          borderWidth: 1,
          borderColor: "#f43f5e",
          marginBottom: 16
        }}
      >
        <Card.Content style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flex: 1 }}>
            <Text variant="titleLarge" style={{ color: "#f43f5e", marginBottom: 4 }}>
              Panggilan Darurat
            </Text>
            <Text variant="bodyMedium" style={{ color: "#f43f5e", fontWeight: 700 }}>
              Hubungi 112 untuk bantuan medis darurat
            </Text>
          </View>
          <Button icon="phone" mode="contained" onPress={showDialog} buttonColor="#f43f5e" style={{ borderRadius: 8 }}>
            <Text style={{ color: '#fff' }}>112</Text>
          </Button>
        </Card.Content>
      </Card>

      <Portal>
        <Dialog visible={visible} onDismiss={hideDialog}>
          <Dialog.Title>Konfirmasi Panggilan Darurat</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyLarge">Anda akan menghubungi nomor darurat 112. Lanjutkan panggilan?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog}>Batal</Button>
            <Button mode="contained" style={{ borderRadius: 8 }} buttonColor="#f43f5e" onPress={makeEmergencyCall}> Hubungi 112 </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  )
}
export default EmergencyCall