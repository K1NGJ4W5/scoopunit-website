const { Client, Job, Payment, Invoice, FieldTechnician, Route } = require('../models');

class AnalyticsService {
  // Business Dashboard Analytics
  async getBusinessDashboard(dateRange = 'month') {
    try {
      const { startDate, endDate } = this.getDateRange(dateRange);
      
      const [
        revenue,
        jobStats,
        clientStats,
        performanceMetrics,
        growthMetrics
      ] = await Promise.all([
        this.getRevenueMetrics(startDate, endDate),
        this.getJobMetrics(startDate, endDate),
        this.getClientMetrics(startDate, endDate),
        this.getPerformanceMetrics(startDate, endDate),
        this.getGrowthMetrics(startDate, endDate)
      ]);

      return {
        revenue,
        jobs: jobStats,
        clients: clientStats,
        performance: performanceMetrics,
        growth: growthMetrics,
        period: { startDate, endDate, range: dateRange }
      };
    } catch (error) {
      console.error('Error getting business dashboard:', error);
      throw error;
    }
  }

  // Revenue Analytics
  async getRevenueMetrics(startDate, endDate) {
    const [
      totalRevenue,
      recurringRevenue,
      oneTimeRevenue,
      averageOrderValue,
      revenueByService,
      monthlyRecurring
    ] = await Promise.all([
      Payment.getTotalRevenue(startDate, endDate),
      Payment.getRecurringRevenue(startDate, endDate),
      Payment.getOneTimeRevenue(startDate, endDate),
      Payment.getAverageOrderValue(startDate, endDate),
      Payment.getRevenueByServiceType(startDate, endDate),
      Payment.getMonthlyRecurringRevenue()
    ]);

    return {
      total: totalRevenue,
      recurring: recurringRevenue,
      oneTime: oneTimeRevenue,
      averageOrderValue,
      byService: revenueByService,
      monthlyRecurring,
      growthRate: await this.calculateRevenueGrowthRate(startDate, endDate)
    };
  }

  // Job Performance Analytics
  async getJobMetrics(startDate, endDate) {
    const [
      totalJobs,
      completedJobs,
      cancelledJobs,
      averageDuration,
      onTimePercentage,
      jobsByType,
      jobsByStatus
    ] = await Promise.all([
      Job.getCount(startDate, endDate),
      Job.getCompletedCount(startDate, endDate),
      Job.getCancelledCount(startDate, endDate),
      Job.getAverageDuration(startDate, endDate),
      Job.getOnTimePercentage(startDate, endDate),
      Job.getCountByType(startDate, endDate),
      Job.getCountByStatus(startDate, endDate)
    ]);

    const completionRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0;
    const cancellationRate = totalJobs > 0 ? (cancelledJobs / totalJobs) * 100 : 0;

    return {
      total: totalJobs,
      completed: completedJobs,
      cancelled: cancelledJobs,
      completionRate,
      cancellationRate,
      averageDuration,
      onTimePercentage,
      byType: jobsByType,
      byStatus: jobsByStatus
    };
  }

  // Client Analytics
  async getClientMetrics(startDate, endDate) {
    const [
      totalClients,
      activeClients,
      newClients,
      churnedClients,
      clientsByStatus,
      averageLifetimeValue,
      clientSatisfaction
    ] = await Promise.all([
      Client.getTotalCount(),
      Client.getActiveCount(),
      Client.getNewCount(startDate, endDate),
      Client.getChurnedCount(startDate, endDate),
      Client.getCountByStatus(),
      Client.getAverageLifetimeValue(),
      Job.getAverageClientSatisfaction(startDate, endDate)
    ]);

    const churnRate = totalClients > 0 ? (churnedClients / totalClients) * 100 : 0;
    const retentionRate = 100 - churnRate;

    return {
      total: totalClients,
      active: activeClients,
      new: newClients,
      churned: churnedClients,
      churnRate,
      retentionRate,
      byStatus: clientsByStatus,
      averageLifetimeValue,
      satisfaction: clientSatisfaction
    };
  }

