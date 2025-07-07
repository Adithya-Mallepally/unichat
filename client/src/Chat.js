import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

function Chat({ gender }) {
  const [room, setRoom] = useState(null);
  const [waiting, setWaiting] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
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

  return (
    <div>
      <h2>Random Chat</h2>
      <p>Your gender: <b>{gender}</b>. You will be paired with a <b>{gender === 'male' ? 'female' : 'male'}</b>.</p>
      {waiting ? (
        <p>Waiting for an opposite gender to join...</p>
      ) : (
        <div style={{border:'1px solid #ccc', padding:10, maxWidth:400}}>
          <div style={{height:200, overflowY:'auto', marginBottom:10}}>
            {messages.map((msg, i) => (
              <div key={i} style={{textAlign: msg.sender === socket.id ? 'right' : 'left'}}>
                <b>{msg.sender === socket.id ? 'You' : 'Stranger'}:</b> {msg.message}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={sendMessage} style={{display:'flex'}}>
            <input value={input} onChange={e => setInput(e.target.value)} style={{flex:1}} />
            <button type="submit">Send</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Chat; 