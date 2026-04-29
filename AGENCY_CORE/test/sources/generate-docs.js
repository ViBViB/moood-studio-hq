const PDFDocument = require('pdfkit');
const JSZip = require('jszip');
const fs = require('fs');
const path = require('path');

const OUT = __dirname;

/* ── PDF: Competitive Analysis ───────────────────────────── */
function generatePDF() {
    const doc = new PDFDocument({ margin: 60, size: 'A4' });
    const out = fs.createWriteStream(path.join(OUT, 'competitive-analysis.pdf'));
    doc.pipe(out);

    const gray = '#555555';
    const black = '#111111';
    const light = '#999999';
    const rule = () => doc.moveTo(60, doc.y).lineTo(535, doc.y).strokeColor('#dddddd').lineWidth(0.5).stroke().moveDown(0.8);

    doc.font('Helvetica-Bold').fontSize(9).fillColor(light).text('SNØHETTA — COMPETITIVE LANDSCAPE ANALYSIS', { characterSpacing: 1.5 });
    doc.moveDown(0.4);
    doc.font('Helvetica').fontSize(9).fillColor(light).text('Prepared for Moood.Studio Strategic Intake · April 2026');
    doc.moveDown(1.5);

    doc.font('Helvetica-Bold').fontSize(22).fillColor(black).text('Competitive Landscape');
    doc.moveDown(0.3);
    doc.font('Helvetica').fontSize(13).fillColor(gray).text('Architecture & Design — Global Digital Presence Audit');
    doc.moveDown(1.5);
    rule();

    const competitors = [
        {
            name: 'BIG — Bjarke Ingels Group',
            url: 'big.dk',
            tone: 'High-energy, media-friendly, parametric. Strong storytelling via project videos and Bjarke as public persona.',
            strengths: ['Excellent video-first portfolio', 'Clear project narrative on each page', 'Strong social media presence', 'Bjarke as a recognized global brand'],
            weaknesses: ['Oversaturated with content — difficult to find depth', 'Feels commercial rather than cultural', 'Copy is promotional, not authoritative'],
            threat: 'High for media visibility. Low for institutional gravitas.',
        },
        {
            name: 'Zaha Hadid Architects',
            url: 'zaha-hadid.com',
            tone: 'Iconic, luxury, parametric. The brand is inseparable from Zaha Hadid\'s legacy — which is both a strength and a constraint.',
            strengths: ['Immediately distinctive visual language', 'Strong project imagery', 'Clear association with innovation and spectacle'],
            weaknesses: ['Post-Zaha brand is undefined', 'Site is portfolio-only — no editorial voice', 'Tone is cold and institutional'],
            threat: 'Moderate. Competes directly for high-profile commissions. Brand is weaker since 2016.',
        },
        {
            name: 'Adjaye Associates',
            url: 'adjaye.com',
            tone: 'Cultural, civic, rooted in place and materiality. Strong alignment with African diaspora institutions and global cultural commissions.',
            strengths: ['Clear mission and values on site', 'Strong civic and cultural positioning', 'Excellent project photography'],
            weaknesses: ['Site is slow and not mobile-optimized', 'Limited editorial content', 'Portfolio depth is modest compared to Snøhetta'],
            threat: 'Moderate. Competes for cultural commissions. Different geographic focus.',
        },
        {
            name: 'Studio Gang',
            url: 'studiogang.com',
            tone: 'Research-driven, sustainable, civic. Strong Midwest + North America positioning. Jeanne Gang as public intellectual.',
            strengths: ['Clear research-to-design narrative', 'Strong sustainability credentials', 'Good press coverage and publications'],
            weaknesses: ['Primarily North American — limited global brand', 'Site does not convey scale or ambition beyond portfolio'],
            threat: 'Low for global commissions. High for North American civic projects.',
        },
        {
            name: 'Gensler',
            url: 'gensler.com',
            tone: 'Corporate, data-driven, workplace-focused. Reports and research are primary content. Design is secondary.',
            strengths: ['Enormous project volume', 'Strong workplace and corporate brand', 'Annual Design Survey is industry-standard reference'],
            weaknesses: ['No artistic or cultural ambition on the site', 'Feels like a consulting firm', 'Brand is interchangeable with other large corporate firms'],
            threat: 'Low. Different market and client type entirely.',
        },
    ];

    competitors.forEach((c, i) => {
        if (i > 0) doc.moveDown(1);
        doc.font('Helvetica-Bold').fontSize(14).fillColor(black).text(`${String(i+1).padStart(2,'0')}. ${c.name}`);
        doc.font('Helvetica').fontSize(9).fillColor(light).text(c.url, { characterSpacing: 0.5 });
        doc.moveDown(0.6);
        doc.font('Helvetica-Oblique').fontSize(11).fillColor(gray).text(c.tone);
        doc.moveDown(0.6);

        doc.font('Helvetica-Bold').fontSize(9).fillColor(black).text('STRENGTHS', { characterSpacing: 1 });
        doc.moveDown(0.2);
        c.strengths.forEach(s => {
            doc.font('Helvetica').fontSize(10).fillColor(gray).text(`· ${s}`, { indent: 10 });
        });
        doc.moveDown(0.4);

        doc.font('Helvetica-Bold').fontSize(9).fillColor(black).text('WEAKNESSES', { characterSpacing: 1 });
        doc.moveDown(0.2);
        c.weaknesses.forEach(w => {
            doc.font('Helvetica').fontSize(10).fillColor(gray).text(`· ${w}`, { indent: 10 });
        });
        doc.moveDown(0.4);

        doc.font('Helvetica-Bold').fontSize(9).fillColor(black).text('COMPETITIVE THREAT', { characterSpacing: 1 });
        doc.moveDown(0.2);
        doc.font('Helvetica').fontSize(10).fillColor(gray).text(c.threat, { indent: 10 });
        doc.moveDown(0.8);
        rule();
    });

    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').fontSize(13).fillColor(black).text('Strategic Summary');
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(11).fillColor(gray).text(
        'Snøhetta\'s core competitive advantage is interdisciplinary depth combined with Scandinavian restraint. ' +
        'No direct competitor combines civic credibility, cultural gravitas, and genuine brand presence at the same level. ' +
        'The gap to close is not work quality — it is digital communication quality. ' +
        'The site must perform at the same level as the buildings.',
        { lineGap: 4 }
    );

    doc.end();
    out.on('finish', () => console.log('✓ competitive-analysis.pdf created'));
}

