import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import './ProfilePage.css'

const PERSON_TYPES = ['Individual', 'Company', 'Government']

const emptyForm = { name: '', type: 'Individual', rut: '' }

export default function ProfilePage() {
  const { authFetch, user: me } = useAuth()
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProfile()
  }, [])

  async function fetchProfile() {
    const res = await authFetch('/users/me')
    if (res.ok) {
      const data = await res.json()
      setProfile(data)
      if (data.profile_person) {
        setForm({
          name: data.profile_person.name,
          type: data.profile_person.type,
          rut: data.profile_person.rut,
        })
      }
    }
  }

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaved(false)
    const res = await authFetch('/users/me/profile', {
      method: 'PUT',
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const data = await res.json()
      setProfile(data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } else {
      setError('Failed to save profile.')
    }
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <h2>My Profile</h2>

        <div className="profile-account">
          <div className="profile-field">
            <span className="profile-label">Username</span>
            <span className="profile-value">{me?.username}</span>
          </div>
          <div className="profile-field">
            <span className="profile-label">Email</span>
            <span className="profile-value">{me?.email}</span>
          </div>
          <div className="profile-field">
            <span className="profile-label">Role</span>
            <span className="profile-value">{me?.is_admin ? 'Admin' : 'User'}</span>
          </div>
        </div>

        <hr className="profile-divider" />

        <h3>Personal Info</h3>
        <p className="profile-hint">
          This information identifies you as a person in expenses.
        </p>

        <form className="profile-form" onSubmit={handleSubmit}>
          <label>
            Full Name
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              required
            />
          </label>

          <label>
            Type
            <select name="type" value={form.type} onChange={handleChange} required>
              {PERSON_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>

          <label>
            RUT
            <input
              name="rut"
              value={form.rut}
              onChange={handleChange}
              placeholder="e.g. 12.345.678-9"
              required
            />
          </label>

          <div className="profile-form-footer">
            <button type="submit" className="btn-primary">Save</button>
            {saved && <span className="profile-saved">Saved!</span>}
            {error && <span className="profile-error">{error}</span>}
          </div>
        </form>
      </div>
    </div>
  )
}
