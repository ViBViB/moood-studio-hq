/**
 * Master Hero
 * Two-column layout with split media and content.
 */
export default function MasterHero(slots) {
    return `
        <div class="hero-container">
            <!-- LEFT: Media -->
            <div class="hero-media">
                ${slots.media || `
                    <img class="hero-chair-img" src="../assets/images/Hero-chair-2.png" alt="Anthros chair" />
                `}
                <div class="hero-media-fade">
                    <img src="../assets/images/hero_media_fade.png" alt="" aria-hidden="true" />
                </div>
            </div>

            <!-- RIGHT: Content -->
            <div class="hero-content-col">
                <div class="hero-content">
                    <div class="hero-text-block">
                        <div class="hero-title">${slots.title || slots.headline || 'Precision Posture'}</div>
                        <div class="hero-subtitle">${slots.subtitle || ''}</div>
                    </div>
                    <div class="hero-actions">
                        ${slots.cta || '<a href="#" class="btn-explore">Shop Now</a>'}
                    </div>
                </div>
            </div>
        </div>
    `;
}
