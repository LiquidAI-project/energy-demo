// eslint-disable-next-line no-undef
const ORCHESTRATOR_HOST = import.meta.env.VITE_ORCHESTRATOR_HOST;
// eslint-disable-next-line no-undef
const ORCHESTRATOR_PORT = import.meta.env.VITE_ORCHESTRATOR_PORT;

const parsedHost = (ORCHESTRATOR_HOST || "").replace(/^https?:\/\//, "");
const socketUrl = parsedHost && ORCHESTRATOR_PORT
  ? `wss://${parsedHost}:${ORCHESTRATOR_PORT}/ws/logs`
  : null;

const socket = socketUrl
  ? new WebSocket(socketUrl)
  : {
      addEventListener: () => {},
      removeEventListener: () => {},
      close: () => {},
    };

if (socketUrl) {
  socket.onopen = () => {
    console.log("✅ Connected to WebSocket server");
  };

  socket.onclose = () => {
    console.log("⚠️ WebSocket connection closed");
  };

  socket.onerror = (err) => {
    console.error("❌ WebSocket error:", err);
  };
} else {
  console.warn("WebSocket disabled: missing VITE_ORCHESTRATOR_HOST or VITE_ORCHESTRATOR_PORT");
}

export default socket;