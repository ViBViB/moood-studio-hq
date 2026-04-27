const { list } = require('@vercel/blob');

const LOGO_BLACK = `<svg width="60" height="60" viewBox="0 0 645 731" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M212.969 622.654C227.369 622.654 239.369 627.654 248.969 637.453C258.169 647.253 262.969 660.254 262.969 676.654C262.969 693.054 258.169 706.254 248.969 715.854C239.369 725.854 227.369 730.654 212.969 730.654C198.369 730.654 186.369 725.854 176.969 715.854C167.569 706.254 162.969 693.054 162.969 676.654C162.969 660.254 167.569 647.253 176.969 637.453C186.369 627.654 198.369 622.654 212.969 622.654ZM212.969 637.054C202.769 637.054 194.769 640.654 188.769 647.453C182.769 654.453 179.769 664.254 179.769 676.654C179.769 689.053 182.769 698.854 188.769 705.654C194.769 712.854 202.769 716.254 212.969 716.254C222.969 716.254 231.169 712.854 237.169 705.654C243.169 698.854 246.169 689.053 246.169 676.654C246.169 664.254 243.169 654.453 237.169 647.453C231.169 640.654 222.969 637.054 212.969 637.054Z" fill="black"/><path fill-rule="evenodd" clip-rule="evenodd" d="M327.031 622.654C341.431 622.654 353.431 627.654 363.031 637.453C372.231 647.253 377.031 660.254 377.031 676.654C377.031 693.054 372.231 706.254 363.031 715.854C353.431 725.854 341.431 730.654 327.031 730.654C312.431 730.654 300.431 725.854 291.031 715.854C281.631 706.254 277.031 693.054 277.031 676.654C277.031 660.254 281.631 647.253 291.031 637.453C300.431 627.654 312.431 622.654 327.031 622.654ZM327.031 637.054C316.831 637.054 308.831 640.654 302.831 647.453C296.831 654.453 293.831 664.254 293.831 676.654C293.831 689.054 296.831 698.854 302.831 705.654C308.831 712.854 316.831 716.254 327.031 716.254C337.031 716.254 345.231 712.854 351.231 705.654C357.231 698.854 360.231 689.054 360.231 676.654C360.231 664.254 357.231 654.453 351.231 647.453C345.231 640.654 337.031 637.054 327.031 637.054Z" fill="black"/><path fill-rule="evenodd" clip-rule="evenodd" d="M441.094 622.654C455.494 622.654 467.494 627.654 477.094 637.453C486.294 647.253 491.094 660.254 491.094 676.654C491.094 693.054 486.294 706.254 477.094 715.854C467.494 725.854 455.494 730.654 441.094 730.654C426.494 730.654 414.494 725.854 405.094 715.854C395.694 706.254 391.094 693.054 391.094 676.654C391.094 660.254 395.694 647.253 405.094 637.453C414.494 627.654 426.494 622.654 441.094 622.654ZM441.094 637.054C430.894 637.054 422.894 640.654 416.894 647.453C410.894 654.453 407.894 664.254 407.894 676.654C407.894 689.054 410.894 698.854 416.894 705.654C422.894 712.854 430.894 716.254 441.094 716.254C451.094 716.254 459.294 712.854 465.294 705.654C471.294 698.854 474.294 689.054 474.294 676.654C474.294 664.254 471.294 654.453 465.294 647.453C459.294 640.654 451.094 637.054 441.094 637.054Z" fill="black"/><path fill-rule="evenodd" clip-rule="evenodd" d="M603.756 728.254H588.557V712.254C580.157 724.654 568.356 730.654 553.156 730.654C538.556 730.654 526.956 725.854 518.356 715.854C509.556 706.054 505.156 693.054 505.156 676.654C505.156 660.254 509.557 647.054 518.356 637.254C526.756 627.654 538.356 622.654 553.156 622.654C567.956 622.654 579.356 628.454 587.756 639.854V585.854H603.756V728.254ZM555.156 637.054C545.156 637.054 536.956 640.854 530.956 648.054C524.956 655.254 521.956 665.054 521.956 677.453C521.956 689.853 524.956 699.254 530.956 706.054C536.956 712.854 544.956 716.254 555.156 716.254C565.156 716.254 573.356 712.854 579.356 705.654C585.356 698.854 588.356 689.054 588.356 676.654C588.356 664.454 585.356 654.854 579.356 647.654C573.356 640.654 565.156 637.054 555.156 637.054Z" fill="black"/><path d="M108.6 622.654C119.799 622.654 128.4 626.054 134.6 632.453C140.8 638.853 144 647.454 144 658.254V728.254H128V659.854C128 644.654 120.8 637.054 106.4 637.054C98.8004 637.054 92.4004 640.254 87.4004 646.254C82.4004 652.254 80 660.854 80 671.854V728.254H64V659.854C64 644.654 56.8001 637.054 42.4004 637.054C34.8004 637.054 28.5996 640.254 23.5996 646.254C18.3999 652.254 16 660.854 16 671.854V728.254H0V625.054H15.2002V640.254C22.0002 628.654 31.8 622.654 45 622.654C60.4 622.654 70.9998 629.254 76.7998 642.054C83.9997 629.254 94.5998 622.654 108.6 622.654Z" fill="black"/><path d="M644.935 728.254H624.734V708.254H644.935V728.254Z" fill="black"/><path d="M643.334 625.054L639.734 691.054H629.334L626.534 625.054V585.854H643.334V625.054Z" fill="black"/><path fill-rule="evenodd" clip-rule="evenodd" d="M554.749 11.9447C581.383 -13.9048 626 4.96764 626 42.0833V389.317C626 458.246 543.141 493.296 493.677 445.289L436.814 390.102L394.679 479.823C366.88 539.014 282.961 539.777 254.09 481.102L208.949 389.361L151.323 445.289C101.859 493.296 19 458.246 19 389.317V42.0833C19.0003 4.96764 63.6166 -13.9048 90.251 11.9447L322.5 237.35L554.749 11.9447ZM231.578 367.399L281.008 467.857C298.774 503.965 350.418 503.496 367.524 467.071L414.047 368.006L322.5 279.157L231.578 367.399ZM49 389.317C49 431.735 99.9904 453.304 130.43 423.762L195.027 361.067L49 64.2864V389.317ZM450.301 361.386L514.57 423.762C545.01 453.304 596 431.735 596 389.317V51.1478L450.301 361.386ZM344.038 258.253L427.533 339.289L567.4 41.47L344.038 258.253ZM217.656 339.104L300.961 258.253L69.3574 33.472C68.3677 32.5115 67.2902 31.7688 66.166 31.2239L217.656 339.104Z" fill="black"/></svg>`;

