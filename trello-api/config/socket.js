const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { db } = require("../firebase");

let io;
const boardsCollection = db.collection("boards");

// Check quyền: user có trong members của board?
async function canAccessBoard(userId, boardId) {
    try {
        if (!userId || !boardId) return false;
        const snap = await boardsCollection.doc(boardId).get();
        if (!snap.exists) return false;
        const data = snap.data() || {};
        const members = Array.isArray(data.members) ? data.members : [];
        console.log("members", members);
        console.log("userId", userId);
        console.log("boardId", boardId);
        // Nếu bạn có roles/owner, có thể mở rộng logic ở đây
        return members.includes(userId);
    } catch (err) {
        console.error("[canAccessBoard] error:", err?.message || err);
        return false;
    }
}

function initIO(httpServer) {
    io = new Server(httpServer, {
        cors: { origin: "*", methods: ["GET", "POST"] },
    });

    io.on("connection", (socket) => {
        // 1. Xác thực user (ví dụ qua token trong query/header)
        try {
            const token = socket.handshake.auth?.token || socket.handshake.query?.token;
            if (token) {
                const payload = jwt.verify(token, process.env.JWT_SECRET);
                socket.data.userId = payload.id;
                // room user:<id> để gửi riêng theo user
                socket.join(`user:${payload.id}`);
            }
        } catch (err) {
            // không kill socket để vẫn allow anonymous nếu bạn muốn
            console.error("[Socket Auth] invalid token:", err?.message || err);
        }

        // 2. Client yêu cầu join 1 board
        socket.on("boards:join", async ({ boardId }) => {
            try {
                // TODO: thay bằng check thực tế trong DB xem user có trong board không
                const userId = socket.data.userId;
                const hasAccess = await canAccessBoard(userId, boardId); 
                if (!hasAccess) return socket.emit("boards:join:denied", { boardId });

                socket.join(`board:${boardId}`);
                socket.emit("boards:join:ok", { boardId });
            } catch (e) {
                console.error("[boards:join] error:", e?.message || e);
            }
        });

        // 3. Rời board
        socket.on("boards:leave", ({ boardId }) => {
            socket.leave(`board:${boardId}`);
            socket.emit("boards:leave:ok", { boardId });
        });

        // 4. (tuỳ chọn) join 1 card trong board
        socket.on("cards:join", async ({ boardId, cardId }) => {
            try {
                const userId = socket.data.userId;
                const hasAccess = await canAccessBoard(userId, boardId);
                if (!hasAccess) return socket.emit("cards:join:denied", { boardId, cardId });

                socket.join(`card:${boardId}:${cardId}`);
                socket.emit("cards:join:ok", { boardId, cardId });
            } catch (e) {
                console.error("[cards:join] error:", e?.message || e);
            }
        });

        socket.on("cards:leave", ({ boardId, cardId }) => {
            socket.leave(`card:${boardId}:${cardId}`);
            socket.emit("cards:leave:ok", { boardId, cardId });
        });
    });

    return io;
}

function getIO() {
    if (!io) throw new Error("Socket.IO not initialized");
    return io;
}

// Helpers emit theo room
function emitToBoard(boardId, event, payload) {
    try {
        getIO().to(`board:${boardId}`).emit(event, payload);
    } catch (err) {
        console.error(`[Socket Emit Error] ${event} -> board:${boardId}`, { payload, error: err?.message || err });
    }
}

function emitToUser(userId, event, payload) {
    try {
        getIO().to(`user:${userId}`).emit(event, payload);
    } catch (err) {
        console.error(`[Socket Emit Error] ${event} -> user:${userId}`, { payload, error: err?.message || err });
    }
}

function emitToCard(boardId, cardId, event, payload) {
    try {
        getIO().to(`card:${boardId}:${cardId}`).emit(event, payload);
    } catch (err) {
        console.error(`[Socket Emit Error] ${event} -> card:${boardId}:${cardId}`, { payload, error: err?.message || err });
    }
}

module.exports = { initSocket: initIO, getIO, emitToBoard, emitToUser, emitToCard };
