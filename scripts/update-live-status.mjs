#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const REPO_DIR = '/data/.openclaw/workspace/projects/status-page';
const STATUS_PATH = path.join(REPO_DIR, 'agent-status.json');
const SESSIONS_PATH = '/data/.openclaw/agents/main/sessions/sessions.json';
const CRON_RUNS_DIR = '/data/.openclaw/cron/runs';

const AGENTS = [
  {
    id: 'oscar',
    name: 'Oscar',
    role: 'Orchestrator',
    specialty: 'Planning, delegation, and team coordination',
    model: 'gpt-5.4',
    baseStatus: 'standby',
    baseHealth: 'good',
    notes: ''
  },
  {
    id: 'vera',
    name: 'Vera',
    role: 'Fact Checker & Research',
    specialty: 'Verification, sourcing, and evidence-backed research',
    model: 'gpt-5.4',
    baseStatus: 'standby',
    baseHealth: 'good',
    notes: ''
  },
  {
    id: 'forge',
    name: 'Forge',
    role: 'Coding Agent',
    specialty: 'Implementation, refactors, and technical precision',
    model: 'gpt-5.4',
    baseStatus: 'standby',
    baseHealth: 'good',
    notes: ''
  },
  {
    id: 'sentinel',
    name: 'Sentinel',
    role: 'Security & Compliance',
    specialty: 'Audit, risk assessment, and policy enforcement',
    model: 'gpt-5.4',
    baseStatus: 'standby',
    baseHealth: 'good',
    notes: ''
  },
  {
    id: 'scribe',
    name: 'Scribe',
    role: 'Operations & Documentation',
    specialty: 'Record-keeping, changelogs, and operational truth',
    model: 'gpt-5.4',
    baseStatus: 'standby',
    baseHealth: 'good',
    notes: ''
  },
  {
    id: 'quill',
    name: 'Quill',
    role: 'Brand Voice & Copywriting',
    specialty: 'Voice, copy polish, and public-facing language',
    model: 'gpt-5.4',
    baseStatus: 'standby',
    baseHealth: 'good',
    notes: ''
  },
  {
    id: 'probe',
    name: 'Probe',
    role: 'QA & Verification',
    specialty: 'Independent output review and adversarial testing',
    model: 'gpt-5.4',
    baseStatus: 'standby',
    baseHealth: 'good',
    notes: ''
  },
  {
    id: 'ledger',
    name: 'Ledger',
    role: 'AI Monetization',
    specialty: 'Revenue opportunity identification and feasibility scoring',
    model: 'gpt-5.4',
    baseStatus: 'offline',
    baseHealth: 'paused',
    notes: 'Marked paused in TEAM.md until explicitly re-enabled.'
  }
];

const CRON_MAP = {
  sentinel: [
    { jobId: 'd13bcaa6-ba60-4ce0-96aa-b88141b3a9f8', label: 'Daily security audit completed' }
  ],
  scribe: [
    { jobId: '35c46d57-1eb3-4abf-9b8d-37d1ab4ae24c', label: 'Midday sync completed' },
    { jobId: '7bdb669e-2ed4-4ff3-b74e-bf1dbae38a4c', label: 'End-of-day pass completed' }
  ],
  ledger: [
    { jobId: '9ef85e92-797a-4f87-ab13-0cfd4b2becab', label: 'Daily monetization brief completed' }
  ]
};

const LABEL_PREFIXES = {
  vera: ['vera'],
  forge: ['forge'],
  sentinel: ['sentinel'],
  scribe: ['scribe'],
  quill: ['quill'],
  probe: ['probe'],
  ledger: ['ledger'],
  oscar: ['oscar', 'internal-oscar']
};

