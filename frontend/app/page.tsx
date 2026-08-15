"use client";

import { useEffect, useState } from "react";

const BACKEND = "http://10.107.148.149";

export default function Page() {
  const [signal, setSignal] = useState("NONE");

  // 🔁 Get signal from backend
  useEffect(() => {
    const interval = setInterval(() => {
      fetch(`${BACKEND}/status`)
        .then(res => res.json())
        .then(data => setSignal(data.signal));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 🚨 Trigger emergency
  const triggerEmergency = async () => {
    await fetch(`${BACKEND}/trigger_emergency`, {
      method: "POST"
    });
    alert("🚨 Emergency Triggered!");
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>🚦 AI Traffic + IoT System</h1>

      <h2>Live Camera</h2>
      <img
        src={`${BACKEND}/video`}
        style={{ width: 500, borderRadius: 10 }}
      />

      <h2>Signal: {signal}</h2>

      <button
        onClick={triggerEmergency}
        style={{
          background: "red",
          color: "white",
          padding: "10px 20px",
          borderRadius: 10,
          marginTop: 20
        }}
      >
        🚨 Trigger Ambulance
      </button>
    </div>
  );
}