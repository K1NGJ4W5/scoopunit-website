const { Client, Subscription, Payment, Invoice } = require('../models');
const StripeService = require('../services/StripeService');
const QuickBooksService = require('../services/QuickBooksService');
const EncryptionService = require('../services/EncryptionService');

class EnhancedPaymentController {
  // Get all payment methods for client (both Stripe and QuickBooks)
  async getPaymentMethods(req, res) {
    try {
      const clientId = req.user.client.id;
      const client = await Client.findById(clientId);

      const paymentMethods = [];

      // Get Stripe payment methods
      if (client.stripe_customer_id) {
        const stripePaymentMethods = await StripeService.getCustomerPaymentMethods(client.stripe_customer_id);
        paymentMethods.push(...stripePaymentMethods.map(pm => ({
          id: pm.id,
          provider: 'stripe',
          type: 'credit_card',
          last4: pm.card.last4,
          brand: pm.card.brand,
          expMonth: pm.card.exp_month,
          expYear: pm.card.exp_year,
          isDefault: pm.id === client.default_payment_method_id,
          isActive: true
        })));
      }

      // Get QuickBooks payment methods (ACH/Check)
      const qbPaymentMethods = await Client.getPaymentMethods(clientId);
      paymentMethods.push(...qbPaymentMethods.map(pm => ({
        id: pm.id,
        provider: 'quickbooks',
        type: pm.type,
        last4: pm.account_number_last4,
        brand: pm.bank_name,
        accountType: pm.account_type,
        isDefault: pm.is_default,
        isActive: pm.is_active
      })));

      res.json({
        paymentMethods,
        totalCount: paymentMethods.length,
        hasStripePayments: paymentMethods.some(pm => pm.provider === 'stripe'),
        hasQuickBooksPayments: paymentMethods.some(pm => pm.provider === 'quickbooks')
      });

    } catch (error) {
      console.error('Error getting payment methods:', error);
      res.status(500).json({ error: 'Failed to get payment methods' });
    }
  }

  // Add credit card payment method (Stripe)
  async addCreditCard(req, res) {
    try {
      const clientId = req.user.client.id;
      const { payment_method_id, set_as_default = false } = req.body;

      const client = await Client.findById(clientId);

      // Create Stripe customer if doesn't exist
      if (!client.stripe_customer_id) {
        const stripeCustomer = await StripeService.createCustomer({
          email: client.email,
          firstName: client.first_name,
          lastName: client.last_name,
          phone: client.phone,
          address: {
            line1: client.address_line1,
            line2: client.address_line2,
            city: client.city,
            state: client.state,
            zipCode: client.zip_code
          },
          id: client.id
        });

        await Client.update(clientId, { stripe_customer_id: stripeCustomer.id });
        client.stripe_customer_id = stripeCustomer.id;
      }

      // Add payment method to Stripe
      const paymentMethod = await StripeService.addPaymentMethod(
        client.stripe_customer_id,
        payment_method_id
      );

      // Set as default if requested or if it's the first payment method
      if (set_as_default) {
        await StripeService.setDefaultPaymentMethod(
          client.stripe_customer_id,
          payment_method_id
        );

        await Client.update(clientId, { 
          default_payment_method_id: payment_method_id,
          default_payment_provider: 'stripe'
        });
      }

      // Update subscription payment method if this is set as default
      if (set_as_default) {
        const subscription = await Subscription.getByClientId(clientId);
        if (subscription) {
          await Subscription.update(subscription.id, {
            payment_provider: 'stripe',
            payment_method_id: payment_method_id
          });
        }
      }

      res.json({
        success: true,
        paymentMethod: {
          id: paymentMethod.id,
          provider: 'stripe',
          type: 'credit_card',
          last4: paymentMethod.card.last4,
          brand: paymentMethod.card.brand,
          expMonth: paymentMethod.card.exp_month,
          expYear: paymentMethod.card.exp_year,
          isDefault: set_as_default
        },
        message: 'Credit card added successfully'
      });

    } catch (error) {
      console.error('Error adding credit card:', error);
      res.status(500).json({ error: 'Failed to add credit card' });
    }
  }

