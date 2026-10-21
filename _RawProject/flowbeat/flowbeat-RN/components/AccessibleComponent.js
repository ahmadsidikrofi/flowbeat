import React from 'react';
import { View, Text, TouchableOpacity, AccessibilityInfo } from 'react-native';

const AccessibleComponent = () => {
  const announceMessage = (message) => {
    AccessibilityInfo.announceForAccessibility(message);
  };

  return (
    <View accessible={true} accessibilityLabel="Layar Utama">
      <Text accessibilityRole="header">Selamat Datang di Aplikasi Kami</Text>
      
      <TouchableOpacity
        accessible={true}
        accessibilityLabel="Tombol untuk memulai"
        accessibilityHint="Tekan untuk memulai aplikasi"
        accessibilityRole="button"
        onPress={() => announceMessage("Aplikasi dimulai")}
      >
        <Text>Mulai</Text>
      </TouchableOpacity>

      <View accessibilityRole="list">
        <Text accessibilityRole="header">Daftar Fitur:</Text>
        <Text accessibilityRole="listitem">Fitur 1</Text>
        <Text accessibilityRole="listitem">Fitur 2</Text>
        <Text accessibilityRole="listitem">Fitur 3</Text>
      </View>
    </View>
  );
};

export default AccessibleComponent;