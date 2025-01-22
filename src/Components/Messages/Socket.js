import { io } from "socket.io-client";
import { BASE_URL } from "../Urls/Urls";

const socket = io(BASE_URL, {
  autoConnect: false, // We will manually control the connection
  withCredentials: true,  // Ensure credentials (cookies) are sent
  transports: ['websocket'],  // Use WebSocket transport for better performance
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.warn("Socket disconnected:", reason);
});

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error);
});

// Debug event listeners
socket.on("error", (error) => {
  console.error("Socket error:", error);
});

socket.onAny((event, ...args) => {
  console.log("Socket event:", event, args);
});

export default socket;
