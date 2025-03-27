import React, { useEffect, useState, useRef } from "react";
import { createSocketConnection } from "../utils/socket";

function Chat() {
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([]);
  const [room, setRoom] = useState("");
  const [username, setUsername] = useState("");
  const [showChat, setShowChat] = useState(false);

  const socketRef = useRef(null); // ✅ Store socket instance in a ref

  // console.log(messages);

  useEffect(() => {
    socketRef.current = createSocketConnection(); // ✅ Create socket once
    const socket = socketRef.current;

    socket.on("messageReceived", ({ message, username }) => {
      setMessages((prev) => [...prev, { message, username }]);
    });

    return () => {
      socket.disconnect(); // ✅ Disconnect only on unmount
    };
  }, []);

  const joinRoom = () => {
    if (room && username) {
      socketRef.current.emit("joinRoom", { room, username });
      socketRef.current.on("usernameError", (error) => alert(error));
      socketRef.current.on("roomJoined", () => {
        setShowChat(true);
      });
    }
  };

  const sendMessage = () => {
    if (msg) {
      socketRef.current.emit("sendMessage", { room, message: msg, username });
      setMsg("");
    }
  };

  return (
    <div className="flex justify-center gap-4 flex-col w-[700px] mx-auto">
      {!showChat && (
        <div className="flex justify-between">
          <input
            className="p-4 text-green-700 bg-green-100 outline-green-600 rounded-xl text-xl"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="Enter Room Name"
          />
          <input
            className="p-4 bg-green-100 outline-green-600 rounded-xl text-xl text-green-700"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter Your Name"
          />
          <button
            className="py-3 px-5 rounded-2xl cursor-pointer bg-green-700 hover:bg-green-600 font-mono text-xl text-white"
            onClick={joinRoom}
          >
            Join Room
          </button>
        </div>
      )}
      {showChat && (
        <div className="flex flex-col border border-gray-500 h-[70vh] w-[650px] rounded-lg">
          <div className="flex-1 ">
            {messages.map((msg, i) => (
              <div
                key={i}
                className="p-4 mx-2 my-4 flex justify-start border border-green-600 rounded-xl bg-green-50 text-lg w-fit max-w-[80%]"
              >
                <strong className="text-black">{msg.username}: </strong>
                {msg.message}
              </div>
            ))}
          </div>
          <div className="px-5 pb-5 flex gap-5 justify-center">
            <input
              className="p-4 flex-1 bg-green-100 border-2 outline-green-600 border-green-600 rounded-xl text-xl"
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="Type a message"
            />
            <button
              className="py-3 px-5 rounded-2xl cursor-pointer bg-green-700 hover:bg-green-600 font-mono text-xl text-white"
              onClick={sendMessage}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;