const LOGO_WHITE = LOGO_BLACK.replace(/fill="black"/g, 'fill="white"');

function e(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function renderProposal(d) {
    const slideCount = 5;
    const clientName = e(d.clientName);
    const proposalType = e(d.proposalType || 'Brand & Website Proposal');
    const proposalDate = e(d.proposalDate || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));

    const visionParas = (d.visionParagraphs || []).map(p => `<p>${e(p)}</p>`).join('');
    const visionNote = d.visionNote ? `<p class="slide-footer-note">${e(d.visionNote)}</p>` : '';

    const diagnosisItems = (d.diagnosisItems || []).map(item => `
        <div class="diagnosis-item">
            <div class="diagnosis-content">
                <strong>${e(item.title)}</strong>
                <span>${e(item.body)}</span>
            </div>
        </div>`).join('');

    const roadmapPhases = (d.roadmapPhases || []).map((phase, i) => {
        const steps = (phase.steps || []).map((s, si) =>
            si < phase.steps.length - 1
                ? `<span>${e(s)}</span><span class="sep">→</span>`
                : `<span>${e(s)}</span>`
        ).join('');
        return `
        <div class="roadmap-v2__item">
            <div class="roadmap-v2__number">${String(i + 1).padStart(2, '0')}</div>
            <div class="roadmap-v2__content">
                <h3 class="roadmap-v2__title">${e(phase.title)} <span class="roadmap-v2__meta">${e(phase.meta)}</span></h3>
                <div class="roadmap-v2__steps">${steps}</div>
            </div>
        </div>`;
    }).join('');

    const platformBlock = d.platformComparison?.show ? `
        <div class="platform-shift u-mt-32">
            <div class="platform-card platform-card--current">
                <div class="platform-card__label">Current Tech Stack</div>
                <h4 class="platform-card__name">${e(d.platformComparison.current.name)}</h4>
                <ul class="platform-card__specs">
                    ${(d.platformComparison.current.specs || []).map(([k, v]) => `<li><span>${e(k)}</span><span>${e(v)}</span></li>`).join('')}
                </ul>
            </div>
            <div class="platform-card platform-card--proposed">
                <div class="platform-card__label">Proposed Efficiency</div>
                <h4 class="platform-card__name">${e(d.platformComparison.proposed.name)}</h4>
                <ul class="platform-card__specs">
                    ${(d.platformComparison.proposed.specs || []).map(([k, v]) => `<li><span>${e(k)}</span><span>${e(v)}</span></li>`).join('')}
                </ul>
            </div>
        </div>
        ${d.platformComparison.note ? `<p class="compare-note">${e(d.platformComparison.note)}</p>` : ''}` : '';

    const pages = (d.pages || []);
    const pagesList = pages.map(p => `<li>${e(typeof p === 'object' ? p.name : p)}</li>`).join('');
    const additionalDeliverables = (d.additionalDeliverables || []).map(item => `<li>${e(item)}</li>`).join('');

    const brandingPhase = d.brandingDeliverables?.length ? `
        <div class="deliverable-section">
            <div class="deliverable-section-title">Phase 1 — Brand Identity</div>
            <div class="deliverable-list">
                ${(d.brandingDeliverables || []).map(item => `
                <div class="deliverable-item">
                    <div class="deliverable-bullet"></div>
                    <div class="deliverable-text"><strong>${e(item.title)}</strong><span>${e(item.description)}</span></div>
                </div>`).join('')}
            </div>
        </div>
        <div class="pdf-section-break">${LOGO_WHITE}</div>` : '';

    const investmentRows = (d.investmentRows || []).map(row =>
        `<tr${row.border ? ' class="u-border-black"' : ''}>
            <td>${e(row.label)}</td>
            <td>${e(row.amount)}</td>
        </tr>`
    ).join('');

    const optionalRows = (d.investmentOptionals || []).map(row =>
        `<tr class="optional"><td>${e(row.label)}</td><td>${e(row.amount)}</td></tr>`
    ).join('');

    const indexItems = ['The Vision', 'The Diagnosis', 'The Roadmap', 'The Deliverables', 'Investment & Next Steps']
        .map((label, i) => `<li class="index-item${i === 0 ? ' active' : ''}" data-slide="${i}"><span class="index-number">${String(i + 1).padStart(2, '0')}</span> ${label}</li>`)
        .join('');

    const approvalPayload = JSON.stringify({
        clientName: d.clientName,
        clientEmail: d.clientEmail || '',
        projectName: d.projectName,
        projectType: d.projectType || 'website',
        tier: d.tier || 'medium',
        pages: d.pages || [],
        hasNarrative: d.hasNarrative || false,
        hasBrandkit: d.hasBrandkit || false,
        scenario: d.scenario || 'A',
        status: 'Approved'
    });

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${clientName} — ${proposalType} | Moood.Studio</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background:#fff;color:#111;overflow:hidden}
.q-layout{display:grid;grid-template-columns:280px 1fr;height:100vh;overflow:hidden}
.q-sidebar{background:#000;color:#fff;display:flex;flex-direction:column;padding:32px 24px;overflow-y:auto}
.q-sidebar-content{margin-top:32px;flex:1}
.q-h1{font-size:11px;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,.4);margin-bottom:8px}
.client-name{font-size:18px;font-weight:700;line-height:1.2;margin-bottom:32px;color:#fff}
.proposal-index{list-style:none}
.index-item{display:flex;align-items:center;gap:12px;padding:10px 0;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,.4);cursor:pointer;border-bottom:1px solid rgba(255,255,255,.08);transition:color .2s}
.index-item:last-child{border-bottom:none}
.index-item.active,.index-item:hover{color:#fff}
.index-number{font-size:10px;color:rgba(255,255,255,.25)}
.index-item.active .index-number{color:rgba(255,255,255,.5)}
.q-sidebar-footer{font-size:10px;color:rgba(255,255,255,.25);text-transform:uppercase;letter-spacing:1px;margin-top:32px}
.q-main{display:flex;flex-direction:column;overflow:hidden;background:#fff}
.proposal-header{display:flex;justify-content:flex-end;align-items:center;padding:16px 40px;border-bottom:1px solid #eee;flex-shrink:0}
.btn-proposal{display:inline-flex;align-items:center;gap:8px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1.5px;padding:8px 16px;cursor:pointer;border:none;text-decoration:none;transition:all .2s}
.btn-download{background:#fff;color:#111;border:1px solid #ddd}
.btn-download:hover{border-color:#111}
.btn-approve{background:#111;color:#fff}
.btn-approve:hover{background:#333}
.q-slider-viewport{flex:1;overflow:hidden;position:relative}
.q-slide{position:absolute;inset:0;overflow-y:auto;display:none;padding:48px 56px}
.q-slide.active{display:block}
.q-slide-container{max-width:720px}
.pdf-slide-header{margin-bottom:32px}
.pdf-slide-header svg,.pdf-slide-header img{width:40px;height:40px}
.slide-eyebrow{font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#999;margin-bottom:8px}
.slide-title{font-size:36px;font-weight:700;line-height:1.1;margin-bottom:28px;letter-spacing:-0.5px}
.slide-body p{font-size:16px;line-height:1.7;color:#333;margin-bottom:16px}
.slide-body p:last-child{margin-bottom:0}
.slide-footer-note{font-size:13px!important;color:#999!important;border-top:1px solid #eee;padding-top:16px;margin-top:24px!important}
.diagnosis-list{display:flex;flex-direction:column;gap:0}
.diagnosis-item{padding:20px 0;border-bottom:1px solid #eee}
.diagnosis-item:first-child{border-top:1px solid #eee}
.diagnosis-content{display:flex;flex-direction:column;gap:6px}
.diagnosis-content strong{font-size:14px;font-weight:700;color:#111}
.diagnosis-content span{font-size:14px;line-height:1.6;color:#555}
.roadmap-v2{display:flex;flex-direction:column;gap:0}
.roadmap-v2__item{display:grid;grid-template-columns:48px 1fr;gap:20px;padding:20px 0;border-bottom:1px solid #eee}
.roadmap-v2__item:first-child{border-top:1px solid #eee}
.roadmap-v2__number{font-size:11px;font-weight:700;color:#999;padding-top:3px}
.roadmap-v2__title{font-size:14px;font-weight:700;margin-bottom:10px}
.roadmap-v2__meta{font-size:12px;font-weight:400;color:#999}
.roadmap-v2__steps{display:flex;flex-wrap:wrap;align-items:center;gap:6px;font-size:12px;color:#555}
.roadmap-v2__steps .sep{color:#bbb}
.platform-shift{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:24px}
.platform-card{padding:20px;border:1px solid #eee}
.platform-card--proposed{border-color:#000}
.platform-card__label{font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#999;margin-bottom:8px}
.platform-card__name{font-size:16px;font-weight:700;margin-bottom:12px}
.platform-card__specs{list-style:none;display:flex;flex-direction:column;gap:6px}
.platform-card__specs li{display:flex;justify-content:space-between;font-size:12px;color:#555;padding-bottom:6px;border-bottom:1px solid #f0f0f0}
.platform-card__specs li:last-child{border-bottom:none}
.compare-note{font-size:12px;color:#999;margin-top:12px;line-height:1.5}
.deliverable-section{margin-bottom:28px}
.deliverable-section-title{font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#999;margin-bottom:16px;padding-bottom:8px;border-bottom:1px solid #eee}
.deliverable-list{display:flex;flex-direction:column;gap:12px}
.deliverable-item{display:flex;gap:12px;align-items:flex-start}
.deliverable-bullet{width:6px;height:6px;background:#111;border-radius:50%;flex-shrink:0;margin-top:5px}
.deliverable-text strong{display:block;font-size:13px;font-weight:700;margin-bottom:2px}
.deliverable-text span{font-size:12px;color:#777;line-height:1.5}
.card-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.card{border:1px solid #eee;padding:20px}
.card-number{font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#999;margin-bottom:12px}
.card-body ul{list-style:none;display:flex;flex-direction:column;gap:6px}
.card-body ul li{font-size:13px;color:#333;padding-bottom:6px;border-bottom:1px solid #f5f5f5}
.card-body ul li:last-child{border-bottom:none}
.pdf-section-break{margin:24px 0;text-align:center}
.pdf-section-break svg{width:32px;height:32px;opacity:.15}
.investment-block{margin-bottom:32px}
.investment-table{width:100%;border-collapse:collapse;font-size:14px}
.investment-table td{padding:12px 0;border-bottom:1px solid #eee}
.investment-table td:last-child{text-align:right;font-weight:600;white-space:nowrap}
.investment-table tr.u-border-black td{border-bottom:2px solid #111}
.investment-table tr.total-row td{font-weight:700;font-size:16px;padding-top:14px}
.investment-table tr.optional td{color:#999;font-size:13px}
.next-steps-list{list-style:none;display:flex;flex-direction:column;gap:12px}
.next-steps-list li{font-size:14px;color:#333;line-height:1.5;padding-left:20px;position:relative}
.next-steps-list li::before{content:counter(li);counter-increment:li;position:absolute;left:0;font-weight:700;font-size:12px;color:#999}
.next-steps-list{counter-reset:li}
.investment-note{font-size:12px;color:#999;margin-top:8px}
.u-mt-32{margin-top:32px}
.q-nav{display:flex;justify-content:space-between;align-items:center;padding:16px 40px;border-top:1px solid #eee;flex-shrink:0}
.slide-counter{font-size:11px;color:#999;letter-spacing:1px}
.btn-nav{display:inline-flex;align-items:center;gap:8px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1.5px;padding:10px 20px;background:#fff;border:1px solid #ddd;cursor:pointer;transition:all .2s}
.btn-nav:hover:not(:disabled){border-color:#111;background:#111;color:#fff}
.btn-nav:disabled{opacity:.3;cursor:default}
@media(max-width:768px){
    .q-layout{grid-template-columns:1fr;grid-template-rows:auto 1fr}
    html,body{overflow:auto}
    .q-sidebar{padding:20px;flex-direction:row;align-items:center;flex-wrap:wrap;gap:16px}
    .q-sidebar-content{margin-top:0}
    .proposal-index{display:none}
    .q-slider-viewport{position:relative;height:auto;overflow:visible}
    .q-slide{position:static;display:none;padding:32px 24px}
    .q-slide.active{display:block}
    .q-main{overflow:visible}
}
</style>
</head>
<body>
<div class="q-layout">
    <aside class="q-sidebar">
        ${LOGO_WHITE}
        <div class="q-sidebar-content">
            <p class="q-h1">${proposalType}</p>
            <h2 class="client-name">${clientName}</h2>
            <ul class="proposal-index" id="proposalIndex">${indexItems}</ul>
        </div>
        <div class="q-sidebar-footer">Moood.Studio — Strategic Creative Agency</div>
    </aside>
    <main class="q-main">
        <header class="proposal-header">
            <button class="btn-proposal btn-approve" id="btnApproveTop" onclick="approveProposal(this)">Approve Project</button>
        </header>
        <div class="q-slider-viewport" id="sliderViewport">

            <!-- 01 — THE VISION -->
            <div class="q-slide active">
                <div class="q-slide-container">
                    <div class="pdf-slide-header">${LOGO_BLACK}</div>
                    <p class="slide-eyebrow">The Vision</p>
                    <h2 class="slide-title">The Vision</h2>
                    <div class="slide-body">
                        ${visionParas}
                        ${visionNote}
                    </div>
                </div>
            </div>

            <!-- 02 — THE DIAGNOSIS -->
            <div class="q-slide">
                <div class="q-slide-container">
                    <div class="pdf-slide-header">${LOGO_BLACK}</div>
                    <p class="slide-eyebrow">The Problem</p>
                    <h2 class="slide-title">The Diagnosis</h2>
                    <div class="diagnosis-list">${diagnosisItems}</div>
                </div>
            </div>

            <!-- 03 — THE ROADMAP -->
            <div class="q-slide">
                <div class="q-slide-container">
                    <div class="pdf-slide-header">${LOGO_BLACK}</div>
                    <p class="slide-eyebrow">Process & Platform</p>
                    <h2 class="slide-title">The Roadmap</h2>
                    <div class="roadmap-v2">${roadmapPhases}</div>
                    ${platformBlock}
                </div>
            </div>

            <!-- 04 — THE DELIVERABLES -->
            <div class="q-slide">
                <div class="q-slide-container">
                    <div class="pdf-slide-header">${LOGO_BLACK}</div>
                    <p class="slide-eyebrow">What You Receive</p>
                    <h2 class="slide-title">The Deliverables</h2>
                    ${brandingPhase}
                    <div class="deliverable-section">
                        <div class="deliverable-section-title">Website — ${pages.length} pages</div>
                        <div class="card-grid">
                            <div class="card">
                                <div class="card-number">Pages included</div>
                                <div class="card-body"><ul>${pagesList}</ul></div>
                            </div>
                            ${additionalDeliverables ? `<div class="card">
                                <div class="card-number">Tech & setup</div>
                                <div class="card-body"><ul>${additionalDeliverables}</ul></div>
                            </div>` : ''}
                        </div>
                    </div>
                </div>
            </div>

            <!-- 05 — INVESTMENT -->
            <div class="q-slide">
                <div class="q-slide-container">
                    <div class="pdf-slide-header">${LOGO_BLACK}</div>
                    <p class="slide-eyebrow">Investment & Next Steps</p>
                    <div class="investment-block">
                        <h2 class="slide-title">Commitment</h2>
                        <table class="investment-table">
                            ${investmentRows}
                            <tr class="total-row"><td>Total</td><td>${e(d.investmentTotal)}</td></tr>
                            ${optionalRows}
                        </table>
                    </div>
                    <div class="investment-block">
                        <h2 class="slide-title">Next Steps</h2>
                        <ul class="next-steps-list">
                            <li>Approve this proposal — button above or reply to this email</li>
                            <li>${e(d.nextStepTwo || 'We send a short intake form — references, competitors, and technical requirements')}</li>
                            <li>Work begins within 3 business days of intake completion</li>
                        </ul>
                    </div>
                    ${d.paymentNote ? `<p class="investment-note">${e(d.paymentNote)}</p>` : ''}
                    <p class="investment-note" style="margin-top:8px">Moood.Studio · ${proposalDate}</p>
                </div>
            </div>

        </div>
        <nav class="q-nav">
            <button class="btn-nav" id="btnPrev" disabled>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 12H6M6 12L11 7M6 12L11 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <span>Back</span>
            </button>
            <span class="slide-counter" id="slideCounter">01 / 05</span>
            <button class="btn-nav" id="btnNext">
                <span>Next Chapter</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 12H18M18 12L13 7M18 12L13 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
        </nav>
    </main>
</div>
<script>
const slides = document.querySelectorAll('.q-slide');
const indexItems = document.querySelectorAll('.index-item');
const btnPrev = document.getElementById('btnPrev');
const btnNext = document.getElementById('btnNext');
const slideCounter = document.getElementById('slideCounter');
let current = 0;

function goTo(n) {
    slides[current].classList.remove('active');
    indexItems[current].classList.remove('active');
    current = n;
    slides[current].classList.add('active');
    indexItems[current].classList.add('active');
    btnPrev.disabled = current === 0;
    btnNext.querySelector('span').textContent = current === slides.length - 1 ? 'Approve Project' : 'Next Chapter';
    slideCounter.textContent = String(current + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0');
    slides[current].scrollTop = 0;
}

btnPrev.addEventListener('click', () => { if (current > 0) goTo(current - 1); });
btnNext.addEventListener('click', () => { if (current < slides.length - 1) goTo(current + 1); else approveProposal(); });
indexItems.forEach(item => item.addEventListener('click', () => goTo(parseInt(item.dataset.slide))));

const APPROVAL_PAYLOAD = ${approvalPayload};

async function approveProposal(btnElement) {
    const btn = btnElement || document.getElementById('btnApproveTop');
    if (!btn) return;
    const originalText = btn.innerText;
    if (!confirm('Are you sure you want to approve this proposal? This will notify the Moood.Studio team.')) return;
    try {
        btn.innerText = 'Processing...';
        btn.disabled = true;
        const response = await fetch('/api/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(APPROVAL_PAYLOAD)
        });
        if (response.ok) {
            btn.innerText = 'PROJECT APPROVED ✓';
            btn.style.background = '#000';
        } else {
            throw new Error('Notification failed');
        }
    } catch (err) {
        btn.innerText = originalText;
        btn.disabled = false;
        alert('Something went wrong. Please try again or contact Alberto directly.');
    }
}
</script>
</body>
</html>`;
}

module.exports = async (req, res) => {
    const { id } = req.query;

    if (!id || !/^PROP-\d{4}-\d{4}$/.test(String(id).trim())) {
        return res.status(400).send('<h1>Invalid proposal ID</h1>');
    }

    try {
        const { blobs } = await list({ prefix: `proposals/${String(id).trim()}.json` });

        if (!blobs || blobs.length === 0) {
            return res.status(404).send('<h1>Proposal not found</h1>');
        }

        const response = await fetch(blobs[0].url);
        if (!response.ok) {
            return res.status(500).send('<h1>Failed to load proposal</h1>');
        }

        const data = await response.json();
        const html = renderProposal(data);

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).send(html);

    } catch (err) {
        console.error('Proposal render error:', err);
        return res.status(500).send('<h1>Internal server error</h1>');
    }
};
