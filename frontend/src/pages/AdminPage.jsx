import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import './AdminPage.css'

export default function AdminPage() {
  const { authFetch, user: me } = useAuth()
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    const res = await authFetch('/users/')
    if (res.ok) setUsers(await res.json())
    else setError('Failed to load users')
  }

  async function toggleActive(id) {
    await authFetch(`/users/${id}/activate`, { method: 'PATCH' })
    fetchUsers()
  }

  async function toggleRole(id) {
    await authFetch(`/users/${id}/role`, { method: 'PATCH' })
    fetchUsers()
  }

  async function deleteUser(id, username) {
    if (!window.confirm(`Delete user "${username}" and all their data?`)) return
    await authFetch(`/users/${id}`, { method: 'DELETE' })
    fetchUsers()
  }

  return (
    <div className="admin-page">
      <h2>User Administration</h2>
      {error && <p className="admin-error">{error}</p>}
      <div className="user-table-wrap">
        <table className="user-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className={!u.is_active ? 'inactive-row' : ''}>
                <td>
                  {u.username}
                  {u.id === me?.id && <span className="you-badge">you</span>}
                </td>
                <td className="email-cell">{u.email}</td>
                <td>
                  <span className={`badge ${u.is_admin ? 'badge-admin' : 'badge-user'}`}>
                    {u.is_admin ? 'Admin' : 'User'}
                  </span>
                </td>
                <td>
                  <span className={`badge ${u.is_active ? 'badge-active' : 'badge-inactive'}`}>
                    {u.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="date-cell">{u.created_at?.slice(0, 10)}</td>
                <td className="actions-cell">
                  <button
                    className="act-btn"
                    onClick={() => toggleActive(u.id)}
                    disabled={u.id === me?.id}
                    title={u.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {u.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    className="act-btn"
                    onClick={() => toggleRole(u.id)}
                    disabled={u.id === me?.id}
                    title={u.is_admin ? 'Remove admin' : 'Make admin'}
                  >
                    {u.is_admin ? '↓ User' : '↑ Admin'}
                  </button>
                  <button
                    className="act-btn danger"
                    onClick={() => deleteUser(u.id, u.username)}
                    disabled={u.id === me?.id}
                    title="Delete user"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
