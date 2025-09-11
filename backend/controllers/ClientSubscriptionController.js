const { Client, Subscription, Invoice, Payment } = require('../models');
const StripeService = require('../services/StripeService');
const QuickBooksService = require('../services/QuickBooksService');
const ProrationService = require('../services/ProrationService');
const NotificationService = require('../services/NotificationService');

class ClientSubscriptionController {
  // Get client subscription details
  async getSubscription(req, res) {
    try {
      const clientId = req.user.client.id;
      const subscription = await Subscription.getByClientId(clientId);
      
      if (!subscription) {
        return res.status(404).json({ error: 'No active subscription found' });
      }

      // Get current billing cycle info
      const billingCycle = await this.getCurrentBillingCycle(subscription);
      
      // Get pending changes
      const pendingChanges = await Subscription.getPendingChanges(subscription.id);
      
      // Calculate next billing amount
      const nextBillingAmount = await ProrationService.calculateNextBillingAmount(subscription.id);

      res.json({
        subscription: {
          ...subscription,
          billingCycle,
          pendingChanges,
          nextBillingAmount
        }
      });
    } catch (error) {
      console.error('Error getting subscription:', error);
      res.status(500).json({ error: 'Failed to get subscription details' });
    }
  }

  // Update service requirements with prorated billing
  async updateServiceRequirements(req, res) {
    try {
      const clientId = req.user.client.id;
      const { 
        frequency, 
        serviceType, 
        addOns, 
        specialInstructions,
        effectiveDate = new Date() 
      } = req.body;

      const subscription = await Subscription.getByClientId(clientId);
      if (!subscription) {
        return res.status(404).json({ error: 'No active subscription found' });
      }

      // Calculate prorated charges/credits
      const prorationCalculation = await ProrationService.calculateServiceChange(
        subscription.id,
        { frequency, serviceType, addOns },
        effectiveDate
      );

      // Create pending service change
      const serviceChange = await Subscription.createPendingChange({
        subscription_id: subscription.id,
        change_type: 'service_modification',
        old_configuration: subscription.service_configuration,
        new_configuration: { frequency, serviceType, addOns, specialInstructions },
        effective_date: effectiveDate,
        proration_amount: prorationCalculation.prorationAmount,
        proration_type: prorationCalculation.type, // 'charge' or 'credit'
        status: 'pending_confirmation'
      });

      // If change is for current month, apply immediately
      if (this.isCurrentMonth(effectiveDate)) {
        await this.applyImmediateServiceChange(subscription.id, serviceChange.id, prorationCalculation);
      }

      res.json({
        success: true,
        serviceChange,
        prorationCalculation,
        message: prorationCalculation.type === 'charge' 
          ? `Service upgrade will result in a prorated charge of $${prorationCalculation.prorationAmount.toFixed(2)}`
          : `Service downgrade will result in a credit of $${prorationCalculation.prorationAmount.toFixed(2)} on your next bill`
      });

    } catch (error) {
      console.error('Error updating service requirements:', error);
      res.status(500).json({ error: 'Failed to update service requirements' });
    }
  }

  // Update payment method with provider switching
  async updatePaymentMethod(req, res) {
    try {
      const clientId = req.user.client.id;
      const { paymentType, paymentDetails } = req.body;
      
      const client = await Client.findById(clientId);
      const subscription = await Subscription.getByClientId(clientId);

      let paymentMethodResult;

      if (paymentType === 'credit_card') {
        // Use Stripe for credit card payments
        paymentMethodResult = await this.setupStripePayment(client, subscription, paymentDetails);
      } else if (paymentType === 'ach' || paymentType === 'check') {
        // Use QuickBooks for ACH/Check payments
        paymentMethodResult = await this.setupQuickBooksPayment(client, subscription, paymentDetails);
      } else {
        return res.status(400).json({ error: 'Invalid payment type' });
      }

      // Update subscription payment method
      await Subscription.update(subscription.id, {
        payment_provider: paymentMethodResult.provider,
        payment_method_id: paymentMethodResult.paymentMethodId,
        payment_type: paymentType
      });

      // Log payment method change
      await this.logPaymentMethodChange(clientId, paymentType, paymentMethodResult.provider);

      res.json({
        success: true,
        paymentMethod: {
          type: paymentType,
          provider: paymentMethodResult.provider,
          last4: paymentMethodResult.last4,
          brand: paymentMethodResult.brand
        },
        message: 'Payment method updated successfully'
      });

    } catch (error) {
      console.error('Error updating payment method:', error);
      res.status(500).json({ error: 'Failed to update payment method' });
    }
  }

