import io from "socket.io-client";
export const createSocketConnection = () => io(import.meta.env.VITE_BASE_URL);
