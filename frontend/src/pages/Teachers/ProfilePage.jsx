import React, { useEffect, useState } from 'react';
import { getProfile, updateProfile } from '../../services/teacherApi';

const inputStyle = {
  width: '100%', padding: '9px 12px', borderRadius: 8,
  border: '1px solid #E2E8F0', fontSize: 14, color: '#1C2434',
  background: '#F7F9FC', outline: 'none', boxSizing: 'border-box'
};

const labelStyle = {
  display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6
};

const readonlyStyle = {
  ...inputStyle, background: '#F1F5F9', color: '#94a3b8', cursor: 'not-allowed'
};

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    phone: '', address: '', qualification: '',
    specialization: '', emergencyContactName: '', emergencyContactPhone: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    getProfile()
      .then(res => {
        const p = res.data.data;
        setProfile(p);
        setForm({
          phone: p.phone || '',
          address: p.address || '',
          qualification: p.qualification || '',
          specialization: p.specialization || '',
          emergencyContactName: p.emergencyContactName || '',
          emergencyContactPhone: p.emergencyContactPhone || ''
        });
      })
      .catch(() => showToast('Failed to load profile', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(form);
      showToast('Profile updated successfully!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>Loading profile...</div>
  );

  if (!profile) return null;

  const initials = `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase();

  return (
    <div style={{ padding: 24, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 999,
          padding: '12px 20px', borderRadius: 10,
          background: toast.type === 'error' ? '#FEE2E2' : '#D1FAE5',
          color: toast.type === 'error' ? '#EF4444' : '#10B981',
          fontWeight: 600, boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
        }}>
          {toast.type === 'error' ? '❌' : '✅'} {toast.msg}
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1C2434', margin: 0 }}>My Profile</h1>
        <p style={{ color: '#64748b', margin: '4px 0 0' }}>View and update your personal information</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20, alignItems: 'start' }}>

        {/* Profile Card */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
          {/* Banner */}
          <div style={{
            height: 80, background: 'linear-gradient(135deg, #3C50E0, #80CAEE)'
          }} />

          <div style={{ padding: '0 24px 24px', marginTop: -36 }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: '#3C50E0', border: '4px solid #fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 12
            }}>
              {profile.profilePic
                ? <img src={profile.profilePic} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                : initials
              }
            </div>

            <div style={{ fontWeight: 700, fontSize: 18, color: '#1C2434' }}>
              {profile.firstName} {profile.lastName}
            </div>
            <div style={{ color: '#64748b', fontSize: 13, marginBottom: 4 }}>{profile.email}</div>
            <div style={{ color: '#64748b', fontSize: 13 }}>{profile.specialization || 'Teacher'}</div>

            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Employee Code', val: profile.employeeCode || '—' },
                { label: 'Employment Type', val: profile.employmentType },
                { label: 'Gender', val: profile.gender || '—' },
                { label: 'Status', val: profile.status },
              ].map(item => (
                <div key={item.label} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '8px 0', borderBottom: '1px solid #EFF4FB'
                }}>
                  <span style={{ color: '#94a3b8', fontSize: 12 }}>{item.label}</span>
                  <span style={{
                    fontSize: 13, fontWeight: 600, color: item.label === 'Status'
                      ? (profile.status === 'Active' ? '#10B981' : '#EF4444')
                      : '#1C2434'
                  }}>{item.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSave}>
          {/* Readonly Info */}
          <div style={{
            background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0',
            padding: 24, marginBottom: 16
          }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1C2434', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '.5px' }}>
              Account Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={labelStyle}>FIRST NAME</label>
                <input style={readonlyStyle} value={profile.firstName} readOnly />
              </div>
              <div>
                <label style={labelStyle}>LAST NAME</label>
                <input style={readonlyStyle} value={profile.lastName} readOnly />
              </div>
              <div>
                <label style={labelStyle}>EMAIL</label>
                <input style={readonlyStyle} value={profile.email} readOnly />
              </div>
              <div>
                <label style={labelStyle}>HIRE DATE</label>
                <input style={readonlyStyle}
                  value={profile.hireDate ? new Date(profile.hireDate).toLocaleDateString() : '—'}
                  readOnly />
              </div>
            </div>
            <p style={{ color: '#94a3b8', fontSize: 12, margin: '12px 0 0' }}>
              ℹ️ Contact admin to update name, email, or employee code
            </p>
          </div>

          {/* Editable Info */}
          <div style={{
            background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0',
            padding: 24
          }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1C2434', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '.5px' }}>
              Editable Details
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={labelStyle}>PHONE</label>
                <input style={inputStyle} value={form.phone}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="+92 300 1234567" />
              </div>
              <div>
                <label style={labelStyle}>QUALIFICATION</label>
                <input style={inputStyle} value={form.qualification}
                  onChange={e => setForm(p => ({ ...p, qualification: e.target.value }))}
                  placeholder="e.g., M.Sc Computer Science" />
              </div>
              <div>
                <label style={labelStyle}>SPECIALIZATION</label>
                <input style={inputStyle} value={form.specialization}
                  onChange={e => setForm(p => ({ ...p, specialization: e.target.value }))}
                  placeholder="e.g., Mathematics" />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>ADDRESS</label>
                <input style={inputStyle} value={form.address}
                  onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                  placeholder="Full address" />
              </div>
              <div>
                <label style={labelStyle}>EMERGENCY CONTACT NAME</label>
                <input style={inputStyle} value={form.emergencyContactName}
                  onChange={e => setForm(p => ({ ...p, emergencyContactName: e.target.value }))}
                  placeholder="Contact person name" />
              </div>
              <div>
                <label style={labelStyle}>EMERGENCY CONTACT PHONE</label>
                <input style={inputStyle} value={form.emergencyContactPhone}
                  onChange={e => setForm(p => ({ ...p, emergencyContactPhone: e.target.value }))}
                  placeholder="+92 300 1234567" />
              </div>
            </div>

            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" disabled={saving} style={{
                padding: '10px 28px', borderRadius: 8, border: 'none',
                background: saving ? '#94a3b8' : '#3C50E0',
                color: '#fff', fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer'
              }}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
