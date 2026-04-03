/**
 * MEHICO FARMA - UnitEconomics Module
 * CPA Calculator с защитой от NaN/Infinity
 */

class UnitEconomics {
    constructor() {
        this.inputs = {};
        this.outputs = {};
        this.defaults = { adSpend: 500, cpc: 0.05, cr: 1.5, approvalRate: 30, payout: 15 };
        this.presets = {
            nutra: { cpc: 0.05, cr: 1.5, approvalRate: 30, payout: 15 },
            gambling: { cpc: 0.15, cr: 3, approvalRate: 25, payout: 80 },
            crypto: { cpc: 0.50, cr: 1, approvalRate: 20, payout: 200 }
        };
        this.scenarios = {
            optimistic: { cr: 1.5, approval: 1.3, cpc: 0.8 },
            realistic: { cr: 1, approval: 1, cpc: 1 },
            pessimistic: { cr: 0.5, approval: 0.7, cpc: 1.2 }
        };
        this.storageKey = 'unit_economics_v2';
        this.baseValues = null;
    }

    init() {
        this.inputs.adSpend = document.getElementById('ad-spend');
        this.inputs.cpc = document.getElementById('cpc');
        this.inputs.cr = document.getElementById('cr');
        this.inputs.approvalRate = document.getElementById('approval-rate');
        this.inputs.payout = document.getElementById('payout');

        this.outputs.clicks = document.getElementById('clicks-value');
        this.outputs.leads = document.getElementById('leads-value');
        this.outputs.approved = document.getElementById('approved-value');
        this.outputs.cpl = document.getElementById('cpl-value');
        this.outputs.cpa = document.getElementById('cpa-value');
        this.outputs.revenue = document.getElementById('revenue-value');
        this.outputs.profit = document.getElementById('profit-value');
        this.outputs.roi = document.getElementById('roi-value');
        this.outputs.breakeven = document.getElementById('breakeven-value');
        this.outputs.rpc = document.getElementById('rpc-value');
        this.outputs.margin = document.getElementById('margin-value');
        this.outputs.payback = document.getElementById('payback-value');

        this.scenarioSelect = document.getElementById('scenario-select');
        this.resetBtn = document.getElementById('reset-btn');
        this.alertsContainer = document.getElementById('alerts-container');
        this.profitGauge = document.getElementById('profit-gauge');
        this.roiGauge = document.getElementById('roi-gauge');

        if (!this.inputs.adSpend) return;

        this.loadState();
        this.setupEventListeners();
        this.setupPresets();
        this.setupQuickScenarios();
        this.setupExport();
        this.calculate();

        console.log('[UnitEconomics] Initialized');
    }

