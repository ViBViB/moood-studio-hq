        /* ── SITEMAP BUILD + REVIEW ─────────────────────────────── */
        let sitemapPages = [];
        let approvedPages = new Set();
        let pageComments = {};
        let pageIndex = {};
        let sitemapHasNavDef = false;

        function flattenAll(pages) {
            const out = [];
            function walk(p) { out.push(p); (p.children || []).forEach(walk); }
            pages.forEach(walk);
            return out;
        }

        function indexAllPages(pages) {
            pageIndex = {};
            flattenAll(pages).forEach(p => { pageIndex[p.id] = p; });
        }

        function buildSitemapFromFiles(apiData) {
            sitemapPages = [];
            approvedPages.clear();
            pageIndex = {};

            // Real data from Gemini API — use it directly
            if (apiData && apiData.pages && apiData.pages.length > 0) {
                sitemapPages = apiData.pages;
                sitemapHasNavDef = !!apiData.hasNavDefinition;
                indexAllPages(sitemapPages);

                // Pre-fill form fields from extracted metadata (only if field is currently empty)
                const meta = apiData.metadata || {};
                console.log('[intake] metadata from API:', JSON.stringify(meta));
                const fill = (selector, value) => {
                    if (!value) return;
                    const el = document.querySelector(selector);
                    console.log('[intake] fill', selector, '→', value, '| found el:', !!el, '| empty:', el ? !el.value.trim() : 'n/a');
                    if (el && !el.value.trim()) el.value = value;
                };
                fill('input[name="projectName"]', meta.projectName);
                fill('input[name="leadName"]',    meta.leadName);
                fill('input[name="email"]',        meta.clientEmail);
                fill('input[name="companyName"]',  meta.companyName);

                // Route to correct review based on scope
                if (selectedScope === 'single' || apiData.scope === 'single') {
                    currentIdx = currentPath.indexOf('slide-page-review');
                    renderPageReview(sitemapPages[0]);
                } else {
                    currentIdx = currentPath.indexOf('slide-sitemap-review');
                    renderSitemapTree();
                }
                return;
            }

            // Fallback: derive page names from uploaded filenames
            sitemapHasNavDef = false;
            if (narrativeFiles.length > 0) {
                const children = narrativeFiles.slice(1).map((f, i) => {
                    const raw = f.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
                    const name = raw.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                    return { id: 'page-0-' + i, name, type: 'Web Page', flags: 0, headline: '', summary: 'Content extracted.', flagText: null, missing: false, children: [], sections: [] };
                });
                const firstName = narrativeFiles[0].name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                sitemapPages = [{ id: 'page-0', name: firstName, type: 'Homepage', flags: 0, headline: '', summary: 'Content extracted.', flagText: null, missing: false, children, sections: [] }];
            } else {
                sitemapPages = [{ id: 'page-0', name: 'Homepage', type: 'Homepage', flags: 0, headline: '', summary: '', flagText: null, missing: false, children: [], sections: [] }];
            }

            indexAllPages(sitemapPages);
            if (selectedScope === 'single') {
                currentIdx = currentPath.indexOf('slide-page-review');
                renderPageReview(sitemapPages[0]);
            } else {
                renderSitemapTree();
            }
        }

        const pageIcon = `<svg class="svt-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`;
        const homeIcon = `<svg class="svt-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
        const dotsIcon = `<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="19" cy="12" r="1.5" fill="currentColor"/></svg>`;
        const checkIcon = `<svg class="svt-check" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg>`;

        function rowIcon(page) {
            if (page.missing) return `<svg class="svt-row-icon svt-icon-x" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
            if (approvedPages.has(page.id)) return `<svg class="svt-row-icon svt-icon-check" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`;
            return `<svg class="svt-row-icon svt-icon-dot" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/></svg>`;
        }

        function rowHtml(page) {
            const missingCls = page.missing ? ' svt-row-missing' : '';
            const approvedCls = !page.missing && approvedPages.has(page.id) ? ' svt-row-approved' : '';
            const click = page.missing ? '' : `onclick="openDrawer('${page.id}')"`;
            return `<div class="svt-row${missingCls}${approvedCls}" id="svtrow-${page.id}" ${click}>
                ${rowIcon(page)}<span>${page.name}</span>
            </div>`;
        }

        function renderVisualTree() {
            const container = document.getElementById('sitemapVisualTree');
            if (!container || sitemapPages.length === 0) return;

            const root = sitemapPages[0];
            if (!root.children || root.children.length === 0) {
                root.children = sitemapPages.slice(1);
            }

            const l1Items = root.children || [];

            const cols = l1Items.map(col => {
                const children = col.children && col.children.length > 0 ? col.children : [];
                const headerCls = col.missing ? ' svt-col-missing' : '';
                const headerClick = col.missing ? '' : `onclick="openDrawer('${col.id}')"`;
                // If L1 has no children, render the L1 itself as a row item
                const rowsHtml = children.length > 0
                    ? children.map(c => rowHtml(c)).join('')
                    : rowHtml(col);
                return `<div class="svt-col">
                    <div class="svt-col-header${headerCls}" ${headerClick}>${col.name}</div>
                    <div class="svt-col-items">${rowsHtml}</div>
                </div>`;
            }).join('');

            const noNavBanner = !sitemapHasNavDef ? `
                <div class="svt-no-nav-banner">
                    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    No navigation definition detected — pages shown as flat columns.
                </div>` : '';

            container.innerHTML = `
                <div class="svt-simple">
                    ${noNavBanner}
                    <div class="svt-root-row" onclick="openDrawer('${root.id}')">
                        <svg class="svt-row-icon svt-icon-dot" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/></svg>
                        <span class="svt-root-name">${root.name}</span>
                    </div>
                    <div class="svt-simple-divider"></div>
                    <div class="svt-columns">${cols}</div>
                </div>`;

            container.style.display = '';
        }

        function renderSitemapTree() {
            renderVisualTree();
            updateReviewProgress();
        }

        /* ── SINGLE-PAGE REVIEW (Scenario C) ───────────────────── */
        function renderPageReview(page) {
            if (!page) return;
            const container = document.getElementById('pageReviewContent');
            if (!container) return;

            const flagHtml = page.flags && page.flagText ? `
                <div class="pr-flag">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    ${page.flagText}
                </div>` : '';

            const sectionsHtml = (page.sections || []).map(s => `
                <div class="pr-section">
                    <div class="pr-section-name">Section: ${s.name}</div>
                    <ul class="pr-section-items">
                        ${(s.items || []).map(item => `
                            <li class="pr-item">
                                <span class="pr-item-label">${item.label}</span>
                                <span class="pr-item-value">${item.value}</span>
                            </li>`).join('')}
                    </ul>
                </div>`).join('');

            const eyebrow = [page.type, 'Narrative Preview'].filter(Boolean).join(' / ').toUpperCase() + ':';

            container.innerHTML = `
                <div class="pr-page">
                    <div class="pr-eyebrow">${eyebrow}</div>
                    <h2 class="pr-headline q-section-title">${page.headline || page.name || '[Title]'}</h2>
                    ${page.summary ? `<p class="pr-summary">${page.summary}</p>` : ''}
                    ${flagHtml}
                    ${sectionsHtml ? `<div class="pr-divider"></div>${sectionsHtml}` : ''}
                </div>`;

            document.getElementById('slide-page-review').style.display = '';
        }

        function approvePage(pageId) {
            approvedPages.add(pageId);
            const row = document.getElementById('svtrow-' + pageId);
            if (row) {
                row.classList.add('svt-row-approved');
                const icon = row.querySelector('.svt-row-icon');
                if (icon) icon.outerHTML = `<svg class="svt-row-icon svt-icon-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="20 6 9 17 4 12"/></svg>`;
            }
            // Also update root row if it's the homepage being approved
            const rootRow = document.querySelector('.svt-root-row');
            if (rootRow && rootRow.querySelector(`[id="svtrow-${pageId}"]`) === null && sitemapPages[0]?.id === pageId) {
                const icon = rootRow.querySelector('.svt-row-icon');
                if (icon) icon.outerHTML = `<svg class="svt-row-icon svt-icon-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="20 6 9 17 4 12"/></svg>`;
            }
            updateReviewProgress();
        }

        function saveComment(pageId, value) {
            pageComments[pageId] = value ? value.trim() : '';
        }

        /* ── CHIP DROPDOWN ──────────────────────────────────────── */
        let activeDropdownPageId = null;

        function openChipMenu(pageId, btn) {
            activeDropdownPageId = pageId;
            const dd = document.getElementById('chipDropdown');
            const rect = btn.getBoundingClientRect();
            dd.style.top = (rect.bottom + 6) + 'px';
            dd.style.left = Math.min(rect.left, window.innerWidth - 160) + 'px';
            dd.style.display = 'flex';

            const approveBtn = document.getElementById('ddApproveBtn');
            if (approvedPages.has(pageId)) {
                approveBtn.classList.add('dd-approved');
                approveBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg> Approved`;
            } else {
                approveBtn.classList.remove('dd-approved');
                approveBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg> Approve`;
            }

            setTimeout(() => document.addEventListener('click', closeDdOutside, { once: true }), 0);
        }

        function closeDdOutside(e) {
            const dd = document.getElementById('chipDropdown');
            if (!dd.contains(e.target)) { dd.style.display = 'none'; activeDropdownPageId = null; }
        }

        function previewFromDropdown() {
            const id = activeDropdownPageId;
            document.getElementById('chipDropdown').style.display = 'none';
            activeDropdownPageId = null;
            openDrawer(id);
        }

        function approveFromDropdown() {
            const id = activeDropdownPageId;
            document.getElementById('chipDropdown').style.display = 'none';
            activeDropdownPageId = null;
            approvePage(id);
            const approveBtn = document.getElementById('ddApproveBtn');
            if (approveBtn) { approveBtn.classList.add('dd-approved'); }
        }

        /* ── NARRATIVE DRAWER ───────────────────────────────────── */
        let activeDrawerPageId = null;

        function openDrawer(pageId) {
            const page = pageIndex[pageId];
            if (!page) return;
            activeDrawerPageId = pageId;

            document.getElementById('ndTitle').textContent = 'Narrative preview: ' + page.name;
            document.getElementById('ndBody').innerHTML = renderDrawerBody(page);
            document.getElementById('ndComment').value = pageComments[pageId] || '';

            const approveBtn = document.getElementById('ndApproveBtn');
            if (approvedPages.has(pageId)) {
                approveBtn.classList.add('approved-state');
                approveBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> Approved`;
            } else {
                approveBtn.classList.remove('approved-state');
                approveBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> Approve page`;
            }

            const fb = document.getElementById('ndFeedbackBtn');
            fb.classList.remove('sent');
            fb.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> Send feedback`;

            document.getElementById('narrativeDrawer').classList.add('open');
            document.getElementById('ndBackdrop').classList.add('open');
        }

        function renderDrawerBody(page) {
            if (page.sections && page.sections.length > 0) {
                return page.sections.map(s => `
                    <div class="nd-section">
                        <div class="nd-section-name">Section: ${s.name}</div>
                        <ul class="nd-section-items">
                            ${s.items.map(item => `<li><strong>${item.label}</strong>: ${item.value}</li>`).join('')}
                        </ul>
                    </div>`).join('');
            }
            let html = `
                <div class="nd-section">
                    <div class="nd-section-name">Extracted headline</div>
                    <ul class="nd-section-items"><li>${page.headline}</li></ul>
                </div>
                <div class="nd-section">
                    <div class="nd-section-name">Content summary</div>
                    <ul class="nd-section-items"><li>${page.summary}</li></ul>
                </div>`;
            if (page.flags > 0 && page.flagText) {
                html += `<div class="nd-section nd-flag">
                    <div class="nd-section-name">Flag</div>
                    <ul class="nd-section-items"><li>${page.flagText}</li></ul>
                </div>`;
            }
            return html;
        }

        function closeDrawer() {
            if (activeDrawerPageId) {
                pageComments[activeDrawerPageId] = document.getElementById('ndComment').value.trim();
            }
            document.getElementById('narrativeDrawer').classList.remove('open');
            document.getElementById('ndBackdrop').classList.remove('open');
            activeDrawerPageId = null;
        }

        function approveFromDrawer() {
            if (!activeDrawerPageId) return;
            pageComments[activeDrawerPageId] = document.getElementById('ndComment').value.trim();
            approvePage(activeDrawerPageId);
            const btn = document.getElementById('ndApproveBtn');
            btn.classList.add('approved-state');
            btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> Approved`;
            setTimeout(closeDrawer, 400);
        }

        function sendFeedback() {
            if (!activeDrawerPageId) return;
            pageComments[activeDrawerPageId] = document.getElementById('ndComment').value.trim();
            const btn = document.getElementById('ndFeedbackBtn');
            btn.classList.add('sent');
            btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg> Sent`;
        }

        function updateReviewProgress() {
            // progress bar removed — nothing to update here
        }

        function openFeedbackDialog() {
            document.getElementById('svtFeedbackOverlay').classList.add('open');
            document.getElementById('svtFeedbackPanel').classList.add('open');
            document.getElementById('svtFeedbackText').focus();
        }

        function closeFeedbackDialog() {
            document.getElementById('svtFeedbackOverlay').classList.remove('open');
            document.getElementById('svtFeedbackPanel').classList.remove('open');
        }

        function submitSitemapFeedback() {
            const text = document.getElementById('svtFeedbackText').value.trim();
            if (!text) return;
            const btn = document.getElementById('svtFeedbackSend');
            btn.textContent = 'Sending…';
            btn.disabled = true;
            const email = document.querySelector('input[name="email"]')?.value || '';
            const projectName = document.querySelector('input[name="projectName"]')?.value || '';
            fetch('/api/sitemap-feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, projectName, feedback: text, pages: flattenAll(sitemapPages).map(p => p.name) })
            }).catch(() => { }).finally(() => {
                btn.textContent = 'Sent';
                setTimeout(closeFeedbackDialog, 800);
            });
        }

        function approveAllAndStart() {
            closeDrawer();
            const email = document.querySelector('input[name="email"]')?.value || '';
            const emailEl = document.getElementById('reviewCompleteEmail');
            if (emailEl) emailEl.textContent = email;
            document.getElementById('sitemapVisualTree').style.display = 'none';
            document.getElementById('sitemapTree').style.display = 'none';
            document.getElementById('sitemapReviewFooter').style.display = 'none';
            document.getElementById('sitemapReviewHeader').style.display = 'none';
            const svtBottomNote = document.querySelector('.svt-bottom-note');
            if (svtBottomNote) svtBottomNote.style.display = 'none';

            const slide = document.getElementById('slide-sitemap-review');
            const viewport = slide.parentElement;
            const scrollArea = viewport.parentElement;

            // Force layout into full-height flex mode for centering
            scrollArea.style.display = 'flex';
            scrollArea.style.flexDirection = 'column';
            scrollArea.style.height = '100%';

            viewport.style.display = 'flex';
            viewport.style.flexDirection = 'column';
            viewport.style.flex = '1';
            viewport.style.height = '100%';

            slide.classList.add('is-complete');

            document.getElementById('reviewComplete').classList.add('visible');
            document.getElementById('slide-sitemap-review').scrollTop = 0;
            const projectName = document.querySelector('input[name="projectName"]')?.value || '';
            const leadName    = document.querySelector('input[name="leadName"]')?.value  || (projectPassport?.leadName   || '');
            const companyName = document.querySelector('input[name="companyName"]')?.value || (projectPassport?.clientName || '');
            const visualRefs  = Array.from(document.querySelectorAll('#refLinksList input')).map(i => i.value.trim()).filter(Boolean);
            fetch('/api/client-intake-approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    leadName,
                    companyName,
                    projectName,
                    hasNarrative: selectedPath === 'narrative',
                    isSinglePage: selectedScope === 'single',
                    scenario:     projectPassport?.scenario || 'A',
                    visualRefs,
                    pages: flattenAll(sitemapPages).map(p => ({
                        id: p.id,
                        name: p.name,
                        comment: pageComments[p.id] || ''
                    }))
                })
            }).catch(() => { });
        }

        function approvePageAndStart() {
            document.getElementById('pageReviewContent').style.display = 'none';
            document.getElementById('pageReviewFooter').style.display = 'none';

            const slide = document.getElementById('slide-page-review');
            const viewport = slide.parentElement;
            const scrollArea = viewport.parentElement;

            scrollArea.style.display = 'flex';
            
            const email       = document.querySelector('input[name="email"]')?.value      || (projectPassport?.clientEmail || '');
            const projectName  = document.querySelector('input[name="projectName"]')?.value  || (projectPassport?.projectName || '');
            const leadName     = document.querySelector('input[name="leadName"]')?.value     || (projectPassport?.leadName    || '');
            const companyName  = document.querySelector('input[name="companyName"]')?.value  || (projectPassport?.clientName  || '');
            const visualRefs   = Array.from(document.querySelectorAll('#refLinksList input')).map(i => i.value.trim()).filter(Boolean);
            fetch('/api/client-intake-approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    leadName,
                    companyName,
                    projectName,
                    hasNarrative: true,
                    isSinglePage: selectedScope === 'single',
                    scenario:     projectPassport?.scenario || 'A',
                    visualRefs,
                    pages: sitemapPages.map(p => ({
                        id: p.id,
                        name: p.name,
                        comment: pageComments[p.id] || ''
                    }))
                })
            }).catch(() => { });
            scrollArea.style.flexDirection = 'column';
            scrollArea.style.height = '100%';
            viewport.style.display = 'flex';
            viewport.style.flexDirection = 'column';
            viewport.style.flex = '1';
            viewport.style.height = '100%';
            slide.classList.add('is-complete');

            // Reuse the existing reviewComplete element — move it into this slide
            const reviewComplete = document.getElementById('reviewComplete');
            slide.appendChild(reviewComplete);
            reviewComplete.classList.add('visible');
            slide.scrollTop = 0;
        }

        /* ── SITEMAP BUILDER ─────────────────────────────────────── */
        let pageCount = 0;

        function addSubpageRow(subpagesList, pi) {
            const subCount = subpagesList.querySelectorAll('.subpage-row').length + 1;
            const row = document.createElement('div');
            row.className = 'subpage-row';
            row.innerHTML = `
            <svg class="subpage-row-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18l6-6-6-6"/></svg>
            <input type="text" name="pages[${pi}][subpages][]" placeholder="Sub-page name (e.g., Service A, Service B)">
            <button type="button" class="subpage-row-remove" onclick="this.closest('.subpage-row').remove()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>`;
            subpagesList.insertBefore(row, subpagesList.querySelector('.btn-add-subpage'));
        }

        function addSitemapRow() {
            pageCount++;
            const pi = pageCount;
            const builder = document.getElementById('sitemapBuilder');
            const block = document.createElement('div');
            block.className = 'sitemap-page-block';
            block.innerHTML = `
            <div class="sitemap-row">
                <input type="text" name="pages[${pi}][name]" placeholder="Page name (e.g., Homepage, About, Pricing)">
                <select name="pages[${pi}][type]">
                    <option value="web">Web Page</option>
                    <option value="landing">Landing Page</option>
                    <option value="blog">Blog / Pillar</option>
                </select>
                <button type="button" class="btn-toggle-subpages" data-pi="${pi}" title="Add sub-pages (dropdown nav)">+ Sub-pages</button>
                <button type="button" class="sitemap-row-remove" onclick="this.closest('.sitemap-page-block').remove()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>
            <div class="subpages-area" id="subpages-${pi}">
                <div class="subpages-label">↳ Sub-pages <span class="dropdown-badge">Dropdown nav</span></div>
            </div>`;
            builder.appendChild(block);

            const toggleBtn = block.querySelector('.btn-toggle-subpages');
            const subpagesArea = block.querySelector('.subpages-area');

            toggleBtn.addEventListener('click', () => {
                const isActive = toggleBtn.classList.toggle('active');
                block.classList.toggle('has-subpages', isActive);
                subpagesArea.classList.toggle('visible', isActive);
                if (isActive && !subpagesArea.querySelector('.subpage-row')) {
                    // Seed with 2 sub-page rows
                    addSubpageRow(subpagesArea, pi);
                    addSubpageRow(subpagesArea, pi);
                    // Add "Add sub-page" button
                    const addBtn = document.createElement('button');
                    addBtn.type = 'button';
                    addBtn.className = 'btn-add-subpage';
                    addBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add sub-page`;
                    addBtn.addEventListener('click', () => addSubpageRow(subpagesArea, pi));
                    subpagesArea.appendChild(addBtn);
                }
            });
        }

        // sitemap builder removed — architecture defined from uploaded materials
