/**
 * MEHICO FARMA - Funnel Visualization Module
 * Traffic Funnel Calculator for CPA Nutra COD
 */

export default class FunnelVisualization {
    constructor() {
        // Base constant
        this.BASE_IMPRESSIONS = 100000;

        // DOM elements
        this.sliders = {};
        this.sliderOutputs = {};
        this.metricOutputs = {};
        this.dropoffOutputs = {};
        this.benchmarkElements = {};
        this.fills = {};

        // State
        this.storageKey = 'mf_funnel_state';

        // Formatters
        this.numberFmt = new Intl.NumberFormat('ru-RU');
        this.percentFmt = new Intl.NumberFormat('ru-RU', { 
            style: 'percent', 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        });
    }

    /**
     * Initialize the module
     */
    init() {
        this.mapDOMElements();
        this.loadState();
        this.bindEvents();
        
        // Dispatch input events to sync UI after loading state
        this.syncUI();
        
        // Initial calculation
        this.calculate();

        console.log('[FunnelVisualization] Initialized');
    }

    /**
     * Map all DOM elements
     */
    mapDOMElements() {
        // Sliders
        this.sliders = {
            ctrTeaser: document.getElementById('ctr-teaser'),
            preland: document.getElementById('preland-ctr'),
            landing: document.getElementById('landing-cr'),
            approval: document.getElementById('approval-rate')
        };

        // Slider value outputs
        this.sliderOutputs = {
            ctrTeaser: document.getElementById('ctr-teaser-value'),
            preland: document.getElementById('preland-ctr-value'),
            landing: document.getElementById('landing-cr-value'),
            approval: document.getElementById('approval-rate-value')
        };

        // Metric outputs
        this.metricOutputs = {
            impressions: document.getElementById('impressions-value'),
            clicks: document.getElementById('clicks-value'),
            preland: document.getElementById('preland-value'),
            leads: document.getElementById('leads-value'),
            approved: document.getElementById('approved-value'),
            impressionsCost: document.getElementById('impressions-cost'),
            clicksCpc: document.getElementById('clicks-cpc'),
            clicksCost: document.getElementById('clicks-cost'),
            prelandCpl: document.getElementById('preland-cpl'),
            leadsCpl: document.getElementById('leads-cpl'),
            approvedCpa: document.getElementById('approved-cpa'),
            approvedRevenue: document.getElementById('approved-revenue'),
            approvedProfit: document.getElementById('approved-profit'),
            approvedRoi: document.getElementById('approved-roi')
        };

        // Dropoff outputs
        this.dropoffOutputs = {
            clicks: document.getElementById('clicks-dropoff'),
            preland: document.getElementById('preland-dropoff'),
            leads: document.getElementById('leads-dropoff'),
            approved: document.getElementById('approved-dropoff')
        };

        // Benchmark elements
        this.benchmarkElements = {
            clicks: document.getElementById('clicks-benchmark'),
            preland: document.getElementById('preland-benchmark'),
            leads: document.getElementById('leads-benchmark'),
            approved: document.getElementById('approved-benchmark')
        };

        // Summary outputs
        this.summary = {
            overallCr: document.getElementById('overall-cr'),
            avgDropoff: document.getElementById('avg-dropoff'),
            bottleneck: document.getElementById('bottleneck-stage')
        };

        // Visual fills (progress bars)
        this.fills = {
            impressions: document.querySelector('[data-stage="impressions"] .funnel-node__metric-value'),
            clicks: document.querySelector('[data-stage="clicks"] .funnel-node__value'),
            preland: document.querySelector('[data-stage="preland"] .funnel-node__value'),
            leads: document.querySelector('[data-stage="leads"] .funnel-node__value'),
            approved: document.querySelector('[data-stage="approved"] .funnel-node__value')
        };
    }

