# Full Pipeline Test — Snøhetta
**Date:** 2026-04-29  
**Tester:** Alberto (dual role: Agency + Client)  
**Client email for test:** alberto@inboundlabs.co  

---

## The Fictional Client

| Field | Value |
|---|---|
| **Company** | Snøhetta |
| **Contact person** | Sofia Berg, Head of Communications |
| **Email (test)** | alberto@inboundlabs.co |
| **Website** | snohetta.com |
| **Industry** | Architecture & Design |
| **Founded** | 1989, Oslo / New York |
| **Size** | ~250 people, 4 offices |

**One-line brief:** Snøhetta is an interdisciplinary architecture, interior design, landscape, and brand strategy firm best known for the Oslo Opera House, the National September 11 Memorial Museum Pavilion, and the reimagining of Times Square. Their website needs a ground-up redesign that matches the conceptual rigor of their built work.

---

## STEP 1 — Generate the Proposal

Go to: **moood.studio/admin/generate**

Fill the form with these exact values:

### Basic info
| Field | Value |
|---|---|
| Client Name | Snøhetta |
| Client Email | alberto@inboundlabs.co |
| Project Name | Snøhetta — Digital Presence Redesign |
| Project Type | Website proposal |
| Size | Medium — 6 to 8 pages |
| Scenario | A — Brand-Free (agency full authority) |
| Narrative | Strategist generates content |

### Pages (8 total)
| # | Name | Type |
|---|---|---|
| 1 | Home | Homepage |
| 2 | Projects | Portfolio |
| 3 | Services | Services |
| 4 | Studio | About |
| 5 | People | About |
| 6 | Journal | Blog |
| 7 | Responsibility | About |
| 8 | Contact | Contact |

### Vision block
> Snøhetta's digital presence should feel like entering one of their buildings: an immediate, embodied shift in atmosphere. The new site will dissolve the boundary between architecture portfolio and brand philosophy — giving every visitor a sense of the firm's interdisciplinary intelligence before they've read a single line. The visual language will be sparse, monumental, and alive with controlled motion. Every interaction will feel authored, not assembled.

### Diagnosis (3 problems)

**Problem 1 — The portfolio is the whole story**  
> The current site leads entirely with projects, leaving the firm's philosophy, process, and breadth of disciplines invisible until a visitor actively digs. The work speaks; the thinking behind it does not. This creates a fundamental gap for clients who need to understand Snøhetta before they can trust them with a landmark commission.

**Problem 2 — No tonal hierarchy**  
> Architecture, interiors, landscape, and brand strategy live side by side with equal visual weight — a flat taxonomy that obscures the firm's genuine depth. A client looking for a landscape architect and one looking for a brand strategy partner arrive at the same page and feel the same thing: nothing in particular.

**Problem 3 — The site ages on every visit**  
> The current typographic and layout system does not scale with the firm's output. New projects are added but the grid does not evolve. There is no editorial layer — no way to signal which work is formative, which is recent, which is generational. The site looks like an archive, not a living body of work.

### Roadmap (1 phase)

**Phase 1 — Foundation & Architecture (Weeks 1–4)**  
Strategy, narrative, design system definition, skeleton build, and initial mockup. Deliverables: PRD, Manifesto, full narrative by page, Tension Map, skeleton.html, mockup.html (desktop + mobile).

### Investment (1 line item)

| Item | Price |
|---|---|
| Full Website Redesign — 8 pages | $24,000 USD |

---

## STEP 2 — Approve the Proposal (acting as client)

1. Open the proposal link from the email sent to alberto@inboundlabs.co
2. Review it — should look polished and complete
3. Click **Approve Project**
4. You will receive a second email at alberto@inboundlabs.co with:
   - Your project code (`MSD-2026-XXXX`)
   - A button: **Start your brief →** → links to `moood.studio/client-intake?code=MSD-2026-XXXX`

---

## STEP 3 — Complete the Client Intake (acting as client)

Go to the intake link from the approval email (`moood.studio/client-intake?code=MSD-XXXX`).  
The code auto-fills from the URL. The system validates it and **goes straight to the Welcome screen** — no code entry needed.

**Flow (Scenario A — Brand-Free, Strategist writes):**  
Welcome → Sources → Visual references → Brand assets → Competitors → Audience → Conversion → Confirmation

### Screen: Welcome (auto-shown, no input needed)
The system displays what it already knows from the passport:
- Project name: **Snøhetta — Digital Presence Redesign**
- Scenario A — Brand-Free
- 8 confirmed pages
- Sidebar updates to "Snøhetta." with the upcoming steps listed

Click **Continue** to proceed.

