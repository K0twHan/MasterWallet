import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Mic, MicOff, Paperclip, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isVoice?: boolean;
}

interface ChatbotProps {
  onGoPools?: () => void;
}

export default function Chatbot({ onGoPools }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  // ...existing code...
  // Import useNavigate from react-router-dom
  // (add at top if not present)
  // import { useNavigate } from 'react-router-dom';
  // ...existing code...
  // Add navigate hook
  // const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '👋 Hello! How can I help you?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showGoPools, setShowGoPools] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US'; // Change to 'tr-TR' for Turkish

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          const voiceMessage: Message = {
            id: Date.now().toString(),
            text: transcript,
            sender: 'user',
            timestamp: new Date(),
            isVoice: true
          };
          setMessages(prev => [...prev, voiceMessage]);
          setIsRecording(false);

          // Pool intent detection (simple keyword match)
          const poolKeywords = [
            'paramı poollarda nasıl değerlendiririm',
            'pool',
            'havuz',
            'değerlendir',
            'yatırım',
            'değerlendirmek',
            'değerlendiririm',
            'poollarda',
            'poollarda nasıl',
            'nasıl değerlendiririm'
          ];
          const lowerTranscript = transcript.toLowerCase();
          const poolIntent = poolKeywords.some(k => lowerTranscript.includes(k));

          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            if (poolIntent) {
              setShowGoPools(true);
              setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                text:
                  'WDK platformunda paranızı değerlendirmek için AI destekli havuzlarımızı kullanabilirsiniz.\n\n' +
                  '• AI Aggressive Trader: Yüksek risk, yüksek getiri için hızlı al-sat işlemleri.\n' +
                  '• AI Balanced Portfolio: Dengeli risk ve getiri, portföy çeşitliliği.\n' +
                  '• AI Conservative Growth: Düşük risk, istikrarlı büyüme ve sabit gelir.\n\n' +
                  'Daha fazla bilgi için aşağıdaki butona tıklayın.',
                sender: 'bot',
                timestamp: new Date()
              }]);
            } else {
              setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                text: 'This feature will be active soon! 🚀',
                sender: 'bot',
                timestamp: new Date()
              }]);
            }
          }, 1500);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsRecording(false);
          alert('Error recognizing speech. Please try again.');
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages([...messages, newMessage]);
    setInputText('');

    // Simulate bot typing
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'This feature will be active soon! 🚀',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleRecording = async () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    if (!isRecording) {
      try {
        // Request microphone permission
        await navigator.mediaDevices.getUserMedia({ audio: true });
        
        setIsRecording(true);
        recognitionRef.current.start();
      } catch (error) {
        console.error('Microphone access error:', error);
        alert('Microphone access denied. Please allow microphone access to use voice input.');
      }
    } else {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Floating Chat Button */}
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
            background: 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)',
            border: 'none',
            boxShadow: '0 8px 32px rgba(255, 107, 0, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            transition: 'all 0.3s ease',
            animation: 'pulse 2s infinite'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(255, 107, 0, 0.6)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(255, 107, 0, 0.4)';
          }}
        >
          <MessageCircle size={28} color="#fff" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '400px',
            height: '600px',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1e 100%)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 24px 64px rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: "'DM Sans', sans-serif"
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Sparkles size={20} color="#fff" />
              </div>
              <div>
                <div style={{ color: '#fff', fontWeight: '700', fontSize: '16px' }}>
                  WDK AI Assistant
                </div>
                <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '12px' }}>
                  Always online
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              }}
            >
              <X size={18} color="#fff" />
            </button>
          </div>

          {/* Messages Area */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            {messages.map((message, idx) => (
              <div
                key={message.id}
                style={{
                  display: 'flex',
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  animation: 'slideIn 0.3s ease'
                }}
              >
                <div
                  style={{
                    maxWidth: '75%',
                    padding: '12px 16px',
                    borderRadius: message.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: message.sender === 'user'
                      ? 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)'
                      : 'rgba(255, 255, 255, 0.05)',
                    border: message.sender === 'bot' ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                    color: '#fff',
                    position: 'relative'
                  }}
                >
                  {message.isVoice && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <Mic size={14} />
                      <div style={{ fontSize: '12px', opacity: 0.8 }}>Voice message</div>
                    </div>
                  )}
                  <div style={{ fontSize: '14px', lineHeight: '1.5', whiteSpace: 'pre-line' }}>
                    {message.text}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      marginTop: '6px',
                      opacity: 0.7,
                      textAlign: 'right'
                    }}
                  >
                    {formatTime(message.timestamp)}
                  </div>
                  {/* Go Pools Button for pool intent message */}
                  {showGoPools && idx === messages.length - 1 && message.sender === 'bot' && message.text.includes('AI Aggressive Trader') && (
                    <div style={{ marginTop: '16px', textAlign: 'center' }}>
                      <button
                        style={{
                          background: 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '12px',
                          padding: '10px 24px',
                          fontWeight: '700',
                          fontSize: '15px',
                          cursor: 'pointer',
                          boxShadow: '0 4px 16px rgba(255, 107, 0, 0.2)',
                          marginTop: '8px',
                          transition: 'all 0.2s'
                        }}
                        onClick={() => {
                          if (onGoPools) {
                            onGoPools();
                          }
                        }}
                        onMouseOver={e => {
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseOut={e => {
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        Go Pools
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: '16px 16px 16px 4px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    gap: '6px',
                    alignItems: 'center'
                  }}
                >
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#FF6B00',
                      animation: 'bounce 1.4s infinite ease-in-out both',
                      animationDelay: '0s'
                    }}
                  />
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#FF6B00',
                      animation: 'bounce 1.4s infinite ease-in-out both',
                      animationDelay: '0.2s'
                    }}
                  />
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#FF6B00',
                      animation: 'bounce 1.4s infinite ease-in-out both',
                      animationDelay: '0.4s'
                    }}
                  />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Recording Indicator */}
          {isRecording && (
            <div
              style={{
                padding: '12px 20px',
                background: 'rgba(255, 107, 0, 0.1)',
                borderTop: '1px solid rgba(255, 107, 0, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: '#FF6B00'
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#FF6B00',
                  animation: 'pulse 1s infinite'
                }}
              />
              <span style={{ fontSize: '14px', fontWeight: '600' }}>Listening...</span>
            </div>
          )}

          {/* Input Area */}
          <div
            style={{
              padding: '20px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(0, 0, 0, 0.2)'
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                padding: '8px 12px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <button
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0.6,
                  transition: 'opacity 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.opacity = '0.6';
                }}
              >
                <Paperclip size={18} color="#999" />
              </button>

              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#fff',
                  fontSize: '14px',
                  fontFamily: "'DM Sans', sans-serif"
                }}
              />

              <button
                onClick={toggleRecording}
                disabled={isRecording}
                style={{
                  background: isRecording ? 'rgba(255, 107, 0, 0.2)' : 'transparent',
                  border: 'none',
                  cursor: isRecording ? 'not-allowed' : 'pointer',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  if (!isRecording) {
                    e.currentTarget.style.background = 'rgba(255, 107, 0, 0.1)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isRecording) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {isRecording ? (
                  <MicOff size={18} color="#FF6B00" />
                ) : (
                  <Mic size={18} color="#999" />
                )}
              </button>

              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim()}
                style={{
                  background: inputText.trim()
                    ? 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)'
                    : 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '10px 16px',
                  cursor: inputText.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  opacity: inputText.trim() ? 1 : 0.5
                }}
                onMouseOver={(e) => {
                  if (inputText.trim()) {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <Send size={16} color="#fff" />
              </button>
            </div>

            {/* Quick Actions */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                marginTop: '12px',
                flexWrap: 'wrap'
              }}
            >
              {['💰 Check Balance', '🔄 Swap Help', '🌉 Bridge Guide', '📊 Pool Suggest'].map((action) => (
                <button
                  key={action}
                  onClick={() => setInputText(action)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '6px 12px',
                    color: '#999',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 107, 0, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(255, 107, 0, 0.3)';
                    e.currentTarget.style.color = '#FF6B00';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.color = '#999';
                  }}
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add animations to index.css */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 8px 32px rgba(255, 107, 0, 0.4);
          }
          50% {
            box-shadow: 0 8px 48px rgba(255, 107, 0, 0.7);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
}
