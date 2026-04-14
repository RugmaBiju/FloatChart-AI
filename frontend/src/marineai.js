const BACKEND = "http://localhost:8000";

const MARINE_SYSTEM_PROMPT = `You are MarineBot, an expert marine biologist and oceanographer specialising in the Indian Ocean. You have deep knowledge of:
- Marine animals: fish, mammals, reptiles, invertebrates, and microorganisms of the Indian Ocean
- Ecosystems: coral reefs, seagrass beds, mangroves, open ocean, deep sea zones
- Conservation status, threats, and protection efforts
- Indian Ocean geography, currents, and their effect on marine life
- Interesting behaviours, adaptations, and ecology

Personality: You are enthusiastic, educational, and engaging. You use vivid descriptions and analogies. You always connect animals to the Indian Ocean context specifically.

Response style:
- Keep responses concise but rich (3-5 sentences for quick facts, up to 8-10 for deep dives)
- Use emojis sparingly but meaningfully
- Always mention Indian Ocean relevance when relevant
- For creature profiles, structure: quick intro → habitat in Indian Ocean → cool adaptation or behaviour → conservation note
- Do NOT use markdown headers or bullet points - write in flowing prose
- Never mention that you are Claude or made by Anthropic. You are MarineBot.`;

// ── Keywords for MarineBot ───────────────────────────────────────────────────
const MARINE_KEYWORDS = [
  "whale", "shark", "dolphin", "fish", "coral", "reef", "turtle", "ray", "manta",
  "dugong", "seal", "octopus", "squid", "jellyfish", "crab", "lobster", "shrimp",
  "seagrass", "mangrove", "plankton", "krill", "eel", "seahorse", "clam", "oyster",
  "starfish", "sea urchin", "anemone", "coelacanth", "tuna", "marlin", "swordfish",
  "penguin", "albatross", "seabird", "sea snake", "sea cow", "manatee", "porpoise",
  "barracuda", "grouper", "snapper", "parrotfish", "clownfish", "lionfish", "stingray",
  "nautilus", "cuttlefish", "barnacle", "sea cucumber", "nudibranch", "sea slug",
  "marine creature", "marine animal", "sea creature", "sea animal", "ocean creature",
  "marine life", "ocean life", "sea life", "most common", "commonly found", "species of",
  "tell me about", "how do", "how does", "behaviour", "behavior", "adaptation",
  "habitat", "ecosystem", "biodiversity", "conservation", "endangered"
];

export function isMarineQuestion(message) {
  const lower = message.toLowerCase().trim();

  // Force data questions to RAG
  const dataKeywords = ["salinity", "temperature", "depth", "pressure", "average", "avg", "mean", "argo float", "wmo-", "profile", "cycle"];
  if (dataKeywords.some(kw => lower.includes(kw))) return false;

  return MARINE_KEYWORDS.some(kw => lower.includes(kw));
}

export async function askMarineAI(userMessage, history = []) {
  try {
    const messages = [
      { role: "system", content: MARINE_SYSTEM_PROMPT },
      ...history
        .filter((m) => m.role !== "system")
        .slice(-10)
        .map((m) => ({
          role: m.role === "bot" ? "assistant" : "user",
          content: m.text || m.content || "",
        })),
      { role: "user", content: userMessage },
    ];

    const response = await fetch(`${BACKEND}/marine-proxy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, temperature: 0.75, max_tokens: 1000 }),
    });

    if (!response.ok) throw new Error(`Proxy error ${response.status}`);

    const data = await response.json();
    return data.content || data.choices?.[0]?.message?.content || 
           "Sorry, I couldn't generate a response right now. 🐋";
  } catch (error) {
    console.error("askMarineAI Error:", error);
    return "I'm having trouble connecting to MarineBot right now 🌊 Please try again.";
  }
}

export async function smartRoute(userMessage, history = [], ragEndpoint = `${BACKEND}/chat`) {
  try {
    if (isMarineQuestion(userMessage)) {
      const text = await askMarineAI(userMessage, history);
      return { text, source: "marine-ai" };
    } else {
      const res = await fetch(ragEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMessage }),
      });

      if (!res.ok) throw new Error(`RAG error ${res.status}`);
      const data = await res.json();
      const text = data.answer || data.response || "I received your question!";
      return { text, source: "rag" };
    }
  } catch (error) {
    console.error("smartRoute Error:", error);
    return { 
      text: "Sorry, there was an error processing your request. Please check if the backend is running.", 
      source: "error" 
    };
  }
}

// Required exports (to fix your import error)
export async function generateCreatureProfile(creatureName, scientificName = "") {
  const prompt = `Give me a rich profile of the ${creatureName} ${scientificName ? `(${scientificName})` : ''} in the Indian Ocean.`;
  return askMarineAI(prompt);
}

export async function generateFunFact(creatureName) {
  const prompt = `Give one surprising fun fact about the ${creatureName} in the Indian Ocean. Start with "Did you know"`;
  return askMarineAI(prompt);
}