import React, { useEffect, useState, useRef } from "react";
import { createSocketConnection } from "../utils/socket";

function Chat() {
  const [msg, setMsg] = useState("");
  const [roomName, setRoomName] = useState(
    localStorage.getItem("roomName") || ""
  );
  const [userName, setUserName] = useState(
    localStorage.getItem("userName") || ""
  );
  const [prevMsgs, setPrevMsgs] = useState([]);
  const [showChat, setShowChat] = useState(
    localStorage.getItem("showChat") === "true"
  );

  //useRefs for referencing div
  const socketRef = useRef(null); // ✅ Store socket instance in a ref
  const messagesContainerRef = useRef(null);

  //fn to move older msgs automatically when new msgs are added
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  // 🔴 Auto-scroll to latest message when messages update
  useEffect(() => {
    scrollToBottom();
  }, [prevMsgs]);

  useEffect(() => {
    if (showChat && roomName && userName) {
      socketRef.current = createSocketConnection();
      const socket = socketRef.current;

      socket.emit("joinRoom", { roomName, userName });

      socket.on("roomJoined", ({ messages }) => {
        const formattedMessages = messages.map((msg) => ({
          userName: msg.message.userName,
          msg: msg.message.msg,
          createdAt: msg.createdAt,
        }));
        setPrevMsgs(formattedMessages);
      });

      socket.on("messageReceived", ({ userName, msg, createdAt }) => {
        setPrevMsgs((prev) =>
          [...prev, { userName, msg, createdAt }].slice(-50)
        );
        setTimeout(scrollToBottom, 100);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [showChat, roomName, userName]);

  const joinRoom = () => {
    localStorage.setItem("roomName", roomName);
    localStorage.setItem("userName", userName);
    localStorage.setItem("showChat", "true");

    socketRef?.current?.on("error", (error) => console.log(error));

    setShowChat(true);
  };

  const sendMessage = () => {
    if (msg) {
      socketRef.current.emit("sendMessage", {
        roomName,
        msg,
        userName,
      });
      setMsg("");
    }
  };

  const leaveChat = () => {
    localStorage.removeItem("roomName");
    localStorage.removeItem("userName");
    localStorage.removeItem("showChat");

    setRoomName("");
    setUserName("");
    setPrevMsgs([]);
    setShowChat(false);

    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  };

  return (
    <div className="flex justify-center gap-4 flex-col w-[700px] mx-auto">
      {!showChat && (
        <div className="flex justify-between ">
          <input
            className="p-4 text-green-700 bg-green-100 outline-green-600 rounded-xl text-xl"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Enter Room Name"
          />
          <input
            className="p-4 bg-green-100 outline-green-600 rounded-xl text-xl text-green-700"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
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
        <div className="flex flex-col border border-gray-500 h-[80vh] w-[650px] rounded-lg">
          <div className="flex font-bold text-3xl bg-green-50 p-2 text-pink-600 capitalize justify-center ">
            {roomName} Room
          </div>
          <div
            className="flex-1 overflow-y-auto h-[60vh] px-4"
            ref={messagesContainerRef}
          >
            {prevMsgs?.map((msg, i) => (
              <div
                key={i}
                className="p-4 mx-2 my-4 flex justify-start border border-green-600 rounded-xl bg-green-50 text-lg w-fit max-w-[80%]"
              >
                <strong className="text-black pr-2">{msg.userName}: </strong>
                {msg.msg}
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
            <button
              className="py-3 px-5 rounded-2xl cursor-pointer bg-red-700 hover:bg-red-600 font-mono text-xl text-white"
              onClick={leaveChat}
            >
              Leave Chat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;
