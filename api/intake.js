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

        // DEBUG
        console.log('INTAKE_FIELDS:', { companyName, email });

        if (!email) return res.status(400).json({ error: 'Delivery email is required' });
        
        if (!companyName || !fullName || !evidence || !adversary || !portrait || !objective) {
            return res.status(400).json({ 
                error: 'Missing strategic requirements', 
                missing: Object.entries({ companyName, fullName, evidence, adversary, portrait, objective })
                    .filter(([k,v]) => !v).map(([k,v]) => k)
            });
        }

        const markdownContent = `
/strategy-director

# STRATEGY INTAKE: ${companyName}
**Lead:** ${fullName} (${email})

## [GATE 0] — MANDATORY WORKSPACE ISOLATION
1. **Research Requirement**: Run \`ls PROJECTS/\` to identify the highest existing version of \`PROJECTS/${companyName.replace(/\s+/g, '_')}\`.
2. **Strict Versioning**: You MUST increment the version number by exactly +1.
3. **Ghost Creation**: Create the new folder \`PROJECTS/${companyName.replace(/\s+/g, '_')}-V[N]\`.

## Project Protocol (Phase-by-Phase)
1. **Phase 1 (Setup)**: Generate \`01-PRD.md\`
2. **Phase 2 (Audit)**: Execute \`02-STRATEGIC-AUDIT.md\` + \`04-TENSION_MAP.md\`.
3. **Phase 3 (Scripting)**: Deliver \`03-NARRATIVE.md\` for **${pageType || 'Homepage'}**.
4. **Phase 4 (Validation)**: Run \`05-VISITOR_REVIEW.md\`.

## Evidence Repository
${evidence}

## The Adversary
${adversary}

## Human Portrait
${portrait}

## Singular Objective
${objective}
        `.trim();

        const { data, error } = await resend.emails.send({
            from: 'Moood Intake <notifications@moood.studio>',
            to: ['alberto.contreras@gmail.com'],
            cc: [email],
            subject: `[STRATEGY INTAKE] ${companyName}`,
            html: `
                <div style="font-family: sans-serif; color: #111; max-width: 600px; line-height: 1.6;">
                    <h2 style="border-bottom: 2px solid #000; padding-bottom: 10px;">Strategic Intake: ${companyName}</h2>
                    <p><strong>Customer:</strong> ${fullName} (${email})</p>
                    <p><strong>Page Type:</strong> ${pageType || 'Homepage'}</p>
                    
                    <div style="background: #f9f9f9; padding: 20px; border: 1px solid #ddd; margin: 20px 0;">
                        <h4 style="margin-top: 0;">Copy to Strategy Director:</h4>
                        <pre style="white-space: pre-wrap; font-size: 12px; background: #fff; padding: 15px; border: 1px solid #eee;">${markdownContent}</pre>
                    </div>

                    <h3 style="margin-top: 30px;">Strategic Breakdown:</h3>
                    <p><strong>Evidence:</strong><br>${evidence.replace(/\n/g, '<br>')}</p>
                    <p><strong>Adversary:</strong><br>${adversary.replace(/\n/g, '<br>')}</p>
                    <p><strong>Portrait:</strong><br>${portrait}</p>
                    <p><strong>Objective:</strong><br>${objective}</p>
                </div>
            `,
            attachments: attachments
        });

        if (error) {
            console.error('RESEND_ERROR:', error);
            return res.status(500).json({ error: 'Email failed', details: error });
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
