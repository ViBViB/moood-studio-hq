/**
 * /api/narratives — unified narrative endpoint (Upstash Redis backend)
 *
 * GET  ?code=MSD-XXXX                     → fetch narrative doc
 * POST ?action=set   + Bearer admin token  → write narrative doc
 * POST ?action=review                      → submit client review
 * POST ?action=comment                     → save individual comment / reply
 * POST ?action=send_review                 → email client review link
 */

const { Resend } = require('resend');
const { buildEmail, dataTable } = require('./_email');

const resend = new Resend(process.env.RESEND_API_KEY);

// ── UPSTASH REDIS ──────────────────────────────────────────────────────────
const REDIS_URL   = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

async function redisGet(key) {
    const res  = await fetch(REDIS_URL, {
        method:  'POST',
        headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
        body:    JSON.stringify(['GET', key])
    });
    const data = await res.json();
    if (data.error) throw new Error('Redis GET error: ' + data.error);
    return data.result ? JSON.parse(data.result) : null;
}

async function redisSet(key, value) {
    const res  = await fetch(REDIS_URL, {
        method:  'POST',
        headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
        body:    JSON.stringify(['SET', key, JSON.stringify(value)])
    });
    const data = await res.json();
    if (data.error) throw new Error('Redis SET error: ' + data.error);
}

// ── GET ────────────────────────────────────────────────────────────────────
async function getNarratives(req, res) {
    const { code } = req.query;

    if (!code || !/^MSD-\d{4}-\d{4}$/.test(code.trim())) {
        return res.status(400).json({ error: 'Invalid project code format' });
    }

    const doc = await redisGet(`narrative:${code.trim()}`);
    if (!doc) {
        return res.status(404).json({ error: 'Narratives not found for this project code' });
    }

    return res.status(200).json(doc);
}

// ── SET (admin) ────────────────────────────────────────────────────────────
async function setNarratives(req, res) {
    const authHeader = req.headers['authorization'] || '';
    const token      = authHeader.replace('Bearer ', '').trim();
    if (!token || token !== process.env.NARRATIVE_ADMIN_TOKEN) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { code, projectName, clientName, pages } = req.body;

    if (!code || !/^MSD-\d{4}-\d{4}$/.test(code.trim())) {
        return res.status(400).json({ error: 'Invalid project code format' });
    }
    if (!pages || !Array.isArray(pages) || pages.length === 0) {
        return res.status(400).json({ error: 'pages array is required' });
    }

    const narrativeDoc = {
        code:              code.trim(),
        projectName:       projectName || '',
        clientName:        clientName  || '',
        status:            'pending_review',
        createdAt:         new Date().toISOString(),
        reviewSubmittedAt: null,
        pages: pages.map(p => ({
            id:             p.id,
            name:           p.name,
            type:           p.type || 'page',
            reviewStatus:   'pending',
            reviewComment:  '',
            reviewComments: [],
            narrative: {
                headline: p.narrative?.headline || '',
                intro:    p.narrative?.intro    || '',
                sections: (p.narrative?.sections || []).map(s => ({
                    name:   s.name,
                    blocks: Array.isArray(s.blocks) ? s.blocks : [s.blocks].filter(Boolean)
                }))
            }
        }))
    };

    await redisSet(`narrative:${code.trim()}`, narrativeDoc);

    const agencyUrl = `https://moood.studio/proposals/narrative-review/index.html?code=${code.trim()}&agency=1`;
    const pageCount = narrativeDoc.pages.length;
    const name      = projectName || code.trim();

    const pagesTableHtml = `
        <table style="width:100%;border-collapse:collapse;margin-top:20px;">
          <thead><tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
            <th style="text-align:left;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:rgba(0,0,0,0.3);padding-bottom:8px;width:24px;">#</th>
            <th style="text-align:left;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:rgba(0,0,0,0.3);padding-bottom:8px;">Page</th>
            <th style="text-align:left;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:rgba(0,0,0,0.3);padding-bottom:8px;">Type</th>
          </tr></thead>
          <tbody>
            ${narrativeDoc.pages.map((p, i) => `
            <tr style="border-bottom:1px solid rgba(0,0,0,0.05);">
              <td style="padding:8px 0;font-size:11px;color:rgba(0,0,0,0.3);">${i + 1}</td>
              <td style="padding:8px 0;font-size:13px;font-weight:600;color:#000;">${p.name}</td>
              <td style="padding:8px 0;font-size:11px;color:rgba(0,0,0,0.4);text-transform:uppercase;letter-spacing:0.06em;">${p.type}</td>
            </tr>`).join('')}
          </tbody>
        </table>`;

    try { await resend.emails.send({
        from:    'Moood.Studio <narratives@moood.studio>',
        to:      ['alberto.contreras@gmail.com'],
        subject: `[NARRATIVE READY] ${name} — ${pageCount} pages · ${code.trim()}`,
        html: buildEmail({
            projectName: name,
            context:     'Strategy Director',
            headline:    `Narrative ready<br>for review.`,
            body:        `The narrative for <strong style="color:#000;">${name}</strong> is complete — ${pageCount} pages.`,
            highlight:   pagesTableHtml,
            cta:         { href: agencyUrl, label: 'Review narrative →' },
            signature:   false,
            footer:      `Project code: ${code.trim()} · ${pageCount} pages · The "Send for client review" button is in the top-right of the review interface.`,
        }),
    }); } catch (emailErr) {
        console.error('[setNarratives] Email failed (data still saved):', emailErr.message);
    }

    return res.status(200).json({ success: true, code: code.trim(), pages: narrativeDoc.pages.length, agencyUrl });
}