  // Performance Metrics
  async getPerformanceMetrics(startDate, endDate) {
    const [
      techPerformance,
      routeEfficiency,
      customerSatisfaction,
      crossSellSuccess
    ] = await Promise.all([
      this.getTechPerformanceMetrics(startDate, endDate),
      this.getRouteEfficiencyMetrics(startDate, endDate),
      this.getCustomerSatisfactionMetrics(startDate, endDate),
      this.getCrossSellMetrics(startDate, endDate)
    ]);

    return {
      technicians: techPerformance,
      routes: routeEfficiency,
      satisfaction: customerSatisfaction,
      crossSells: crossSellSuccess
    };
  }

  async getTechPerformanceMetrics(startDate, endDate) {
    const techs = await FieldTechnician.getAllActive();
    const performanceData = [];

    for (const tech of techs) {
      const [
        jobsCompleted,
        averageJobTime,
        onTimePercentage,
        customerRating,
        totalDistance,
        hoursWorked
      ] = await Promise.all([
        Job.getCompletedCountByTech(tech.id, startDate, endDate),
        Job.getAverageJobTimeByTech(tech.id, startDate, endDate),
        Job.getOnTimePercentageByTech(tech.id, startDate, endDate),
        Job.getAverageRatingByTech(tech.id, startDate, endDate),
        Route.getTotalDistanceByTech(tech.id, startDate, endDate),
        this.getHoursWorkedByTech(tech.id, startDate, endDate)
      ]);

      const efficiency = hoursWorked > 0 ? jobsCompleted / hoursWorked : 0;

      performanceData.push({
        techId: tech.id,
        name: `${tech.first_name} ${tech.last_name}`,
        jobsCompleted,
        averageJobTime,
        onTimePercentage,
        customerRating,
        totalDistance,
        hoursWorked,
        efficiency
      });
    }

    return performanceData;
  }

  async getRouteEfficiencyMetrics(startDate, endDate) {
    const [
      averageDistance,
      averageDuration,
      fuelEfficiency,
      optimizationSavings
    ] = await Promise.all([
      Route.getAverageDistance(startDate, endDate),
      Route.getAverageDuration(startDate, endDate),
      this.calculateFuelEfficiency(startDate, endDate),
      this.calculateOptimizationSavings(startDate, endDate)
    ]);

    return {
      averageDistance,
      averageDuration,
      fuelEfficiency,
      optimizationSavings
    };
  }

  async getCustomerSatisfactionMetrics(startDate, endDate) {
    const [
      overallRating,
      ratingDistribution,
      feedbackCount,
      complaintsCount,
      resolutionRate
    ] = await Promise.all([
      Job.getAverageClientRating(startDate, endDate),
      Job.getRatingDistribution(startDate, endDate),
      Job.getFeedbackCount(startDate, endDate),
      this.getComplaintsCount(startDate, endDate),
      this.getComplaintResolutionRate(startDate, endDate)
    ]);

    return {
      overallRating,
      distribution: ratingDistribution,
      feedbackCount,
      complaintsCount,
      resolutionRate
    };
  }

  async getCrossSellMetrics(startDate, endDate) {
    // Implement cross-sell analytics
    return {
      opportunitiesIdentified: 0,
      conversionRate: 0,
      additionalRevenue: 0
    };
  }

  // Growth Analytics
  async getGrowthMetrics(startDate, endDate) {
    const [
      clientGrowthRate,
      revenueGrowthRate,
      marketPenetration,
      serviceAreaExpansion
    ] = await Promise.all([
      this.calculateClientGrowthRate(startDate, endDate),
      this.calculateRevenueGrowthRate(startDate, endDate),
      this.calculateMarketPenetration(),
      this.getServiceAreaGrowth(startDate, endDate)
    ]);

    return {
      clientGrowthRate,
      revenueGrowthRate,
      marketPenetration,
      serviceAreaExpansion
    };
  }

  // Franchise/Royalty Analytics
  async getFranchiseAnalytics(franchiseId = null, dateRange = 'month') {
    const { startDate, endDate } = this.getDateRange(dateRange);
    
    if (franchiseId) {
      return await this.getSingleFranchiseAnalytics(franchiseId, startDate, endDate);
    } else {
      return await this.getAllFranchisesAnalytics(startDate, endDate);
    }
  }

