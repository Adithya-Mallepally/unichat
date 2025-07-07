let maleQueue = [];
let femaleQueue = [];

function setupChat(io) {
  io.on('connection', (socket) => {
    let userGender = null;
    let pairedRoom = null;

    socket.on('join', ({ gender }) => {
      userGender = gender;
      if (gender === 'male') {
        if (femaleQueue.length > 0) {
          const partner = femaleQueue.shift();
          const room = `room-${partner.id}-${socket.id}`;
          socket.join(room);
          partner.join(room);
          io.to(room).emit('chatStart', { room });
          pairedRoom = room;
        } else {
          maleQueue.push(socket);
          socket.emit('waiting');
        }
      } else if (gender === 'female') {
        if (maleQueue.length > 0) {
          const partner = maleQueue.shift();
          const room = `room-${partner.id}-${socket.id}`;
          socket.join(room);
          partner.join(room);
          io.to(room).emit('chatStart', { room });
          pairedRoom = room;
        } else {
          femaleQueue.push(socket);
          socket.emit('waiting');
        }
      }
    });

    socket.on('message', ({ room, message }) => {
      io.to(room).emit('message', { sender: socket.id, message });
    });

    socket.on('disconnect', () => {
      if (userGender === 'male') {
        maleQueue = maleQueue.filter(s => s.id !== socket.id);
      } else if (userGender === 'female') {
        femaleQueue = femaleQueue.filter(s => s.id !== socket.id);
      }
    });
  });
}

module.exports = setupChat; 