/**
 * Master Upper Back Alignment
 * A complex section containing multiple sub-components.
 */
export default function MasterUpperAlignment(slots) {
    return `
        <div class="uba-inner">
            <div class="uba-header">
                ${slots.header || ''}
            </div>
            <div class="uba-split-row">
                ${slots.results || ''}
            </div>
            <div class="uba-testimonial">
                ${slots.testimonial || ''}
            </div>
            <div class="uba-split-row uba-enables-row">
                ${slots.design || ''}
            </div>
            <div class="wso-section" id="spine-optimization">
                ${slots.optimization || ''}
            </div>
            <div class="uba-split-row">
                ${slots.everybody || ''}
            </div>
            <div class="uba-science-block">
                ${slots.science || ''}
            </div>
        </div>
    `;
}
