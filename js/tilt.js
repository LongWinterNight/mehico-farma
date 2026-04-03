/**
 * MEHICO FARMA - Tilt Module
 * 3D Card Hover Effect
 */

class Tilt {
    constructor(options = {}) {
        this.cards = [];
        this.options = {
            max: 8,
            perspective: 1000,
            scale: 1.02,
            speed: 400,
            ...options
        };
        this.animationFrame = null;
    }

    init() {
        this.cards = document.querySelectorAll('[data-tilt]');
        if (!this.cards.length) return;

        this.cards.forEach(card => this.setup(card));
        console.log(`[Tilt] Initialized on ${this.cards.length} elements`);
    }

    setup(card) {
        card.style.transformStyle = 'preserve-3d';
        card.style.transform = `perspective(${this.options.perspective}px)`;

        card.addEventListener('mouseenter', () => this.onEnter(card));
        card.addEventListener('mousemove', (e) => this.onMove(e, card));
        card.addEventListener('mouseleave', () => this.onLeave(card));
        card.addEventListener('touchstart', (e) => this.onTouch(e, card), { passive: true });
        card.addEventListener('touchmove', (e) => this.onTouch(e, card), { passive: true });
        card.addEventListener('touchend', () => this.onLeave(card));
    }

    onEnter(card) {
        card.style.transition = 'none';
    }

    onMove(e, card) {
        if (this.animationFrame) cancelAnimationFrame(this.animationFrame);

        this.animationFrame = requestAnimationFrame(() => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -this.options.max;
            const rotateY = ((x - centerX) / centerX) * this.options.max;

            card.style.transform = `
                perspective(${this.options.perspective}px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
                scale3d(${this.options.scale}, ${this.options.scale}, ${this.options.scale})
            `;
        });
    }

    onLeave(card) {
        card.style.transition = `transform ${this.options.speed}ms ease`;
        card.style.transform = `perspective(${this.options.perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    }

    onTouch(e, card) {
        if (e.touches?.length === 1) {
            const touch = e.touches[0];
            this.onMove({ clientX: touch.clientX, clientY: touch.clientY }, card);
        }
    }
}
