/**
 * Master Split Card Left
 * Content on the left, Image on the right (in a card).
 */
export default function MasterSplitCardLeft(slots) {
    return `
        <div class="scl-row">
            <div class="scl-content">
                ${slots.content || ''}
            </div>
            <div class="scl-img-card">
                ${slots.media || ''}
            </div>
        </div>
    `;
}
