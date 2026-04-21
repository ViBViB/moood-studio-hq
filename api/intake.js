const { Resend } = require('resend');
const PDFDocument = require('pdfkit');
const Busboy = require('busboy');
const { put } = require('@vercel/blob');

const resend = new Resend(process.env.RESEND_API_KEY);

// IMPORTANT: Disable Vercel's default body parser to handle large streaming uploads
module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        console.log('Starting streaming intake processing...');
        
        const busboy = Busboy({ headers: req.headers });
        const fields = {};
        const uploadedAssets = [];
        const uploadPromises = [];

        const parseForm = new Promise((resolve, reject) => {
            busboy.on('field', (name, val) => {
                fields[name] = val;
            });

            busboy.on('file', (name, file, info) => {
                const { filename, mimeType } = info;
                console.log(`Piping file to Vercel Blob: ${filename}`);
                
                // Start the upload stream immediately
                const uploadPromise = put(filename, file, {
                    access: 'public',
                    contentType: mimeType,
                }).then(blob => {
                    uploadedAssets.push({ name: filename, url: blob.url });
                    console.log(`Upload successful: ${blob.url}`);
                }).catch(err => {
                    console.error(`Upload failed for ${filename}:`, err);
                    throw err;
                });
                
                uploadPromises.push(uploadPromise);
            });

            busboy.on('finish', async () => {
                try {
                    // Wait for all concurrent uploads to finish
                    await Promise.all(uploadPromises);
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
            
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
            
            if (uploadedAssets.length > 0) {
                doc.moveDown(1);
                doc.font('Helvetica-Bold').text('Uploaded Evidence Assets:');
                uploadedAssets.forEach(asset => {
                    doc.font('Helvetica').fillColor('blue').text(`- ${asset.name} (View online)`, { link: asset.url }).fillColor('black');
                });
            }
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

        // 2. Prepare Markdown block
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

${uploadedAssets.length > 0 ? `### Uploaded Evidence Assets:\n${uploadedAssets.map(a => `- [${a.name}](${a.url})`).join('\n')}` : ''}

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
                    <pre style="background: #f4f4f4; padding: 20px; border-left: 4px solid #000; overflow-x: auto; white-space: pre-wrap; font-size: 13px;">${markdownContent}</pre>
                    <p>Detailed PDF technical backing is attached.</p>
                </div>
            `,
            attachments: [
                {
                    filename: `Strategy_Intake_${companyName.replace(/\s+/g, '_')}.pdf`,
                    content: pdfBuffer,
                }
            ],
        });

        return res.status(200).json({ success: true });

    } catch (err) {
        console.error('INTAKE_API_ERROR:', err);
        return res.status(500).json({ error: 'Intake failed', message: err.message });
    }
};

// Vercel config to allow streaming and large payloads (bypass body limit)
module.exports.config = {
    api: {
        bodyParser: false,
    },
};
