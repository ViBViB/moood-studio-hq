const { Redis } = require('@upstash/redis');
const { Resend } = require('resend');

module.exports = async (req, res) => {
    const { mode } = req.query;

    try {
        // 1. VALIDATE PROJECT CODE (from validate-code.js)
        if (mode === 'validate-code') {
            let code = req.body?.code || req.query.code;
            if (!code) return res.status(400).json({ error: 'Code is required' });
            
            const redis = Redis.fromEnv();
            
            // Try direct match
            let data = await redis.get(`codes/${code}`);
            
            // If 4 digits, try reconstruct with year
            if (!data && /^\d{4}$/.test(code)) {
                const fullCode = `MSD-${new Date().getFullYear()}-${code}`;
                data = await redis.get(`codes/${fullCode}`);
                
                // If still not found, search all codes
                if (!data) {
                    const keys = await redis.keys(`codes/*-${code}`);
                    if (keys.length > 0) {
                        data = await redis.get(keys[0]);
                    }
                }
            }
            
            if (!data) return res.status(404).json({ error: 'Code not found' });
            return res.status(200).json({ valid: true, ...data });
        }

        // 2. SITEMAP FEEDBACK (from sitemap-feedback.js)
        if (mode === 'feedback') {
            const resend = new Resend(process.env.RESEND_API_KEY);
            const { email, projectName, feedback } = req.body;
            await resend.emails.send({
                from: 'Moood Feedback <notifications@moood.studio>',
                to: ['alberto.contreras@gmail.com'],
                subject: `Feedback for ${projectName}`,
                html: `<p>${feedback}</p>`
            });
            return res.status(200).json({ success: true });
        }

        return res.status(400).json({ error: 'Invalid request' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
