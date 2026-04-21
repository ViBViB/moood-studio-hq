const { Resend } = require('resend');
const PDFDocument = require('pdfkit');

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const data = req.body;
        const { companyName, fullName, email, evidence, adversary, portrait, objective } = data;

        if (!companyName || !fullName || !evidence || !adversary || !portrait || !objective) {
            return res.status(400).json({ error: 'Missing strategic requirements' });
        }

        // 1. Generate PDF for the file system / record
        const pdfBuffer = await new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 });
            const chunks = [];
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // Header
            doc.fontSize(24).font('Helvetica-Bold').text('STRATEGIC INTAKE', { letterSpacing: 2 });
            doc.fontSize(10).font('Helvetica').text('MOOOD.STUDIO AGENCY PROTOCOL', { characterSpacing: 1 });
            doc.moveDown(2);
            doc.rect(50, doc.y, 500, 1).fill('#000000');
            doc.moveDown(2);

            // Identification
            doc.fontSize(14).font('Helvetica-Bold').text('01. PROJECT IDENTIFICATION');
            doc.moveDown(0.5);
            doc.fontSize(10).font('Helvetica-Bold').text('Project: ', { continued: true }).font('Helvetica').text(companyName);
            doc.font('Helvetica-Bold').text('Lead: ', { continued: true }).font('Helvetica').text(fullName);
            doc.font('Helvetica-Bold').text('Email: ', { continued: true }).font('Helvetica').text(email);
            doc.moveDown(2);

            // Evidence
            doc.fontSize(14).font('Helvetica-Bold').text('02. EVIDENCE REPOSITORY');
            doc.moveDown(0.5);
            doc.fontSize(10).font('Helvetica').text(evidence, { width: 500, align: 'justify' });
            doc.moveDown(2);

            // Adversary
            doc.fontSize(14).font('Helvetica-Bold').text('03. THE ADVERSARY');
            doc.moveDown(0.5);
            doc.fontSize(10).font('Helvetica').text(adversary, { width: 500, align: 'justify' });
            doc.moveDown(2);

            // Portrait
            doc.fontSize(14).font('Helvetica-Bold').text('04. THE HUMAN PORTRAIT');
            doc.moveDown(0.5);
            doc.fontSize(10).font('Helvetica').text(portrait, { width: 500, align: 'justify' });
            doc.moveDown(2);

            // Objective
            doc.fontSize(14).font('Helvetica-Bold').text('05. SINGULAR OBJECTIVE');
            doc.moveDown(0.5);
            doc.fontSize(10).font('Helvetica-Bold').text('CTA: ', { continued: true }).font('Helvetica').text(objective);

            doc.end();
        });

        // 2. Prepare Markdown block for the Strategy Director (AI)
        const markdownContent = `
# STRATEGY INTAKE: ${companyName}
**Lead:** ${fullName} (${email})

## 1. Evidence Repository
${evidence}

## 2. The Adversary
${adversary}

## 3. Human Portrait
${portrait}

## 4. Singular Objective
${objective}
        `.trim();

        // 3. Send email to AGENCY
        await resend.emails.send({
            from: 'Moood Studio <notifications@moood.studio>',
            to: ['alberto.contreras@gmail.com'],
            subject: `[STRATEGY INTAKE] ${companyName}`,
            html: `
                <div style="font-family: sans-serif; color: #111; max-width: 700px;">
                    <h2 style="border-bottom: 2px solid #000; padding-bottom: 10px;">New Strategic Intake Received</h2>
                    <p>Copy the following block and paste it to the **Strategy Director** to begin the Strategic Audit:</p>
                    
                    <pre style="background: #f4f4f4; padding: 20px; border-left: 4px solid #000; overflow-x: auto; white-space: pre-wrap; font-size: 13px;">
${markdownContent}
                    </pre>

                    <p>Detailed PDF technical backing is attached.</p>
                </div>
            `,
            attachments: [
                {
                    filename: `Strategy_Intake_${companyName.replace(/\s+/g, '_')}.pdf`,
                    content: pdfBuffer,
                },
            ],
        });

        return res.status(200).json({ success: true, message: 'Intake transmitted successfully' });

    } catch (err) {
        console.error('Intake API Error:', err);
        return res.status(500).json({ error: 'Internal server error', details: err.message });
    }
};
