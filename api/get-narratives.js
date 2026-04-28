const { list } = require('@vercel/blob');

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { code } = req.query;

    if (!code || !/^MSD-\d{4}-\d{4}$/.test(code.trim())) {
        return res.status(400).json({ error: 'Invalid project code format' });
    }

    try {
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

        const data = await response.json();
        return res.status(200).json(data);

    } catch (err) {
        console.error('GetNarratives error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
