import React, { useState } from 'react';
import Chat from './Chat';

function App() {
  const [gender, setGender] = useState('');

  if (!gender) {
    return (
      <div style={{textAlign:'center', marginTop:50}}>
        <h2>Choose your gender to start chatting</h2>
        <button onClick={() => setGender('male')}>Male</button>
        <button onClick={() => setGender('female')}>Female</button>
      </div>
    );
  }

  return <Chat gender={gender} />;
}

export default App;
