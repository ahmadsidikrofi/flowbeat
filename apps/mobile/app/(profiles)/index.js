import { useState, useEffect } from 'react';
import { View, TouchableOpacity, ScrollView, Image, Modal, TextInput, KeyboardAvoidingView, Platform, StyleSheet, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../../utils/AuthProvider';
import { hitungUmur, formatTanggal, parseTanggal, formatDateInput } from '../../utils/dateHelpers';

// Helper to get 2-letter initials (e.g. "Gilang Ramadhan" -> "GR", "Gilang" -> "GI")
const getInitials = (name) => {
  if (!name) return '??';
  const cleanName = name.trim();
  const parts = cleanName.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  if (cleanName.length >= 2) {
    return cleanName.substring(0, 2).toUpperCase();
  }
  return cleanName.substring(0, 1).toUpperCase();
};

export default function ProfileSelectionScreen() {
  const { profiles, selectProfile, logout, currentUser, deleteProfile, updateProfile, loadProfiles } = useAppContext();
  const router = useRouter();

  const [isManageMode, setIsManageMode] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState(null);
  const [deleteVerifyText, setDeleteVerifyText] = useState('');

  const [profileToEdit, setProfileToEdit] = useState(null);
  const [editNameText, setEditNameText] = useState('');
  const [editTanggalLahirText, setEditTanggalLahirText] = useState('');
  const [editTanggalLahir, setEditTanggalLahir] = useState(null);
  const [editTbText, setEditTbText] = useState('');
  const [editBbText, setEditBbText] = useState('');
  const [editGenderText, setEditGenderText] = useState('');
  const [showEditGenderPicker, setShowEditGenderPicker] = useState(false);
  const [editIsLoading, setEditIsLoading] = useState(false);

  useEffect(() => {
    loadProfiles();
  }, []);

  const handleDeleteConfirm = async () => {
    if (profileToDelete && deleteVerifyText === `HAPUS ${profileToDelete.name}`) {
      await deleteProfile(profileToDelete.id);
      setProfileToDelete(null);
      setDeleteVerifyText('');
    }
  };

  const handleEditConfirm = async () => {
    if (profileToEdit && editNameText.trim() !== '') {
      setEditIsLoading(true);
      const parsed = editTanggalLahirText ? parseTanggal(editTanggalLahirText) : null;
      const data = {
        name: editNameText.trim(),
        tanggal_lahir: parsed ? parsed.toISOString() : null,
        umur: parsed ? hitungUmur(parsed) : 0,
        gender: editGenderText,
        tinggi_badan: parseFloat(editTbText) || 0,
        berat_badan: parseFloat(editBbText) || 0,
      };
      await updateProfile(profileToEdit.id, data);
      setEditIsLoading(false);
      setProfileToEdit(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>{currentUser?.name}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={26} color="#38bdf8" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>Siapa yang akan mengukur hari ini?</Text>

        <View style={styles.grid}>
          {profiles.map((profile) => {
            const initials = getInitials(profile.name);
            const hasCustomImage = profile.imageUrl && !profile.imageUrl.includes('ui-avatars.com');

            return (
              <TouchableOpacity
                key={profile.id}
                style={styles.profileCard}
                onPress={() => {
                  if (!isManageMode) {
                    selectProfile(profile);
                  }
                }}
                activeOpacity={isManageMode ? 1 : 0.7}
              >
                <View style={styles.imageContainer}>
                  {hasCustomImage ? (
                    <Image
                      source={{ uri: profile.imageUrl }}
                      style={styles.profileImage}
                    />
                  ) : (
                    <View style={styles.initialsAvatarContainer}>
                      <Text style={styles.initialsAvatarText}>{initials}</Text>
                    </View>
                  )}

                  {/* 2-Letter Badge on top right corner */}
                  <View style={styles.initialsBadge}>
                    <Text style={styles.initialsBadgeText}>{initials}</Text>
                  </View>

                  {isManageMode && (
                    <View style={styles.manageOverlay}>
                      <TouchableOpacity
                        style={[styles.manageActionBtn, { backgroundColor: '#0ea5e9' }]}
                        onPress={() => {
                          setProfileToEdit(profile);
                          setEditNameText(profile.name);
                          setEditTanggalLahirText(profile.tanggal_lahir ? formatTanggal(profile.tanggal_lahir) : '');
                          setEditTanggalLahir(profile.tanggal_lahir ? new Date(profile.tanggal_lahir) : null);
                          setEditGenderText(profile.gender || '');
                          setEditTbText(String(profile.tinggi_badan || ''));
                          setEditBbText(String(profile.berat_badan || ''));
                        }}
                      >
                        <Ionicons name="create-outline" size={24} color="#ffffff" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.manageActionBtn, { backgroundColor: '#ef4444' }]}
                        onPress={() => {
                          setProfileToDelete(profile);
                          setDeleteVerifyText('');
                        }}
                      >
                        <Ionicons name="trash-outline" size={24} color="#ffffff" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                <Text style={styles.profileName}>{profile.name}</Text>
              </TouchableOpacity>
            );
          })}

          {/* Add Profile Button */}
          {!isManageMode && (
            <TouchableOpacity
              style={styles.profileCard}
              onPress={() => router.push('/(profiles)/add')}
              activeOpacity={0.7}
            >
              <View style={[styles.imageContainer, styles.addProfileContainer]}>
                <Ionicons name="add-circle" size={64} color="#64748b" />
              </View>
              <Text style={styles.addProfileName}>Tambah Profil</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.manageButton}
            onPress={() => setIsManageMode(!isManageMode)}
          >
            <Ionicons name={isManageMode ? "checkmark" : "settings-outline"} size={22} color="#38bdf8" />
            <Text style={styles.manageButtonText}>
              {isManageMode ? "Selesai Kelola" : "Kelola Profil"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={!!profileToEdit} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="always">
              <Text style={styles.modalTitle}>Edit Profil</Text>

              {/* Nama */}
              <Text style={styles.label}>Nama Profil</Text>
              <TextInput
                style={styles.input}
                value={editNameText}
                onChangeText={setEditNameText}
                placeholder="Masukkan nama"
                placeholderTextColor="#64748b"
              />

              {/* Tanggal Lahir */}
              <Text style={styles.label}>Tanggal Lahir</Text>
              <View style={styles.dateInputRow}>
                <Ionicons name="calendar-outline" size={20} color="#38bdf8" />
                <TextInput
                  style={styles.dateInput}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor="#64748b"
                  value={editTanggalLahirText}
                  onChangeText={(v) => {
                    const formatted = formatDateInput(v, editTanggalLahirText);
                    setEditTanggalLahirText(formatted);
                    const parsed = parseTanggal(formatted);
                    setEditTanggalLahir(parsed);
                  }}
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>
              {editTanggalLahir ? (
                <Text style={styles.ageInfoText}>
                  Umur: {hitungUmur(editTanggalLahir)} tahun
                </Text>
              ) : <View style={{ marginBottom: 8 }} />}

              {/* Gender */}
              <Text style={styles.label}>Gender</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowEditGenderPicker(true)}
              >
                <Text style={[styles.dropdownText, !editGenderText && { color: '#64748b' }]}>
                  {editGenderText || 'Pilih Gender'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#94a3b8" />
              </TouchableOpacity>

              {/* TB */}
              <Text style={styles.label}>Tinggi Badan (cm)</Text>
              <TextInput
                style={styles.input}
                value={editTbText}
                onChangeText={setEditTbText}
                placeholder="Contoh: 165"
                placeholderTextColor="#64748b"
                keyboardType="numeric"
              />

              {/* BB */}
              <Text style={styles.label}>Berat Badan (kg)</Text>
              <TextInput
                style={styles.input}
                value={editBbText}
                onChangeText={setEditBbText}
                placeholder="Contoh: 70"
                placeholderTextColor="#64748b"
                keyboardType="numeric"
              />

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalButtonCancel} onPress={() => setProfileToEdit(null)}>
                  <Text style={styles.modalButtonCancelText}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButtonSave, editIsLoading && { opacity: 0.6 }]} 
                  onPress={handleEditConfirm} 
                  disabled={editIsLoading}
                >
                  <Text style={styles.modalButtonSaveText}>Simpan</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Gender Picker Modal for Edit */}
      <Modal visible={showEditGenderPicker} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowEditGenderPicker(false)}
        >
          <View style={styles.modalContentSmall} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Pilih Gender</Text>
            {['Laki-laki', 'Perempuan'].map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.modalOption, editGenderText === option && styles.modalOptionSelected]}
                onPress={() => {
                  setEditGenderText(option);
                  setShowEditGenderPicker(false);
                }}
              >
                <Text style={[styles.modalOptionText, editGenderText === option && styles.modalOptionTextSelected]}>{option}</Text>
                {editGenderText === option && <Ionicons name="checkmark" size={24} color="#38bdf8" />}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Delete Profile Modal */}
      <Modal visible={!!profileToDelete} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContent}>
            <Ionicons name="warning" size={44} color="#f87171" style={{ alignSelf: 'center', marginBottom: 16 }} />
            <Text style={styles.modalTitleAlert}>Hapus Profil</Text>
            
            <View style={styles.alertBox}>
              <Text style={styles.modalWarningText}>
                Apakah anda yakin untuk menghapus profile ini? Menghapus Profile akan menghapus data yang telah kamu masukan sebelumnya. Ketik '<Text style={{ fontWeight: 'bold' }}>HAPUS {profileToDelete?.name}</Text>' untuk melakukan verifikasi jika kamu yakin.
              </Text>
            </View>
            
            <TextInput
              style={styles.input}
              value={deleteVerifyText}
              onChangeText={setDeleteVerifyText}
              placeholder={`HAPUS ${profileToDelete?.name}`}
              placeholderTextColor="#64748b"
              autoCapitalize="characters"
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalButtonCancel} onPress={() => setProfileToDelete(null)}>
                <Text style={styles.modalButtonCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButtonDelete,
                  deleteVerifyText !== `HAPUS ${profileToDelete?.name}` && styles.modalButtonDisabled
                ]}
                onPress={handleDeleteConfirm}
                disabled={deleteVerifyText !== `HAPUS ${profileToDelete?.name}`}
              >
                <Text style={styles.modalButtonSaveText}>Hapus</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f19',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    height: 72,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    backgroundColor: '#0f172a',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#38bdf8',
    fontSize: 24,
    fontWeight: '700',
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#f8fafc',
    textAlign: 'center',
    marginBottom: 40,
    maxWidth: 600,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 24,
    maxWidth: 1000,
    width: '100%',
  },
  profileCard: {
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#1e293b',
  },
  imageContainer: {
    width: 150,
    height: 150,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  initialsAvatarContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#0284c7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsAvatarText: {
    fontSize: 44,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 2,
  },
  initialsBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(14, 165, 233, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    elevation: 3,
  },
  initialsBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 1,
  },
  manageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 15, 25, 0.75)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  manageActionBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  addProfileContainer: {
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#334155',
    backgroundColor: '#111827',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f8fafc',
    marginTop: 12,
  },
  addProfileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#94a3b8',
    marginTop: 12,
  },
  footer: {
    marginTop: 56,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#0ea5e9',
    backgroundColor: '#1e293b',
  },
  manageButtonText: {
    color: '#38bdf8',
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 26,
    borderWidth: 1,
    borderColor: '#334155',
    maxHeight: '85%',
  },
  modalContentSmall: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalTitleAlert: {
    fontSize: 24,
    fontWeight: '800',
    color: '#f87171',
    marginBottom: 16,
    textAlign: 'center',
  },
  alertBox: {
    backgroundColor: '#450a0a',
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  modalWarningText: {
    fontSize: 14,
    color: '#fecaca',
    lineHeight: 22,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#f8fafc',
    marginBottom: 14,
  },
  dateInputRow: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    padding: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  dateInput: {
    flex: 1,
    fontSize: 16,
    color: '#f8fafc',
  },
  ageInfoText: {
    fontSize: 13,
    color: '#38bdf8',
    fontWeight: '600',
    marginTop: 2,
    marginBottom: 10,
  },
  dropdownButton: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
    color: '#f8fafc',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 14,
    marginTop: 24,
  },
  modalButtonCancel: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#0f172a',
  },
  modalButtonCancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#cbd5e1',
  },
  modalButtonSave: {
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 10,
    backgroundColor: '#0ea5e9',
  },
  modalButtonDelete: {
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 10,
    backgroundColor: '#ef4444',
  },
  modalButtonDisabled: {
    opacity: 0.5,
  },
  modalButtonSaveText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#0f172a',
  },
  modalOptionSelected: {
    backgroundColor: '#0369a1',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#f8fafc',
  },
  modalOptionTextSelected: {
    fontWeight: '700',
    color: '#ffffff',
  },
});
