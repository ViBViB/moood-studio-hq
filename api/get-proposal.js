const { list } = require('@vercel/blob');

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { id } = req.query;

    if (!id || !/^PROP-\d{4}-\d{4}$/.test(id.trim())) {
        return res.status(400).json({ error: 'Invalid proposal ID format' });
    }

    try {
        const { blobs } = await list({ prefix: `proposals/${id.trim()}.json` });

        if (!blobs || blobs.length === 0) {
            return res.status(404).json({ error: 'Proposal not found' });
        }

        const response = await fetch(blobs[0].url);
        if (!response.ok) {
            return res.status(500).json({ error: 'Failed to read proposal data' });
        }

        const data = await response.json();
        return res.status(200).json(data);

    } catch (err) {
        console.error('GetProposal error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
