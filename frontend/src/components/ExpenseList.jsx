import './ExpenseList.css'

const CATEGORY_COLORS = {
  Food: '#f59e0b',
  Transport: '#3b82f6',
  Housing: '#8b5cf6',
  Health: '#10b981',
  Entertainment: '#ef4444',
  Other: '#6b7280',
}

export default function ExpenseList({ expenses, onEdit, onDelete }) {
  if (expenses.length === 0) {
    return (
      <div className="expense-list empty">
        <p>No expenses yet. Add one to get started!</p>
      </div>
    )
  }

  return (
    <div className="expense-list">
      <h2>Expenses</h2>
      <ul>
        {expenses.map((e) => (
          <li key={e.id} className="expense-item">
            <span
              className="category-dot"
              style={{ background: CATEGORY_COLORS[e.category] || '#6b7280' }}
            />
            <div className="expense-info">
              <span className="expense-title">{e.title}</span>
              <span className="expense-meta">
                {e.category} &middot; {e.date}
                {e.note && ` · ${e.note}`}
              </span>
            </div>
            <span className="expense-amount">${e.amount.toFixed(2)}</span>
            <div className="expense-actions">
              <button onClick={() => onEdit(e)} title="Edit">✏️</button>
              <button onClick={() => onDelete(e.id)} title="Delete">🗑️</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
