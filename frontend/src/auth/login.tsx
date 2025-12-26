import { useState, useEffect } from 'react';

// API Configuration
const API_BASE_URL = 'https://aimswo.online/api/api/v1';

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

      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned an invalid response. Please check if Django is running correctly.');
      }

      if (response.ok && data.success) {
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
        subtitle: 'Please ensure Django server is running on https://aimswo.online/api'
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
      background: 'linear-gradient(135deg, #050c27 0%, #0a1545 100%)',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Left Side - Branding & Info */}
      <div style={{
        flex: '1',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '60px 40px',
        position: 'relative',
        minHeight: '100vh'
      }}>
        {/* Decorative circles for left side */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37, 150, 190, 0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          animation: 'float 20s ease-in-out infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '10%',
          right: '10%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(26, 122, 159, 0.1) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          animation: 'float 25s ease-in-out infinite reverse'
        }}></div>

        <div style={{
          maxWidth: '600px',
          width: '100%',
          zIndex: 1
        }}>
          {/* Logo */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '48px'
          }}>
            <div style={{
              width: '120px',
              height: '120px',
              background: 'linear-gradient(135deg, #ffffff 0%, #ffffff 100%)',
              borderRadius: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 12px 32px rgba(37, 150, 190, 0.4)',
              marginRight: '24px'
            }}>
              <img 
                src="/icon-384x384.png" 
                alt="AIMS WO Logo" 
                width="70" 
                height="70"
                style={{ display: 'block' }}
              />
            </div>
            <div>
              <h1 style={{
                margin: '0 0 8px 0',
                fontSize: '56px',
                fontWeight: '800',
                color: '#fff',
                letterSpacing: '3px',
                lineHeight: '1'
              }}>
                AIMS WO
              </h1>
              <p style={{
                margin: 0,
                fontSize: '16px',
                color: '#7ea8c4',
                fontWeight: '600',
                letterSpacing: '2.5px'
              }}>
                SMART VENDOR SYSTEM
              </p>
            </div>
          </div>

          {/* Info Section */}
          <div style={{
            textAlign: 'center',
            marginBottom: '48px'
          }}>
            <h2 style={{
              margin: '0 0 20px 0',
              fontSize: '36px',
              fontWeight: '700',
              color: '#fff',
              lineHeight: '1.3'
            }}>
              Enterprise Work Order<br />Management Platform
            </h2>
            <p style={{
              margin: 0,
              fontSize: '18px',
              color: '#9fb8cc',
              lineHeight: '1.7'
            }}>
              Streamline operations, manage vendors, and track work orders in real-time with advanced analytics and role-based access control.
            </p>
          </div>

          {/* Features Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '20px'
          }}>
            {[
              { icon: '⚡', title: 'Real-Time Tracking' },
              { icon: '📊', title: 'Advanced Analytics' },
              { icon: '🔒', title: 'Secure Access' },
              { icon: '🤝', title: 'Vendor Integration' }
            ].map((feature, idx) => (
              <div
                key={idx}
                style={{
                  padding: '24px',
                  background: 'rgba(15, 28, 46, 0.5)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(37, 150, 190, 0.2)',
                  borderRadius: '16px',
                  textAlign: 'center',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>{feature.icon}</div>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#9fb8cc',
                  letterSpacing: '0.5px'
                }}>
                  {feature.title}
                </div>
              </div>
            ))}
          </div>

          {/* Version Info */}
          <div style={{
            marginTop: '48px',
            textAlign: 'center',
            fontSize: '12px',
            color: '#5a7d94',
            letterSpacing: '0.5px'
          }}>
            © 2024 AIMS WO SYS v2.0 | SECURE AUTHENTICATION
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div style={{
        flex: '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        background: 'rgba(5, 12, 39, 0.6)',
        backdropFilter: 'blur(20px)',
        borderLeft: '1px solid rgba(37, 150, 190, 0.2)',
        position: 'relative',
        minHeight: '100vh'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '480px'
        }}>
          <div style={{
            background: 'rgba(15, 28, 46, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(37, 150, 190, 0.3)',
            borderRadius: '24px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            overflow: 'hidden'
          }}>
            {/* Form Header */}
            <div style={{
              padding: '40px 40px 32px',
              background: 'linear-gradient(135deg, rgba(37, 150, 190, 0.15) 0%, transparent 100%)',
              borderBottom: '1px solid rgba(37, 150, 190, 0.2)',
              textAlign: 'center'
            }}>
              <h2 style={{
                margin: '0 0 8px 0',
                fontSize: '28px',
                fontWeight: '700',
                color: '#fff',
                letterSpacing: '0.5px'
              }}>
                Welcome Back
              </h2>
              <p style={{
                margin: 0,
                fontSize: '14px',
                color: '#7ea8c4'
              }}>
                Sign in to access your dashboard
              </p>
            </div>

            {/* Form Content */}
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
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, 30px); }
        }
        ::placeholder {
          color: #5a7d94;
        }
        select option {
          padding: 12px;
        }

        /* Mobile Responsive */
        @media (max-width: 1024px) {
          body > div {
            flex-direction: column !important;
          }
          body > div > div:first-child {
            min-height: auto !important;
            padding: 40px 20px !important;
          }
          body > div > div:last-child {
            border-left: none !important;
            border-top: 1px solid rgba(37, 150, 190, 0.2) !important;
            min-height: auto !important;
          }
        }
      `}</style>
    </div>
  );
}