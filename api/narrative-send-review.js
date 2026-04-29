/**
 * /api/narrative-send-review
 *
 * POST { code, projectName, clientUrl }
 *   → sends client review email via Resend
 *   → agency-only: no auth token required (button is hidden from clients by URL param)
 */

const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { code, projectName, clientUrl } = req.body || {};

    if (!code || !/^MSD-\d{4}-\d{4}$/.test(code.trim())) {
        return res.status(400).json({ error: 'Invalid project code' });
    }
    if (!clientUrl) {
        return res.status(400).json({ error: 'clientUrl is required' });
    }

    const name    = projectName || code;
    const subject = `Your narrative is ready for review — ${name}`;

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 24px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:#000;padding:40px 48px;">
              <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.4);">Moood.Studio</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:48px 48px 40px;">
              <h1 style="margin:0 0 16px;font-size:28px;font-weight:300;color:#000;line-height:1.2;">Your narrative<br>is ready.</h1>
              <p style="margin:0 0 32px;font-size:15px;line-height:1.65;color:rgba(0,0,0,0.55);">
                We've written the narrative for <strong style="color:#000;">${name}</strong>. Open each page, read through what we've written, and mark it as approved or request changes.
              </p>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#000;border-radius:6px;">
                    <a href="${clientUrl}" style="display:inline-block;padding:14px 28px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#fff;text-decoration:none;">
                      Review your narrative →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:32px 0 0;font-size:13px;color:rgba(0,0,0,0.35);line-height:1.6;">
                Or copy this link into your browser:<br>
                <span style="color:rgba(0,0,0,0.55);word-break:break-all;">${clientUrl}</span>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 48px 40px;border-top:1px solid rgba(0,0,0,0.06);">
              <p style="margin:0;font-size:11px;color:rgba(0,0,0,0.3);line-height:1.6;">
                This review was prepared by Moood.Studio · Project code: ${code}<br>
                Reply to this email if you have questions before reviewing.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    try {
        await resend.emails.send({
            from:    'Moood.Studio <narratives@moood.studio>',
            to:      ['alberto.contreras@gmail.com'],
            subject,
            html
        });

        return res.status(200).json({ success: true });

    } catch (err) {
        console.error('[narrative-send-review] Resend error:', err);
        return res.status(500).json({ error: 'Failed to send email' });
    }
};
