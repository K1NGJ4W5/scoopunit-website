/**
 * Automated SEO Monitoring System for Scoop Unit
 * Tracks performance metrics, rankings, and technical SEO health
 */

class SEOMonitor {
    constructor() {
        this.apiEndpoints = {
            googleSearch: 'https://customsearch.googleapis.com/customsearch/v1',
            pagespeed: 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed',
            lighthouse: 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'
        };
        
        this.keywords = [
            'dog waste removal florida',
            'pooper scooper service crestview',
            'pet waste cleanup destin',
            'dog poop removal pensacola',
            'weekly pooper scooper',
            'bi-weekly dog waste removal',
            'professional dog waste removal',
            'florida panhandle pet waste'
        ];
        
        this.competitors = [
            'scoopdeck.com',
            'pooperscoopers.com',
            'petwasteelimination.com'
        ];
        
        this.init();
    }

    init() {
        this.setupPerformanceTracking();
        this.startDailyMonitoring();
        this.createReportingDashboard();
    }

    // Core Web Vitals Monitoring
    setupPerformanceTracking() {
        // Track Core Web Vitals
        this.observeLCP();
        this.observeFID();
        this.observeCLS();
        this.observeTTFB();
        
        // Send daily performance report
        this.schedulePerformanceReport();
    }

    observeLCP() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                
                this.logMetric('LCP', lastEntry.startTime);
                
