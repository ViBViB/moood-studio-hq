const { Resend } = require('resend');
const { put } = require('@vercel/blob');

const resend = new Resend(process.env.RESEND_API_KEY);

function generateCode() {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `MSD-${year}-${random}`;
}

function scenarioLabel(scenario) {
    const map = {
        'A':   'A — Brand-Free (agency full authority)',
        'B':   'B — Figma Fidelity (client has Figma tokens)',
        'C':   'C — Component-Locked (client has component library)',
        'B+C': 'B+C — Figma + Component-Locked'
    };
    return map[scenario] || scenario;
}

function buildStrategyPrompt({ code, clientName, clientEmail, projectName, projectType, tier, pages, hasNarrative, hasBrandkit, scenario }) {
    const pageList = (pages || []).map((p, i) => {
        const name = typeof p === 'object' ? p.name : p;
        const type = typeof p === 'object' ? p.type : '—';
        return `  ${i + 1}. ${name} (${type})`;
    }).join('\n');

    const narrativeStatus = hasNarrative
        ? '✅ NARRATIVE-PROVIDED — client delivers final copy. Phase 1 skipped. Copy is LOCKED verbatim.'
        : '⚠️ NO NARRATIVE — Strategist writes from scratch. Run full Phase 1 pipeline.';

    const brandkitStatus = hasBrandkit
        ? '✅ BRAND-LOCKED — client has brand assets. Read 00-BRAND_LOCK.md before build.'
        : '— BRAND-FREE — Painter defines palette and assets.';

    return `
        <div style="background:#f5f5f5;padding:24px;border-radius:4px;margin:20px 0;font-family:monospace;font-size:13px;line-height:2;white-space:pre-wrap;border-left:4px solid #000;">
<strong>═══════════════════════════════════════════</strong>
<strong>STRATEGY DIRECTOR — ACTIVACIÓN</strong>
<strong>═══════════════════════════════════════════</strong>

CÓDIGO:        ${code}
CLIENTE:       ${clientName}
EMAIL:         ${clientEmail || '—'}
PROYECTO:      ${projectName}
TIPO:          ${projectType || 'website'}
TIER:          ${tier || '—'}
ESCENARIO:     ${scenarioLabel(scenario)}

NARRATIVE:     ${narrativeStatus}
BRAND:         ${brandkitStatus}

PÁGINAS APROBADAS (${(pages || []).length}):
${pageList}

─────────────────────────────────────────────
INSTRUCCIÓN AL STRATEGIST:
Ejecuta el pipeline completo para este proyecto:
  PRD → Manifesto → Narrativa por página → Tension Map

${hasNarrative
    ? 'El cliente entregará sus narrativas en el intake.\nEspera sus documentos antes de construir el esqueleto.'
    : `Escribe una narrativa por cada página listada arriba, en ese orden.\nEl intake del cliente llegará en un email separado con:\nfuentes, audiencia, competencia y objetivos de conversión.`
}
<strong>═══════════════════════════════════════════</strong>
        </div>`;
}

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const {
            clientName, clientEmail, projectName,
            projectType, tier, pages,
            hasNarrative, hasBrandkit, scenario,
            status
        } = req.body;

        if (!clientName || !projectName) {
            return res.status(400).json({ error: 'Missing proposal information' });
        }

        // 1. Generate unique project code
        const code = generateCode();
        const createdAt = new Date().toISOString();

        // 2. Store full project passport in Vercel Blob
        const projectPassport = {
            code,
            clientName,
            clientEmail:  clientEmail || '',
            projectName,
            projectType:  projectType  || 'website',
            tier:         tier         || 'medium',
            pages:        pages        || [],
            hasNarrative: hasNarrative || false,
            hasBrandkit:  hasBrandkit  || false,
            scenario:     scenario     || 'A',
            status:       status       || 'Approved',
            createdAt
        };

        await put(`codes/${code}.json`, JSON.stringify(projectPassport), {
            access: 'public',
            contentType: 'application/json'
        });

        // 3. Notify agency (Alberto) — Strategist activation prompt
        await resend.emails.send({
            from: 'Moood Studio <notifications@moood.studio>',
            to: ['alberto.contreras@gmail.com'],
            subject: `✅ Aprobado: ${projectName} (${clientName}) — ${code}`,
            html: `
                <div style="font-family:'Helvetica Neue',sans-serif;color:#111;max-width:600px;line-height:1.6;">
                    <h1 style="font-size:20px;border-bottom:2px solid #000;padding-bottom:10px;margin-bottom:16px;">PROPUESTA APROBADA</h1>
                    <table style="width:100%;font-size:13px;border-collapse:collapse;margin-bottom:8px;">
                        <tr><td style="padding:4px 0;color:#666;width:120px;">Proyecto</td><td><strong>${projectName}</strong></td></tr>
                        <tr><td style="padding:4px 0;color:#666;">Cliente</td><td>${clientName}</td></tr>
                        <tr><td style="padding:4px 0;color:#666;">Email</td><td>${clientEmail || '—'}</td></tr>
                        <tr><td style="padding:4px 0;color:#666;">Tipo</td><td>${projectType || 'website'}</td></tr>
                        <tr><td style="padding:4px 0;color:#666;">Tier</td><td>${tier || '—'}</td></tr>
                        <tr><td style="padding:4px 0;color:#666;">Escenario</td><td>${scenarioLabel(scenario)}</td></tr>
                        <tr><td style="padding:4px 0;color:#666;">Narrative</td><td>${hasNarrative ? 'Narrative-Provided' : 'Strategist writes'}</td></tr>
                        <tr><td style="padding:4px 0;color:#666;">Brandkit</td><td>${hasBrandkit ? 'Brand-Locked' : 'Brand-Free'}</td></tr>
                        <tr><td style="padding:4px 0;color:#666;">Páginas</td><td>${(pages || []).length}</td></tr>
                        <tr><td style="padding:4px 0;color:#666;">Código</td><td><strong style="font-size:15px;letter-spacing:2px;">${code}</strong></td></tr>
                        <tr><td style="padding:4px 0;color:#666;">Fecha</td><td>${new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}</td></tr>
                    </table>
                    ${buildStrategyPrompt({ code, clientName, clientEmail, projectName, projectType, tier, pages, hasNarrative, hasBrandkit, scenario })}
                    <p style="font-size:12px;color:#999;margin-top:16px;">El cliente recibirá su código de intake por email separado.</p>
                </div>
            `,
        });

        // 4. Send intake invitation to client
        if (clientEmail && clientEmail !== 'Not Provided') {
            const intakeUrl = `https://moood.studio/client-intake?code=${code}`;
            await resend.emails.send({
                from: 'Alberto at Moood.Studio <alberto@moood.studio>',
                to: [clientEmail],
                subject: `Your project is approved — next step inside`,
                html: `
                    <div style="font-family:'Helvetica Neue',sans-serif;color:#111;max-width:600px;line-height:1.8;">
                        <h1 style="font-size:20px;border-bottom:2px solid #000;padding-bottom:10px;">Project Approved</h1>
                        <p>Hi ${clientName},</p>
                        <p>Great news — <strong>${projectName}</strong> is confirmed. We're ready to start.</p>
                        <p>The next step is a short brief so we have everything we need to build. It takes about 10–15 minutes — no decisions to make, just your raw material.</p>
                        <div style="background:#f5f5f5;padding:24px;border-radius:4px;margin:24px 0;text-align:center;">
                            <p style="margin:0 0 8px;font-size:12px;color:#666;text-transform:uppercase;letter-spacing:1.5px;">Your project code</p>
                            <p style="margin:0;font-size:32px;font-weight:700;letter-spacing:6px;">${code}</p>
                        </div>
                        <p style="text-align:center;">
                            <a href="${intakeUrl}" style="display:inline-block;background:#000;color:#fff;padding:14px 36px;text-decoration:none;font-weight:600;font-size:14px;letter-spacing:0.5px;border-radius:2px;">Start your brief →</a>
                        </p>
                        <p style="font-size:12px;color:#999;margin-top:24px;">If the button doesn't work:<br>${intakeUrl}</p>
                        <br>
                        <p>Talk soon,<br><strong>Alberto</strong><br><span style="color:#999;">Moood.Studio</span></p>
                    </div>
                `
            });
        }

        return res.status(200).json({ success: true, code });

    } catch (err) {
        console.error('Approval API Error:', err);
        return res.status(500).json({ error: 'Internal server error', details: err.message });
    }
};
