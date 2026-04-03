/**
 * MEHICO FARMA - Dashboard Enhancements
 * Mexico City time, theme toggle, modal, command palette, goals, quick actions
 */

class Dashboard {
    constructor() {
        this.state = {
            theme: localStorage.getItem('theme') || 'dark',
            goals: JSON.parse(localStorage.getItem('weekly-goals') || '{}'),
            modalOpen: false,
            commandPaletteOpen: false
        };
    }

    async init() {
        this.initMexicoTime();
        this.initTheme();
        this.initModal();
        this.initCommandPalette();
        this.initGoals();
        this.initQuickActions();
        this.initMetricClicks();
    }

    // ==========================================================================
    // Mexico City Time (CST/CDT)
    // ==========================================================================

    initMexicoTime() {
        const el = document.getElementById('mexico-time');
        const tzEl = document.querySelector('.hero__tag--tz');
        if (!el) return;

        const updateTime = () => {
            const now = new Date();
            const options = {
                timeZone: 'America/Mexico_City',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            };
            el.textContent = now.toLocaleTimeString('ru-RU', options);

            // Determine if CST or CDT
            const month = now.toLocaleString('en-US', { timeZone: 'America/Mexico_City', month: 'numeric' });
            tzEl.textContent = (month >= 4 && month <= 10) ? 'CDT' : 'CST';
        };

        updateTime();
        setInterval(updateTime, 1000);
    }

    // ==========================================================================
    // Theme Toggle
    // ==========================================================================

    initTheme() {
        const toggle = document.getElementById('theme-toggle');
        const lightIcon = document.querySelector('.theme-icon-light');
        const darkIcon = document.querySelector('.theme-icon-dark');

        // Apply saved theme
        if (this.state.theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
            if (lightIcon) lightIcon.style.display = 'none';
            if (darkIcon) darkIcon.style.display = 'block';
        }

        if (!toggle) return;

        toggle.addEventListener('click', () => {
            this.state.theme = this.state.theme === 'dark' ? 'light' : 'dark';
            localStorage.setItem('theme', this.state.theme);

            if (this.state.theme === 'light') {
                document.documentElement.setAttribute('data-theme', 'light');
                if (lightIcon) lightIcon.style.display = 'none';
                if (darkIcon) darkIcon.style.display = 'block';
            } else {
                document.documentElement.removeAttribute('data-theme');
                if (lightIcon) lightIcon.style.display = 'block';
                if (darkIcon) darkIcon.style.display = 'none';
            }
        });
    }

    // ==========================================================================
    // Modal
    // ==========================================================================

