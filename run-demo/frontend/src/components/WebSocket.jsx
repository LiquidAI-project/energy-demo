const socket = new WebSocket("wss://orchestrator.tlt-cityiot.rd.tuni.fi:443/");

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