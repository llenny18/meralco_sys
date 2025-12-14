import { useState, useEffect } from 'react';

// API Configuration
const API_BASE_URL = 'http://localhost:8000/api/v1';

const USER_TYPES = [
  { value: '', label: 'Select User Type' },
  { value: 'admin', label: 'Administrator' },
  { value: 'team-leader', label: 'Team Leader' },
  { value: 'sector-manager', label: 'Sector Manager' },
  { value: 'engineer', label: 'Engineer' },
  { value: 'vendor', label: 'Vendor' },
  { value: 'quality-inspector', label: 'Quality Inspector' },
  { value: 'clerk', label: 'Clerk' },
  { value: 'engineering-aide', label: 'Engineering Aide' },
  { value: 'supervisor', label: 'Supervisor' }
];

// Note: The 'value' must match the role_name in your database exactly

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<any>(null);
  const [userRoles, setUserRoles] = useState(USER_TYPES);

  useEffect(() => {
    fetchUserRoles();
  }, []);

  const fetchUserRoles = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/user-roles-list/`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user_types) {
          const roles = [
            { value: '', label: 'Select User Type' },
            ...data.user_types
          ];
          setUserRoles(roles);
        }
      }
    } catch (error) {
      console.error('Error fetching user roles:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userType) {
      setModal({
        type: 'error',
        title: 'User Type Required',
        message: 'Please select a user type before signing in.'
      });
      return;
    }

    if (!username || !password) {
      setModal({
        type: 'error',
        title: 'Missing Credentials',
        message: 'Please enter both username and password.'
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Attempting login with:', { username, userType });
      
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
          user_type: userType
        })
      });

      console.log('Response status:', response.status);
      
      // Try to parse JSON, but handle HTML error responses
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned an invalid response. Please check if Django is running correctly.');
      }

      console.log('Response data:', data);

      if (response.ok && data.success) {

        console.log("daya");
        console.log(data);
        // Store authentication data
        const roleMapping: { [key: string]: string } = {
          'Vendor Representative': 'vendor',
          'Clerk': 'clerk',
          'Engineering Aide': 'engineering-aide',
          'Quality Inspector': 'quality-inspector',
          'Engineer': 'engineer',
          'WO Supervisor': 'supervisor',
          'Team Leader': 'team-leader',
          'Sector Manager': 'sector-manager',
          'System Administrator': 'admin'
        };
        
        const normalizedRole = roleMapping[userType] || userType.toLowerCase().replace(/\s+/g, '-');
        
        // Store authentication data
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userRole', normalizedRole);
        localStorage.setItem('username', data.user.username);
        localStorage.setItem('userId', data.user.user_id);
        localStorage.setItem('name', data.user.full_name);
        localStorage.setItem('email', data.user.email);
        localStorage.setItem('isAuthenticated', 'true');

        setModal({
          type: 'success',
          title: 'Login Successful',
          message: `Welcome ${data.user.full_name || data.user.username}!`,
          subtitle: `Redirecting to your dashboard...`,
          redirectPath: data.redirect_path
        });

        setTimeout(() => {
          window.location.href = data.redirect_path;
        }, 1500);
        
      } else {
        setModal({
          type: 'error',
          title: 'Authentication Failed',
          message: data.message || 'Invalid credentials or user type mismatch.',
          subtitle: 'Please check your username, password, and user type.'
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      setModal({
        type: 'error',
        title: 'Connection Error',
        message: error instanceof Error ? error.message : 'Unable to connect to the server.',
        subtitle: 'Please ensure Django server is running on http://localhost:8000'
      });
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModal(null);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #050c27 0%, #0a1545 100%)',
      padding: '20px',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative'
    }}>
      {/* Decorative circles */}
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '15%',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(37, 150, 190, 0.1) 0%, transparent 70%)',
        filter: 'blur(40px)',
        pointerEvents: 'none'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '15%',
        left: '10%',
        width: '250px',
        height: '250px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(37, 150, 190, 0.08) 0%, transparent 70%)',
        filter: 'blur(40px)',
        pointerEvents: 'none'
      }}></div>

      <div style={{
        width: '100%',
        maxWidth: '460px',
        zIndex: 1
      }}>
        <div style={{
          background: 'rgba(15, 28, 46, 0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(37, 150, 190, 0.2)',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 100px rgba(37, 150, 190, 0.1)',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '48px 40px 40px',
            background: 'linear-gradient(135deg, rgba(37, 150, 190, 0.1) 0%, transparent 100%)',
            borderBottom: '1px solid rgba(37, 150, 190, 0.2)'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 24px',
              background: 'linear-gradient(135deg, #ffffff 0%, #ffffff 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(37, 150, 190, 0.3)'
            }}>
             <img 
              src="/icon-384x384.png" 
              alt="Icon" 
              width="40" 
              height="40"
              style={{ display: 'block' }}
            />
            </div>
            <h1 style={{
              margin: '0 0 8px 0',
              fontSize: '32px',
              fontWeight: '700',
              color: '#fff',
              textAlign: 'center',
              letterSpacing: '2px'
            }}>
              AIMS WO
            </h1>
            <p style={{
              margin: 0,
              fontSize: '13px',
              color: '#7ea8c4',
              textAlign: 'center',
              fontWeight: '500',
              letterSpacing: '2px'
            }}>
              SMART VENDOR SYSTEM
            </p>
          </div>

          {/* Content */}
          <form onSubmit={handleLogin} style={{ padding: '40px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* User Type Select */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '10px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#9fb8cc',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  User Type
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={userType}
                    onChange={(e) => setUserType(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '14px 40px 14px 16px',
                      fontSize: '15px',
                      background: 'rgba(5, 12, 39, 0.6)',
                      border: '1px solid rgba(37, 150, 190, 0.3)',
                      borderRadius: '12px',
                      color: '#fff',
                      outline: 'none',
                      transition: 'all 0.3s',
                      boxSizing: 'border-box',
                      cursor: 'pointer',
                      appearance: 'none'
                    }}
                  >
                    {userRoles.map((type) => (
                      <option key={type.value} value={type.value} style={{ background: '#050c27', color: '#fff' }}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <svg style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    width: '16px',
                    height: '16px'
                  }} fill="none" stroke="#2596be" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </div>
              </div>

              {/* Username Input */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '10px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#9fb8cc',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Enter your username"
                  autoComplete="username"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    fontSize: '15px',
                    background: 'rgba(5, 12, 39, 0.6)',
                    border: '1px solid rgba(37, 150, 190, 0.3)',
                    borderRadius: '12px',
                    color: '#fff',
                    outline: 'none',
                    transition: 'all 0.3s',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Password Input */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '10px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#9fb8cc',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    style={{
                      width: '100%',
                      padding: '14px 48px 14px 16px',
                      fontSize: '15px',
                      background: 'rgba(5, 12, 39, 0.6)',
                      border: '1px solid rgba(37, 150, 190, 0.3)',
                      borderRadius: '12px',
                      color: '#fff',
                      outline: 'none',
                      transition: 'all 0.3s',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#2596be',
                      fontSize: '20px',
                      padding: '6px',
                      borderRadius: '6px',
                      transition: 'all 0.2s'
                    }}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#fff',
                  background: loading ? 'rgba(37, 150, 190, 0.5)' : 'linear-gradient(135deg, #2596be 0%, #1a7a9f 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  marginTop: '8px',
                  boxSizing: 'border-box',
                  boxShadow: loading ? 'none' : '0 4px 16px rgba(37, 150, 190, 0.3)'
                }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span style={{ 
                      width: '16px', 
                      height: '16px', 
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite'
                    }}></span>
                    Authenticating...
                  </span>
                ) : 'Sign In'}
              </button>
            </div>

          </form>

          {/* Footer */}
          <div style={{
            padding: '20px',
            textAlign: 'center',
            background: 'rgba(5, 12, 39, 0.4)',
            borderTop: '1px solid rgba(37, 150, 190, 0.2)',
            fontSize: '11px',
            color: '#7ea8c4',
            letterSpacing: '0.5px'
          }}>
            © 2024 AIMS WO SYS v2.0 | SECURE AUTHENTICATION
          </div>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(15, 28, 46, 0.95) 0%, rgba(5, 12, 39, 0.95) 100%)',
            border: modal.type === 'success' ? '1px solid rgba(46, 213, 115, 0.3)' : '1px solid rgba(255, 107, 107, 0.3)',
            borderRadius: '20px',
            padding: '40px',
            maxWidth: '400px',
            width: '100%',
            boxShadow: modal.type === 'success' 
              ? '0 20px 60px rgba(46, 213, 115, 0.2)' 
              : '0 20px 60px rgba(255, 107, 107, 0.2)',
            animation: 'slideUp 0.3s ease-out',
            textAlign: 'center'
          }}>
            <div style={{
              width: '72px',
              height: '72px',
              margin: '0 auto 24px',
              borderRadius: '50%',
              background: modal.type === 'success' 
                ? 'rgba(46, 213, 115, 0.1)' 
                : 'rgba(255, 107, 107, 0.1)',
              border: modal.type === 'success' 
                ? '2px solid rgba(46, 213, 115, 0.3)' 
                : '2px solid rgba(255, 107, 107, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '36px'
            }}>
              {modal.type === 'success' ? '✓' : '✕'}
            </div>

            <h2 style={{
              margin: '0 0 12px 0',
              fontSize: '24px',
              fontWeight: '700',
              color: modal.type === 'success' ? '#2ed573' : '#ff6b6b'
            }}>
              {modal.title}
            </h2>

            <p style={{
              margin: '0 0 8px 0',
              fontSize: '15px',
              color: '#b8c9d9',
              lineHeight: '1.6'
            }}>
              {modal.message}
            </p>

            {modal.subtitle && (
              <p style={{
                margin: '0 0 32px 0',
                fontSize: '13px',
                color: '#7ea8c4',
                lineHeight: '1.5'
              }}>
                {modal.subtitle}
              </p>
            )}

            {modal.type === 'error' && (
              <button
                onClick={closeModal}
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#fff',
                  background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  boxShadow: '0 4px 16px rgba(255, 107, 107, 0.3)'
                }}
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        ::placeholder {
          color: #5a7d94;
        }
        select option {
          padding: 12px;
        }
      `}</style>
    </div>
  );
}