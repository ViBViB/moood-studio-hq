const { put } = require('@vercel/blob');

function generateId() {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `PROP-${year}-${random}`;
}

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const data = req.body;

        if (!data.clientName || !data.projectName) {
            return res.status(400).json({ error: 'clientName and projectName are required' });
        }

        const id = generateId();
        const createdAt = new Date().toISOString();

        const proposal = { ...data, id, createdAt };

        await put(`proposals/${id}.json`, JSON.stringify(proposal), {
            access: 'public',
            contentType: 'application/json'
        });

        const url = `${process.env.SITE_URL || 'https://moood.studio'}/p/${id}`;

        return res.status(200).json({ success: true, id, url });

    } catch (err) {
        console.error('GenerateProposal error:', err);
        return res.status(500).json({ error: 'Internal server error', details: err.message });
    }
};
