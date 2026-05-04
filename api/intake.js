const { Resend } = require('resend');
const Busboy = require('busboy');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { buildEmail, dataTable } = require('./_email');

const resend = new Resend(process.env.RESEND_API_KEY);

// --- HELPERS FROM CLIENT-INTAKE ---
async function extractText(buffer, filename, mimeType) {
    const ext = filename.split('.').pop().toLowerCase();
    if (['txt', 'md', 'html', 'htm', 'rtf'].includes(ext)) return buffer.toString('utf-8');
    if (ext === 'pdf' || mimeType === 'application/pdf') { const data = await pdfParse(buffer); return data.text; }
    if (['doc', 'docx'].includes(ext) || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const result = await mammoth.extractRawText({ buffer }); return result.value;
    }
    return buffer.toString('utf-8');
}

async function callGemini(prompt) {
    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GOOGLE_AI_STUDIO_KEY}`;
    const res = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.1 } })
    });
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
}

async function callGeminiJson(prompt) {
    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GOOGLE_AI_STUDIO_KEY}`;
    const res = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 2048 }
        })
    });
    const data = await res.json();
    if (data.error) console.error('[gemini] API error:', JSON.stringify(data.error));
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    if (!text) console.error('[gemini] Empty. finishReason:', data.candidates?.[0]?.finishReason, 'full:', JSON.stringify(data).slice(0, 400));
    return text;
}

// --- HELPERS ---
function generateStrategyPrompt(data) {
    const { leadName, projectName, scenario, hasNarrative, pages, visualRefs } = data;
    const pagesList = (pages || []).map(p => `- ${p.name || p} — ${p.type || 'landing'}`).join('\n');
    const refsList = (Array.isArray(visualRefs) ? visualRefs : []).join('\n');
    const scenarioLabel = scenario === 'A' ? 'A — Brand-Free' : (scenario || 'A — Brand-Free');
    
    if (hasNarrative) {
        return `
/strategy-director

# STRATEGY INTAKE: ${projectName}
**Lead:** ${leadName || 'Client'}
**Scenario:** ${scenarioLabel}
**Mode:** NARRATIVE-PROVIDED — client copy is LOCKED. Do not write narrative.

## [GATE 0] — MANDATORY WORKSPACE ISOLATION
1. **Research Requirement**: Run \`ls PROJECTS/\` to identify the highest existing version of \`PROJECTS/Audi-AG\`.
2. **Strict Versioning**: You MUST increment the version number by exactly +1.
3. **Ghost Creation**: Create the new folder \`PROJECTS/Audi-AG-V[N]\`.

## Project Protocol (Phase-by-Phase)
1. **Phase 1 (Setup)**: Generate \`01-PRD.md\` — mark narrative as CLIENT-LOCKED.
2. **Phase 2 (SKIP)**: Narrative provided by client. DO NOT write 03-NARRATIVE.md.
3. **Phase 3 (SKIP)**: DO NOT run Strategic Audit or Tension Map.
4. **HANDOFF → PROFILER**: Activate /the-profiler with the visual references below.

## Pages
${pagesList}

## Visual References
${refsList}
        `.trim();
    } else {
        return `
/strategy-director

# STRATEGY INTAKE: ${projectName}
**Lead:** ${leadName || 'Client'}
**Scenario:** ${scenarioLabel}

## [GATE 0] — MANDATORY WORKSPACE ISOLATION
1. **Research Requirement**: Run \`ls PROJECTS/\` to identify the highest existing version of \`PROJECTS/Audi-AG\`.
2. **Strict Versioning**: You MUST increment the version number by exactly +1.
3. **Ghost Creation**: Create the new folder \`PROJECTS/Audi-AG-V[N]\`.

## Project Protocol (Phase-by-Phase)
1. **Phase 1 (Setup)**: Generate \`01-PRD.md\`
2. **Phase 2 (Audit)**: Execute \`02-STRATEGIC-AUDIT.md\` + \`04-TENSION_MAP.md\`.
3. **Phase 3 (Scripting)**: Deliver \`03-NARRATIVE.md\` for **Landing Page**.
4. **Phase 4 (Validation)**: Run \`05-VISITOR_REVIEW.md\`.
5. **Phase 5 (Handoff)**: Activate /the-profiler with visual references below.

## Pages
${pagesList}

## Visual References
${refsList}
        `.trim();
    }
}