                // Alert if LCP is over 2.5 seconds
                if (lastEntry.startTime > 2500) {
                    this.sendAlert('LCP Alert', `LCP is ${lastEntry.startTime}ms - exceeds 2.5s threshold`);
                }
            });
            
            observer.observe({entryTypes: ['largest-contentful-paint']});
        }
    }

    observeFID() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    const fid = entry.processingStart - entry.startTime;
                    this.logMetric('FID', fid);
                    
                    // Alert if FID is over 100ms
                    if (fid > 100) {
                        this.sendAlert('FID Alert', `FID is ${fid}ms - exceeds 100ms threshold`);
                    }
                });
            });
            
            observer.observe({entryTypes: ['first-input']});
        }
    }

    observeCLS() {
        if ('PerformanceObserver' in window) {
            let clsValue = 0;
            
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                });
                
                this.logMetric('CLS', clsValue);
                
                // Alert if CLS is over 0.1
                if (clsValue > 0.1) {
                    this.sendAlert('CLS Alert', `CLS is ${clsValue} - exceeds 0.1 threshold`);
                }
            });
            
            observer.observe({entryTypes: ['layout-shift']});
        }
    }

    observeTTFB() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    const ttfb = entry.responseStart - entry.startTime;
                    this.logMetric('TTFB', ttfb);
                    
                    // Alert if TTFB is over 600ms
                    if (ttfb > 600) {
                        this.sendAlert('TTFB Alert', `TTFB is ${ttfb}ms - exceeds 600ms threshold`);
                    }
                });
            });
            
            observer.observe({entryTypes: ['navigation']});
        }
    }

    // Keyword Ranking Monitor (simplified version)
    async checkKeywordRankings() {
        const rankings = {};
        
        for (const keyword of this.keywords) {
            try {
                // Simulate ranking check (would use real API in production)
                const ranking = await this.simulateRankingCheck(keyword);
                rankings[keyword] = ranking;
                
                // Store historical data
                this.storeRankingData(keyword, ranking);
                
            } catch (error) {
                console.error(`Error checking ranking for ${keyword}:`, error);
            }
        }
        
        return rankings;
    }

    simulateRankingCheck(keyword) {
        // Simulate API call - replace with real ranking API
        return new Promise(resolve => {
            setTimeout(() => {
                const ranking = Math.floor(Math.random() * 20) + 1; // Random ranking 1-20
                resolve(ranking);
            }, 1000);
        });
    }

    // Technical SEO Monitoring
    async runTechnicalSEOAudit() {
        const audit = {
            timestamp: new Date().toISOString(),
            checks: {}
        };

        // Check meta tags
        audit.checks.metaTags = this.checkMetaTags();
        
        // Check schema markup
        audit.checks.schemaMarkup = this.checkSchemaMarkup();
        
        // Check internal links
        audit.checks.internalLinks = this.checkInternalLinks();
        
        // Check images
        audit.checks.images = this.checkImages();
        
        // Check page speed
        audit.checks.pageSpeed = await this.checkPageSpeed();
        
        // Store audit results
        this.storeAuditResults(audit);
        
        return audit;
    }

    checkMetaTags() {
        const issues = [];
        
        // Check title tag
        const title = document.querySelector('title');
        if (!title || title.textContent.length < 30 || title.textContent.length > 60) {
            issues.push('Title tag length should be 30-60 characters');
        }
        
        // Check meta description
        const description = document.querySelector('meta[name="description"]');
        if (!description || description.content.length < 120 || description.content.length > 160) {
            issues.push('Meta description should be 120-160 characters');
        }
        
        // Check H1 tags
        const h1Tags = document.querySelectorAll('h1');
        if (h1Tags.length !== 1) {
            issues.push('Page should have exactly one H1 tag');
        }
        
        return {
            status: issues.length === 0 ? 'pass' : 'fail',
            issues: issues
        };
    }

    checkSchemaMarkup() {
        const issues = [];
        const schemas = document.querySelectorAll('script[type="application/ld+json"]');
        
        if (schemas.length === 0) {
            issues.push('No schema markup found');
        } else {
            schemas.forEach((schema, index) => {
                try {
                    JSON.parse(schema.textContent);
                } catch (e) {
                    issues.push(`Invalid JSON-LD schema at position ${index + 1}`);
                }
            });
        }
        
        return {
            status: issues.length === 0 ? 'pass' : 'fail',
            issues: issues,
            count: schemas.length
        };
    }

    checkInternalLinks() {
        const issues = [];
        const links = document.querySelectorAll('a[href]');
        let internalLinkCount = 0;
        let brokenLinkCount = 0;
        
        links.forEach(link => {
            const href = link.getAttribute('href');
            
            // Check for internal links
            if (href.startsWith('/') || href.includes(window.location.hostname)) {
                internalLinkCount++;
            }
            
            // Check for broken links (simplified check)
            if (href === '#' || href === '') {
                brokenLinkCount++;
            }
        });
        
        if (internalLinkCount < 5) {
            issues.push('Consider adding more internal links for better SEO');
        }
        
        if (brokenLinkCount > 0) {
            issues.push(`Found ${brokenLinkCount} broken links`);
        }
        
        return {
            status: issues.length === 0 ? 'pass' : 'warning',
            issues: issues,
            internalLinks: internalLinkCount,
            brokenLinks: brokenLinkCount
        };
    }

    checkImages() {
        const issues = [];
        const images = document.querySelectorAll('img');
        let missingAltCount = 0;
        let largeSizeCount = 0;
        
        images.forEach(img => {
            // Check alt tags
            if (!img.alt || img.alt.trim() === '') {
                missingAltCount++;
            }
            
            // Check image dimensions (rough estimate)
            if (img.naturalWidth > 1920 || img.naturalHeight > 1080) {
                largeSizeCount++;
            }
        });
        
        if (missingAltCount > 0) {
            issues.push(`${missingAltCount} images missing alt text`);
        }
        
        if (largeSizeCount > 0) {
            issues.push(`${largeSizeCount} images may be too large`);
        }
        
        return {
            status: issues.length === 0 ? 'pass' : 'fail',
            issues: issues,
            totalImages: images.length,
            missingAlt: missingAltCount
        };
    }

    async checkPageSpeed() {
        // Simplified page speed check using Performance API
        const navigation = performance.getEntriesByType('navigation')[0];
        
        if (navigation) {
            const loadTime = navigation.loadEventEnd - navigation.startTime;
            const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.startTime;
            
            return {
                loadTime: Math.round(loadTime),
                domContentLoaded: Math.round(domContentLoaded),
                status: loadTime < 3000 ? 'pass' : 'fail'
            };
        }
        
        return { status: 'unknown' };
    }

    // Competitor Monitoring
    async monitorCompetitors() {
        const competitorData = {};
        
        for (const competitor of this.competitors) {
            try {
                // Simulate competitor analysis
                competitorData[competitor] = await this.analyzeCompetitor(competitor);
            } catch (error) {
                console.error(`Error analyzing competitor ${competitor}:`, error);
            }
        }
        
        return competitorData;
    }

    analyzeCompetitor(domain) {
        // Simulate competitor analysis
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    domain: domain,
                    estimatedTraffic: Math.floor(Math.random() * 10000),
                    averageRanking: Math.floor(Math.random() * 10) + 1,
                    keywordCount: Math.floor(Math.random() * 50) + 10
                });
            }, 1500);
        });
    }

    // Data Storage and Reporting
    logMetric(metric, value) {
        const data = {
            metric: metric,
            value: value,
            timestamp: new Date().toISOString(),
            url: window.location.href
        };
        
        // Store in localStorage for now (would use real database in production)
        const existingData = JSON.parse(localStorage.getItem('seo_metrics') || '[]');
        existingData.push(data);
        
        // Keep only last 1000 entries
        if (existingData.length > 1000) {
            existingData.splice(0, existingData.length - 1000);
        }
        
        localStorage.setItem('seo_metrics', JSON.stringify(existingData));
    }

    storeRankingData(keyword, ranking) {
        const data = {
            keyword: keyword,
            ranking: ranking,
            timestamp: new Date().toISOString()
        };
        
        const existingData = JSON.parse(localStorage.getItem('keyword_rankings') || '[]');
        existingData.push(data);
        
        // Keep only last 30 days of data
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const filteredData = existingData.filter(entry => 
            new Date(entry.timestamp) > thirtyDaysAgo
        );
        
        localStorage.setItem('keyword_rankings', JSON.stringify(filteredData));
    }

    storeAuditResults(audit) {
        const existingAudits = JSON.parse(localStorage.getItem('seo_audits') || '[]');
        existingAudits.push(audit);
        
        // Keep only last 30 audits
        if (existingAudits.length > 30) {
            existingAudits.splice(0, existingAudits.length - 30);
        }
        
        localStorage.setItem('seo_audits', JSON.stringify(existingAudits));
    }

    sendAlert(title, message) {
        console.warn(`SEO Alert - ${title}: ${message}`);
        
        // In production, this would send email/SMS alerts
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: message,
                icon: '/images/scoopunitlogo.jpg'
            });
        }
    }

    // Daily monitoring schedule
    startDailyMonitoring() {
        // Run initial checks
        this.runDailyChecks();
        
        // Schedule daily checks at 6 AM
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(6, 0, 0, 0);
        
        const msUntilTomorrow = tomorrow.getTime() - now.getTime();
        
        setTimeout(() => {
            this.runDailyChecks();
            
            // Then run every 24 hours
            setInterval(() => {
                this.runDailyChecks();
            }, 24 * 60 * 60 * 1000);
            
        }, msUntilTomorrow);
    }

    async runDailyChecks() {
        try {
            console.log('Running daily SEO monitoring checks...');
            
            // Run all monitoring tasks
            const [rankings, audit, competitors] = await Promise.all([
                this.checkKeywordRankings(),
                this.runTechnicalSEOAudit(),
                this.monitorCompetitors()
            ]);
            
            // Generate daily report
            this.generateDailyReport(rankings, audit, competitors);
            
        } catch (error) {
            console.error('Error running daily SEO checks:', error);
            this.sendAlert('SEO Monitoring Error', 'Failed to run daily SEO checks');
        }
    }

    generateDailyReport(rankings, audit, competitors) {
        const report = {
            date: new Date().toISOString().split('T')[0],
            rankings: rankings,
            technicalAudit: audit,
            competitors: competitors,
            summary: this.generateSummary(rankings, audit)
        };
        
        // Store report
        const reports = JSON.parse(localStorage.getItem('daily_reports') || '[]');
        reports.push(report);
        
        if (reports.length > 30) {
            reports.splice(0, reports.length - 30);
        }
        
        localStorage.setItem('daily_reports', JSON.stringify(reports));
        
        console.log('Daily SEO Report Generated:', report);
    }

    generateSummary(rankings, audit) {
        const avgRanking = Object.values(rankings).reduce((a, b) => a + b, 0) / Object.values(rankings).length;
        const technicalIssues = Object.values(audit.checks).reduce((total, check) => 
            total + (check.issues ? check.issues.length : 0), 0
        );
        
        return {
            averageRanking: Math.round(avgRanking),
            technicalIssueCount: technicalIssues,
            status: technicalIssues === 0 ? 'healthy' : 'needs_attention'
        };
    }

    schedulePerformanceReport() {
        // Send performance report every hour
        setInterval(() => {
            this.sendPerformanceReport();
        }, 60 * 60 * 1000);
    }

    sendPerformanceReport() {
        const metrics = JSON.parse(localStorage.getItem('seo_metrics') || '[]');
        const recentMetrics = metrics.filter(metric => 
            new Date(metric.timestamp) > new Date(Date.now() - 60 * 60 * 1000)
        );
        
        if (recentMetrics.length > 0) {
            console.log('Hourly Performance Report:', recentMetrics);
        }
    }

    createReportingDashboard() {
        // This would create a visual dashboard in the SEO dashboard page
        // For now, just log that monitoring is active
        console.log('SEO Monitoring System Active');
        console.log('Tracking keywords:', this.keywords);
        console.log('Monitoring competitors:', this.competitors);
    }

    // Manual trigger methods for testing
    async runManualCheck() {
        console.log('Running manual SEO check...');
        return await this.runDailyChecks();
    }

    getStoredData() {
        return {
            metrics: JSON.parse(localStorage.getItem('seo_metrics') || '[]'),
            rankings: JSON.parse(localStorage.getItem('keyword_rankings') || '[]'),
            audits: JSON.parse(localStorage.getItem('seo_audits') || '[]'),
            reports: JSON.parse(localStorage.getItem('daily_reports') || '[]')
        };
    }

    clearStoredData() {
        localStorage.removeItem('seo_metrics');
        localStorage.removeItem('keyword_rankings');
        localStorage.removeItem('seo_audits');
        localStorage.removeItem('daily_reports');
        console.log('SEO monitoring data cleared');
    }
}

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

// Initialize SEO monitoring when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.seoMonitor = new SEOMonitor();
});

// Export for manual access
window.SEOMonitor = SEOMonitor;