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

        const { companyName, fullName, email, pageType, evidence, adversary, portrait, objective } = fields;

        // DEBUG: Ensure we see what we are receiving
        console.log('INTAKE_FIELDS_RECEIVED:', { companyName, fullName, email, pageType });

        if (!email) {
            return res.status(400).json({ error: 'Delivery email is required' });
        }

        if (!companyName || !fullName || !evidence || !adversary || !portrait || !objective) {
            return res.status(400).json({ 
                error: 'Missing strategic requirements', 
                missing: Object.entries({ companyName, fullName, evidence, adversary, portrait, objective })
                    .filter(([k,v]) => !v).map(([k,v]) => k)
            });
        }

        if (!process.env.RESEND_API_KEY) {
            console.error('MISSING_RESEND_API_KEY');
            return res.status(500).json({ error: 'Server configuration error: Resend API Key missing' });
        }

        // 1. Generate PDF Technical Audit
        // ... [rest of PDF logic stays same]
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

        const markdownContent = `
/strategy-director

# STRATEGY INTAKE: ${companyName}
**Lead:** ${fullName} (${email})

## [GATE 0] — MANDATORY WORKSPACE ISOLATION
1. **Research Requirement**: Run \`ls PROJECTS/\` to identify the highest existing version of \`PROJECTS/${companyName.replace(/\s+/g, '_')}\`.
2. **Strict Versioning**: You MUST increment the version number by exactly +1 (e.g., if no folder exists, initialize \`V1\`).
3. **Ghost Creation**: Create the new folder \`PROJECTS/${companyName.replace(/\s+/g, '_')}-V[N]\`.
   *Rule: It is strictly forbidden to use, read, or reference any markdown files from previous versions. This must be a 100% clean strategic build based only on the evidence below.*

## Project Protocol (Phase-by-Phase)
1. **Phase 1 (Setup)**: Generate \`01-PRD.md\` inside the NEW workspace.
2. **Phase 2 (Audit)**: Execute \`02-STRATEGIC-AUDIT.md\` + \`04-TENSION_MAP.md\`.
3. **Phase 3 (Scripting)**: Deliver \`03-NARRATIVE.md\` built for a **${pageType || 'Homepage'}**. Use the Two-Layer Content Law.
4. **Phase 4 (Validation)**: Run \`05-VISITOR_REVIEW.md\` (Automated Skeptic Protocol).
5. **Phase 5 (Publication)**: Deploy \`narrative-review/index.html\` to \`MOOOD.STUDIO-WEBSITE/${companyName.toLowerCase().replace(/\s+/g, '-')}-v[n]\`.

## Page Type
**${pageType || 'Not specified'}**

## Evidence Repository
${evidence}

## The Adversary
${adversary}

## Human Portrait
${portrait}

## Singular Objective
${objective}
        `.trim();

        // 3. Send email with Direct Attachments
        const finalAttachments = [
            {
                filename: `Strategy_Intake_${companyName.replace(/\s+/g, '_')}.pdf`,
                content: pdfBuffer,
            },
            ...attachments
        ];

        const { data, error } = await resend.emails.send({
            from: 'Moood Studio <notifications@moood.studio>',
            to: ['alberto.contreras@gmail.com'],
            cc: ['notifications@moood.studio'],
            subject: `[STRATEGY INTAKE] ${companyName}`,
            html: `
                <div style="font-family: sans-serif; color: #111; max-width: 700px;">
                    <h2 style="border-bottom: 2px solid #000; padding-bottom: 10px;">New Strategic Intake Received</h2>
                    <p>Lead Email: ${email}</p>
                    <p>Copy & Paste to **Strategy Director**:</p>
                    <pre style="background: #f4f4f4; padding: 20px; border-left: 4px solid #000; white-space: pre-wrap; font-size: 13px;">${markdownContent}</pre>
                    <p>Attached: Technical PDF + Evidence Files.</p>
                </div>
            `,
            attachments: finalAttachments,
        });

        if (error) {
            console.error('RESEND_ERROR:', error);
            return res.status(500).json({ 
                error: 'Email delivery failed vía Resend', 
                details: error,
                message: error.message 
            });
        }

        return res.status(200).json({ success: true, id: data.id });

    } catch (err) {
        console.error('INTAKE_API_ERROR:', err);
        return res.status(500).json({ error: 'Intake failed', message: err.message });
    }
};

module.exports.config = {
    api: {
        bodyParser: false,
    },
};