/* ── DOCX: Brand Direction Notes ─────────────────────────── */
async function generateDOCX() {
    const zip = new JSZip();

    const content = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<w:body>

<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr>
<w:r><w:t>Snøhetta — Brand Direction Notes</w:t></w:r></w:p>

<w:p><w:r><w:rPr><w:color w:val="888888"/><w:sz w:val="18"/></w:rPr>
<w:t>Prepared by Sofia Berg, Head of Communications · April 2026</w:t></w:r></w:p>

<w:p><w:r><w:t xml:space="preserve"> </w:t></w:r></w:p>

<w:p><w:pPr><w:pStyle w:val="Heading2"/></w:pPr>
<w:r><w:t>Visual Identity — Current State</w:t></w:r></w:p>

<w:p><w:r><w:t xml:space="preserve">The current Snøhetta visual identity is functional but not distinctive. The wordmark is clean and modern, but the broader system lacks the weight and intentionality we see in our built work. Key observations from the internal brand audit (Q1 2026):</w:t></w:r></w:p>
<w:p><w:r><w:t xml:space="preserve"> </w:t></w:r></w:p>

<w:p><w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">Typography: </w:t></w:r>
<w:r><w:t>Currently using a sans-serif stack (GT America / Helvetica Neue). The typeface is neutral and functional. For the new digital presence, we want typography that carries weight — something closer to the spatial confidence of our buildings. Candidates: Canela, Freight Display, or a custom condensed sans.</w:t></w:r></w:p>
<w:p><w:r><w:t xml:space="preserve"> </w:t></w:r></w:p>

<w:p><w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">Color: </w:t></w:r>
<w:r><w:t>No defined digital color system. Print materials default to black and white with warm off-white paper. The digital palette should feel material — raw, tactile, drawn from our buildings rather than from screen defaults. Reference: the internal travertine of the Oslo Opera House, the concrete of the 9/11 Pavilion, the water light of the Alexandria Library.</w:t></w:r></w:p>
<w:p><w:r><w:t xml:space="preserve"> </w:t></w:r></w:p>

<w:p><w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">Photography: </w:t></w:r>
<w:r><w:t>Our project photography is world-class (Iwan Baan, Ketil Jacobsen, Johan Fowelin). The website does not do it justice. Images are displayed too small, with aggressive cropping, and at low resolution. The new site must treat photography as primary — full-bleed, unhurried, with room to breathe.</w:t></w:r></w:p>
<w:p><w:r><w:t xml:space="preserve"> </w:t></w:r></w:p>

<w:p><w:pPr><w:pStyle w:val="Heading2"/></w:pPr>
<w:r><w:t>Tone of Voice</w:t></w:r></w:p>

<w:p><w:r><w:t>Snøhetta does not sell. We invite. The difference is fundamental and must be reflected in every line of copy on the site.</w:t></w:r></w:p>
<w:p><w:r><w:t xml:space="preserve"> </w:t></w:r></w:p>

<w:p><w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">Register: </w:t></w:r>
<w:r><w:t>Calm authority. The voice of a firm that has designed opera houses and national memorials — not the voice of a firm pitching for its first commission.</w:t></w:r></w:p>
<w:p><w:r><w:t xml:space="preserve"> </w:t></w:r></w:p>

<w:p><w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">Sentence structure: </w:t></w:r>
<w:r><w:t>Long enough to carry weight. Short enough to land. No bullet points in the main narrative sections — the copy should read like a considered statement, not a slide deck.</w:t></w:r></w:p>
<w:p><w:r><w:t xml:space="preserve"> </w:t></w:r></w:p>

<w:p><w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">Vocabulary to use: </w:t></w:r>
<w:r><w:t>landscape, threshold, terrain, collective, civic, open, shared, beyond, material, rooted, crafted, deliberate, considered.</w:t></w:r></w:p>
<w:p><w:r><w:t xml:space="preserve"> </w:t></w:r></w:p>

<w:p><w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">Vocabulary to avoid: </w:t></w:r>
<w:r><w:t>innovative, award-winning, world-class, solutions, seamless, transformative, cutting-edge, holistic, passionate, excited to announce.</w:t></w:r></w:p>
<w:p><w:r><w:t xml:space="preserve"> </w:t></w:r></w:p>

<w:p><w:pPr><w:pStyle w:val="Heading2"/></w:pPr>
<w:r><w:t>Page-Level Direction</w:t></w:r></w:p>

<w:p><w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">Homepage: </w:t></w:r>
<w:r><w:t>The hero should be a single, full-bleed project image that rotates slowly. No headline on the hero — the image speaks. Below: a one-paragraph manifesto. Then a curated selection of 4–6 projects. Then a discipline overview. Then a short statement about collaboration. The page should feel like entering a building, not like opening a brochure.</w:t></w:r></w:p>
<w:p><w:r><w:t xml:space="preserve"> </w:t></w:r></w:p>

<w:p><w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">Studio/About: </w:t></w:r>
<w:r><w:t>This is the most important page for talent acquisition. It should open with the founding story — brief, mythic, honest. Then the philosophy in full. Then the offices. Then a note on how we work (collaboration, no single author, the project belongs to everyone).</w:t></w:r></w:p>
<w:p><w:r><w:t xml:space="preserve"> </w:t></w:r></w:p>

<w:p><w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">Responsibility: </w:t></w:r>
<w:r><w:t>This page should be the most forward-looking content on the site. Climate commitment, social equity, community engagement. We want this to read as a manifesto, not a CSR report. Hard targets, honest language, no greenwashing.</w:t></w:r></w:p>
<w:p><w:r><w:t xml:space="preserve"> </w:t></w:r></w:p>

<w:p><w:pPr><w:pStyle w:val="Heading2"/></w:pPr>
<w:r><w:t>Brand Scenario</w:t></w:r></w:p>

<w:p><w:r><w:t>Scenario A — Brand-Free. We are commissioning Moood.Studio to define the visual DNA from scratch, guided by our work, our values, and our materials. We do not have a locked color system or typeface for digital. The new site is the opportunity to define one.</w:t></w:r></w:p>
<w:p><w:r><w:t xml:space="preserve"> </w:t></w:r></w:p>
<w:p><w:r><w:t>Constraints: The wordmark is sacred — do not modify it. The name is always rendered as "Snøhetta" (with the ø). Photography credits must always be visible. The firm never uses stock photography.</w:t></w:r></w:p>

<w:p><w:r><w:t xml:space="preserve"> </w:t></w:r></w:p>
<w:p><w:r><w:rPr><w:color w:val="aaaaaa"/><w:sz w:val="16"/></w:rPr>
<w:t>— End of Document —</w:t></w:r></w:p>

<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr>
</w:body>
</w:document>`;

    const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:style w:type="paragraph" w:styleId="Normal"><w:name w:val="Normal"/>
<w:rPr><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/>
<w:pPr><w:spacing w:before="240" w:after="120"/></w:pPr>
<w:rPr><w:b/><w:sz w:val="36"/><w:szCs w:val="36"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/>
<w:pPr><w:spacing w:before="280" w:after="80"/></w:pPr>
<w:rPr><w:b/><w:sz w:val="26"/><w:szCs w:val="26"/><w:color w:val="222222"/></w:rPr></w:style>
</w:styles>`;

    const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

    const appRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

    const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`;

    zip.file('[Content_Types].xml', contentTypes);
    zip.file('_rels/.rels', appRels);
    zip.folder('word').file('document.xml', content);
    zip.folder('word').file('styles.xml', styles);
    zip.folder('word/_rels').file('document.xml.rels', rels);

    const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
    fs.writeFileSync(path.join(OUT, 'brand-direction-notes.docx'), buf);
    console.log('✓ brand-direction-notes.docx created');
}

generatePDF();
generateDOCX();
