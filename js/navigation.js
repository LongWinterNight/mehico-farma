/**
 * MEHICO FARMA - Navigation Module
 * Header Navigation Active State + Mobile Menu
 */

class Navigation {
    constructor() {
        this.links = [];
        this.menuToggle = null;
        this.mobileNav = null;
        this.isOpen = false;
    }

    init() {
        this.links = document.querySelectorAll('.header__nav-link');
        this.menuToggle = document.querySelector('.header__menu-toggle');
        this.mobileNav = document.querySelector('.header__nav');

        if (!this.links.length) return;

        this.setActive();
        this.initMobileMenu();

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

    initMobileMenu() {
        if (!this.menuToggle || !this.mobileNav) return;

        this.menuToggle.addEventListener('click', () => this.toggleMenu());

        // Close on link click
        this.links.forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.mobileNav.contains(e.target) && !this.menuToggle.contains(e.target)) {
                this.closeMenu();
            }
        });

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) this.closeMenu();
        });
    }

    toggleMenu() {
        this.isOpen ? this.closeMenu() : this.openMenu();
    }

    openMenu() {
        if (!this.mobileNav) return;
        this.mobileNav.classList.add('header__nav--open');
        this.menuToggle.classList.add('header__menu-toggle--active');
        this.menuToggle.setAttribute('aria-expanded', 'true');
        this.isOpen = true;
    }

    closeMenu() {
        if (!this.mobileNav) return;
        this.mobileNav.classList.remove('header__nav--open');
        this.menuToggle.classList.remove('header__menu-toggle--active');
        this.menuToggle.setAttribute('aria-expanded', 'false');
        this.isOpen = false;
    }
}
