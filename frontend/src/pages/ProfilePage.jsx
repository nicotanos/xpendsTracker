import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import './ProfilePage.css'

const PERSON_TYPES = ['Individual', 'Company', 'Government']
const RELATION_TYPES = ['Self', 'Spouse', 'Child', 'Parent', 'Sibling', 'Other']

const emptyProfileForm = { name: '', type: 'Individual', rut: '' }
const emptyPersonForm = { name: '', type: 'Individual', rut: '', relation: 'Self' }

export default function ProfilePage({ onPersonsChange }) {
  const { authFetch, user: me } = useAuth()

  // Profile (self person)
  const [profile, setProfile] = useState(null)
  const [profileForm, setProfileForm] = useState(emptyProfileForm)
  const [profileSaved, setProfileSaved] = useState(false)
  const [profileError, setProfileError] = useState('')

  // My People list
  const [persons, setPersons] = useState([])
  const [personForm, setPersonForm] = useState(emptyPersonForm)
  const [editingPersonId, setEditingPersonId] = useState(null)

  useEffect(() => {
    fetchProfile()
    fetchPersons()
  }, [])

  async function fetchProfile() {
    const res = await authFetch('/users/me')
    if (res.ok) {
      const data = await res.json()
      setProfile(data)
      if (data.profile_person) {
        setProfileForm({
          name: data.profile_person.name,
          type: data.profile_person.type,
          rut: data.profile_person.rut,
        })
      }
    }
  }

  async function fetchPersons() {
    const res = await authFetch('/persons')
    if (res.ok) setPersons(await res.json())
  }

  async function refreshPersons() {
    await fetchPersons()
    onPersonsChange?.()
  }

  // ── Profile form ──────────────────────────────────────
  function handleProfileChange(e) {
    setProfileForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleProfileSubmit(e) {
    e.preventDefault()
    setProfileError('')
    setProfileSaved(false)
    const res = await authFetch('/users/me/profile', {
      method: 'PUT',
      body: JSON.stringify(profileForm),
    })
    if (res.ok) {
      const data = await res.json()
      setProfile(data)
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 2500)
    } else {
      setProfileError('Failed to save profile.')
    }
  }

  // ── My People CRUD ────────────────────────────────────
  function handlePersonChange(e) {
    setPersonForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handlePersonSubmit(e) {
    e.preventDefault()
    if (editingPersonId) {
      await authFetch(`/persons/${editingPersonId}`, {
        method: 'PUT',
        body: JSON.stringify(personForm),
      })
      setEditingPersonId(null)
    } else {
      await authFetch('/persons', {
        method: 'POST',
        body: JSON.stringify(personForm),
      })
    }
    setPersonForm(emptyPersonForm)
    refreshPersons()
  }

  function startEditPerson(p) {
    setEditingPersonId(p.id)
    setPersonForm({ name: p.name, type: p.type, rut: p.rut, relation: p.relation || 'Self' })
  }

  function cancelEditPerson() {
    setEditingPersonId(null)
    setPersonForm(emptyPersonForm)
  }

  async function handleDeletePerson(id) {
    await authFetch(`/persons/${id}`, { method: 'DELETE' })
    refreshPersons()
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <h2>My Profile</h2>

        {/* Account info */}
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

        {/* Personal info */}
        <h3>Personal Info</h3>
        <p className="profile-hint">
          This information identifies you as a person in expenses.
        </p>

        <form className="profile-form" onSubmit={handleProfileSubmit}>
          <label>
            Full Name
            <input
              name="name"
              value={profileForm.name}
              onChange={handleProfileChange}
              placeholder="e.g. John Doe"
              required
            />
          </label>
          <label>
            Type
            <select name="type" value={profileForm.type} onChange={handleProfileChange} required>
              {PERSON_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>
          <label>
            RUT
            <input
              name="rut"
              value={profileForm.rut}
              onChange={handleProfileChange}
              placeholder="e.g. 12.345.678-9"
              required
            />
          </label>
          <div className="profile-form-footer">
            <button type="submit" className="btn-primary">Save</button>
            {profileSaved && <span className="profile-saved">Saved!</span>}
            {profileError && <span className="profile-error">{profileError}</span>}
          </div>
        </form>

        <hr className="profile-divider" />

        {/* My People */}
        <h3>My People</h3>
        <p className="profile-hint">
          People you track expenses for — family members, companies, or others.
        </p>

        <form className="people-form" onSubmit={handlePersonSubmit}>
          <input
            name="name"
            value={personForm.name}
            onChange={handlePersonChange}
            placeholder="Full name"
            required
          />
          <select name="type" value={personForm.type} onChange={handlePersonChange}>
            {PERSON_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <input
            name="rut"
            value={personForm.rut}
            onChange={handlePersonChange}
            placeholder="RUT"
            required
          />
          <select name="relation" value={personForm.relation} onChange={handlePersonChange}>
            {RELATION_TYPES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <button type="submit" className="btn-primary">
            {editingPersonId ? 'Update' : 'Add'}
          </button>
          {editingPersonId && (
            <button type="button" className="btn-secondary" onClick={cancelEditPerson}>
              Cancel
            </button>
          )}
        </form>

        <ul className="people-list">
          {persons.length === 0 && (
            <li className="people-empty">No people yet. Add someone above.</li>
          )}
          {persons.map((p) => (
            <li key={p.id} className="people-item">
              <div className="people-info">
                <span className="people-name">{p.name}</span>
                <span className="people-meta">
                  <span className="people-badge">{p.type}</span>
                  {p.relation && <span className="people-badge relation">{p.relation}</span>}
                  <span className="people-rut">{p.rut}</span>
                </span>
              </div>
              <div className="people-actions">
                <button onClick={() => startEditPerson(p)} title="Edit">✏️</button>
                <button onClick={() => handleDeletePerson(p.id)} title="Delete">🗑️</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