// ── COMMENT (save individual comment / reply immediately) ──────────────────
async function addComment(req, res) {
    const { code, pageId, comment, commentId, reply } = req.body || {};

    if (!code || !/^MSD-\d{4}-\d{4}$/.test(code.trim())) {
        return res.status(400).json({ error: 'Invalid project code format' });
    }
    if (!pageId) return res.status(400).json({ error: 'pageId is required' });

    const doc  = await redisGet(`narrative:${code.trim()}`);
    if (!doc)  return res.status(404).json({ error: 'Narrative document not found' });

    const page = doc.pages.find(p => p.id === pageId);
    if (!page) return res.status(404).json({ error: 'Page not found' });

    if (!page.reviewComments) page.reviewComments = [];

    let isNewComment = false;

    if (commentId && reply) {
        const c = page.reviewComments.find(c => c.id === commentId);
        if (c) { if (!c.replies) c.replies = []; c.replies.push(reply); }
    } else if (comment) {
        page.reviewComments.push(comment);
        if (page.reviewStatus !== 'approved') page.reviewStatus = 'changes_requested';
        isNewComment = true;
    }

    await redisSet(`narrative:${code.trim()}`, doc);

    if (isNewComment && comment.role !== 'agency') {
        const agencyUrl    = `https://moood.studio/proposals/narrative-review/index.html?code=${code.trim()}&agency=1`;
        const commentCount = page.reviewComments.length;
        const commentHtml = `
            <p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:rgba(0,0,0,0.35);">${comment.author}</p>
            <p style="margin:0;font-size:15px;color:#000;line-height:1.6;">${comment.text}</p>`;

        try { await resend.emails.send({
            from:    'Moood.Studio <narratives@moood.studio>',
            to:      ['alberto.contreras@gmail.com'],
            subject: `[COMMENT] ${doc.projectName} · ${page.name} — ${comment.author}`,
            html: buildEmail({
                projectName: doc.projectName,
                context:     'Narrative Review',
                headline:    `New comment on<br>${page.name}.`,
                body:        `${doc.projectName} · ${code.trim()} · ${commentCount} comment${commentCount !== 1 ? 's' : ''} on this page`,
                highlight:   commentHtml,
                cta:         { href: agencyUrl, label: 'View & reply →' },
                signature:   false,
                footer:      `Page: ${page.name} · Project: ${code.trim()}`,
            }),
        }); } catch (emailErr) {
            console.error('[addComment] Email failed:', emailErr.message);
        }
    }

    return res.status(200).json({ ok: true });
}

