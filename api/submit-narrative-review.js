const { list, put } = require('@vercel/blob');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { code, reviews } = req.body;

    if (!code || !/^MSD-\d{4}-\d{4}$/.test(code.trim())) {
        return res.status(400).json({ error: 'Invalid project code format' });
    }

    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
        return res.status(400).json({ error: 'reviews array is required' });
    }

    try {
        // Read existing narrative doc
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

        const narrativeDoc = await fetchResp.json();

        // Apply reviews
        const reviewMap = {};
        reviews.forEach(r => { reviewMap[r.pageId] = r; });

        narrativeDoc.pages = narrativeDoc.pages.map(page => {
            const review = reviewMap[page.id];
            if (review) {
                return {
                    ...page,
                    reviewStatus: review.status,
                    reviewComment: review.comment || ''
                };
            }
            return page;
        });

        const approvedCount  = narrativeDoc.pages.filter(p => p.reviewStatus === 'approved').length;
        const changesCount   = narrativeDoc.pages.filter(p => p.reviewStatus === 'changes_requested').length;
        const allApproved    = approvedCount === narrativeDoc.pages.length;

        narrativeDoc.status           = allApproved ? 'fully_approved' : 'partially_approved';
        narrativeDoc.reviewSubmittedAt = new Date().toISOString();

        // Save updated doc
        await put(`narratives/${code.trim()}.json`, JSON.stringify(narrativeDoc), {
            access: 'private',
            contentType: 'application/json'
        });

        // Build summary table rows for email
        const pageRows = narrativeDoc.pages.map(p => {
            const statusLabel = p.reviewStatus === 'approved'
                ? '✅ Approved'
                : p.reviewStatus === 'changes_requested'
                    ? '⚠️ Changes requested'
                    : '— Pending';
            const commentCell = p.reviewComment
                ? `<br><span style="font-size:11px;color:#666;">"${p.reviewComment}"</span>`
                : '';
            return `<tr>
                <td style="padding:6px 0;font-size:13px;font-weight:600;">${p.name}</td>
                <td style="padding:6px 0;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:.05em;">${p.type}</td>
                <td style="padding:6px 0;font-size:13px;">${statusLabel}${commentCell}</td>
            </tr>`;
        }).join('');

        await resend.emails.send({
            from: 'Moood Studio <notifications@moood.studio>',
            to: ['alberto.contreras@gmail.com'],
            subject: `📋 Narrative Review: ${narrativeDoc.projectName} (${code}) — ${approvedCount}/${narrativeDoc.pages.length} approved`,
            html: `
                <div style="font-family:'Helvetica Neue',sans-serif;color:#111;max-width:600px;line-height:1.6;">
                    <h1 style="font-size:20px;border-bottom:2px solid #000;padding-bottom:10px;margin-bottom:16px;">NARRATIVE REVIEW SUBMITTED</h1>
                    <table style="width:100%;font-size:13px;border-collapse:collapse;margin-bottom:20px;">
                        <tr><td style="padding:4px 0;color:#666;width:120px;">Project</td><td><strong>${narrativeDoc.projectName}</strong></td></tr>
                        <tr><td style="padding:4px 0;color:#666;">Client</td><td>${narrativeDoc.clientName}</td></tr>
                        <tr><td style="padding:4px 0;color:#666;">Code</td><td><strong style="letter-spacing:2px;">${code}</strong></td></tr>
                        <tr><td style="padding:4px 0;color:#666;">Result</td><td>${approvedCount} approved · ${changesCount} need changes</td></tr>
                        <tr><td style="padding:4px 0;color:#666;">Status</td><td><strong>${narrativeDoc.status === 'fully_approved' ? '✅ All approved — ready for build' : '⚠️ Revisions needed'}</strong></td></tr>
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
                    ${narrativeDoc.status === 'fully_approved'
                        ? '<p style="background:#f5f5f5;padding:16px;font-size:13px;">All narratives approved. Activate <strong>The Profiler</strong> to begin component mapping.</p>'
                        : '<p style="background:#fff8e1;padding:16px;font-size:13px;border-left:3px solid #e8870a;">Some pages need revisions. Address client comments and re-send the review link.</p>'
                    }
                    <p style="font-size:12px;color:#999;margin-top:16px;">Submitted: ${new Date(narrativeDoc.reviewSubmittedAt).toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}</p>
                </div>
            `
        });

        return res.status(200).json({
            success: true,
            approved: approvedCount,
            changesRequested: changesCount,
            total: narrativeDoc.pages.length,
            status: narrativeDoc.status
        });

    } catch (err) {
        console.error('SubmitNarrativeReview error:', err);
        return res.status(500).json({ error: 'Internal server error', details: err.message });
    }
};
