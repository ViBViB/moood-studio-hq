/**
 * Master Split Card Right Alt
 * Similar to Split Card Right but with `scra-` classes and specific layout.
 */
export default function MasterSplitCardRightAlt(slots) {
    return `
        <div class="scra-row">
            <div class="scra-img-card">
                ${slots.media || ''}
            </div>
            <div class="scra-content">
                ${slots.content || ''}
            </div>
        </div>
    `;
}
