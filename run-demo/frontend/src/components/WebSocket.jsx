// eslint-disable-next-line no-undef
const ORCHESTRATOR_HOST = import.meta.env.VITE_ORCHESTRATOR_HOST;
// eslint-disable-next-line no-undef
const ORCHESTRATOR_PORT = import.meta.env.VITE_ORCHESTRATOR_PORT;

const SOCKET_URL= `${ORCHESTRATOR_HOST.split("//")[1]}:${ORCHESTRATOR_PORT}`;
console.log(`ws://${SOCKET_URL}/ws/logs`);
const socket = new WebSocket(`ws://${SOCKET_URL}/ws/logs`);

socket.onopen = () => {
  console.log("✅ Connected to WebSocket server");
};

socket.onclose = (event) => {
    console.log("⚠️ WebSocket connection closed");
};

socket.onerror = (err) => {
    console.error("❌ WebSocket error:", err);
};

export default socket;