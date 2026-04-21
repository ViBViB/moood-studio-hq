const { Resend } = require('resend');
const PDFDocument = require('pdfkit');
const Busboy = require('busboy');

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const busboy = Busboy({ headers: req.headers });
        const fields = {};
        const attachments = [];

        const parseForm = new Promise((resolve, reject) => {
            busboy.on('field', (name, val) => {
                fields[name] = val;
            });

            busboy.on('file', (name, file, info) => {
                const { filename, mimeType } = info;
                const chunks = [];
                file.on('data', chunk => chunks.push(chunk));
                file.on('end', () => {
                    attachments.push({
                        filename,
                        content: Buffer.concat(chunks),
                        contentType: mimeType
                    });
                });
            });

            busboy.on('finish', resolve);
            busboy.on('error', reject);
            req.pipe(busboy);
        });

        await parseForm;

        const { companyName, fullName, email, evidence, adversary, portrait, objective } = fields;

        if (!companyName || !fullName || !evidence || !adversary || !portrait || !objective) {
            return res.status(400).json({ error: 'Missing strategic requirements' });
        }

        // 1. Generate PDF
        const pdfBuffer = await new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 });
            const chunks = [];
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            doc.fontSize(24).font('Helvetica-Bold').text('STRATEGIC INTAKE', { letterSpacing: 2 });
            doc.fontSize(10).font('Helvetica').text('MOOOD.STUDIO AGENCY PROTOCOL', { characterSpacing: 1 });
            doc.moveDown(2);
            doc.rect(50, doc.y, 500, 1).fill('#000000');
            doc.moveDown(2);

            doc.fontSize(14).font('Helvetica-Bold').text('01. PROJECT IDENTIFICATION');
            doc.moveDown(0.5);
            doc.fontSize(10).font('Helvetica-Bold').text('Project: ', { continued: true }).font('Helvetica').text(companyName);
            doc.font('Helvetica-Bold').text('Lead: ', { continued: true }).font('Helvetica').text(fullName);
            doc.font('Helvetica-Bold').text('Email: ', { continued: true }).font('Helvetica').text(email);
            doc.moveDown(2);

            doc.fontSize(14).font('Helvetica-Bold').text('02. EVIDENCE REPOSITORY');
            doc.moveDown(0.5);
            doc.fontSize(10).font('Helvetica').text(evidence, { width: 500, align: 'justify' });
            
            if (attachments.length > 0) {
                doc.moveDown(1);
                doc.font('Helvetica-Bold').text('Attached Files:');
                attachments.forEach(att => {
                    doc.font('Helvetica').text(`- ${att.filename}`);
                });
            }
            doc.moveDown(2);

            doc.fontSize(14).font('Helvetica-Bold').text('03. THE ADVERSARY');
            doc.moveDown(0.5);
            doc.fontSize(10).font('Helvetica').text(adversary, { width: 500, align: 'justify' });
            doc.moveDown(2);

            doc.fontSize(14).font('Helvetica-Bold').text('04. THE HUMAN PORTRAIT');
            doc.moveDown(0.5);
            doc.fontSize(10).font('Helvetica').text(portrait, { width: 500, align: 'justify' });
            doc.moveDown(2);

            doc.fontSize(14).font('Helvetica-Bold').text('05. SINGULAR OBJECTIVE');
            doc.moveDown(0.5);
            doc.fontSize(10).font('Helvetica-Bold').text('CTA: ', { continued: true }).font('Helvetica').text(objective);

            doc.end();
        });

        // 2. Prepare AI instructions
        const markdownContent = `
/strategy-director

Brief: PROJECTS/_training/STRATEGIST/T13/01-PRD.md
Content type: homepage
Deliverable: Strategic Audit completo + Narrative Script con Creative Refinement Pass.
Idioma de output: español

# STRATEGY INTAKE: ${companyName}
**Lead:** ${fullName} (${email})

## 1. Evidence Repository
${evidence}

${attachments.length > 0 ? `### Attached Assets:\n${attachments.map(a => `- ${a.filename}`).join('\n')}` : ''}

## 2. The Adversary
${adversary}

## 3. Human Portrait
${portrait}

## 4. Singular Objective
${objective}
        `.trim();

        // 3. Send email to AGENCY with attachments
        await resend.emails.send({
            from: 'Moood Studio <notifications@moood.studio>',
            to: ['alberto.contreras@gmail.com'],
            subject: `[STRATEGY INTAKE] ${companyName}`,
            html: `
                <div style="font-family: sans-serif; color: #111; max-width: 700px;">
                    <h2 style="border-bottom: 2px solid #000; padding-bottom: 10px;">New Strategic Intake Received</h2>
                    <p>Copy the following block for the Strategy Director:</p>
                    <pre style="background: #f4f4f4; padding: 20px; border-left: 4px solid #000; font-size: 13px;">${markdownContent}</pre>
                    <p>PDF summary and ${attachments.length} files are attached.</p>
                </div>
            `,
            attachments: [
                {
                    filename: `Strategy_Intake_${companyName.replace(/\s+/g, '_')}.pdf`,
                    content: pdfBuffer,
                },
                ...attachments.map(a => ({
                    filename: a.filename,
                    content: a.content,
                }))
            ],
        });

        return res.status(200).json({ success: true });

    } catch (err) {
        console.error('STABLE_INTAKE_ERROR:', err);
        return res.status(500).json({ error: 'Intake failed', message: err.message });
    }
};

// Re-enable body parser but keep it to Vercel default limits for stability
module.exports.config = {
    api: {
        bodyParser: false, // Busboy needs this false but the limit remains at 4.5MB
    },
};