  // Add ACH account payment method (QuickBooks)
  async addACHAccount(req, res) {
    try {
      const clientId = req.user.client.id;
      const { 
        bank_name, 
        routing_number, 
        account_number, 
        account_type, 
        account_holder_name,
        set_as_default = false 
      } = req.body;

      const client = await Client.findById(clientId);

      // Validate routing number
      if (!this.validateRoutingNumber(routing_number)) {
        return res.status(400).json({ error: 'Invalid routing number' });
      }

      // Validate account number
      if (!account_number || account_number.length < 4) {
        return res.status(400).json({ error: 'Invalid account number' });
      }

      // Sync client to QuickBooks if not already synced
      if (!client.quickbooks_id) {
        await QuickBooksService.syncClientToQB(clientId);
        const updatedClient = await Client.findById(clientId);
        client.quickbooks_id = updatedClient.quickbooks_id;
      }

      // Encrypt sensitive data
      const encryptedAccountNumber = await EncryptionService.encrypt(account_number);

      // Store ACH details
      const paymentMethodData = {
        client_id: clientId,
        provider: 'quickbooks',
        type: 'ach',
        bank_name: bank_name,
        routing_number: routing_number,
        encrypted_account_number: encryptedAccountNumber,
        account_number_last4: account_number.slice(-4),
        account_type: account_type,
        account_holder_name: account_holder_name,
        is_default: set_as_default,
        is_active: true
      };

      const savedPaymentMethod = await Client.addPaymentMethod(paymentMethodData);

      // Set as default if requested
      if (set_as_default) {
        await Client.update(clientId, {
          default_payment_method_id: savedPaymentMethod.id,
          default_payment_provider: 'quickbooks'
        });

        // Update subscription payment method
        const subscription = await Subscription.getByClientId(clientId);
        if (subscription) {
          await Subscription.update(subscription.id, {
            payment_provider: 'quickbooks',
            payment_method_id: savedPaymentMethod.id
          });
        }
      }

      res.json({
        success: true,
        paymentMethod: {
          id: savedPaymentMethod.id,
          provider: 'quickbooks',
          type: 'ach',
          last4: account_number.slice(-4),
          brand: bank_name,
          accountType: account_type,
          isDefault: set_as_default
        },
        message: 'ACH account added successfully'
      });

    } catch (error) {
      console.error('Error adding ACH account:', error);
      res.status(500).json({ error: 'Failed to add ACH account' });
    }
  }

  // Set default payment method
  async setDefaultPaymentMethod(req, res) {
    try {
      const clientId = req.user.client.id;
      const { id } = req.params;
      const { provider } = req.body;

      // Update client's default payment method
      await Client.update(clientId, {
        default_payment_method_id: id,
        default_payment_provider: provider
      });

      // Update subscription payment method
      const subscription = await Subscription.getByClientId(clientId);
      if (subscription) {
        await Subscription.update(subscription.id, {
          payment_provider: provider,
          payment_method_id: id
        });
      }

      // If Stripe, update Stripe customer default
      if (provider === 'stripe') {
        const client = await Client.findById(clientId);
        if (client.stripe_customer_id) {
          await StripeService.setDefaultPaymentMethod(client.stripe_customer_id, id);
        }
      }

      // Mark other payment methods as non-default
      await Client.updatePaymentMethodsDefault(clientId, id);

      res.json({
        success: true,
        message: 'Default payment method updated successfully'
      });

    } catch (error) {
      console.error('Error setting default payment method:', error);
      res.status(500).json({ error: 'Failed to set default payment method' });
    }
  }

  // Remove payment method
  async removePaymentMethod(req, res) {
    try {
      const clientId = req.user.client.id;
      const { id } = req.params;

      const paymentMethod = await Client.getPaymentMethod(id);
      if (!paymentMethod || paymentMethod.client_id !== clientId) {
        return res.status(404).json({ error: 'Payment method not found' });
      }

      // Check if it's the default payment method
      const client = await Client.findById(clientId);
      if (client.default_payment_method_id === id) {
        return res.status(400).json({ 
          error: 'Cannot remove default payment method. Please set another payment method as default first.' 
        });
      }

      // Remove from provider
      if (paymentMethod.provider === 'stripe') {
        await StripeService.removePaymentMethod(id);
      } else if (paymentMethod.provider === 'quickbooks') {
        await Client.deactivatePaymentMethod(id);
      }

      res.json({
        success: true,
        message: 'Payment method removed successfully'
      });

    } catch (error) {
      console.error('Error removing payment method:', error);
      res.status(500).json({ error: 'Failed to remove payment method' });
    }
  }

  // Get available payment providers
  async getAvailableProviders(req, res) {
    try {
      const providers = [
        {
          id: 'stripe',
          name: 'Credit/Debit Card',
          description: 'Pay with credit card, debit card, or digital wallet',
          supportedMethods: ['visa', 'mastercard', 'amex', 'discover', 'apple_pay', 'google_pay'],
          processingFee: '2.9% + 30¢',
          instantProcessing: true,
          icon: 'credit-card'
        },
        {
          id: 'quickbooks',
          name: 'ACH Bank Transfer',
          description: 'Pay directly from your bank account',
          supportedMethods: ['ach', 'checking', 'savings'],
          processingFee: '1% (max $10)',
          instantProcessing: false,
          processingTime: '3-5 business days',
          icon: 'bank'
        }
      ];

      res.json({
        providers,
        defaultProvider: 'stripe',
        recommendedProvider: 'stripe'
      });

    } catch (error) {
      console.error('Error getting payment providers:', error);
      res.status(500).json({ error: 'Failed to get payment providers' });
    }
  }