    /**
     * Load state from localStorage
     */
    loadState() {
        try {
            const state = storage.get(this.storageKey);
            if (!state) return;

            // Restore slider values
            if (state.ctrTeaser && this.sliders.ctrTeaser) {
                this.sliders.ctrTeaser.value = state.ctrTeaser;
            }
            if (state.preland && this.sliders.preland) {
                this.sliders.preland.value = state.preland;
            }
            if (state.landing && this.sliders.landing) {
                this.sliders.landing.value = state.landing;
            }
            if (state.approval && this.sliders.approval) {
                this.sliders.approval.value = state.approval;
            }

            console.log('[FunnelVisualization] State loaded from localStorage');
        } catch (error) {
            console.error('[FunnelVisualization] Load state error:', error);
        }
    }

    /**
     * Save state to localStorage
     */
    saveState() {
        try {
            const state = {
                ctrTeaser: this.sliders.ctrTeaser?.value,
                preland: this.sliders.preland?.value,
                landing: this.sliders.landing?.value,
                approval: this.sliders.approval?.value,
                timestamp: Date.now()
            };
            storage.set(this.storageKey, state);
        } catch (error) {
            console.error('[FunnelVisualization] Save state error:', error);
        }
    }

    /**
     * Sync UI after loading state
     */
    syncUI() {
        // Update slider output displays
        Object.entries(this.sliders).forEach(([key, slider]) => {
            if (slider && this.sliderOutputs[key]) {
                this.updateSliderOutput(key, slider.value);
            }
        });

        // Dispatch input events to trigger any other listeners
        Object.values(this.sliders).forEach(slider => {
            if (slider) {
                slider.dispatchEvent(new Event('input'));
            }
        });
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        Object.entries(this.sliders).forEach(([key, slider]) => {
            if (!slider) return;

            slider.addEventListener('input', (e) => {
                const value = e.target.value;
                this.updateSliderOutput(key, value);
                this.calculate();
                this.saveState();
            });
        });
    }

    /**
     * Update slider output display
     */
    updateSliderOutput(key, value) {
        const output = this.sliderOutputs[key];
        if (!output) return;

        // Format: 1 decimal for CTR and Landing CR, integer for others
        if (key === 'ctrTeaser' || key === 'landing') {
            output.textContent = parseFloat(value).toFixed(1);
        } else {
            output.textContent = Math.round(parseFloat(value));
        }
    }

    /**
     * Safe number parsing
     */
    safeParse(value, defaultValue = 0) {
        const parsed = parseFloat(value);
        return isNaN(parsed) || parsed < 0 ? defaultValue : parsed;
    }

    /**
     * Safe dropoff calculation (prevents Infinity/NaN)
     */
    calculateDropoff(previous, current) {
        if (previous === 0) return 0;
        const dropoff = ((previous - current) / previous) * 100;
        return isFinite(dropoff) ? dropoff : 0;
    }

    /**
     * Detect bottleneck (excludes Impressions -> Clicks)
     */
    detectBottleneck(dropoffs) {
        // Only compare Preland, Landing, and Approval dropoffs
        const stages = [
            { name: 'Пробив преленда', dropoff: dropoffs.preland },
            { name: 'Конверсия лендинга', dropoff: dropoffs.landing },
            { name: 'Аппрув КЦ', dropoff: dropoffs.approval }
        ];

        // Find highest dropoff
        const bottleneck = stages.reduce((max, stage) => 
            stage.dropoff > max.dropoff ? stage : max
        , { name: '—', dropoff: 0 });

        return bottleneck.dropoff > 0 ? bottleneck.name : '—';
    }

    /**
     * Update benchmark indicators
     */
    updateBenchmarks(values) {
        const benchmarks = {
            ctrTeaser: { min: 0.5, good: 2.0 },
            preland: { min: 15, good: 35 },
            landing: { min: 1, good: 4 },
            approval: { min: 20, good: 50 }
        };

        const checks = {
            ctrTeaser: this.benchmarkElements.clicks,
            preland: this.benchmarkElements.preland,
            landing: this.benchmarkElements.leads,
            approval: this.benchmarkElements.approved
        };

        Object.entries(checks).forEach(([key, element]) => {
            if (!element) return;

            const value = values[key];
            const benchmark = benchmarks[key];
            const indicator = element.querySelector('.funnel-node__check');

            if (!indicator) return;

            if (value >= benchmark.good) {
                indicator.textContent = '✓';
                indicator.style.color = 'var(--green-400)';
            } else if (value >= benchmark.min) {
                indicator.textContent = '!';
                indicator.style.color = 'var(--warning)';
            } else {
                indicator.textContent = '✕';
                indicator.style.color = 'var(--red-400)';
            }
        });
    }

