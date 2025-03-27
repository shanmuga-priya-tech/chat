const mongoose = require("mongoose");

const connectDB = async () => {
  console.log(process.env.DB_CONNECTION_STRING);
  await mongoose.connect(process.env.DB_CONNECTION_STRING);
};

module.exports = connectDB;
