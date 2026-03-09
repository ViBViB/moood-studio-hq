/**
 * Moood Studio Observer v1.0
 * Lightweight telemetry script for Conversion Rate Optimization.
 * 
 * Captures:
 * 1. Global Click Events (Buttons, CTAs, Links)
 * 2. Maximum Scroll Depth (Quartiles)
 * 3. Element Dwell Time (Viewport intersection)
 */

(function () {
    const mooodObserver = {
        sessionId: crypto.randomUUID(),
        url: window.location.pathname,
        data: {
            clicks: [],
            scrollDepth: 0,
            dwell: {}
        },

        init() {
            console.log(`[Moood Observer] Initialized -> Session ID: ${this.sessionId}`);
            this.trackClicks();
            this.trackScrollDepth();
            this.trackDwellTime();
            this.setupBeacon();
        },

        trackClicks() {
            document.addEventListener('click', (e) => {
                const target = e.target.closest('a, button, [role="button"], .btn-explore, .cta-btn, .btn-hts');
                if (!target) return;

                const event = {
                    time: Date.now(),
                    action: 'click',
                    elementType: target.tagName,
                    elementClass: target.className,
                    targetText: target.innerText?.trim().substring(0, 30) || 'no-text',
                    href: target.href || null
                };

                this.data.clicks.push(event);
                console.log('[Moood Observer] Click Captured:', event);
            });
        },

        trackScrollDepth() {
            let maxScroll = 0;
            const scrollMarks = [25, 50, 75, 90, 100];
            const triggered = new Set();

            window.addEventListener('scroll', () => {
                const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                if (docHeight <= 0) return;

                const scrollPercent = Math.round((window.scrollY / docHeight) * 100);
                if (scrollPercent > maxScroll) {
                    maxScroll = scrollPercent;
                    this.data.scrollDepth = maxScroll;
                }

                scrollMarks.forEach(mark => {
                    if (maxScroll >= mark && !triggered.has(mark)) {
                        triggered.add(mark);
                        console.log(`[Moood Observer] Scroll Depth Reached: ${mark}%`);
                    }
                });
            }, { passive: true });
        },

        trackDwellTime() {
            // Observe main structural sections to see where users spend time
            const sections = document.querySelectorAll('section, header, footer, .hero-section, .text-block-section');
            if (!sections.length) return;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    const selector = entry.target.id || entry.target.className.split(' ')[0] || entry.target.tagName.toLowerCase();

                    if (entry.isIntersecting) {
                        this.data.dwell[selector] = {
                            start: Date.now(),
                            totalMs: this.data.dwell[selector]?.totalMs || 0
                        };
                    } else {
                        if (this.data.dwell[selector]?.start) {
                            const duration = Date.now() - this.data.dwell[selector].start;
                            this.data.dwell[selector].totalMs += duration;
                            delete this.data.dwell[selector].start;
                            console.log(`[Moood Observer] Dwell on [${selector}]: ${(this.data.dwell[selector].totalMs / 1000).toFixed(1)}s`);
                        }
                    }
                });
            }, { threshold: 0.5 }); // Trigger when 50% of the section is visible

            sections.forEach(sec => observer.observe(sec));
        },

        setupBeacon() {
            // Send data when user leaves the page or refreshes
            window.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'hidden') {
                    const payload = JSON.stringify({
                        session: this.sessionId,
                        url: this.url,
                        metrics: this.data
                    });

                    console.log(`[Moood Observer] 📤 Sending telemetry to KV database...`);

                    // Use fetch with keepalive to reliably send JSON before the page unloads
                    fetch('/api/telemetry', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: payload,
                        keepalive: true
                    }).catch(err => console.error('[Moood Observer] Error sending telemetry:', err));
                }
            });
        }
    };

    // Run automatically parsing completion
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => mooodObserver.init());
    } else {
        mooodObserver.init();
    }
})();