// ── REVIEW (client final submit) ───────────────────────────────────────────
async function submitReview(req, res) {
    const { code, reviews } = req.body;

    if (!code || !/^MSD-\d{4}-\d{4}$/.test(code.trim())) {
        return res.status(400).json({ error: 'Invalid project code format' });
    }
    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
        return res.status(400).json({ error: 'reviews array is required' });
    }

    const doc = await redisGet(`narrative:${code.trim()}`);
    if (!doc) return res.status(404).json({ error: 'Narrative document not found' });

    const reviewMap = {};
    reviews.forEach(r => { reviewMap[r.pageId] = r; });

    doc.pages = doc.pages.map(page => {
        const r = reviewMap[page.id];
        if (!r) return page;
        return {
            ...page,
            reviewStatus:   r.status,
            reviewComment:  r.comment  || '',
            reviewComments: r.comments || page.reviewComments || []
        };
    });

    const approvedCount = doc.pages.filter(p => p.reviewStatus === 'approved').length;
    const changesCount  = doc.pages.filter(p => p.reviewStatus === 'changes_requested').length;
    const allApproved   = approvedCount === doc.pages.length;

    doc.status            = allApproved ? 'fully_approved' : 'partially_approved';
    doc.reviewSubmittedAt = new Date().toISOString();

    await redisSet(`narrative:${code.trim()}`, doc);

    const pageRows = doc.pages.map(p => {
        const label    = p.reviewStatus === 'approved' ? '✅ Approved' : p.reviewStatus === 'changes_requested' ? '⚠️ Changes' : '— Pending';
        const comments = (p.reviewComments || []);
        const commentHtml = comments.length > 0
            ? comments.map(c => `<br><span style="font-size:11px;color:#666;">↳ ${c.author}: "${c.text}"</span>`).join('')
            : (p.reviewComment ? `<br><span style="font-size:11px;color:#666;">"${p.reviewComment}"</span>` : '');
        return `<tr>
            <td style="padding:6px 0;font-size:13px;font-weight:600;">${p.name}</td>
            <td style="padding:6px 0;font-size:11px;color:#999;text-transform:uppercase;">${p.type}</td>
            <td style="padding:6px 0;font-size:13px;">${label}${commentHtml}</td>
        </tr>`;
    }).join('');

    const reviewHighlight = `
        ${dataTable([
            ['Project', doc.projectName],
            ['Client',  doc.clientName],
            ['Code',    `<strong style="letter-spacing:2px;">${code}</strong>`],
            ['Result',  `${approvedCount} approved · ${changesCount} need changes`],
            ['Status',  `<strong>${allApproved ? '✅ All approved — ready for build' : '⚠️ Revisions needed'}</strong>`],
        ])}
        <table style="width:100%;border-collapse:collapse;margin-top:20px;">
          <thead><tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
            <th style="text-align:left;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:rgba(0,0,0,0.3);padding-bottom:8px;">Page</th>
            <th style="text-align:left;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:rgba(0,0,0,0.3);padding-bottom:8px;">Type</th>
            <th style="text-align:left;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:rgba(0,0,0,0.3);padding-bottom:8px;">Status</th>
          </tr></thead>
          <tbody>${pageRows}</tbody>
        </table>
        ${allApproved
            ? `<p style="margin:16px 0 0;font-size:13px;color:rgba(0,0,0,0.55);">All narratives approved. Activate <strong style="color:#000;">The Builder</strong> to begin skeleton construction.</p>`
            : `<p style="margin:16px 0 0;padding:14px 18px;background:#fff;border-left:3px solid #000;font-size:13px;color:#111;line-height:1.6;">Some pages need revisions. Address client comments and re-send the review link.</p>`
        }`;

    try { await resend.emails.send({
        from:    'Moood.Studio <narratives@moood.studio>',
        to:      ['alberto.contreras@gmail.com'],
        subject: `[NARRATIVE REVIEW] ${doc.projectName} — ${approvedCount}/${doc.pages.length} approved · ${code}`,
        html: buildEmail({
            projectName: doc.projectName,
            context:     'Narrative Review',
            headline:    `${approvedCount}/${doc.pages.length}<br>pages reviewed.`,
            highlight:   reviewHighlight,
            signature:   false,
            footer:      `Submitted: ${new Date(doc.reviewSubmittedAt).toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}`,
        }),
    }); } catch (emailErr) {
        console.error('[submitReview] Email failed (review still saved):', emailErr.message);
    }

    return res.status(200).json({ success: true, approved: approvedCount, changesRequested: changesCount, total: doc.pages.length, status: doc.status });
}

// ── SEND CLIENT REVIEW ─────────────────────────────────────────────────────
async function sendClientReview(req, res) {
    const { code, projectName, clientUrl } = req.body || {};

    if (!code || !/^MSD-\d{4}-\d{4}$/.test(code.trim())) {
        return res.status(400).json({ error: 'Invalid project code' });
    }
    if (!clientUrl) return res.status(400).json({ error: 'clientUrl is required' });

    const name = projectName || code;

    try {
        await resend.emails.send({
            from:    'Moood.Studio <narratives@moood.studio>',
            to:      ['alberto.contreras@gmail.com'],
            subject: `Your narrative is ready for review — ${name}`,
            html: buildEmail({
                projectName: name,
                context:     'Narrative Review',
                headline:    `Your narrative<br>is ready.`,
                body:        `We've written the narrative for <strong style="color:#000;">${name}</strong>. Open each page, read through what we've written, and mark it as approved or request changes.`,
                cta:         { href: clientUrl, label: 'Review your narrative →' },
                linkFallback: clientUrl,
                footer:      `This review was prepared by Moood.Studio · Project code: ${code} · Reply to this email if you have questions before reviewing.`,
            }),
        });
        return res.status(200).json({ success: true });
    } catch (err) {
        console.error('[sendClientReview] Resend error:', err);
        return res.status(500).json({ error: 'Failed to send email' });
    }
}

// ── ROUTER ─────────────────────────────────────────────────────────────────
module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    try {
        if (req.method === 'GET') return await getNarratives(req, res);

        if (req.method === 'POST') {
            const action = (req.query.action || '').trim();
            if (action === 'set')         return await setNarratives(req, res);
            if (action === 'review')      return await submitReview(req, res);
            if (action === 'comment')     return await addComment(req, res);
            if (action === 'send_review') return await sendClientReview(req, res);
            return res.status(400).json({ error: 'Missing action param: set | review | comment | send_review' });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (err) {
        console.error('Narratives API error:', err);
        return res.status(500).json({ error: 'Internal server error', details: err.message });
    }
};
