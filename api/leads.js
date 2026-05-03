const { Resend } = require('resend');
const { buildEmail, dataTable } = require('./_email');
const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async (req, res) => {
    const { mode } = req.query;
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const data = req.body;

        // 1. BOOKING (from book.js)
        if (mode === 'book') {
            await resend.emails.send({
                from: 'Moood Booking <notifications@moood.studio>',
                to: ['alberto.contreras@gmail.com'],
                subject: `New Discovery Call: ${data.name}`,
                html: buildEmail({ projectName: data.name, context: 'Booking', headline: 'New Call', body: `Lead: ${data.name} (${data.email})` })
            });
            return res.status(200).json({ success: true });
        }

        // 2. QUOTE (from quote.js)
        if (mode === 'quote') {
            await resend.emails.send({
                from: 'Moood Quotes <notifications@moood.studio>',
                to: ['alberto.contreras@gmail.com'],
                subject: `New Quote Request: ${data.company}`,
                html: buildEmail({ projectName: data.company, context: 'Quote', headline: 'New Lead', body: `Request from ${data.name}` })
            });
            return res.status(200).json({ success: true });
        }

        return res.status(400).json({ error: 'Invalid mode' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
