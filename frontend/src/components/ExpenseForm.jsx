import { useState, useEffect } from 'react'
import './ExpenseForm.css'

const PERSON_TYPES = ['Individual', 'Company', 'Government']
const emptyNewProvider = { name: '', type: 'Individual', rut: '' }

const empty = (firstCategory = '', firstProviderId = '', firstRecipientId = '') => ({
  title: '',
  amount: '',
  category: firstCategory,
  date: new Date().toISOString().split('T')[0],
  note: '',
  provider_id: firstProviderId,
  recipient_id: firstRecipientId,
})

export default function ExpenseForm({
  onSave,
  editing,
  onCancel,
  categories = [],
  persons = [],
  authFetch,
  onPersonsChange,
}) {
  const associated = persons.filter((p) => p.relation)
  const [form, setForm] = useState(empty())
  const [showNewProvider, setShowNewProvider] = useState(false)
  const [newProvider, setNewProvider] = useState(emptyNewProvider)

  useEffect(() => {
    if (editing) {
      setForm({ ...editing, amount: String(editing.amount) })
    } else {
      setForm(empty(
        categories[0]?.name ?? '',
        persons[0]?.id ?? '',
        associated[0]?.id ?? persons[0]?.id ?? '',
      ))
    }
  }, [editing, categories, persons])

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleNewProviderChange(e) {
    setNewProvider((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleAddProvider(e) {
    e.preventDefault()
    const res = await authFetch('/persons', {
      method: 'POST',
      body: JSON.stringify(newProvider),
    })
    if (res.ok) {
      const person = await res.json()
      onPersonsChange?.()
      setForm((prev) => ({ ...prev, provider_id: person.id }))
      setShowNewProvider(false)
      setNewProvider(emptyNewProvider)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSave({
      ...form,
      amount: parseFloat(form.amount),
      provider_id: parseInt(form.provider_id),
      recipient_id: parseInt(form.recipient_id),
    })
    setForm(empty())
  }

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      <h2>{editing ? 'Edit Expense' : 'Add Expense'}</h2>

      <label>
        Title
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="e.g. Groceries"
          required
        />
      </label>

      <label>
        Amount ($)
        <input
          name="amount"
          type="number"
          min="0.01"
          step="0.01"
          value={form.amount}
          onChange={handleChange}
          placeholder="0.00"
          required
        />
      </label>

      <label>
        Category
        <select name="category" value={form.category} onChange={handleChange} required>
          {categories.length === 0 && <option value="">No categories yet</option>}
          {categories.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
      </label>

      <label>
        Provider
        <div className="field-row">
          <select name="provider_id" value={form.provider_id} onChange={handleChange} required>
            {persons.length === 0 && <option value="">No persons yet</option>}
            {persons.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
            ))}
          </select>
          <button
            type="button"
            className="btn-add-inline"
            onClick={() => setShowNewProvider((v) => !v)}
            title="Add new provider"
          >
            {showNewProvider ? '✕' : '+ New'}
          </button>
        </div>
      </label>

      {showNewProvider && (
        <div className="inline-person-form">
          <input
            name="name"
            value={newProvider.name}
            onChange={handleNewProviderChange}
            placeholder="Full name"
            required
          />
          <select name="type" value={newProvider.type} onChange={handleNewProviderChange}>
            {PERSON_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <input
            name="rut"
            value={newProvider.rut}
            onChange={handleNewProviderChange}
            placeholder="RUT"
          />
          <button type="button" className="btn-primary inline-save" onClick={handleAddProvider}>
            Add
          </button>
        </div>
      )}

      <label>
        Recipient
        <select name="recipient_id" value={form.recipient_id} onChange={handleChange} required>
          {associated.length === 0 && <option value="">No associations yet — add them in your Profile</option>}
          {associated.map((p) => (
            <option key={p.id} value={p.id}>{p.name} ({p.relation})</option>
          ))}
        </select>
      </label>

      <label>
        Date
        <input
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Note (optional)
        <input
          name="note"
          value={form.note}
          onChange={handleChange}
          placeholder="Any extra details"
        />
      </label>

      <div className="form-actions">
        <button type="submit" className="btn-primary">
          {editing ? 'Update' : 'Add Expense'}
        </button>
        {editing && (
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
