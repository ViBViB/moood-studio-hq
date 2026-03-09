/**
 * Master Navbar
 * Handles Logo, Links, and Action buttons.
 */
export default function MasterNavbar(slots) {
    const navLinks = slots.links || `
        <li><a href="#">The Chair</a></li>
        <li><a href="#">How It Works</a></li>
        <li><a href="#">About</a></li>
        <li><a href="#">Reviews</a></li>
        <li><a href="#">Resources</a></li>
    `;

    const navUtilities = slots.utilities || `
        <img class="navbar-utils-icon" src="../assets/images/icon_search.png" alt="" aria-hidden="true" />
        <a href="#">Search</a>
        <span class="navbar-utils-sep" aria-hidden="true"></span>
        <a href="#">Where To Try</a>
        <span class="navbar-utils-sep" aria-hidden="true"></span>
        <a href="#">Contact Us</a>
    `;

    const navActions = slots.actions || `
        <a href="#" class="btn-shop-now">Shop Now</a>
        <div class="navbar-icons">
            <button class="navbar-icon-btn user" aria-label="My account">
                <img src="../assets/images/icon_user.png" alt="Account" />
            </button>
            <button class="navbar-icon-btn cart" aria-label="Shopping cart">
                <img src="../assets/images/icon_cart.png" alt="Cart" />
            </button>
        </div>
    `;

    return `
        <header class="anthros-navbar" id="anthros-navbar">
            <div class="navbar-content">
                <a href="/" class="navbar-logo" aria-label="Anthros — Go to homepage">
                    <img class="logo-desktop" src="../assets/images/logo_anthros.png" alt="Anthros logo" />
                    <img class="logo-mobile" src="../assets/images/Anthros_Logo_Mobile.png" alt="Anthros logo" />
                </a>
                <nav aria-label="Primary navigation">
                    <ul class="navbar-links">
                        ${navLinks}
                    </ul>
                </nav>
                <div class="navbar-right">
                    <div class="navbar-utils">
                        ${navUtilities}
                    </div>
                    <div class="navbar-actions">
                        ${navActions}
                    </div>
                </div>
                <button class="navbar-mobile-toggle" type="button" aria-label="Abrir menú de navegación" aria-expanded="false" aria-controls="navbar-mobile-panel">
                    <img src="../assets/images/Menu-mobile-icon.svg" class="navbar-toggle-icon icon-menu" alt="" aria-hidden="true" />
                    <i class="navbar-toggle-icon icon-close" data-lucide="x"></i>
                </button>
            </div>
            <div class="navbar-mobile-overlay" aria-hidden="true"></div>
            <div class="navbar-mobile-panel" id="navbar-mobile-panel" aria-hidden="true">
                <nav class="navbar-mobile-links" aria-label="Navegación principal móvil">
                    <ul>
                        ${navLinks}
                    </ul>
                </nav>
                <div class="navbar-mobile-utils">
                    ${navUtilities}
                </div>
                <div class="navbar-mobile-actions">
                    ${navActions}
                </div>
            </div>
        </header>
    `;
}
