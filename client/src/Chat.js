import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import BearLogo from './bear-logo.svg';

const SOCKET_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';
const socket = io(SOCKET_URL);

function Chat({ gender, onLogout }) {
  const [room, setRoom] = useState(null);
  const [waiting, setWaiting] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [showWarning, setShowWarning] = useState(true);
  const [partnerStatus, setPartnerStatus] = useState(null); // 'disconnected' | 'skipped'
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.emit('join', { gender });

    socket.on('waiting', () => setWaiting(true));

    socket.on('chatStart', ({ room }) => {
      setRoom(room);
      setWaiting(false);
      setMessages([]);
      setPartnerStatus(null);
    });

    socket.on('message', ({ sender, message }) => {
      setMessages(msgs => [...msgs, { sender, message }]);
    });

    socket.on('partnerDisconnected', () => {
      setPartnerStatus('disconnected');
    });

    socket.on('partnerSkipped', () => {
      setPartnerStatus('skipped');
    });

    return () => {
      socket.off('waiting');
      socket.off('chatStart');
      socket.off('message');
      socket.off('partnerDisconnected');
      socket.off('partnerSkipped');
    };
  }, [gender]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (input.trim() && room && !partnerStatus) {
      socket.emit('message', { room, message: input.trim() });
      setInput('');
    }
  };

  const skipChat = () => {
    setMessages([]);
    setWaiting(true);
    setRoom(null);
    setPartnerStatus(null);
    socket.emit('skip', { gender });
  };

  const findNew = () => {
    setMessages([]);
    setWaiting(true);
    setRoom(null);
    setPartnerStatus(null);
    socket.emit('skip', { gender });
  };

  return (
    <div style={{ fontFamily: 'Segoe UI,Arial,sans-serif', background: '#f0f0f8', minHeight: '100vh' }}>
      {/* Warning Modal */}
      {showWarning && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: 32, borderRadius: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.2)', maxWidth: 340, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🐻</div>
            <h2 style={{ marginBottom: 10, color: '#1a1a2e' }}>Chat Responsibly</h2>
            <p style={{ color: '#555', marginBottom: 20, lineHeight: 1.5 }}>
              Please be respectful. Harassment, hate speech, or inappropriate content is not tolerated and may result in a permanent ban.
            </p>
            <button
              onClick={() => setShowWarning(false)}
              style={{ background: 'linear-gradient(135deg,#6c63ff,#5a52d5)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 28px', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}
            >
              I Understand
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src={BearLogo} alt="UniChat" style={{ width: 40, height: 40 }} />
          <span style={{ fontWeight: 800, fontSize: 22, color: '#1a1a2e', letterSpacing: 1 }}>UniChat</span>
        </div>
        <button
          onClick={onLogout}
          style={{ background: 'none', border: '1.5px solid #ddd', borderRadius: 8, padding: '6px 14px', color: '#888', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
        >
          Log out
        </button>
      </header>

      {/* Chat Container */}
      <div style={{ maxWidth: 480, margin: '28px auto', background: '#fff', borderRadius: 20, boxShadow: '0 4px 32px rgba(0,0,0,0.10)', overflow: 'hidden' }}>

        {/* Status Bar */}
        <div style={{ background: 'linear-gradient(135deg,#6c63ff,#5a52d5)', padding: '12px 20px', color: '#fff', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: waiting ? '#ffd166' : '#06d6a0', display: 'inline-block', flexShrink: 0 }} />
          {waiting
            ? `Waiting for a ${gender === 'male' ? 'female' : 'male'} to join...`
            : partnerStatus
              ? partnerStatus === 'disconnected' ? '⚠️ Stranger disconnected' : '⚠️ Stranger skipped'
              : `💬 Connected with a ${gender === 'male' ? 'female' : 'male'} stranger`
          }
        </div>

        {/* Messages */}
        <div style={{ height: 320, overflowY: 'auto', padding: '16px 16px 8px 16px', background: '#f8f8fc' }}>
          {waiting && !partnerStatus && (
            <div style={{ textAlign: 'center', color: '#aaa', marginTop: 80 }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div>
              <p>Looking for someone to chat with...</p>
            </div>
          )}
          {!waiting && messages.length === 0 && !partnerStatus && (
            <div style={{ textAlign: 'center', color: '#aaa', marginTop: 80 }}>
              <p>Say hello! 👋</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: msg.sender === socket.id ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
              <div style={{
                background: msg.sender === socket.id ? 'linear-gradient(135deg,#6c63ff,#5a52d5)' : '#e8e8f0',
                color: msg.sender === socket.id ? '#fff' : '#222',
                borderRadius: msg.sender === socket.id ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                padding: '8px 14px',
                maxWidth: '72%',
                wordBreak: 'break-word',
                fontSize: 15,
                lineHeight: 1.4,
              }}>
                <span style={{ fontSize: 11, opacity: 0.7, display: 'block', marginBottom: 2 }}>
                  {msg.sender === socket.id ? 'You' : 'Stranger'}
                </span>
                {msg.message}
              </div>
            </div>
          ))}
          {/* Partner status banner */}
          {partnerStatus && (
            <div style={{ textAlign: 'center', margin: '16px 0', color: '#e74c3c', fontSize: 14, fontWeight: 600 }}>
              {partnerStatus === 'disconnected' ? 'Stranger has left the chat.' : 'Stranger skipped you.'}
              <br />
              <button onClick={findNew} style={{ marginTop: 8, background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                Find New Chat
              </button>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} style={{ display: 'flex', gap: 8, padding: 16, borderTop: '1px solid #f0f0f0', background: '#fff' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={waiting || !!partnerStatus}
            placeholder={waiting ? 'Waiting for partner...' : partnerStatus ? 'Chat ended' : 'Type a message...'}
            style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e0e0e0', fontSize: 15, outline: 'none', background: (waiting || partnerStatus) ? '#f8f8f8' : '#fff' }}
          />
          <button
            type="submit"
            disabled={waiting || !!partnerStatus || !input.trim()}
            style={{ background: 'linear-gradient(135deg,#6c63ff,#5a52d5)', color: '#fff', border: 'none', borderRadius: 10, padding: '0 16px', fontWeight: 700, fontSize: 15, cursor: 'pointer', opacity: (waiting || partnerStatus || !input.trim()) ? 0.5 : 1 }}
          >
            Send
          </button>
          <button
            type="button"
            onClick={skipChat}
            disabled={!!partnerStatus}
            style={{ background: 'linear-gradient(135deg,#ff6b6b,#ee5a24)', color: '#fff', border: 'none', borderRadius: 10, padding: '0 16px', fontWeight: 700, fontSize: 15, cursor: 'pointer', opacity: partnerStatus ? 0.5 : 1 }}
          >
            Skip
          </button>
        </form>
      </div>
    </div>
  );
}

export default Chat; 