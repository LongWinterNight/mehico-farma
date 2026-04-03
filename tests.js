/**
 * MEHICO FARMA - Unit Tests
 * Test suite for funnel calculations and formulas
 */

class FunnelTests {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }

    test(name, fn) {
        this.tests.push({ name, fn });
    }

    assert(condition, message) {
        if (condition) {
            this.passed++;
            console.log(`✓ ${message}`);
        } else {
            this.failed++;
            console.error(`✗ ${message}`);
        }
    }

    async run() {
        console.log('🧪 Running Funnel Tests...\n');

        // Test 1: Basic funnel calculation
        this.test('Basic funnel calculation', () => {
            const impressions = 100000;
            const ctrTeaser = 1.2;
            const ctrPreland = 25;
            const crLanding = 2.5;
            const approvalRate = 35;

            const clicks = Math.floor(impressions * (ctrTeaser / 100));
            const preland = Math.floor(clicks * (ctrPreland / 100));
            const leads = Math.floor(preland * (crLanding / 100));
            const approved = Math.floor(leads * (approvalRate / 100));

            this.assert(clicks === 1200, `Clicks: ${clicks} should be 1200`);
            this.assert(preland === 300, `Preland: ${preland} should be 300`);
            this.assert(leads === 7, `Leads: ${leads} should be 7`);
            this.assert(approved === 2, `Approved: ${approved} should be 2`);
        });

        // Test 2: Dropoff calculation
        this.test('Dropoff calculation', () => {
            const impressions = 100000;
            const clicks = 1200;
            
            const clicksDropoff = 100 - ((clicks / impressions) * 100);
            
            this.assert(
                Math.abs(clicksDropoff - 98.8) < 0.1,
                `Clicks dropoff: ${clicksDropoff.toFixed(1)}% should be ~98.8%`
            );
        });

        // Test 3: Financial calculations
        this.test('Financial calculations', () => {
            const clicks = 1200;
            const cpc = 0.05;
            const approved = 2;
            const payout = 15;

            const totalCost = clicks * cpc;
            const revenue = approved * payout;
            const profit = revenue - totalCost;
            const roi = (profit / totalCost) * 100;

            this.assert(totalCost === 60, `Total cost: $${totalCost} should be $60`);
            this.assert(revenue === 30, `Revenue: $${revenue} should be $30`);
            this.assert(profit === -30, `Profit: $${profit} should be -$30`);
            this.assert(roi === -50, `ROI: ${roi}% should be -50%`);
        });

        // Test 4: CPL and CPA
        this.test('CPL and CPA calculation', () => {
            const totalCost = 60;
            const leads = 7;
            const approved = 2;

            const cpl = totalCost / leads;
            const cpa = totalCost / approved;

            this.assert(
                Math.abs(cpl - 8.57) < 0.01,
                `CPL: $${cpl.toFixed(2)} should be ~$8.57`
            );
            this.assert(
                Math.abs(cpa - 30) < 0.01,
                `CPA: $${cpa.toFixed(2)} should be ~$30`
            );
        });

        // Test 5: Overall CR
        this.test('Overall conversion rate', () => {
            const impressions = 100000;
            const approved = 2;

            const overallCr = (approved / impressions) * 100;

            this.assert(
                Math.abs(overallCr - 0.002) < 0.0001,
                `Overall CR: ${overallCr.toFixed(3)}% should be ~0.002%`
            );
        });

        // Test 6: Bottleneck detection
        this.test('Bottleneck detection', () => {
            const benchmarks = {
                ctrTeaser: { min: 0.5, avg: 1.2, good: 2.0 },
                ctrPreland: { min: 15, avg: 25, good: 35 },
                crLanding: { min: 1, avg: 2.5, good: 4 },
                approvalRate: { min: 20, avg: 35, good: 50 }
            };

            const values = {
                ctrTeaser: 0.8,
                ctrPreland: 25,
                crLanding: 2.5,
                approvalRate: 35
            };

            const scores = {};
            Object.keys(benchmarks).forEach(stage => {
                const value = values[stage];
                const benchmark = benchmarks[stage];
                
                if (value >= benchmark.good) scores[stage] = 100;
                else if (value >= benchmark.avg) scores[stage] = 75;
                else if (value >= benchmark.min) scores[stage] = 50;
                else scores[stage] = Math.max(0, (value / benchmark.min) * 50);
            });

            this.assert(scores.ctrTeaser === 50, `CTR Teaser score: ${scores.ctrTeaser} should be 50 (at min threshold)`);
            this.assert(scores.ctrPreland === 75, `CTR Preland score: ${scores.ctrPreland} should be 75 (at avg)`);
        });

        // Test 7: Preset values
        this.test('Preset values', () => {
            const presets = {
                conservative: { ctrTeaser: 0.8, ctrPreland: 15, crLanding: 1, approvalRate: 25 },
                moderate: { ctrTeaser: 1.2, ctrPreland: 25, crLanding: 2.5, approvalRate: 35 },
                aggressive: { ctrTeaser: 2.5, ctrPreland: 40, crLanding: 4, approvalRate: 50 }
            };

            this.assert(presets.conservative.ctrTeaser === 0.8, 'Conservative CTR should be 0.8');
            this.assert(presets.moderate.ctrTeaser === 1.2, 'Moderate CTR should be 1.2');
            this.assert(presets.aggressive.ctrTeaser === 2.5, 'Aggressive CTR should be 2.5');
        });

        // Test 8: Edge cases
        this.test('Edge cases - zero values', () => {
            const clicks = 0;
            const cpc = 0.05;

            const totalCost = clicks * cpc;

            this.assert(totalCost === 0, `Zero clicks should result in $0 cost`);
        });

        // Test 9: Validation function
        this.test('Input validation - min/max bounds', () => {
            const validateInput = (value, min, max, defaultValue) => {
                let numValue = parseInt(value);
                if (isNaN(numValue) || numValue <= 0) return defaultValue;
                if (numValue < min) return min;
                if (numValue > max) return max;
                return numValue;
            };

            this.assert(validateInput(-10, 1000, 10000000, 100000) === 1000, 'Negative value should return min');
            this.assert(validateInput(0, 1000, 10000000, 100000) === 1000, 'Zero should return min');
            this.assert(validateInput(500, 1000, 10000000, 100000) === 1000, 'Below min should return min');
            this.assert(validateInput(15000000, 1000, 10000000, 100000) === 10000000, 'Above max should return max');
            this.assert(validateInput(50000, 1000, 10000000, 100000) === 50000, 'Valid value should pass through');
        });

        // Test 10: Export data calculation
        this.test('Export data calculation', () => {
            const baseImpressions = 100000;
            const ctrTeaser = 1.2;
            const cpc = 0.05;
            const payout = 15;

            const clicks = Math.floor(baseImpressions * (ctrTeaser / 100));
            const totalCost = clicks * cpc;
            const revenue = Math.floor(clicks * 0.25 * 0.025 * 0.35) * payout;

            this.assert(clicks === 1200, 'Clicks calculation should be correct');
            this.assert(totalCost === 60, 'Total cost calculation should be correct');
        });

        // Test 11: Score gauge color thresholds
        this.test('Score gauge color thresholds', () => {
            const getScoreColor = (score) => {
                if (score <= 30) return 'red';
                if (score <= 60) return 'orange';
                if (score <= 80) return 'cyan';
                return 'green';
            };

            this.assert(getScoreColor(25) === 'red', 'Score <= 30 should be red');
            this.assert(getScoreColor(50) === 'orange', 'Score 31-60 should be orange');
            this.assert(getScoreColor(75) === 'cyan', 'Score 61-80 should be cyan');
            this.assert(getScoreColor(95) === 'green', 'Score > 80 should be green');
        });

        // Test 12: History navigation
        this.test('History navigation logic', () => {
            const history = [
                { ctrTeaser: 1.0, ctrPreland: 20 },
                { ctrTeaser: 1.2, ctrPreland: 25 },
                { ctrTeaser: 1.5, ctrPreland: 30 }
            ];
            let historyIndex = 1;

            // Can go back
            this.assert(historyIndex > 0, 'Should be able to go back from index 1');

            // Can go forward
            this.assert(historyIndex < history.length - 1, 'Should be able to go forward from index 1');

            historyIndex = 0;
            this.assert(historyIndex <= 0, 'Should NOT be able to go back from index 0');

            historyIndex = history.length - 1;
            this.assert(historyIndex >= history.length - 1, 'Should NOT be able to go forward from last index');
        });

        // Test 13: Potential revenue calculation (fixed formula with protection)
        this.test('Potential revenue calculation with division by zero protection', () => {
            const baseImpressions = 100000;
            const payout = 15;

            // Test with normal values
            const bottlenecks1 = [
                { value: 0.8, benchmark: 1.2 },
                { value: 20, benchmark: 35 }
            ];

            const potential1 = bottlenecks1.reduce((total, bn) => {
                if (bn.value <= 0) return total;
                const improvement = (bn.benchmark - bn.value) / bn.value;
                if (improvement <= 0) return total;
                const additionalConversions = baseImpressions * improvement * 0.01;
                return total + (additionalConversions * payout);
            }, 0);

            this.assert(potential1 > 0, 'Potential revenue should be positive with normal values');

            // Test with zero value (should not crash)
            const bottlenecks2 = [
                { value: 0, benchmark: 1.2 },
                { value: 20, benchmark: 35 }
            ];

            const potential2 = bottlenecks2.reduce((total, bn) => {
                if (bn.value <= 0) return total;
                const improvement = (bn.benchmark - bn.value) / bn.value;
                if (improvement <= 0) return total;
                const additionalConversions = baseImpressions * improvement * 0.01;
                return total + (additionalConversions * payout);
            }, 0);

            this.assert(!isNaN(potential2), 'Potential should not be NaN with zero value');

            // Test with value better than benchmark (should skip)
            const bottlenecks3 = [
                { value: 2.0, benchmark: 1.2 }, // Already better
                { value: 20, benchmark: 35 }
            ];

            const potential3 = bottlenecks3.reduce((total, bn) => {
                if (bn.value <= 0) return total;
                const improvement = (bn.benchmark - bn.value) / bn.value;
                if (improvement <= 0) return total;
                const additionalConversions = baseImpressions * improvement * 0.01;
                return total + (additionalConversions * payout);
            }, 0);

            this.assert(potential3 >= 0, 'Potential should handle negative improvement gracefully');
        });

        // Test 14: Threshold alerts
        this.test('Threshold alerts detection', () => {
            const checkAlerts = (metrics) => {
                const alerts = [];
                if (metrics.roi < -50) alerts.push('critical_roi');
                else if (metrics.roi < 0) alerts.push('negative_roi');
                if (metrics.crLanding < 1) alerts.push('low_cr');
                if (metrics.cpa > metrics.payout) alerts.push('cpa_too_high');
                return alerts;
            };

            let alerts = checkAlerts({ roi: -60, crLanding: 2, cpa: 10, payout: 15 });
            this.assert(alerts.includes('critical_roi'), 'Should detect critical ROI');

            alerts = checkAlerts({ roi: -20, crLanding: 0.5, cpa: 10, payout: 15 });
            this.assert(alerts.includes('negative_roi'), 'Should detect negative ROI');
            this.assert(alerts.includes('low_cr'), 'Should detect low CR');

            alerts = checkAlerts({ roi: 150, crLanding: 3, cpa: 10, payout: 15 });
            this.assert(alerts.length === 0, 'Should have no alerts for good metrics');
        });

        // Run all tests
        console.log('\n' + '='.repeat(50));
        this.tests.forEach(({ name, fn }) => {
            console.log(`\n📋 ${name}`);
            console.log('-'.repeat(40));
            fn();
        });

        console.log('\n' + '='.repeat(50));
        console.log(`\n✅ Tests completed: ${this.passed} passed, ${this.failed} failed`);
        console.log(`📊 Success rate: ${((this.passed / (this.passed + this.failed)) * 100).toFixed(1)}%`);

        return { passed: this.passed, failed: this.failed };
    }
}

// Run tests when page loads
document.addEventListener('DOMContentLoaded', () => {
    const tests = new FunnelTests();
    tests.run();
    
    // Expose for manual testing
    window.funnelTests = tests;
});
