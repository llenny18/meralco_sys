import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export default function AdminUserAccess() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userFormData, setUserFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    role: '',
    is_active: true,
    password: ''
  });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/`);
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data.results || data || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/user-roles/`);
      if (!response.ok) throw new Error('Failed to fetch roles');
      const data = await response.json();
      setRoles(data.results || data || []);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/permissions/`);
      if (!response.ok) throw new Error('Failed to fetch permissions');
      const data = await response.json();
      setPermissions(data.results || data || []);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const resetForm = () => {
    setUserFormData({
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      phone_number: '',
      role: '',
      is_active: true,
      password: ''
    });
  };

  const openCreateModal = () => {
    setIsEditMode(false);
    setSelectedUser(null);
    resetForm();
    setShowUserModal(true);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setIsEditMode(true);
    setUserFormData({
      username: user.username,
      email: user.email || '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      phone_number: user.phone_number || '',
      role: user.role || '',
      is_active: user.is_active,
      password: '' // Leave empty - only fill if changing password
    });
    setShowUserModal(true);
  };

  const handleCreateUser = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userFormData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }

      alert('✅ User created successfully!');
      setShowUserModal(false);
      setIsEditMode(false);
      fetchUsers();
      resetForm();
    } catch (err) {
      alert('❌ Error creating user: ' + err.message);
    }
  };

  const handleUpdateUser = async () => {
    try {
      // Only send fields that should be updated - exclude read-only fields
      const updateData = {
        email: userFormData.email,
        first_name: userFormData.first_name,
        last_name: userFormData.last_name,
        phone_number: userFormData.phone_number,
        role: userFormData.role,
        is_active: userFormData.is_active
      };
      
      // Only include password if it's been filled in (to change it)
      if (userFormData.password && userFormData.password.trim() !== '') {
        updateData.password = userFormData.password;
      }

      const response = await fetch(`${API_BASE_URL}/users/${selectedUser.user_id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }

      alert('✅ User updated successfully!');
      setShowUserModal(false);
      setIsEditMode(false);
      setSelectedUser(null);
      fetchUsers();
      resetForm();
    } catch (err) {
      alert('❌ Error updating user: ' + err.message);
    }
  };

  const handleSaveUser = () => {
    if (isEditMode) {
      handleUpdateUser();
    } else {
      handleCreateUser();
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} this user?`)) {
      return;
    }

    try {
      if (!currentStatus) {
        // Activating user - use PATCH
        const response = await fetch(`${API_BASE_URL}/users/${userId}/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_active: true })
        });

        if (!response.ok) throw new Error('Failed to activate user');
      } else {
        // Deactivating user - use the custom deactivate endpoint
        const response = await fetch(`${API_BASE_URL}/users/${userId}/deactivate/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error('Failed to deactivate user');
      }
      
      alert(`✅ User ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      fetchUsers();
    } catch (err) {
      alert('❌ Error: ' + err.message);
    }
  };

  const getRoleBadge = (roleName) => {
    const roleColors = {
      'Vendor': '#2196f3',
      'QI': '#4caf50',
      'Clerk': '#ff9800',
      'Engineering Aide': '#9c27b0',
      'Supervisor': '#f44336',
      'Team Leader': '#00bcd4',
      'Sector Manager': '#3f51b5',
      'Admin': '#e91e63'
    };
    
    const color = roleColors[roleName] || '#999';
    
    return (
      <span style={{
        background: color,
        color: 'white',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 'bold'
      }}>
        {roleName}
      </span>
    );
  };

  const getStatusBadge = (isActive) => {
    return (
      <span style={{
        background: isActive ? '#4caf50' : '#f44336',
        color: 'white',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: 'bold',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white' }}></span>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  return (
    <div style={{ minHeight: '100vh', padding: '20px', background: '#f5f7fa' }}>
      {/* Header */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '28px', marginBottom: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', color: '#1a1a2e', fontWeight: '700' }}>
              User Access Management
            </h1>
            <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>
              Ensure user access → Validate project parameters → Monitor system security
            </p>
          </div>
          <button
            onClick={openCreateModal}
            style={{
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              padding: '14px 28px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            ➕ Create User
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Users', value: users.length, color: '#2196f3', icon: '👥' },
          { label: 'Active Users', value: users.filter(u => u.is_active).length, color: '#4caf50', icon: '✓' },
          { label: 'Total Roles', value: roles.length, color: '#ff9800', icon: '🎭' },
          { label: 'Permissions', value: permissions.length, color: '#9c27b0', icon: '🔑' }
        ].map((stat, idx) => (
          <div key={idx} style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            borderLeft: `4px solid ${stat.color}`
          }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{stat.icon}</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: stat.color, marginBottom: '4px' }}>{stat.value}</div>
            <div style={{ fontSize: '13px', color: '#666', fontWeight: '500' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 6px 24px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#1a1a2e', fontWeight: '700' }}>
          User Directory
        </h2>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', color: '#999', textTransform: 'uppercase' }}>User</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', color: '#999', textTransform: 'uppercase' }}>Email</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', color: '#999', textTransform: 'uppercase' }}>Role</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', color: '#999', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', color: '#999', textTransform: 'uppercase' }}>Last Login</th>
                <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold', color: '#999', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.user_id} style={{ 
                  borderBottom: '1px solid #f0f0f0',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#f8f9fa'}
                onMouseOut={(e) => e.currentTarget.style.background = 'white'}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'linear-gradient(45deg, #667eea, #764ba2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '16px'
                      }}>
                        {user.first_name?.charAt(0) || user.username?.charAt(0) || '?'}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: '#1a1a2e', fontSize: '14px' }}>
                          {user.first_name} {user.last_name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#999' }}>@{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#555' }}>
                    {user.email || 'N/A'}
                  </td>
                  <td style={{ padding: '16px' }}>
                    {getRoleBadge(user.role_name || 'No Role')}
                  </td>
                  <td style={{ padding: '16px' }}>
                    {getStatusBadge(user.is_active)}
                  </td>
                  <td style={{ padding: '16px', fontSize: '13px', color: '#666' }}>
                    {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleToggleUserStatus(user.user_id, user.is_active)}
                        style={{
                          background: user.is_active ? '#f44336' : '#4caf50',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          transition: 'opacity 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
                        onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                      >
                        {user.is_active ? '🚫 Deactivate' : '✓ Activate'}
                      </button>
                      <button
                        onClick={() => openEditModal(user)}
                        style={{
                          background: '#2196f3',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          transition: 'opacity 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
                        onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                      >
                        ✏️ Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit User Modal */}
      {showUserModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px',
          overflow: 'auto'
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowUserModal(false);
            setIsEditMode(false);
            setSelectedUser(null);
          }
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '28px', color: '#1a1a2e', fontWeight: '700' }}>
              {isEditMode ? '✏️ Edit User' : '➕ Create New User'}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 'bold', color: '#555' }}>
                  Username *
                </label>
                <input
                  type="text"
                  value={userFormData.username}
                  onChange={(e) => setUserFormData({...userFormData, username: e.target.value})}
                  placeholder="username"
                  disabled={isEditMode}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    borderRadius: '8px', 
                    border: '2px solid #e0e0e0', 
                    fontSize: '14px',
                    background: isEditMode ? '#f5f5f5' : 'white',
                    cursor: isEditMode ? 'not-allowed' : 'text'
                  }}
                />
                {isEditMode && (
                  <small style={{ color: '#999', fontSize: '11px' }}>Username cannot be changed</small>
                )}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 'bold', color: '#555' }}>
                  First Name *
                </label>
                <input
                  type="text"
                  value={userFormData.first_name}
                  onChange={(e) => setUserFormData({...userFormData, first_name: e.target.value})}
                  placeholder="First Name"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e0e0e0', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 'bold', color: '#555' }}>
                  Last Name *
                </label>
                <input
                  type="text"
                  value={userFormData.last_name}
                  onChange={(e) => setUserFormData({...userFormData, last_name: e.target.value})}
                  placeholder="Last Name"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e0e0e0', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 'bold', color: '#555' }}>
                  Email *
                </label>
                <input
                  type="email"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({...userFormData, email: e.target.value})}
                  placeholder="email@example.com"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e0e0e0', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 'bold', color: '#555' }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={userFormData.phone_number}
                  onChange={(e) => setUserFormData({...userFormData, phone_number: e.target.value})}
                  placeholder="+63 XXX XXX XXXX"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e0e0e0', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 'bold', color: '#555' }}>
                  Role *
                </label>
                <select
                  value={userFormData.role}
                  onChange={(e) => setUserFormData({...userFormData, role: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e0e0e0', fontSize: '14px' }}
                >
                  <option value="">Select Role</option>
                  {roles.map((role) => (
                    <option key={role.role_id} value={role.role_id}>
                      {role.role_name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 'bold', color: '#555' }}>
                  Password {isEditMode ? '(Leave empty to keep current)' : '*'}
                </label>
                <input
                  type="password"
                  value={userFormData.password}
                  onChange={(e) => setUserFormData({...userFormData, password: e.target.value})}
                  placeholder={isEditMode ? "Leave empty to keep current password" : "••••••••"}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e0e0e0', fontSize: '14px' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={userFormData.is_active}
                    onChange={(e) => setUserFormData({...userFormData, is_active: e.target.checked})}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#555' }}>
                    Account is active
                  </span>
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setIsEditMode(false);
                  setSelectedUser(null);
                  resetForm();
                }}
                style={{
                  flex: 1,
                  background: '#fff',
                  color: '#666',
                  border: '2px solid #e0e0e0',
                  padding: '14px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '15px',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#f5f5f5';
                  e.currentTarget.style.borderColor = '#999';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#fff';
                  e.currentTarget.style.borderColor = '#e0e0e0';
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUser}
                style={{
                  flex: 1,
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  color: 'white',
                  border: 'none',
                  padding: '14px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '15px',
                  transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {isEditMode ? 'Update User' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'white',
          padding: '32px',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          zIndex: 2000
        }}>
          <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Loading...</p>
        </div>
      )}
    </div>
  );
}