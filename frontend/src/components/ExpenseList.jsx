import './ExpenseList.css'

export default function ExpenseList({ expenses, onEdit, onDelete, categories = [] }) {
  const colorMap = Object.fromEntries(categories.map((c) => [c.name, c.color]))
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
              style={{ background: colorMap[e.category] || '#6b7280' }}
            />
            <div className="expense-info">
              <span className="expense-title">{e.title}</span>
              <span className="expense-meta">
                {e.category} &middot; {e.provider?.name} &rarr; {e.recipient?.name} &middot; {e.date}
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
