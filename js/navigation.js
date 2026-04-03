/**
 * MEHICO FARMA - Navigation Module
 * Header Navigation Active State
 */

class Navigation {
    constructor() {
        this.links = [];
    }

    init() {
        this.links = document.querySelectorAll('.header__nav-link');
        if (!this.links.length) return;

        this.setActive();
        console.log('[Navigation] Initialized');
    }

    setActive() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';

        this.links.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage) {
                link.classList.add('header__nav-link--active');
            } else {
                link.classList.remove('header__nav-link--active');
            }
        });
    }
}
