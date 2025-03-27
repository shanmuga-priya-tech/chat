const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const initializeSocket = require("./utils/socket");

const connectDB = require("./config/database");
require("dotenv").config();

const app = express();

const server = http.createServer(app);
initializeSocket(server);

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

connectDB()
  .then(() => {
    console.log("Database connection established...");
    server.listen(process.env.PORT, () => {
      console.log("Server is running on port", process.env.PORT);
    });
  })
  .catch((err) => {
    console.error("Database connection failed!", err);
  });
