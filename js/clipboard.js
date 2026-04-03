/**
 * MEHICO FARMA - Clipboard Module
 * Copy to Clipboard Functionality
 */

class Clipboard {
    constructor() {
        this.buttons = [];
        this.duration = 2000;
    }

    init() {
        this.buttons = document.querySelectorAll('[data-clipboard]');
        if (!this.buttons.length) return;

        this.buttons.forEach(btn => {
            btn.addEventListener('click', () => this.copy(btn));
        });

        console.log(`[Clipboard] Initialized on ${this.buttons.length} buttons`);
    }

    async copy(button) {
        const text = button.dataset.clipboard || button.textContent;
        try {
            await navigator.clipboard.writeText(text);
            this.showSuccess(button);
        } catch {
            this.showFallback(button, text);
        }
    }

    showSuccess(button) {
        const original = button.innerHTML;
        button.innerHTML = '✓ Скопировано!';
        button.style.borderColor = 'var(--green-400)';
        button.style.color = 'var(--green-400)';

        setTimeout(() => {
            button.innerHTML = original;
            button.style.borderColor = '';
            button.style.color = '';
        }, this.duration);
    }

    showFallback(button, text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        this.showSuccess(button);
    }
}
