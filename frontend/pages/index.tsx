import { useState, useEffect } from 'react';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % userRoles.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const userRoles = [
    {
      title: 'System Administrator',
      icon: '⚙️',
      color: '#2596be',
      capabilities: [
        'Full system access and configuration',
        'User management and permissions',
        'System-wide analytics and reporting',
        'Database administration'
      ]
    },
    {
      title: 'Sector Manager',
      icon: '📊',
      color: '#1a7a9f',
      capabilities: [
        'Sector-wide work order oversight',
        'Resource allocation and planning',
        'Performance monitoring and KPIs',
        'Strategic decision making'
      ]
    },
    {
      title: 'Team Leader',
      icon: '👥',
      color: '#2596be',
      capabilities: [
        'Team coordination and supervision',
        'Work order assignment and tracking',
        'Team performance evaluation',
        'Resource request management'
      ]
    },
    {
      title: 'Engineer',
      icon: '🔧',
      color: '#1a7a9f',
      capabilities: [
        'Technical work order execution',
        'Engineering assessments',
        'Quality inspections',
        'Documentation and reporting'
      ]
    },
    {
      title: 'Vendor Representative',
      icon: '🏢',
      color: '#2596be',
      capabilities: [
        'Work order status updates',
        'Material and resource tracking',
        'Vendor collaboration portal',
        'Invoice and billing management'
      ]
    },
    {
      title: 'Quality Inspector',
      icon: '✓',
      color: '#1a7a9f',
      capabilities: [
        'Quality assurance inspections',
        'Compliance verification',
        'Defect reporting and tracking',
        'Quality documentation'
      ]
    },
    {
      title: 'WO Supervisor',
      icon: '📋',
      color: '#2596be',
      capabilities: [
        'Work order validation and approval',
        'Progress monitoring',
        'Resource coordination',
        'Completion verification'
      ]
    },
    {
      title: 'Clerk',
      icon: '📝',
      color: '#1a7a9f',
      capabilities: [
        'Data entry and documentation',
        'Administrative support',
        'Record management',
        'Report generation'
      ]
    },
    {
      title: 'Engineering Aide',
      icon: '🛠️',
      color: '#2596be',
      capabilities: [
        'Technical assistance',
        'Field data collection',
        'Equipment maintenance support',
        'Documentation support'
      ]
    }
  ];

  const features = [
    {
      icon: '⚡',
      title: 'Real-Time Tracking',
      description: 'Monitor work orders and vendor activities in real-time with live updates and notifications.'
    },
    {
      icon: '📊',
      title: 'Advanced Analytics',
      description: 'Comprehensive dashboards and KPI tracking for data-driven decision making.'
    },
    {
      icon: '🔒',
      title: 'Enterprise Security',
      description: 'Role-based access control with advanced authentication and data encryption.'
    },
    {
      icon: '🤝',
      title: 'Vendor Integration',
      description: 'Seamless collaboration between internal teams and external vendors.'
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #050c27 0%, #0a1545 100%)',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#fff',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative Background Elements */}
      <div style={{
        position: 'fixed',
        top: '-10%',
        right: '-5%',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(37, 150, 190, 0.15) 0%, transparent 70%)',
        filter: 'blur(60px)',
        pointerEvents: 'none',
        animation: 'float 20s ease-in-out infinite'
      }}></div>
      <div style={{
        position: 'fixed',
        bottom: '-10%',
        left: '-5%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(26, 122, 159, 0.1) 0%, transparent 70%)',
        filter: 'blur(60px)',
        pointerEvents: 'none',
        animation: 'float 25s ease-in-out infinite reverse'
      }}></div>

      {/* Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 100,
        background: scrolled ? 'rgba(5, 12, 39, 0.9)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(37, 150, 190, 0.2)' : 'none',
        transition: 'all 0.3s ease'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #ffffff 0%, #ffffff 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(37, 150, 190, 0.3)'
          }}>
            <img 
              src="/icon-384x384.png" 
              alt="AIMS WO Logo" 
              width="28" 
              height="28"
              style={{ display: 'block' }}
            />
          </div>
          <div>
            <div style={{
              fontSize: '20px',
              fontWeight: '700',
              letterSpacing: '1.5px',
              color: '#fff'
            }}>
              AIMS WO
            </div>
            <div style={{
              fontSize: '10px',
              color: '#7ea8c4',
              letterSpacing: '1px',
              fontWeight: '500'
            }}>
              SMART VENDOR SYSTEM
            </div>
          </div>
        </div>
        <button
          onClick={() => window.location.href = '/login'}
          style={{
            padding: '12px 32px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#fff',
            background: 'linear-gradient(135deg, #2596be 0%, #1a7a9f 100%)',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            letterSpacing: '0.5px',
            boxShadow: '0 4px 16px rgba(37, 150, 190, 0.3)',
            transition: 'all 0.3s ease',
            textTransform: 'uppercase'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 150, 190, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(37, 150, 190, 0.3)';
          }}
        >
          Login
        </button>
      </nav>

      {/* Hero Section */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '100px 40px 60px',
        position: 'relative'
      }}>
        <div style={{
          maxWidth: '1200px',
          width: '100%',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'inline-block',
            padding: '8px 24px',
            background: 'rgba(37, 150, 190, 0.1)',
            border: '1px solid rgba(37, 150, 190, 0.3)',
            borderRadius: '50px',
            fontSize: '12px',
            fontWeight: '600',
            color: '#2596be',
            letterSpacing: '1px',
            marginBottom: '32px',
            textTransform: 'uppercase'
          }}>
            Enterprise Work Order Management
          </div>
          
          <h1 style={{
            margin: '0 0 24px 0',
            fontSize: '72px',
            fontWeight: '800',
            lineHeight: '1.1',
            background: 'linear-gradient(135deg, #ffffff 0%, #7ea8c4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Streamline Your<br />Vendor Operations
          </h1>
          
          <p style={{
            margin: '0 auto 48px',
            fontSize: '20px',
            color: '#9fb8cc',
            maxWidth: '700px',
            lineHeight: '1.6'
          }}>
            A comprehensive platform for managing work orders, vendors, and team collaboration with real-time tracking and powerful analytics.
          </p>

          <div style={{
            display: 'flex',
            gap: '20px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => window.location.href = '/login'}
              style={{
                padding: '18px 48px',
                fontSize: '16px',
                fontWeight: '700',
                color: '#fff',
                background: 'linear-gradient(135deg, #2596be 0%, #1a7a9f 100%)',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                letterSpacing: '0.5px',
                boxShadow: '0 8px 24px rgba(37, 150, 190, 0.4)',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(37, 150, 190, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(37, 150, 190, 0.4)';
              }}
            >
              Get Started
            </button>
            <button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              style={{
                padding: '18px 48px',
                fontSize: '16px',
                fontWeight: '700',
                color: '#2596be',
                background: 'rgba(37, 150, 190, 0.1)',
                border: '2px solid rgba(37, 150, 190, 0.3)',
                borderRadius: '12px',
                cursor: 'pointer',
                letterSpacing: '0.5px',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(37, 150, 190, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(37, 150, 190, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(37, 150, 190, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(37, 150, 190, 0.3)';
              }}
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{
        padding: '100px 40px',
        position: 'relative'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h2 style={{
              margin: '0 0 16px 0',
              fontSize: '48px',
              fontWeight: '800',
              color: '#fff'
            }}>
              Powerful Features
            </h2>
            <p style={{
              margin: 0,
              fontSize: '18px',
              color: '#7ea8c4'
            }}>
              Everything you need to manage your operations efficiently
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '32px'
          }}>
            {features.map((feature, index) => (
              <div
                key={index}
                style={{
                  padding: '40px 32px',
                  background: 'rgba(15, 28, 46, 0.5)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(37, 150, 190, 0.2)',
                  borderRadius: '20px',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.borderColor = 'rgba(37, 150, 190, 0.5)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(37, 150, 190, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(37, 150, 190, 0.2)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  fontSize: '48px',
                  marginBottom: '20px'
                }}>
                  {feature.icon}
                </div>
                <h3 style={{
                  margin: '0 0 12px 0',
                  fontSize: '22px',
                  fontWeight: '700',
                  color: '#fff'
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  margin: 0,
                  fontSize: '15px',
                  color: '#9fb8cc',
                  lineHeight: '1.6'
                }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section style={{
        padding: '100px 40px',
        background: 'rgba(5, 12, 39, 0.5)',
        position: 'relative'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h2 style={{
              margin: '0 0 16px 0',
              fontSize: '48px',
              fontWeight: '800',
              color: '#fff'
            }}>
              Role-Based Access Control
            </h2>
            <p style={{
              margin: 0,
              fontSize: '18px',
              color: '#7ea8c4'
            }}>
              Tailored capabilities for every member of your organization
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '32px'
          }}>
            {userRoles.map((role, index) => (
              <div
                key={index}
                style={{
                  padding: '32px',
                  background: activeFeature === index 
                    ? 'rgba(37, 150, 190, 0.15)' 
                    : 'rgba(15, 28, 46, 0.5)',
                  backdropFilter: 'blur(20px)',
                  border: `2px solid ${activeFeature === index ? role.color : 'rgba(37, 150, 190, 0.2)'}`,
                  borderRadius: '20px',
                  transition: 'all 0.5s ease',
                  cursor: 'pointer',
                  transform: activeFeature === index ? 'scale(1.02)' : 'scale(1)'
                }}
                onClick={() => setActiveFeature(index)}
                onMouseEnter={(e) => {
                  if (activeFeature !== index) {
                    e.currentTarget.style.borderColor = 'rgba(37, 150, 190, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeFeature !== index) {
                    e.currentTarget.style.borderColor = 'rgba(37, 150, 190, 0.2)';
                  }
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginBottom: '24px'
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '14px',
                    background: `linear-gradient(135deg, ${role.color} 0%, ${role.color}dd 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    boxShadow: `0 4px 16px ${role.color}40`
                  }}>
                    {role.icon}
                  </div>
                  <h3 style={{
                    margin: 0,
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#fff'
                  }}>
                    {role.title}
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {role.capabilities.map((capability, capIndex) => (
                    <div
                      key={capIndex}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px'
                      }}
                    >
                      <div style={{
                        minWidth: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: role.color,
                        marginTop: '7px'
                      }}></div>
                      <span style={{
                        fontSize: '14px',
                        color: '#9fb8cc',
                        lineHeight: '1.6'
                      }}>
                        {capability}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '100px 40px',
        position: 'relative'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: 'center',
          padding: '80px 60px',
          background: 'rgba(15, 28, 46, 0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(37, 150, 190, 0.3)',
          borderRadius: '32px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
        }}>
          <h2 style={{
            margin: '0 0 20px 0',
            fontSize: '42px',
            fontWeight: '800',
            color: '#fff'
          }}>
            Ready to Get Started?
          </h2>
          <p style={{
            margin: '0 0 40px 0',
            fontSize: '18px',
            color: '#9fb8cc',
            lineHeight: '1.6'
          }}>
            Join thousands of organizations streamlining their vendor operations with AIMS WO
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            style={{
              padding: '20px 60px',
              fontSize: '16px',
              fontWeight: '700',
              color: '#fff',
              background: 'linear-gradient(135deg, #2596be 0%, #1a7a9f 100%)',
              border: 'none',
              borderRadius: '14px',
              cursor: 'pointer',
              letterSpacing: '0.5px',
              boxShadow: '0 8px 24px rgba(37, 150, 190, 0.4)',
              transition: 'all 0.3s ease',
              textTransform: 'uppercase'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(37, 150, 190, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(37, 150, 190, 0.4)';
            }}
          >
            Access Your Dashboard
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '40px',
        textAlign: 'center',
        background: 'rgba(5, 12, 39, 0.8)',
        borderTop: '1px solid rgba(37, 150, 190, 0.2)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #ffffff 0%, #ffffff 100%)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(37, 150, 190, 0.3)'
          }}>
            <img 
              src="/icon-384x384.png" 
              alt="AIMS WO Logo" 
              width="24" 
              height="24"
              style={{ display: 'block' }}
            />
          </div>
          <div style={{
            fontSize: '18px',
            fontWeight: '700',
            letterSpacing: '1.5px',
            color: '#fff'
          }}>
            AIMS WO
          </div>
        </div>
        <p style={{
          margin: '0 0 8px 0',
          fontSize: '11px',
          color: '#7ea8c4',
          letterSpacing: '0.5px'
        }}>
          © 2024 AIMS WO SMART VENDOR SYSTEM v2.0
        </p>
        <p style={{
          margin: 0,
          fontSize: '10px',
          color: '#5a7d94',
          letterSpacing: '0.5px'
        }}>
          Enterprise Work Order Management Solution
        </p>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, 30px); }
        }
        
        * {
          box-sizing: border-box;
        }
        
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
}