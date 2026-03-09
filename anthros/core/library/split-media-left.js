/**
 * Master Split Media Left
 * Media on the left, Content on the right.
 */
export default function MasterSplitMediaLeft(slots) {
    return `
        <div class="sml-row">
            <div class="sml-media">
                ${slots.media || ''}
            </div>
            <div class="sml-content-col">
                <div class="sml-content">
                    ${slots.content || ''}
                </div>
            </div>
        </div>
    `;
}
