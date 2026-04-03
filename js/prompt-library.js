/**
 * MEHICO FARMA - PromptLibrary Module
 * Filter & Search Functionality
 */

class PromptLibrary {
    constructor() {
        this.cards = [];
        this.categoryButtons = [];
        this.searchInput = null;
        this.countElement = null;
        this.emptyState = null;
        this.currentCategory = 'all';
        this.searchQuery = '';
        this.storageKey = 'prompts_v2';
        this.animationClass = 'is-filtering';
        this.animationDuration = 400;
    }

    init() {
        this.cards = document.querySelectorAll('.prompts-content__card');
        this.categoryButtons = document.querySelectorAll('.prompts-sidebar__btn');
        this.searchInput = document.getElementById('prompt-search');
        this.countElement = document.getElementById('visible-count');
        this.emptyState = document.getElementById('empty-state');

        if (!this.cards.length) return;

        this.loadState();
        this.setupCategoryListeners();
        this.setupSearchListener();
        this.updateCount();

        console.log(`[PromptLibrary] Initialized with ${this.cards.length} cards`);
    }

    setupCategoryListeners() {
        this.categoryButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.categoryButtons.forEach(b => { 
                    b.classList.remove('prompts-sidebar__btn--active'); 
                    b.setAttribute('aria-selected', 'false'); 
                });
                btn.classList.add('prompts-sidebar__btn--active');
                btn.setAttribute('aria-selected', 'true');
                this.currentCategory = btn.dataset.category;
                this.saveState();
                this.filterCards();
            });
        });
    }

    setupSearchListener() {
        if (!this.searchInput) return;
        this.searchInput.addEventListener('input', () => {
            this.searchQuery = this.searchInput.value.toLowerCase().trim();
            this.saveState();
            this.filterCards();
        });
    }

    filterCards() {
        try {
            let visibleCount = 0;
            this.cards.forEach((card, index) => {
                const cardCategory = card.dataset.category;
                const cardTags = card.dataset.tags || '';
                const categoryMatch = this.currentCategory === 'all' || cardCategory === this.currentCategory;
                const searchMatch = this.searchQuery === '' || 
                    cardTags.toLowerCase().includes(this.searchQuery) || 
                    card.querySelector('.prompt-card__title')?.textContent.toLowerCase().includes(this.searchQuery);

                if (categoryMatch && searchMatch) {
                    this.showCard(card, index);
                    visibleCount++;
                } else {
                    this.hideCard(card);
                }
            });
            this.updateCount(visibleCount);
            this.toggleEmptyState(visibleCount === 0);
        } catch (error) {
            console.error('[PromptLibrary] Filter error:', error);
        }
    }

    showCard(card, index) {
        card.classList.remove('is-hidden');
        card.classList.add(this.animationClass);
        card.style.display = '';
        setTimeout(() => card.classList.remove(this.animationClass), this.animationDuration);
    }

    hideCard(card) {
        card.classList.add('is-hidden');
        card.style.display = 'none';
    }

    updateCount(count) {
        if (!this.countElement) return;
        const visibleCount = count !== undefined 
            ? count 
            : this.cards.length - document.querySelectorAll('.prompt-card.is-hidden').length;
        const current = parseInt(this.countElement.textContent) || 0;
        const duration = 300;
        const start = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - (1 - progress) * (1 - progress);
            const value = Math.round(current + (visibleCount - current) * eased);
            this.countElement.textContent = value;
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }

    toggleEmptyState(show) {
        if (!this.emptyState) return;
        this.emptyState.hidden = !show;
        this.emptyState.style.display = show ? 'flex' : 'none';
    }

    saveState() {
        storage.set(this.storageKey, { 
            currentCategory: this.currentCategory, 
            searchQuery: this.searchQuery, 
            timestamp: Date.now() 
        });
    }

    loadState() {
        const state = storage.get(this.storageKey);
        if (!state) return;
        
        if (state.currentCategory) {
            this.currentCategory = state.currentCategory;
            this.categoryButtons.forEach(btn => {
                if (btn.dataset.category === this.currentCategory) {
                    btn.classList.add('prompts-sidebar__btn--active');
                    btn.setAttribute('aria-selected', 'true');
                } else {
                    btn.classList.remove('prompts-sidebar__btn--active');
                    btn.setAttribute('aria-selected', 'false');
                }
            });
        }
        if (state.searchQuery && this.searchInput) {
            this.searchQuery = state.searchQuery;
            this.searchInput.value = this.searchQuery;
        }
    }
}
