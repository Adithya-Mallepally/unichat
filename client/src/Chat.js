import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import BearLogo from './bear-logo.svg';

const socket = io('https://unichat-production-62b0.up.railway.app');

function Chat({ gender }) {
  const [room, setRoom] = useState(null);
  const [waiting, setWaiting] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [showWarning, setShowWarning] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.emit('join', { gender });
    socket.on('waiting', () => setWaiting(true));
    socket.on('chatStart', ({ room }) => {
      setRoom(room);
      setWaiting(false);
      setMessages([]);
    });
    socket.on('message', ({ sender, message }) => {
      setMessages(msgs => [...msgs, { sender, message }]);
    });
    return () => {
      socket.off('waiting');
      socket.off('chatStart');
      socket.off('message');
    };
  }, [gender]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (input && room) {
      socket.emit('message', { room, message: input });
      setInput('');
    }
  };

  const skipChat = () => {
    setMessages([]);
    setWaiting(true);
    setRoom(null);
    socket.emit('skip', { gender });
  };

  return (
    <div style={{fontFamily:'Segoe UI,Arial,sans-serif',background:'#f7f7fa',minHeight:'100vh'}}>
      {showWarning && (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'#0008',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#fff',padding:32,borderRadius:16,boxShadow:'0 4px 24px #0003',maxWidth:340,textAlign:'center'}}>
            <h2 style={{marginBottom:12}}>Respectful Chat</h2>
            <p style={{color:'#444',marginBottom:18}}>Please chat respectfully. Bad behavior, harassment, or inappropriate language is not tolerated and may result in a ban.</p>
            <button onClick={()=>setShowWarning(false)} style={{background:'#6c63ff',color:'#fff',border:'none',borderRadius:8,padding:'8px 24px',fontWeight:600,fontSize:16,cursor:'pointer'}}>I Understand</button>
          </div>
        </div>
      )}
      <header style={{display:'flex',alignItems:'center',justifyContent:'center',padding:'24px 0 12px 0',background:'#fff',boxShadow:'0 2px 8px #0001'}}>
        <img src={BearLogo} alt="Bear Logo" style={{width:48,height:48,marginRight:16}} />
        <h1 style={{fontWeight:700,letterSpacing:1,fontSize:28,margin:0,color:'#333'}}>UniChat</h1>
      </header>
      <div style={{maxWidth:420,margin:'32px auto',background:'#fff',borderRadius:16,boxShadow:'0 4px 24px #0002',padding:24}}>
        <p style={{textAlign:'center',color:'#888'}}>Your gender: <b>{gender}</b>. You will be paired with a <b>{gender === 'male' ? 'female' : 'male'}</b>.</p>
        {waiting ? (
          <p style={{textAlign:'center',color:'#666'}}>Waiting for an opposite gender to join...</p>
        ) : (
          <div>
            <div style={{height:220,overflowY:'auto',marginBottom:12,background:'#f3f3f7',borderRadius:8,padding:12}}>
              {messages.map((msg, i) => (
                <div key={i} style={{textAlign: msg.sender === socket.id ? 'right' : 'left',margin:'6px 0'}}>
                  <span style={{display:'inline-block',background:msg.sender === socket.id?'#d1e7dd':'#e2e3e5',color:'#222',borderRadius:8,padding:'6px 12px',maxWidth:'70%',wordBreak:'break-word'}}>
                    <b>{msg.sender === socket.id ? 'You' : 'Stranger'}:</b> {msg.message}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={sendMessage} style={{display:'flex',gap:8}}>
              <input value={input} onChange={e => setInput(e.target.value)} style={{flex:1,padding:10,borderRadius:8,border:'1px solid #ccc',fontSize:16}} placeholder="Type your message..." />
              <button type="submit" style={{background:'#6c63ff',color:'#fff',border:'none',borderRadius:8,padding:'0 18px',fontWeight:600,fontSize:16,cursor:'pointer'}}>Send</button>
              <button type="button" onClick={skipChat} style={{background:'#ff6b6b',color:'#fff',border:'none',borderRadius:8,padding:'0 18px',fontWeight:600,fontSize:16,cursor:'pointer'}}>Skip</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat; 