const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Invoice, Payment, Subscription, Client } = require('../models');

class StripeService {
  // Create Stripe customer
  async createCustomer(clientData) {
    try {
      const customer = await stripe.customers.create({
        email: clientData.email,
        name: `${clientData.firstName} ${clientData.lastName}`,
        phone: clientData.phone,
        address: {
          line1: clientData.address.line1,
          line2: clientData.address.line2,
          city: clientData.address.city,
          state: clientData.address.state,
          postal_code: clientData.address.zipCode,
          country: 'US'
        },
        metadata: {
          client_id: clientData.id,
          yard_size: clientData.yardSize,
          dog_count: clientData.dogCount.toString()
        }
      });
      
      return customer;
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      throw error;
    }
  }

  // Create subscription
  async createSubscription(clientId, priceId, paymentMethodId) {
    try {
      const client = await Client.findById(clientId);
      
      // Attach payment method to customer
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: client.stripe_customer_id,
      });

      // Set as default payment method
      await stripe.customers.update(client.stripe_customer_id, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: client.stripe_customer_id,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          client_id: clientId,
          service_type: 'recurring_cleanup'
        }
      });

      return subscription;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  // Create one-time payment intent
  async createPaymentIntent(amount, clientId, description) {
    try {
      const client = await Client.findById(clientId);
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        customer: client.stripe_customer_id,
        description: description,
        metadata: {
          client_id: clientId,
          service_type: 'one_time'
        }
      });

      return paymentIntent;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  // Create invoice
  async createInvoice(clientId, lineItems, dueDate = null) {
    try {
      const client = await Client.findById(clientId);
      
      const invoice = await stripe.invoices.create({
        customer: client.stripe_customer_id,
        collection_method: 'send_invoice',
        days_until_due: dueDate ? Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24)) : 30,
        metadata: {
          client_id: clientId
        }
      });

      // Add line items
      for (const item of lineItems) {
        await stripe.invoiceItems.create({
          customer: client.stripe_customer_id,
          invoice: invoice.id,
          amount: Math.round(item.amount * 100),
          currency: 'usd',
          description: item.description,
          metadata: item.metadata || {}
        });
      }

      // Finalize and send invoice
      const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);
      await stripe.invoices.sendInvoice(invoice.id);

      return finalizedInvoice;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }

  // Update subscription
  async updateSubscription(subscriptionId, updates) {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, updates);
      return subscription;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId, atPeriodEnd = true) {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: atPeriodEnd,
        metadata: {
          cancelled_at: new Date().toISOString()
        }
      });
      
      return subscription;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  }

  // Pause subscription
  async pauseSubscription(subscriptionId) {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        pause_collection: {
          behavior: 'keep_as_draft'
        }
      });
      
      return subscription;
    } catch (error) {
      console.error('Error pausing subscription:', error);
      throw error;
    }
  }

  // Resume subscription
  async resumeSubscription(subscriptionId) {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        pause_collection: ''
      });
      
      return subscription;
    } catch (error) {
      console.error('Error resuming subscription:', error);
      throw error;
    }
  }

  // Add payment method
  async addPaymentMethod(customerId, paymentMethodId) {
    try {
      const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });
      
      return paymentMethod;
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  }

  // Remove payment method
  async removePaymentMethod(paymentMethodId) {
    try {
      const paymentMethod = await stripe.paymentMethods.detach(paymentMethodId);
      return paymentMethod;
    } catch (error) {
      console.error('Error removing payment method:', error);
      throw error;
    }
  }

  // Get customer payment methods
  async getCustomerPaymentMethods(customerId) {
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });
      
      return paymentMethods.data;
    } catch (error) {
      console.error('Error getting payment methods:', error);
      throw error;
    }
  }

  // Process refund
  async createRefund(paymentIntentId, amount = null, reason = 'requested_by_customer') {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined,
        reason: reason
      });
      
      return refund;
    } catch (error) {
      console.error('Error creating refund:', error);
      throw error;
    }
  }

  // Handle webhook events
  async handleWebhook(event) {
    try {
      switch (event.type) {
        case 'invoice.payment_succeeded':
          await this.handleSuccessfulPayment(event.data.object);
          break;
        case 'invoice.payment_failed':
          await this.handleFailedPayment(event.data.object);
          break;
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Error handling webhook:', error);
      throw error;
    }
  }

  async handleSuccessfulPayment(invoice) {
    // Update payment status in database
    await Payment.updateByStripeInvoiceId(invoice.id, {
      status: 'succeeded',
      transaction_date: new Date(invoice.status_transitions.paid_at * 1000)
    });
    
    // Update invoice status
    await Invoice.updateByStripeId(invoice.id, {
      status: 'paid'
    });
  }

  async handleFailedPayment(invoice) {
    // Update payment status
    await Payment.updateByStripeInvoiceId(invoice.id, {
      status: 'failed'
    });
    
    // Update invoice status
    await Invoice.updateByStripeId(invoice.id, {
      status: 'overdue'
    });
    
    // Send notification to client
    // TODO: Implement notification service
  }

  async handleSubscriptionCreated(subscription) {
    // Update subscription in database
    await Subscription.updateByStripeId(subscription.id, {
      status: 'active',
      stripe_subscription_id: subscription.id
    });
  }

  async handleSubscriptionUpdated(subscription) {
    let status = 'active';
    if (subscription.status === 'canceled') status = 'cancelled';
    if (subscription.status === 'past_due') status = 'past_due';
    if (subscription.pause_collection) status = 'paused';
    
    await Subscription.updateByStripeId(subscription.id, {
      status: status
    });
  }

  async handleSubscriptionDeleted(subscription) {
    await Subscription.updateByStripeId(subscription.id, {
      status: 'cancelled',
      end_date: new Date()
    });
  }
}

module.exports = new StripeService();