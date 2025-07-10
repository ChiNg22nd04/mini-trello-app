// socket.js
let io = null;

function initSocket(server) {
    const { Server } = require("socket.io");
    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"],
        },
    });

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

    return io;
}

function getIO() {
    if (!io) {
        throw new Error("Socket.IO not initialized");
    }
    return io;
}

module.exports = { initSocket, getIO };
