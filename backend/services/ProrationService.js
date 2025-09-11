const { Subscription, ServicePlan, Invoice, Job } = require('../models');

class ProrationService {
  // Calculate prorated charges when service is modified
  async calculateServiceChange(subscriptionId, newServiceConfig, effectiveDate) {
    try {
      const subscription = await Subscription.findById(subscriptionId);
      const currentConfig = subscription.service_configuration;
      
      // Get current billing cycle
      const billingCycle = this.getCurrentBillingCycle(subscription);
      
      // Calculate days remaining in current cycle
      const daysRemaining = this.calculateDaysRemaining(effectiveDate, billingCycle.end);
      const totalDaysInCycle = this.calculateTotalDays(billingCycle.start, billingCycle.end);
      
      // Get pricing for current and new configurations
      const currentMonthlyPrice = await this.calculateMonthlyPrice(currentConfig);
      const newMonthlyPrice = await this.calculateMonthlyPrice(newServiceConfig);
      
      // Calculate the difference
      const priceDifference = newMonthlyPrice - currentMonthlyPrice;
      
      // Calculate prorated amount based on remaining days
      const prorationAmount = (priceDifference * daysRemaining) / totalDaysInCycle;
      
      // Determine if it's a charge or credit
      const type = prorationAmount >= 0 ? 'charge' : 'credit';
      
      // Calculate upcoming service changes
      const serviceImpact = await this.calculateServiceImpact(
        subscriptionId, 
        currentConfig, 
        newServiceConfig, 
        effectiveDate
      );

      return {
        currentPrice: currentMonthlyPrice,
        newPrice: newMonthlyPrice,
        priceDifference,
        prorationAmount: Math.abs(prorationAmount),
        type,
        daysRemaining,
        totalDaysInCycle,
        effectiveDate,
        serviceImpact,
        breakdown: this.createProrationBreakdown(
          currentConfig, 
          newServiceConfig, 
          daysRemaining, 
          totalDaysInCycle
        )
      };

    } catch (error) {
      console.error('Error calculating service change:', error);
      throw error;
    }
  }

  // Calculate service impact (additional/removed services)
  async calculateServiceImpact(subscriptionId, currentConfig, newConfig, effectiveDate) {
    try {
      // Get remaining scheduled services in current cycle
      const remainingServices = await Job.getScheduledServices(
        subscriptionId, 
        effectiveDate, 
        this.getEndOfCurrentCycle(subscriptionId)
      );

      // Calculate frequency change impact
      const frequencyImpact = this.calculateFrequencyImpact(
        currentConfig.frequency, 
        newConfig.frequency, 
        effectiveDate
      );

      // Calculate add-on services impact
      const addOnImpact = this.calculateAddOnImpact(
        currentConfig.addOns || [], 
        newConfig.addOns || [],
        remainingServices.length
      );

      return {
        remainingServices: remainingServices.length,
        frequencyChange: frequencyImpact,
        addOnChanges: addOnImpact,
        newServicesAdded: frequencyImpact.additionalServices,
        servicesRemoved: frequencyImpact.removedServices
      };

    } catch (error) {
      console.error('Error calculating service impact:', error);
      throw error;
    }
  }

  // Calculate frequency change impact
  calculateFrequencyImpact(currentFrequency, newFrequency, effectiveDate) {
    const frequencyMap = {
      'weekly': 4,
      'biweekly': 2,
      'monthly': 1
    };

    const currentServicesPerMonth = frequencyMap[currentFrequency] || 0;
    const newServicesPerMonth = frequencyMap[newFrequency] || 0;
    
    const serviceDifference = newServicesPerMonth - currentServicesPerMonth;
    
    // Calculate how this affects remaining days in cycle
    const daysRemainingInMonth = this.getDaysRemainingInMonth(effectiveDate);
    const proportionalChange = (serviceDifference * daysRemainingInMonth) / 30;

    return {
      currentFrequency,
      newFrequency,
      currentServicesPerMonth,
      newServicesPerMonth,
      serviceDifference,
      additionalServices: Math.max(0, proportionalChange),
      removedServices: Math.max(0, -proportionalChange)
    };
  }

  // Calculate add-on services impact
  calculateAddOnImpact(currentAddOns, newAddOns, remainingServices) {
    const addedServices = newAddOns.filter(addon => 
      !currentAddOns.find(current => current.id === addon.id)
    );
    
    const removedServices = currentAddOns.filter(addon => 
      !newAddOns.find(newAddon => newAddon.id === addon.id)
    );

    const addedCost = addedServices.reduce((total, addon) => 
      total + (addon.price * remainingServices), 0
    );
    
    const removedCost = removedServices.reduce((total, addon) => 
      total + (addon.price * remainingServices), 0
    );

    return {
      addedServices,
      removedServices,
      addedCost,
      removedCost,
      netCostChange: addedCost - removedCost
    };
  }

