const { Redis } = require('@upstash/redis');
const { Resend } = require('resend');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { buildEmail, dataTable, codeBlock } = require('./_email');

// --- SHARED LOGIC / RENDERING ---
const LOGO_BLACK = `<svg width="60" height="60" viewBox="0 0 645 731" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M212.969 622.654C227.369 622.654 239.369 627.654 248.969 637.453C258.169 647.253 262.969 660.254 262.969 676.654C262.969 693.054 258.169 706.254 248.969 715.854C239.369 725.854 227.369 730.654 212.969 730.654C198.369 730.654 186.369 725.854 176.969 715.854C167.569 706.254 162.969 693.054 162.969 676.654C162.969 660.254 167.569 647.253 176.969 637.453C186.369 627.654 198.369 622.654 212.969 622.654ZM212.969 637.054C202.769 637.054 194.769 640.654 188.769 647.453C182.769 654.453 179.769 664.254 179.769 676.654C179.769 689.053 182.769 698.854 188.769 705.654C194.769 712.854 202.769 716.254 212.969 716.254C222.969 716.254 231.169 712.854 237.169 705.654C243.169 698.854 246.169 689.053 246.169 676.654C246.169 664.254 243.169 654.453 237.169 647.453C231.169 640.654 222.969 637.054 212.969 637.054Z" fill="black"/><path fill-rule="evenodd" clip-rule="evenodd" d="M327.031 622.654C341.431 622.654 353.431 627.654 363.031 637.453C372.231 647.253 377.031 660.254 377.031 676.654C377.031 693.054 372.231 706.254 363.031 715.854C353.431 725.854 341.431 730.654 327.031 730.654C312.431 730.654 300.431 725.854 291.031 715.854C281.631 706.254 277.031 693.054 277.031 676.654C277.031 660.254 281.631 647.253 291.031 637.453C300.431 627.654 312.431 622.654 327.031 622.654ZM327.031 637.054C316.831 637.054 308.831 640.654 302.831 647.453C296.831 654.453 293.831 664.254 293.831 676.654C293.831 689.054 296.831 698.854 302.831 705.654C308.831 712.854 316.831 716.254 327.031 716.254C337.031 716.254 345.231 712.854 351.231 705.654C357.231 698.854 360.231 689.054 360.231 676.654C360.231 664.254 357.231 654.453 351.231 647.453C345.231 640.654 337.031 637.054 327.031 637.054Z" fill="black"/><path fill-rule="evenodd" clip-rule="evenodd" d="M441.094 622.654C455.494 622.654 467.494 627.654 477.094 637.453C486.294 647.253 491.094 660.254 491.094 676.654C491.094 693.054 486.294 706.254 477.094 715.854C467.494 725.854 455.494 730.654 441.094 730.654C426.494 730.654 414.494 725.854 405.094 715.854C395.694 706.254 391.094 693.054 391.094 676.654C391.094 660.254 395.694 647.253 405.094 637.453C414.494 627.654 426.494 622.654 441.094 622.654ZM441.094 637.054C430.894 637.054 422.894 640.654 416.894 647.453C410.894 654.453 407.894 664.254 407.894 676.654C407.894 689.054 410.894 698.854 416.894 705.654C422.894 712.854 430.894 716.254 441.094 716.254C451.094 716.254 459.294 712.854 465.294 705.654C471.294 698.854 474.294 689.054 474.294 676.654C474.294 664.254 471.294 654.453 465.294 647.453C459.294 640.654 451.094 637.054 441.094 637.054Z" fill="black"/><path fill-rule="evenodd" clip-rule="evenodd" d="M603.756 728.254H588.557V712.254C580.157 724.654 568.356 730.654 553.156 730.654C538.556 730.654 526.956 725.854 518.356 715.854C509.556 706.054 505.156 693.054 505.156 676.654C505.156 660.254 509.557 647.054 518.356 637.254C526.756 627.654 538.356 622.654 553.156 622.654C567.956 622.654 579.356 628.454 587.756 639.854V585.854H603.756V728.254ZM555.156 637.054C545.156 637.054 536.956 640.854 530.956 648.054C524.956 655.254 521.956 665.054 521.956 677.453C521.956 689.853 524.956 699.254 530.956 706.054C536.956 712.854 544.956 716.254 555.156 716.254C565.156 716.254 573.356 712.854 579.356 705.654C585.356 698.854 588.356 689.054 588.356 676.654C588.356 664.454 585.356 654.854 579.356 647.654C573.356 640.654 565.156 637.054 555.156 637.054Z" fill="black"/><path d="M108.6 622.654C119.799 622.654 128.4 626.054 134.6 632.453C140.8 638.853 144 647.454 144 658.254V728.254H128V659.854C128 644.654 120.8 637.054 106.4 637.054C98.8004 637.054 92.4004 640.254 87.4004 646.254C82.4004 652.254 80 660.854 80 671.854V728.254H64V659.854C64 644.654 56.8001 637.054 42.4004 637.054C34.8004 637.054 28.5996 640.254 23.5996 646.254C18.3999 652.254 16 660.854 16 671.854V728.254H0V625.054H15.2002V640.254C22.0002 628.654 31.8 622.654 45 622.654C60.4 622.654 70.9998 629.254 76.7998 642.054C83.9997 629.254 94.5998 622.654 108.6 622.654Z" fill="black"/><path d="M644.935 728.254H624.734V708.254H644.935V728.254Z" fill="black"/><path d="M643.334 625.054L639.734 691.054H629.334L626.534 625.054V585.854H643.334V625.054Z" fill="black"/><path fill-rule="evenodd" clip-rule="evenodd" d="M554.749 11.9447C581.383 -13.9048 626 4.96764 626 42.0833V389.317C626 458.246 543.141 493.296 493.677 445.289L436.814 390.102L394.679 479.823C366.88 539.014 282.961 539.777 254.09 481.102L208.949 389.361L151.323 445.289C101.859 493.296 19 458.246 19 389.317V42.0833C19.0003 4.96764 63.6166 -13.9048 90.251 11.9447L322.5 237.35L554.749 11.9447ZM231.578 367.399L281.008 467.857C298.774 503.965 350.418 503.496 367.524 467.071L414.047 368.006L322.5 279.157L231.578 367.399ZM49 389.317C49 431.735 99.9904 453.304 130.43 423.762L195.027 361.067L49 64.2864V389.317ZM450.301 361.386L514.57 423.762C545.01 453.304 596 431.735 596 389.317V51.1478L450.301 361.386ZM344.038 258.253L427.533 339.289L567.4 41.47L344.038 258.253ZM217.656 339.104L300.961 258.253L69.3574 33.472C68.3677 32.5115 67.2902 31.7688 66.166 31.2239L217.656 339.104Z" fill="black"/></svg>`;
const LOGO_WHITE = LOGO_BLACK.replace(/fill="black"/g, 'fill="white"');

