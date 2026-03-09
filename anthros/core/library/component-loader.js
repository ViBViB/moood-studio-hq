/**
 * Antigravity Component Loader
 * Handles Master -> Instance injection with Slot support.
 */

class ComponentLoader {
    constructor() {
        this.registry = {};
    }

    async init() {
        console.log("Antigravity: Initializing Component Loader...");
        await this.scanAndRender();
        document.dispatchEvent(new CustomEvent('ag:components-ready'));
    }

    async scanAndRender() {
        const instances = document.querySelectorAll('[data-ag-component]');
        for (const el of instances) {
            const componentId = el.getAttribute('data-ag-component');
            await this.renderComponent(el, componentId);
        }
    }

    async renderComponent(container, id) {
        // 1. Fetch Master Template (In production, these would be cached/bundled)
        // For this POC, we'll import them as ES Modules
        try {
            const modulePath = `/core/library/${id.toLowerCase()}.js`;
            const { default: MasterComponent } = await import(modulePath);

            // 2. Extract content from slots in the current element
            const slots = {};
            container.querySelectorAll('[slot]').forEach(slotEl => {
                slots[slotEl.getAttribute('slot')] = slotEl.innerHTML;
            });

            // 3. Render Master with Instance data
            container.innerHTML = MasterComponent(slots);

            // 4. Initialize Lucide or other scripts if needed
            if (window.lucide) window.lucide.createIcons();

            console.log(`Antigravity: Master ${id} injected into instance.`);
        } catch (err) {
            console.error(`Antigravity Error: Could not find or render Master ${id}`, err);
        }
    }
}

window.AgLoader = new ComponentLoader();
document.addEventListener('DOMContentLoaded', () => window.AgLoader.init());
