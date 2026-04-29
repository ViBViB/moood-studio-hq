const Busboy   = require('busboy');
const pdfParse = require('pdf-parse');
const mammoth  = require('mammoth');
const { Resend } = require('resend');

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GOOGLE_AI_STUDIO_KEY}`;
const resend = new Resend(process.env.RESEND_API_KEY);

async function callGemini(prompt) {
    const res = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.1,
                thinkingConfig: { thinkingBudget: 0 }
            }
        })
    });
    if (!res.ok) {
        const body = await res.text();
        if (res.status === 404) {
            // List available models so we can pick the right one
            const listRes = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_AI_STUDIO_KEY}&pageSize=20`
            );
            const listData = await listRes.json().catch(() => ({}));
            const names = (listData.models || []).map(m => m.name).join(' | ');
            throw new Error(`Model not found. Available: ${names || 'none — API key may be invalid'}`);
        }
        throw new Error(`Gemini ${res.status}: ${body.slice(0, 300)}`);
    }
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
}

/* ── TEXT EXTRACTION ────────────────────────────────────────── */
async function extractText(buffer, filename, mimeType) {
    const ext = filename.split('.').pop().toLowerCase();

    if (['txt', 'md', 'html', 'htm', 'rtf'].includes(ext)) {
        return buffer.toString('utf-8');
    }

    if (ext === 'pdf' || mimeType === 'application/pdf') {
        const data = await pdfParse(buffer);
        return data.text;
    }

    if (['doc', 'docx'].includes(ext) || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const result = await mammoth.extractRawText({ buffer });
        return result.value;
    }

    // Fallback: try as plain text
    return buffer.toString('utf-8');
}

/* ── HELPERS ────────────────────────────────────────────────── */
function assignIds(pages, prefix = 'page') {
    pages.forEach((p, i) => {
        p.id = `${prefix}-${i}`;
        if (p.children && p.children.length > 0) assignIds(p.children, p.id);
    });
}

function flattenPages(pages) {
    const result = [];
    function walk(p) { result.push(p); (p.children || []).forEach(walk); }
    pages.forEach(walk);
    return result;
}

function countFlags(pages) {
    return flattenPages(pages).filter(p => p.flags > 0).length;
}

/* ── SINGLE-PAGE PROMPT ─────────────────────────────────────── */
function buildSinglePagePrompt(projectName, pageType, filesContent, notes) {
    const filesBlock = filesContent.map(f =>
        `=== FILE: ${f.filename} ===\n${f.text}\n`
    ).join('\n');

    return `You are an information architect analyzing a single web page narrative document for a web design agency.

PROJECT: ${projectName || 'Unnamed project'}
PAGE TYPE: ${pageType || 'Web Page'}
${notes ? `CLIENT NOTES: ${notes}\n` : ''}

YOUR TASK: Extract all structured content from the uploaded document for a single web page.

For the page, extract:
- "name": the page name (infer from document title or filename if not explicit)
- "headline": the single strongest, most specific headline — use EXACT words from the document
- "summary": 2–3 concrete sentences describing what's in this page's document — mention specific sections, CTAs, proof points, or argument structure you actually see. Never write "Content extracted."
- "flags": 1 only for genuine content gaps (missing CTA, no proof, unclear value proposition); 0 if solid
- "flagText": if flags is 1, describe the specific gap precisely; otherwise null
- "sections": for each distinct labeled section in the document, create one entry with exact copy items

Section item labels to use: Headline, Sub-headline, Body, CTA, Stat, Quote, List item
Values must be exact text from the document. Omit sections you cannot find real content for.

DOCUMENTS TO ANALYZE:

${filesBlock}

Return ONLY valid JSON. No markdown fences, no explanation. Use this exact schema:

{
  "pages": [
    {
      "id": "page-0",
      "name": "Page name",
      "type": "${pageType || 'Web Page'}",
      "flags": 0,
      "headline": "\\"Exact headline from document\\"",
      "summary": "Concrete 2–3 sentence description.",
      "flagText": null,
      "missing": false,
      "children": [],
      "sections": [
        {
          "name": "Hero",
          "items": [
            { "label": "Headline", "value": "Exact text from document" },
            { "label": "Sub-headline", "value": "Exact text" },
            { "label": "CTA", "value": "Button label" }
          ]
        },
        {
          "name": "Value Proposition",
          "items": [
            { "label": "Body", "value": "Exact paragraph text" }
          ]
        }
      ]
    }
  ]
}

STRICT RULES:
- NEVER write "Content extracted." as a summary — always write what you actually found
- NEVER invent or paraphrase content — extract exact text
- pages[] contains exactly ONE page object`;
}

