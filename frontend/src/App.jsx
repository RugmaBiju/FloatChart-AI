import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import { smartRoute, generateCreatureProfile, generateFunFact } from "./marineai";

// ─── Mock API (replace with your real fetchOceanData) ───────────────────────
const fetchOceanData = async () => {
  return Array.from({ length: 30 }, (_, i) => ({
    depth: i * 10,
    temperature: 28 - i * 0.6 + Math.random() * 2,
    salinity: 35 + Math.random() * 1.5,
    oxygen: 6 - i * 0.1 + Math.random(),
  }));
};

// ─── Marine Life Data ────────────────────────────────────────────────────────
const MARINE_LIFE = [
  {
    id: 1,
    name: "Blue Whale",
    sci: "Balaenoptera musculus",
    emoji: "🐋",
    depth: "0–500 m",
    zone: "Epipelagic",
    color: "#0077b6",
    fact: "The largest animal ever known to exist, reaching up to 33 m. Their songs can travel thousands of kilometres across the Indian Ocean.",
    details: [
      "Feeds almost exclusively on krill",
      "Heart weighs ~600 kg",
      "Lifespan: 70–90 years",
      "Found in Sri Lanka Channel year-round",
    ],
  },
  {
    id: 2,
    name: "Whale Shark",
    sci: "Rhincodon typus",
    emoji: "🦈",
    depth: "0–1,800 m",
    zone: "Epipelagic",
    color: "#023e8a",
    fact: "World's largest fish, filter-feeding on plankton. Ningaloo Reef in the eastern Indian Ocean hosts major aggregations every year.",
    details: [
      "Filter-feeds up to 600 litres/hr",
      "Spotted patterns unique as fingerprints",
      "Lifespan: ~70 years",
      "Migrates across entire Indian Ocean basin",
    ],
  },
  {
    id: 3,
    name: "Manta Ray",
    sci: "Mobula birostris",
    emoji: "🐟",
    depth: "0–1,000 m",
    zone: "Epipelagic",
    color: "#00b4d8",
    fact: "Oceanic mantas have the largest brain-to-body ratio of all fish and display remarkable problem-solving behaviour.",
    details: [
      "Wingspan up to 7 m",
      "Capable of breaching fully out of water",
      "Feeds on zooplankton via cephalic fins",
      "Aggregations seen at Maldives & Mozambique Channel",
    ],
  },
  {
    id: 4,
    name: "Dugong",
    sci: "Dugong dugon",
    emoji: "🦭",
    depth: "1–37 m",
    zone: "Coastal Shallow",
    color: "#48cae4",
    fact: "The Indian Ocean holds ~85% of the world's dugong population. They graze seagrass beds like underwater cows.",
    details: [
      "Only fully marine herbivorous mammal",
      "Graze up to 40 kg seagrass/day",
      "Lifespan: 70+ years",
      "Hotspots: Shark Bay, Red Sea, Gulf",
    ],
  },
  {
    id: 5,
    name: "Coconut Crab",
    sci: "Birgus latro",
    emoji: "🦀",
    depth: "Coastal",
    zone: "Intertidal",
    color: "#0096c7",
    fact: "The world's largest land arthropod, common on Indian Ocean islands, capable of cracking open coconuts with its claws.",
    details: [
      "Claws exert 3,300 N of force",
      "Can climb trees up to 6 m high",
      "Lifespan: 60+ years",
      "Returns to sea only to spawn",
    ],
  },
  {
    id: 6,
    name: "Coelacanth",
    sci: "Latimeria chalumnae",
    emoji: "🐠",
    depth: "150–700 m",
    zone: "Mesopelagic",
    color: "#0077b6",
    fact: "A living fossil thought extinct for 66 million years until rediscovered in 1938 off South Africa's Indian Ocean coast.",
    details: [
      "Unchanged for ~400 million years",
      "Lobe-fins move like tetrapod limbs",
      "Ovoviviparous — gives live birth",
      "Populations: Comoros, Sulawesi, Tanzania",
    ],
  },
];

const OCEAN_STATS = [
  { label: "Area", value: "70.56 M km²", icon: "🌊" },
  { label: "Avg Depth", value: "3,741 m", icon: "📏" },
  { label: "Max Depth", value: "7,258 m", icon: "⬇️" },
  { label: "Coastline", value: "66,526 km", icon: "🏖️" },
  { label: "Islands", value: "1,000+", icon: "🏝️" },
  { label: "Species", value: "~200,000", icon: "🐟" },
];

