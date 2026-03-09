/**
 * Master Split Media Right
 * Content on the left, Media on the right.
 */
export default function MasterSplitMediaRight(slots) {
    return `
        <div class="smr-row">
            <div class="smr-content-col">
                <div class="smr-content">
                    ${slots.content || ''}
                </div>
            </div>
            <div class="smr-media">
                ${slots.media || ''}
            </div>
        </div>
    `;
}