  // Make payment with provider routing
  async makePayment(req, res) {
    try {
      const clientId = req.user.client.id;
      const { invoice_id, amount, payment_method_id, provider } = req.body;

      const client = await Client.findById(clientId);
      const invoice = await Invoice.findById(invoice_id);

      if (!invoice || invoice.client_id !== clientId) {
        return res.status(404).json({ error: 'Invoice not found' });
      }

      let paymentResult;

      if (provider === 'stripe') {
        paymentResult = await this.processStripePayment(client, invoice, amount, payment_method_id);
      } else if (provider === 'quickbooks') {
        paymentResult = await this.processQuickBooksPayment(client, invoice, amount, payment_method_id);
      } else {
        return res.status(400).json({ error: 'Invalid payment provider' });
      }

      // Record payment in database
      const payment = await Payment.create({
        client_id: clientId,
        invoice_id: invoice_id,
        amount: amount,
        payment_method: provider === 'stripe' ? 'card' : 'ach',
        provider: provider,
        provider_payment_id: paymentResult.id,
        status: paymentResult.status,
        transaction_date: new Date()
      });

      // Update invoice status if payment succeeded
      if (paymentResult.status === 'succeeded') {
        await Invoice.update(invoice_id, { status: 'paid' });
      }

      res.json({
        success: true,
        payment: {
          id: payment.id,
          amount: amount,
          status: paymentResult.status,
          provider: provider,
          processingTime: provider === 'stripe' ? 'instant' : '3-5 business days'
        },
        message: provider === 'stripe' 
          ? 'Payment processed successfully'
          : 'ACH payment initiated. Processing will take 3-5 business days.'
      });

    } catch (error) {
      console.error('Error processing payment:', error);
      res.status(500).json({ error: 'Failed to process payment' });
    }
  }

  // Retry failed payment
  async retryFailedPayment(req, res) {
    try {
      const clientId = req.user.client.id;
      const { payment_id } = req.body;

      const payment = await Payment.findById(payment_id);
      if (!payment || payment.client_id !== clientId) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      if (payment.status !== 'failed') {
        return res.status(400).json({ error: 'Payment is not in failed status' });
      }

      // Get the associated invoice
      const invoice = await Invoice.findById(payment.invoice_id);
      const client = await Client.findById(clientId);

      let retryResult;

      if (payment.provider === 'stripe') {
        retryResult = await this.retryStripePayment(client, invoice, payment);
      } else if (payment.provider === 'quickbooks') {
        retryResult = await this.retryQuickBooksPayment(client, invoice, payment);
      }

      // Update payment status
      await Payment.update(payment_id, {
        status: retryResult.status,
        retry_attempt: (payment.retry_attempt || 0) + 1,
        last_retry_date: new Date()
      });

      res.json({
        success: true,
        payment: {
          id: payment_id,
          status: retryResult.status,
          retryAttempt: (payment.retry_attempt || 0) + 1
        },
        message: 'Payment retry initiated successfully'
      });

    } catch (error) {
      console.error('Error retrying payment:', error);
      res.status(500).json({ error: 'Failed to retry payment' });
    }
  }

  // Private helper methods
  async processStripePayment(client, invoice, amount, paymentMethodId) {
    try {
      const paymentIntent = await StripeService.createPaymentIntent(
        amount,
        client.id,
        `Payment for invoice ${invoice.invoice_number}`
      );

      return {
        id: paymentIntent.id,
        status: paymentIntent.status === 'succeeded' ? 'succeeded' : 'processing'
      };
    } catch (error) {
      throw error;
    }
  }

  async processQuickBooksPayment(client, invoice, amount, paymentMethodId) {
    try {
      // For ACH payments, we create a pending payment record
      // The actual processing happens through QuickBooks
      const qbPayment = await QuickBooksService.createACHPayment({
        customer_id: client.quickbooks_id,
        invoice_id: invoice.quickbooks_id,
        amount: amount,
        payment_method_id: paymentMethodId
      });

      return {
        id: qbPayment.Id,
        status: 'pending'
      };
    } catch (error) {
      throw error;
    }
  }

  async retryStripePayment(client, invoice, originalPayment) {
    // Retry logic for Stripe payments
    return await this.processStripePayment(
      client, 
      invoice, 
      originalPayment.amount, 
      originalPayment.payment_method_id
    );
  }

  async retryQuickBooksPayment(client, invoice, originalPayment) {
    // Retry logic for QuickBooks payments
    return await this.processQuickBooksPayment(
      client, 
      invoice, 
      originalPayment.amount, 
      originalPayment.payment_method_id
    );
  }

  validateRoutingNumber(routingNumber) {
    // Basic routing number validation (9 digits)
    if (!/^\d{9}$/.test(routingNumber)) {
      return false;
    }

    // Additional validation logic can be added here
    return true;
  }
}

module.exports = new EnhancedPaymentController();