  async setupStripePayment(client, subscription, paymentDetails) {
    try {
      // Create or update Stripe customer
      if (!client.stripe_customer_id) {
        const stripeCustomer = await StripeService.createCustomer({
          email: client.email,
          firstName: client.first_name,
          lastName: client.last_name,
          phone: client.phone,
          address: client.address,
          id: client.id
        });
        
        await Client.update(client.id, { stripe_customer_id: stripeCustomer.id });
        client.stripe_customer_id = stripeCustomer.id;
      }

      // Add payment method to Stripe
      const paymentMethod = await StripeService.addPaymentMethod(
        client.stripe_customer_id, 
        paymentDetails.payment_method_id
      );

      // Set as default payment method
      await StripeService.setDefaultPaymentMethod(
        client.stripe_customer_id,
        paymentDetails.payment_method_id
      );

      return {
        provider: 'stripe',
        paymentMethodId: paymentMethod.id,
        last4: paymentMethod.card.last4,
        brand: paymentMethod.card.brand
      };

    } catch (error) {
      console.error('Error setting up Stripe payment:', error);
      throw error;
    }
  }

  async setupQuickBooksPayment(client, subscription, paymentDetails) {
    try {
      // Sync client to QuickBooks if not already synced
      if (!client.quickbooks_id) {
        await QuickBooksService.syncClientToQB(client.id);
        const updatedClient = await Client.findById(client.id);
        client.quickbooks_id = updatedClient.quickbooks_id;
      }

      // Store ACH/Check details
      const paymentMethodData = {
        client_id: client.id,
        type: paymentDetails.type, // 'ach' or 'check'
        provider: 'quickbooks',
        bank_name: paymentDetails.bankName,
        account_type: paymentDetails.accountType,
        routing_number: paymentDetails.routingNumber,
        account_number_last4: paymentDetails.accountNumber.slice(-4),
        is_active: true
      };

      // Save payment method (encrypted)
      const savedPaymentMethod = await Client.addPaymentMethod(paymentMethodData);

      return {
        provider: 'quickbooks',
        paymentMethodId: savedPaymentMethod.id,
        last4: paymentDetails.accountNumber.slice(-4),
        brand: paymentDetails.bankName
      };

    } catch (error) {
      console.error('Error setting up QuickBooks payment:', error);
      throw error;
    }
  }

  // Cancel subscription with 30-day notice
  async cancelSubscription(req, res) {
    try {
      const clientId = req.user.client.id;
      const { reason, feedback, requestedEndDate } = req.body;

      const subscription = await Subscription.getByClientId(clientId);
      if (!subscription) {
        return res.status(404).json({ error: 'No active subscription found' });
      }

      // Calculate earliest cancellation date (30 days from now)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      // Determine actual end date
      const endDate = requestedEndDate && new Date(requestedEndDate) > thirtyDaysFromNow 
        ? new Date(requestedEndDate) 
        : thirtyDaysFromNow;

      // Create cancellation request
      const cancellationRequest = await Subscription.createCancellationRequest({
        subscription_id: subscription.id,
        requested_end_date: endDate,
        reason: reason,
        feedback: feedback,
        status: 'pending',
        notice_date: new Date()
      });

      // Calculate final billing adjustments
      const finalBilling = await ProrationService.calculateFinalBilling(subscription.id, endDate);

      // Schedule cancellation
      await Subscription.update(subscription.id, {
        status: 'cancellation_pending',
        end_date: endDate,
        cancellation_request_id: cancellationRequest.id
      });

      // Send confirmation notification
      await NotificationService.sendCancellationConfirmation(clientId, {
        endDate,
        finalBilling,
        remainingServices: finalBilling.remainingServices
      });

      res.json({
        success: true,
        cancellationRequest,
        endDate,
        finalBilling,
        message: `Cancellation scheduled for ${endDate.toDateString()}. You will continue to receive service until this date.`
      });

    } catch (error) {
      console.error('Error canceling subscription:', error);
      res.status(500).json({ error: 'Failed to cancel subscription' });
    }
  }

