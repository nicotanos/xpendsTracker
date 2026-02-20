import { useState } from 'react'
import './PersonManager.css'

const PERSON_TYPES = ['Individual', 'Company', 'Government']
const emptyForm = { name: '', type: 'Individual', rut: '' }

export default function PersonManager({ persons, authFetch, onPersonsChange }) {
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (editingId) {
      await authFetch(`/persons/${editingId}`, {
        method: 'PUT',
        body: JSON.stringify(form),
      })
      setEditingId(null)
    } else {
      await authFetch('/persons', {
        method: 'POST',
        body: JSON.stringify(form),
      })
    }
    setForm(emptyForm)
    onPersonsChange()
  }

  function startEdit(person) {
    setEditingId(person.id)
    setForm({ name: person.name, type: person.type, rut: person.rut })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm)
  }

  async function handleDelete(id) {
    await authFetch(`/persons/${id}`, { method: 'DELETE' })
    onPersonsChange()
  }

  return (
    <div className="person-manager">
      <h2>Persons</h2>

      <form className="person-form" onSubmit={handleSubmit}>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Full name"
          required
        />
        <select name="type" value={form.type} onChange={handleChange}>
          {PERSON_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <input
          name="rut"
          value={form.rut}
          onChange={handleChange}
          placeholder="RUT (e.g. 12.345.678-9)"
          required
        />
        <button type="submit" className="btn-primary">
          {editingId ? 'Update' : 'Add'}
        </button>
        {editingId && (
          <button type="button" className="btn-secondary" onClick={cancelEdit}>
            Cancel
          </button>
        )}
      </form>

      <ul className="person-list">
        {persons.length === 0 && (
          <li className="person-empty">No persons yet. Add one above.</li>
        )}
        {persons.map((p) => (
          <li key={p.id} className="person-item">
            <div className="person-info">
              <span className="person-name">{p.name}</span>
              <span className="person-meta">
                <span className="person-type-badge">{p.type}</span>
                {p.rut}
              </span>
            </div>
            <div className="person-actions">
              <button onClick={() => startEdit(p)} title="Edit">✏️</button>
              <button onClick={() => handleDelete(p.id)} title="Delete">🗑️</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