  async getSingleFranchiseAnalytics(franchiseId, startDate, endDate) {
    const [
      revenue,
      royaltyAmount,
      clientCount,
      jobCount,
      performance
    ] = await Promise.all([
      Payment.getRevenueByFranchise(franchiseId, startDate, endDate),
      this.calculateRoyaltyAmount(franchiseId, startDate, endDate),
      Client.getCountByFranchise(franchiseId),
      Job.getCountByFranchise(franchiseId, startDate, endDate),
      this.getFranchisePerformanceMetrics(franchiseId, startDate, endDate)
    ]);

    return {
      franchiseId,
      revenue,
      royaltyAmount,
      clientCount,
      jobCount,
      performance
    };
  }

  // Financial Reports
  async generateFinancialReport(type, startDate, endDate) {
    switch (type) {
      case 'profit_loss':
        return await this.generateProfitLossReport(startDate, endDate);
      case 'cash_flow':
        return await this.generateCashFlowReport(startDate, endDate);
      case 'balance_sheet':
        return await this.generateBalanceSheetReport(startDate, endDate);
      case 'revenue_breakdown':
        return await this.generateRevenueBreakdownReport(startDate, endDate);
      default:
        throw new Error('Invalid report type');
    }
  }

  async generateProfitLossReport(startDate, endDate) {
    const [
      revenue,
      expenses,
      payrollCosts,
      operationalCosts
    ] = await Promise.all([
      Payment.getTotalRevenue(startDate, endDate),
      this.getTotalExpenses(startDate, endDate),
      this.getPayrollCosts(startDate, endDate),
      this.getOperationalCosts(startDate, endDate)
    ]);

    const grossProfit = revenue - expenses;
    const netProfit = grossProfit - payrollCosts - operationalCosts;
    const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

    return {
      revenue,
      expenses,
      grossProfit,
      payrollCosts,
      operationalCosts,
      netProfit,
      profitMargin
    };
  }

  // Utility Methods
  getDateRange(range) {
    const now = new Date();
    let startDate, endDate = now;

    switch (range) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return { startDate, endDate };
  }

  async calculateRevenueGrowthRate(startDate, endDate) {
    const currentRevenue = await Payment.getTotalRevenue(startDate, endDate);
    const period = endDate - startDate;
    const previousStartDate = new Date(startDate.getTime() - period);
    const previousEndDate = startDate;
    const previousRevenue = await Payment.getTotalRevenue(previousStartDate, previousEndDate);

    if (previousRevenue === 0) return 0;
    return ((currentRevenue - previousRevenue) / previousRevenue) * 100;
  }

  async calculateClientGrowthRate(startDate, endDate) {
    const currentClients = await Client.getNewCount(startDate, endDate);
    const period = endDate - startDate;
    const previousStartDate = new Date(startDate.getTime() - period);
    const previousEndDate = startDate;
    const previousClients = await Client.getNewCount(previousStartDate, previousEndDate);

    if (previousClients === 0) return currentClients > 0 ? 100 : 0;
    return ((currentClients - previousClients) / previousClients) * 100;
  }

  async calculateMarketPenetration() {
    // This would need market data - placeholder implementation
    const totalClients = await Client.getTotalCount();
    const estimatedMarketSize = 10000; // This would come from market research
    
    return (totalClients / estimatedMarketSize) * 100;
  }

  // Export methods for reports
  async exportAnalyticsToCSV(reportType, data) {
    // Implement CSV export functionality
    const csv = this.convertToCSV(data);
    return csv;
  }

  async exportAnalyticsToPDF(reportType, data) {
    // Implement PDF export functionality
    // This would use a library like puppeteer or jsPDF
    return 'PDF export functionality to be implemented';
  }

  convertToCSV(data) {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => JSON.stringify(row[header])).join(','))
    ].join('\n');
    
    return csvContent;
  }
}

module.exports = new AnalyticsService();