  // Calculate final billing for cancellation
  async calculateFinalBilling(subscriptionId, cancellationDate) {
    try {
      const subscription = await Subscription.findById(subscriptionId);
      const billingCycle = this.getCurrentBillingCycle(subscription);
      
      // Get services already provided
      const servicesProvided = await Job.getCompletedServices(
        subscriptionId,
        billingCycle.start,
        cancellationDate
      );

      // Get services scheduled but not yet provided
      const scheduledServices = await Job.getScheduledServices(
        subscriptionId,
        cancellationDate,
        billingCycle.end
      );

      // Calculate refund for unused services
      const monthlyPrice = await this.calculateMonthlyPrice(subscription.service_configuration);
      const dailyRate = monthlyPrice / this.calculateTotalDays(billingCycle.start, billingCycle.end);
      const unusedDays = this.calculateDaysRemaining(cancellationDate, billingCycle.end);
      const refundAmount = dailyRate * unusedDays;

      // Calculate any outstanding charges
      const outstandingCharges = await this.calculateOutstandingCharges(subscriptionId);

      return {
        cancellationDate,
        servicesProvided: servicesProvided.length,
        scheduledServices: scheduledServices.length,
        monthlyPrice,
        unusedDays,
        refundAmount: Math.max(0, refundAmount),
        outstandingCharges,
        netRefund: Math.max(0, refundAmount - outstandingCharges),
        finalCharges: Math.max(0, outstandingCharges - refundAmount)
      };

    } catch (error) {
      console.error('Error calculating final billing:', error);
      throw error;
    }
  }

  // Calculate pause adjustments
  async calculatePauseAdjustments(subscriptionId, pauseStartDate, pauseEndDate) {
    try {
      const subscription = await Subscription.findById(subscriptionId);
      const monthlyPrice = await this.calculateMonthlyPrice(subscription.service_configuration);
      
      // Calculate pause duration
      const pauseDays = this.calculateDaysBetween(pauseStartDate, pauseEndDate);
      const dailyRate = monthlyPrice / 30; // Assuming 30-day month for simplicity
      
      // Calculate services that will be skipped
      const skippedServices = await Job.getScheduledServices(
        subscriptionId,
        pauseStartDate,
        pauseEndDate
      );

      // Calculate credit amount
      const creditAmount = dailyRate * pauseDays;

      return {
        pauseStartDate,
        pauseEndDate,
        pauseDays,
        skippedServices: skippedServices.length,
        dailyRate,
        creditAmount,
        appliedTo: 'next_billing_cycle'
      };

    } catch (error) {
      console.error('Error calculating pause adjustments:', error);
      throw error;
    }
  }

  // Preview billing changes before applying
  async previewBillingChanges(subscriptionId, proposedChanges, effectiveDate) {
    try {
      const subscription = await Subscription.findById(subscriptionId);
      
      // Calculate immediate proration
      const immediateProration = await this.calculateServiceChange(
        subscriptionId,
        proposedChanges,
        effectiveDate
      );

      // Calculate next billing cycle impact
      const nextCycleImpact = await this.calculateNextCycleImpact(
        subscription.service_configuration,
        proposedChanges
      );

      // Calculate annual impact
      const annualImpact = this.calculateAnnualImpact(
        subscription.service_configuration,
        proposedChanges
      );

      return {
        immediateProration,
        nextCycleImpact,
        annualImpact,
        effectiveDate,
        summary: this.createChangeSummary(immediateProration, nextCycleImpact, annualImpact)
      };

    } catch (error) {
      console.error('Error previewing billing changes:', error);
      throw error;
    }
  }

  // Calculate next billing amount considering credits/changes
  async calculateNextBillingAmount(subscriptionId) {
    try {
      const subscription = await Subscription.findById(subscriptionId);
      
      // Get base monthly price
      const basePrice = await this.calculateMonthlyPrice(subscription.service_configuration);
      
      // Get any pending changes
      const pendingChanges = await Subscription.getPendingChanges(subscriptionId);
      
      // Get available credits
      const availableCredits = await Subscription.getAvailableCredits(subscriptionId);
      
      // Calculate adjustments
      let adjustments = 0;
      for (const change of pendingChanges) {
        if (change.proration_type === 'charge') {
          adjustments += change.proration_amount;
        } else {
          adjustments -= change.proration_amount;
        }
      }

      // Apply credits
      const finalAmount = Math.max(0, basePrice + adjustments - availableCredits);

      return {
        basePrice,
        adjustments,
        availableCredits,
        finalAmount,
        breakdown: {
          base: basePrice,
          prorationCharges: pendingChanges.filter(c => c.proration_type === 'charge')
            .reduce((sum, c) => sum + c.proration_amount, 0),
          prorationCredits: pendingChanges.filter(c => c.proration_type === 'credit')
            .reduce((sum, c) => sum + c.proration_amount, 0),
          appliedCredits: Math.min(availableCredits, basePrice + adjustments)
        }
      };

    } catch (error) {
      console.error('Error calculating next billing amount:', error);
      throw error;
    }
  }