/* ── PROMPT ─────────────────────────────────────────────────── */
function buildPrompt(projectName, filesContent, notes) {
    const filesBlock = filesContent.map(f =>
        `=== FILE: ${f.filename} ===\n${f.text}\n`
    ).join('\n');

    return `You are an information architect analyzing website content documents for a web design agency. Your output will drive an interactive sitemap review tool.

PROJECT: ${projectName || 'Unnamed project'}
${notes ? `CLIENT NOTES: ${notes}\n` : ''}

YOUR TASK HAS THREE STEPS:

STEP 1 — EXTRACT THE NAVIGATION STRUCTURE
Search ALL documents — not just filenames — for any section that defines the site's page hierarchy. Look for:
- A section labeled: Navigation, Primary Navigation, Menu, Site Map, Sitemap, Pages, IA, Architecture, Structure
- Content like: "Primary: Page A (Child 1, Child 2) | Page B | Page C"
- Pipe-separated lists of pages with sub-items in parentheses
- Indented or bulleted outlines of pages and sub-pages
- Headers like "What We Do > Growth Strategy, Marketing Solutions"
- Any text that reads like a menu definition or page outline

IMPORTANT: Navigation sections are often embedded INSIDE narrative content documents (e.g., a Homepage narrative may have a "NAVIGATION" section listing all site pages). Scan every document's full text.

If a navigation definition is found in ANY document → set "hasNavDefinition": true. Use it as the structural backbone for the entire sitemap.
If no navigation definition exists anywhere → set "hasNavDefinition": false; treat the first document as Homepage and all others as its flat children.

STEP 2 — BUILD THE HIERARCHY
If hasNavDefinition is true:
- Reconstruct the full nested page tree from the navigation definition you found
- Top-level items become direct children of the root Homepage node
- Sub-items in parentheses or indented under a parent become that parent's children[]
- Example: "What We Do (Growth Solutions, Marketing Solutions)" → parent "What We Do" with two children
- For EACH page in the navigation tree, search ALL uploaded documents for a match by name similarity (fuzzy — e.g. "Growth Solutions" matches "growth-solutions.docx" or a doc titled "Growth Solutions")
- Pages in the nav with NO matching document → include them with "missing": true, sections: [], headline: null, summary: null
- Pages with a matching document → extract full content (Step 3)

If hasNavDefinition is false:
- pages[0] is the Homepage node (matched to the first document); its children[] holds all other pages as flat siblings

STEP 3 — EXTRACT CONTENT FOR EACH MATCHED PAGE
For each page with a matched document, read the full document text and extract:
- "headline": the single strongest, most specific headline — use the EXACT words from the document, escaped in quotes. Never write a placeholder.
- "summary": 2–3 concrete sentences describing what's in this page's document — mention specific sections, CTAs, proof points, or argument structure you actually see. Never write "Content extracted."
- "flags": 1 only for genuine content gaps (missing CTA, no proof, unclear value proposition, broken narrative arc); 0 if solid
- "flagText": if flags is 1, describe the specific gap precisely; otherwise null
- "sections": for each distinct labeled section in the document, create one entry. Extract key copy items with their exact text.

Section item labels to use: Headline, Sub-headline, Body, CTA, Stat, Quote, List item — use whatever fits the content.
Values must be exact text from the document, not summaries. Omit sections you cannot find real content for.

DOCUMENTS TO ANALYZE:

${filesBlock}

Return ONLY valid JSON. No markdown fences, no explanation. Use this exact schema:

{
  "hasNavDefinition": true,
  "pages": [
    {
      "id": "page-0",
      "name": "Homepage",
      "type": "Homepage",
      "flags": 0,
      "headline": "\\"Exact headline from document\\"",
      "summary": "Concrete 2–3 sentence description of this page's content.",
      "flagText": null,
      "missing": false,
      "children": [
        {
          "id": "page-0-0",
          "name": "What We Do",
          "type": "Category",
          "flags": 0,
          "headline": null,
          "summary": null,
          "flagText": null,
          "missing": true,
          "children": [
            {
              "id": "page-0-0-0",
              "name": "Growth Solutions",
              "type": "Web Page",
              "flags": 0,
              "headline": "\\"Exact headline\\"",
              "summary": "Concrete summary.",
              "flagText": null,
              "missing": false,
              "children": [],
              "sections": [
                {
                  "name": "Hero",
                  "items": [
                    { "label": "Headline", "value": "Exact text from document" },
                    { "label": "Sub-headline", "value": "Exact text" },
                    { "label": "CTA", "value": "Button label" }
                  ]
                },
                {
                  "name": "Value Proposition",
                  "items": [
                    { "label": "Body", "value": "Exact paragraph text" }
                  ]
                }
              ]
            },
            {
              "id": "page-0-0-1",
              "name": "Marketing Solutions",
              "type": "Web Page",
              "flags": 0,
              "headline": null,
              "summary": null,
              "flagText": null,
              "missing": true,
              "children": [],
              "sections": []
            }
          ],
          "sections": []
        }
      ],
      "sections": [
        {
          "name": "Hero",
          "items": [
            { "label": "Headline", "value": "Exact text" },
            { "label": "CTA", "value": "Exact CTA text" }
          ]
        },
        {
          "name": "Services Overview",
          "items": [
            { "label": "Headline", "value": "Exact section headline" },
            { "label": "Body", "value": "Exact body text" }
          ]
        }
      ]
    }
  ]
}

STRICT RULES:
- "type" must be one of: Homepage, Web Page, Landing Page, Blog, Category, Product, Contact
- pages[] contains ONLY the root (Homepage node); ALL other pages live inside children[] at the appropriate nesting level
- All ids must be unique — use depth-based numbering: page-0, page-0-0, page-0-0-0, etc.
- "missing": true pages include only: id, name, type, flags: 0, headline: null, summary: null, flagText: null, missing: true, children: [], sections: []
- NEVER write "Content extracted." as a summary — always write what you actually found in the document
- NEVER invent or paraphrase content — extract exact text
- If the navigation lists a parent page (e.g. "What We Do") with no uploaded document, mark it missing: true but still include its children
- Preserve exact hierarchy from the navigation definition — do not flatten or skip levels`;
}

