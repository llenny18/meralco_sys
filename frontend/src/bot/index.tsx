import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, User, Minimize2, Database, BarChart2 } from 'lucide-react';

interface Message {
  id: number;
  type: 'user' | 'bot';
  text: string;
  timestamp: Date;
  dataType?: 'knowledge' | 'data' | 'both' | 'fallback';
  tableData?: Record<string, unknown>[];
  tableTitle?: string;
  tableTotal?: number;
}

interface AuthUser {
  username: string;
  role?: string;
  token: string;
}

interface ChatBotProps {
  apiBaseUrl?: string;
}

// ─────────────────────────────────────────────
// AUTH HELPERS — reads token from localStorage
// matching your Django Token auth pattern
// ─────────────────────────────────────────────
const getStoredAuth = (): AuthUser | null => {
  try {
    // Try common localStorage keys used by Django REST token auth frontends
    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('authToken') ||
      localStorage.getItem('auth_token') ||
      localStorage.getItem('access_token');

    if (!token) return null;

    // Try to read user info if stored separately
    const userRaw =
      localStorage.getItem('user') ||
      localStorage.getItem('userData') ||
      localStorage.getItem('auth_user');

    let username = 'User';
    let role = '';

    if (userRaw) {
      try {
        const parsed = JSON.parse(userRaw);
        username = parsed.username || parsed.name || parsed.first_name || 'User';
        role = parsed.role?.role_name || parsed.role || '';
      } catch {
        // ignore parse errors
      }
    }

    return { token, username, role };
  } catch {
    return null;
  }
};

