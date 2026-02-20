import { useState, useEffect } from 'react'
import './ExpenseForm.css'

const empty = (firstCategory = '', firstPersonId = '') => ({
  title: '',
  amount: '',
  category: firstCategory,
  date: new Date().toISOString().split('T')[0],
  note: '',
  provider_id: firstPersonId,
  recipient_id: firstPersonId,
})

export default function ExpenseForm({ onSave, editing, onCancel, categories = [], persons = [] }) {
  const [form, setForm] = useState(empty())

  useEffect(() => {
    if (editing) {
      setForm({ ...editing, amount: String(editing.amount) })
    } else {
      setForm(empty(categories[0]?.name ?? '', persons[0]?.id ?? ''))
    }
  }, [editing, categories, persons])

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
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
        <select name="provider_id" value={form.provider_id} onChange={handleChange} required>
          {persons.length === 0 && <option value="">No persons yet</option>}
          {persons.map((p) => (
            <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
          ))}
        </select>
      </label>

      <label>
        Recipient
        <select name="recipient_id" value={form.recipient_id} onChange={handleChange} required>
          {persons.length === 0 && <option value="">No persons yet</option>}
          {persons.map((p) => (
            <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
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
