/**
 * /api/narratives — unified narrative endpoint
 *
 * GET  ?code=MSD-XXXX                          → fetch narrative doc (client)
 * POST ?action=set   + Bearer admin token       → write narrative doc (agency)
 * POST ?action=review                           → submit client review + send email
 */

const { list, put } = require('@vercel/blob');
const { Resend }    = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// ── GET ────────────────────────────────────────────────────────────────────
async function getNarratives(req, res) {
    const { code } = req.query;

    if (!code || !/^MSD-\d{4}-\d{4}$/.test(code.trim())) {
        return res.status(400).json({ error: 'Invalid project code format' });
    }

    const { blobs } = await list({ prefix: `narratives/${code.trim()}.json` });
    if (!blobs || blobs.length === 0) {
        return res.status(404).json({ error: 'Narratives not found for this project code' });
    }

    const response = await fetch(blobs[0].downloadUrl, {
        headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` }
    });
    if (!response.ok) {
        return res.status(500).json({ error: 'Failed to read narrative data' });
    }

    return res.status(200).json(await response.json());
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

    // Verify passport exists
    const { blobs: passportBlobs } = await list({ prefix: `codes/${code.trim()}.json` });
    if (!passportBlobs || passportBlobs.length === 0) {
        return res.status(404).json({ error: 'Project code not found in passport store' });
    }

    const narrativeDoc = {
        code:               code.trim(),
        projectName:        projectName || '',
        clientName:         clientName  || '',
        status:             'pending_review',
        createdAt:          new Date().toISOString(),
        reviewSubmittedAt:  null,
        pages: pages.map(p => ({
            id:           p.id,
            name:         p.name,
            type:         p.type || 'page',
            reviewStatus: 'pending',
            reviewComment: '',
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

    await put(`narratives/${code.trim()}.json`, JSON.stringify(narrativeDoc), {
        access:      'private',
        contentType: 'application/json'
    });

    const agencyUrl = `https://moood.studio/proposals/narrative-review/index.html?code=${code.trim()}&agency=1`;
    const pageCount = narrativeDoc.pages.length;
    const name      = projectName || code.trim();

    await resend.emails.send({
        from:    'Moood.Studio <narratives@moood.studio>',
        to:      ['alberto.contreras@gmail.com'],
        subject: `[NARRATIVE READY] ${name} — ${pageCount} pages · ${code.trim()}`,
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 24px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;">

          <tr>
            <td style="background:#000;padding:32px 48px;">
              <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.4);">Moood.Studio · Strategy Director</p>
            </td>
          </tr>

          <tr>
            <td style="padding:48px 48px 16px;">
              <h1 style="margin:0 0 12px;font-size:26px;font-weight:300;color:#000;line-height:1.2;">Narrative ready<br>for review.</h1>
              <p style="margin:0 0 32px;font-size:15px;line-height:1.65;color:rgba(0,0,0,0.5);">
                The narrative for <strong style="color:#000;">${name}</strong> is complete — ${pageCount} pages. Review it, then send it to the client directly from the review interface.
              </p>

              <table cellpadding="0" cellspacing="0" style="margin-bottom:40px;">
                <tr>
                  <td style="background:#000;border-radius:6px;">
                    <a href="${agencyUrl}" style="display:inline-block;padding:14px 28px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#fff;text-decoration:none;">
                      Review narrative →
                    </a>
                  </td>
                </tr>
              </table>

              <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
                <thead>
                  <tr style="border-bottom:1px solid rgba(0,0,0,0.08);">
                    <th style="text-align:left;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:rgba(0,0,0,0.3);padding-bottom:8px;">#</th>
                    <th style="text-align:left;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:rgba(0,0,0,0.3);padding-bottom:8px;">Page</th>
                    <th style="text-align:left;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:rgba(0,0,0,0.3);padding-bottom:8px;">Type</th>
                  </tr>
                </thead>
                <tbody>
                  ${narrativeDoc.pages.map((p, i) => `
                  <tr style="border-bottom:1px solid rgba(0,0,0,0.05);">
                    <td style="padding:8px 0;font-size:11px;color:rgba(0,0,0,0.3);">${i + 1}</td>
                    <td style="padding:8px 0;font-size:13px;font-weight:600;color:#000;">${p.name}</td>
                    <td style="padding:8px 0;font-size:11px;color:rgba(0,0,0,0.4);text-transform:uppercase;letter-spacing:0.06em;">${p.type}</td>
                  </tr>`).join('')}
                </tbody>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 48px 40px;border-top:1px solid rgba(0,0,0,0.06);">
              <p style="margin:0;font-size:11px;color:rgba(0,0,0,0.3);line-height:1.6;">
                Project code: <strong>${code.trim()}</strong> · ${pageCount} pages<br>
                The "Send for client review" button is available in the top-right of the review interface.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
    });

    return res.status(200).json({
        success:   true,
        code:      code.trim(),
        pages:     narrativeDoc.pages.length,
        agencyUrl
    });
}

// ── REVIEW (client submit) ─────────────────────────────────────────────────
async function submitReview(req, res) {
    const { code, reviews } = req.body;

    if (!code || !/^MSD-\d{4}-\d{4}$/.test(code.trim())) {
        return res.status(400).json({ error: 'Invalid project code format' });
    }
    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
        return res.status(400).json({ error: 'reviews array is required' });
    }

    // Read existing doc
    const { blobs } = await list({ prefix: `narratives/${code.trim()}.json` });
    if (!blobs || blobs.length === 0) {
        return res.status(404).json({ error: 'Narrative document not found' });
    }

    const fetchResp = await fetch(blobs[0].downloadUrl, {
        headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` }
    });
    if (!fetchResp.ok) {
        return res.status(500).json({ error: 'Failed to read narrative data' });
    }

    const doc = await fetchResp.json();

    // Apply reviews
    const reviewMap = {};
    reviews.forEach(r => { reviewMap[r.pageId] = r; });

    doc.pages = doc.pages.map(page => {
        const r = reviewMap[page.id];
        return r ? { ...page, reviewStatus: r.status, reviewComment: r.comment || '' } : page;
    });

    const approvedCount = doc.pages.filter(p => p.reviewStatus === 'approved').length;
    const changesCount  = doc.pages.filter(p => p.reviewStatus === 'changes_requested').length;
    const allApproved   = approvedCount === doc.pages.length;

    doc.status            = allApproved ? 'fully_approved' : 'partially_approved';
    doc.reviewSubmittedAt = new Date().toISOString();

    await put(`narratives/${code.trim()}.json`, JSON.stringify(doc), {
        access: 'private', contentType: 'application/json'
    });

    const pageRows = doc.pages.map(p => {
        const label   = p.reviewStatus === 'approved' ? '✅ Approved' : p.reviewStatus === 'changes_requested' ? '⚠️ Changes' : '— Pending';
        const comment = p.reviewComment ? `<br><span style="font-size:11px;color:#666;">"${p.reviewComment}"</span>` : '';
        return `<tr>
            <td style="padding:6px 0;font-size:13px;font-weight:600;">${p.name}</td>
            <td style="padding:6px 0;font-size:11px;color:#999;text-transform:uppercase;">${p.type}</td>
            <td style="padding:6px 0;font-size:13px;">${label}${comment}</td>
        </tr>`;
    }).join('');

    await resend.emails.send({
        from:    'Moood Studio <notifications@moood.studio>',
        to:      ['alberto.contreras@gmail.com'],
        subject: `📋 Narrative Review: ${doc.projectName} (${code}) — ${approvedCount}/${doc.pages.length} approved`,
        html: `
            <div style="font-family:'Helvetica Neue',sans-serif;color:#111;max-width:600px;line-height:1.6;">
                <h1 style="font-size:20px;border-bottom:2px solid #000;padding-bottom:10px;margin-bottom:16px;">NARRATIVE REVIEW SUBMITTED</h1>
                <table style="width:100%;font-size:13px;border-collapse:collapse;margin-bottom:20px;">
                    <tr><td style="padding:4px 0;color:#666;width:120px;">Project</td><td><strong>${doc.projectName}</strong></td></tr>
                    <tr><td style="padding:4px 0;color:#666;">Client</td><td>${doc.clientName}</td></tr>
                    <tr><td style="padding:4px 0;color:#666;">Code</td><td><strong style="letter-spacing:2px;">${code}</strong></td></tr>
                    <tr><td style="padding:4px 0;color:#666;">Result</td><td>${approvedCount} approved · ${changesCount} need changes</td></tr>
                    <tr><td style="padding:4px 0;color:#666;">Status</td><td><strong>${allApproved ? '✅ All approved — ready for build' : '⚠️ Revisions needed'}</strong></td></tr>
                </table>
                <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
                    <thead>
                        <tr style="border-bottom:1px solid #e0e0e0;">
                            <th style="text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:#999;padding-bottom:8px;">Page</th>
                            <th style="text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:#999;padding-bottom:8px;">Type</th>
                            <th style="text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:#999;padding-bottom:8px;">Status</th>
                        </tr>
                    </thead>
                    <tbody>${pageRows}</tbody>
                </table>
                ${allApproved
                    ? '<p style="background:#f5f5f5;padding:16px;font-size:13px;">All narratives approved. Activate <strong>The Profiler</strong> to begin component mapping.</p>'
                    : '<p style="background:#fff8e1;padding:16px;font-size:13px;border-left:3px solid #e8870a;">Some pages need revisions. Address client comments and re-send the review link.</p>'
                }
                <p style="font-size:12px;color:#999;margin-top:16px;">Submitted: ${new Date(doc.reviewSubmittedAt).toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}</p>
            </div>
        `
    });

    return res.status(200).json({
        success:          true,
        approved:         approvedCount,
        changesRequested: changesCount,
        total:            doc.pages.length,
        status:           doc.status
    });
}

// ── ROUTER ─────────────────────────────────────────────────────────────────
async function sendClientReview(req, res) {
    const { code, projectName, clientUrl } = req.body || {};

    if (!code || !/^MSD-\d{4}-\d{4}$/.test(code.trim())) {
        return res.status(400).json({ error: 'Invalid project code' });
    }
    if (!clientUrl) {
        return res.status(400).json({ error: 'clientUrl is required' });
    }

    const name    = projectName || code;
    const subject = `Your narrative is ready for review — ${name}`;

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 24px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:#000;padding:40px 48px;">
              <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.4);">Moood.Studio</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:48px 48px 40px;">
              <h1 style="margin:0 0 16px;font-size:28px;font-weight:300;color:#000;line-height:1.2;">Your narrative<br>is ready.</h1>
              <p style="margin:0 0 32px;font-size:15px;line-height:1.65;color:rgba(0,0,0,0.55);">
                We've written the narrative for <strong style="color:#000;">${name}</strong>. Open each page, read through what we've written, and mark it as approved or request changes.
              </p>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#000;border-radius:6px;">
                    <a href="${clientUrl}" style="display:inline-block;padding:14px 28px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#fff;text-decoration:none;">
                      Review your narrative →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:32px 0 0;font-size:13px;color:rgba(0,0,0,0.35);line-height:1.6;">
                Or copy this link into your browser:<br>
                <span style="color:rgba(0,0,0,0.55);word-break:break-all;">${clientUrl}</span>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 48px 40px;border-top:1px solid rgba(0,0,0,0.06);">
              <p style="margin:0;font-size:11px;color:rgba(0,0,0,0.3);line-height:1.6;">
                This review was prepared by Moood.Studio · Project code: ${code}<br>
                Reply to this email if you have questions before reviewing.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    try {
        await resend.emails.send({
            from:    'Moood.Studio <narratives@moood.studio>',
            to:      ['alberto.contreras@gmail.com'],
            subject,
            html
        });
        return res.status(200).json({ success: true });
    } catch (err) {
        console.error('[narrative-send-review] Resend error:', err);
        return res.status(500).json({ error: 'Failed to send email' });
    }
}

module.exports = async (req, res) => {
    try {
        if (req.method === 'GET') return await getNarratives(req, res);

        if (req.method === 'POST') {
            const action = (req.query.action || '').trim();
            if (action === 'set')    return await setNarratives(req, res);
            if (action === 'review') return await submitReview(req, res);
            if (action === 'send_review') return await sendClientReview(req, res);
            return res.status(400).json({ error: 'Missing action param: set | review | send_review' });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (err) {
        console.error('Narratives API error:', err);
        return res.status(500).json({ error: 'Internal server error', details: err.message });
    }
};
