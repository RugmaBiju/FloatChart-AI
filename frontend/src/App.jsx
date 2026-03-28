import { useState, useRef, useEffect } from "react";

// ── STYLES (injected as a style tag for portability) ──
const styles = `
  :root {
    --bg-sidebar: #0d1621;
    --bg-sidebar-hover: #162032;
    --bg-main: #f0f4f8;
    --bg-panel: #ffffff;
    --bg-chat: #f7f9fc;
    --accent-teal: #0eb5a8;
    --accent-blue: #1a6fcf;
    --accent-deep: #0a4d8c;
    --user-bubble: #1a6fcf;
    --bot-bubble: #ffffff;
    --text-primary: #0d1621;
    --text-secondary: #5a7290;
    --text-muted: #8fa4bb;
    --text-sidebar: #c8ddf0;
    --text-sidebar-muted: #5e7a96;
    --border: #dce8f2;
    --shadow: 0 2px 16px rgba(13,22,33,0.08);
    --shadow-card: 0 4px 24px rgba(13,22,33,0.10);
    --radius: 12px;
    --radius-sm: 8px;
    --font-ui: 'DM Sans', sans-serif;
    --font-mono: 'DM Mono', monospace;
    --font-display: 'Syne', sans-serif;
  }

  body {
    font-family: var(--font-ui);
    background: var(--bg-main);
    color: var(--text-primary);
    height: 100vh;
    overflow: hidden;
  }

  .fc-layout {
    display: flex;
    height: 100vh;
    overflow: hidden;
  }

  /* ── SIDEBAR ── */
  .fc-sidebar {
    width: 230px;
    min-width: 230px;
    background: var(--bg-sidebar);
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
  }
  .fc-sidebar::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 30% 10%, rgba(14,181,168,0.08) 0%, transparent 60%);
    pointer-events: none;
  }
  .fc-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 22px 20px 18px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .fc-logo-icon {
    width: 36px; height: 36px;
    border-radius: 50%;
    border: 2px solid var(--accent-teal);
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(14,181,168,0.12);
    flex-shrink: 0;
  }
  .fc-logo-t1 {
    font-family: var(--font-display);
    font-size: 15px;
    font-weight: 700;
    color: #fff;
    letter-spacing: 0.08em;
    line-height: 1;
  }
  .fc-logo-t2 {
    font-family: var(--font-display);
    font-size: 11px;
    font-weight: 600;
    color: var(--accent-teal);
    letter-spacing: 0.14em;
  }
  .fc-new-chat {
    margin: 16px 14px 8px;
    background: rgba(14,181,168,0.15);
    border: 1px solid rgba(14,181,168,0.3);
    color: var(--accent-teal);
    font-family: var(--font-ui);
    font-size: 13px;
    font-weight: 500;
    border-radius: var(--radius-sm);
    padding: 9px 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
    width: calc(100% - 28px);
  }
  .fc-new-chat:hover {
    background: rgba(14,181,168,0.25);
    border-color: var(--accent-teal);
  }
  .fc-section-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text-sidebar-muted);
    padding: 14px 20px 6px;
  }
  .fc-nav {
    list-style: none;
    padding: 0 8px;
    flex: 1;
  }
  .fc-nav li a {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 12px;
    border-radius: var(--radius-sm);
    color: var(--text-sidebar);
    text-decoration: none;
    font-size: 13.5px;
    font-weight: 400;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }
  .fc-nav li a:hover, .fc-nav li a.active {
    background: var(--bg-sidebar-hover);
    color: #fff;
  }
  .fc-nav-icon { width: 15px; height: 15px; opacity: 0.7; flex-shrink: 0; }
  .fc-nav li a.active .fc-nav-icon { opacity: 1; color: var(--accent-teal); }
  .fc-query-item {
    font-size: 12px !important;
    color: var(--text-sidebar-muted) !important;
    padding: 7px 12px !important;
    gap: 8px !important;
  }
  .fc-sidebar-bottom {
    padding: 12px 8px 16px;
    border-top: 1px solid rgba(255,255,255,0.06);
  }
  .fc-sidebar-bottom a {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    border-radius: var(--radius-sm);
    color: var(--text-sidebar-muted);
    font-size: 13px;
    cursor: pointer;
    transition: all 0.15s;
    text-decoration: none;
  }
  .fc-sidebar-bottom a:hover { background: var(--bg-sidebar-hover); color: var(--text-sidebar); }

  /* ── CHAT ── */
  .fc-chat {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: var(--bg-chat);
    border-right: 1px solid var(--border);
    min-width: 0;
    max-width: 480px;
  }
  .fc-chat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px;
    background: var(--bg-panel);
    border-bottom: 1px solid var(--border);
    gap: 10px;
  }
  .fc-search {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--bg-chat);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 8px 12px;
  }
  .fc-search input {
    border: none;
    background: transparent;
    font-family: var(--font-ui);
    font-size: 13.5px;
    color: var(--text-primary);
    outline: none;
    width: 100%;
  }
  .fc-search input::placeholder { color: var(--text-muted); }
  .fc-hbtn {
    width: 32px; height: 32px;
    border: none; background: transparent;
    cursor: pointer; border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    color: var(--text-secondary);
    transition: background 0.15s;
  }
  .fc-hbtn:hover { background: var(--border); }

  .fc-messages {
    flex: 1;
    overflow-y: auto;
    padding: 20px 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    scroll-behavior: smooth;
  }
  .fc-messages::-webkit-scrollbar { width: 4px; }
  .fc-messages::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

  .fc-msg-row {
    display: flex;
    align-items: flex-end;
    gap: 10px;
    animation: fcMsgIn 0.3s ease;
  }
  @keyframes fcMsgIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .fc-msg-row.user { flex-direction: row-reverse; }
  .fc-avatar {
    width: 30px; height: 30px;
    border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    background: var(--bg-sidebar);
    border: 1.5px solid rgba(14,181,168,0.4);
  }
  .fc-bubble {
    max-width: 78%;
    padding: 11px 15px;
    border-radius: 14px;
    font-size: 13.5px;
    line-height: 1.6;
  }
  .fc-msg-row.user .fc-bubble {
    background: var(--user-bubble);
    color: #fff;
    border-bottom-right-radius: 4px;
  }
  .fc-msg-row.bot .fc-bubble {
    background: var(--bot-bubble);
    color: var(--text-primary);
    border-bottom-left-radius: 4px;
    box-shadow: var(--shadow);
    border: 1px solid var(--border);
  }
  .fc-msg-status {
    font-size: 11.5px;
    color: var(--accent-teal);
    margin-bottom: 4px;
    font-family: var(--font-mono);
  }
  .fc-typing {
    display: flex;
    gap: 4px;
    padding: 4px 2px;
  }
  .fc-typing span {
    width: 6px; height: 6px;
    background: var(--text-muted);
    border-radius: 50%;
    animation: fcBlink 1.2s infinite;
  }
  .fc-typing span:nth-child(2) { animation-delay: 0.2s; }
  .fc-typing span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes fcBlink {
    0%, 80%, 100% { opacity: 0.3; }
    40% { opacity: 1; }
  }

  .fc-quick-actions {
    display: flex;
    gap: 6px;
    padding: 10px 16px 4px;
    flex-wrap: wrap;
    background: var(--bg-chat);
  }
  .fc-quick-btn {
    font-family: var(--font-ui);
    font-size: 12px;
    font-weight: 500;
    color: var(--accent-blue);
    background: rgba(26,111,207,0.08);
    border: 1px solid rgba(26,111,207,0.2);
    border-radius: 20px;
    padding: 5px 12px;
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;
  }
  .fc-quick-btn:hover { background: rgba(26,111,207,0.15); border-color: var(--accent-blue); }

  .fc-input-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 14px 16px;
    background: var(--bg-panel);
    border-top: 1px solid var(--border);
  }
  .fc-input-wrap {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 6px;
    background: var(--bg-chat);
    border: 1.5px solid var(--border);
    border-radius: 10px;
    padding: 9px 12px;
    transition: border-color 0.2s;
  }
  .fc-input-wrap:focus-within { border-color: var(--accent-teal); }
  .fc-input {
    flex: 1;
    border: none;
    background: transparent;
    font-family: var(--font-ui);
    font-size: 13.5px;
    color: var(--text-primary);
    outline: none;
  }
  .fc-input::placeholder { color: var(--text-muted); }
  .fc-icon-btn {
    width: 26px; height: 26px;
    border: none; background: transparent;
    cursor: pointer; border-radius: 5px;
    display: flex; align-items: center; justify-content: center;
    color: var(--text-muted);
    transition: color 0.15s;
    flex-shrink: 0;
  }
  .fc-icon-btn:hover { color: var(--text-secondary); }
  .fc-send-btn {
    width: 38px; height: 38px;
    background: var(--accent-blue);
    border: none; border-radius: 9px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    transition: all 0.2s;
    box-shadow: 0 2px 8px rgba(26,111,207,0.35);
  }
  .fc-send-btn:hover { background: var(--accent-deep); transform: scale(1.05); }

  /* ── VIZ PANEL ── */
  .fc-viz {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: var(--bg-main);
    padding: 16px;
    gap: 14px;
    overflow-y: auto;
    min-width: 0;
  }
  .fc-viz::-webkit-scrollbar { width: 4px; }
  .fc-viz::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
  .fc-viz-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2px;
  }
  .fc-viz-header h2 {
    font-family: var(--font-display);
    font-size: 17px;
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: -0.01em;
  }
  .fc-viz-header-right { display: flex; align-items: center; gap: 8px; }
  .fc-status-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    font-weight: 500;
    color: var(--accent-teal);
    background: rgba(14,181,168,0.1);
    border-radius: 4px;
    padding: 2px 7px;
  }
  .fc-status-dot {
    width: 6px; height: 6px;
    background: var(--accent-teal);
    border-radius: 50%;
    animation: fcPulse 2s infinite;
  }
  @keyframes fcPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
  .fc-settings-btn {
    width: 32px; height: 32px;
    border: 1px solid var(--border);
    background: var(--bg-panel);
    border-radius: 7px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: var(--text-secondary);
    transition: all 0.15s;
  }
  .fc-settings-btn:hover { background: var(--border); }
  .fc-card {
    background: var(--bg-panel);
    border-radius: var(--radius);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-card);
    overflow: hidden;
  }
  .fc-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px 10px;
    border-bottom: 1px solid var(--border);
    gap: 10px;
  }
  .fc-card-title {
    font-family: var(--font-mono);
    font-size: 10.5px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-secondary);
  }
  .fc-card-actions { display: flex; gap: 4px; }
  .fc-action-btn {
    font-family: var(--font-ui);
    font-size: 11.5px;
    font-weight: 500;
    color: var(--text-secondary);
    background: var(--bg-chat);
    border: 1px solid var(--border);
    border-radius: 5px;
    padding: 4px 9px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: all 0.15s;
  }
  .fc-action-btn:hover { background: var(--border); color: var(--text-primary); }
  .fc-toolbar { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
  .fc-tool {
    width: 22px; height: 22px;
    border: none; background: transparent;
    cursor: pointer; border-radius: 4px;
    display: flex; align-items: center; justify-content: center;
    color: var(--text-muted);
    font-size: 11px;
    transition: all 0.15s;
  }
  .fc-tool:hover { background: var(--border); color: var(--text-secondary); }
  .fc-tool.active { background: rgba(26,111,207,0.1); color: var(--accent-blue); }
  .fc-legend {
    display: flex; gap: 14px;
    padding: 8px 16px 0;
    flex-wrap: wrap;
  }
  .fc-legend-item {
    display: flex; align-items: center; gap: 5px;
    font-size: 11.5px; color: var(--text-secondary);
  }
  .fc-legend-line { width: 10px; height: 2px; border-radius: 1px; }
  .fc-chart-wrap {
    padding: 12px 16px 16px;
    height: 220px;
    position: relative;
  }
  .fc-map-wrap {
    position: relative;
    height: 240px;
    background: #c8e6f5;
    overflow: hidden;
  }
  .fc-map-controls {
    position: absolute;
    top: 10px; left: 10px;
    display: flex; flex-direction: column; gap: 2px;
    z-index: 10;
  }
  .fc-map-zoom {
    width: 24px; height: 24px;
    background: white;
    border: 1px solid var(--border);
    border-radius: 4px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; font-weight: 600;
    color: var(--text-secondary);
    transition: all 0.15s;
  }
  .fc-map-zoom:hover { background: var(--bg-chat); }
  .fc-map-compass {
    position: absolute;
    top: 10px; right: 10px;
    width: 32px; height: 32px;
    background: white;
    border: 1px solid var(--border);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    z-index: 10;
  }
  .fc-map-credit {
    position: absolute;
    bottom: 6px; right: 8px;
    font-size: 9.5px;
    color: var(--text-muted);
    z-index: 10;
  }
`;

