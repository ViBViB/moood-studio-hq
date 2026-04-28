const { put, list } = require('@vercel/blob');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Simple admin auth
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace('Bearer ', '').trim();
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

    try {
        // Check if passport exists for this code
        const { blobs: passportBlobs } = await list({ prefix: `codes/${code.trim()}.json` });
        if (!passportBlobs || passportBlobs.length === 0) {
            return res.status(404).json({ error: 'Project code not found in passport store' });
        }

        const narrativeDoc = {
            code: code.trim(),
            projectName: projectName || '',
            clientName: clientName || '',
            status: 'pending_review',
            createdAt: new Date().toISOString(),
            reviewSubmittedAt: null,
            pages: pages.map(p => ({
                id: p.id,
                name: p.name,
                type: p.type || 'page',
                reviewStatus: 'pending',
                reviewComment: '',
                narrative: {
                    headline: p.narrative?.headline || '',
                    intro: p.narrative?.intro || '',
                    sections: (p.narrative?.sections || []).map(s => ({
                        name: s.name,
                        blocks: Array.isArray(s.blocks) ? s.blocks : [s.blocks].filter(Boolean)
                    }))
                }
            }))
        };

        await put(`narratives/${code.trim()}.json`, JSON.stringify(narrativeDoc), {
            access: 'private',
            contentType: 'application/json'
        });

        return res.status(200).json({
            success: true,
            code: code.trim(),
            pages: narrativeDoc.pages.length,
            reviewUrl: `https://moood.studio/narrative-review?code=${code.trim()}`
        });

    } catch (err) {
        console.error('SetNarratives error:', err);
        return res.status(500).json({ error: 'Internal server error', details: err.message });
    }
};