    /**
     * MAIN CALCULATION METHOD
     */
    calculate() {
        try {
            // Get slider values with strict parsing
            const ctrTeaser = this.safeParse(this.sliders.ctrTeaser?.value, 1.2);
            const prelandCtr = this.safeParse(this.sliders.preland?.value, 25);
            const landingCr = this.safeParse(this.sliders.landing?.value, 2.5);
            const approvalRate = this.safeParse(this.sliders.approval?.value, 35);

            // WATERFALL MATH (using Math.floor)
            const clicks = Math.floor(this.BASE_IMPRESSIONS * (ctrTeaser / 100));
            const prelandClicks = Math.floor(clicks * (prelandCtr / 100));
            const leads = Math.floor(prelandClicks * (landingCr / 100));
            const approved = Math.floor(leads * (approvalRate / 100));

            // Financial calculations (CPC = $0.05, Payout = $15)
            const cpc = 0.05;
            const payout = 15;
            const totalCost = clicks * cpc;
            const revenue = approved * payout;
            const profit = revenue - totalCost;
            const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0;

            // DROPOFF CALCULATIONS (with safeguard)
            const dropoffs = {
                clicks: this.calculateDropoff(this.BASE_IMPRESSIONS, clicks),
                preland: this.calculateDropoff(clicks, prelandClicks),
                landing: this.calculateDropoff(prelandClicks, leads),
                approval: this.calculateDropoff(leads, approved)
            };

            // SUMMARY METRICS
            const overallCr = this.BASE_IMPRESSIONS > 0 
                ? (approved / this.BASE_IMPRESSIONS) * 100 
                : 0;
            const avgDropoff = (dropoffs.clicks + dropoffs.preland + dropoffs.landing + dropoffs.approval) / 4;

            // BOTTLENECK DETECTION
            const bottleneck = this.detectBottleneck(dropoffs);

            // UPDATE DOM
            this.updateMetricOutputs({
                impressions: this.BASE_IMPRESSIONS,
                clicks,
                preland: prelandClicks,
                leads,
                approved,
                totalCost,
                revenue,
                profit,
                roi,
                cpc,
                payout
            });

            this.updateDropoffOutputs(dropoffs);

            this.updateSummary({
                overallCr,
                avgDropoff,
                bottleneck
            });

            this.updateBenchmarks({ ctrTeaser, preland, landing: landingCr, approval: approvalRate });

            this.updateVisualFills({
                impressions: 100,
                clicks: (clicks / this.BASE_IMPRESSIONS) * 100,
                preland: (prelandClicks / this.BASE_IMPRESSIONS) * 100,
                leads: (leads / this.BASE_IMPRESSIONS) * 100,
                approved: (approved / this.BASE_IMPRESSIONS) * 100
            });

        } catch (error) {
            console.error('[FunnelVisualization] Calculate error:', error);
        }
    }

