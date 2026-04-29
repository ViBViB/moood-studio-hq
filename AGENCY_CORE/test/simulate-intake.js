const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { PassThrough } = require('stream');

const SOURCES = path.join(__dirname, 'sources');

const form = new FormData();
form.append('intakePath', 'strategy');
form.append('email', 'alberto@inboundlabs.co');
form.append('leadName', 'Sofia Berg');
form.append('projectName', 'Snøhetta — Digital Presence Redesign');
form.append('projectCode', 'MSD-2026-9052');
form.append('scope', 'multi');
form.append('portrait', 'Cultural institutions, municipal governments, and private developers commissioning landmark or civic projects — $10M+ budget range. Secondary: junior architects and designers considering Snøhetta as a place to work. Institutional clients arrive via referral or award recognition; they know the name but not the breadth of disciplines.');
form.append('cta', "Book an initial conversation with Snøhetta's new business team.");
form.append('pageObjectives', JSON.stringify([
    { page: 'Home',           objective: 'that this firm thinks differently — before reading a single word' },
    { page: 'Projects',       objective: 'that the work speaks for itself and each project had genuine consequences in the world' },
    { page: 'Services',       objective: "that Snøhetta's disciplines are interconnected, not siloed offerings" },
    { page: 'Studio',         objective: 'that this firm was built on conviction, not on market opportunity' },
    { page: 'People',         objective: 'that working here means being part of something that outlasts any single project' },
    { page: 'Journal',        objective: 'that Snøhetta has a point of view on the world, not just on buildings' },
    { page: 'Responsibility', objective: 'that sustainability is not a policy — it is the way they think' },
    { page: 'Contact',        objective: 'that reaching out feels like starting a real conversation, not submitting a request' }
]));
form.append('visualRefs', JSON.stringify([
    'snohetta.com',
    'dezeen.com',
    'serpentinegalleries.org',
    'vitsoe.com'
]));
form.append('competitorsList', JSON.stringify([
    'big.dk',
    'zaha-hadid.com',
    'adjaye.com',
    'studiogangarchitects.com',
    'gensler.com'
]));

form.append('sourceFiles', fs.createReadStream(path.join(SOURCES, 'snohetta-brief.txt')),          { filename: 'snohetta-brief.txt',          contentType: 'text/plain' });
form.append('sourceFiles', fs.createReadStream(path.join(SOURCES, 'audience-research.txt')),       { filename: 'audience-research.txt',       contentType: 'text/plain' });
form.append('sourceFiles', fs.createReadStream(path.join(SOURCES, 'competitive-analysis.pdf')),    { filename: 'competitive-analysis.pdf',    contentType: 'application/pdf' });
form.append('sourceFiles', fs.createReadStream(path.join(SOURCES, 'brand-direction-notes.docx')), { filename: 'brand-direction-notes.docx',  contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

console.log('Buffering form data...');

// Pipe into PassThrough to collect full body with Content-Length
const pt = new PassThrough();
const chunks = [];
pt.on('data', chunk => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
pt.on('end', () => {
    const body = Buffer.concat(chunks);

    const options = {
        hostname: 'localhost',
        port: 3333,
        path: '/api/client-intake',
        method: 'POST',
        headers: {
            ...form.getHeaders(),
            'Content-Length': body.length
        }
    };

    console.log(`Submitting to localhost:3333 (${body.length} bytes)...`);

    const req = http.request(options, res => {
        let responseBody = '';
        res.on('data', chunk => responseBody += chunk);
        res.on('end', () => {
            console.log(`Status: ${res.statusCode}`);
            try {
                console.log(JSON.stringify(JSON.parse(responseBody), null, 2));
            } catch {
                console.log(responseBody);
            }
        });
    });

    req.on('error', err => console.error('Request error:', err.message));
    req.write(body);
    req.end();
});
pt.on('error', err => console.error('Buffer error:', err));

form.pipe(pt);
