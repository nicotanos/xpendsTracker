import { useState, useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import NavBar from './components/NavBar'
import ExpenseForm from './components/ExpenseForm'
import ExpenseList from './components/ExpenseList'
import ExpenseSummary from './components/ExpenseSummary'
import CategoryManager from './components/CategoryManager'
import PersonManager from './components/PersonManager'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AdminPage from './pages/AdminPage'
import ProfilePage from './pages/ProfilePage'
import './App.css'

export default function App() {
  const { user, loading, authFetch } = useAuth()
  const [view, setView] = useState('app')           // 'app' | 'admin' | 'categories' | 'persons' | 'profile'
  const [authView, setAuthView] = useState('login') // 'login' | 'register'
  const [expenses, setExpenses] = useState([])
  const [categories, setCategories] = useState([])
  const [persons, setPersons] = useState([])
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    if (user) {
      fetchExpenses()
      fetchCategories()
      fetchPersons()
    }
  }, [user])

  async function fetchExpenses() {
    const res = await authFetch('/expenses')
    if (res.ok) setExpenses(await res.json())
  }

  async function fetchCategories() {
    const res = await authFetch('/categories')
    if (res.ok) setCategories(await res.json())
  }

  async function fetchPersons() {
    const res = await authFetch('/persons')
    if (res.ok) setPersons(await res.json())
  }

  async function handleSave(expense) {
    if (editing) {
      await authFetch(`/expenses/${editing.id}`, {
        method: 'PUT',
        body: JSON.stringify(expense),
      })
      setEditing(null)
    } else {
      await authFetch('/expenses', {
        method: 'POST',
        body: JSON.stringify(expense),
      })
    }
    fetchExpenses()
  }

  async function handleDelete(id) {
    await authFetch(`/expenses/${id}`, { method: 'DELETE' })
    fetchExpenses()
  }

  if (loading) return null

  if (!user) {
    return authView === 'login'
      ? <LoginPage onSwitch={() => setAuthView('register')} />
      : <RegisterPage onSwitch={() => setAuthView('login')} />
  }

  return (
    <div className="app">
      <NavBar view={view} setView={setView} />

      {view === 'profile' ? (
        <ProfilePage />
      ) : view === 'admin' ? (
        <AdminPage />
      ) : view === 'categories' ? (
        <CategoryManager
          categories={categories}
          authFetch={authFetch}
          onCategoriesChange={fetchCategories}
        />
      ) : view === 'persons' ? (
        <PersonManager
          persons={persons}
          authFetch={authFetch}
          onPersonsChange={fetchPersons}
        />
      ) : (
        <main className="app-main">
          <div className="left-panel">
            <ExpenseSummary expenses={expenses} />
            <ExpenseForm
              onSave={handleSave}
              editing={editing}
              onCancel={() => setEditing(null)}
              categories={categories}
              persons={persons}
            />
          </div>
          <div className="right-panel">
            <ExpenseList
              expenses={expenses}
              onEdit={setEditing}
              onDelete={handleDelete}
              categories={categories}
            />
          </div>
        </main>
      )}
    </div>
  )
}