/* ── EMAIL TEMPLATES ────────────────────────────────────────── */
function agencyEmail(projectName, email, pageCount, flagCount, sitemapPages) {
    const pagesList = sitemapPages.map((p, i) =>
        `<tr>
            <td style="padding:10px 12px;border-bottom:1px solid #eee;">${p.name}</td>
            <td style="padding:10px 12px;border-bottom:1px solid #eee;">${p.type}</td>
            <td style="padding:10px 12px;border-bottom:1px solid #eee;">${p.flags ? `⚠ ${p.flagText}` : '—'}</td>
        </tr>`
    ).join('');

    return `
        <div style="font-family:'Helvetica Neue',sans-serif;color:#111;max-width:600px;line-height:1.6;">
            <h2 style="border-bottom:2px solid #000;padding-bottom:10px;">
                [PATH B INTAKE] ${projectName}
            </h2>
            <p><strong>Client email:</strong> ${email}</p>
            <p><strong>Pages extracted:</strong> ${pageCount} &nbsp;|&nbsp; <strong>Flags:</strong> ${flagCount}</p>
            <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:13px;">
                <thead>
                    <tr style="background:#f5f5f5;">
                        <th style="padding:10px 12px;text-align:left;border-bottom:2px solid #ddd;">Page</th>
                        <th style="padding:10px 12px;text-align:left;border-bottom:2px solid #ddd;">Type</th>
                        <th style="padding:10px 12px;text-align:left;border-bottom:2px solid #ddd;">Flag</th>
                    </tr>
                </thead>
                <tbody>${pagesList}</tbody>
            </table>
            <p style="font-size:13px;color:#666;">Client is reviewing the sitemap now. Build begins when they click "Approve sitemap &amp; start build".</p>
        </div>`;
}

function clientEmail(projectName, leadName, pageCount) {
    return `
        <div style="font-family:'Helvetica Neue',sans-serif;color:#111;max-width:600px;line-height:1.8;">
            <p style="font-size:15px;">Hi ${leadName || 'there'},</p>
            <p>Your files for <strong>${projectName}</strong> have been processed. We extracted ${pageCount} page${pageCount !== 1 ? 's' : ''} from your documents.</p>
            <p>Your sitemap is ready for review. Open the link below, expand each page to check the extracted content, and approve when you're satisfied.</p>
            <p>Build begins as soon as you confirm.</p>
            <br>
            <p style="color:#666;">Talk soon,</p>
            <p><strong>Alberto</strong><br><span style="color:#999;">Moood.Studio</span></p>
        </div>`;
}

