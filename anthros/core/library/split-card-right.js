/**
 * Master Split Card Right
 * Image on the left (in a card), Content on the right.
 */
export default function MasterSplitCardRight(slots) {
    return `
        <div class="scr-row">
            <div class="scr-img-card">
                ${slots.media || ''}
            </div>
            <div class="scr-content">
                ${slots.content || ''}
            </div>
        </div>
    `;
}
