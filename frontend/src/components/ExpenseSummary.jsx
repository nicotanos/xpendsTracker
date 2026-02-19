import './ExpenseSummary.css'

const CATEGORIES = ['Food', 'Transport', 'Housing', 'Health', 'Entertainment', 'Other']

export default function ExpenseSummary({ expenses }) {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0)

  const byCategory = CATEGORIES.map((cat) => ({
    category: cat,
    total: expenses
      .filter((e) => e.category === cat)
      .reduce((sum, e) => sum + e.amount, 0),
  })).filter((c) => c.total > 0)

  return (
    <div className="summary">
      <div className="summary-total">
        <span>Total Spent</span>
        <strong>${total.toFixed(2)}</strong>
      </div>
      {byCategory.length > 0 && (
        <ul className="summary-breakdown">
          {byCategory.map((c) => (
            <li key={c.category}>
              <span>{c.category}</span>
              <span>${c.total.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