const ACTIVE_WINDOW_MS = 90 * 60 * 1000;
const WARM_WINDOW_MS = 6 * 60 * 60 * 1000;
const RECENT_TASK_LIMIT = 3;

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function readJsonl(filePath) {
  if (!fs.existsSync(filePath)) return [];
  return fs.readFileSync(filePath, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function iso(ts) {
  return new Date(ts).toISOString();
}

function slugWords(text) {
  return text
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function titleCase(text) {
  return text.replace(/\b\w/g, (c) => c.toUpperCase());
}

function prettifyTask(label) {
  let cleaned = slugWords(label)
    .replace(/^(internal oscar|oscar|vera|forge|sentinel|scribe|quill|probe|ledger)\s*[:\-–—]?\s*/i, '')
    .replace(/^team\s*[:\-–—]?\s*/i, '')
    .replace(/\b\d{4}-\d{2}-\d{2}\b/g, '')
    .replace(/\b\d{2}:\d{2}\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) return titleCase(slugWords(label));

  return titleCase(cleaned)
    .replace(/Ui/g, 'UI')
    .replace(/Qa/g, 'QA')
    .replace(/Api/g, 'API')
    .replace(/Next Js/g, 'Next.js');
}

function statusFromAge(ageMs, baseStatus) {
  if (ageMs <= ACTIVE_WINDOW_MS) return 'awake';
  if (ageMs <= WARM_WINDOW_MS) return 'standby';
  return baseStatus === 'offline' ? 'offline' : 'dreaming';
}

function eventFromSession(entry) {
  return {
    ts: entry.updatedAt,
    task: prettifyTask(entry.label || 'Session activity'),
    raw: entry.label || 'Session activity',
    source: 'session'
  };
}

function eventFromCron(entry, fallbackLabel) {
  return {
    ts: entry.ts || entry.runAtMs,
    task: fallbackLabel,
    raw: entry.summary || fallbackLabel,
    source: 'cron',
    status: entry.status
  };
}

function collectSessionEvents() {
  const sessions = readJson(SESSIONS_PATH);
  const perAgent = new Map();
  let oscarMain = null;

  for (const [key, value] of Object.entries(sessions)) {
    if (key === 'agent:main:main' && value.updatedAt) {
      oscarMain = value.updatedAt;
    }

    const label = (value.label || '').toLowerCase();
    if (!label) continue;

    for (const [agentId, prefixes] of Object.entries(LABEL_PREFIXES)) {
      if (!prefixes.some((prefix) => label.startsWith(prefix))) continue;
      const list = perAgent.get(agentId) || [];
      list.push(eventFromSession(value));
      perAgent.set(agentId, list);
      break;
    }
  }

  return { perAgent, oscarMain };
}

function collectCronEvents() {
  const perAgent = new Map();

  for (const [agentId, jobs] of Object.entries(CRON_MAP)) {
    const events = [];
    for (const job of jobs) {
      const filePath = path.join(CRON_RUNS_DIR, `${job.jobId}.jsonl`);
      const entries = readJsonl(filePath)
        .filter((entry) => entry.action === 'finished' && entry.status === 'ok')
        .map((entry) => eventFromCron(entry, job.label));
      events.push(...entries);
    }
    events.sort((a, b) => b.ts - a.ts);
    perAgent.set(agentId, events);
  }

  return perAgent;
}

function mergeUniqueTasks(events) {
  const seen = new Set();
  const merged = [];
  for (const event of events.sort((a, b) => b.ts - a.ts)) {
    const key = `${event.task}|${event.ts}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push({ task: event.task, completed_at: iso(event.ts) });
    if (merged.length >= RECENT_TASK_LIMIT) break;
  }
  return merged;
}

function buildAgent(agent, nowMs, sessionEvents, cronEvents, oscarMainTs) {
  const events = [...(sessionEvents.get(agent.id) || []), ...(cronEvents.get(agent.id) || [])]
    .filter((event) => Number.isFinite(event.ts))
    .sort((a, b) => b.ts - a.ts);

  if (agent.id === 'oscar' && oscarMainTs) {
    events.unshift({
      ts: oscarMainTs,
      task: 'Coordinating active operations',
      raw: 'Main session activity',
      source: 'main-session'
    });
  }

  const latest = events[0];
  const lastSeenMs = latest?.ts || nowMs - (48 * 60 * 60 * 1000);
  const ageMs = Math.max(0, nowMs - lastSeenMs);

  let status = statusFromAge(ageMs, agent.baseStatus);
  let health = agent.baseHealth;
  let notes = agent.notes;
  let currentTask = ageMs <= ACTIVE_WINDOW_MS ? latest?.task || null : null;

  if (agent.id === 'ledger') {
    const latestCron = (cronEvents.get('ledger') || [])[0];
    if (latestCron) {
      status = ageMs <= ACTIVE_WINDOW_MS ? 'awake' : 'standby';
      health = 'degraded';
      currentTask = ageMs <= ACTIVE_WINDOW_MS ? latestCron.task : null;
      notes = 'TEAM.md says paused, but the scheduled Ledger brief is still running live. Docs/config need reconciliation.';
    }
  }

  if (agent.id === 'oscar' && ageMs <= ACTIVE_WINDOW_MS) {
    status = 'awake';
    health = 'good';
  }

  return {
    id: agent.id,
    name: agent.name,
    role: agent.role,
    specialty: agent.specialty,
    model: agent.model,
    status,
    health,
    current_task: currentTask,
    last_seen: iso(lastSeenMs),
    notes,
    recent_tasks: mergeUniqueTasks(events)
  };
}

function main() {
  const nowMs = Date.now();
  const { perAgent: sessionEvents, oscarMain } = collectSessionEvents();
  const cronEvents = collectCronEvents();
  const agents = AGENTS.map((agent) => buildAgent(agent, nowMs, sessionEvents, cronEvents, oscarMain));
  const lastUpdatedMs = Math.max(...agents.map((agent) => new Date(agent.last_seen).getTime()));

  const payload = {
    last_updated: iso(lastUpdatedMs),
    agents
  };

  const next = `${JSON.stringify(payload, null, 2)}\n`;
  const prev = fs.existsSync(STATUS_PATH) ? fs.readFileSync(STATUS_PATH, 'utf8') : '';

  if (process.argv.includes('--check')) {
    process.stdout.write(next);
    process.exit(0);
  }

  if (prev !== next) {
    fs.writeFileSync(STATUS_PATH, next);
    console.log(`updated ${STATUS_PATH}`);
  } else {
    console.log('no changes');
  }
}

main();
