const express = require("express");
const pool = require("./db/config");
const userRoutes = require("./routes/UserRoute");
const messageRoutes = require("./routes/ChatRoute");
const contactRoutes = require("./routes/contacts");
const cors = require("cors");
const middleware = require("./middleware/auth");
const initDB = require("./db/init");
const http = require('http');
const { Server } = require('socket.io');


const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });  


app.use(cors())
app.use(express.json());
app.use((req, res, next) => {
    req.db = pool;
    next();
});

app.use('/api/users', userRoutes);
app.use('/api/contacts', middleware, contactRoutes)
app.use('/api/messages', middleware, messageRoutes);

const port = process.env.PORT || 3000;
initDB()

// socket auth middleware
io.use(async (socket, next) => {
  const token = socket.handshake.auth && socket.handshake.auth.token;
  if (!token) return next(new Error('Auth error'));
  try {
    const jwt = require('jsonwebtoken');
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = payload;
    return next();
  } catch (err) {
    return next(new Error('Auth error'));
  }
});

io.on('connection', (socket) => {
  console.log('socket connected:', socket.user.id);
  const user_socket_room = `user_${socket.user.id}`;
  socket.join(user_socket_room);

  socket.on('join_conversation', (conversationId) => {
    socket.join(`conv_${conversationId}`);
  });

  socket.on('message_send', async (payload) => {
    try {
      const { receiver_id, message } = payload;
      const sender_id = socket.user.id;

      if (!receiver_id || !message) {
        console.error('message_send payload is missing receiver_id or message');
        return;
      }

      const insert = `
        INSERT INTO messages (sender_id, receiver_id, message)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      const values = [sender_id, receiver_id, message];
      const result = await pool.query(insert, values);
      const savedMessage = result.rows[0];
      
      const sender_room = `user_${sender_id}`;
      const receiver_room = `user_${receiver_id}`;

      io.to(sender_room).to(receiver_room).emit('message_receive', savedMessage);

    } catch (err) {
      console.error('socket message error', err);
    }
  });

  socket.on('typing', ({ conversationId, isTyping }) => {
    socket.to(`conv_${conversationId}`).emit('typing', { userId: socket.user.id, isTyping });
  });

  socket.on('disconnect', () => {});
});

server.listen(port, () => {
  console.log('Server listening on', port);
  console.log(`http://localhost:${port}`);
});