### Slide: Sources
Upload evidence documents for the Strategist. Use any files you have, or create quick dummies:
- A text file named `snohetta-brief.txt` with: *"We are an interdisciplinary architecture and design firm. Founded Oslo 1989. 250 people. Known for Oslo Opera House, Times Square redesign, National September 11 Memorial Museum Pavilion."*
- Optional: any PDF from desktop

### Slide: Visual references
Paste links to sites that inspire the aesthetic direction:

| URL | Note |
|---|---|
| snohetta.com | Current site (reference for what to evolve from) |
| dezeen.com | Editorial clarity, strong typography |
| serpentinegalleries.org | Cultural institution tone, white space |
| vitsoe.com | Minimal, principled, long-form |

### Slide: Brand assets
**Scenario A = Brand-Free → select "None — we'll define the brand from scratch"**

### Slide: Competitors
Enter one per field:

| Competitor |
|---|
| big.dk |
| zaha-hadid.com |
| adjaye.com |
| studiogangarchitects.com |
| gensler.com |

### Slide: Audience

> Cultural institutions, municipal governments, and private developers commissioning landmark or civic projects — $10M+ budget range. Secondary: junior architects and designers considering Snøhetta as a place to work. Institutional clients arrive via referral or award recognition; they know the name but not the breadth of disciplines.

### Slide: Conversion goal

> Book an initial conversation with Snøhetta's new business team.

### Confirmation screen
Intake submitted. Alberto receives the full intake email with Strategist activation prompt.

---

## STEP 4 — Agency receives intake email

Alberto (alberto@gmail.com) receives:
- Intake summary with all answers
- Strategist activation prompt with code, client name, pages, and flags

---

## STEP 5 — Activate the Strategist (in Claude Code)

Open Claude Code and say:

> **"Activa el Strategy Director para Snøhetta. Código: MSD-2026-XXXX. Intake completado."**

The Strategist will:
1. Read the intake data
2. Write PRD + Manifesto
3. Write narrative for all 8 pages
4. Produce the Tension Map

Once the narrative is ready, push it to the Narrative Review using the API call below.

---

## STEP 6 — Load narratives into the review system

Once the Strategist has produced narratives, call this endpoint to store them:

```bash
curl -X POST "https://moood.studio/api/narratives?action=set" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $NARRATIVE_ADMIN_TOKEN" \
  -d @AGENCY_CORE/test/narratives-payload.json
```

A **sample narratives payload** is provided in `AGENCY_CORE/test/narratives-payload.json` — use it to test the full flow even before the Strategist has run.

After loading, you'll receive in the response:
```json
{ "success": true, "reviewUrl": "https://moood.studio/narrative-review?code=MSD-2026-XXXX" }
```

---

## STEP 7 — Client reviews narratives (acting as client)

Go to the `reviewUrl` from the previous step.  
As the client (alberto@inboundlabs.co), you'll see 8 page cards.

**Test script:**
- Approve pages 1–5 and 8 without comment
- Request changes on page 6 (Journal): *"The tone feels too formal for an editorial section. We'd prefer something more conversational — less like a press release, more like a letter from the studio."*
- Request changes on page 7 (Responsibility): *"Can we lean harder into the climate angle? We want this to be the most forward-thinking section on the site."*
- Click **Submit feedback**

Alberto (alberto@gmail.com) receives the review email with the full breakdown.

---

## STEP 8 — Activate the Profiler (in Claude Code)

Once narratives are approved (or partially approved with revisions incorporated), say:

> **"Activa al Profiler para Snøhetta. Las narrativas están aprobadas. Comienza el CLIENT_COMPONENT_MAP."**

---

## STEP 9 — Activate the Builder (in Claude Code)

Once the Profiler has produced `CLIENT_COMPONENT_MAP.md`, say:

> **"Activa al Builder para Snøhetta. El component map está listo."**

The Builder will produce `skeleton.html` + `skeleton.css` for the 8 pages.

---

## STEP 10 — Staging deploy + client review

Once the Builder is done:
1. Deploy the skeleton to Vercel staging: `vercel` (no `--prod`)
2. Share the staging URL with the client for review

---

## What to stress-test

| Checkpoint | What to verify |
|---|---|
| Proposal email → Alberto | Arrives with strategy prompt block, correct code |
| Proposal email → Client | Clean, professional, approval link works |
| Intake URL auto-activation | Code in URL pre-fills + skips scope slide |
| Passport data in sitemap | 8 pages match exactly what was set in proposal |
| Narrative Review load | All 8 pages appear, narrative content renders |
| Approve flow | Status badge updates, progress bar fills |
| Changes flow | Orange state, comment saves correctly |
| Partial submit | Submit bar appears, button disabled until all reviewed |
| Final submit | Email arrives at alberto@gmail.com with full summary |
| Email content | Approved vs changes clearly differentiated |
