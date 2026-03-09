/**
 * Master Section Header
 * Standard header with Tagline, Title (H2), and Description.
 */
export default function MasterSectionHeader(slots) {
    return `
        <div class="hcent-block">
            <div class="hcent-headline-group">
                ${slots.tagline ? `<div class="hcent-tagline">${slots.tagline}</div>` : ''}
                <h2 class="hcent-h2">${slots.title || 'Section Title'}</h2>
            </div>
            ${slots.description ? `<div class="hcent-body">${slots.description}</div>` : ''}
        </div>
    `;
}
