/* ── SEGMENT 1: STATE, ROUTING, NAVIGATION, UPLOADS, PROCESSING ─── */
        /* ── STATE ──────────────────────────────────────────────── */
        let selectedPath = null;       // 'strategy' | 'narrative'
        let selectedPageType = null;   // 'web' | 'landing' | 'blog'
        let selectedScope = '';        // 'single' | 'multi'
        let selectedBrandStatus = null;
        let logoFiles = [];
        let sectionCount = 0;
        let blogSectionCount = 0;
        const MAX_SECTIONS = 5;
        const MIN_SECTIONS = 3;

        // Path arrays — index → slide element ID
        const STRATEGY_PATH = ['slide-0', 'slide-scope', 'slide-1', 'slide-2', 'slide-3', 'slide-sources', 'slide-page-obj', 'slide-st-competition', 'slide-st-audience', 'slide-st-conversion', 'slide-7'];
        const NARRATIVE_PATH = ['slide-0', 'slide-scope', 'slide-upload', 'slide-1', 'slide-2', 'slide-3', 'slide-processing', 'slide-sitemap-review'];
        const SINGLE_NARRATIVE_PATH = ['slide-0', 'slide-scope', 'slide-upload', 'slide-1', 'slide-2', 'slide-3', 'slide-processing', 'slide-page-review'];
        const DEFAULT_PATH = ['slide-0', 'slide-scope', 'slide-1', 'slide-2', 'slide-3', 'slide-sources', 'slide-page-obj', 'slide-st-competition', 'slide-st-audience', 'slide-st-conversion', 'slide-7'];

        // Code-activated paths — welcome screen + scenario-conditional slides
        // Scenario A (Brand-Free): Sources → Visual refs → Brand assets → Competition → Audience → Conversion → Submit
        const CODE_A_STRATEGY    = ['slide-code', 'slide-sources', 'slide-page-obj', 'slide-1', 'slide-2', 'slide-st-competition', 'slide-st-audience', 'slide-st-conversion', 'slide-7'];
        // Scenario B/C/D (Brand-Locked): Visual refs removed, Brand assets is primary
        const CODE_BCD_STRATEGY  = ['slide-code', 'slide-sources', 'slide-page-obj', 'slide-2', 'slide-st-competition', 'slide-st-audience', 'slide-st-conversion', 'slide-7'];
        // Scenario A + client provides narrative
        const CODE_A_NARRATIVE   = ['slide-code', 'slide-1', 'slide-2', 'slide-st-competition', 'slide-st-audience', 'slide-st-conversion', 'slide-upload', 'slide-processing', 'slide-page-review'];
        // Scenario B/C/D + client provides narrative
        const CODE_BCD_NARRATIVE = ['slide-code', 'slide-2', 'slide-st-competition', 'slide-st-audience', 'slide-st-conversion', 'slide-upload', 'slide-processing', 'slide-page-review'];

        let projectPassport = null;
        let codeActivated   = false;

        let currentPath = ['slide-code'];
        let currentIdx = 0;

        /* ── OTP SETUP ────────────────────────────────────────── */
        (function initOTP() {
            const prefix = document.getElementById('otpPrefix');
            if (prefix) prefix.textContent = `MSD · ${new Date().getFullYear()} ·`;

            const boxes = Array.from(document.querySelectorAll('.otp-box'));

            boxes.forEach((box, i) => {
                box.addEventListener('input', () => {
                    const val = box.value.replace(/[^0-9]/g, '');
                    box.value = val ? val[val.length - 1] : '';
                    box.classList.toggle('filled', !!box.value);
                    box.classList.remove('otp-error');
                    document.getElementById('codeError').classList.remove('visible');

                    if (box.value && i < boxes.length - 1) boxes[i + 1].focus();
                    if (boxes.every(b => b.value)) validateAndActivateCode();
                });

                box.addEventListener('keydown', e => {
                    if (e.key === 'Backspace' && !box.value && i > 0) {
                        boxes[i - 1].value = '';
                        boxes[i - 1].classList.remove('filled');
                        boxes[i - 1].focus();
                    }
                    if (e.key === 'ArrowLeft'  && i > 0)              boxes[i - 1].focus();
                    if (e.key === 'ArrowRight' && i < boxes.length-1) boxes[i + 1].focus();
                });

                box.addEventListener('paste', e => {
                    e.preventDefault();
                    const digits = (e.clipboardData.getData('text') || '').replace(/[^0-9]/g, '');
                    digits.split('').slice(0, boxes.length - i).forEach((d, j) => {
                        boxes[i + j].value = d;
                        boxes[i + j].classList.add('filled');
                    });
                    const last = Math.min(i + digits.length, boxes.length - 1);
                    boxes[last].focus();
                    if (boxes.every(b => b.value)) validateAndActivateCode();
                });

                box.addEventListener('click', () => box.select());
            });
        })();

        /* ── CODE ACTIVATION ──────────────────────────────────── */
        async function validateAndActivateCode() {
            const boxes  = Array.from(document.querySelectorAll('.otp-box'));
            const digits = boxes.map(b => b.value).join('');
            const err    = document.getElementById('codeError');

            err.classList.remove('visible');
            boxes.forEach(b => b.classList.remove('otp-error'));

            if (digits.length < 4) {
                err.textContent = 'Please enter all 4 digits.';
                err.classList.add('visible');
                return;
            }

            const code = `MSD-${new Date().getFullYear()}-${digits}`;
            boxes.forEach(b => { b.disabled = true; });

            try {
                const res  = await fetch(`/api/validate-code?code=${encodeURIComponent(code)}`);
                const data = await res.json();

                if (!res.ok || !data.valid) {
                    err.textContent = data.error || 'Code not found. Check the digits in your email and try again.';
                    err.classList.add('visible');
                    boxes.forEach(b => { b.disabled = false; b.classList.add('otp-error'); });
                    boxes[0].focus();
                    return;
                }

                activatePassport(data);

            } catch (e) {
                err.textContent = 'Connection error. Please try again.';
                err.classList.add('visible');
                boxes.forEach(b => b.disabled = false);
            }
        }

        function activatePassport(passport) {
            projectPassport = passport;
            codeActivated   = true;

            // Pre-fill slide-0 fields in case user reaches it via non-code path
            const pnInput = document.querySelector('[name="projectName"]');
            if (pnInput && passport.projectName) pnInput.value = passport.projectName;
            
            const emailInput = document.querySelector('[name="email"]');
            if (emailInput && passport.clientEmail) emailInput.value = passport.clientEmail;
            
            const leadInput = document.querySelector('[name="leadName"]');
            if (leadInput && passport.leadName) leadInput.value = passport.leadName;

            // Set scope state so downstream validation passes
            const pages        = passport.pages || [];
            const scenarioBCD  = ['B', 'C', 'D'].includes(passport.scenario);
            selectedScope      = pages.length === 1 ? 'single' : 'multi';
            if (pages.length === 1 && pages[0].type) selectedPageType = pages[0].type;

            // Determine path by scenario + narrative flag
            if (passport.hasNarrative) {
                selectedPath = pages.length === 1 ? 'single' : 'multi';
                currentPath  = scenarioBCD ? [...CODE_BCD_NARRATIVE] : [...CODE_A_NARRATIVE];
                if (selectedPath !== 'single') {
                    currentPath[currentPath.length - 1] = 'slide-sitemap-review';
                }
            } else {
                selectedPath = 'strategy';
                currentPath  = scenarioBCD ? CODE_BCD_STRATEGY : CODE_A_STRATEGY;
            }

            // Populate welcome slide
            populateWelcomeSlide(passport, currentPath);
            populatePageObjectives(passport);

            currentIdx = 1;
            updateSidebarForPassport(passport, currentPath); // build nav items first
            updateSlider(); // then apply active state against populated nav
        }

        function populateWelcomeSlide(passport, path) {
            const scenarioLabels = {
                'A': 'Brand-Free',
                'B': 'Figma Fidelity',
                'C': 'Component-Locked',
                'D': 'Figma + Components'
            };
            const nextLabels = {
                'slide-sources':         'Sources & evidence',
                'slide-1':               'Visual references',
                'slide-2':               'Brand assets',
                'slide-st-competition':  'Competitors',
                'slide-st-audience':     'Audience',
                'slide-st-conversion':   'Conversion goal',
                'slide-upload':          'Upload your narrative',
                'slide-processing':      'Processing',
                'slide-sitemap-review':  'Sitemap review',
                'slide-7':               'Confirmation'
            };

            const titleEl = document.getElementById('welcomeTitle');
            const nameEl  = document.getElementById('welcomeProjectName');
            const metaEl  = document.getElementById('welcomeMeta');
            const gridEl  = document.getElementById('welcomePagesGrid');
            const nextEl  = document.getElementById('welcomeNextSteps');

            const rawName    = passport.leadName || passport.clientName || passport.projectName || '';
            const displayName = rawName.split(' ')[0];
            if (titleEl) titleEl.textContent = displayName ? `Great to have you with us, ${displayName}.` : 'Great to have you with us.';
            if (nameEl)  nameEl.textContent  = passport.projectName || '—';

            if (metaEl) {
                const scLabel = scenarioLabels[passport.scenario] || `Scenario ${passport.scenario}`;
                const narLabel = passport.hasNarrative ? 'Narrative provided' : 'Strategist writes';
                metaEl.innerHTML = [
                    passport.projectType ? `<span class="welcome-tag">${passport.projectType}</span>` : '',
                    `<span class="welcome-tag">Scenario ${passport.scenario} — ${scLabel}</span>`,
                    `<span class="welcome-tag">${narLabel}</span>`
                ].join('');
            }

            if (gridEl && Array.isArray(passport.pages)) {
                gridEl.innerHTML = passport.pages.map((p, i) =>
                    `<div class="welcome-page-pill">
                        <span class="welcome-page-num"></span>
                        <span>${p.name || p}</span>
                        ${p.type ? `<span class="welcome-page-type">${p.type}</span>` : ''}
                    </div>`
                ).join('');
            }

            if (nextEl) {
                // Show slides after slide-welcome (index 2 onwards), excluding terminal slides
                const skip = new Set(['slide-code', 'slide-welcome', 'slide-processing']);
                const steps = path.slice(2).filter(id => !skip.has(id));
                nextEl.innerHTML = steps.map(id =>
                    `<div class="welcome-next-item">
                        <span class="welcome-next-dot"></span>
                        <span>${nextLabels[id] || id}</span>
                    </div>`
                ).join('');
            }
        }

        function skipCodeEntry() {
            codeActivated  = false;
            projectPassport = null;
            currentPath    = DEFAULT_PATH;
            currentIdx     = 0;

            // Restore generic sidebar for non-code path
            const tag  = document.getElementById('sidebarTag');
            const h1   = document.getElementById('sidebarH1');
            const desc = document.getElementById('sidebarDesc');
            const nav  = document.getElementById('navList');
            if (tag)  tag.textContent  = 'Client Intake';
            if (h1)   h1.innerHTML     = 'Strategic<br>Onboarding';
            if (desc) desc.textContent = 'A few focused questions. Everything we need to start producing the work.';
            if (nav) {
                nav.style.display = '';
                nav.innerHTML = `
                    <li class="q-nav-item active" data-idx="0"><span class="bar"></span><span class="nav-label">About you</span></li>
                    <li class="q-nav-item" data-idx="1"><span class="bar"></span><span class="nav-label">Site scope</span></li>
                    <li class="q-nav-item" data-idx="2"><span class="bar"></span><span class="nav-label">Visual references</span></li>
                    <li class="q-nav-item" data-idx="3"><span class="bar"></span><span class="nav-label">Brand assets</span></li>
                    <li class="q-nav-item" data-idx="4"><span class="bar"></span><span class="nav-label">Your situation</span></li>`;
                navItems = document.querySelectorAll('.q-nav-item');
            }

            updateSlider();
        }

        function populatePageObjectives(passport) {
            const container = document.getElementById('pageObjContainer');
            if (!container) return;
            const pages = passport.pages || [];
            container.innerHTML = pages.map((p, i) => {
                const name = typeof p === 'object' ? p.name : p;
                const type = typeof p === 'object' ? p.type : '';
                return `
                <div class="page-obj-card">
                    <div class="page-obj-header">
                        <span class="page-obj-num"></span>
                        <span class="page-obj-name">${name}</span>
                        ${type ? `<span class="page-obj-type">${type}</span>` : ''}
                        <span class="page-obj-optional">Optional</span>
                    </div>
                    <div class="page-obj-label-row">
                        <label class="page-obj-label">After seeing this page, a visitor should think or feel:</label>
                        <input type="text" class="page-obj-input" id="pageObj_${i}" data-page="${name}">
                    </div>
                </div>`;
            }).join('');
        }

        function updateSidebarForPassport(passport, path) {
            const tagEl   = document.getElementById('sidebarTag');
            const h1El    = document.getElementById('sidebarH1');
            const descEl  = document.getElementById('sidebarDesc');
            const rawName    = passport.leadName || passport.clientName || passport.projectName || '';
            const firstName  = rawName.split(' ')[0];
            if (tagEl)  tagEl.textContent  = passport.projectName || 'Your project';
            if (h1El)   h1El.textContent   = 'Strategic Intake.';
            if (descEl) descEl.innerHTML   = `<p><strong>${firstName ? `Great to have you with us, ${firstName}.` : 'Great to have you with us.'}</strong></p><p>With your project active, it's time to map your brand's DNA. Use this intake to share your direction and align our execution with your vision.</p>`;

            // Rebuild nav to reflect actual upcoming slides (skip terminal/system slides)
            const navSlideLabels = {
                'slide-sources':        'Sources',
                'slide-page-obj':       'Page objectives',
                'slide-1':              'Visual references',
                'slide-2':              'Brand assets',
                'slide-st-competition': 'Competitors',
                'slide-st-audience':    'Audience',
                'slide-st-conversion':  'Conversion',
                'slide-upload':         'Upload narrative',
                'slide-7':              'Confirmation',
                'slide-sitemap-review': 'Sitemap review',
                'slide-page-review':    'Page review'
            };
            const skip = new Set(['slide-code', 'slide-welcome', 'slide-processing', 'slide-page-review']);
            const navSlides = path.filter(id => !skip.has(id) && navSlideLabels[id]);

            const navList = document.getElementById('navList');
            if (navList) {
                navList.style.display = '';
                navList.innerHTML = navSlides.map((id, i) => {
                    const label = navSlideLabels[id];
                    const num = String(i + 1).padStart(2, '0');
                    return `<li class="q-nav-item" data-idx="${path.indexOf(id)}"><span class="bar"></span><span class="nav-label">${label}</span></li>`;
                }).join('');
                navItems = document.querySelectorAll('.q-nav-item');
            }
        }

        const qNav = document.getElementById('qNav');
        const btnPrev = document.getElementById('btnPrev');
        const btnNext = document.getElementById('btnNext');
        const nextBtnText = document.getElementById('nextBtnText');
        let navItems = document.querySelectorAll('.q-nav-item');
        const allSlides = document.querySelectorAll('.q-slide');

        /* ── SLIDER ─────────────────────────────────────────────── */
        function updateSlider() {
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;

            const activeId = currentPath[currentIdx];
            allSlides.forEach(s => {
                const isActive = s.id === activeId;
                const isPast = currentPath.slice(0, currentIdx).includes(s.id);
                s.classList.toggle('active', isActive);
                s.classList.toggle('exit', isPast && !isActive);
                if (isActive) document.querySelector('.q-scroll-area').scrollTop = 0;
            });

            navItems.forEach((item) => {
                const idx = parseInt(item.dataset.idx);
                item.classList.toggle('active', idx === currentIdx);
                item.classList.toggle('done', idx < currentIdx);
            });

            btnPrev.disabled = currentIdx === 0;

            const isLast = currentIdx === currentPath.length - 1;
            const isPreLast = currentIdx === currentPath.length - 2;
            const isUpload = activeId === 'slide-upload';
            const noNavSlides = ['slide-processing', 'slide-sitemap-review', 'slide-page-review'];
            const isNoNavSlide = noNavSlides.includes(activeId);
            document.querySelector('.q-layout').classList.toggle('sitemap-mode', activeId === 'slide-sitemap-review');
            document.querySelector('.q-layout').classList.toggle('page-review-mode', activeId === 'slide-page-review');

            if (isLast || isNoNavSlide) {
                qNav.style.display = 'none';
                
                // Show specific footers for review slides
                const sReview = document.getElementById('sitemapReviewFooter');
                const pReview = document.getElementById('pageReviewFooter');
                if (sReview) sReview.style.display = (activeId === 'slide-sitemap-review') ? 'block' : 'none';
                if (pReview) pReview.style.display = (activeId === 'slide-page-review') ? 'block' : 'none';
            } else {
                qNav.style.display = 'flex';
                document.getElementById('sitemapReviewFooter').style.display = 'none';
                document.getElementById('pageReviewFooter').style.display = 'none';

                if (activeId === 'slide-upload') {
                    const hasFiles = narrativeFiles.length > 0;
                    nextBtnText.textContent = hasFiles ? 'Send' : 'Next step';
                    btnNext.className = 'btn-next' + (hasFiles ? ' btn-finish' : '');
                    btnNext.disabled = !hasFiles;
                    btnPrev.disabled = false; // Always show back on slide-upload
                } else {
                    nextBtnText.textContent = isPreLast ? 'Submit intake' : 'Next step';
                    btnNext.className = 'btn-next' + (isPreLast ? ' btn-finish' : '');
                    btnNext.disabled = false;
                }
            }
        }

        function nextSlide() {
            const isPreLast = currentIdx === currentPath.length - 2;
            const activeId = currentPath[currentIdx];

            if (activeId === 'slide-upload') {
                sendNarrativeIntake();
                return;
            }

            if (isPreLast) {
                if (validateSlide(currentIdx)) submitIntake();
                return;
            }
            if (currentIdx < currentPath.length - 1 && validateSlide(currentIdx)) {
                if (activeId === 'slide-3' && selectedPath) {
                    updateSidebarForPath(selectedPath);
                }
                currentIdx++;
                updateSlider();
                updateNavLabels();
            }
        }

        function prevSlide() {
            if (currentIdx > 0) {
                currentIdx--;
                if (currentPath[currentIdx] === 'slide-3') restoreDefaultSidebar();
                updateSlider(); updateNavLabels();
            }
        }

        function restoreDefaultSidebar() {
            const steps = ['About you', 'Site scope', 'Visual references', 'Brand assets', 'Your situation'];
            const navList = document.getElementById('navList');
            navList.innerHTML = steps.map((label, i) =>
                `<li class="q-nav-item" data-idx="${i}"><span class="bar"></span><span class="nav-label">${label}</span></li>`
            ).join('');
            navItems = document.querySelectorAll('.q-nav-item');
            document.querySelector('.q-h1').innerHTML = 'Strategic<br>Onboarding';
            document.querySelector('.q-sidebar-instruction').textContent = 'A few focused questions. Everything we need to start producing the work.';
        }

        document.getElementById('navList').addEventListener('click', e => {
            const item = e.target.closest('.q-nav-item');
            if (!item) return;
            const i = parseInt(item.dataset.idx);
            if (i < currentIdx || localStorage.getItem('moood_debug') === 'true') {
                currentIdx = i;
                if (currentPath[currentIdx] === 'slide-3') restoreDefaultSidebar();
                updateSlider(); updateNavLabels();
            }
        });

        /* ── NAV LABELS ─────────────────────────────────────────── */
        function updateNavLabels() {
            navItems.forEach((item) => {
                const idx = parseInt(item.dataset.idx);
                item.classList.toggle('active', idx === currentIdx);
                item.classList.toggle('done', idx < currentIdx);
            });
        }

        /* ── SCOPE CARDS ─────────────────────────────────────────── */
        document.querySelectorAll('.scope-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.scope-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                selectedScope = card.dataset.scope;
                document.getElementById('scopeInput').value = selectedScope;
                document.getElementById('scopeError').classList.remove('visible');
                document.getElementById('singlePageGroup').classList.toggle('visible', selectedScope === 'single');
                document.getElementById('multiPageGroup').classList.toggle('visible', selectedScope === 'multi');
            });
        });

        /* ── PAGE TYPE CARDS ─────────────────────────────────────── */
        document.querySelectorAll('.page-type-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.page-type-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                selectedPageType = card.dataset.type;
                document.getElementById('pageTypeInput').value = selectedPageType;
                document.getElementById('pageTypeError').classList.remove('visible');

                updateContentSlide();
            });
        });

        function updateContentSlide() {
            const type = selectedPageType || 'web';
            ['web', 'landing', 'blog'].forEach(t => {
                const el = document.getElementById('slide5n-' + t);
                if (el) el.classList.toggle('visible', t === type);
            });
        }

        /* ── PATH B: NARRATIVE FILE UPLOAD ──────────────────────── */
        let narrativeFiles = [];

        const narrativeDropzone = document.getElementById('narrativeDropzone');
        const narrativeFileInput = document.getElementById('narrativeFileInput');

        narrativeDropzone.addEventListener('dragover', e => { e.preventDefault(); narrativeDropzone.classList.add('drag-over'); });
        narrativeDropzone.addEventListener('dragleave', () => narrativeDropzone.classList.remove('drag-over'));
        narrativeDropzone.addEventListener('drop', e => {
            e.preventDefault();
            narrativeDropzone.classList.remove('drag-over');
            addNarrativeFiles(Array.from(e.dataTransfer.files));
        });
        narrativeFileInput.addEventListener('change', () => {
            addNarrativeFiles(Array.from(narrativeFileInput.files));
            narrativeFileInput.value = '';
        });

        function fmtSize(bytes) {
            if (bytes < 1024) return bytes + ' B';
            if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
            return (bytes / 1048576).toFixed(1) + ' MB';
        }

        function addNarrativeFiles(incoming) {
            incoming.forEach(f => {
                if (!narrativeFiles.find(x => x.name === f.name && x.size === f.size)) narrativeFiles.push(f);
            });
            renderNarrativeFiles();
        }

        function removeNarrativeFile(idx) {
            narrativeFiles.splice(idx, 1);
            renderNarrativeFiles();
        }

        function renderNarrativeFiles() {
            const list = document.getElementById('narrativeFileList');
            const drop = document.getElementById('narrativeDropzone');
            list.innerHTML = '';
            narrativeFiles.forEach((f, i) => {
                const item = document.createElement('div');
                item.className = 'q-file-item';
                item.innerHTML = `
                <svg class="q-file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <span class="q-file-name">${f.name}</span>
                <span class="q-file-size">${fmtSize(f.size)}</span>
                <button type="button" class="q-file-remove" onclick="removeNarrativeFile(${i})">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>`;
                list.appendChild(item);
            });
            const hasFiles = narrativeFiles.length > 0;
            const title = drop?.querySelector('.upload-title');
            if (title) {
                title.innerHTML = hasFiles
                    ? `<span>${narrativeFiles.length} file(s) ready for transit.</span>`
                    : 'Drop all narratives you have ready for processing.';
            }
            if (currentPath && currentPath[currentIdx] === 'slide-upload') {
                nextBtnText.textContent = hasFiles ? 'Send' : 'Next step';
                btnNext.classList.toggle('btn-finish', hasFiles);
                btnNext.disabled = !hasFiles;
            }
        }


        let apiPromise = null; // holds the in-flight Claude request

        async function sendNarrativeIntake() {
            if (narrativeFiles.length === 0) {
                document.getElementById('uploadFilesError').classList.add('visible');
                return;
            }
            document.getElementById('uploadFilesError').classList.remove('visible');

            btnNext.classList.add('loading');
            btnNext.disabled = true;

            const formData = new FormData();
            narrativeFiles.forEach(f => formData.append('narrativeFiles', f));
            document.querySelectorAll('input[name="narrativeLinks[]"]').forEach(el => {
                if (el.value) formData.append('narrativeLinks[]', el.value);
            });
            formData.append('uploadNotes', document.getElementById('uploadNotes').value);

            formData.append('email', document.querySelector('input[name="email"]')?.value || '');
            formData.append('leadName', document.querySelector('input[name="leadName"]')?.value || '');
            formData.append('projectName', document.querySelector('input[name="projectName"]')?.value || '');
            formData.append('scope', selectedScope || 'multi');
            formData.append('pageType', selectedPageType || '');

            // Store the promise — animation and API run in parallel
            apiPromise = fetch('/api/client-intake', { method: 'POST', body: formData })
                .then(async r => {
                    const body = await r.json().catch(() => null);
                    if (!r.ok) {
                        console.error('[intake] API error', r.status, body);
                        return { _error: true, status: r.status, detail: body?.message || body?.error || 'Unknown error' };
                    }
                    return body;
                })
                .catch(e => {
                    console.error('[intake] fetch failed', e);
                    return { _error: true, detail: e.message };
                });

            // Adjust processing labels for Single Page context
            if (selectedScope === 'single') {
                document.getElementById('procLabel2').textContent = 'Analyzing content depth';
                document.getElementById('procLabel3').textContent = 'Preparing your page review';
            } else {
                document.getElementById('procLabel2').textContent = 'Mapping pages and hierarchy';
                document.getElementById('procLabel3').textContent = 'Preparing your sitemap';
            }

            // Navigate to processing slide immediately — don't wait for API
            currentIdx = currentPath.indexOf('slide-processing');
            updateSlider();
            startProcessingAnimation();
        }

        /* ── PROCESSING ANIMATION ───────────────────────────────── */
        function startProcessingAnimation() {
            const steps = document.querySelectorAll('#processingSteps .processing-step');
            const completionTimes = [900, 2400, 4000, 5300];

            steps[0].classList.add('active');
            completionTimes.forEach((t, i) => {
                setTimeout(() => {
                    steps[i].classList.remove('active');
                    steps[i].classList.add('complete');
                    if (i < steps.length - 1) steps[i + 1].classList.add('active');
                }, t);
            });

            // After all steps visible-complete, await the API then transition
            setTimeout(async () => {
                document.getElementById('processingSub').textContent = 'Almost there…';

                // Wait for Gemini — could be longer than the animation
                let apiData = null;
                try { apiData = await apiPromise; } catch (e) { console.error('[intake] await failed', e); }

                if (apiData && apiData._error) {
                    document.getElementById('processingTitle').textContent = 'Something went wrong.';
                    document.getElementById('processingSub').textContent = apiData.detail || 'The file analysis failed. Please try again.';
                    document.getElementById('processingRing').style.display = 'none';
                    return;
                }

                if (apiData && apiData.isFallback) {
                    document.getElementById('processingTitle').textContent = 'Files received.';
                    document.getElementById('processingSub').textContent = 'We\'ll review your narrative and send you a production link within 24 hours.';
                    document.getElementById('processingRing').style.display = 'none';
                    document.getElementById('processingDoneCheck').classList.add('visible');
                    return;
                }

                document.getElementById('processingTitle').textContent = selectedScope === 'single' ? 'Narrative ready.' : 'Sitemap ready.';
                document.getElementById('processingSub').textContent = 'Opening your review now.';
                document.getElementById('processingRing').style.display = 'none';
                document.getElementById('processingDoneCheck').classList.add('visible');

                setTimeout(() => {
                    buildSitemapFromFiles(apiData);
                    updateSlider();
                }, 800);
            }, 5800);
        }


