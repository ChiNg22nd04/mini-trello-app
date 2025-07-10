// server.js
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

require("dotenv").config();
const app = express();
const server = http.createServer(app);

// Tạo socket server
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    },
});

// Middlewares
app.use(cors());
app.use(express.json());

// Routers
const routers = require("./routes");
app.use("/", routers);

// Socket.IO logic
io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("joinCard", (cardId) => {
        socket.join(cardId);
        console.log(`User joined room: ${cardId}`);
    });

    socket.on("taskUpdated", ({ cardId, task }) => {
        socket.to(cardId).emit("taskUpdated", task);
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
