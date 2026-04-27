const { list } = require('@vercel/blob');

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { code } = req.query;

    if (!code || !/^MSD-\d{4}-\d{4}$/.test(code.trim())) {
        return res.status(400).json({ error: 'Invalid code format' });
    }

    try {
        // Find blob by pathname prefix
        const { blobs } = await list({ prefix: `codes/${code.trim()}.json` });

        if (!blobs || blobs.length === 0) {
            return res.status(404).json({ error: 'Code not found' });
        }

        // Fetch blob content from its public URL
        const response = await fetch(blobs[0].url);
        if (!response.ok) {
            return res.status(500).json({ error: 'Failed to read project data' });
        }

        const data = await response.json();

        return res.status(200).json({
            valid: true,
            code: data.code,
            projectName: data.projectName,
            clientName: data.clientName,
            tier: data.tier,
            pages: data.pages,
            createdAt: data.createdAt
        });

    } catch (err) {
        console.error('ValidateCode error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
