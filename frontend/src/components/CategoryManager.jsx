import { useState } from 'react'
import './CategoryManager.css'

const emptyForm = { name: '', color: '#6366f1' }

export default function CategoryManager({ categories, authFetch, onCategoriesChange }) {
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (editingId) {
      await authFetch(`/categories/${editingId}`, {
        method: 'PUT',
        body: JSON.stringify(form),
      })
      setEditingId(null)
    } else {
      await authFetch('/categories', {
        method: 'POST',
        body: JSON.stringify(form),
      })
    }
    setForm(emptyForm)
    onCategoriesChange()
  }

  function startEdit(cat) {
    setEditingId(cat.id)
    setForm({ name: cat.name, color: cat.color })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm)
  }

  async function handleDelete(id) {
    await authFetch(`/categories/${id}`, { method: 'DELETE' })
    onCategoriesChange()
  }

  return (
    <div className="category-manager">
      <h2>Categories</h2>

      <form className="category-form" onSubmit={handleSubmit}>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Category name"
          required
        />
        <input
          name="color"
          type="color"
          value={form.color}
          onChange={handleChange}
          title="Pick a color"
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

      <ul className="category-list">
        {categories.length === 0 && (
          <li className="category-empty">No categories yet. Add one above.</li>
        )}
        {categories.map((cat) => (
          <li key={cat.id} className="category-item">
            <span className="category-swatch" style={{ background: cat.color }} />
            <span className="category-name">{cat.name}</span>
            <div className="category-actions">
              <button onClick={() => startEdit(cat)} title="Edit">✏️</button>
              <button onClick={() => handleDelete(cat.id)} title="Delete">🗑️</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
