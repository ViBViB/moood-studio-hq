/**
 * Master Footer
 */
export default function MasterFooter(slots) {
    return `
        <div class="footer-inner">
            ${slots.links || ''}
            <div class="footer-col newsletter-col">
                ${slots.newsletter || ''}
            </div>
        </div>
        <div class="footer-bottom">
            ${slots.bottom || ''}
        </div>
    `;
}
