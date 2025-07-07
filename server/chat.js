let maleQueue = [];
let femaleQueue = [];

function removeFromQueue(queue, socket) {
  return queue.filter(s => s.id !== socket.id);
}

function setupChat(io) {
  io.on('connection', (socket) => {
    let userGender = null;
    let pairedRoom = null;

    function joinQueue(gender) {
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
    }

    socket.on('join', ({ gender }) => {
      userGender = gender;
      joinQueue(gender);
    });

    socket.on('skip', ({ gender }) => {
      // Remove from queues
      maleQueue = removeFromQueue(maleQueue, socket);
      femaleQueue = removeFromQueue(femaleQueue, socket);
      // Leave current room
      if (pairedRoom) {
        socket.leave(pairedRoom);
        pairedRoom = null;
      }
      // Rejoin queue
      joinQueue(gender);
    });

    socket.on('message', ({ room, message }) => {
      io.to(room).emit('message', { sender: socket.id, message });
    });

    socket.on('disconnect', () => {
      maleQueue = removeFromQueue(maleQueue, socket);
      femaleQueue = removeFromQueue(femaleQueue, socket);
    });
  });
}

module.exports = setupChat; 