function e(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function scenarioLabel(scenario) {
    const map = {
        'A': 'A — Brand-Free (agency full authority)',
        'B': 'B — Figma Fidelity (client has Figma tokens)',
        'C': 'C — Component-Locked (client has component library)',
        'D': 'D — Figma + Components'
    };
    return map[scenario] || scenario;
}

// --- RENDERER ---
function renderProposal(d, opts = {}) {
    const previewMode = opts.previewMode === true;
    const clientName = e(d.clientName);
    const proposalType = e(d.proposalType || 'Brand & Website Proposal');
    const proposalDate = e(d.proposalDate || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
    const visionParas = (d.visionParagraphs || []).map(p => `<p>${e(p)}</p>`).join('');
    const visionNote = d.visionNote ? `<p class="slide-footer-note">${e(d.visionNote)}</p>` : '';
    const diagnosisItems = (d.diagnosisItems || []).map(item => `<div class="diagnosis-item"><div class="diagnosis-content"><strong>${e(item.title)}</strong><span>${e(item.body)}</span></div></div>`).join('');
    const roadmapPhases = (d.roadmapPhases || []).map((phase, i) => {
        const steps = (phase.steps || []).map((s, si) => si < phase.steps.length - 1 ? `<span>${e(s)}</span><span class="sep">→</span>` : `<span>${e(s)}</span>`).join('');
        return `<div class="roadmap-v2__item"><div class="roadmap-v2__number">${String(i + 1).padStart(2, '0')}</div><div class="roadmap-v2__content"><h3 class="roadmap-v2__title">${e(phase.title)} <span class="roadmap-v2__meta">${e(phase.meta)}</span></h3><div class="roadmap-v2__steps">${steps}</div></div></div>`;
    }).join('');
    const platformBlock = d.platformComparison?.show ? `<div class="platform-shift u-mt-32"><div class="platform-card platform-card--current"><div class="platform-card__label">Current Tech Stack</div><h4 class="platform-card__name">${e(d.platformComparison.current.name)}</h4><ul class="platform-card__specs">${(d.platformComparison.current.specs || []).map(([k, v]) => `<li><span>${e(k)}</span><span>${e(v)}</span></li>`).join('')}</ul></div><div class="platform-card platform-card--proposed"><div class="platform-card__label">Proposed Efficiency</div><h4 class="platform-card__name">${e(d.platformComparison.proposed.name)}</h4><ul class="platform-card__specs">${(d.platformComparison.proposed.specs || []).map(([k, v]) => `<li><span>${e(k)}</span><span>${e(v)}</span></li>`).join('')}</ul></div></div>${d.platformComparison.note ? `<p class="compare-note">${e(d.platformComparison.note)}</p>` : ''}` : '';
    const pages = (d.pages || []);
    const pagesList = pages.map(p => `<li>${e(typeof p === 'object' ? p.name : p)}</li>`).join('');
    const additionalDeliverables = (d.additionalDeliverables || []).map(item => `<li>${e(item)}</li>`).join('');
    const brandingPhase = d.brandingDeliverables?.length ? `<div class="deliverable-section"><div class="deliverable-section-title">Phase 1 — Brand Identity</div><div class="deliverable-list">${(d.brandingDeliverables || []).map(item => `<div class="deliverable-item"><div class="deliverable-bullet"></div><div class="deliverable-text"><strong>${e(item.title)}</strong><span>${e(item.description)}</span></div></div>`).join('')}</div></div><div class="pdf-section-break">${LOGO_WHITE}</div>` : '';
    const investmentRows = (d.investmentRows || []).map(row => `<tr${row.border ? ' class="u-border-black"' : ''}><td>${e(row.label)}</td><td>${e(row.amount)}</td></tr>`).join('');
    const optionalRows = (d.investmentOptionals || []).map(row => `<tr class="optional"><td>${e(row.label)}</td><td>${e(row.amount)}</td></tr>`).join('');
    const indexItems = ['The Vision', 'The Diagnosis', 'The Roadmap', 'The Deliverables', 'Investment & Next Steps'].map((label, i) => `<li class="index-item${i === 0 ? ' active' : ''}" data-slide="${i}"><span class="index-number">${String(i + 1).padStart(2, '0')}</span> ${label}</li>`).join('');
    const approvalPayload = JSON.stringify({ clientName: d.clientName, clientEmail: d.clientEmail || '', leadName: d.leadName || '', projectName: d.projectName, projectType: d.projectType || 'website', tier: d.tier || 'medium', pages: d.pages || [], hasNarrative: d.hasNarrative || false, hasBrandkit: d.hasBrandkit || false, scenario: d.scenario || 'A', status: 'Approved' });

    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${clientName} — ${proposalType} | Moood.Studio</title><link rel="icon" type="image/png" href="/favicon.png"><style>:root{--sidebar-width:20%;--transition-speed:0.7s;--font-main:'Helvetica Neue',Helvetica,Arial,sans-serif;--color-black:#000000;--color-white:#ffffff;--color-gray-soft:#fafafa;--color-gray-border:rgba(0,0,0,0.06);--color-gray-text:#666;--color-gray-muted:rgba(0,0,0,0.3)} *{box-sizing:border-box;margin:0;padding:0} body{height:100vh;overflow:hidden;background:var(--color-white);display:flex;flex-direction:row;font-family:var(--font-main);font-size:16px} .q-layout{display:flex;width:100%;height:100vh} .q-sidebar{width:var(--sidebar-width);background:var(--color-black);color:var(--color-white);padding:64px 52px;display:flex;flex-direction:column;justify-content:space-between;align-items:flex-start;position:relative;z-index:100;flex-shrink:0} .logo-img{height:60px;width:auto;display:block;margin-left:0} .q-h1{font-size:12px;font-weight:400;letter-spacing:0;color:rgba(255,255,255,0.35);margin-bottom:16px;text-transform:uppercase} .client-name{font-size:clamp(28px,3vw,48px);font-weight:300;line-height:1.1;letter-spacing:0;color:var(--color-white);margin:0 0 56px 0} .proposal-index{list-style:none} .index-item{font-size:18px;font-weight:600;padding:15px 0;border-bottom:1px solid rgba(255,255,255,0.08);color:rgba(255,255,255,0.35);cursor:pointer;transition:color 0.25s ease;display:flex;align-items:center;gap:16px;user-select:none} .index-item.active{color:var(--color-white)} .index-item:hover{color:rgba(255,255,255,0.75)} .index-number{font-size:14px;opacity:0.4;font-weight:700;letter-spacing:0;min-width:20px} .q-sidebar-footer{font-size:12px;color:rgba(255,255,255,0.2);letter-spacing:0;text-transform:uppercase} .q-main{flex:1;background:var(--color-white);display:flex;flex-direction:column;overflow:hidden} .proposal-header{width:100%;height:88px;padding:0 72px;display:flex;justify-content:flex-end;align-items:center;gap:12px;background:var(--color-white);border-bottom:1px solid rgba(0,0,0,0.06);flex-shrink:0} .btn-proposal{padding:18px 36px;font-size:12px;font-weight:700;letter-spacing:0;text-transform:uppercase;border-radius:0;cursor:pointer;transition:all 0.25s ease;min-width:200px;display:flex;justify-content:space-between;align-items:center;gap:12px} .btn-approve{background:var(--color-black);color:var(--color-white);border:none} .btn-approve:hover{background:#222} .btn-download{background:var(--color-white);color:var(--color-black);border:1.5px solid rgba(0,0,0,0.12);text-decoration:none} .btn-download:hover{border-color:var(--color-black)} .q-slider-viewport{flex:1;position:relative;width:100%;overflow:hidden} .q-slide{position:absolute;top:0;left:0;width:100%;height:100%;padding:80px 72px;opacity:0;visibility:hidden;transition:opacity var(--transition-speed) cubic-bezier(0.16,1,0.3,1),visibility var(--transition-speed) ease;overflow-y:auto} .q-slide-container{max-width:800px;margin:0 auto;width:100%} .q-slide.active{opacity:1;visibility:visible;z-index:2} .slide-eyebrow{font-size:12px;font-weight:700;letter-spacing:0;text-transform:uppercase;color:var(--color-gray-muted);margin-bottom:20px} .slide-title{font-size:clamp(32px,3.5vw,52px);font-weight:300;line-height:1.1;letter-spacing:0;color:var(--color-black);margin-bottom:40px} .slide-body{font-size:18px;color:#555;line-height:1.7;max-width:600px} .slide-body p+p{margin-top:20px} .slide-footer-note{margin-top:32px;padding-top:32px;border-top:1px solid var(--color-gray-border);font-size:14px;color:var(--color-black);font-weight:400;line-height:1.6} .diagnosis-item{display:flex;gap:24px;padding:28px;border-left:3px solid var(--color-black);background:var(--color-gray-soft)} .diagnosis-content strong{font-size:18px;color:var(--color-black);display:block;margin-bottom:6px} .diagnosis-content span{font-size:14px;color:var(--color-gray-text);line-height:1.6} .roadmap-v2{position:relative;padding-left:48px;margin-top:24px} .roadmap-v2::before{content:'';position:absolute;left:8px;top:0;bottom:0;width:1px;background:var(--color-gray-border)} .roadmap-v2__item{position:relative;margin-bottom:48px} .roadmap-v2__number{position:absolute;left:-48px;top:0;width:24px;height:24px;background:var(--color-black);color:var(--color-white);font-size:14px;font-weight:700;display:flex;align-items:center;justify-content:center;z-index:2} .roadmap-v2__meta{font-size:16px;font-weight:400;color:var(--color-gray-muted)} .roadmap-v2__title{font-size:20px;font-weight:700;color:var(--color-black);margin-bottom:12px} .roadmap-v2__steps{font-size:14px;color:var(--color-gray-text);display:flex;align-items:center;gap:10px;flex-wrap:wrap} .platform-shift{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--color-gray-border);border:1px solid var(--color-gray-border)} .platform-card{background:var(--color-white);padding:32px;position:relative} .platform-card__label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--color-gray-muted);margin-bottom:16px} .platform-card__name{font-size:20px;font-weight:700;margin-bottom:24px} .platform-card__specs{list-style:none;display:flex;flex-direction:column;gap:12px} .platform-card__specs li{display:flex;justify-content:space-between;font-size:14px;padding-bottom:8px;border-bottom:1px solid rgba(0,0,0,0.05)} .platform-card__specs li span:last-child{font-weight:700;color:var(--color-black)} .deliverable-section{margin-bottom:100px} .deliverable-section-title{font-size:14px;font-weight:700;letter-spacing:0;text-transform:uppercase;color:rgba(0,0,0,0.35);margin-bottom:16px;padding-bottom:10px;border-bottom:1px solid rgba(0,0,0,0.08)} .deliverable-list{display:flex;flex-direction:column;gap:14px} .deliverable-item{display:flex;gap:16px;align-items:flex-start} .deliverable-bullet{width:6px;height:6px;background:var(--color-black);border-radius:50%;margin-top:7px;flex-shrink:0} .deliverable-text strong{font-size:18px;color:var(--color-black);font-weight:700;display:block;margin-bottom:3px} .deliverable-text span{font-size:14px;color:#777;line-height:1.5} .investment-table{width:100%;border-collapse:collapse;margin-bottom:20px;border-top:1px solid var(--color-gray-border)} .investment-table tr{border-bottom:2px solid var(--color-gray-border)} .investment-table td{padding:18px 0;font-size:18px;color:#444} .investment-table td:last-child{text-align:right;font-weight:700;color:var(--color-black)} .investment-table .total-row td{border-top:2px solid var(--color-black)} .investment-table .u-border-black{border-bottom:2px solid var(--color-black)} .investment-table .optional td{color:#999;font-size:14px} .investment-block{margin-bottom:80px} .investment-section-title{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:var(--color-black);margin:48px 0 20px 0;padding-bottom:12px;border-bottom:2px solid var(--color-black)} .next-steps-list{list-style:none;display:flex;flex-direction:column;gap:16px;margin-top:30px} .next-steps-list li{display:flex;gap:16px;font-size:18px;color:#444;line-height:1.5} .next-steps-list li::before{content:"→";font-weight:700;color:var(--color-black)} .q-nav{padding:28px 72px;display:flex;justify-content:space-between;align-items:center;background:var(--color-white);border-top:1px solid var(--color-gray-border);flex-shrink:0} .btn-nav{background:var(--color-white);color:var(--color-black);border:1.5px solid rgba(0,0,0,0.12);padding:18px 36px;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;border-radius:0;cursor:pointer;transition:all 0.25s ease;min-width:180px;display:flex;justify-content:space-between;align-items:center;gap:12px} .btn-nav:hover{background:#f5f5f5;border-color:var(--color-black)} .btn-nav:disabled{opacity:0;pointer-events:none} .investment-note{font-size:14px;color:#aaa;margin-top:28px} .u-mt-32{margin-top:32px!important} @media print{ .q-layout{display:block!important;height:auto!important} .proposal-header,.q-nav,.q-sidebar{display:none!important} .q-main{width:100%!important;height:auto!important;overflow:visible!important;display:block!important} .q-slider-viewport{height:auto!important;overflow:visible!important;position:static!important;display:block!important} .q-slide{position:relative!important;width:100%!important;height:auto!important;min-height:297mm!important;opacity:1!important;visibility:visible!important;display:flex!important;flex-direction:column!important;break-after:page!important;padding:48px 72px 56px!important} .q-slide:last-child{break-after:auto!important} .q-slide-container{max-width:100%!important} } @page{size:A4;margin:0}</style></head><body>
<div id="approvedOverlay" style="position:fixed;inset:0;background:#fff;z-index:9999;display:none;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:80px 40px;font-family:var(--font-main)"><svg width="64" height="64" viewBox="0 0 64 64" fill="none" style="margin-bottom:40px"><circle cx="32" cy="32" r="31" stroke="#000" stroke-width="1.5"/><path d="M20 32l9 9 15-15" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><p style="font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#bbb;margin-bottom:20px">Project approved</p><h1 style="font-size:clamp(36px,5vw,64px);font-weight:300;letter-spacing:-0.02em;line-height:1.1;color:#000;margin-bottom:32px">${clientName}.</h1><p style="font-size:18px;color:#666;max-width:480px;line-height:1.7;margin-bottom:16px">Your project is confirmed. We're sending you an email with your project code and a link to complete your brief.</p></div>
<div class="q-layout"><aside class="q-sidebar">${LOGO_WHITE}<div class="q-sidebar-content" style="flex:1;display:flex;flex-direction:column;justify-content:center"><p class="q-h1">${proposalType}</p><h2 class="client-name">${clientName}</h2><ul class="proposal-index" id="proposalIndex">${indexItems}</ul></div><div class="q-sidebar-footer">Moood.Studio — Strategic Creative Agency</div></aside><main class="q-main"><header class="proposal-header">${previewMode ? `<span style="font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:rgba(0,0,0,0.3);margin-right:auto">Agency Preview</span><button class="btn-proposal btn-download" onclick="window.close()"><span>Edit Proposal</span></button><button class="btn-proposal btn-approve" id="btnApproveTop" onclick="sendProposal(this)"><span>Send to Client</span></button>` : `<button class="btn-proposal btn-download" onclick="window.print()"><span>Download PDF</span></button><button class="btn-proposal btn-approve" id="btnApproveTop" onclick="approveProposal(this)"><span>Approve Project</span></button>`}</header><div class="q-slider-viewport" id="sliderViewport">
<div class="q-slide active"><div class="q-slide-container"><p class="slide-eyebrow">The Vision</p><h2 class="slide-title">The Vision</h2><div class="slide-body">${visionParas}${visionNote}</div></div></div>
<div class="q-slide"><div class="q-slide-container"><p class="slide-eyebrow">The Problem</p><h2 class="slide-title">The Diagnosis</h2><div class="diagnosis-list">${diagnosisItems}</div></div></div>
<div class="q-slide"><div class="q-slide-container"><p class="slide-eyebrow">Process & Platform</p><h2 class="slide-title">The Roadmap</h2><div class="roadmap-v2">${roadmapPhases}</div>${platformBlock}</div></div>
<div class="q-slide"><div class="q-slide-container"><p class="slide-eyebrow">What You Receive</p><h2 class="slide-title">The Deliverables</h2>${brandingPhase}<div class="deliverable-section"><div class="deliverable-section-title">Website — ${pages.length} pages</div><div class="card-grid"><div class="card"><div class="card-number">Pages included</div><div class="card-body"><ul>${pagesList}</ul></div></div></div></div></div></div>
<div class="q-slide"><div class="q-slide-container"><p class="slide-eyebrow">Investment &amp; Next Steps</p><div class="investment-block"><h2 class="slide-title">Commitment</h2><table class="investment-table">${investmentRows}<tr class="total-row"><td>Total</td><td>${e(d.investmentTotal)}</td></tr></table></div><div class="investment-block"><h2 class="slide-title">Next Steps</h2><ul class="next-steps-list"><li>Approve this proposal</li><li>Receive intake form</li><li>Work begins</li></ul></div></div></div>
</div><nav class="q-nav"><button class="btn-nav" id="btnPrev" disabled><span>Back</span></button><span id="slideCounter" style="font-size:12px;color:var(--color-gray-muted);letter-spacing:0">01 / 05</span><button class="btn-nav" id="btnNext"><span>Next Chapter</span></button></nav></main></div>
<script>
const slides = document.querySelectorAll('.q-slide'); const navItems = document.querySelectorAll('.index-item'); const btnPrev = document.getElementById('btnPrev'); const btnNext = document.getElementById('btnNext'); const slideCounter = document.getElementById('slideCounter'); let current = 0; const PREVIEW_MODE = ${previewMode};
function goTo(n) { slides[current].classList.remove('active'); navItems[current].classList.remove('active'); current = n; slides[current].classList.add('active'); navItems[current].classList.add('active'); btnPrev.disabled = current === 0; btnNext.querySelector('span').textContent = current === slides.length - 1 ? (PREVIEW_MODE ? 'Send to Client' : 'Approve Project') : 'Next Chapter'; slideCounter.textContent = String(current + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0'); }
btnPrev.addEventListener('click', () => { if (current > 0) goTo(current - 1); });
btnNext.addEventListener('click', () => { if (current < slides.length - 1) goTo(current + 1); else PREVIEW_MODE ? sendProposal(document.getElementById('btnApproveTop')) : approveProposal(document.getElementById('btnApproveTop')); });
navItems.forEach(item => item.addEventListener('click', () => goTo(parseInt(item.dataset.slide))));
const APPROVAL_PAYLOAD = ${approvalPayload};
async function approveProposal(btn) { if (btn.disabled) return; btn.disabled = true; await fetch('/api/proposal?mode=approve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(APPROVAL_PAYLOAD) }); document.getElementById('approvedOverlay').style.display = 'flex'; }
async function sendProposal(btn) { if (btn.disabled) return; btn.disabled = true; await fetch('/api/proposal?mode=send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: "${d.id}" }) }); btn.innerHTML = "<span>✓ SENT TO CLIENT</span>"; setTimeout(() => window.close(), 1500); }
</script></body></html>`;
}

// --- CONTROLLER ---
module.exports = async (req, res) => {
    const redis = Redis.fromEnv();
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    const modeFromQuery = req.query.mode;
    const modeFromBody = req.body && req.body.mode;
    const mode = modeFromQuery || modeFromBody;
    const { id } = req.query;

    try {
        // GET / VIEW Proposal
        if (req.method === 'GET' && id) {
            if (!/^PROP-\d{4}-\d{4}$/.test(String(id).trim())) return res.status(400).send('Invalid ID');
            const data = await redis.get(`proposals/${id}`);
            if (!data) return res.status(404).send('Not found');
            
            const isAdmin = req.query.admin === 'true';
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            return res.status(200).send(renderProposal(data, { previewMode: isAdmin }));
        }

        // POST / ACTIONS
        if (req.method === 'POST') {
            const data = req.body;

            // 1. GENERATE / CREATE (Saves draft, returns admin URL)
            if (mode === 'generate') {
                const propId = `PROP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
                const proposal = { ...data, id: propId, status: 'draft', createdAt: new Date().toISOString() };
                await redis.set(`proposals/${propId}`, proposal);
                const url = `https://moood.studio/p/${propId}`;
                const adminUrl = `${url}?admin=true`;
                return res.status(200).json({ success: true, id: propId, url, adminUrl });
            }

            // NEW: SEND (Actually sends email to client)
            if (mode === 'send') {
                const { id: propId } = data;
                const proposal = await redis.get(`proposals/${propId}`);
                if (!proposal) return res.status(404).json({ error: 'Proposal not found' });

                const url = `https://moood.studio/p/${propId}`;
                if (proposal.clientEmail && proposal.clientEmail !== 'Not Provided') {
                    await resend.emails.send({
                        from: 'Alberto at Moood.Studio <alberto@moood.studio>',
                        to: [proposal.clientEmail],
                        subject: `Your proposal is ready — ${proposal.projectName}`,
                        html: buildEmail({
                            projectName: proposal.projectName,
                            context: 'Proposal Review',
                            headline: `Your proposal<br>is ready.`,
                            body: [`We've put together the full proposal for <strong style="color:#000;">${proposal.projectName}</strong>.`],
                            cta: { href: url, label: 'Review proposal →' },
                            linkFallback: url,
                        }),
                    });
                }
                
                await redis.set(`proposals/${propId}`, { ...proposal, status: 'sent', sentAt: new Date().toISOString() });
                return res.status(200).json({ success: true });
            }

            // 2. APPROVE (from approve.js)
            if (mode === 'approve') {
                const code = `MSD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
                await redis.set(`codes/${code}`, { ...data, code, createdAt: new Date().toISOString() });
                
                // Notify Alberto
                await resend.emails.send({
                    from: 'Moood Studio <notifications@moood.studio>',
                    to: ['alberto.contreras@gmail.com'],
                    subject: `Project ${data.projectName} approved`,
                    html: buildEmail({
                        projectName: data.projectName,
                        context: 'Proposal Approved',
                        headline: `${data.projectName}<br>is confirmed.`,
                        body: `Proposal approved by ${data.clientName}. Project Code: ${code}`,
                        signature: false,
                    }),
                });

                // Notify Client
                if (data.clientEmail) {
                    const shortCode = code.split('-').pop();
                    await resend.emails.send({
                        from: 'Alberto at Moood.Studio <alberto@moood.studio>',
                        to: [data.clientEmail],
                        subject: `Project Confirmed — ${data.projectName}`,
                        html: buildEmail({
                            projectName: data.projectName,
                            context: 'Project Confirmed',
                            headline: `Let's get<br>started.`,
                            body: [
                                `Your project <strong style="color:#000;">${data.projectName}</strong> is confirmed.`,
                                `Your project code is: <strong style="color:#000; font-size:24px; letter-spacing:2px; display:block; margin:20px 0;">${shortCode}</strong>`,
                                `Please use this code to complete your technical brief and begin the strategic alignment phase.`
                            ],
                            cta: { href: `https://moood.studio/client-intake?code=${shortCode}`, label: 'Complete your brief →' },
                        }),
                    });
                }
                return res.status(200).json({ success: true, code });
            }

            // 3. EXTRACT (AI Magic Intake)
            if (mode === 'extract') {
                const { transcript } = data;
                const apiKey = process.env.GOOGLE_AI_STUDIO_KEY || process.env.GEMINI_API_KEY;
                const prompt = `
                    You are a strategic analyst at Moood.Studio. Analyze the meeting transcript and extract proposal data into a strictly structured JSON format.
                    
                    RULES:
                    1. Return ONLY valid JSON. No markdown fences, no explanation.
                    2. Mapping for projectType: "website", "landing", "blog", "pillar", "social", "comms", "branding", "figma", "migration".
                    3. Mapping for projectTier: "small", "medium", "large".
                    4. Mapping for projectScenario: "A", "B", "C", "D".
                    5. Vision should be a concise summary of the core ambition.
                    
                    SCHEMA:
                    {
                      "clientName": "...",
                      "projectName": "...",
                      "projectType": "...",
                      "projectTier": "...",
                      "projectScenario": "...",
                      "vision": "...",
                      "pages": [{ "name": "...", "type": "homepage|product|about|contact|etc" }],
                      "diagnosis": [{ "title": "...", "body": "..." }],
                      "roadmap": [{ "title": "...", "meta": "...", "steps": ["...", "..."] }],
                      "investment": [{ "label": "...", "amount": "..." }]
                    }

                    TRANSCRIPT:
                    ${transcript}
                `;

                const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
                const aiRes = await fetch(GEMINI_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.1 } })
                });
                
                const aiData = await aiRes.json();
                if (aiData.error) throw new Error(aiData.error.message || 'AI Error');
                
                const text = aiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (!jsonMatch) throw new Error('AI failed to return valid JSON');
                return res.status(200).json(JSON.parse(jsonMatch[0]));
            }

            // 4. PREVIEW (from preview-proposal.js)
            if (mode === 'preview') {
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                return res.status(200).send(renderProposal(data, { previewMode: true }));
            }
        }

        return res.status(400).json({ error: 'Invalid request' });

    } catch (err) {
        console.error('Proposal Controller Error:', err);
        return res.status(500).json({ 
            error: 'Server Error', 
            message: err.message, 
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
        });
    }
};