// ── SVG ICONS ──
const Icon = ({ d, size = 15, ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    width={size} height={size} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d={d} />
  </svg>
);

const BotAvatar = () => (
  <div className="fc-avatar">
    <svg viewBox="0 0 24 24" fill="none" stroke="#0eb5a8" strokeWidth="2" width="14" height="14">
      <path d="M12 2C8 2 4 6 4 12s4 10 8 10 8-4 8-10S16 2 12 2z" />
      <circle cx="12" cy="12" r="2" fill="#0eb5a8" stroke="none" />
    </svg>
  </div>
);

const BOT_REPLIES = [
  "Querying ARGO float data for your request. Processing depth-integrated profiles across the selected region…",
  "Found 142 matching float records in the dataset. The visualization panel has been updated with the latest analysis.",
  "Comparing salinity gradients across the selected time range. Please see the updated chart on the right.",
  "Identified 3 anomalous temperature readings in the North Atlantic sector. Flagging them on the geospatial map.",
  "Data export is ready. You can download the filtered NetCDF subset using the Export button in the panel.",
  "Running depth profile analysis for the selected floats. This may take a moment as we process the NetCDF files.",
];

// ── CHART COMPONENT ──
function TempChart() {
  const ref = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!ref.current || !window.Chart) return;
    if (chartRef.current) chartRef.current.destroy();

    const labels = ['May 23', 'Jun 5', 'Jun 15', 'Jun 23', 'Jul 5', 'Jul 15', 'Aug 24'];
    chartRef.current = new window.Chart(ref.current, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Surface (0m)',
            data: [0, 1, 3, 6, 10, 14, 18],
            borderColor: '#0eb5a8', backgroundColor: 'rgba(14,181,168,0.06)',
            borderWidth: 2, pointRadius: 4,
            pointBackgroundColor: '#0eb5a8', pointBorderColor: '#fff', pointBorderWidth: 1.5,
            tension: 0.35, fill: false,
          },
          {
            label: 'Mixed Layer Depth',
            data: [3, 5, 8, 12, 16, 19, 22],
            borderColor: '#334155',
            borderWidth: 2, borderDash: [4, 3], pointRadius: 4,
            pointBackgroundColor: '#334155', pointBorderColor: '#fff', pointBorderWidth: 1.5,
            tension: 0.35, fill: false,
          },
          {
            label: 'Deep Ocean',
            data: [6, 9, 13, 17, 21, 24, 26],
            borderColor: '#1a6fcf',
            borderWidth: 2, pointRadius: 4,
            pointBackgroundColor: '#1a6fcf', pointBorderColor: '#fff', pointBorderWidth: 1.5,
            tension: 0.35, fill: false,
          },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0d1621', titleColor: '#0eb5a8', bodyColor: '#c8ddf0',
            borderColor: 'rgba(14,181,168,0.3)', borderWidth: 1, padding: 10,
            titleFont: { family: 'DM Mono', size: 11 },
            bodyFont: { family: 'DM Mono', size: 11 },
            callbacks: {
              title: (items) => `Date: ${items[0].label}`,
              label: (item) => `  ${item.dataset.label}: ${item.raw}°C`,
            },
          },
        },
        scales: {
          x: {
            grid: { color: 'rgba(0,0,0,0.04)' },
            ticks: { font: { family: 'DM Sans', size: 11 }, color: '#8fa4bb' },
            border: { display: false },
          },
          y: {
            reverse: true,
            title: { display: true, text: 'Depth', font: { family: 'DM Sans', size: 11 }, color: '#8fa4bb' },
            grid: { color: 'rgba(0,0,0,0.04)' },
            ticks: { font: { family: 'DM Sans', size: 11 }, color: '#8fa4bb', stepSize: 5 },
            border: { display: false },
          },
        },
      },
    });

    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, []);

  return <canvas ref={ref} style={{ width: '100%', height: '100%' }} />;
}

