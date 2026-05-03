/**
 * Moood.Studio — Shared email renderer
 * Produces consistent HTML for all outbound and internal comms via Resend.
 *
 * Usage:
 *   const { buildEmail } = require('./_email');
 *   html: buildEmail({ headline, body, ... })
 */

const LOGO_SVG = `<img src="https://moood.studio/assets/images/moood-logo-w.svg" width="50" height="50" alt="Moood.Studio" style="display:block; border:0; outline:none; text-decoration:none;">`;

/**
 * @param {object} opts
 * @param {string}        [opts.projectName]   — shown top-right of header in small caps
 * @param {string}        [opts.context]       — muted label below project name (e.g. "Narrative Review")
 * @param {string}        [opts.greeting]      — "Hi Sarah," — omit for internal emails
 * @param {string}        opts.headline        — large heading, supports <br>
 * @param {string|string[]} opts.body          — paragraph(s) of body text
 * @param {string}        [opts.highlight]     — optional pre-built HTML for highlighted block
 * @param {{ label: string, href: string }} [opts.cta] — primary CTA button
 * @param {string}        [opts.linkFallback]  — "Or copy this link:" URL
 * @param {boolean}       [opts.signature]     — show "Talk soon, Alberto / Moood.Studio" (default true)
 * @param {string}        [opts.footer]        — small footer text (project code, reply instruction)
 * @returns {string} full HTML email string
 */
function buildEmail({ projectName, context, greeting, headline, body, highlight, cta, linkFallback, signature = true, footer }) {
  const headerRight = (projectName || context) ? `
              <td align="right" valign="middle">
                ${projectName ? `<p style="margin:0 0 4px;font-size:16px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#fff;">${projectName}</p>` : ''}
                ${context ? `<p style="margin:0;font-size:14px;letter-spacing:0.06em;text-transform:uppercase;color:rgba(255,255,255,0.4);">${context}</p>` : ''}
              </td>` : '';

  const greetingHtml = greeting
    ? `<p style="margin:0 0 20px;font-size:14px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:rgba(0,0,0,0.3);">${greeting}</p>`
    : '';

  const headlineHtml = headline
    ? `<h1 style="margin:0 0 24px;font-size:40px;font-weight:400;color:#000;line-height:1.15;letter-spacing:-0.01em;">${headline.replace(/<br\s*\/?>/gi, ' ')}</h1>`
    : '';

  const paragraphs = Array.isArray(body) ? body : (body ? [body] : []);
  const bodyHtml = paragraphs.map(p =>
    `<p style="margin:0 0 16px;font-size:18px;line-height:1.65;color:rgba(0,0,0,0.55);">${p}</p>`
  ).join('');

  const highlightHtml = highlight
    ? `<div style="background:#f5f5f5;padding:28px 32px;margin:28px 0 0;">${highlight}</div>`
    : '';

  const ctaHtml = cta ? `
          <table cellpadding="0" cellspacing="0" style="margin:36px 0 0;">
            <tr>
              <td style="background:#000;">
                <a href="${cta.href}" style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#fff;text-decoration:none;">${cta.label}</a>
              </td>
            </tr>
          </table>` : '';

  const linkFallbackHtml = linkFallback ? `
          <p style="margin:20px 0 0;font-size:14px;color:rgba(0,0,0,0.3);line-height:1.7;">
            Or copy this link:<br>
            <span style="color:rgba(0,0,0,0.5);word-break:break-all;">${linkFallback}</span>
          </p>` : '';

  const signatureHtml = signature ? `
          <p style="margin:44px 0 0;font-size:14px;line-height:1.9;color:rgba(0,0,0,0.5);">
            Talk soon,<br>
            <strong style="color:#000;font-weight:600;">Alberto</strong><br>
            <span style="color:rgba(0,0,0,0.3);">Moood.Studio</span>
          </p>` : '';

  const footerHtml = footer ? `
        <tr>
          <td style="padding:20px 48px 0;border-top:1px solid rgba(0,0,0,0.06);">
            <p style="margin:0;font-size:14px;color:rgba(0,0,0,0.3);line-height:1.7;">${footer}</p>
          </td>
        </tr>` : '';

  const brandFooterHtml = `
        <tr>
          <td style="padding:28px 48px 36px;border-top:1px solid rgba(0,0,0,0.06);">
            <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#000;">
              <a href="https://moood.studio" style="color:#000;text-decoration:none;">Moood.Studio</a>
            </p>
            <p style="margin:0 0 20px;font-size:14px;color:rgba(0,0,0,0.35);">Strategic Design &amp; Brand Architecture</p>
            <p style="margin:0;font-size:14px;color:rgba(0,0,0,0.25);line-height:1.7;">Confidentiality Notice: This message is private and confidential. If you are not the intended recipient, please notify the sender and delete this message.</p>
          </td>
        </tr>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f0f0f0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 24px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;">

          <!-- HEADER -->
          <tr>
            <td style="background:#000;padding:24px 48px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td valign="middle">${LOGO_SVG}</td>${headerRight}
                </tr>
              </table>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:48px 48px 40px;">
              ${greetingHtml}
              ${headlineHtml}
              ${bodyHtml}
              ${highlightHtml}
              ${ctaHtml}
              ${linkFallbackHtml}
              ${signatureHtml}
            </td>
          </tr>

          ${footerHtml}
          ${brandFooterHtml}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Renders a data table for internal emails.
 * @param {Array<[string, string]>} rows — [[label, value], ...]
 */
function dataTable(rows) {
  return `<table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:14px;">
    ${rows.map(([label, value]) => `
    <tr style="border-bottom:1px solid rgba(0,0,0,0.06);">
      <td style="padding:8px 0;color:rgba(0,0,0,0.35);width:140px;vertical-align:top;">${label}</td>
      <td style="padding:8px 0;color:#000;font-weight:500;">${value}</td>
    </tr>`).join('')}
  </table>`;
}

/**
 * Renders a highlighted access code block (4 digit boxes).
 * @param {string} code — full code string, last 4 digits are displayed
 */
function codeBlock(code) {
  const digits = String(code).slice(-4).split('');
  const boxes = digits.map(d =>
    `<td style="padding:0 6px;"><div style="display:inline-block;width:60px;height:68px;line-height:68px;background:#fff;border:1.5px solid rgba(0,0,0,0.15);border-radius:8px;font-size:40px;font-weight:400;color:#000;text-align:center;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${d}</div></td>`
  ).join('');
  return `<p style="margin:0 0 16px;font-size:14px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:rgba(0,0,0,0.3);">Your 4-digit access code</p>
  <table cellpadding="0" cellspacing="0"><tr>${boxes}</tr></table>
  <p style="margin:16px 0 0;font-size:14px;color:rgba(0,0,0,0.3);letter-spacing:0.05em;">Full reference: ${code}</p>`;
}

module.exports = { buildEmail, dataTable, codeBlock };
