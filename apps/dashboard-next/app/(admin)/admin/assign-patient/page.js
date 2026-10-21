'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, CheckCircle, AlertCircle, ChevronRight, Users, Loader2 } from 'lucide-react'
import AdminHeader from '@/components/admin/AdminHeader'

const card = {
  background: '#fff',
  borderRadius: 16,
  border: '1px solid #e2e8f0',
  boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
  overflow: 'hidden',
}

const input = {
  width: '100%',
  paddingLeft: 36,
  paddingRight: 16,
  paddingTop: 9,
  paddingBottom: 9,
  border: '1px solid #e2e8f0',
  borderRadius: 10,
  fontSize: 13,
  outline: 'none',
  background: '#fff',
  color: '#1e293b',
}

export default function AssignPatientPage() {
  const [phone, setPhone] = useState('')
  const [searching, setSearching] = useState(false)
  const [foundUser, setFoundUser] = useState(null)
  const [searchError, setSearchError] = useState('')
  const [doctors, setDoctors] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState('')
  const [selectedProfiles, setSelectedProfiles] = useState([])
  const [assigning, setAssigning] = useState(false)
  const [assignSuccess, setAssignSuccess] = useState('')
  const [assignError, setAssignError] = useState('')
  const [assignments, setAssignments] = useState([])
  const [loadingAssignments, setLoadingAssignments] = useState(true)
  const [unassigningId, setUnassigningId] = useState(null)

  const loadData = async () => {
    try {
      const [docRes, assignRes] = await Promise.all([
        fetch('/api/admin/doctors').then(r => r.json()),
        fetch('/api/admin/assignments').then(r => r.json()),
      ])
      if (docRes.success) setDoctors(docRes.doctors)
      if (assignRes.success) setAssignments(assignRes.assignments)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingAssignments(false)
    }
  }

  useEffect(() => { loadData() }, [assignSuccess])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!phone.trim()) return
    setSearching(true)
    setFoundUser(null)
    setSearchError('')
    setSelectedProfiles([])
    setAssignSuccess('')
    try {
      const res = await fetch(`/api/admin/mobile-users/search?phone=${encodeURIComponent(phone.trim())}`)
      const data = await res.json()
      if (data.success) setFoundUser(data)
      else setSearchError(data.message || 'User tidak ditemukan')
    } catch { setSearchError('Gagal menghubungi server') }
    finally { setSearching(false) }
  }

  const toggleProfile = (id) => setSelectedProfiles(prev =>
    prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
  )

  const handleAssign = async (e) => {
    e.preventDefault()
    if (!selectedDoctor || selectedProfiles.length === 0 || !foundUser) return
    setAssigning(true)
    setAssignError('')
    setAssignSuccess('')
    try {
      // Kirim semua profil dalam SATU request untuk menghindari race condition
      const profiles = selectedProfiles.map(profileId => {
        const profile = foundUser.profiles.find(p => p.id === profileId)
        return {
          profileId,
          profileName: profile?.name || `Profile #${profileId}`,
        }
      })
      const res = await fetch('/api/admin/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorClerkId: selectedDoctor,
          apiUserId: foundUser.id_user,
          profiles,
          phone: foundUser?.phone || '',
        }),
      })
      const data = await res.json()
      if (data.success) {
        setAssignSuccess(`${selectedProfiles.length} profil berhasil di-assign!`)
        setSelectedProfiles([])
        setSelectedDoctor('')
        setFoundUser(null)
        setPhone('')
      } else {
        setAssignError(data.message || 'Gagal assign profil')
      }
    } catch { setAssignError('Gagal menyimpan assignment') }
    finally { setAssigning(false) }
  }

  const handleUnassign = async (assignment) => {
    const confirmMsg = `Lepas assignment "${assignment.profile_name}" dari dr. ${assignment.doctor_name}?`
    if (!window.confirm(confirmMsg)) return
    const key = `${assignment.doctor_clerk_id}-${assignment.profile_id}-${assignment.api_user_id}`
    setUnassigningId(key)
    try {
      const res = await fetch('/api/admin/assignments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorClerkId: assignment.doctor_clerk_id,
          profileId: assignment.profile_id,
          apiUserId: assignment.api_user_id,
        }),
      })
      const data = await res.json()
      if (data.success) {
        await loadData()
      }
    } catch (e) {
      console.error('Unassign error:', e)
    } finally {
      setUnassigningId(null)
    }
  }

  return (
    <div style={{minHeight:'100%', background:'#f8fafc', display: 'flex', flexDirection: 'column'}}>
      {/* Top Admin Header */}
      <AdminHeader title="Assign Pasien ke Dokter — Flowbeat Portal" />

      <div style={{padding:32, maxWidth:1100, flex: 1}}>
        {/* Breadcrumb */}
        <nav style={{display:'flex', alignItems:'center', gap:8, fontSize:13, color:'#94a3b8', marginBottom:20}}>
          <Link href="/admin" style={{color:'#94a3b8', textDecoration:'none'}}>Dashboard Admin</Link>
          <ChevronRight style={{width:14, height:14}} />
          <span style={{color:'#1e293b', fontWeight:600}}>Assign Pasien</span>
        </nav>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:28}}>
          {/* LEFT COLUMN */}
          <div style={{display:'flex', flexDirection:'column', gap:20}}>
            {/* Success Banner */}
            {assignSuccess && (
              <div style={{display:'flex', alignItems:'center', gap:10, padding:'12px 16px', background:'#d1fae5', border:'1px solid #a7f3d0', borderRadius:12, fontSize:13, color:'#065f46', fontWeight:600}}>
                <CheckCircle style={{width:16, height:16, flexShrink:0}} />
                {assignSuccess}
              </div>
            )}

            {/* Step 1 */}
            <div style={card}>
              <div style={{padding:'14px 20px', borderBottom:'1px solid #f1f5f9', background:'#f8fafc'}}>
                <h2 style={{margin:0, fontSize:14, fontWeight:700, color:'#1e293b'}}>Langkah 1: Cari User Mobile</h2>
              </div>
              <div style={{padding:20}}>
                <p style={{fontSize:13, color:'#64748b', marginTop:0, marginBottom:14}}>
                  Masukkan <strong>nomor telepon</strong> yang terdaftar di Mobile App.
                </p>
                <form onSubmit={handleSearch} style={{display:'flex', gap:10}}>
                  <div style={{position:'relative', flex:1}}>
                    <Search style={{position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', width:15, height:15, color:'#94a3b8'}} />
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="Contoh: 081234567890"
                      style={input}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={searching}
                    style={{background:'#dbeafe', color:'#1d4ed8', padding:'9px 16px', borderRadius:10, fontSize:13, fontWeight:700, border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:6, whiteSpace:'nowrap', opacity: searching ? 0.6 : 1}}
                  >
                    {searching && <Loader2 style={{width:12, height:12, animation:'spin 1s linear infinite'}} />}
                    Cari Profil
                  </button>
                </form>

                {searchError && (
                  <div style={{marginTop:12, display:'flex', alignItems:'flex-start', gap:8, padding:'10px 14px', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:10, fontSize:13, color:'#dc2626'}}>
                    <AlertCircle style={{width:15, height:15, flexShrink:0, marginTop:1}} />
                    {searchError}
                  </div>
                )}

                {foundUser && (
                  <div style={{marginTop:12, display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:12}}>
                    <div style={{width:36, height:36, borderRadius:'50%', background:'#bfdbfe', color:'#1e40af', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:13, flexShrink:0}}>
                      {foundUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{flex:1}}>
                      <p style={{margin:0, fontSize:13, fontWeight:700, color:'#1e293b'}}>{foundUser.name}</p>
                      <p style={{margin:0, fontSize:11, color:'#94a3b8'}}>{foundUser.phone} · API ID #{foundUser.id_user}</p>
                    </div>
                    <CheckCircle style={{width:18, height:18, color:'#059669'}} />
                  </div>
                )}
              </div>
            </div>

            {/* Step 2 */}
            {foundUser && (
              <div style={card}>
                <div style={{padding:'14px 20px', borderBottom:'1px solid #f1f5f9', background:'#f0fdf4', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                  <h2 style={{margin:0, fontSize:14, fontWeight:700, color:'#166534'}}>Langkah 2: Assign Profil ke Dokter</h2>
                  <span style={{fontSize:11, fontWeight:800, background:'#bbf7d0', color:'#166534', padding:'3px 10px', borderRadius:6}}>API ID #{foundUser.id_user}</span>
                </div>
                <form onSubmit={handleAssign} style={{padding:20, display:'flex', flexDirection:'column', gap:16}}>
                  <div>
                    <label style={{display:'block', fontSize:13, fontWeight:700, color:'#374151', marginBottom:8}}>Pilih Dokter</label>
                    <select
                      value={selectedDoctor}
                      onChange={e => setSelectedDoctor(e.target.value)}
                      required
                      style={{...input, paddingLeft:12, appearance:'none'}}
                    >
                      <option value="">-- Pilih Dokter --</option>
                      {doctors.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.email})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{display:'block', fontSize:13, fontWeight:700, color:'#374151', marginBottom:8}}>Profil yang akan di-assign</label>
                    {foundUser.profiles.length === 0 ? (
                      <div style={{padding:16, background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:10, fontSize:13, color:'#94a3b8', textAlign:'center'}}>
                        User ini belum memiliki profil pasien.
                      </div>
                    ) : (
                      <div style={{border:'1px solid #e2e8f0', borderRadius:10, padding:10, maxHeight:200, overflowY:'auto', display:'flex', flexDirection:'column', gap:6}}>
                        {foundUser.profiles.map(profile => {
                          const existingAssignment = assignments.find(a =>
                            Number(a.profile_id) === Number(profile.id) &&
                            Number(a.api_user_id) === Number(foundUser.id_user)
                          );
                          const isAssigned = !!existingAssignment;

                          return (
                            <label
                              key={profile.id}
                              style={{
                                display:'flex',
                                alignItems:'center',
                                gap:10,
                                padding:'8px 10px',
                                borderRadius:8,
                                cursor: isAssigned ? 'not-allowed' : 'pointer',
                                border:'1px solid transparent',
                                background: isAssigned ? '#f8fafc' : (selectedProfiles.includes(profile.id) ? '#eff6ff' : 'transparent'),
                                opacity: isAssigned ? 0.75 : 1
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={selectedProfiles.includes(profile.id)}
                                onChange={() => !isAssigned && toggleProfile(profile.id)}
                                disabled={isAssigned}
                                style={{width:15, height:15, accentColor:'#059669', cursor: isAssigned ? 'not-allowed' : 'pointer'}}
                              />
                              <div style={{ flex: 1 }}>
                                <p style={{margin:0, fontSize:13, fontWeight:600, color: isAssigned ? '#64748b' : '#1e293b'}}>{profile.name || 'Tanpa Nama'}</p>
                                <p style={{margin:0, fontSize:11, color:'#94a3b8'}}>ID: {profile.id} · {profile.gender || '-'}, {profile.age || '-'} thn</p>
                              </div>
                              {isAssigned && (
                                <span style={{
                                  fontSize: 10,
                                  fontWeight: 700,
                                  color: '#dc2626',
                                  background: '#fef2f2',
                                  border: '1px solid #fecaca',
                                  padding: '2px 8px',
                                  borderRadius: 12
                                }}>
                                  Assigned: {existingAssignment.doctor_name}
                                </span>
                              )}
                            </label>
                          )
                        })}
                      </div>
                    )}
                    <p style={{fontSize:11, color:'#94a3b8', marginTop:6, marginBottom:0}}>* Bisa pilih lebih dari satu profil.</p>
                  </div>

                  {assignError && (
                    <div style={{display:'flex', alignItems:'center', gap:8, padding:'10px 14px', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:10, fontSize:13, color:'#dc2626'}}>
                      <AlertCircle style={{width:15, height:15}} />{assignError}
                    </div>
                  )}

                  <div style={{borderTop:'1px solid #f1f5f9', paddingTop:14, display:'flex', justifyContent:'flex-end'}}>
                    <button
                      type="submit"
                      disabled={assigning || selectedProfiles.length === 0 || !selectedDoctor}
                      style={{display:'flex', alignItems:'center', gap:8, background:'#059669', color:'#fff', padding:'10px 20px', borderRadius:10, fontSize:13, fontWeight:700, border:'none', cursor:'pointer', opacity: (assigning || selectedProfiles.length === 0 || !selectedDoctor) ? 0.5 : 1}}
                    >
                      {assigning && <Loader2 style={{width:14, height:14, animation:'spin 1s linear infinite'}} />}
                      Assign Profil
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div>
            <h3 style={{fontSize:14, fontWeight:700, color:'#64748b', display:'flex', alignItems:'center', gap:8, marginTop:0, marginBottom:14}}>
              <Users style={{width:16, height:16}} />
              Daftar Assign Profil Pasien
            </h3>
            <div style={card}>
              {loadingAssignments ? (
                <div style={{padding:48, textAlign:'center', color:'#94a3b8', fontSize:13}}>Memuat...</div>
              ) : assignments.length === 0 ? (
                <div style={{padding:48, textAlign:'center', color:'#94a3b8', fontSize:13}}>
                  Belum ada pasien yang di-assign ke dokter manapun.
                </div>
              ) : (
                <table style={{width:'100%', borderCollapse:'collapse', fontSize:13}}>
                  <thead>
                    <tr style={{background:'#f8fafc'}}>
                      <th style={{padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:700, textTransform:'uppercase', color:'#64748b', letterSpacing:'0.05em', borderBottom:'1px solid #f1f5f9'}}>Pasien</th>
                      <th style={{padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:700, textTransform:'uppercase', color:'#64748b', letterSpacing:'0.05em', borderBottom:'1px solid #f1f5f9'}}>Dokter</th>
                      <th style={{padding:'10px 16px', textAlign:'center', fontSize:11, fontWeight:700, textTransform:'uppercase', color:'#64748b', letterSpacing:'0.05em', borderBottom:'1px solid #f1f5f9'}}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map((a, i) => {
                      const key = `${a.doctor_clerk_id}-${a.profile_id}-${a.api_user_id}`
                      const isUnassigning = unassigningId === key
                      return (
                        <tr key={i} style={{borderBottom:'1px solid #f8fafc', background: isUnassigning ? '#fef2f2' : 'transparent'}}>
                          <td style={{padding:'10px 16px'}}>
                            <p style={{margin:0, fontWeight:600, color:'#1e293b'}}>{a.profile_name}</p>
                            <p style={{margin:0, fontSize:11, color:'#94a3b8'}}>User: #{a.api_user_id} | Profile: #{a.profile_id}</p>
                          </td>
                          <td style={{padding:'10px 16px'}}>
                            <div style={{display:'flex', alignItems:'center', gap:8}}>
                              <div style={{width:22, height:22, borderRadius:'50%', background:'#dbeafe', color:'#1d4ed8', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:800, flexShrink:0}}>
                                {a.doctor_name.charAt(0).toUpperCase()}
                              </div>
                              <span style={{color:'#475569', fontSize:13}}>{a.doctor_name}</span>
                            </div>
                          </td>
                          <td style={{padding:'10px 16px', textAlign:'center'}}>
                            <button
                              onClick={() => handleUnassign(a)}
                              disabled={isUnassigning}
                              style={{
                                background: isUnassigning ? '#f1f5f9' : '#fef2f2',
                                color: isUnassigning ? '#94a3b8' : '#dc2626',
                                border: `1px solid ${isUnassigning ? '#e2e8f0' : '#fecaca'}`,
                                borderRadius: 6,
                                padding: '4px 10px',
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: isUnassigning ? 'not-allowed' : 'pointer',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {isUnassigning ? 'Melepas...' : 'Unassign'}
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
