const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
  roomName: { type: String, unique: true, required: true, index: true },
});

module.exports = mongoose.model("Room", RoomSchema);
