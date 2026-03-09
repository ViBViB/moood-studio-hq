/**
 * Master Text Block
 * Centered typography block with optional outlined text.
 */
export default function MasterTextBlock(slots) {
    return `
        <div class="text-block-container">
            <div class="text-block-headline">
                ${slots.headline || `
                    <p class="text-block-h2 text-block-h2-line1">Built on Biomechanics.</p>
                    <div class="text-block-h2-line2">
                        <span class="text-block-h2 text-block-h2-outline">Proven</span>
                        <span class="text-block-h2 text-block-h2-solid">by Research.</span>
                    </div>
                `}
            </div>
            <div class="text-block-body">
                ${slots.body || ''}
            </div>
        </div>
    `;
}
