/**
 * Master CTA
 */
export default function MasterCTA(slots) {
    return `
        <div class="cta-inner">
            <h2 class="cta-title">
                ${slots.title || ''}
            </h2>
            <p class="cta-desc">
                ${slots.description || ''}
            </p>
            ${slots.button || ''}
        </div>
    `;
}
