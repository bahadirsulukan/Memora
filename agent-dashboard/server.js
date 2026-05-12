import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Anthropic from "@anthropic-ai/sdk";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// ─── Config ────────────────────────────────────────────────────────────────
const AGENTS_DIR = path.join(
  __dirname,
  "../Travel Memory Archive App/.claude/agents"
);
const MODEL = "claude-opus-4-7";

// ─── Load agent .md files ───────────────────────────────────────────────────
function loadAgentPrompt(agentFile) {
  const filePath = path.join(AGENTS_DIR, agentFile);
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    // Strip YAML frontmatter (--- ... ---)
    return content.replace(/^---[\s\S]*?---\n/, "").trim();
  } catch {
    return null;
  }
}

function getAvailableAgents() {
  try {
    return fs
      .readdirSync(AGENTS_DIR)
      .filter((f) => f.endsWith(".md") && f !== "orchestrator.md")
      .map((f) => f.replace(".md", ""));
  } catch {
    return [];
  }
}

// ─── Orchestrator: decide which agents to delegate to ──────────────────────
async function orchestrate(task, client) {
  const orchestratorPrompt = loadAgentPrompt("orchestrator.md");
  const availableAgents = getAvailableAgents();

  const systemPrompt =
    orchestratorPrompt ||
    `Du bist der Orchestrator des Memora Agent Teams. Analysiere die Aufgabe und entscheide welche Agenten benötigt werden.`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system:
      systemPrompt +
      `\n\n## Verfügbare Agenten\n${availableAgents.join(", ")}\n\n` +
      `## Antwort-Format (IMMER genau so antworten!)\n` +
      `Gib NUR ein gültiges JSON zurück (kein Markdown, keine Erklärung davor/danach):\n` +
      `{\n  "plan": "Kurze Beschreibung was du tust",\n  "agents": ["agent-name-1", "agent-name-2"]\n}`,
    messages: [
      {
        role: "user",
        content: `Aufgabe: ${task}`,
      },
    ],
  });

  const text = response.content[0].text.trim();

  // Extract JSON even if wrapped in markdown
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Orchestrator returned no valid JSON");

  return JSON.parse(jsonMatch[0]);
}

// ─── Agent Worker: process task with agent's system prompt ─────────────────
async function runAgent(agentName, task, orchestratorPlan, client) {
  const agentFile = `${agentName}.md`;
  const agentPrompt = loadAgentPrompt(agentFile);

  if (!agentPrompt) {
    return `[${agentName}] Kein Prompt gefunden (${agentFile} fehlt)`;
  }

  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 2048,
    system: agentPrompt,
    messages: [
      {
        role: "user",
        content:
          `Der Orchestrator hat dich für folgende Aufgabe ausgewählt:\n\n` +
          `**Aufgabe:** ${task}\n\n` +
          `**Orchestrator-Plan:** ${orchestratorPlan}\n\n` +
          `Bitte bearbeite deinen Teil der Aufgabe vollständig und konkret.`,
      },
    ],
  });

  return stream;
}

// ─── SSE endpoint ──────────────────────────────────────────────────────────
app.post("/api/task", async (req, res) => {
  const { task, apiKey } = req.body;

  if (!task) {
    return res.status(400).json({ error: "Aufgabe fehlt" });
  }
  if (!apiKey) {
    return res.status(400).json({ error: "API Key fehlt" });
  }

  // Set up SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const send = (eventName, data) => {
    res.write(`event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const client = new Anthropic({ apiKey });

    // Step 1: Orchestrator analyzes task
    send("status", {
      agent: "orchestrator",
      status: "working",
      message: "Analysiere Aufgabe...",
    });

    let orchestratorResult;
    try {
      orchestratorResult = await orchestrate(task, client);
    } catch (err) {
      send("status", {
        agent: "orchestrator",
        status: "error",
        message: `Orchestrator Fehler: ${err.message}`,
      });
      send("done", { success: false });
      res.end();
      return;
    }

    send("orchestrator_result", {
      plan: orchestratorResult.plan,
      agents: orchestratorResult.agents,
    });

    send("status", {
      agent: "orchestrator",
      status: "done",
      message: `Plan: ${orchestratorResult.plan}`,
    });

    // Step 2: Run each assigned agent
    for (const agentName of orchestratorResult.agents) {
      send("status", {
        agent: agentName,
        status: "working",
        message: "Bearbeite Aufgabe...",
      });

      try {
        const stream = await runAgent(
          agentName,
          task,
          orchestratorResult.plan,
          client
        );

        let fullText = "";

        // Stream token by token
        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            fullText += chunk.delta.text;
            send("agent_chunk", {
              agent: agentName,
              chunk: chunk.delta.text,
            });
          }
        }

        send("agent_done", {
          agent: agentName,
          result: fullText,
        });

        send("status", {
          agent: agentName,
          status: "done",
          message: "Fertig ✓",
        });
      } catch (err) {
        send("status", {
          agent: agentName,
          status: "error",
          message: `Fehler: ${err.message}`,
        });
      }
    }

    send("done", { success: true });
  } catch (err) {
    send("error", { message: err.message });
  }

  res.end();
});

// ─── Health check ──────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  const agents = getAvailableAgents();
  res.json({
    status: "ok",
    agents,
    model: MODEL,
    agentsDir: AGENTS_DIR,
  });
});

// ─── Start ─────────────────────────────────────────────────────────────────
const PORT = 4321;
app.listen(PORT, () => {
  console.log(`\n🏢 Memora HQ läuft auf http://localhost:${PORT}`);
  console.log(`📁 Agents Verzeichnis: ${AGENTS_DIR}`);
  console.log(`🤖 Verfügbare Agenten: ${getAvailableAgents().join(", ")}`);
  console.log(`\nDashboard: http://localhost:${PORT}/index.html`);
});