/* ── HANDLER ────────────────────────────────────────────────── */
module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        /* 1 — Parse multipart form */
        const busboy = Busboy({ headers: req.headers });
        const fields  = {};
        const files   = [];

        await new Promise((resolve, reject) => {
            busboy.on('field', (name, val) => { fields[name] = val; });
            busboy.on('file', (name, stream, info) => {
                const chunks = [];
                stream.on('data', c => chunks.push(c));
                stream.on('end', () => {
                    files.push({
                        fieldname: name,
                        filename: info.filename,
                        mimeType: info.mimeType,
                        buffer: Buffer.concat(chunks)
                    });
                });
            });
            busboy.on('finish', resolve);
            busboy.on('error', reject);
            req.pipe(busboy);
        });

        const { projectName, email, uploadNotes, scope, pageType, intakePath } = fields;
        const isSinglePage = scope === 'single';

        if (!email) return res.status(400).json({ error: 'Email is required' });

        /* ── STRATEGY PATH (A / B / C / D) ─────────────────────── */
        if (intakePath === 'strategy') {
            const pageObjectives = fields.pageObjectives ? (() => { try { return JSON.parse(fields.pageObjectives); } catch { return []; } })() : [];
            const sourceTexts = await Promise.all(files.filter(f => f.fieldname === 'sourceFiles').map(async f => ({
                filename: f.filename,
                text: await extractText(f.buffer, f.filename, f.mimeType)
            })));
            const leadName = fields.leadName || '';
            const firstName = (leadName || '').split(' ')[0];

            const objRows = pageObjectives.length > 0
                ? pageObjectives.map(o => `<tr><td style="padding:6px 12px 6px 0;font-weight:600;color:#111;vertical-align:top;white-space:nowrap;">${o.page}</td><td style="padding:6px 0;color:#444;line-height:1.5;">${o.objective}</td></tr>`).join('')
                : '<tr><td colspan="2" style="padding:6px 0;color:#999;">No page objectives provided.</td></tr>';

            const sourceRows = sourceTexts.length > 0
                ? sourceTexts.map(f => `<tr><td style="padding:4px 12px 4px 0;color:#555;">${f.filename}</td><td style="padding:4px 0;color:#999;font-size:12px;">${f.text.slice(0, 200).replace(/\n/g, ' ')}…</td></tr>`).join('')
                : '<tr><td colspan="2" style="padding:6px 0;color:#999;">No source files uploaded.</td></tr>';

            const fieldBlock = (label, value) => value
                ? `<tr><td style="padding:8px 16px 8px 0;color:#666;width:140px;vertical-align:top;white-space:nowrap;">${label}</td><td style="padding:8px 0;color:#111;">${value}</td></tr>`
                : '';

            const strategyHtml = `
            <div style="font-family:'Helvetica Neue',sans-serif;color:#111;max-width:640px;line-height:1.6;">
                <h1 style="font-size:18px;border-bottom:2px solid #000;padding-bottom:10px;margin-bottom:20px;">Strategy Intake — ${projectName || 'New Project'}</h1>
                <table style="width:100%;font-size:13px;border-collapse:collapse;margin-bottom:24px;">
                    ${fieldBlock('Project', projectName)}
                    ${fieldBlock('Lead', leadName)}
                    ${fieldBlock('Email', email)}
                    ${fieldBlock('Scope', scope)}
                </table>

                <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#999;margin:24px 0 8px;">Page Objectives</h3>
                <table style="width:100%;font-size:13px;border-collapse:collapse;margin-bottom:24px;">
                    ${objRows}
                </table>

                <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#999;margin:24px 0 8px;">Visual References</h3>
                <p style="font-size:13px;color:#444;">${(() => { try { return (JSON.parse(fields.visualRefs || '[]')).join('<br>') || '—'; } catch { return '—'; } })()}</p>

                <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#999;margin:24px 0 8px;">Competitors</h3>
                <p style="font-size:13px;color:#444;">${(() => { try { return (JSON.parse(fields.competitorsList || '[]')).join('<br>') || '—'; } catch { return '—'; } })()}</p>

                <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#999;margin:24px 0 8px;">Audience</h3>
                <p style="font-size:13px;color:#444;">${fields.portrait || '—'}</p>

                <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#999;margin:24px 0 8px;">Conversion Goal</h3>
                <p style="font-size:13px;color:#444;">${fields.cta || '—'}</p>

                <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#999;margin:24px 0 8px;">Source Files (preview)</h3>
                <table style="width:100%;font-size:12px;border-collapse:collapse;">
                    ${sourceRows}
                </table>
            </div>`;

            await resend.emails.send({
                from: 'Moood Intake <notifications@moood.studio>',
                to: ['alberto.contreras@gmail.com'],
                subject: `[STRATEGY INTAKE] ${projectName || 'New Project'} — ${pageObjectives.length} page objectives`,
                html: strategyHtml,
                attachments: files.filter(f => f.fieldname === 'sourceFiles').map(f => ({
                    filename: f.filename,
                    content: f.buffer
                }))
            });

            return res.status(200).json({ success: true, path: 'strategy' });
        }

        if (files.length === 0) return res.status(400).json({ error: 'No files received' });

        /* 2 — Extract text from each file */
        const filesContent = await Promise.all(
            files.map(async f => ({
                filename: f.filename,
                text: await extractText(f.buffer, f.filename, f.mimeType)
            }))
        );

        // Guard: drop empty extractions
        const validFiles = filesContent.filter(f => f.text && f.text.trim().length > 20);
        if (validFiles.length === 0) {
            return res.status(422).json({ error: 'Could not extract readable text from the uploaded files.' });
        }

        /* 3 — Send to Gemini */
        const prompt = isSinglePage
            ? buildSinglePagePrompt(projectName, pageType, validFiles, uploadNotes)
            : buildPrompt(projectName, validFiles, uploadNotes);
        const geminiText = await callGemini(prompt);

        /* 4 — Parse Gemini's JSON response */
        let sitemapPages = [];
        let hasNavDefinition = false;
        try {
            let raw = geminiText.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
            const s = raw.indexOf('{'), e = raw.lastIndexOf('}');
            if (s !== -1 && e !== -1) raw = raw.slice(s, e + 1);
            console.log('GEMINI_RAW:', raw.slice(0, 500));
            const parsed = JSON.parse(raw);
            sitemapPages      = parsed.pages || [];
            hasNavDefinition  = parsed.hasNavDefinition || false;
        } catch (parseErr) {
            console.error('GEMINI_PARSE_ERROR:', parseErr.message);
            console.error('GEMINI_RAW_ON_FAIL:', geminiText.slice(0, 800));
            // Graceful fallback — homepage + flat children
            const children = validFiles.slice(1).map((f, i) => {
                const name = f.filename.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
                    .split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                return { name, type: 'Web Page', flags: 0, headline: '', summary: 'Content extracted.', flagText: null, missing: false, children: [], sections: [] };
            });
            const homeName = validFiles[0]
                ? validFiles[0].filename.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
                    .split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
                : 'Homepage';
            sitemapPages = [{ name: homeName, type: 'Homepage', flags: 0, headline: '', summary: 'Content extracted.', flagText: null, missing: false, children, sections: [] }];
        }

        // Assign recursive IDs
        assignIds(sitemapPages);

        const allPages  = flattenPages(sitemapPages);
        const flagCount = countFlags(sitemapPages);
        const leadName  = fields.leadName || '';

        /* 5 — Send emails in parallel */
        await Promise.allSettled([
            resend.emails.send({
                from: 'Moood Intake <notifications@moood.studio>',
                to:   ['alberto.contreras@gmail.com'],
                subject: `[PATH B] ${projectName || 'New intake'} — ${allPages.length} pages extracted`,
                html: agencyEmail(projectName, email, allPages.length, flagCount, allPages)
            }),
            resend.emails.send({
                from: 'Alberto at Moood.Studio <alberto@moood.studio>',
                to:   [email],
                subject: `Your sitemap is ready — ${projectName || 'your project'}`,
                html: clientEmail(projectName, leadName, allPages.length)
            })
        ]);

        /* 6 — Return sitemap to UI */
        return res.status(200).json({ success: true, pages: sitemapPages, hasNavDefinition, scope: isSinglePage ? 'single' : 'multi' });

    } catch (err) {
        console.error('CLIENT_INTAKE_ERROR:', err);
        return res.status(500).json({ error: 'Processing failed', message: err.message });
    }
};

module.exports.config = {
    api: { bodyParser: false }
};