    initModal() {
        const overlay = document.getElementById('modal-overlay');
        const closeBtn = document.getElementById('modal-close');

        if (!overlay) return;

        closeBtn?.addEventListener('click', () => this.closeModal());
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.closeModal();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.state.modalOpen) this.closeModal();
        });
    }

    openModal(title, content) {
        const overlay = document.getElementById('modal-overlay');
        const titleEl = document.getElementById('modal-title');
        const bodyEl = document.getElementById('modal-body');

        if (!overlay) return;

        titleEl.textContent = title;
        bodyEl.innerHTML = content;
        overlay.classList.add('active');
        overlay.setAttribute('aria-hidden', 'false');
        this.state.modalOpen = true;
    }

    closeModal() {
        const overlay = document.getElementById('modal-overlay');
        if (!overlay) return;

        overlay.classList.remove('active');
        overlay.setAttribute('aria-hidden', 'true');
        this.state.modalOpen = false;
    }

    // ==========================================================================
    // Command Palette (Cmd+K / Ctrl+K)
    // ==========================================================================

    initCommandPalette() {
        const overlay = document.getElementById('command-palette-overlay');
        const input = document.getElementById('command-palette-input');
        const results = document.getElementById('command-palette-results');

        if (!overlay) return;

        // Open with Cmd+K / Ctrl+K
        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                this.openCommandPalette();
            }
            if (e.key === 'Escape' && this.state.commandPaletteOpen) {
                this.closeCommandPalette();
            }
        });

        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.closeCommandPalette();
        });

        // Filter results
        input?.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const items = results?.querySelectorAll('.command-palette__item');
            items?.forEach(item => {
                const label = item.querySelector('.command-palette__item-label')?.textContent.toLowerCase() || '';
                const shortcut = item.querySelector('.command-palette__item-shortcut')?.textContent.toLowerCase() || '';
                const match = label.includes(query) || shortcut.includes(query);
                item.style.display = match ? 'flex' : 'none';
            });
        });

        // Theme toggle from command palette
        const themeBtn = results?.querySelector('[data-cmd="theme"]');
        themeBtn?.addEventListener('click', () => {
            document.getElementById('theme-toggle')?.click();
            this.closeCommandPalette();
        });
    }

    openCommandPalette() {
        const overlay = document.getElementById('command-palette-overlay');
        const input = document.getElementById('command-palette-input');
        if (!overlay) return;

        overlay.classList.add('active');
        overlay.setAttribute('aria-hidden', 'false');
        this.state.commandPaletteOpen = true;
        input?.focus();
        input && (input.value = '');

        // Reset all items visible
        const results = document.getElementById('command-palette-results');
        results?.querySelectorAll('.command-palette__item').forEach(item => {
            item.style.display = 'flex';
        });
    }

    closeCommandPalette() {
        const overlay = document.getElementById('command-palette-overlay');
        if (!overlay) return;

        overlay.classList.remove('active');
        overlay.setAttribute('aria-hidden', 'true');
        this.state.commandPaletteOpen = false;
    }

    // ==========================================================================
    // Weekly Goals (persisted in localStorage)
    // ==========================================================================

    initGoals() {
        const checkboxes = document.querySelectorAll('.goal-item__checkbox');

        // Restore saved state
        checkboxes.forEach(cb => {
            const goalId = cb.dataset.goal;
            if (this.state.goals[goalId]) {
                cb.checked = true;
            }
        });

        // Save on change
        checkboxes.forEach(cb => {
            cb.addEventListener('change', () => {
                this.state.goals[cb.dataset.goal] = cb.checked;
                localStorage.setItem('weekly-goals', JSON.stringify(this.state.goals));
            });
        });
    }

    // ==========================================================================
    // Quick Actions
    // ==========================================================================

    initQuickActions() {
        const buttons = document.querySelectorAll('.quick-action-btn');

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                this.handleQuickAction(action);
            });
        });
    }

    handleQuickAction(action) {
        const actions = {
            'add-expense': () => this.openModal('Добавить расход', `
                <div style="display:flex;flex-direction:column;gap:1rem">
                    <div>
                        <label style="display:block;font-size:0.875rem;color:var(--text-tertiary);margin-bottom:0.5rem">Сумма ($)</label>
                        <input type="number" placeholder="0.00" style="width:100%;padding:0.75rem 1rem;background:var(--bg-tertiary);border:1px solid var(--border-primary);border-radius:0.5rem;color:var(--text-primary);font-size:1rem">
                    </div>
                    <div>
                        <label style="display:block;font-size:0.875rem;color:var(--text-tertiary);margin-bottom:0.5rem">Категория</label>
                        <select style="width:100%;padding:0.75rem 1rem;background:var(--bg-tertiary);border:1px solid var(--border-primary);border-radius:0.5rem;color:var(--text-primary);font-size:1rem">
                            <option>Трафик</option>
                            <option>Креативы</option>
                            <option>Инструменты</option>
                            <option>Другое</option>
                        </select>
                    </div>
                    <div>
                        <label style="display:block;font-size:0.875rem;color:var(--text-tertiary);margin-bottom:0.5rem">Комментарий</label>
                        <textarea rows="3" placeholder="Описание расхода..." style="width:100%;padding:0.75rem 1rem;background:var(--bg-tertiary);border:1px solid var(--border-primary);border-radius:0.5rem;color:var(--text-primary);font-size:1rem;resize:vertical"></textarea>
                    </div>
                    <button style="padding:0.75rem 1.5rem;background:var(--cyan-500);color:var(--slate-950);border:none;border-radius:0.5rem;font-weight:600;cursor:pointer">Сохранить</button>
                </div>
            `),
            'new-campaign': () => this.openModal('Новая кампания', `
                <div style="display:flex;flex-direction:column;gap:1rem">
                    <div>
                        <label style="display:block;font-size:0.875rem;color:var(--text-tertiary);margin-bottom:0.5rem">Название кампании</label>
                        <input type="text" placeholder="FB_MX_02" style="width:100%;padding:0.75rem 1rem;background:var(--bg-tertiary);border:1px solid var(--border-primary);border-radius:0.5rem;color:var(--text-primary);font-size:1rem">
                    </div>
                    <div>
                        <label style="display:block;font-size:0.875rem;color:var(--text-tertiary);margin-bottom:0.5rem">Источник трафика</label>
                        <select style="width:100%;padding:0.75rem 1rem;background:var(--bg-tertiary);border:1px solid var(--border-primary);border-radius:0.5rem;color:var(--text-primary);font-size:1rem">
                            <option>Facebook Ads</option>
                            <option>Google Ads</option>
                            <option>Native (AdsKeeper)</option>
                            <option>TikTok Ads</option>
                        </select>
                    </div>
                    <div>
                        <label style="display:block;font-size:0.875rem;color:var(--text-tertiary);margin-bottom:0.5rem">Дневной бюджет ($)</label>
                        <input type="number" placeholder="50" style="width:100%;padding:0.75rem 1rem;background:var(--bg-tertiary);border:1px solid var(--border-primary);border-radius:0.5rem;color:var(--text-primary);font-size:1rem">
                    </div>
                    <button style="padding:0.75rem 1.5rem;background:var(--cyan-500);color:var(--slate-950);border:none;border-radius:0.5rem;font-weight:600;cursor:pointer">Создать</button>
                </div>
            `),
            'export-data': () => {
                // Simple CSV export simulation
                const data = [
                    ['Метрика', 'Значение'],
                    ['Бюджет', '$500'],
                    ['Потрачено', '$175'],
                    ['ROI цель', '300%'],
                    ['Фаза', '3/5']
                ];
                const csv = data.map(row => row.join(',')).join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'mehico-farma-data.csv';
                a.click();
                URL.revokeObjectURL(url);
            },
            'add-creative': () => this.openModal('Добавить креатив', `
                <div style="display:flex;flex-direction:column;gap:1rem">
                    <div>
                        <label style="display:block;font-size:0.875rem;color:var(--text-tertiary);margin-bottom:0.5rem">Название креатива</label>
                        <input type="text" placeholder="banner_v3" style="width:100%;padding:0.75rem 1rem;background:var(--bg-tertiary);border:1px solid var(--border-primary);border-radius:0.5rem;color:var(--text-primary);font-size:1rem">
                    </div>
                    <div>
                        <label style="display:block;font-size:0.875rem;color:var(--text-tertiary);margin-bottom:0.5rem">Тип</label>
                        <select style="width:100%;padding:0.75rem 1rem;background:var(--bg-tertiary);border:1px solid var(--border-primary);border-radius:0.5rem;color:var(--text-primary);font-size:1rem">
                            <option>Баннер</option>
                            <option>Видео</option>
                            <option>Нативный</option>
                        </select>
                    </div>
                    <div style="border:2px dashed var(--border-primary);border-radius:0.5rem;padding:2rem;text-align:center;color:var(--text-muted)">
                        <p style="margin-bottom:0.5rem">📁 Перетащите файл сюда</p>
                        <p style="font-size:0.75rem">или нажмите для выбора</p>
                    </div>
                    <button style="padding:0.75rem 1.5rem;background:var(--cyan-500);color:var(--slate-950);border:none;border-radius:0.5rem;font-weight:600;cursor:pointer">Загрузить</button>
                </div>
            `)
        };

        actions[action]?.();
    }

    // ==========================================================================
    // Metric Card Clicks (Drill-down)
    // ==========================================================================

    initMetricClicks() {
        const metrics = document.querySelectorAll('[data-metric]');

        metrics.forEach(metric => {
            metric.style.cursor = 'pointer';
            metric.addEventListener('click', () => {
                const type = metric.dataset.metric;
                this.openMetricDetail(type);
            });
        });
    }

    openMetricDetail(type) {
        const details = {
            budget: {
                title: 'Бюджет — Детализация',
                content: `
                    <div style="display:flex;flex-direction:column;gap:1.5rem">
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
                            <div style="padding:1rem;background:var(--bg-tertiary);border-radius:0.5rem">
                                <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.25rem">Общий бюджет</div>
                                <div style="font-size:1.5rem;font-weight:700;color:var(--text-primary)">$500</div>
                            </div>
                            <div style="padding:1rem;background:var(--bg-tertiary);border-radius:0.5rem">
                                <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.25rem">Потрачено</div>
                                <div style="font-size:1.5rem;font-weight:700;color:var(--orange-400)">$175</div>
                            </div>
                        </div>
                        <div>
                            <div style="font-size:0.875rem;color:var(--text-tertiary);margin-bottom:0.5rem">Расходы по дням</div>
                            <div style="display:flex;flex-direction:column;gap:0.5rem">
                                <div style="display:flex;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid var(--border-secondary)">
                                    <span style="color:var(--text-secondary)">День 1</span>
                                    <span style="color:var(--text-primary);font-weight:600">$45</span>
                                </div>
                                <div style="display:flex;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid var(--border-secondary)">
                                    <span style="color:var(--text-secondary)">День 2</span>
                                    <span style="color:var(--text-primary);font-weight:600">$62</span>
                                </div>
                                <div style="display:flex;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid var(--border-secondary)">
                                    <span style="color:var(--text-secondary)">День 3</span>
                                    <span style="color:var(--text-primary);font-weight:600">$38</span>
                                </div>
                                <div style="display:flex;justify-content:space-between;padding:0.5rem 0">
                                    <span style="color:var(--text-secondary)">День 4</span>
                                    <span style="color:var(--text-primary);font-weight:600">$30</span>
                                </div>
                            </div>
                        </div>
                        <div style="padding:0.75rem;background:rgba(34,197,94,0.1);border-radius:0.5rem">
                            <span style="font-size:0.875rem;color:var(--green-400)">● Осталось: $325 (65%)</span>
                        </div>
                    </div>
                `
            },
            roi: {
                title: 'ROI — Детализация',
                content: `
                    <div style="display:flex;flex-direction:column;gap:1.5rem">
                        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem">
                            <div style="padding:1rem;background:var(--bg-tertiary);border-radius:0.5rem">
                                <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.25rem">Цель</div>
                                <div style="font-size:1.5rem;font-weight:700;color:var(--text-primary)">300%</div>
                            </div>
                            <div style="padding:1rem;background:var(--bg-tertiary);border-radius:0.5rem">
                                <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.25rem">Текущий</div>
                                <div style="font-size:1.5rem;font-weight:700;color:var(--cyan-400)">185%</div>
                            </div>
                            <div style="padding:1rem;background:var(--bg-tertiary);border-radius:0.5rem">
                                <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.25rem">Доход</div>
                                <div style="font-size:1.5rem;font-weight:700;color:var(--green-400)">$503</div>
                            </div>
                        </div>
                        <div>
                            <div style="font-size:0.875rem;color:var(--text-tertiary);margin-bottom:0.5rem">Формула ROI</div>
                            <code style="display:block;padding:0.75rem;background:var(--bg-tertiary);border-radius:0.5rem;font-family:var(--font-mono);font-size:0.875rem;color:var(--cyan-400)">ROI = (Доход - Расход) / Расход × 100%</code>
                        </div>
                        <div style="padding:0.75rem;background:rgba(249,115,22,0.1);border-radius:0.5rem">
                            <span style="font-size:0.875rem;color:var(--orange-400)">● До цели: 115% (нужно $525 дохода)</span>
                        </div>
                    </div>
                `
            },
            phase: {
                title: 'Фаза — Детализация',
                content: `
                    <div style="display:flex;flex-direction:column;gap:1.5rem">
                        <div style="display:flex;flex-direction:column;gap:0.75rem">
                            <div style="display:flex;align-items:center;gap:0.75rem;padding:0.75rem;background:rgba(34,197,94,0.1);border-radius:0.5rem">
                                <span style="color:var(--green-400)">✓</span>
                                <span style="flex:1;color:var(--text-secondary)">Фаза 1: Настройка инфраструктуры</span>
                                <span style="font-size:0.75rem;color:var(--green-400)">Завершено</span>
                            </div>
                            <div style="display:flex;align-items:center;gap:0.75rem;padding:0.75rem;background:rgba(34,197,94,0.1);border-radius:0.5rem">
                                <span style="color:var(--green-400)">✓</span>
                                <span style="flex:1;color:var(--text-secondary)">Фаза 2: Первые тесты</span>
                                <span style="font-size:0.75rem;color:var(--green-400)">Завершено</span>
                            </div>
                            <div style="display:flex;align-items:center;gap:0.75rem;padding:0.75rem;background:rgba(6,182,212,0.1);border-radius:0.5rem;border:1px solid rgba(6,182,212,0.3)">
                                <span style="color:var(--cyan-400)">●</span>
                                <span style="flex:1;color:var(--text-primary);font-weight:600">Фаза 3: Оптимизация (текущая)</span>
                                <span style="font-size:0.75rem;color:var(--cyan-400)">В процессе</span>
                            </div>
                            <div style="display:flex;align-items:center;gap:0.75rem;padding:0.75rem;background:var(--bg-tertiary);border-radius:0.5rem;opacity:0.5">
                                <span style="color:var(--text-muted)">○</span>
                                <span style="flex:1;color:var(--text-muted)">Фаза 4: Масштабирование</span>
                                <span style="font-size:0.75rem;color:var(--text-muted)">Ожидание</span>
                            </div>
                            <div style="display:flex;align-items:center;gap:0.75rem;padding:0.75rem;background:var(--bg-tertiary);border-radius:0.5rem;opacity:0.5">
                                <span style="color:var(--text-muted)">○</span>
                                <span style="flex:1;color:var(--text-muted)">Фаза 5: Автоматизация</span>
                                <span style="font-size:0.75rem;color:var(--text-muted)">Ожидание</span>
                            </div>
                        </div>
                    </div>
                `
            }
        };

        const detail = details[type];
        if (detail) {
            this.openModal(detail.title, detail.content);
        }
    }
}

// Export for app.js
window.Dashboard = Dashboard;