// ── MAP COMPONENT ──
function FloatMap() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    function draw() {
      const W = container.clientWidth;
      const H = container.clientHeight;
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');

      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#b8d9ee');
      grad.addColorStop(1, '#c8e6f5');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      const s = W / 800;
      const oy = H / 2 - 60 * s;
      ctx.fillStyle = '#d4e8c2';
      ctx.strokeStyle = '#b8cfaa';
      ctx.lineWidth = 0.8;

      const landmasses = [
        [[80,80],[200,60],[240,90],[220,150],[180,180],[120,170],[80,140]],
        [[150,200],[200,190],[210,250],[170,290],[140,270],[140,220]],
        [[340,60],[400,50],[420,80],[390,110],[350,100]],
        [[355,120],[420,110],[440,160],[420,240],[370,260],[345,200]],
        [[430,40],[620,30],[660,80],[620,130],[560,140],[500,120],[450,100]],
        [[590,200],[660,190],[680,240],[630,260],[590,240]],
      ];
      landmasses.forEach(pts => {
        ctx.beginPath();
        ctx.moveTo(pts[0][0]*s, pts[0][1]*s+oy);
        pts.slice(1).forEach(([x,y]) => ctx.lineTo(x*s, y*s+oy));
        ctx.closePath();
        ctx.fill(); ctx.stroke();
      });

      const floats = [
        [280,100,'#e74c3c'],[310,120,'#e67e22'],[330,95,'#f1c40f'],
        [260,140,'#2ecc71'],[300,150,'#1abc9c'],[250,90,'#3498db'],
        [480,160,'#9b59b6'],[510,180,'#e74c3c'],[440,200,'#f39c12'],
        [550,150,'#27ae60'],[200,250,'#2980b9'],[370,170,'#c0392b'],
        [160,120,'#16a085'],[130,230,'#8e44ad'],[600,220,'#d35400'],
      ];
      floats.forEach(([x,y,color]) => {
        ctx.beginPath();
        ctx.arc(x*s, y*s+oy, 5*Math.sqrt(s), 0, Math.PI*2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.8)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
    }

    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="fc-map-wrap" ref={containerRef}>
      <div className="fc-map-controls">
        <button className="fc-map-zoom">+</button>
        <button className="fc-map-zoom">−</button>
      </div>
      <div className="fc-map-compass">
        <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
          <circle cx="12" cy="12" r="10" stroke="#ccc" strokeWidth="1.5"/>
          <polygon points="12,3 13.5,10 12,9 10.5,10" fill="#1a6fcf"/>
          <polygon points="12,21 10.5,14 12,15 13.5,14" fill="#aaa"/>
        </svg>
      </div>
      <canvas ref={canvasRef} style={{ width:'100%', height:'100%', display:'block' }} />
      <div className="fc-map-credit">Leaflet | © OpenStreetMap contributors</div>
    </div>
  );
}

