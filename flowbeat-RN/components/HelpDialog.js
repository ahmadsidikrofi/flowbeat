import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Dialog, Portal, Text } from 'react-native-paper';

const HelpDialog = ({helpVisible, setHelpVisible}) => {
  const hideDialog = () => setHelpVisible(false);
  return (
    <Portal>
      <Dialog visible={helpVisible} onDismiss={hideDialog}>
        <Dialog.Title style={styles.title}>Wawasan Icon</Dialog.Title>
        <Dialog.Content style={{ paddingHorizontal: 30 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Dialog.Icon icon="alert-circle-outline" size={30}  />
            <View style={{ paddingHorizontal: 20 }}>
              <Text variant="bodyLarge" style={{ fontSize: 20 }}>Kesalahan Pengukuran</Text>
              <Text variant="bodyMedium">Muncul ketika ada kesalahan saat posisi kamu kurang baik, perekatan manset, atau gerakan tubuh terlalu banyak yang terdeteksi selama pengukuran</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Dialog.Icon icon="heart-multiple-outline" size={30} />
            <View style={{ padding: 20 }}>
            <Text variant="bodyLarge" style={{ fontSize: 20 }}>Ritme Jantung Tidak Teratur</Text>
            <Text variant="bodyMedium">Muncul kalau detak jantung tidak teratur terdeteksi dua kali atau lebih selama pengukuran</Text>
            </View>
          </View>
        </Dialog.Content>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
  },
})

export default HelpDialog;