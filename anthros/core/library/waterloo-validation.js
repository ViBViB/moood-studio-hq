/**
 * Master Waterloo Validation
 * Includes results cards, study images, and testimonial.
 */
export default function MasterWaterlooValidation(slots) {
    return `
        <div class="wv-inner">
            <div class="wv-header-row">
                <div class="wv-header-content">
                    ${slots.header || ''}
                </div>
                <div class="fc-stack">
                    ${slots.results || ''}
                </div>
            </div>
            <div class="ig4-row">
                <div class="wv-images-content">
                    ${slots.images || ''}
                </div>
            </div>
            <div class="wv-testimonial-row">
                <div class="wv-testimonial-card">
                    ${slots.testimonial || ''}
                </div>
            </div>
        </div>
    `;
}