// ── MAIN APP ──
export default function App() {
  const [messages, setMessages] = useState([
    { role: 'user', text: 'Analyze recent temperature trends in the North Atlantic, focusing on the last 3 months.' },
    { role: 'bot',  text: 'Querying ARGO NetCDF data via FastAPI.\n\nBased on the selected data, here is the depth-integrated temperature analysis. Please refer to the dynamic chart.' },
    { role: 'user', text: 'Now, plot the geographic location of these floats.' },
    { role: 'bot',  text: 'Here is the spatial distribution of the active floats. The map visualization has been updated in the right panel.' },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [replyIdx, setReplyIdx] = useState(0);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  async function sendMessage(text) {

  const msg = (text || input).trim();
  if (!msg) return;

  setMessages(prev => [...prev, { role: 'user', text: msg }]);
  setInput('');
  setTyping(true);

  try {

    const res = await fetch("http://127.0.0.1:8000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query: msg })
    });

    const data = await res.json();

    setTyping(false);

    setMessages(prev => [
      ...prev,
      { role: 'bot', text: data.answer }
    ]);

  } catch (err) {

    console.error(err);

    setTyping(false);

    setMessages(prev => [
      ...prev,
      { role: 'bot', text: "⚠️ Error connecting to backend." }
    ]);
  }
}

  return (
    <>
      <style>{styles}</style>
      <div className="fc-layout">

        {/* ── SIDEBAR ── */}
        <aside className="fc-sidebar">
          <div className="fc-logo">
            <div className="fc-logo-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="#0eb5a8" strokeWidth="2" width="18" height="18">
                <path d="M12 2C8 2 4 6 4 12s4 10 8 10 8-4 8-10S16 2 12 2z"/>
                <path d="M12 7v5l3 3" strokeLinecap="round"/>
                <circle cx="12" cy="12" r="1" fill="#0eb5a8" stroke="none"/>
              </svg>
            </div>
            <div>
              <div className="fc-logo-t1">FLOAT</div>
              <div className="fc-logo-t2">CHAT</div>
            </div>
          </div>

          <button className="fc-new-chat" onClick={() => setMessages([])}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
              <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
            </svg>
            New Chat
          </button>

          <div className="fc-section-label">Navigation</div>
          <ul className="fc-nav">
            {[
              { label:'Saved Queries', d:'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z', active: true },
              { label:'Projects', d:'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z' },
              { label:'My Data', d:'M3 12h18M3 6h18M3 18h18' },
              { label:'Datasets', d:'M3 6l3 1m0 0l-3 9a5 5 0 006 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5 5 0 006 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3' },
            ].map(({ label, d, active }) => (
              <li key={label}>
                <a href="#" className={active ? 'active' : ''} onClick={e => e.preventDefault()}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    className="fc-nav-icon" width="15" height="15">
                    <path d={d} strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {label}
                </a>
              </li>
            ))}
          </ul>

          <div className="fc-section-label">Recent Queries</div>
          <ul className="fc-nav">
            {['N. Atlantic Temp Trends','Salinity Profile Jun 2024','Float density Pacific'].map(q => (
              <li key={q}>
                <a href="#" className="fc-query-item" onClick={e => e.preventDefault()}>
                  <span style={{width:4,height:4,background:'var(--text-sidebar-muted)',borderRadius:'50%',flexShrink:0,display:'inline-block'}}/>
                  {q}
                </a>
              </li>
            ))}
          </ul>

          <div className="fc-sidebar-bottom">
            {[
              { label:'Settings', d:'M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83' },
              { label:'Help & Support', d:'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 8v4M12 16h.01' },
            ].map(({ label, d }) => (
              <a key={label} href="#" onClick={e => e.preventDefault()}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                  <path d={d} strokeLinecap="round"/>
                </svg>
                {label}
              </a>
            ))}
          </div>
        </aside>

        {/* ── CHAT ── */}
        <main className="fc-chat">
          <div className="fc-chat-header">
            <div className="fc-search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15" style={{color:'var(--text-muted)',flexShrink:0}}>
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
              </svg>
              <input type="text" placeholder="Search conversations…" />
            </div>
            <button className="fc-hbtn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <circle cx="12" cy="5" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="19" r="1" fill="currentColor"/>
              </svg>
            </button>
          </div>

          <div className="fc-messages">
            {messages.map((m, i) => (
              <div key={i} className={`fc-msg-row ${m.role}`}>
                {m.role === 'bot' && <BotAvatar />}
                {m.role === 'bot' ? (
                  <div>
                    <div className="fc-msg-status">Processing request…</div>
                    <div className="fc-bubble">{m.text.split('\n\n').map((p,j) => <p key={j} style={{marginBottom:j<m.text.split('\n\n').length-1?'8px':0}}>{p}</p>)}</div>
                  </div>
                ) : (
                  <div className="fc-bubble">{m.text}</div>
                )}
              </div>
            ))}

            {typing && (
              <div className="fc-msg-row bot">
                <BotAvatar />
                <div className="fc-bubble">
                  <div className="fc-typing">
                    <span/><span/><span/>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="fc-quick-actions">
            {['Summarize Findings','Generate Report','Compare with 2023','Expand to Full Map'].map(q => (
              <button key={q} className="fc-quick-btn" onClick={() => sendMessage(q)}>{q}</button>
            ))}
          </div>

          <div className="fc-input-row">
            <div className="fc-input-wrap">
              <input
                className="fc-input"
                type="text"
                placeholder="Ask about ocean temperature, salinity, float status…"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
              />
              <button className="fc-icon-btn" title="Attach">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" strokeLinecap="round"/>
                </svg>
              </button>
              <button className="fc-icon-btn" title="Voice">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                  <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <button className="fc-send-btn" onClick={() => sendMessage()}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" width="16" height="16">
                <path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </main>

        {/* ── VIZ PANEL ── */}
        <section className="fc-viz">
          <div className="fc-viz-header">
            <h2>Data &amp; Visualization Panel</h2>
            <div className="fc-viz-header-right">
              <div className="fc-status-badge">
                <div className="fc-status-dot"/>
                Live
              </div>
              <button className="fc-settings-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Temperature chart card */}
          <div className="fc-card">
            <div className="fc-card-header">
              <span className="fc-card-title">Analysis: North Atlantic Temperature Trends (May–Jul 2024)</span>
              <div className="fc-toolbar">
                {['📷','🔍','➕','📈','📊','⚙️'].map((icon, i) => (
                  <button key={i} className={`fc-tool${i===3?' active':''}`}>{icon}</button>
                ))}
              </div>
            </div>
            <div className="fc-legend">
              {[['#0eb5a8','Surface (0m)'],['#334155','Mixed Layer Depth'],['#1a6fcf','Deep Ocean']].map(([c,l]) => (
                <div key={l} className="fc-legend-item">
                  <div className="fc-legend-line" style={{background:c}}/>
                  {l}
                </div>
              ))}
            </div>
            <div className="fc-chart-wrap">
              <TempChart />
            </div>
          </div>

          {/* Map card */}
          <div className="fc-card">
            <div className="fc-card-header">
              <span className="fc-card-title">Geospatial Float Locations</span>
              <div className="fc-card-actions">
                {[['Refresh','M23 4v6h-6M1 20v-6h6'],['Export Data','M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12'],['Layers','M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5']].map(([label,d]) => (
                  <button key={label} className="fc-action-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="11" height="11"><path d={d} strokeLinecap="round" strokeLinejoin="round"/></svg>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <FloatMap />
            <div className="fc-map-credit" style={{position:'static',padding:'4px 12px 8px',fontSize:'10px',color:'var(--text-muted)'}}>
              Leaflet | © OpenStreetMap contributors
            </div>
          </div>
        </section>

      </div>
    </>
  );
}