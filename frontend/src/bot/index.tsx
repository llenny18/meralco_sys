import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, User, Minimize2 } from 'lucide-react';

interface Message {
  id: number;
  type: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

interface ChatBotProps {
  apiBaseUrl?: string;
}

const ChatBot: React.FC<ChatBotProps> = ({ apiBaseUrl = 'http://localhost:8000' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'bot',
      text: "👋 Hello! I'm your Smart Vendor Monitoring Assistant. I can help you with:\n\n• System statistics and overview\n• Delayed projects information\n• At-risk project predictions\n• Vendor penalty details\n• System features and capabilities\n\nWhat would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    "Which projects are at risk?",
    "What is the Smart Vendor Monitoring System?"
  ];

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

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
      const response = await fetch(`${apiBaseUrl}/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: text.trim() })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      const botMessage: Message = {
        id: Date.now() + 1,
        type: 'bot',
        text: data.answer || "I'm sorry, I couldn't process that request.",
        timestamp: new Date()
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

  return (
    <div style={{ position: 'fixed', bottom: 0, right: 0, zIndex: 99999 }}>
      {/* Chat Button */}
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
          }}></span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '384px',
            maxHeight: 'calc(100vh - 48px)',
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 99999,
            height: isMinimized ? '64px' : '600px',
            transition: 'height 0.3s ease',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            color: 'white',
            padding: '16px',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Bot style={{ width: '24px', height: '24px' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>AI Assistant</h3>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', margin: 0 }}>Always here to help</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                aria-label={isMinimized ? "Maximize" : "Minimize"}
              >
                <Minimize2 style={{ width: '16px', height: '16px' }} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s'
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
              {/* Messages Area */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px',
                backgroundColor: '#f9fafb',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    style={{
                      display: 'flex',
                      gap: '12px',
                      flexDirection: message.type === 'user' ? 'row-reverse' : 'row'
                    }}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      backgroundColor: message.type === 'user' ? '#2563eb' : 'white',
                      color: message.type === 'user' ? 'white' : '#2563eb',
                      border: message.type === 'bot' ? '2px solid #dbeafe' : 'none'
                    }}>
                      {message.type === 'user' ? (
                        <User style={{ width: '16px', height: '16px' }} />
                      ) : (
                        <Bot style={{ width: '16px', height: '16px' }} />
                      )}
                    </div>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: message.type === 'user' ? 'flex-end' : 'flex-start'
                    }}>
                      <div style={{
                        borderRadius: '16px',
                        padding: '12px 16px',
                        maxWidth: '256px',
                        backgroundColor: message.type === 'user' ? '#2563eb' : 'white',
                        color: message.type === 'user' ? 'white' : '#1f2937',
                        borderBottomRightRadius: message.type === 'user' ? '4px' : '16px',
                        borderBottomLeftRadius: message.type === 'bot' ? '4px' : '16px',
                        boxShadow: message.type === 'bot' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                        border: message.type === 'bot' ? '1px solid #f3f4f6' : 'none'
                      }}>
                        <p style={{
                          fontSize: '14px',
                          whiteSpace: 'pre-wrap',
                          lineHeight: '1.5',
                          margin: 0
                        }}>
                          {message.text}
                        </p>
                      </div>
                      <span style={{
                        fontSize: '12px',
                        color: '#9ca3af',
                        marginTop: '4px',
                        paddingLeft: '8px',
                        paddingRight: '8px'
                      }}>
                        {formatTimestamp(message.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: 'white',
                      color: '#2563eb',
                      border: '2px solid #dbeafe',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Bot style={{ width: '16px', height: '16px' }} />
                    </div>
                    <div style={{
                      backgroundColor: 'white',
                      borderRadius: '16px',
                      borderBottomLeftRadius: '4px',
                      padding: '12px 16px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      border: '1px solid #f3f4f6'
                    }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          backgroundColor: '#93c5fd',
                          borderRadius: '50%',
                          animation: 'bounce 1s infinite'
                        }}></div>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          backgroundColor: '#93c5fd',
                          borderRadius: '50%',
                          animation: 'bounce 1s infinite',
                          animationDelay: '0.1s'
                        }}></div>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          backgroundColor: '#93c5fd',
                          borderRadius: '50%',
                          animation: 'bounce 1s infinite',
                          animationDelay: '0.2s'
                        }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Questions */}
              {messages.length === 1 && (
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: 'white',
                  borderTop: '1px solid #f3f4f6'
                }}>
                  <p style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    marginBottom: '8px',
                    fontWeight: '500',
                    margin: '0 0 8px 0'
                  }}>Quick questions:</p>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}>
                    {quickQuestions.map((question, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickQuestion(question)}
                        disabled={isLoading}
                        style={{
                          fontSize: '12px',
                          backgroundColor: '#eff6ff',
                          color: '#1d4ed8',
                          padding: '6px 12px',
                          borderRadius: '9999px',
                          border: '1px solid #bfdbfe',
                          cursor: isLoading ? 'not-allowed' : 'pointer',
                          transition: 'background 0.2s',
                          opacity: isLoading ? 0.5 : 1
                        }}
                        onMouseEnter={(e) => {
                          if (!isLoading) e.currentTarget.style.backgroundColor = '#dbeafe';
                        }}
                        onMouseLeave={(e) => {
                          if (!isLoading) e.currentTarget.style.backgroundColor = '#eff6ff';
                        }}
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div style={{
                padding: '16px',
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
                    placeholder="Ask me anything..."
                    disabled={isLoading}
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      backgroundColor: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#2563eb';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)';
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
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '44px',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoading && input.trim()) {
                        e.currentTarget.style.backgroundColor = '#1d4ed8';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoading && input.trim()) {
                        e.currentTarget.style.backgroundColor = '#2563eb';
                      }
                    }}
                    aria-label="Send message"
                  >
                    {isLoading ? (
                      <Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} />
                    ) : (
                      <Send style={{ width: '20px', height: '20px' }} />
                    )}
                  </button>
                </div>
                <p style={{
                  fontSize: '12px',
                  color: '#9ca3af',
                  marginTop: '8px',
                  textAlign: 'center',
                  margin: '8px 0 0 0'
                }}>
                  Powered by AI • Smart Vendor System
                </p>
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