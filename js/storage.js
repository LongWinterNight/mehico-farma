/**
 * MEHICO FARMA - Storage Module
 * LocalStorage State Management
 */

class Storage {
    constructor(prefix = 'mf_') {
        this.prefix = prefix;
        this.enabled = this.isAvailable();
    }

    isAvailable() {
        try {
            const test = '__test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch {
            return false;
        }
    }

    get(key, defaultValue = null) {
        if (!this.enabled) return defaultValue;
        try {
            const data = localStorage.getItem(`${this.prefix}${key}`);
            return data ? JSON.parse(data) : defaultValue;
        } catch {
            return defaultValue;
        }
    }

    set(key, value) {
        if (!this.enabled) return false;
        try {
            localStorage.setItem(`${this.prefix}${key}`, JSON.stringify(value));
            return true;
        } catch {
            return false;
        }
    }

    remove(key) {
        if (!this.enabled) return false;
        try {
            localStorage.removeItem(`${this.prefix}${key}`);
            return true;
        } catch {
            return false;
        }
    }
}

const storage = new Storage();