  // Helper methods
  async calculateMonthlyPrice(serviceConfiguration) {
    try {
      const basePlan = await ServicePlan.findById(serviceConfiguration.planId);
      let totalPrice = basePlan.base_price;

      // Add frequency multiplier
      const frequencyMultipliers = {
        'weekly': 4,
        'biweekly': 2,
        'monthly': 1
      };
      
      const multiplier = frequencyMultipliers[serviceConfiguration.frequency] || 1;
      totalPrice = basePlan.base_price * multiplier;

      // Add add-on services
      if (serviceConfiguration.addOns) {
        for (const addon of serviceConfiguration.addOns) {
          totalPrice += addon.price * multiplier;
        }
      }

      return totalPrice;
    } catch (error) {
      console.error('Error calculating monthly price:', error);
      throw error;
    }
  }

  getCurrentBillingCycle(subscription) {
    return {
      start: new Date(subscription.current_period_start),
      end: new Date(subscription.current_period_end)
    };
  }

  calculateDaysRemaining(fromDate, toDate) {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const diffTime = Math.abs(to - from);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  calculateTotalDays(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  calculateDaysBetween(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getDaysRemainingInMonth(date) {
    const currentDate = new Date(date);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    return this.calculateDaysRemaining(currentDate, lastDay);
  }

  async calculateOutstandingCharges(subscriptionId) {
    const unpaidInvoices = await Invoice.getUnpaidBySubscription(subscriptionId);
    return unpaidInvoices.reduce((total, invoice) => total + invoice.total_amount, 0);
  }

  calculateNextCycleImpact(currentConfig, newConfig) {
    const currentPrice = this.calculateMonthlyPrice(currentConfig);
    const newPrice = this.calculateMonthlyPrice(newConfig);
    
    return {
      currentMonthlyPrice: currentPrice,
      newMonthlyPrice: newPrice,
      monthlyDifference: newPrice - currentPrice,
      percentageChange: currentPrice > 0 ? ((newPrice - currentPrice) / currentPrice) * 100 : 0
    };
  }

  calculateAnnualImpact(currentConfig, newConfig) {
    const monthlyImpact = this.calculateNextCycleImpact(currentConfig, newConfig);
    
    return {
      currentAnnualPrice: monthlyImpact.currentMonthlyPrice * 12,
      newAnnualPrice: monthlyImpact.newMonthlyPrice * 12,
      annualDifference: monthlyImpact.monthlyDifference * 12,
      annualSavings: Math.max(0, -monthlyImpact.monthlyDifference * 12),
      additionalAnnualCost: Math.max(0, monthlyImpact.monthlyDifference * 12)
    };
  }

  createProrationBreakdown(currentConfig, newConfig, daysRemaining, totalDays) {
    return {
      currentConfiguration: currentConfig,
      newConfiguration: newConfig,
      billingPeriod: {
        totalDays,
        daysRemaining,
        daysUsed: totalDays - daysRemaining,
        prorationPercentage: (daysRemaining / totalDays) * 100
      }
    };
  }

  createChangeSummary(immediateProration, nextCycleImpact, annualImpact) {
    return {
      immediateCharge: immediateProration.type === 'charge' ? immediateProration.prorationAmount : 0,
      immediateCredit: immediateProration.type === 'credit' ? immediateProration.prorationAmount : 0,
      monthlyChange: nextCycleImpact.monthlyDifference,
      annualChange: annualImpact.annualDifference,
      recommendation: this.generateRecommendation(immediateProration, nextCycleImpact, annualImpact)
    };
  }

  generateRecommendation(immediateProration, nextCycleImpact, annualImpact) {
    if (annualImpact.annualSavings > 0) {
      return `This change will save you $${annualImpact.annualSavings.toFixed(2)} annually.`;
    } else if (annualImpact.additionalAnnualCost > 0) {
      return `This upgrade will cost an additional $${annualImpact.additionalAnnualCost.toFixed(2)} annually but provides enhanced service.`;
    } else {
      return 'This change will not affect your annual cost.';
    }
  }

  async getProrationDetails(invoiceId) {
    // Get proration details for a specific invoice
    const prorationRecord = await Invoice.getProrationDetails(invoiceId);
    return prorationRecord;
  }
}

module.exports = new ProrationService();