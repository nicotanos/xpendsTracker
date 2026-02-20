import './ExpenseDashboard.css'

function getMonthLabel(date) {
  return date.toLocaleString('default', { month: 'long', year: 'numeric' })
}

export default function ExpenseDashboard({ expenses, categories = [] }) {
  const now = new Date()
  const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const thisMonth = expenses.filter((e) => e.date.slice(0, 7) === currentYM)
  const thisMonthTotal = thisMonth.reduce((s, e) => s + e.amount, 0)
  const allTotal = expenses.reduce((s, e) => s + e.amount, 0)
  const avg = expenses.length ? allTotal / expenses.length : 0
  const largest = expenses.length ? Math.max(...expenses.map((e) => e.amount)) : 0

  // Category breakdown (all time)
  const colorMap = Object.fromEntries(categories.map((c) => [c.name, c.color]))
  const catTotals = {}
  for (const e of expenses) {
    catTotals[e.category] = (catTotals[e.category] || 0) + e.amount
  }
  const catRows = Object.entries(catTotals)
    .map(([name, total]) => ({ name, total, color: colorMap[name] || '#888' }))
    .sort((a, b) => b.total - a.total)
  const catMax = catRows[0]?.total || 1

  // Recipient breakdown (all time)
  const recTotals = {}
  for (const e of expenses) {
    const name = e.recipient?.name || 'Unknown'
    recTotals[name] = (recTotals[name] || 0) + e.amount
  }
  const recRows = Object.entries(recTotals)
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6)
  const recMax = recRows[0]?.total || 1

  return (
    <div className="dashboard">
      {/* KPI cards */}
      <div className="dash-kpis">
        <div className="dash-kpi dark">
          <span className="kpi-label">{getMonthLabel(now)}</span>
          <span className="kpi-value">${thisMonthTotal.toFixed(2)}</span>
          <span className="kpi-sub">{thisMonth.length} expense{thisMonth.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="dash-kpi">
          <span className="kpi-label">All Time</span>
          <span className="kpi-value">${allTotal.toFixed(2)}</span>
          <span className="kpi-sub">{expenses.length} total</span>
        </div>
        <div className="dash-kpi">
          <span className="kpi-label">Average</span>
          <span className="kpi-value">${avg.toFixed(2)}</span>
          <span className="kpi-sub">per expense</span>
        </div>
        <div className="dash-kpi">
          <span className="kpi-label">Largest</span>
          <span className="kpi-value">${largest.toFixed(2)}</span>
          <span className="kpi-sub">single expense</span>
        </div>
      </div>

      {expenses.length > 0 && (
        <div className="dash-charts">
          {/* By category */}
          {catRows.length > 0 && (
            <div className="dash-chart">
              <h3>By Category</h3>
              <ul className="bar-list">
                {catRows.map((c) => (
                  <li key={c.name} className="bar-row">
                    <span className="bar-label">{c.name}</span>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{
                          width: `${(c.total / catMax) * 100}%`,
                          background: c.color,
                        }}
                      />
                    </div>
                    <span className="bar-amount">${c.total.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* By recipient */}
          {recRows.length > 0 && (
            <div className="dash-chart">
              <h3>By Recipient</h3>
              <ul className="bar-list">
                {recRows.map((r) => (
                  <li key={r.name} className="bar-row">
                    <span className="bar-label">{r.name}</span>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{ width: `${(r.total / recMax) * 100}%`, background: '#333' }}
                      />
                    </div>
                    <span className="bar-amount">${r.total.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
