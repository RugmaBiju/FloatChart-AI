// ─── marineAI.js ─────────────────────────────────────────────────────────────
// All calls to the Anthropic API for marine life / ocean biology knowledge.
// Your Python RAG backend handles Argo float data questions.
// This file handles everything about ocean animals, ecosystems, marine biology.
// ─────────────────────────────────────────────────────────────────────────────

const ANTHROPIC_API = "http://localhost:8000/anthropic-proxy";
const MODEL = "claude-sonnet-4-20250514";

const MARINE_SYSTEM_PROMPT = `You are MarineBot, an expert marine biologist and oceanographer specialising in the Indian Ocean. You have deep knowledge of:
- Marine animals: fish, mammals, reptiles, invertebrates, and microorganisms of the Indian Ocean
- Ecosystems: coral reefs, seagrass beds, mangroves, open ocean, deep sea zones
- Conservation status, threats, and protection efforts
- Indian Ocean geography, currents, and their effect on marine life
- Interesting behaviours, adaptations, and ecology

Personality: You are enthusiastic, educational, and engaging. You use vivid descriptions and analogies. You always connect animals to the Indian Ocean context specifically.

Response style:
- Keep responses concise but rich (3–5 sentences for quick facts, up to 8–10 for deep dives)
- Use emojis sparingly but meaningfully
- Always mention Indian Ocean relevance when relevant
- For creature profiles, structure: quick intro → habitat in Indian Ocean → cool adaptation or behaviour → conservation note
- Do NOT use markdown headers or bullet points — write in flowing prose
- Never mention that you are Claude or made by Anthropic. You are MarineBot.`;

// ── Keywords that indicate a marine-life question (vs an ocean-data question) ──
const MARINE_KEYWORDS = [
  "whale", "shark", "dolphin", "fish", "coral", "reef", "turtle", "ray", "manta",
  "dugong", "seal", "octopus", "squid", "jellyfish", "crab", "lobster", "shrimp",
  "seagrass", "mangrove", "plankton", "krill", "eel", "seahorse", "clam", "oyster",
  "starfish", "sea urchin", "anemone", "coelacanth", "tuna", "marlin", "swordfish",
  "species", "animal", "creature", "marine life", "marine animal", "ocean life",
  "bioluminescent", "migration", "breeding", "habitat", "ecosystem", "biodiversity",
  "endangered", "predator", "prey", "food chain", "deep sea", "mesopelagic",
  "epipelagic", "abyssal", "reef fish", "pelagic", "benthic", "phytoplankton",
  "zooplankton", "spawn", "nest", "pod", "school of fish", "hunt", "feed",
];

/**
 * Returns true if the message is likely a marine-life/biology question.
 * Returns false if it's likely an ocean-data/float/measurement question
 * (those should go to your Python RAG backend instead).
 */
export function isMarineQuestion(message) {
  const lower = message.toLowerCase();
  return MARINE_KEYWORDS.some((kw) => lower.includes(kw));
}

/**
 * Ask the marine AI a question. Returns the full text response.
 * @param {string} userMessage
 * @param {Array}  history  - [{role:"user"|"assistant", content:string}]
 */
export async function askMarineAI(userMessage, history = []) {
  const messages = [
    ...history.map((m) => ({
      role: m.role === "bot" ? "assistant" : m.role,
      content: m.text || m.content,
    })),
    { role: "user", content: userMessage },
  ];

  const response = await fetch(ANTHROPIC_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1000,
      system: MARINE_SYSTEM_PROMPT,
      messages,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error ${response.status}`);
  }

  const data = await response.json();
  const text = data.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");
  return text;
}

/**
 * Generate a rich AI profile for a specific creature in the Indian Ocean context.
 * Used on the Marine Life page when a user clicks a creature card.
 * @param {string} creatureName
 * @param {string} scientificName
 */
export async function generateCreatureProfile(creatureName, scientificName) {
  const prompt = `Give me a rich, engaging profile of the ${creatureName} (${scientificName}) specifically in the context of the Indian Ocean. Cover: where exactly in the Indian Ocean they are found, one remarkable adaptation or behaviour, their ecological role, and their current conservation status. Keep it to 4–5 sentences, vivid and educational.`;

  return askMarineAI(prompt);
}

/**
 * Generate a "Did You Know?" fun fact for a creature. Short, punchy, surprising.
 */
export async function generateFunFact(creatureName) {
  const prompt = `Give me one surprising, little-known fun fact about the ${creatureName} in the Indian Ocean. One sentence, punchy and memorable. Start with "Did you know…"`;
  return askMarineAI(prompt);
}

/**
 * Given any user question, decide which backend to use and return the answer.
 * - Marine/biology questions → Anthropic API (this file)
 * - Ocean data/float/measurement questions → your Python RAG backend
 *
 * @param {string} userMessage
 * @param {Array}  history
 * @param {string} ragEndpoint  - e.g. "http://localhost:8000/chat"
 * @returns {{ text: string, source: "marine-ai" | "rag" }}
 */
export async function smartRoute(userMessage, history = [], ragEndpoint = "http://localhost:8000/chat") {
  if (isMarineQuestion(userMessage)) {
    const text = await askMarineAI(userMessage, history);
    return { text, source: "marine-ai" };
  } else {
    const res = await fetch(ragEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage }),
    });
    if (!res.ok) throw new Error(`RAG backend error ${res.status}`);
    const data = await res.json();
    const text = data.response || data.answer || "I received your question!";
    return { text, source: "rag" };
  }
}