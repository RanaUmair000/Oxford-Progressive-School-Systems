import React, { useEffect, useState } from 'react';
import { getProfile, updateProfile } from '../../services/teacherApi';

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
      .then((res) => {
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
      // Update local profile directly to reflect new data just saved
      setProfile((prev) => ({ ...prev, ...form }));
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading profile...
      </div>
    );
  }

  if (!profile) return null;

  const initials = `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase();
  const apiUrl = import.meta.env.VITE_API_URL;
  const avatarUrl = profile.profilePic ? `${apiUrl}/${profile.profilePic}` : null;

  return (
    <div className="mx-auto max-w-242.5">
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center w-full max-w-xs p-4 rounded-lg shadow ${toast.type === 'error'
            ? 'bg-danger text-white'
            : 'bg-success text-white'
            }`}
          role="alert"
        >
          <div className="text-sm font-normal ml-3">{toast.msg}</div>
        </div>
      )}

      {/* Header Section */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          Teacher Profile
        </h2>
        <nav>
          <ol className="flex items-center gap-2">
            <li>
              <a className="font-medium" href="/">
                Dashboard /
              </a>
            </li>
            <li className="font-medium text-primary">Profile</li>
          </ol>
        </nav>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Left Column: Avatar and Info Card */}
        <div className="col-span-1 border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark rounded-sm">
          {/* Banner */}
          <div className="h-32 w-full rounded-tl-sm rounded-tr-sm bg-gradient-to-r from-primary to-secondary relative">
            <div className="absolute top-4 right-4">
              <span className={`inline-flex rounded-full py-1 px-3 text-sm font-medium text-white ${profile.status === 'Active' ? 'bg-success' : 'bg-danger'}`}>
                {profile.status}
              </span>
            </div>
          </div>

          <div className="px-6 pb-6 text-center">
            {/* Avatar */}
            <div className="relative z-30 mx-auto -mt-16 h-30 w-30 rounded-full bg-white/20 p-1 backdrop-blur sm:h-32 sm:w-32 sm:p-2 border-4 border-white dark:border-strokedark">
              <div className="relative drop-shadow-2 w-full h-full rounded-full bg-meta-4 flex items-center justify-center text-white text-3xl font-bold uppercase overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="profile" className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
            </div>

            <div className="mt-4">
              <h3 className="mb-1 text-2xl font-semibold text-black dark:text-white">
                {profile.firstName} {profile.lastName}
              </h3>
              <p className="font-medium text-graydark dark:text-gray-400">
                {profile.specialization || 'Teacher'}
              </p>

              <div className="mt-4 text-left grid grid-cols-1 gap-2 border-t border-stroke pt-4 dark:border-strokedark">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Employee Code</span>
                  <span className="text-sm font-bold text-black dark:text-white">{profile.employeeCode || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Gender</span>
                  <span className="text-sm font-bold text-black dark:text-white">{profile.gender || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Employment</span>
                  <span className="text-sm font-bold text-black dark:text-white">{profile.employmentType || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Joined</span>
                  <span className="text-sm font-bold text-black dark:text-white">{profile.hireDate ? new Date(profile.hireDate).toLocaleDateString() : '—'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Forms */}
        <div className="col-span-1 md:col-span-2">

          {/* Readonly Core Info block */}
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark mb-6">
            <div className="border-b border-stroke py-4 px-7 dark:border-strokedark flex justify-between items-center">
              <h3 className="font-medium text-black dark:text-white">
                Core Identity
              </h3>
              <span className="text-sm text-gray-500">Contact Admin to Change</span>
            </div>
            <div className="p-7">
              <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={profile.firstName}
                    readOnly
                    className="w-full rounded border border-stroke bg-gray disabled cursor-not-allowed py-2 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={profile.lastName}
                    readOnly
                    className="w-full rounded border border-stroke bg-gray disabled cursor-not-allowed py-2 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    readOnly
                    className="w-full rounded border border-stroke bg-gray disabled cursor-not-allowed py-2 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Editable settings */}
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                Personal Information
              </h3>
            </div>

            <form onSubmit={handleSave}>
              <div className="p-7">
                <div className="mb-5.5 grid grid-cols-1 sm:grid-cols-2 gap-5.5">
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      className="w-full rounded border border-stroke bg-white py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                      placeholder="+92 300 1234567"
                      value={form.phone}
                      onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Qualification
                    </label>
                    <input
                      type="text"
                      className="w-full rounded border border-stroke bg-white py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                      placeholder="M.Sc. Mathematics"
                      value={form.qualification}
                      onChange={e => setForm(p => ({ ...p, qualification: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="mb-5.5">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Specialization
                  </label>
                  <input
                    type="text"
                    className="w-full rounded border border-stroke bg-white py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                    placeholder="E.g., Quantum Physics"
                    value={form.specialization}
                    onChange={e => setForm(p => ({ ...p, specialization: e.target.value }))}
                  />
                </div>

                <div className="mb-5.5">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Current Address
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Enter your full residential address"
                    className="w-full rounded border border-stroke bg-white py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                    value={form.address}
                    onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                  ></textarea>
                </div>

                <h4 className="mt-8 mb-4 block text-sm font-bold uppercase tracking-wider text-black dark:text-white border-b border-stroke pb-2 dark:border-strokedark">
                  Emergency Contact
                </h4>

                <div className="mb-5.5 grid grid-cols-1 sm:grid-cols-2 gap-5.5">
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      className="w-full rounded border border-stroke bg-white py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                      placeholder="E.g., John Doe"
                      value={form.emergencyContactName}
                      onChange={e => setForm(p => ({ ...p, emergencyContactName: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      className="w-full rounded border border-stroke bg-white py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                      placeholder="+92 300 7654321"
                      value={form.emergencyContactPhone}
                      onChange={e => setForm(p => ({ ...p, emergencyContactPhone: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4.5 pt-4">
                  <button
                    className="flex justify-center rounded bg-primary py-2 px-6 font-medium text-gray hover:bg-opacity-90 disabled:opacity-50"
                    type="submit"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Update Details'}
                  </button>
                </div>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
