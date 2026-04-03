/**
 * MEHICO FARMA - Counter Module
 * Animated Number Counters
 */

class Counter {
    constructor(options = {}) {
        this.counters = [];
        this.options = {
            duration: 2000,
            easing: 'easeOutQuart',
            threshold: 0.5,
            ...options
        };
    }

    init() {
        this.counters = document.querySelectorAll('[data-counter]');
        if (!this.counters.length) return;

        this.setupObserver();
        console.log(`[Counter] Initialized on ${this.counters.length} elements`);
    }

    setupObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animate(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: this.options.threshold });

        this.counters.forEach(counter => observer.observe(counter));
    }

    animate(counter) {
        const target = parseInt(counter.dataset.target) || 0;
        const prefix = counter.dataset.prefix || '';
        const suffix = counter.dataset.suffix || '';
        const start = performance.now();

        const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

        const update = (currentTime) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / this.options.duration, 1);
            const eased = easeOutQuart(progress);
            const current = Math.floor(target * eased);

            counter.textContent = `${prefix}${current.toLocaleString()}${suffix}`;

            if (progress < 1) requestAnimationFrame(update);
            else counter.textContent = `${prefix}${target.toLocaleString()}${suffix}`;
        };

        requestAnimationFrame(update);
    }
}