// --- CONTROLLER ---
module.exports = async (req, res) => {
    const { mode } = req.query;

    try {
        // 1. LEGACY STRATEGIC INTAKE (mode=strategic)
        if (mode === 'strategic') {
            // Already handled in unified flow, but kept for safety
        }

        // 2. CLIENT INTAKE APPROVAL (mode=approve)
        if (mode === 'approve' && req.method === 'POST') {
            const data = req.body || {};
            const { projectName } = data;
            
            const prompt = generateStrategyPrompt(data);

            // Notify Alberto
            await resend.emails.send({
                from: 'Moood Intake <notifications@moood.studio>',
                to: ['alberto.contreras@gmail.com'],
                subject: `[STRATEGY ACTIVATION] ${projectName}`,
                html: buildEmail({ 
                    projectName, 
                    context: 'Activation', 
                    headline: 'Strategy Ready.', 
                    body: `<pre style="white-space:pre-wrap; font-family:monospace; font-size:13px; background:#f7f7f7; padding:20px; border-radius:8px; border:1px solid #eee;">${prompt}</pre>` 
                })
            });
            return res.status(200).json({ success: true });
        }

        // 3. MAIN CLIENT INTAKE SUBMISSION (Default / mode=submit)
        if (req.method === 'POST') {
            const busboy = Busboy({ headers: req.headers });
            const fields = {};
            const files = [];

            const rawBody = await new Promise((resolve, reject) => {
                const chunks = [];
                req.on('data', c => chunks.push(c));
                req.on('end', () => resolve(Buffer.concat(chunks)));
                req.on('error', reject);
            });

            await new Promise((resolve, reject) => {
                busboy.on('field', (name, val) => { fields[name] = val; });
                busboy.on('file', (name, stream, info) => {
                    const chunks = [];
                    stream.on('data', c => chunks.push(c));
                    stream.on('end', () => {
                        files.push({ fieldname: name, filename: info.filename, mimeType: info.mimeType, buffer: Buffer.concat(chunks) });
                    });
                });
                busboy.on('finish', resolve);
                busboy.on('error', reject);
                busboy.write(rawBody);
                busboy.end();
            });

            const { projectName, leadName, intakePath, scenario, scope, visualRefs: visualRefsRaw } = fields;
            const hasNarrative = intakePath === 'narrative';
            const visualRefs = visualRefsRaw ? JSON.parse(visualRefsRaw) : [];

            // STRATEGY PATH (Legacy prompt generation)
            if (intakePath === 'strategy') {
                const prompt = generateStrategyPrompt({ 
                    projectName, 
                    leadName, 
                    scenario: scenario || 'A', 
                    hasNarrative: false, 
                    visualRefs,
                    pages: scope === 'single' ? ['Landing Page'] : ['Homepage', 'About', 'Services'] // Fallback if no pages list
                });

                await resend.emails.send({
                    from: 'Moood Intake <notifications@moood.studio>',
                    to: ['alberto.contreras@gmail.com'],
                    subject: `[STRATEGY INTAKE] ${projectName}`,
                    html: buildEmail({ 
                        projectName, 
                        context: 'Strategy', 
                        headline: 'Intake Received.', 
                        body: `<pre style="white-space:pre-wrap; font-family:monospace; font-size:13px; background:#f7f7f7; padding:20px; border-radius:8px; border:1px solid #eee;">${prompt}</pre>` 
                    })
                });
                return res.status(200).json({ success: true, path: 'strategy' });
            }

            // GEMINI PATH — extract narrative structure for preview
            const filesContent = await Promise.all(files.map(async f => ({
                filename: f.filename,
                text: await extractText(f.buffer, f.filename, f.mimeType)
            })));
            const combinedText = filesContent.map(f => f.text).join('\n\n');
            const isSingle = fields.scope === 'single';

            const geminiPrompt = isSingle
                ? `Analyze this landing page narrative document and extract the key content into structured JSON.

The JSON must follow this exact schema:
{
  "pages": [
    {
      "id": "page-0",
      "name": "Landing Page",
      "type": "Landing Page",
      "headline": "<the main headline or strongest hook from the document>",
      "summary": "<one concise paragraph summarizing the page narrative>",
      "flags": 0,
      "flagText": null,
      "missing": false,
      "children": [],
      "sections": [
        {
          "name": "<Section name e.g. Hero, Problem, Solution, Features, CTA>",
          "items": [
            { "label": "<element e.g. Headline, Body, CTA>", "value": "<extracted content>" }
          ]
        }
      ]
    }
  ],
  "scope": "single",
  "hasNavDefinition": false
}

Extract 3 to 6 sections. Each section should have 1 to 3 items. Use actual content from the document, not placeholders.

Document:
${combinedText.slice(0, 12000)}`
                : `Analyze these website narrative documents and extract the page structure into structured JSON.

The JSON must follow this exact schema:
{
  "pages": [
    {
      "id": "page-0",
      "name": "<page name>",
      "type": "<Homepage | Web Page | Landing Page>",
      "headline": "<extracted headline>",
      "summary": "<brief summary>",
      "flags": 0,
      "flagText": null,
      "missing": false,
      "children": [],
      "sections": []
    }
  ],
  "scope": "multi",
  "hasNavDefinition": true
}

Documents:
${combinedText.slice(0, 12000)}`;

            const geminiText = await callGeminiJson(geminiPrompt);
            console.log('[intake] Gemini raw (first 500):', geminiText.slice(0, 500));

            let parsed = null;
            if (geminiText) {
                // Try direct parse first, then strip markdown fences, then regex-extract
                const candidates = [
                    geminiText,
                    geminiText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim(),
                ];
                for (const candidate of candidates) {
                    try { parsed = JSON.parse(candidate); break; } catch (_) {}
                }
                if (!parsed) {
                    // Last resort: find first {...} block in the response
                    const match = geminiText.match(/\{[\s\S]*\}/);
                    if (match) {
                        try { parsed = JSON.parse(match[0]); } catch (_) {}
                    }
                }
                if (!parsed) console.error('[intake] All parse attempts failed. Raw:', geminiText.slice(0, 500));
            }

            if (parsed && Array.isArray(parsed.pages) && parsed.pages.length > 0) {
                return res.status(200).json({ success: true, pages: parsed.pages, scope: parsed.scope || fields.scope, hasNavDefinition: parsed.hasNavDefinition || false });
            }

            // Fallback: return minimal page so frontend can still show the review
            const fallbackName = files[0]?.filename?.replace(/\.[^.]+$/, '') || fields.projectName || 'Landing Page';
            return res.status(200).json({
                success: true,
                scope: fields.scope || 'single',
                hasNavDefinition: false,
                pages: [{
                    id: 'page-0',
                    name: fallbackName,
                    type: isSingle ? 'Landing Page' : 'Homepage',
                    headline: '',
                    summary: 'Narrative received. Our team will review and begin production.',
                    flags: 0,
                    flagText: null,
                    missing: false,
                    children: [],
                    sections: []
                }]
            });
        }

        return res.status(400).json({ error: 'Invalid request' });
    } catch (err) {
        console.error('Intake Controller Error:', err);
        return res.status(500).json({ error: err.message });
    }
};

module.exports.config = { api: { bodyParser: false } };
