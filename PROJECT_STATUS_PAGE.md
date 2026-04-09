# Project: Summit Forge Labs — Agent Status Page

**Owner:** Oscar (orchestrator)
**Requested by:** Josh
**Created:** 2026-04-09
**Status:** In Progress

---

## Objective

Build a polished, premium web-based agent status dashboard that Josh can open at any time to see the state of the entire AI team — without interrupting anyone.

---

## Requirements

### Per-agent tile must show:
- Agent name
- Specialty / role
- Current status: `awake` | `dreaming` | `working` | `offline`
- Health indicator
- Current task / last known activity
- Profile picture (state-aware: changes based on status/health)

### Visual style:
- Premium, polished — reflects Summit Forge Labs attention to detail
- Incorporates Summit Forge Labs logo
- Multiple profile pic states per agent:
  - Default / awake
  - Working / focused
  - Sleeping / dreaming
  - Poor health / degraded

### Profile picture style:
- TBD — team to agree on a unified art direction
- Each agent then crafts their own image generation prompt in that style
- Logo to be incorporated into the page header/branding

---

## Architecture

### Data layer
- `agent-status.json` — each agent writes their status when they run
- Updated by agents: status, health, current_task, last_seen, notes

### Frontend
- Single-file HTML/CSS/JS status page
- Reads `agent-status.json` (or inline for static version)
- Auto-refreshes (configurable interval)
- Responsive tile grid
- Dark/premium theme

### Delivery
- Served via OpenClaw canvas or local HTTP
- Optionally: exportable as a standalone `.html` file

---

## Team Roster (for tiles)

| Agent    | Role                          | Model                     |
|----------|-------------------------------|---------------------------|
| Oscar    | Orchestrator                  | claude-sonnet-4-6         |
| Vera     | Fact Checker & Research       | gpt-5.4                   |
| Forge    | Coding Agent                  | gpt-5.4                   |
| Sentinel | Security & Compliance         | gpt-5.4                   |
| Scribe   | Operations & Documentation    | Claude Opus 4.6           |
| Probe    | QA & Verification             | gpt-5.4-mini (target)     |
| Ledger   | AI Monetization               | gpt-5.4 (paused)          |

---

## Phase Plan

### Phase 1 — Structure & Layout (no logo needed)
- [ ] Forge builds HTML/CSS/JS scaffold with tile grid
- [ ] `agent-status.json` schema defined
- [ ] Dark premium theme implemented
- [ ] Mock data for all 7 agents

### Phase 2 — Branding & Identity (requires logo)
- [ ] Logo integrated into header
- [ ] Color palette derived from logo
- [ ] Art style agreed by team
- [ ] Each agent drafts image generation prompt

### Phase 3 — Profile Images
- [ ] Images generated per agent (all states)
- [ ] Images integrated into tiles

### Phase 4 — Data Integration
- [ ] Agents write to `agent-status.json` on run
- [ ] Live refresh working

### Phase 5 — QA
- [ ] Probe reviews for completeness and polish
- [ ] Oscar final sign-off
- [ ] Josh review

---

## Changelog

| Date       | Change                            | By     |
|------------|-----------------------------------|--------|
| 2026-04-09 | Project created, Phase 1 started  | Oscar  |
| 2026-04-09 | Phase 1 HTML/CSS/JS scaffold completed by Forge | Forge |
| 2026-04-09 | Brand guide created (BRAND.md) — logo analyzed, color palette derived from physical plaque | Oscar |
| 2026-04-09 | Image prompts drafted (IMAGE_PROMPTS.md) | Oscar |
| 2026-04-09 | Art style iteration: tested Stylized 3D Render, Graphic Novel, and Playing Card Illustration styles | Oscar |
| 2026-04-09 | Two test portraits generated (Oscar, Sentinel) in playing card style — awaiting Josh verdict | Oscar |
| 2026-04-09 | Logo variants and plaque photo saved to projects/status-page/ | Oscar |
| 2026-04-09 | agent-status.json schema defined and populated with initial mock data | Oscar |
