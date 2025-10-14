const socket = new WebSocket("wss://130.230.52.191:4001");

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