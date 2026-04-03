/**
 * MEHICO FARMA - Main Application Controller
 * Bootstraps all modules
 */

class App {
    constructor() {
        this.modules = {
            tilt: null,
            counter: null,
            clipboard: null,
            navigation: null,
            unitEconomics: null,
            funnel: null,
            prompts: null
        };
        this.state = { 
            initialized: false, 
            page: this.getCurrentPage() 
        };
    }

    getCurrentPage() {
        return window.location.pathname.split('/').pop() || 'index.html';
    }

    async init() {
        if (this.state.initialized) return;

        try {
            // Инициализация общих модулей
            this.modules.tilt = new Tilt();
            this.modules.counter = new Counter();
            this.modules.clipboard = new Clipboard();
            this.modules.navigation = new Navigation();

            // Инициализация страниц-specific модулей
            if (this.state.page === 'unit-economics.html') {
                this.modules.unitEconomics = new UnitEconomics();
                this.modules.unitEconomics.init();
            } else if (this.state.page === 'funnels.html') {
                this.modules.funnel = new FunnelVisualization();
                this.modules.funnel.init();
            } else if (this.state.page === 'prompts.html') {
                this.modules.prompts = new PromptLibrary();
                this.modules.prompts.init();
            }

            // Запуск общих модулей
            await Promise.all([
                this.modules.tilt.init(),
                this.modules.counter.init(),
                this.modules.clipboard.init(),
                this.modules.navigation.init()
            ]);

            this.updateTimestamp();
            this.state.initialized = true;
            console.log('[App] Dashboard initialized');
            console.log(`[App] Page: ${this.state.page}`);

        } catch (error) {
            console.error('[App] Initialization error:', error);
        }
    }

    updateTimestamp() {
        const el = document.getElementById('last-updated');
        if (!el) return;
        el.textContent = new Date().toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }
}

// Bootstrap
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
    
    // Debug mode
    if (['localhost', '127.0.0.1'].includes(window.location.hostname)) {
        window.app = app;
        window.storage = storage;
    }
});
