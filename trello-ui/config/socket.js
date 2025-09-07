import { io } from "socket.io-client";
import API_BASE_URL from "./config";

const socket = io(API_BASE_URL, {
    transports: ["websocket"],
    withCredentials: true,
    auth: { token: localStorage.getItem("accessToken") || "" },
    autoConnect: true,
});

socket.on("connect", () => {
    console.log("Socket connected with id:", socket.id);
});

// Helper to refresh auth token at runtime
socket.setAuthToken = (token) => {
    try {
        socket.auth = { token: token || "" };
        if (socket.connected) socket.disconnect();
        socket.connect();
    } catch (e) {
        console.error("[socket] setAuthToken error", e);
    }
};

export default socket;
