import React from "react";
import Chat from "./Chat";
import "./App.css";

function App() {
  return (
    <div>
      <h1 className="font-bold text-4xl text-green-600 mb-10">
        Welcome to the Chat App
      </h1>
      <Chat />
    </div>
  );
}

export default App;
