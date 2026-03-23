import React, { useState, useEffect } from 'react';
import { fetchChatResponse, fetchOceanData } from "./api"
import ScientificChart from "./components/ScientificChart"

function App() {
  const [messages, setMessages] = useState([]);
  const [realData, setRealData] = useState([]);
  const [input, setInput] = useState("");

  // Connect to Backend Data on startup
  useEffect(() => {
    fetchOceanData().then(data => setRealData(data));
  }, []);

  const handleSend = async () => {
    const userMsg = { role: 'user', text: input };
    setMessages([...messages, userMsg]);
    
    // Call our Backend API
    const data = await fetchChatResponse(input);
    setMessages(prev => [...prev, { role: 'bot', text: data.answer }]);
    setInput("");
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar with Chat */}
      <div style={{ width: '350px', padding: '20px', borderRight: '1px solid #ccc' }}>
        <h3>🌊 FloatChat</h3>
        <div style={{ height: '400px', overflowY: 'auto', border: '1px solid #eee' }}>
          {messages.map((m, i) => <p key={i}><strong>{m.role}:</strong> {m.text}</p>)}
        </div>
        <input value={input} onChange={(e) => setInput(e.target.value)} />
        <button onClick={handleSend}>Ask AI</button>
      </div>

      {/* Main Panel with Chart */}
      <div style={{ flex: 1, padding: '20px' }}>
        <h2>Scientific Data View</h2>
        <ScientificChart data={realData} />
      </div>
    </div>
  );
}
export default App;