// ─────────────────────────────────────────────
// SIMPLE DATA TABLE renderer
// ─────────────────────────────────────────────
const DataTable: React.FC<{
  rows: Record<string, unknown>[];
  title: string;
  total: number;
}> = ({ rows, title, total }) => {
  if (!rows || rows.length === 0) return null;

  const isSummary = rows.length === 1 && total === 1;

  if (isSummary) {
    const row = rows[0];
    return (
      <div style={{
        marginTop: '10px',
        backgroundColor: '#f0f9ff',
        border: '1px solid #bae6fd',
        borderRadius: '10px',
        padding: '12px',
        fontSize: '12px'
      }}>
        <p style={{ fontWeight: '700', color: '#0369a1', marginBottom: '8px', margin: '0 0 8px 0' }}>
          📊 {title}
        </p>
        {Object.entries(row).map(([k, v]) => (
          <div key={k} style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '3px 0',
            borderBottom: '1px solid #e0f2fe'
          }}>
            <span style={{ color: '#374151', textTransform: 'capitalize' }}>
              {k.replace(/_/g, ' ')}
            </span>
            <span style={{ fontWeight: '600', color: '#0c4a6e' }}>
              {String(v)}
            </span>
          </div>
        ))}
      </div>
    );
  }

  const keys = Object.keys(rows[0]);
  const displayKeys = keys.slice(0, 4); // show max 4 cols to fit chat width

  return (
    <div style={{
      marginTop: '10px',
      backgroundColor: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      overflow: 'hidden',
      fontSize: '11px'
    }}>
      <div style={{
        backgroundColor: '#1e40af',
        color: 'white',
        padding: '6px 10px',
        fontWeight: '700',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>📋 {title}</span>
        <span style={{ opacity: 0.8, fontSize: '10px' }}>
          {rows.length}/{total} records
        </span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#dbeafe' }}>
              {displayKeys.map(k => (
                <th key={k} style={{
                  padding: '5px 8px',
                  textAlign: 'left',
                  color: '#1e3a8a',
                  fontWeight: '600',
                  textTransform: 'capitalize',
                  whiteSpace: 'nowrap'
                }}>
                  {k.replace(/_/g, ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} style={{
                backgroundColor: i % 2 === 0 ? 'white' : '#f1f5f9',
                borderBottom: '1px solid #e2e8f0'
              }}>
                {displayKeys.map(k => (
                  <td key={k} style={{
                    padding: '5px 8px',
                    color: '#374151',
                    maxWidth: '90px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {String(row[k] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// MAIN CHATBOT COMPONENT
// ─────────────────────────────────────────────
const ChatBot: React.FC<ChatBotProps> = ({ apiBaseUrl = 'http://localhost:8000' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [auth, setAuth] = useState<AuthUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'bot',
      text: "👋 Hello! I'm your Smart Vendor Monitoring Assistant.\n\nI can help you with:\n• Live data — projects, vendors, SLAs, penalties\n• System statistics and analytics\n• How-to guides for any feature\n\nWhat would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Resolve auth on mount and when chat opens ──
  useEffect(() => {
    const resolved = getStoredAuth();
    setAuth(resolved);
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const quickQuestions = [
    "Show me system statistics",
    "List delayed projects",
    "Show SLA breaches",
    "Get analytics overview"
  ];

  // ── Build greeting based on auth ──
  const getGreeting = () => {
    if (!auth) return null;
    return (
      <div style={{
        padding: '6px 12px',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: '8px',
        fontSize: '12px',
        color: 'rgba(255,255,255,0.9)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <User style={{ width: '12px', height: '12px' }} />
        <span>{auth.username}{auth.role ? ` · ${auth.role}` : ''}</span>
      </div>
    );
  };

  // ── Send message to backend ──
  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Re-check auth in case login happened since component mounted
    const currentAuth = getStoredAuth();
    if (currentAuth && (!auth || currentAuth.token !== auth.token)) {
      setAuth(currentAuth);
    }

    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      text: text.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Build headers — include token if available
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      const resolvedAuth = currentAuth || auth;
      if (resolvedAuth?.token) {
        headers['Authorization'] = `Token ${resolvedAuth.token}`;
      }

      // Build body — also pass token in body as fallback (your backend supports both)
      const body: Record<string, string> = {
        question: text.trim(),
      };
      if (resolvedAuth?.token) {
        body['token'] = resolvedAuth.token;
      }

      const response = await fetch(`${apiBaseUrl}/chat/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        credentials: 'include', // send session cookies too if any
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      const botMessage: Message = {
        id: Date.now() + 1,
        type: 'bot',
        text: data.answer || "I'm sorry, I couldn't process that request.",
        timestamp: new Date(),
        dataType: data.type,
        tableData: data.data,
        tableTitle: data.title,
        tableTotal: data.total,
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now() + 1,
        type: 'bot',
        text: "⚠️ Sorry, I'm having trouble connecting to the server. Please try again later.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickQuestion = (question: string) => {
    sendMessage(question);
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ── Data type badge ──
  const DataBadge: React.FC<{ type?: string }> = ({ type }) => {
    if (!type || type === 'fallback') return null;
    const config: Record<string, { label: string; color: string; bg: string }> = {
      data:      { label: '📊 Live Data',    color: '#065f46', bg: '#d1fae5' },
      knowledge: { label: '📖 Guide',        color: '#1e3a8a', bg: '#dbeafe' },
      both:      { label: '📊 Data + Guide', color: '#581c87', bg: '#f3e8ff' },
    };
    const c = config[type];
    if (!c) return null;
    return (
      <span style={{
        fontSize: '10px',
        backgroundColor: c.bg,
        color: c.color,
        padding: '2px 8px',
        borderRadius: '9999px',
        fontWeight: '600',
        display: 'inline-block',
        marginBottom: '4px'
      }}>
        {c.label}
      </span>
    );
  };

  return (
    <div style={{ position: 'fixed', bottom: 0, right: 0, zIndex: 99999 }}>
      {/* ── Floating Button ── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
            zIndex: 99999,
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.3)';
          }}
          aria-label="Open chat"
        >
          <MessageCircle style={{ width: '28px', height: '28px' }} />
          <span style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            width: '16px',
            height: '16px',
            backgroundColor: '#ef4444',
            borderRadius: '50%',
            animation: 'pulse 2s infinite'
          }} />
        </button>
      )}

      {/* ── Chat Window ── */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '390px',
            maxHeight: 'calc(100vh - 48px)',
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15), 0 10px 10px -5px rgba(0,0,0,0.08)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 99999,
            height: isMinimized ? '64px' : '620px',
            transition: 'height 0.3s ease',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #050c27 0%, #1d4ed8 100%)',
            color: 'white',
            padding: '12px 16px',
            border: '3px solid white',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Bot style={{ width: '22px', height: '22px' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>AI Assistant</h3>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.75)', margin: 0 }}>
                  {auth ? '🔐 Authenticated session' : '👁 Guest mode · login for live data'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {/* Auth badge */}
              {getGreeting()}

              {/* Minimize */}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                style={{
                  background: 'transparent', border: 'none', color: 'white',
                  cursor: 'pointer', padding: '6px', borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                aria-label={isMinimized ? 'Maximize' : 'Minimize'}
              >
                <Minimize2 style={{ width: '16px', height: '16px' }} />
              </button>

              {/* Close */}
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'transparent', border: 'none', color: 'white',
                  cursor: 'pointer', padding: '6px', borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                aria-label="Close chat"
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* ── Messages Area ── */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px',
                backgroundColor: '#f9fafb',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                {/* Auth notice if not logged in */}
                {!auth && (
                  <div style={{
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fcd34d',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    fontSize: '12px',
                    color: '#92400e',
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'flex-start'
                  }}>
                    <span style={{ fontSize: '14px' }}>ℹ️</span>
                    <span>You're not logged in. General questions work, but live project data requires authentication.</span>
                  </div>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    style={{
                      display: 'flex',
                      gap: '10px',
                      flexDirection: message.type === 'user' ? 'row-reverse' : 'row'
                    }}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      backgroundColor: message.type === 'user' ? '#2563eb' : 'white',
                      color: message.type === 'user' ? 'white' : '#2563eb',
                      border: message.type === 'bot' ? '2px solid #dbeafe' : 'none'
                    }}>
                      {message.type === 'user'
                        ? <User style={{ width: '14px', height: '14px' }} />
                        : <Bot style={{ width: '14px', height: '14px' }} />
                      }
                    </div>

                    {/* Bubble */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: message.type === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '280px'
                    }}>
                      {/* Data type badge for bot messages */}
                      {message.type === 'bot' && <DataBadge type={message.dataType} />}

                      <div style={{
                        borderRadius: '14px',
                        padding: '10px 14px',
                        backgroundColor: message.type === 'user' ? '#2563eb' : 'white',
                        color: message.type === 'user' ? 'white' : '#1f2937',
                        borderBottomRightRadius: message.type === 'user' ? '4px' : '14px',
                        borderBottomLeftRadius: message.type === 'bot' ? '4px' : '14px',
                        boxShadow: message.type === 'bot' ? '0 1px 3px rgba(0,0,0,0.07)' : 'none',
                        border: message.type === 'bot' ? '1px solid #f3f4f6' : 'none'
                      }}>
                        <p style={{
                          fontSize: '13px',
                          whiteSpace: 'pre-wrap',
                          lineHeight: '1.6',
                          margin: 0
                        }}>
                          {message.text}
                        </p>

                        {/* Inline data table */}
                        {message.tableData && message.tableData.length > 0 && message.tableTitle && (
                          <DataTable
                            rows={message.tableData}
                            title={message.tableTitle}
                            total={message.tableTotal ?? message.tableData.length}
                          />
                        )}
                      </div>

                      {/* Timestamp + data indicator */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginTop: '4px',
                        paddingLeft: '6px',
                        paddingRight: '6px'
                      }}>
                        {message.dataType === 'data' || message.dataType === 'both' ? (
                          <Database style={{ width: '10px', height: '10px', color: '#6b7280' }} />
                        ) : null}
                        <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                          {formatTimestamp(message.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Loading dots */}
                {isLoading && (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{
                      width: '30px', height: '30px', borderRadius: '50%',
                      backgroundColor: 'white', color: '#2563eb',
                      border: '2px solid #dbeafe',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Bot style={{ width: '14px', height: '14px' }} />
                    </div>
                    <div style={{
                      backgroundColor: 'white', borderRadius: '14px',
                      borderBottomLeftRadius: '4px', padding: '12px 16px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
                      border: '1px solid #f3f4f6'
                    }}>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        {[0, 0.15, 0.3].map((delay, i) => (
                          <div key={i} style={{
                            width: '7px', height: '7px',
                            backgroundColor: '#93c5fd', borderRadius: '50%',
                            animation: `bounce 1s infinite`,
                            animationDelay: `${delay}s`
                          }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* ── Quick Questions (shown only on first message) ── */}
              {messages.length === 1 && (
                <div style={{
                  padding: '10px 14px',
                  backgroundColor: 'white',
                  borderTop: '1px solid #f3f4f6'
                }}>
                  <p style={{
                    fontSize: '11px', color: '#6b7280', fontWeight: '600',
                    margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px'
                  }}>
                    Quick questions:
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {quickQuestions.map((question, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickQuestion(question)}
                        disabled={isLoading}
                        style={{
                          fontSize: '12px',
                          backgroundColor: '#eff6ff',
                          color: '#1d4ed8',
                          padding: '5px 11px',
                          borderRadius: '9999px',
                          border: '1px solid #bfdbfe',
                          cursor: isLoading ? 'not-allowed' : 'pointer',
                          transition: 'background 0.2s',
                          opacity: isLoading ? 0.5 : 1
                        }}
                        onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.backgroundColor = '#dbeafe'; }}
                        onMouseLeave={(e) => { if (!isLoading) e.currentTarget.style.backgroundColor = '#eff6ff'; }}
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Input Area ── */}
              <div style={{
                padding: '14px 16px',
                backgroundColor: 'white',
                borderTop: '1px solid #f3f4f6',
                borderBottomLeftRadius: '16px',
                borderBottomRightRadius: '16px'
              }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                    placeholder={auth ? `Ask me anything, ${auth.username}…` : 'Ask me anything…'}
                    disabled={isLoading}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      background: 'linear-gradient(135deg, #050c27 0%, #1d4ed8 100%)',
                      border: '1px solid #e5e7eb',
                      color: 'white',
                      borderRadius: '12px',
                      fontSize: '13px',
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#2563eb';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.15)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading || !input.trim()}
                    style={{
                      backgroundColor: (isLoading || !input.trim()) ? '#d1d5db' : '#2563eb',
                      color: 'white',
                      padding: '10px',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: (isLoading || !input.trim()) ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      minWidth: '42px',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => { if (!isLoading && input.trim()) e.currentTarget.style.backgroundColor = '#1d4ed8'; }}
                    onMouseLeave={(e) => { if (!isLoading && input.trim()) e.currentTarget.style.backgroundColor = '#2563eb'; }}
                    aria-label="Send message"
                  >
                    {isLoading
                      ? <Loader2 style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} />
                      : <Send style={{ width: '18px', height: '18px' }} />
                    }
                  </button>
                </div>

                {/* Footer row */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '8px'
                }}>
                  <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                    {auth
                      ? <><BarChart2 style={{ width: '10px', height: '10px', display: 'inline', marginRight: '3px' }} />Live data enabled</>
                      : '⚡ Powered by AI'
                    }
                  </span>
                  <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                    Smart Vendor System
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ChatBot;