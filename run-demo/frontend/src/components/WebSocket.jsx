const PUBLIC_HOST = import.meta.env.VITE_PUBLIC_HOST;
const PUBLIC_PORT = import.meta.env.VITE_PUBLIC_PORT;
const SOCKET_URL= `${PUBLIC_HOST}:${PUBLIC_PORT}`;

const socket = new WebSocket(`wss://${SOCKET_URL}`);

socket.onopen = () => {
  console.log("✅ Connected to WebSocket server");
};

socket.onclose = () => {
    console.log("⚠️ WebSocket connection closed");
};

socket.onerror = (err) => {
    console.error("❌ WebSocket error:", err);
};

export default socket;