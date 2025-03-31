const socket = require("socket.io");
const Room = require("../Models/Room");
const Message = require("../Models/Messages");

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: { origin: process.env.FRONTEND_URL, Credentials: true },
  });

  io.on("connection", (socket) => {
    console.log("New user connected");

    socket.on("joinRoom", async ({ roomName, userName }) => {
      try {
        if (!roomName || !userName) {
          throw new Error("Room name and username are required");
        }

        // Find or create room
        let room = await Room.findOne({ roomName });
        if (!room) {
          room = await Room.create({ roomName: roomName });
          console.log(`New room created: ${roomName}`);
        }

        // Join the room
        socket.join(roomName);

        // Get previous messages (you might want to add pagination later)
        const messages = await Message.find({ roomId: room._id })
          .sort({ createdAt: 1 })
          .limit(10); // Limit to 50 most recent messages

        // Notify client and room members
        socket.emit("roomJoined", { messages });

        console.log(`${userName} joined room: ${roomName}`);
      } catch (error) {
        console.error("Error joining room:", error);
        socket.emit("error", { message: error.message });
      }
    });

    socket.on("sendMessage", async ({ roomName, msg, userName }) => {
      try {
        if (!roomName || !msg || !userName) {
          throw new Error("Room name, message, and username are required");
        }

        // Find the room
        const room = await Room.findOne({ roomName });
        if (!room) {
          throw new Error("Room not found");
        }

        // Create new message document
        const newMessage = await Message.create({
          roomId: room._id,
          message: {
            userName: userName,
            msg: msg,
          },
        });

        //send the message to the room we will handle this event in frontend to display messages
        io.to(roomName).emit("messageReceived", {
          userName: newMessage.message.userName,
          msg: newMessage.message.msg,
          createdAt: newMessage.createdAt,
        });

        console.log(`Message received in ${roomName} from ${userName}`);
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: error.message });
      }
    });

    socket.on("disconnect", () => {});
  });
};

module.exports = initializeSocket;