    /**
     * Update metric output cards
     */
    updateMetricOutputs(values) {
        const fmtCurrency = new Intl.NumberFormat('ru-RU', { 
            style: 'currency', 
            currency: 'USD', 
            minimumFractionDigits: 2 
        });

        if (this.metricOutputs.impressions) {
            this.metricOutputs.impressions.textContent = this.numberFmt.format(values.impressions);
        }
        if (this.metricOutputs.clicks) {
            this.metricOutputs.clicks.textContent = this.numberFmt.format(values.clicks);
        }
        if (this.metricOutputs.preland) {
            this.metricOutputs.preland.textContent = this.numberFmt.format(values.preland);
        }
        if (this.metricOutputs.leads) {
            this.metricOutputs.leads.textContent = this.numberFmt.format(values.leads);
        }
        if (this.metricOutputs.approved) {
            this.metricOutputs.approved.textContent = this.numberFmt.format(values.approved);
        }

        // Financial metrics
        if (this.metricOutputs.impressionsCost) {
            this.metricOutputs.impressionsCost.textContent = fmtCurrency.format(0);
        }
        if (this.metricOutputs.clicksCpc) {
            this.metricOutputs.clicksCpc.textContent = fmtCurrency.format(values.cpc);
        }
        if (this.metricOutputs.clicksCost) {
            this.metricOutputs.clicksCost.textContent = fmtCurrency.format(values.totalCost);
        }
        if (this.metricOutputs.prelandCpl) {
            const cpl = values.preland > 0 ? values.totalCost / values.preland : 0;
            this.metricOutputs.prelandCpl.textContent = fmtCurrency.format(cpl);
        }
        if (this.metricOutputs.leadsCpl) {
            const cpl = values.leads > 0 ? values.totalCost / values.leads : 0;
            this.metricOutputs.leadsCpl.textContent = fmtCurrency.format(cpl);
        }
        if (this.metricOutputs.approvedCpa) {
            const cpa = values.approved > 0 ? values.totalCost / values.approved : 0;
            this.metricOutputs.approvedCpa.textContent = fmtCurrency.format(cpa);
        }
        if (this.metricOutputs.approvedRevenue) {
            this.metricOutputs.approvedRevenue.textContent = fmtCurrency.format(values.revenue);
        }
        if (this.metricOutputs.approvedProfit) {
            this.metricOutputs.approvedProfit.textContent = fmtCurrency.format(values.profit);
            this.metricOutputs.approvedProfit.style.color = values.profit >= 0 
                ? 'var(--green-400)' 
                : 'var(--red-400)';
        }
        if (this.metricOutputs.approvedRoi) {
            this.metricOutputs.approvedRoi.textContent = `${values.roi.toFixed(0)}%`;
            this.metricOutputs.approvedRoi.style.color = values.roi >= 0 
                ? 'var(--green-400)' 
                : 'var(--red-400)';
        }
    }

    /**
     * Update dropoff displays
     */
    updateDropoffOutputs(dropoffs) {
        if (this.dropoffOutputs.clicks) {
            this.dropoffOutputs.clicks.textContent = `-${dropoffs.clicks.toFixed(1)}%`;
        }
        if (this.dropoffOutputs.preland) {
            this.dropoffOutputs.preland.textContent = `-${dropoffs.preland.toFixed(1)}%`;
        }
        if (this.dropoffOutputs.leads) {
            this.dropoffOutputs.leads.textContent = `-${dropoffs.landing.toFixed(1)}%`;
        }
        if (this.dropoffOutputs.approved) {
            this.dropoffOutputs.approved.textContent = `-${dropoffs.approval.toFixed(1)}%`;
        }
    }

    /**
     * Update summary section
     */
    updateSummary(values) {
        if (this.summary.overallCr) {
            this.summary.overallCr.textContent = `${values.overallCr.toFixed(3)}%`;
        }
        if (this.summary.avgDropoff) {
            this.summary.avgDropoff.textContent = `${values.avgDropoff.toFixed(1)}%`;
        }
        if (this.summary.bottleneck) {
            this.summary.bottleneck.textContent = values.bottleneck;
        }
    }

    /**
     * Update visual fill bars (fix collapsed UI bug)
     */
    updateVisualFills(progress) {
        // Update CSS custom properties for visual bars
        const nodes = document.querySelectorAll('.funnel-node');
        
        nodes.forEach(node => {
            const stage = node.dataset.stage;
            if (stage && progress[stage] !== undefined) {
                node.style.setProperty('--fill-width', `${progress[stage]}%`);
                
                // Also update any progress bar elements
                const progressBar = node.querySelector('.funnel-node__progress-bar');
                if (progressBar) {
                    progressBar.style.width = `${progress[stage]}%`;
                }
            }
        });
    }
}
