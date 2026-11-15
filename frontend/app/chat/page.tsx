'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message { id: string; role: 'user' | 'assistant'; content: string; }
interface Chat { _id: string; title: string; lastMessage: string; }

const SUGGESTIONS = [
  'I have a headache and mild fever, what should I do?',
  'What foods should I avoid for high blood pressure?',
  'How to perform CPR — step by step',
  'What does a CBC blood test show?',
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [guestCount, setGuestCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) { setUser(JSON.parse(storedUser)); fetchChats(token); }
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const fetchChats = async (token: string) => {
    try {
      const res = await fetch(`${API}/chat`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setChats(data.chats || []);
    } catch {}
  };

  const newChat = async () => {
    const token = localStorage.getItem('token');
    if (!token) { setMessages([]); setActiveChatId(null); return; }
    const res = await fetch(`${API}/chat`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setActiveChatId(data.chat._id); setMessages([]); fetchChats(token);
  };

  const loadChat = async (chatId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setActiveChatId(chatId);
    const res = await fetch(`${API}/chat/${chatId}`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setMessages((data.messages || []).map((m: any) => ({ id: m._id, role: m.role, content: m.content })));
  };

  const deleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) return;
    await fetch(`${API}/chat/${chatId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    if (activeChatId === chatId) { setMessages([]); setActiveChatId(null); }
    fetchChats(token);
  };

  const sendMessage = useCallback(async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isStreaming) return;
    const token = localStorage.getItem('token');
    if (!token && guestCount >= 5) { setShowModal(true); return; }

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: '' };
    setMessages(prev => [...prev, userMsg, aiMsg]);
    setInput('');
    setIsStreaming(true);
    if (!token) setGuestCount(c => c + 1);

    try {
      let chatId = activeChatId;
      if (token && !chatId) {
        const res = await fetch(`${API}/chat`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        chatId = data.chat._id;
        setActiveChatId(chatId);
      }

      const isGuest = !token;
      const url = isGuest ? `${API}/chat/guest` : `${API}/chat/${chatId}/message`;
      const body = isGuest
        ? JSON.stringify({ message: text, history: messages.map(m => ({ role: m.role, content: m.content })) })
        : JSON.stringify({ content: text });

      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body,
      });

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value).split('\n')) {
          if (line.startsWith('data: ') && !line.includes('[DONE]')) {
            try {
              const { chunk } = JSON.parse(line.replace('data: ', ''));
              setMessages(prev => prev.map(m => m.id === aiMsg.id ? { ...m, content: m.content + chunk } : m));
            } catch {}
          }
        }
      }
      if (token) fetchChats(token);
    } catch {
      setMessages(prev => prev.map(m => m.id === aiMsg.id ? { ...m, content: 'Something went wrong. Please try again.' } : m));
    } finally { setIsStreaming(false); }
  }, [input, isStreaming, guestCount, messages, activeChatId, API]);

  const logout = () => {
    localStorage.removeItem('token'); localStorage.removeItem('user');
    setUser(null); setChats([]); setMessages([]); setActiveChatId(null);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: sidebarOpen ? '260px' : '0', overflow: 'hidden', transition: 'width 0.25s ease', background: '#fff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '20px' }}>🏥</span>
            <span style={{ fontWeight: 700, fontSize: '15px', color: '#0d9488' }}>SehatSaarthi</span>
          </div>
          <button onClick={newChat} style={{ width: '100%', padding: '9px', background: '#0d9488', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>+ New Chat</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {chats.map(chat => (
            <div key={chat._id} onClick={() => loadChat(chat._id)} style={{ padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '8px', background: activeChatId === chat._id ? '#e1f5ee' : 'transparent' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 500, color: activeChatId === chat._id ? '#0d9488' : '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{chat.title}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{chat.lastMessage}</div>
              </div>
              <button onClick={(e) => deleteChat(chat._id, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#94a3b8', padding: '2px', flexShrink: 0 }}>×</button>
            </div>
          ))}
          {!user && <div style={{ margin: '12px 4px', background: '#e1f5ee', borderRadius: '8px', padding: '12px', fontSize: '12px', color: '#0f6e56', textAlign: 'center' }}><strong>{5 - guestCount}</strong> free messages left</div>}
        </div>
        <div style={{ padding: '12px', borderTop: '1px solid #e2e8f0' }}>
          {user ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#0d9488', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>{user.name?.charAt(0).toUpperCase()}</div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 500, color: '#1e293b' }}>{user.name}</div>
                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>{user.email}</div>
                </div>
              </div>
              <button onClick={logout} style={{ width: '100%', padding: '7px', background: 'none', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: '#64748b' }}>Logout</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <a href="/auth/login" style={{ display: 'block', textAlign: 'center', padding: '8px', background: '#0d9488', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 500 }}>Login</a>
              <a href="/auth/register" style={{ display: 'block', textAlign: 'center', padding: '8px', border: '1px solid #e2e8f0', color: '#64748b', borderRadius: '8px', textDecoration: 'none', fontSize: '13px' }}>Sign up free</a>
            </div>
          )}
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ padding: '12px 16px', background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '6px', width: '32px', height: '32px', cursor: 'pointer', fontSize: '16px' }}>☰</button>
          <span style={{ fontSize: '14px', fontWeight: 500, color: '#1e293b' }}>AI Health Assistant</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
            <a href="/hospitals" style={{ fontSize: '12px', padding: '6px 12px', background: '#e1f5ee', color: '#0d9488', borderRadius: '6px', textDecoration: 'none', fontWeight: 500 }}>🏥 Hospitals</a>
            <a href="/emergency" style={{ fontSize: '12px', padding: '6px 12px', background: '#fee2e2', color: '#ef4444', borderRadius: '6px', textDecoration: 'none', fontWeight: 500 }}>🚨 Emergency</a>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', paddingTop: '60px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🩺</div>
              <h2 style={{ fontSize: '22px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>How can I help you today?</h2>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '28px' }}>Ask about symptoms, medications, find hospitals, or understand your reports.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', maxWidth: '520px', margin: '0 auto' }}>
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} onClick={() => sendMessage(s)} style={{ padding: '12px 14px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', fontSize: '12px', color: '#475569', textAlign: 'left', lineHeight: '1.5' }}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {messages.map(msg => (
            <div key={msg.id} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-start', gap: '8px' }}>
              {msg.role === 'assistant' && <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#e1f5ee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0, marginTop: '4px' }}>🤖</div>}
              <div style={{ maxWidth: '72%', padding: '12px 16px', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: msg.role === 'user' ? '#0d9488' : '#ffffff', color: msg.role === 'user' ? '#ffffff' : '#1e293b', border: msg.role === 'assistant' ? '1px solid #e2e8f0' : 'none', fontSize: '14px', lineHeight: '1.6' }}>
                {msg.role === 'assistant' ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content || '...'}</ReactMarkdown> : msg.content}
              </div>
              {msg.role === 'user' && <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#fff', flexShrink: 0, marginTop: '4px' }}>{user?.name?.charAt(0).toUpperCase() || 'G'}</div>}
            </div>
          ))}

          {isStreaming && messages[messages.length - 1]?.role === 'assistant' && !messages[messages.length - 1]?.content && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#e1f5ee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>🤖</div>
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 16px', display: 'flex', gap: '4px' }}>
                {[0, 1, 2].map(i => <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0d9488', animation: `pulse 1.4s infinite ${i * 0.2}s` }} />)}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div style={{ textAlign: 'center', fontSize: '11px', color: '#94a3b8', padding: '4px 16px', background: '#fafafa', borderTop: '1px solid #f1f5f9' }}>
          SehatSaarthi provides educational information only. Always consult a qualified doctor.
        </div>

        <div style={{ padding: '12px 16px', background: '#fff', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '8px 8px 8px 14px' }}>
            <textarea ref={textareaRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} placeholder="Ask a health question… (Enter to send)" rows={1} style={{ flex: 1, border: 'none', background: 'transparent', resize: 'none', fontSize: '14px', outline: 'none', lineHeight: '1.5', maxHeight: '120px', fontFamily: 'Inter, sans-serif' }} />
            <button onClick={() => sendMessage()} disabled={isStreaming || !input.trim()} style={{ padding: '8px 18px', background: (!isStreaming && input.trim()) ? '#0d9488' : '#e2e8f0', color: (!isStreaming && input.trim()) ? '#fff' : '#94a3b8', border: 'none', borderRadius: '8px', cursor: (!isStreaming && input.trim()) ? 'pointer' : 'default', fontSize: '13px', fontWeight: 500, flexShrink: 0 }}>
              {isStreaming ? '...' : 'Send'}
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '36px', maxWidth: '380px', width: '90%', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: '#1e293b' }}>Free trial ended</h3>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px', lineHeight: '1.6' }}>You've used your 5 free messages. Create a free account to continue.</p>
            <a href="/auth/register" style={{ display: 'block', padding: '13px', background: '#0d9488', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, marginBottom: '10px' }}>Create Free Account</a>
            <a href="/auth/login" style={{ display: 'block', padding: '13px', border: '1px solid #e2e8f0', borderRadius: '10px', textDecoration: 'none', color: '#1e293b', fontSize: '14px' }}>Already have an account? Login</a>
            <button onClick={() => setShowModal(false)} style={{ marginTop: '14px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '13px' }}>Maybe later</button>
          </div>
        </div>
      )}
      <style>{`@keyframes pulse { 0%,60%,100%{transform:translateY(0);opacity:0.6} 30%{transform:translateY(-5px);opacity:1} }`}</style>
    </div>
  );
}