/* ── SEGMENT 2: FORM WIDGETS, VALIDATION, SUBMIT ─────────────────── */

        /* ── SKIP BRAND ASSETS (returning client) ───────────────── */
        function skipBrandAssets() {
            currentIdx++;
            updateSlider();
            updateNavLabels();
        }
        function skipVisualRefs() {
            currentIdx++;
            updateSlider();
            updateNavLabels();
        }

        /* ── BRAND STATUS CARDS ──────────────────────────────────── */
        document.querySelectorAll('.brand-status-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.brand-status-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                selectedBrandStatus = card.dataset.status;
                document.getElementById('brandStatusInput').value = selectedBrandStatus;
                document.getElementById('brandStatusError').classList.remove('visible');
                const assetsGroup = document.getElementById('brandAssetsGroup');
                const partialGroup = document.getElementById('partialAssetsGroup');
                if (assetsGroup) assetsGroup.classList.toggle('visible', selectedBrandStatus === 'full' || selectedBrandStatus === 'partial');
                if (partialGroup) partialGroup.classList.toggle('visible', selectedBrandStatus === 'partial');
            });
        });

        /* ── PATH CARDS ──────────────────────────────────────────── */
        document.querySelectorAll('.path-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.path-option').forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
                selectedPath = option.dataset.path;
                document.getElementById('pathInput').value = selectedPath;
                document.getElementById('pathError').classList.remove('visible');
                currentPath = selectedPath === 'strategy' ? STRATEGY_PATH
                    : (selectedScope === 'single' ? SINGLE_NARRATIVE_PATH : NARRATIVE_PATH);
            });
        });

        /* ── SIDEBAR REBUILD ON PATH SELECT ─────────────────────── */
        function updateSidebarForPath(path) {
            const steps = path === 'strategy'
                ? ['Sources', 'Competition', 'Audience', 'Conversion']
                : ['Upload your narrative'];
            const startIndex = 5;
            const navList = document.getElementById('navList');
            navList.innerHTML = steps.map((label, i) =>
                `<li class="q-nav-item" data-idx="${i + startIndex}">
                <span class="bar"></span><span class="nav-label">${label}</span>
            </li>`
            ).join('');
            navItems = document.querySelectorAll('.q-nav-item');
            updateNavLabels();
            if (path === 'strategy') {
                document.querySelector('.q-h1').innerHTML = "Let's build<br>your narrative";
                document.querySelector('.q-sidebar-instruction').textContent = 'Raw facts only. We need technical evidence and market reality.';
            } else if (selectedScope === 'single') {
                document.querySelector('.q-h1').innerHTML = 'Page<br>Handover';
                document.querySelector('.q-sidebar-instruction').textContent = 'Upload your page narrative. We extract every section and map the content.';
            } else {
                document.querySelector('.q-h1').innerHTML = 'Narrative<br>Handover';
                document.querySelector('.q-sidebar-instruction').textContent = 'Upload what you have. We extract the structure and map everything.';
            }
        }

        /* ── DYNAMIC ROW FACTORY ─────────────────────────────────── */
        /*
         * Unified factory for all dynamic input rows across the intake form.
         *
         * config = {
         *   inputName      : string | null  — name attr; null = no name (ref links)
         *   placeholder    : string
         *   typeName       : string | null  — hidden field name; null = no hidden field
         *   typeInitial    : string         — initial value for hidden field
         *   analyzeMsg     : string | null  — null = simple row (no feedback UI)
         *   categorize     : fn(val)→string | null — classify the input value
         *   showCategory   : boolean        — show category label in feedback after commit
         *   keepAtLeastOne : boolean        — if last row and empty, don't remove
         *   listSelector   : string | null  — CSS selector for keepAtLeastOne check
         *   onCommit       : fn | null      — side effect called after commit
         *   timeout        : number         — ms before commit fires (default 1200)
         * }
         *
         * Rows without analyzeMsg use a simple div.progression-row structure.
         * Rows with analyzeMsg use div.progression-row-wrapper with agent feedback.
         */
        function createDynamicRow({
            inputName      = null,
            placeholder    = '',
            typeName       = null,
            typeInitial    = '',
            analyzeMsg     = null,
            categorize     = null,
            showCategory   = false,
            keepAtLeastOne = false,
            listSelector   = null,
            onCommit       = null,
            timeout        = 1200,
        } = {}) {
            const nameAttr = inputName ? `name="${inputName}"` : '';

            if (!analyzeMsg) {
                const row = document.createElement('div');
                row.className = 'progression-row';
                row.innerHTML = `
                <input type="text" ${nameAttr} placeholder="${placeholder}">
                <div class="link-row-actions">
                    <button type="button" class="btn-row-action" onclick="this.closest('.progression-row').remove()" title="Remove">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>`;
                return row;
            }

            const typeHtml = typeName
                ? `<input type="hidden" name="${typeName}" class="dyn-type-input" value="${typeInitial}">`
                : '';

            const wrapper = document.createElement('div');
            wrapper.className = 'progression-row-wrapper';
            wrapper.innerHTML = `
            <div class="progression-row">
                <input type="text" ${nameAttr} placeholder="${placeholder}">
                ${typeHtml}
                <div class="link-row-actions">
                    <button type="button" class="btn-row-action btn-delete" title="Remove" style="display:none;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                </div>
            </div>
            <div class="agent-feedback">
                <div class="loading-pulse"></div>
                <div class="agent-msg">${analyzeMsg}</div>
            </div>`;

            const inputSel  = inputName ? `input[name="${inputName}"]` : 'input[type="text"]';
            const input     = wrapper.querySelector(inputSel);
            const typeInput = typeName ? wrapper.querySelector('.dyn-type-input') : null;
            const deleteBtn = wrapper.querySelector('.btn-delete');
            const pulse     = wrapper.querySelector('.loading-pulse');
            const feedback  = wrapper.querySelector('.agent-feedback');

            input.addEventListener('blur', function () {
                const val = input.value.trim().toLowerCase();
                if (val !== '') {
                    feedback.classList.add('active');
                    pulse.style.display = 'inline-block';
                    setTimeout(() => {
                        const cat = categorize ? categorize(val) : null;
                        if (typeInput && cat) typeInput.value = cat;
                        pulse.style.display = 'none';
                        if (showCategory && cat) {
                            feedback.querySelector('.agent-msg').textContent = cat;
                            feedback.classList.add('active');
                        } else {
                            feedback.classList.remove('active');
                        }
                        input.disabled = true;
                        input.style.opacity = '0.5';
                        deleteBtn.style.display = 'flex';
                        if (onCommit) onCommit();
                    }, timeout);
                } else {
                    if (keepAtLeastOne && listSelector) {
                        const allRows = document.querySelectorAll(`${listSelector} .progression-row-wrapper`);
                        if (allRows.length > 1) wrapper.remove();
                    } else {
                        wrapper.remove();
                    }
                }
            });
            input.addEventListener('keypress', e => { if (e.key === 'Enter') { e.preventDefault(); input.blur(); } });
            deleteBtn.addEventListener('click', () => wrapper.remove());
            return wrapper;
        }

        /* ── REFERENCE LINKS ─────────────────────────────────────── */
        const refList = document.getElementById('refLinksList');
        refList.appendChild(createDynamicRow({ placeholder: 'URL o brand name' }));
        document.getElementById('addRefLinkBtn').addEventListener('click', () => {
            document.getElementById('addRefLinkBtn').classList.add('has-links');
            refList.appendChild(createDynamicRow({ placeholder: 'URL o brand name' }));
            refList.lastElementChild.querySelector('input').focus();
        });

        /* ── LOGO UPLOAD ─────────────────────────────────────────── */
        const logoInput = document.getElementById('logoFileInput');
        const logoList = document.getElementById('logoFileList');
        const logoDrop = document.getElementById('logoDropZone');

        function renderLogoList() {
            logoList.innerHTML = '';
            logoFiles.forEach((f, i) => {
                const item = document.createElement('div');
                item.className = 'q-file-item';
                item.innerHTML = `
                <svg class="q-file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <span class="q-file-name">${f.name}</span>
                <span class="q-file-size">${fmtSize(f.size)}</span>
                <button type="button" class="q-file-remove" onclick="logoFiles.splice(${i},1);renderLogoList()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>`;
                logoList.appendChild(item);
            });
        }
        logoInput.addEventListener('change', e => { logoFiles = [...logoFiles, ...Array.from(e.target.files)]; renderLogoList(); });
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(ev => logoDrop.addEventListener(ev, e => e.preventDefault()));
        logoDrop.addEventListener('dragover', () => logoDrop.classList.add('dragover'));
        logoDrop.addEventListener('dragleave', () => logoDrop.classList.remove('dragover'));
        logoDrop.addEventListener('drop', e => { logoFiles = [...logoFiles, ...Array.from(e.dataTransfer.files)]; logoDrop.classList.remove('dragover'); renderLogoList(); });

        /* ── SOURCES FILE UPLOAD ────────────────────────────────── */
        let sourceFiles = [];
        const sourcesInput = document.getElementById('sourcesFileInput');
        const sourcesDrop = document.getElementById('sourcesDropZone');
        const sourcesListEl = document.getElementById('sourcesFileList');

        function renderSourcesList() {
            sourcesListEl.innerHTML = '';
            sourceFiles.forEach((f, i) => {
                const item = document.createElement('div');
                item.className = 'q-file-item';
                item.innerHTML = `
                <svg class="q-file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <span class="q-file-name">${f.name}</span>
                <span class="q-file-size">${fmtSize(f.size)}</span>
                <button type="button" class="q-file-remove" onclick="sourceFiles.splice(${i},1);renderSourcesList()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>`;
                sourcesListEl.appendChild(item);
            });
            const title = sourcesDrop.querySelector('.upload-title');
            if (title) {
                title.innerHTML = sourceFiles.length === 0
                    ? 'Click to upload or <span>drag & drop</span> project files'
                    : `<span>${sourceFiles.length} file(s) ready for transit.</span>`;
            }
        }
        if (sourcesInput) {
            sourcesInput.addEventListener('change', e => { sourceFiles = [...sourceFiles, ...Array.from(e.target.files)]; renderSourcesList(); });
        }
        if (sourcesDrop) {
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(ev => sourcesDrop.addEventListener(ev, e => e.preventDefault()));
            sourcesDrop.addEventListener('dragover', () => sourcesDrop.classList.add('dragover'));
            sourcesDrop.addEventListener('dragleave', () => sourcesDrop.classList.remove('dragover'));
            sourcesDrop.addEventListener('drop', e => { sourceFiles = [...sourceFiles, ...Array.from(e.dataTransfer.files)]; sourcesDrop.classList.remove('dragover'); renderSourcesList(); });
        }

        /* ── SOURCE EVIDENCE LINKS ───────────────────────────────── */
        const SOURCE_CATS = val =>
            val.includes('notion') || val.includes('docs') || val.includes('slack') || val.includes('confluence') ? 'Technical Source' :
            val.includes('linkedin') || val.includes('crunchbase') || val.includes('statista') ? 'Market Context' :
            val.includes('youtube') || val.includes('loom') || val.includes('vimeo') ? 'Recording' :
            'Strategic Evidence';

        const sourceLinksListEl = document.getElementById('sourceLinksList');
        const addSourceLinkBtn  = document.getElementById('addSourceLinkBtn');
        if (addSourceLinkBtn && sourceLinksListEl) {
            addSourceLinkBtn.addEventListener('click', function (e) {
                e.preventDefault();
                this.classList.add('has-links');
                const row = createDynamicRow({
                    inputName:   'sourceLinks[]',
                    typeName:    'sourceLinkTypes[]',
                    typeInitial: 'General',
                    placeholder: 'Any link you think we should consider',
                    analyzeMsg:  'Analyzing source...',
                    categorize:  SOURCE_CATS,
                });
                sourceLinksListEl.appendChild(row);
                row.querySelector('input').focus();
            });
        }

        /* ── NARRATIVE LINKS ─────────────────────────────────────── */
        const narrativeLinksListEl = document.getElementById('narrativeLinksList');
        const addNarrativeLinkBtn  = document.getElementById('addNarrativeLinkBtn');
        if (addNarrativeLinkBtn && narrativeLinksListEl) {
            addNarrativeLinkBtn.addEventListener('click', function (e) {
                e.preventDefault();
                this.classList.add('has-links');
                const row = createDynamicRow({
                    inputName:   'narrativeLinks[]',
                    typeName:    'narrativeLinkTypes[]',
                    typeInitial: 'Link',
                    placeholder: 'Any link you think we should consider',
                    analyzeMsg:  'Analyzing link...',
                    onCommit: () => {
                        if (currentPath && currentPath[currentIdx] === 'slide-upload') {
                            nextBtnText.textContent = 'Send';
                            btnNext.classList.add('btn-finish');
                            btnNext.disabled = false;
                        }
                    },
                });
                narrativeLinksListEl.appendChild(row);
                row.querySelector('input').focus();
            });
        }

        /* ── ST-COMPETITION COMPETITOR ROWS ─────────────────────── */
        const COMP_CATS = val =>
            val.includes('agency') || val.includes('studio') || val.includes('creative') ? 'Agency Reference' :
            val.includes('saas') || val.includes('app') || val.includes('software') ? 'Product Competitor' :
            val.includes('blog') || val.includes('media') || val.includes('magazine') ? 'Content Competitor' :
            'Direct Competitor';

        const stCompRowConfig = {
            inputName:      'stCompetitors[]',
            typeName:       'stCompetitorTypes[]',
            typeInitial:    '',
            placeholder:    'Competitor name or URL',
            analyzeMsg:     'Analyzing competitor...',
            categorize:     COMP_CATS,
            showCategory:   true,
            keepAtLeastOne: true,
            listSelector:   '#stCompetitorList',
            timeout:        1000,
        };

        const stCompList = document.getElementById('stCompetitorList');
        if (stCompList) {
            stCompList.appendChild(createDynamicRow(stCompRowConfig));
            document.getElementById('addStCompetitorBtn').addEventListener('click', () => {
                document.getElementById('addStCompetitorBtn').classList.add('has-links');
                const row = createDynamicRow(stCompRowConfig);
                stCompList.appendChild(row);
                row.querySelector('input').focus();
            });
        }

        /* ── COMPETITOR ROWS ─────────────────────────────────────── */
        const compList = document.getElementById('competitorList');
        if (compList) {
            compList.appendChild(createDynamicRow({ inputName: 'competitors[]', placeholder: 'Competitor name or URL' }));
            document.getElementById('addCompetitorBtn')?.addEventListener('click', () => {
                document.getElementById('addCompetitorBtn').classList.add('has-links');
                compList.appendChild(createDynamicRow({ inputName: 'competitors[]', placeholder: 'Competitor name or URL' }));
                compList.lastElementChild.querySelector('input').focus();
            });
        }

        /* ── TAG INPUT (TONE) ────────────────────────────────────── */
        function initTagInput(wrapId, inputId, hiddenId, max) {
            const wrap = document.getElementById(wrapId);
            const input = document.getElementById(inputId);
            const hidden = document.getElementById(hiddenId);
            if (!wrap || !input || !hidden) return;
            let tags = [];
            function render() {
                wrap.querySelectorAll('.tag-chip').forEach(c => c.remove());
                tags.forEach((t, i) => {
                    const chip = document.createElement('span');
                    chip.className = 'tag-chip';
                    chip.innerHTML = `${t}<button onclick="(function(){tags.splice(${i},1);render();})()">&times;</button>`;
                    wrap.insertBefore(chip, input);
                });
                hidden.value = tags.join(', ');
                input.style.display = tags.length >= max ? 'none' : '';
            }
            input.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    const val = input.value.trim().replace(/,$/, '');
                    if (val && tags.length < max && !tags.includes(val)) { tags.push(val); input.value = ''; render(); }
                }
            });
            render();
        }
        initTagInput('tonePositiveTags', 'tonePositiveInput', 'tonePositiveValue', 3);
        initTagInput('toneNegativeTags', 'toneNegativeInput', 'toneNegativeValue', 3);

        /* ── WORD COUNTERS ───────────────────────────────────────── */
        function initWordCounter(inputEl, max, counterEl) {
            function update() {
                const words = inputEl.value.trim() === '' ? 0 : inputEl.value.trim().split(/\s+/).length;
                counterEl.textContent = words + ' / ' + max + ' words';
                counterEl.classList.toggle('warn', words >= Math.floor(max * 0.8) && words <= max);
                counterEl.classList.toggle('over', words > max);
            }
            inputEl.addEventListener('input', update);
            update();
        }
        [
            ['productDesc', 40, 'productDescCounter'],
            ['audience', 40, 'audienceCounter'],
            ['coreProblem', 40, 'coreProblemCounter'],
            ['costOfInaction', 30, 'costOfInactionCounter'],
            ['ctaObjective', 20, 'ctaObjectiveCounter'],
            ['heroH1', 10, 'heroH1Counter'],
            ['heroSubhead', 20, 'heroSubheadCounter'],
            ['solutionH2', 8, 'solutionH2Counter'],
            ['solutionBody', 40, 'solutionBodyCounter'],
            ['evidence1', 20, 'evidence1Counter'],
            ['evidence2', 20, 'evidence2Counter'],
            ['evidence3', 20, 'evidence3Counter'],
            ['quoteText', 50, 'quoteTextCounter'],
        ].forEach(([id, max, cid]) => {
            const el = document.getElementById(id);
            const ce = document.getElementById(cid);
            if (el && ce) initWordCounter(el, max, ce);
        });

        /* ── SECTION BUILDER ─────────────────────────────────────── */
        function createSectionRow(count, bodyMax, bodyPlaceholder) {
            const row = document.createElement('div');
            row.className = 'section-row';
            const countId = 'sc-body-' + count + '-' + Date.now();
            row.innerHTML = `
            <span class="section-row-label">Section</span>
            <button type="button" class="section-row-remove" title="Remove">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div class="form-group">
                <label>Section name</label>
                <input type="text" name="sections[][name]" placeholder="e.g., The Problem, Our Process, Results, Testimonial" required>
            </div>
            <div class="form-group field-with-counter">
                <label>Headline <span class="field-limit">— max 8 words</span></label>
                <input type="text" name="sections[][headline]" placeholder="The core statement of this section." required>
                <div class="word-counter" id="wc-h-${count}">0 / 8 words</div>
            </div>
            <div class="form-group field-with-counter">
                <label>Body <span class="field-limit">— max ${bodyMax} words</span></label>
                <textarea name="sections[][body]" id="${countId}" rows="3" placeholder="${bodyPlaceholder}" required></textarea>
                <div class="word-counter" id="wc-b-${count}">0 / ${bodyMax} words</div>
            </div>`;
            const hInput = row.querySelector('input[name="sections[][headline]"]');
            const hCounter = row.querySelector(`#wc-h-${count}`);
            const bInput = row.querySelector('textarea');
            const bCounter = row.querySelector(`#wc-b-${count}`);
            if (hInput && hCounter) initWordCounter(hInput, 8, hCounter);
            if (bInput && bCounter) initWordCounter(bInput, bodyMax, bCounter);
            row.querySelector('.section-row-remove').addEventListener('click', () => {
                row.remove(); sectionCount--;
                document.getElementById('sectionsLimitNote').style.display = 'none';
                document.getElementById('addSectionBtn').style.display = 'flex';
            });
            return row;
        }

        function createBlogSectionRow(count) {
            const row = document.createElement('div');
            row.className = 'section-row';
            row.innerHTML = `
            <span class="section-row-label">Argument</span>
            <button type="button" class="section-row-remove" title="Remove">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div class="form-group field-with-counter">
                <label>Argument headline <span class="field-limit">— max 10 words</span></label>
                <input type="text" name="blogArgs[][headline]" placeholder="State the argument as a declaration." required>
                <div class="word-counter" id="bwc-h-${count}">0 / 10 words</div>
            </div>
            <div class="form-group field-with-counter">
                <label>Development <span class="field-limit">— max 80 words</span></label>
                <textarea name="blogArgs[][body]" rows="4" placeholder="Develop the argument with evidence or reasoning." required></textarea>
                <div class="word-counter" id="bwc-b-${count}">0 / 80 words</div>
            </div>`;
            const hInput = row.querySelector('input');
            const hCounter = row.querySelector(`#bwc-h-${count}`);
            const bInput = row.querySelector('textarea');
            const bCounter = row.querySelector(`#bwc-b-${count}`);
            if (hInput && hCounter) initWordCounter(hInput, 10, hCounter);
            if (bInput && bCounter) initWordCounter(bInput, 80, bCounter);
            row.querySelector('.section-row-remove').addEventListener('click', () => {
                row.remove(); blogSectionCount--;
                document.getElementById('blogSectionsLimitNote').style.display = 'none';
                document.getElementById('addBlogSectionBtn').style.display = 'flex';
            });
            return row;
        }

        function initSectionBuilder() {
            const builder = document.getElementById('sectionBuilder');
            if (!builder) return;
            builder.innerHTML = '';
            sectionCount = 0;
            for (let i = 0; i < MIN_SECTIONS; i++) {
                sectionCount++;
                builder.appendChild(createSectionRow(sectionCount, 50, 'Support the headline with specific, concrete details.'));
            }
        }

        function initBlogBuilder() {
            const builder = document.getElementById('blogSectionBuilder');
            if (!builder) return;
            builder.innerHTML = '';
            blogSectionCount = 0;
            for (let i = 0; i < MIN_SECTIONS; i++) {
                blogSectionCount++;
                builder.appendChild(createBlogSectionRow(blogSectionCount));
            }
        }

        document.getElementById('addSectionBtn')?.addEventListener('click', () => {
            if (sectionCount >= MAX_SECTIONS) return;
            sectionCount++;
            document.getElementById('sectionBuilder').appendChild(createSectionRow(sectionCount, 50, 'Support the headline with specific, concrete details.'));
            if (sectionCount >= MAX_SECTIONS) {
                document.getElementById('sectionsLimitNote').style.display = 'block';
                document.getElementById('addSectionBtn').style.display = 'none';
            }
        });

        document.getElementById('addBlogSectionBtn')?.addEventListener('click', () => {
            if (blogSectionCount >= MAX_SECTIONS) return;
            blogSectionCount++;
            document.getElementById('blogSectionBuilder').appendChild(createBlogSectionRow(blogSectionCount));
            if (blogSectionCount >= MAX_SECTIONS) {
                document.getElementById('blogSectionsLimitNote').style.display = 'block';
                document.getElementById('addBlogSectionBtn').style.display = 'none';
            }
        });

        initSectionBuilder();
        initBlogBuilder();

        /* ── SOCIAL PROOF TABS ───────────────────────────────────── */
        document.querySelectorAll('.proof-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.proof-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.proof-fields').forEach(f => f.classList.remove('active'));
                tab.classList.add('active');
                const proofType = tab.dataset.proof;
                document.getElementById('proof-' + proofType).classList.add('active');
                document.getElementById('proofTypeInput').value = proofType;
                const req = ['quote'];
                document.querySelectorAll('#proof-quote [required]').forEach(el => {
                    el.required = proofType === 'quote';
                });
            });
        });

        /* ── VALIDATION ──────────────────────────────────────────── */
        function flash(el) {
            const orig = el.style.borderBottomColor;
            el.style.borderBottomColor = '#cc0000';
            setTimeout(() => el.style.borderBottomColor = orig, 2000);
        }

        function validateSlide(idx) {
            const slideId = currentPath[idx];
            const slide = document.getElementById(slideId);
            if (!slide) return true;

            // Code entry: must activate a code or skip
            if (slideId === 'slide-code') {
                const err = document.getElementById('codeError');
                err.textContent = 'Please activate a project code or click "I don\'t have a code" to continue.';
                err.classList.add('visible');
                return false;
            }

            // Pages confirm: always valid (data is read-only)
            if (slideId === 'slide-pages-confirm') return true;

            // Page objectives: always valid (all fields optional)
            if (slideId === 'slide-page-obj') return true;
            if (slideId === 'slide-welcome') return true;

            // Slide 0: basics only
            if (slideId === 'slide-0') {
                const required = slide.querySelectorAll('input[required], textarea[required]');
                let valid = true;
                required.forEach(el => { if (!el.value.trim()) { flash(el); valid = false; } });
                return valid;
            }

            // Slide scope: scope + page type / sitemap
            if (slideId === 'slide-scope') {
                let valid = true;
                if (!selectedScope) {
                    document.getElementById('scopeError').classList.add('visible');
                    valid = false;
                }
                if (selectedScope === 'single' && !selectedPageType) {
                    document.getElementById('pageTypeError').classList.add('visible');
                    valid = false;
                }
                return valid;
            }

            // Slide 1: at least 2 ref URLs
            if (slideId === 'slide-1') {
                const filled = Array.from(document.querySelectorAll('#refLinksList input')).filter(i => i.value.trim()).length;
                if (filled < 1) { document.getElementById('refLinksError').classList.add('visible'); return false; }
                document.getElementById('refLinksError').classList.remove('visible');
                return true;
            }

            // Slide 2: brand status required
            if (slideId === 'slide-2') {
                if (!selectedBrandStatus) { document.getElementById('brandStatusError').classList.add('visible'); return false; }
                return true;
            }

            // Slide 3: path required
            if (slideId === 'slide-3') {
                if (!selectedPath) { document.getElementById('pathError').classList.add('visible'); return false; }
                return true;
            }

            // Sources slide: fully optional — files and links are supplemental
            if (slideId === 'slide-sources') return true;

            // All other slides: standard required fields
            const required = slide.querySelectorAll('[required]');
            let valid = true;
            required.forEach(el => {
                const visible = el.offsetParent !== null;
                if (visible && !el.value.trim()) { flash(el); valid = false; }
            });
            return valid;
        }

        /* ── SUBMIT ──────────────────────────────────────────────── */
        async function submitIntake() {
            btnNext.classList.add('loading');
            btnNext.disabled = true;

            // Show appropriate confirmation roadmap
            document.getElementById('strategyRoadmap').style.display = selectedPath === 'strategy' ? 'flex' : 'none';
            document.getElementById('narrativeRoadmap').style.display = selectedPath === 'narrative' ? 'flex' : 'none';

            const formData = new FormData();
            allSlides.forEach(s => {
                s.querySelectorAll('input, textarea, select').forEach(el => {
                    if (el.name && el.value) formData.append(el.name, el.value);
                });
            });
            logoFiles.forEach(f => formData.append('logoFiles', f));
            sourceFiles.forEach(f => formData.append('sourceFiles', f));
            formData.append('intakePath', selectedPath);
            formData.append('pageType', selectedPageType || '');
            formData.append('scope', selectedScope);

            // Passport fields not present in visible form inputs
            if (projectPassport) {
                formData.append('email',       projectPassport.clientEmail  || '');
                formData.append('leadName',    projectPassport.leadName     || '');
                formData.append('projectName', projectPassport.projectName  || '');
                formData.append('projectCode', projectPassport.code         || '');
                formData.append('scenario',    projectPassport.scenario     || 'A');
            }

            // Collect page objectives
            const pageObjectives = [];
            document.querySelectorAll('#pageObjContainer textarea[data-page]').forEach(ta => {
                if (ta.value.trim()) {
                    pageObjectives.push({ page: ta.dataset.page, objective: ta.value.trim() });
                }
            });
            if (pageObjectives.length > 0) {
                formData.append('pageObjectives', JSON.stringify(pageObjectives));
            }

            // Collect visual references (inputs have no name attribute)
            const visualRefs = Array.from(document.querySelectorAll('#refLinksList input'))
                .map(i => i.value.trim()).filter(Boolean);
            if (visualRefs.length > 0) {
                formData.append('visualRefs', JSON.stringify(visualRefs));
            }

            // Collect competitors (dynamic inputs)
            const competitors = Array.from(document.querySelectorAll('#stCompetitorList input'))
                .map(i => i.value.trim()).filter(Boolean);
            if (competitors.length > 0) {
                formData.append('competitorsList', JSON.stringify(competitors));
            }

            const minDelay = new Promise(r => setTimeout(r, 1200));
            try {
                const [res] = await Promise.all([
                    fetch('/api/client-intake', { method: 'POST', body: formData }),
                    minDelay
                ]);
                currentIdx = currentPath.length - 1;
                updateSlider();
            } catch (err) {
                currentIdx = currentPath.length - 1;
                updateSlider();
            } finally {
                btnNext.classList.remove('loading');
                btnNext.disabled = false;
            }
        }