const DEPTH_ZONES = [
  { name: "Sunlight Zone", range: "0–200 m", color: "#48cae4", pct: 20, desc: "90% of marine life lives here" },
  { name: "Twilight Zone", range: "200–1,000 m", color: "#0096c7", pct: 20, desc: "Bioluminescence begins" },
  { name: "Midnight Zone", range: "1,000–4,000 m", color: "#023e8a", pct: 30, desc: "No sunlight, crushing pressure" },
  { name: "Abyssal Zone", range: "4,000–6,000 m", color: "#03045e", pct: 20, desc: "Near-freezing temperatures" },
  { name: "Hadal Zone", range: "6,000–7,258 m", color: "#000814", pct: 10, desc: "Deepest trenches on Earth" },
];

// ─── Components ──────────────────────────────────────────────────────────────

function Sidebar({ active, setActive }) {
  const items = [
    { id: "dashboard", icon: "🏠", label: "Dashboard" },
    { id: "ocean", icon: "🌊", label: "Ocean Data" },
    { id: "marine", icon: "🐋", label: "Marine Life" },
    { id: "paths", icon: "🛰️", label: "Float Paths" },
    { id: "analytics", icon: "📊", label: "Analytics" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-icon">🌊</span>
        <div>
          <div className="brand-name">FloatChat</div>
          <div className="brand-sub">Indian Ocean Explorer</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${active === item.id ? "active" : ""}`}
            onClick={() => setActive(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {active === item.id && <span className="nav-dot" />}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="ocean-status">
          <span className="pulse-dot" />
          <span>Live Data Feed</span>
        </div>
        <div className="sidebar-temp">SST: 28.4 °C</div>
      </div>
    </aside>
  );
}

function Dashboard({ onNavigate }) {
  return (
    <div className="page dashboard-page">
      <div className="page-hero">
        <div className="hero-badge">🌊 Indian Ocean Research Platform</div>
        <h1 className="hero-title">
          Explore the Deep<br />
          <span className="hero-accent">Blue Frontier</span>
        </h1>
        <p className="hero-desc">
          FloatChat combines Argo float data, AI-powered insights, and real-time
          oceanographic feeds to bring the Indian Ocean to life.
        </p>
        <div className="hero-actions">
          <button className="btn-primary" onClick={() => onNavigate("marine")}>
            🐋 Explore Marine Life
          </button>
          <button className="btn-secondary" onClick={() => onNavigate("ocean")}>
            📊 View Ocean Data
          </button>
        </div>
      </div>

      <div className="stats-grid">
        {OCEAN_STATS.map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="depth-section">
        <h3 className="section-title">Ocean Depth Zones</h3>
        <div className="depth-viz">
          {DEPTH_ZONES.map((z) => (
            <div className="depth-zone" key={z.name} style={{ flex: z.pct, background: z.color }}>
              <div className="depth-zone-inner">
                <div className="depth-zone-name">{z.name}</div>
                <div className="depth-zone-range">{z.range}</div>
                <div className="depth-zone-desc">{z.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function OceanData({ data }) {
  const maxTemp = Math.max(...data.map((d) => d.temperature));
  const minTemp = Math.min(...data.map((d) => d.temperature));

  return (
    <div className="page ocean-page">
      <div className="page-header">
        <h2 className="page-title">🌊 Ocean Data</h2>
        <p className="page-desc">Real-time Argo float measurements from the Indian Ocean</p>
      </div>

      <div className="data-cards">
        {[
          { label: "Surface Temp", value: `${data[0]?.temperature?.toFixed(1) ?? "--"}°C`, icon: "🌡️", color: "#ff6b6b" },
          { label: "Avg Salinity", value: `${(data.reduce((a, d) => a + d.salinity, 0) / (data.length || 1)).toFixed(1)} PSU`, icon: "🧂", color: "#48cae4" },
          { label: "Depth Points", value: data.length, icon: "📍", color: "#00b4d8" },
          { label: "Temp Range", value: `${minTemp.toFixed(1)}–${maxTemp.toFixed(1)}°C`, icon: "📈", color: "#a8dadc" },
        ].map((c) => (
          <div className="data-card" key={c.label} style={{ "--card-accent": c.color }}>
            <div className="data-card-icon">{c.icon}</div>
            <div className="data-card-value">{c.value}</div>
            <div className="data-card-label">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="chart-section">
        <h3 className="section-title">Temperature vs Depth Profile</h3>
        <div className="chart-wrap">
          <svg viewBox="0 0 600 320" className="depth-chart">
            <defs>
              <linearGradient id="tempGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ff6b6b" />
                <stop offset="100%" stopColor="#48cae4" />
              </linearGradient>
              <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#48cae4" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#023e8a" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            <rect x="60" y="20" width="520" height="260" rx="4" fill="url(#bgGrad)" />
            {data.length > 1 && (() => {
              const w = 520, h = 260, px = 60, py = 20;
              const xs = data.map((_, i) => px + (i / (data.length - 1)) * w);
              const temps = data.map((d) => d.temperature);
              const tMin = Math.min(...temps), tMax = Math.max(...temps);
              const ys = temps.map((t) => py + h - ((t - tMin) / (tMax - tMin || 1)) * h);
              const path = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`).join(" ");
              const area = `${path} L${xs[xs.length - 1]},${py + h} L${xs[0]},${py + h} Z`;
              return (
                <>
                  <path d={area} fill="url(#tempGrad)" opacity="0.2" />
                  <path d={path} fill="none" stroke="url(#tempGrad)" strokeWidth="2.5" strokeLinecap="round" />
                  {xs.map((x, i) => (
                    <circle key={i} cx={x} cy={ys[i]} r="3" fill="#48cae4" opacity="0.8" />
                  ))}
                </>
              );
            })()}
            <text x="340" y="310" textAnchor="middle" fill="#90e0ef" fontSize="11">Depth Profile →</text>
            <text x="30" y="155" textAnchor="middle" fill="#90e0ef" fontSize="11" transform="rotate(-90,30,155)">Temp (°C)</text>
          </svg>
        </div>
      </div>

      <div className="data-table-wrap">
        <h3 className="section-title">Raw Measurements</h3>
        <div className="data-table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Depth (m)</th>
                <th>Temperature (°C)</th>
                <th>Salinity (PSU)</th>
                <th>Dissolved O₂</th>
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 15).map((row, i) => (
                <tr key={i}>
                  <td>{row.depth}</td>
                  <td>{row.temperature.toFixed(2)}</td>
                  <td>{row.salinity.toFixed(2)}</td>
                  <td>{row.oxygen?.toFixed(2) ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CreatureDetail({ creature, onClose }) {
  const [profile, setProfile] = useState("");
  const [funFact, setFunFact] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);
  const [factLoading, setFactLoading] = useState(true);
  const [askInput, setAskInput] = useState("");
  const [askAnswer, setAskAnswer] = useState("");
  const [askLoading, setAskLoading] = useState(false);

  useEffect(() => {
    setProfile(""); setFunFact(""); setProfileLoading(true); setFactLoading(true);
    setAskAnswer(""); setAskInput("");

    generateCreatureProfile(creature.name, creature.sci)
      .then((text) => setProfile(text))
      .catch(() => setProfile("Could not load profile. Check your API key."))
      .finally(() => setProfileLoading(false));

    generateFunFact(creature.name)
      .then((text) => setFunFact(text))
      .catch(() => setFunFact(""))
      .finally(() => setFactLoading(false));
  }, [creature.id]);

  const askCreature = async () => {
    if (!askInput.trim() || askLoading) return;
    setAskLoading(true);
    setAskAnswer("");
    try {
      const { text } = await smartRoute(
        `About the ${creature.name} in the Indian Ocean: ${askInput}`,
        [],
        "http://localhost:8000/chat"
      );
      setAskAnswer(text);
    } catch {
      setAskAnswer("⚠️ Could not get an answer right now.");
    }
    setAskLoading(false);
  };

  return (
    <div className="creature-detail">
      <div className="detail-header" style={{ "--creature-color": creature.color }}>
        <span className="detail-emoji">{creature.emoji}</span>
        <div>
          <h3>{creature.name}</h3>
          <em>{creature.sci}</em>
          <div className="detail-meta">
            <span>📍 {creature.depth}</span>
            <span className="creature-zone-badge" style={{ marginLeft: 8 }}>{creature.zone}</span>
          </div>
        </div>
        <button className="detail-close" onClick={onClose}>✕</button>
      </div>

      <div className="detail-body">
        {/* AI-generated profile */}
        <div className="detail-section">
          <div className="detail-section-label">🤖 AI Profile — Indian Ocean Context</div>
          {profileLoading ? (
            <div className="ai-loading">
              <span className="ai-dot" /><span className="ai-dot" /><span className="ai-dot" />
              <span>MarineBot is researching…</span>
            </div>
          ) : (
            <p className="detail-ai-text">{profile}</p>
          )}
        </div>

        {/* Fun fact */}
        {(factLoading || funFact) && (
          <div className="detail-section fun-fact-box">
            <div className="detail-section-label">💡 Fun Fact</div>
            {factLoading ? (
              <div className="ai-loading">
                <span className="ai-dot" /><span className="ai-dot" /><span className="ai-dot" />
              </div>
            ) : (
              <p className="detail-fun-fact">{funFact}</p>
            )}
          </div>
        )}

        {/* Static quick facts */}
        <div className="detail-section">
          <div className="detail-section-label">📋 Quick Facts</div>
          <div className="detail-facts-grid">
            {creature.details.map((d, i) => (
              <div className="detail-fact-item" key={i}>
                <span className="fact-check">✦</span> {d}
              </div>
            ))}
          </div>
        </div>

        {/* Ask anything about this creature */}
        <div className="detail-section ask-section">
          <div className="detail-section-label">🔍 Ask About This Species</div>
          <div className="ask-row">
            <input
              className="ask-input"
              value={askInput}
              onChange={(e) => setAskInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && askCreature()}
              placeholder={`E.g. "How does the ${creature.name} navigate?" …`}
            />
            <button className="ask-btn" onClick={askCreature} disabled={askLoading}>
              {askLoading ? "…" : "Ask"}
            </button>
          </div>
          {askLoading && (
            <div className="ai-loading" style={{ marginTop: 10 }}>
              <span className="ai-dot" /><span className="ai-dot" /><span className="ai-dot" />
              <span>MarineBot is thinking…</span>
            </div>
          )}
          {askAnswer && <p className="ask-answer">{askAnswer}</p>}
        </div>
      </div>
    </div>
  );
}

function MarineLife() {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("All");

  const zones = ["All", "Epipelagic", "Mesopelagic", "Coastal Shallow", "Intertidal"];
  const filtered = filter === "All" ? MARINE_LIFE : MARINE_LIFE.filter((m) => m.zone === filter);

  const handleSelect = (creature) => {
    setSelected((prev) => (prev?.id === creature.id ? null : creature));
  };

  return (
    <div className="page marine-page">
      <div className="page-header">
        <h2 className="page-title">🐋 Marine Life Explorer</h2>
        <p className="page-desc">
          Powered by MarineBot AI — click any creature for a live AI-generated deep dive
        </p>
      </div>

      <div className="filter-pills">
        {zones.map((z) => (
          <button
            key={z}
            className={`filter-pill ${filter === z ? "active" : ""}`}
            onClick={() => { setFilter(z); setSelected(null); }}
          >
            {z}
          </button>
        ))}
      </div>

      <div className="marine-grid">
        {filtered.map((creature) => (
          <div
            key={creature.id}
            className={`creature-card ${selected?.id === creature.id ? "selected" : ""}`}
            style={{ "--creature-color": creature.color }}
            onClick={() => handleSelect(creature)}
          >
            <div className="creature-emoji">{creature.emoji}</div>
            <div className="creature-info">
              <div className="creature-name">{creature.name}</div>
              <div className="creature-sci">{creature.sci}</div>
              <div className="creature-depth">📍 {creature.depth}</div>
              <div className="creature-zone-badge">{creature.zone}</div>
            </div>
            <div className="creature-card-hint">Click for AI profile ✦</div>
          </div>
        ))}
      </div>

      {selected && (
        <CreatureDetail creature={selected} onClose={() => setSelected(null)} />
      )}

      <div className="ocean-facts-banner">
        <div className="facts-scroll">
          {[
            "🌊 The Indian Ocean is warming faster than any other ocean",
            "🐠 Over 1,000 species of coral reef fish inhabit Indian Ocean reefs",
            "🦑 Giant squids have been found in waters south of the basin",
            "🐢 Five of seven sea turtle species nest on Indian Ocean beaches",
            "🦈 The Indian Ocean hosts over 50 shark species",
            "🌿 Seagrass meadows cover over 15,000 km² of Indian Ocean seabed",
            "🔬 The Indian Ocean has the lowest oxygen levels of any major ocean",
          ].map((f, i) => (
            <span className="fact-chip" key={i}>{f}</span>
          ))}
          {/* duplicate for seamless loop */}
          {[
            "🌊 The Indian Ocean is warming faster than any other ocean",
            "🐠 Over 1,000 species of coral reef fish inhabit Indian Ocean reefs",
            "🦑 Giant squids have been found in waters south of the basin",
            "🐢 Five of seven sea turtle species nest on Indian Ocean beaches",
            "🦈 The Indian Ocean hosts over 50 shark species",
            "🌿 Seagrass meadows cover over 15,000 km² of Indian Ocean seabed",
            "🔬 The Indian Ocean has the lowest oxygen levels of any major ocean",
          ].map((f, i) => (
            <span className="fact-chip" key={`d${i}`}>{f}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function FloatPaths() {
  const floats = [
    { id: "WMO-1902577", lat: -12.4, lon: 65.3, temp: 27.8, status: "Active", days: 14 },
    { id: "WMO-5905680", lat: 8.2, lon: 75.1, temp: 29.1, status: "Active", days: 7 },
    { id: "WMO-2902994", lat: -25.6, lon: 55.8, temp: 23.4, status: "Surfacing", days: 22 },
    { id: "WMO-1901234", lat: 15.3, lon: 60.7, temp: 28.6, status: "Active", days: 3 },
  ];

  return (
    <div className="page paths-page">
      <div className="page-header">
        <h2 className="page-title">🛰️ Float Paths</h2>
        <p className="page-desc">Track Argo profiling floats across the Indian Ocean</p>
      </div>

      <div className="map-placeholder">
        <div className="map-overlay-text">
          <div className="map-globe">🌏</div>
          <div>Interactive float track map</div>
          <div className="map-sub">Connect your mapping backend to render live trajectories</div>
        </div>
        <div className="map-grid" />
        {floats.map((f, i) => (
          <div
            key={f.id}
            className="float-pin"
            style={{
              left: `${20 + i * 18}%`,
              top: `${30 + (i % 2) * 30}%`,
            }}
          >
            <div className="pin-dot" />
            <div className="pin-tooltip">
              <strong>{f.id}</strong><br />
              {f.lat}°N {f.lon}°E<br />
              SST: {f.temp}°C
            </div>
          </div>
        ))}
      </div>

      <div className="floats-list">
        <h3 className="section-title">Active Floats</h3>
        {floats.map((f) => (
          <div className="float-row" key={f.id}>
            <div className="float-id">{f.id}</div>
            <div className="float-coords">{f.lat}°, {f.lon}°</div>
            <div className="float-temp">🌡️ {f.temp}°C</div>
            <div className={`float-status ${f.status.toLowerCase()}`}>{f.status}</div>
            <div className="float-days">{f.days}d ago</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Analytics({ data }) {
  return (
    <div className="page analytics-page">
      <div className="page-header">
        <h2 className="page-title">📊 Analytics</h2>
        <p className="page-desc">Derived insights from your RAG-indexed float dataset</p>
      </div>

      <div className="analytics-grid">
        {[
          { title: "Temperature Anomaly", value: "+0.4°C", desc: "Above 1990–2020 baseline", trend: "up", color: "#ff6b6b" },
          { title: "Mixed Layer Depth", value: "42 m", desc: "Shallower than seasonal mean", trend: "down", color: "#48cae4" },
          { title: "Salinity Gradient", value: "1.8 PSU", desc: "Surface to 200 m", trend: "neutral", color: "#00b4d8" },
          { title: "Float Coverage", value: "74%", desc: "Of study region sampled", trend: "up", color: "#90e0ef" },
        ].map((a) => (
          <div className="analytics-card" key={a.title} style={{ "--ac-color": a.color }}>
            <div className="ac-trend">{a.trend === "up" ? "↑" : a.trend === "down" ? "↓" : "→"}</div>
            <div className="ac-value">{a.value}</div>
            <div className="ac-title">{a.title}</div>
            <div className="ac-desc">{a.desc}</div>
          </div>
        ))}
      </div>

      <div className="insight-cards">
        <h3 className="section-title">AI-Generated Insights</h3>
        {[
          { icon: "🌡️", title: "Warming Trend Detected", body: "The northern Indian Ocean shows sustained surface warming of 0.4°C above the 30-year baseline, consistent with intensified monsoon variability." },
          { icon: "🌀", title: "Eddy Activity High", body: "Three mesoscale eddies identified in the southwest basin. These features modulate heat transport and marine productivity." },
          { icon: "🐟", title: "Biological Productivity", body: "Chlorophyll concentrations near the Arabian Sea upwelling zone are 30% above seasonal average, supporting richer fisheries." },
        ].map((ins) => (
          <div className="insight-card" key={ins.title}>
            <div className="insight-icon">{ins.icon}</div>
            <div>
              <div className="insight-title">{ins.title}</div>
              <div className="insight-body">{ins.body}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", text: "👋 Hi! I'm your Indian Ocean AI guide. Ask me about ocean data from the Argo floats, or ask me anything about marine life and Indian Ocean creatures!", source: "system" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bodyRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      // smartRoute automatically decides: marine question → Anthropic API
      // ocean data question → your Python RAG backend
      const { text, source } = await smartRoute(
        userMsg,
        messages.filter((m) => m.role !== "system").slice(-8), // last 8 msgs for context
        "http://localhost:8000/chat"
      );
      setMessages((m) => [...m, { role: "bot", text, source }]);
    } catch (err) {
      const isApiKeyError = err.message?.includes("401") || err.message?.includes("API key");
      setMessages((m) => [...m, {
        role: "bot",
        text: isApiKeyError
          ? "⚠️ API key not configured. Add your Anthropic API key to the proxy or your environment."
          : "⚠️ Couldn't reach the backend. Make sure your Python server is running on port 8000.",
        source: "error",
      }]);
    }
    setLoading(false);
  };

  const SUGGESTIONS = [
    "Tell me about Blue Whales 🐋",
    "What's the water temperature data?",
    "How do whale sharks feed?",
    "What floats are active?",
  ];

  return (
    <>
      <button className="chat-fab" onClick={() => setOpen((o) => !o)} title="Ask FloatChat AI">
        {open ? "✕" : "💬"}
      </button>

      {open && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-header-left">
              <span className="chat-avatar">🌊</span>
              <div>
                <div className="chat-title">FloatChat AI</div>
                <div className="chat-subtitle">Ocean Data · Marine Life</div>
              </div>
            </div>
            <button className="chat-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="chat-body" ref={bodyRef}>
            {/* Quick suggestions shown at top */}
            {messages.length === 1 && (
              <div className="chat-suggestions">
                {SUGGESTIONS.map((s) => (
                  <button key={s} className="suggestion-chip" onClick={() => { setInput(s); }}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`chat-msg ${m.role}`}>
                {m.role === "bot" && <span className="msg-avatar">🌊</span>}
                <div className="msg-bubble-wrap">
                  <div className="msg-bubble">{m.text}</div>
                  {m.source && m.source !== "system" && m.source !== "error" && (
                    <div className={`msg-source ${m.source}`}>
                      {m.source === "marine-ai" ? "🐟 MarineBot AI" : "📡 Ocean RAG"}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="chat-msg bot">
                <span className="msg-avatar">🌊</span>
                <div className="msg-bubble typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
          </div>

          <div className="chat-input-row">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask about ocean data or marine life…"
            />
            <button onClick={send} disabled={loading}>➤</button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [oceanData, setOceanData] = useState([]);

  useEffect(() => {
    fetchOceanData().then(setOceanData);
  }, []);

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <Dashboard onNavigate={setPage} />;
      case "ocean":     return <OceanData data={oceanData} />;
      case "marine":    return <MarineLife />;
      case "paths":     return <FloatPaths />;
      case "analytics": return <Analytics data={oceanData} />;
      default:          return <Dashboard onNavigate={setPage} />;
    }
  };

  return (
    <div className="app">
      <Sidebar active={page} setActive={setPage} />
      <main className="main-content">{renderPage()}</main>
      <ChatWidget />
    </div>
  );
}