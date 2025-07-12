import { io } from "socket.io-client";
import API_BASE_URL from "./config";

const socket = io(API_BASE_URL, {
    transports: ["websocket"],
    withCredentials: true,
});

socket.on("connect", () => {
    console.log("✅ Socket connected with id:", socket.id);
});

export default socket;
