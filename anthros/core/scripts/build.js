/**
 * ════════════════════════════════════════════════════════
 *  ANTHROS — Component Build System
 *  Antigravity Agency · core/scripts/build.js
 * ════════════════════════════════════════════════════════
 *
 *  HOW IT WORKS:
 *  1. Reads every .html file inside src/templates/
 *  2. Finds all <!--@slot:component-name--> markers
 *  3. Replaces each marker with the content of components/component-name.html
 *  4. Writes the final assembled HTML to the project root (or dist/)
 *
 *  USAGE:
 *    node core/scripts/build.js          (build all templates)
 *    node core/scripts/build.js watch    (build + watch for changes)
 *
 *  SLOT SYNTAX (in any template file):
 *    <!--@slot:footer-->
 *    <!--@slot:navbar-->
 *    <!--@slot:cta-banner-->
 */

const fs = require('fs');
const path = require('path');

// ── Config ──────────────────────────────────────────────
const ROOT = path.resolve(__dirname, '../../');
const TEMPLATES = path.join(ROOT, 'src/templates');
const COMPONENTS = path.join(ROOT, 'components');
const OUTPUT = path.join(ROOT, 'builds'); // Output to builds/ directory

const SLOT_REGEX = /<!--@slot:([\w-]+)-->/g;

// ── Helpers ─────────────────────────────────────────────

function getComponentContent(name) {
    const filePath = path.join(COMPONENTS, `${name}.html`);
    if (!fs.existsSync(filePath)) {
        console.warn(`  ⚠️  Component not found: ${name}.html — slot left empty`);
        return `<!-- MISSING COMPONENT: ${name} -->`;
    }

    let raw = fs.readFileSync(filePath, 'utf-8');

    // Strip the standalone component's <html>/<head>/<body> wrapper if present
    // Components are authored as standalone files for previewing, but only
    // the <body> contents get injected into the page.
    const bodyMatch = raw.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
        return bodyMatch[1].trim();
    }

    // If no body tag (already a partial), return as-is
    return raw.trim();
}

function buildTemplate(templatePath) {
    const fileName = path.basename(templatePath);
    let html = fs.readFileSync(templatePath, 'utf-8');
    let count = 0;

    html = html.replace(SLOT_REGEX, (match, componentName) => {
        count++;
        return getComponentContent(componentName);
    });

    const outputPath = path.join(OUTPUT, fileName);
    fs.writeFileSync(outputPath, html, 'utf-8');
    console.log(`  ✅  ${fileName} → ${count} slot(s) resolved`);
    return outputPath;
}

function buildAll() {
    console.log('\n🔨  Anthros Build System');
    console.log('────────────────────────');

    if (!fs.existsSync(TEMPLATES)) {
        console.error(`❌  Templates directory not found: ${TEMPLATES}`);
        console.log('    Create src/templates/ and move your .html template files there.');
        process.exit(1);
    }

    if (!fs.existsSync(OUTPUT)) {
        fs.mkdirSync(OUTPUT, { recursive: true });
    }

    const templates = fs.readdirSync(TEMPLATES)
        .filter(f => f.endsWith('.html'));

    if (templates.length === 0) {
        console.warn('⚠️  No .html files found in src/templates/');
        return;
    }

    templates.forEach(file => {
        buildTemplate(path.join(TEMPLATES, file));
    });

    console.log(`\n✨  Build complete — ${templates.length} page(s) generated\n`);
}

// ── Watch Mode ───────────────────────────────────────────

function watchMode() {
    buildAll();
    console.log('👁️   Watching for changes (Ctrl+C to stop)...\n');

    const dirsToWatch = [TEMPLATES, COMPONENTS];

    dirsToWatch.forEach(dir => {
        if (!fs.existsSync(dir)) return;
        fs.watch(dir, { recursive: true }, (event, filename) => {
            if (!filename?.endsWith('.html')) return;
            console.log(`\n🔄  Change detected: ${filename}`);
            buildAll();
        });
    });
}

// ── Entry Point ──────────────────────────────────────────

const args = process.argv.slice(2);
if (args.includes('watch')) {
    watchMode();
} else {
    buildAll();
}
