const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { clientName, projectName, status } = req.body;

        if (!clientName || !projectName) {
            return res.status(400).json({ error: 'Missing proposal information' });
        }

        // 1. Send notification to AGENCY (Alberto)
        await resend.emails.send({
            from: 'Moood Studio <notifications@moood.studio>',
            to: ['alberto.contreras@gmail.com'],
            subject: `✅ Proposal Approved: ${projectName} (${clientName})`,
            html: `
                <div style="font-family: sans-serif; color: #111; max-width: 600px; line-height: 1.6;">
                    <h1 style="font-size: 24px; border-bottom: 2px solid #000; padding-bottom: 10px; color: #000;">PROPOSAL APPROVED</h1>
                    <p>Good news! A proposal has just been approved by the client.</p>
                    <div style="background: #f5f5f5; padding: 20px; border-radius: 4px; margin: 20px 0;">
                        <p><strong>Project:</strong> ${projectName}</p>
                        <p><strong>Client:</strong> ${clientName}</p>
                        <p><strong>Action:</strong> ${status || 'Approved via Web Portal'}</p>
                        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                    </div>
                    <p>You can now proceed with the activation invoice and project kickoff.</p>
                    <br>
                    <p>Best regards,<br><strong>Moood.Studio System</strong></p>
                </div>
            `,
        });

        // 2. Send Confirmation to CUSTOMER
        // Note: For now, we are hardcoding a generic confirmation, 
        // but in a full system we would take the client's email from the request.
        
        return res.status(200).json({ success: true, message: 'Approval notification sent' });

    } catch (err) {
        console.error('Approval API Error:', err);
        return res.status(500).json({ error: 'Internal server error', details: err.message });
    }
};