    setupEventListeners() {
        Object.values(this.inputs).forEach(input => {
            if (input) {
                let timer;
                input.addEventListener('input', () => {
                    clearTimeout(timer);
                    timer = setTimeout(() => { this.calculate(); this.saveState(); }, 300);
                });
            }
        });

        document.querySelectorAll('.input-group__stepper-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const target = document.getElementById(btn.dataset.target);
                if (!target) return;
                const value = parseFloat(target.value) || 0;
                const step = parseFloat(target.step) || 1;
                const min = parseFloat(target.min) || 0;
                const max = parseFloat(target.max) || Infinity;
                const newValue = btn.dataset.action === 'increase' 
                    ? Math.min(value + step, max) 
                    : Math.max(value - step, min);
                const decimals = step.toString().includes('.') ? step.toString().split('.')[1].length : 0;
                target.value = newValue.toFixed(decimals);
                target.dispatchEvent(new Event('input'));
            });
        });

        document.querySelectorAll('.input-group__preset').forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.inputs.adSpend) {
                    this.inputs.adSpend.value = btn.dataset.value;
                    this.inputs.adSpend.dispatchEvent(new Event('input'));
                }
            });
        });

        this.resetBtn?.addEventListener('click', () => { this.reset(); this.saveState(); });
        this.scenarioSelect?.addEventListener('change', () => this.saveState());
    }

    setupPresets() {
        document.querySelectorAll('.quick-presets__btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const preset = this.presets[btn.dataset.preset];
                if (!preset) return;
                if (this.inputs.cpc) this.inputs.cpc.value = preset.cpc;
                if (this.inputs.cr) this.inputs.cr.value = preset.cr;
                if (this.inputs.approvalRate) this.inputs.approvalRate.value = preset.approvalRate;
                if (this.inputs.payout) this.inputs.payout.value = preset.payout;
                this.calculate();
                this.saveState();
            });
        });
    }

    setupQuickScenarios() {
        document.querySelectorAll('.quick-actions__btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const scenario = this.scenarios[btn.dataset.scenario];
                if (!scenario) return;
                if (!this.baseValues) {
                    this.baseValues = {
                        cr: parseFloat(this.inputs.cr?.value) || this.defaults.cr,
                        approval: parseFloat(this.inputs.approvalRate?.value) || this.defaults.approvalRate,
                        cpc: parseFloat(this.inputs.cpc?.value) || this.defaults.cpc
                    };
                }
                if (this.inputs.cr) this.inputs.cr.value = (this.baseValues.cr * scenario.cr).toFixed(1);
                if (this.inputs.approvalRate) this.inputs.approvalRate.value = (this.baseValues.approval * scenario.approval).toFixed(0);
                if (this.inputs.cpc) this.inputs.cpc.value = (this.baseValues.cpc * scenario.cpc).toFixed(2);
                this.calculate();
            });
        });
    }

    setupExport() {
        document.getElementById('export-csv')?.addEventListener('click', () => this.exportCSV());
        document.getElementById('copy-link')?.addEventListener('click', () => this.copyLink());
    }

    /**
     * ГЛАВНЫЙ МЕТОД РАСЧЁТА - с защитой от NaN/Infinity
     */
    calculate() {
        try {
            // Безопасный парсинг с fallback на defaults
            const adSpend = parseFloat(this.inputs.adSpend?.value) || this.defaults.adSpend;
            let cpc = parseFloat(this.inputs.cpc?.value) || this.defaults.cpc;
            const cr = parseFloat(this.inputs.cr?.value) || this.defaults.cr;
            const approvalRate = parseFloat(this.inputs.approvalRate?.value) || this.defaults.approvalRate;
            const payout = parseFloat(this.inputs.payout?.value) || this.defaults.payout;

            // Защита от деления на ноль
            if (cpc <= 0) cpc = 0.001;

            const clicks = Math.floor(adSpend / cpc);
            const leads = Math.floor(clicks * (cr / 100));
            const approved = Math.floor(leads * (approvalRate / 100));
            const revenue = approved * payout;
            const profit = revenue - adSpend;
            const roi = adSpend > 0 ? (profit / adSpend) * 100 : 0;
            const cpl = leads > 0 ? adSpend / leads : 0;
            const cpa = approved > 0 ? adSpend / approved : 0;
            const breakeven = payout * (approvalRate / 100);
            const rpc = clicks > 0 ? revenue / clicks : 0;
            const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
            const payback = profit > 0 ? Math.round(adSpend / (profit / 30)) : 999;

            this.updateOutputs({ clicks, leads, approved, cpl, cpa, revenue, profit, roi, breakeven, rpc, margin, payback });
            this.updateGauges(profit, roi);
            this.updateAlerts({ profit, roi, cr, cpa, payout });
        } catch (error) {
            console.error('[UnitEconomics] Calculate error:', error);
        }
    }

    updateOutputs(values) {
        const fmt = new Intl.NumberFormat('ru-RU');
        const fmt2 = new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const fmt3 = new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

        if (this.outputs.clicks) this.outputs.clicks.textContent = fmt.format(values.clicks);
        if (this.outputs.leads) this.outputs.leads.textContent = fmt.format(values.leads);
        if (this.outputs.approved) this.outputs.approved.textContent = fmt.format(values.approved);
        if (this.outputs.cpl) this.outputs.cpl.textContent = fmt2.format(values.cpl);
        if (this.outputs.cpa) this.outputs.cpa.textContent = fmt2.format(values.cpa);
        if (this.outputs.revenue) this.outputs.revenue.textContent = fmt2.format(values.revenue);
        if (this.outputs.profit) this.outputs.profit.textContent = fmt2.format(values.profit);
        if (this.outputs.roi) this.outputs.roi.textContent = fmt.format(values.roi);
        if (this.outputs.breakeven) this.outputs.breakeven.textContent = fmt2.format(values.breakeven);
        if (this.outputs.rpc) this.outputs.rpc.textContent = fmt3.format(values.rpc);
        if (this.outputs.margin) this.outputs.margin.textContent = fmt.format(values.margin);
        if (this.outputs.payback) this.outputs.payback.textContent = values.payback > 100 ? '∞' : fmt.format(values.payback);
    }

    updateGauges(profit, roi) {
        const profitCard = document.querySelector('.metric-card--profit');
        const roiCard = document.querySelector('.metric-card--roi');
        if (profitCard) { 
            profitCard.classList.remove('is-positive', 'is-negative'); 
            profitCard.classList.add(profit >= 0 ? 'is-positive' : 'is-negative'); 
        }
        if (roiCard) { 
            roiCard.classList.remove('is-positive', 'is-negative'); 
            roiCard.classList.add(roi >= 0 ? 'is-positive' : 'is-negative'); 
        }
        if (this.profitGauge) {
            const p = Math.min(Math.max((profit + 500) / 1000 * 100, 0), 100);
            this.profitGauge.querySelector('.metric-card__gauge-fill').style.setProperty('--gauge-value', `${p}%`);
        }
        if (this.roiGauge) {
            const r = Math.min(Math.max((roi + 100) / 300 * 100, 0), 100);
            this.roiGauge.querySelector('.metric-card__gauge-fill').style.setProperty('--gauge-value', `${r}%`);
        }
    }

    updateAlerts(metrics) {
        if (!this.alertsContainer) return;
        const alerts = [];
        if (metrics.roi < 0) alerts.push({ type: 'error', title: '⚠️ Отрицательный ROI', text: 'Кампания убыточна. Оптимизируйте CR или CPC.' });
        else if (metrics.roi > 100) alerts.push({ type: 'success', title: '✅ Отличный ROI', text: 'Можно масштабировать бюджет.' });
        if (metrics.cr < 1) alerts.push({ type: 'warning', title: '⚡ Низкая конверсия', text: `CR ${metrics.cr}% ниже среднего (1-3%).` });
        if (metrics.cpa > metrics.payout) alerts.push({ type: 'error', title: '💸 CPA выше Payout', text: 'Вы платите за лид больше чем получаете.' });
        this.alertsContainer.innerHTML = alerts.map(a => `
            <div class="ue-alert ue-alert--${a.type}">
                <div class="ue-alert__icon">${a.type === 'error' ? '⚠️' : a.type === 'warning' ? '⚡' : '✅'}</div>
                <div class="ue-alert__content">
                    <div class="ue-alert__title">${a.title}</div>
                    <div class="ue-alert__text">${a.text}</div>
                </div>
            </div>
        `).join('');
    }

    reset() {
        if (this.inputs.adSpend) this.inputs.adSpend.value = this.defaults.adSpend;
        if (this.inputs.cpc) this.inputs.cpc.value = this.defaults.cpc;
        if (this.inputs.cr) this.inputs.cr.value = this.defaults.cr;
        if (this.inputs.approvalRate) this.inputs.approvalRate.value = this.defaults.approvalRate;
        if (this.inputs.payout) this.inputs.payout.value = this.defaults.payout;
        this.baseValues = null;
        this.calculate();
    }

    saveState() {
        storage.set(this.storageKey, {
            adSpend: parseFloat(this.inputs.adSpend?.value) || this.defaults.adSpend,
            cpc: parseFloat(this.inputs.cpc?.value) || this.defaults.cpc,
            cr: parseFloat(this.inputs.cr?.value) || this.defaults.cr,
            approvalRate: parseFloat(this.inputs.approvalRate?.value) || this.defaults.approvalRate,
            payout: parseFloat(this.inputs.payout?.value) || this.defaults.payout,
            scenario: this.scenarioSelect?.value || 'A'
        });
    }

    loadState() {
        const state = storage.get(this.storageKey);
        if (!state) return;
        
        if (this.inputs.adSpend) {
            this.inputs.adSpend.value = state.adSpend;
            this.inputs.adSpend.dispatchEvent(new Event('input'));
        }
        if (this.inputs.cpc) {
            this.inputs.cpc.value = state.cpc;
            this.inputs.cpc.dispatchEvent(new Event('input'));
        }
        if (this.inputs.cr) {
            this.inputs.cr.value = state.cr;
            this.inputs.cr.dispatchEvent(new Event('input'));
        }
        if (this.inputs.approvalRate) {
            this.inputs.approvalRate.value = state.approvalRate;
            this.inputs.approvalRate.dispatchEvent(new Event('input'));
        }
        if (this.inputs.payout) {
            this.inputs.payout.value = state.payout;
            this.inputs.payout.dispatchEvent(new Event('input'));
        }
        if (this.scenarioSelect) this.scenarioSelect.value = state.scenario || 'A';
    }

    exportCSV() {
        const data = { 
            'Бюджет': this.inputs.adSpend?.value || 0, 
            'CPC': this.inputs.cpc?.value || 0, 
            'CR %': this.inputs.cr?.value || 0, 
            'Аппрув %': this.inputs.approvalRate?.value || 0, 
            'Payout': this.inputs.payout?.value || 0, 
            'Клики': this.outputs.clicks?.textContent || 0, 
            'Лиды': this.outputs.leads?.textContent || 0, 
            'Аппрув': this.outputs.approved?.textContent || 0, 
            'Выручка': this.outputs.revenue?.textContent || 0, 
            'Прибыль': this.outputs.profit?.textContent || 0, 
            'ROI %': this.outputs.roi?.textContent || 0 
        };
        const csv = Object.entries(data).map(([k, v]) => `"${k}","${v}"`).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `unit-economics-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    copyLink() {
        const params = new URLSearchParams({ 
            s: this.inputs.adSpend?.value || '', 
            c: this.inputs.cpc?.value || '', 
            r: this.inputs.cr?.value || '', 
            a: this.inputs.approvalRate?.value || '', 
            p: this.inputs.payout?.value || '' 
        });
        const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
        navigator.clipboard.writeText(url).then(() => alert('Ссылка скопирована!'));
    }
}
