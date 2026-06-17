import { io } from "socket.io-client";

export const socket = io("/", {
  path: "/socket.io",
  withCredentials: true,
  transports: ["websocket", "polling"],
});

export default socket;