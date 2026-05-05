/* ── INIT ────────────────────────────────────────────────── */
updateSlider();
updateContentSlide();

/* ── DEMO MODE (?demo or ?demo=single — skip to review) ── */
const _demoParam = new URLSearchParams(window.location.search).get('demo');
if (_demoParam === 'single') {
    // Scenario C demo — single page review
    const demoSingle = {
        scope: 'single',
        pages: [{
            id: 'page-0', name: 'Growth Solutions', type: 'Landing Page', flags: 1, missing: false,
            headline: '"Accelerate what\'s already working."',
            summary: 'Hero with headline, sub-headline, and primary CTA. Three-column service breakdown with stats. Case study highlight with client logo and result metric. Final CTA to book a call.',
            flagText: 'No social proof or testimonials found — page lacks third-party validation.',
            sections: [
                { name: 'Hero', items: [{ label: 'Headline', value: 'Accelerate what\'s already working.' }, { label: 'Sub-headline', value: 'Data-led growth strategy for ambitious brands.' }, { label: 'CTA', value: 'Book a strategy call' }] },
                { name: 'Services', items: [{ label: 'List item', value: 'Paid Media & Performance' }, { label: 'List item', value: 'Conversion Rate Optimization' }, { label: 'List item', value: 'Growth Analytics' }] },
                { name: 'Results', items: [{ label: 'Stat', value: '+340% ROAS in 90 days' }, { label: 'Stat', value: '2.8× LTV improvement' }] },
                { name: 'CTA', items: [{ label: 'Headline', value: 'Ready to scale?' }, { label: 'CTA', value: 'Let\'s talk' }] }
            ],
            children: []
        }]
    };
    selectedScope = 'single';
    currentPath = SINGLE_NARRATIVE_PATH;
    buildSitemapFromFiles(demoSingle);
    updateSlider();
} else if (_demoParam !== null) {
    const demoData = {
        hasNavDefinition: true,
        pages: [{
            id: 'page-0', name: 'Homepage', type: 'Homepage', flags: 0, missing: false,
            headline: '"We help brands grow faster, smarter."',
            summary: 'Hero with headline, sub-headline, and primary CTA. Value proposition section with three proof points. Client logos strip.',
            flagText: null, sections: [
                { name: 'Hero', items: [{ label: 'Headline', value: 'We help brands grow faster, smarter.' }, { label: 'CTA', value: 'See our work' }] },
                { name: 'Value Proposition', items: [{ label: 'Body', value: 'From strategy to execution, we close the gap between ambition and results.' }] }
            ],
            children: [
                {
                    id: 'page-0-0', name: 'What We Do', type: 'Category', flags: 0, missing: false,
                    headline: '"Services built for scale."', summary: 'Overview of agency capabilities. Three service pillars with supporting copy.',
                    flagText: null, sections: [], children: [
                        { id: 'page-0-0-0', name: 'Growth Solutions', type: 'Web Page', flags: 0, missing: false, headline: '"Accelerate what\'s already working."', summary: 'Growth strategy, paid media, and conversion optimization services. Includes a case study highlight and CTA to book a call.', flagText: null, sections: [{ name: 'Hero', items: [{ label: 'Headline', value: 'Accelerate what\'s already working.' }, { label: 'Sub-headline', value: 'Data-led growth strategy for ambitious brands.' }] }], children: [] },
                        { id: 'page-0-0-1', name: 'Marketing Solutions', type: 'Web Page', flags: 1, missing: false, headline: null, summary: 'Campaign strategy and channel management. Missing a clear CTA and proof section.', flagText: 'No CTA or proof points found — page risks low conversion.', sections: [], children: [] },
                        { id: 'page-0-0-2', name: 'Services', type: 'Web Page', flags: 0, missing: true, headline: null, summary: null, flagText: null, sections: [], children: [] }
                    ]
                },
                {
                    id: 'page-0-1', name: 'Work', type: 'Category', flags: 0, missing: false,
                    headline: '"Work that speaks."', summary: 'Portfolio overview with filterable case studies. Intro copy + grid of recent projects.',
                    flagText: null, sections: [], children: [
                        { id: 'page-0-1-0', name: 'Case Studies', type: 'Web Page', flags: 0, missing: true, headline: null, summary: null, flagText: null, sections: [], children: [] },
                        { id: 'page-0-1-1', name: 'Testimonials', type: 'Web Page', flags: 0, missing: true, headline: null, summary: null, flagText: null, sections: [], children: [] }
                    ]
                },
                {
                    id: 'page-0-2', name: 'About', type: 'Web Page', flags: 0, missing: false,
                    headline: '"Built by practitioners, not theorists."', summary: 'Company story, team bios, and culture section. Ends with an open roles CTA.',
                    flagText: null, sections: [{ name: 'Hero', items: [{ label: 'Headline', value: 'Built by practitioners, not theorists.' }] }, { name: 'Team', items: [{ label: 'Body', value: 'A team of strategists, creatives, and engineers who have done this before.' }] }],
                    children: [
                        { id: 'page-0-2-0', name: 'Leadership', type: 'Web Page', flags: 0, missing: false, headline: '"The people behind the work."', summary: 'Full leadership team with photos and bios.', flagText: null, sections: [], children: [] },
                        { id: 'page-0-2-1', name: 'Culture', type: 'Web Page', flags: 0, missing: true, headline: null, summary: null, flagText: null, sections: [], children: [] },
                        { id: 'page-0-2-2', name: 'Careers', type: 'Web Page', flags: 0, missing: true, headline: null, summary: null, flagText: null, sections: [], children: [] }
                    ]
                },
                {
                    id: 'page-0-3', name: 'Thinking', type: 'Blog', flags: 0, missing: false,
                    headline: '"Ideas worth acting on."', summary: 'Editorial hub with articles on growth, brand, and culture. Featured article + filterable grid.',
                    flagText: null, sections: [], children: [
                        { id: 'page-0-3-0', name: 'All Uncommon Thinking Posts', type: 'Web Page', flags: 0, missing: false, headline: '"Read the thinking behind the work."', summary: 'Full article index with category filters.', flagText: null, sections: [], children: [] },
                        { id: 'page-0-3-1', name: 'Aaker', type: 'Web Page', flags: 0, missing: true, headline: null, summary: null, flagText: null, sections: [], children: [] },
                        { id: 'page-0-3-2', name: 'The 2026 AI-Powered Consumer Report', type: 'Web Page', flags: 0, missing: false, headline: '"The AI-Powered Consumer Report 2026."', summary: 'Long-form research report with key findings, data visualizations, and download CTA.', flagText: null, sections: [], children: [] }
                    ]
                },
                {
                    id: 'page-0-4', name: 'Connect', type: 'Web Page', flags: 0, missing: false,
                    headline: '"Let\'s build something worth remembering."', summary: 'Contact page with brief intro, contact form, and direct email. Includes office location.',
                    flagText: null, sections: [{ name: 'Hero', items: [{ label: 'Headline', value: 'Let\'s build something worth remembering.' }, { label: 'CTA', value: 'Send a message' }] }],
                    children: [
                        { id: 'page-0-4-0', name: 'Contact', type: 'Contact', flags: 0, missing: false, headline: '"Get in touch."', summary: 'Contact form + direct email + social links.', flagText: null, sections: [], children: [] }
                    ]
                }
            ]
        }]
    };
    currentPath = NARRATIVE_PATH;
    buildSitemapFromFiles(demoData);
    updateSlider();
}
