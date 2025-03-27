const socket = require("socket.io");
const users = new Set();

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: { origin: process.env.FRONTEND_URL, Credential: true },
  });

  io.on("connection", (socket) => {
    console.log("New user connected");

    socket.on("joinRoom", ({ room, username }) => {
      if (users.has(username)) {
        socket.emit(
          "usernameError",
          "Username already taken. Please choose another."
        );
        return;
      }
      users.add(username);
      socket.join(room);
      socket.emit("roomJoined"); // Notify client of successful join

      console.log(`${username} joined room: ${room}`);
    });

    socket.on("sendMessage", ({ room, message, username }) => {
      io.to(room).emit("messageReceived", { message, username });
      console.log("messageRecieved event is emitted from backend");
    });

    socket.on("disconnect", () => {});
  });
};

module.exports = initializeSocket;
