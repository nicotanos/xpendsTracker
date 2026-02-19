import { useState, useEffect } from 'react'
import './ExpenseForm.css'

const CATEGORIES = ['Food', 'Transport', 'Housing', 'Health', 'Entertainment', 'Other']

const empty = {
  title: '',
  amount: '',
  category: 'Food',
  date: new Date().toISOString().split('T')[0],
  note: '',
}

export default function ExpenseForm({ onSave, editing, onCancel }) {
  const [form, setForm] = useState(empty)

  useEffect(() => {
    if (editing) {
      setForm({ ...editing, amount: String(editing.amount) })
    } else {
      setForm(empty)
    }
  }, [editing])

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSave({ ...form, amount: parseFloat(form.amount) })
    setForm(empty)
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
        <select name="category" value={form.category} onChange={handleChange}>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
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
