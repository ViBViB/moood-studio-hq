const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, projectName, feedback, pages } = req.body || {};

        if (!feedback) return res.status(400).json({ error: 'Feedback text is required' });

        const pagesList = Array.isArray(pages) && pages.length
            ? `<ul style="margin:12px 0;padding-left:20px;font-size:13px;color:#444;">${pages.map(p => `<li>${p}</li>`).join('')}</ul>`
            : '';

        await resend.emails.send({
            from: 'Moood Intake <notifications@moood.studio>',
            to: ['alberto.contreras@gmail.com'],
            subject: `[REQUEST CHANGES] ${projectName || 'Unnamed project'}`,
            html: `
                <div style="font-family:'Helvetica Neue',sans-serif;color:#111;max-width:600px;line-height:1.6;">
                    <h2 style="border-bottom:2px solid #000;padding-bottom:10px;">[REQUEST CHANGES] ${projectName || 'Unnamed project'}</h2>
                    <p><strong>Client email:</strong> ${email || '—'}</p>
                    <p><strong>Feedback:</strong></p>
                    <blockquote style="margin:0;padding:12px 16px;background:#f5f5f5;border-left:3px solid #000;font-size:15px;">${feedback}</blockquote>
                    ${pagesList ? `<p style="margin-top:20px;"><strong>Pages in review:</strong></p>${pagesList}` : ''}
                    <p style="font-size:12px;color:#999;margin-top:24px;">Sent from moood.studio/client-intake</p>
                </div>`
        });

        return res.status(200).json({ success: true });

    } catch (err) {
        console.error('SITEMAP_FEEDBACK_ERROR:', err);
        return res.status(500).json({ error: 'Failed to send feedback', message: err.message });
    }
};
