const { evaluateMessageSafety } = require('./safety');
const { getRandomIcebreaker } = require('./icebreakers');

let maleQueue = [];
let femaleQueue = [];

// Track paired partners: socketId -> partnerId
const partners = {};

function removeFromQueue(queue, socket) {
  return queue.filter(s => s.id !== socket.id);
}

function setupChat(io) {
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    let userGender = null;
    let pairedRoom = null;

    function pairUsers(socketA, socketB) {
      const room = `room-${socketA.id}-${socketB.id}`;
      socketA.join(room);
      socketB.join(room);
      const icebreaker = getRandomIcebreaker();
      io.to(room).emit('chatStart', { room, icebreaker });
      partners[socketA.id] = socketB.id;
      partners[socketB.id] = socketA.id;
      return room;
    }


    function joinQueue(gender) {
      if (gender === 'male') {
        if (femaleQueue.length > 0) {
          const partner = femaleQueue.shift();
          pairedRoom = pairUsers(socket, partner);
        } else {
          maleQueue.push(socket);
          socket.emit('waiting');
        }
      } else if (gender === 'female') {
        if (maleQueue.length > 0) {
          const partner = maleQueue.shift();
          pairedRoom = pairUsers(socket, partner);
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
      // Notify partner they were skipped
      if (pairedRoom) {
        const partnerId = partners[socket.id];
        if (partnerId) {
          io.to(partnerId).emit('partnerSkipped');
          delete partners[partnerId];
        }
        delete partners[socket.id];
        socket.leave(pairedRoom);
        pairedRoom = null;
      }
      // Remove from queues in case still waiting
      maleQueue = removeFromQueue(maleQueue, socket);
      femaleQueue = removeFromQueue(femaleQueue, socket);
      // Rejoin queue
      joinQueue(gender);
    });

    socket.on('message', ({ room, message }) => {
      const safetyResult = evaluateMessageSafety(message);
      if (!safetyResult.isAllowed) {
        socket.emit('messageWarning', { warning: safetyResult.warning });
        io.to(room).emit('message', { sender: socket.id, message: safetyResult.sanitizedText });
      } else {
        io.to(room).emit('message', { sender: socket.id, message });
      }
    });


    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      maleQueue = removeFromQueue(maleQueue, socket);
      femaleQueue = removeFromQueue(femaleQueue, socket);
      // Notify partner of disconnection
      const partnerId = partners[socket.id];
      if (partnerId) {
        io.to(partnerId).emit('partnerDisconnected');
        delete partners[partnerId];
      }
      delete partners[socket.id];
    });
  });
}

module.exports = setupChat; 