  // Pause subscription
  async pauseSubscription(req, res) {
    try {
      const clientId = req.user.client.id;
      const { pauseStartDate, pauseEndDate, reason } = req.body;

      const subscription = await Subscription.getByClientId(clientId);
      if (!subscription) {
        return res.status(404).json({ error: 'No active subscription found' });
      }

      // Create pause request
      const pauseRequest = await Subscription.createPauseRequest({
        subscription_id: subscription.id,
        pause_start_date: pauseStartDate,
        pause_end_date: pauseEndDate,
        reason: reason,
        status: 'approved' // Auto-approve pause requests
      });

      // Calculate billing adjustments during pause
      const pauseAdjustments = await ProrationService.calculatePauseAdjustments(
        subscription.id, 
        pauseStartDate, 
        pauseEndDate
      );

      // Update subscription billing
      if (subscription.payment_provider === 'stripe') {
        await StripeService.pauseSubscription(subscription.stripe_subscription_id);
      }

      // Update subscription status
      await Subscription.update(subscription.id, {
        status: 'paused',
        pause_start_date: pauseStartDate,
        pause_end_date: pauseEndDate
      });

      res.json({
        success: true,
        pauseRequest,
        pauseAdjustments,
        message: `Subscription paused from ${new Date(pauseStartDate).toDateString()} to ${new Date(pauseEndDate).toDateString()}`
      });

    } catch (error) {
      console.error('Error pausing subscription:', error);
      res.status(500).json({ error: 'Failed to pause subscription' });
    }
  }

  // Resume subscription
  async resumeSubscription(req, res) {
    try {
      const clientId = req.user.client.id;
      const { resumeDate } = req.body;

      const subscription = await Subscription.getByClientId(clientId);
      if (!subscription || subscription.status !== 'paused') {
        return res.status(400).json({ error: 'No paused subscription found' });
      }

      // Resume billing
      if (subscription.payment_provider === 'stripe') {
        await StripeService.resumeSubscription(subscription.stripe_subscription_id);
      }

      // Update subscription status
      await Subscription.update(subscription.id, {
        status: 'active',
        pause_start_date: null,
        pause_end_date: null,
        next_service_date: resumeDate || new Date()
      });

      // Recalculate upcoming services
      await this.recalculateServiceSchedule(subscription.id, resumeDate);

      res.json({
        success: true,
        message: 'Subscription resumed successfully',
        nextServiceDate: resumeDate || new Date()
      });

    } catch (error) {
      console.error('Error resuming subscription:', error);
      res.status(500).json({ error: 'Failed to resume subscription' });
    }
  }

  // Get billing history with detailed breakdown
  async getBillingHistory(req, res) {
    try {
      const clientId = req.user.client.id;
      const { limit = 12, offset = 0 } = req.query;

      const billingHistory = await Invoice.getClientBillingHistory(clientId, limit, offset);
      
      // Enhance with proration details
      const enhancedHistory = await Promise.all(
        billingHistory.map(async (invoice) => {
          const prorationDetails = await ProrationService.getProrationDetails(invoice.id);
          return {
            ...invoice,
            prorationDetails
          };
        })
      );

      res.json({
        billingHistory: enhancedHistory,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: billingHistory.length === parseInt(limit)
        }
      });

    } catch (error) {
      console.error('Error getting billing history:', error);
      res.status(500).json({ error: 'Failed to get billing history' });
    }
  }

  // Preview billing changes
  async previewBillingChanges(req, res) {
    try {
      const clientId = req.user.client.id;
      const { changes, effectiveDate } = req.body;

      const subscription = await Subscription.getByClientId(clientId);
      if (!subscription) {
        return res.status(404).json({ error: 'No active subscription found' });
      }

      const preview = await ProrationService.previewBillingChanges(
        subscription.id,
        changes,
        effectiveDate
      );

      res.json({
        preview,
        currentPlan: subscription.service_configuration,
        proposedPlan: changes,
        effectiveDate
      });

    } catch (error) {
      console.error('Error previewing billing changes:', error);
      res.status(500).json({ error: 'Failed to preview billing changes' });
    }
  }

  // Helper methods
  async getCurrentBillingCycle(subscription) {
    const now = new Date();
    const cycleStart = new Date(subscription.current_period_start);
    const cycleEnd = new Date(subscription.current_period_end);
    
    return {
      start: cycleStart,
      end: cycleEnd,
      daysRemaining: Math.ceil((cycleEnd - now) / (1000 * 60 * 60 * 24)),
      totalDays: Math.ceil((cycleEnd - cycleStart) / (1000 * 60 * 60 * 24))
    };
  }

  isCurrentMonth(date) {
    const now = new Date();
    const targetDate = new Date(date);
    return now.getMonth() === targetDate.getMonth() && now.getFullYear() === targetDate.getFullYear();
  }

  async applyImmediateServiceChange(subscriptionId, changeId, prorationCalculation) {
    try {
      // Apply the service change immediately
      await Subscription.applyPendingChange(changeId);
      
      // Create proration invoice if there's a charge
      if (prorationCalculation.type === 'charge' && prorationCalculation.prorationAmount > 0) {
        await this.createProrationInvoice(subscriptionId, prorationCalculation);
      }
      
      // Apply credit if there's a refund
      if (prorationCalculation.type === 'credit' && prorationCalculation.prorationAmount > 0) {
        await this.applyServiceCredit(subscriptionId, prorationCalculation);
      }

    } catch (error) {
      console.error('Error applying immediate service change:', error);
      throw error;
    }
  }

  async createProrationInvoice(subscriptionId, prorationCalculation) {
    const subscription = await Subscription.findById(subscriptionId);
    const client = await Client.findById(subscription.client_id);

    const invoiceData = {
      client_id: client.id,
      subscription_id: subscriptionId,
      amount: prorationCalculation.prorationAmount,
      tax_amount: 0,
      total_amount: prorationCalculation.prorationAmount,
      invoice_date: new Date(),
      due_date: new Date(),
      type: 'proration',
      description: 'Prorated charge for service upgrade'
    };

    const invoice = await Invoice.create(invoiceData);
    
    // Auto-charge if payment method is available
    if (subscription.payment_provider === 'stripe') {
      await StripeService.createAndChargeInvoice(invoice.id);
    }

    return invoice;
  }

  async applyServiceCredit(subscriptionId, prorationCalculation) {
    // Apply credit to next billing cycle
    await Subscription.addCredit(subscriptionId, prorationCalculation.prorationAmount);
  }

  async recalculateServiceSchedule(subscriptionId, resumeDate) {
    // Recalculate upcoming service dates based on frequency and resume date
    const subscription = await Subscription.findById(subscriptionId);
    const scheduleService = require('../services/ScheduleService');
    
    await scheduleService.regenerateSchedule(subscriptionId, resumeDate);
  }

  async logPaymentMethodChange(clientId, paymentType, provider) {
    // Log the payment method change for audit purposes
    await Client.addActivityLog(clientId, {
      action: 'payment_method_changed',
      details: {
        new_payment_type: paymentType,
        new_provider: provider,
        timestamp: new Date()
      }
    });
  }
}

module.exports = new ClientSubscriptionController();