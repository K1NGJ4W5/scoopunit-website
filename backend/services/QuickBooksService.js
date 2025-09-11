const QuickBooks = require('node-quickbooks');
const { Client, Invoice, Payment } = require('../models');

class QuickBooksService {
  constructor() {
    this.qbo = null;
    this.isConnected = false;
  }

  // Initialize QuickBooks connection
  async initialize(accessToken, refreshToken, realmId) {
    try {
      this.qbo = new QuickBooks(
        process.env.QB_CONSUMER_KEY,
        process.env.QB_CONSUMER_SECRET,
        accessToken,
        false, // No token secret needed for OAuth 2.0
        realmId,
        true, // Use sandbox
        true, // Enable debug
        null, // Minor version
        '2.0', // OAuth version
        refreshToken
      );

      // Test connection
      await this.testConnection();
      this.isConnected = true;
      console.log('QuickBooks connection established');
    } catch (error) {
      console.error('QuickBooks initialization error:', error);
      throw error;
    }
  }

  async testConnection() {
    return new Promise((resolve, reject) => {
      this.qbo.getCompanyInfo(this.qbo.realmId, (err, companyInfo) => {
        if (err) {
          reject(err);
        } else {
          resolve(companyInfo);
        }
      });
    });
  }

  // Sync client to QuickBooks as Customer
  async syncClientToQB(clientId) {
    try {
      const client = await Client.findById(clientId);
      if (!client) {
        throw new Error('Client not found');
      }

      const customerData = {
        Name: `${client.first_name} ${client.last_name}`,
        CompanyName: client.business_name || '',
        BillAddr: {
          Line1: client.address_line1,
          Line2: client.address_line2 || '',
          City: client.city,
          CountrySubDivisionCode: client.state,
          PostalCode: client.zip_code,
          Country: 'USA'
        },
        PrimaryPhone: {
          FreeFormNumber: client.phone
        },
        PrimaryEmailAddr: {
          Address: client.email
        },
        Notes: `Scoop Unit Client - Dogs: ${client.dog_count}, Yard: ${client.yard_size}`
      };

      // Check if customer already exists
      if (client.quickbooks_id) {
        return await this.updateQBCustomer(client.quickbooks_id, customerData);
      } else {
        return await this.createQBCustomer(customerData, clientId);
      }
    } catch (error) {
      console.error('Error syncing client to QuickBooks:', error);
      throw error;
    }
  }

  async createQBCustomer(customerData, clientId) {
    return new Promise((resolve, reject) => {
      this.qbo.createCustomer(customerData, (err, customer) => {
        if (err) {
          reject(err);
        } else {
          // Update client with QuickBooks ID
          Client.update(clientId, { quickbooks_id: customer.Id });
          resolve(customer);
        }
      });
    });
  }

  async updateQBCustomer(customerId, customerData) {
    return new Promise((resolve, reject) => {
      // First get the current customer to get SyncToken
      this.qbo.getCustomer(customerId, (err, customer) => {
        if (err) {
          reject(err);
          return;
        }

        // Update customer data with required fields
        const updateData = {
          ...customerData,
          Id: customerId,
          SyncToken: customer.SyncToken
        };

        this.qbo.updateCustomer(updateData, (updateErr, updatedCustomer) => {
          if (updateErr) {
            reject(updateErr);
          } else {
            resolve(updatedCustomer);
          }
        });
      });
    });
  }

  // Sync invoice to QuickBooks
  async syncInvoiceToQB(invoiceId) {
    try {
      const invoice = await Invoice.findById(invoiceId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      const client = await Client.findById(invoice.client_id);
      if (!client.quickbooks_id) {
        // Sync client first
        await this.syncClientToQB(invoice.client_id);
        // Refresh client data
        const updatedClient = await Client.findById(invoice.client_id);
        client.quickbooks_id = updatedClient.quickbooks_id;
      }

      const invoiceLineItems = await Invoice.getLineItems(invoiceId);
      
      const qbInvoiceData = {
        CustomerRef: {
          value: client.quickbooks_id
        },
        TxnDate: invoice.invoice_date,
        DueDate: invoice.due_date,
        DocNumber: invoice.invoice_number,
        Line: invoiceLineItems.map(item => ({
          Amount: item.total_price,
          DetailType: 'SalesItemLineDetail',
          SalesItemLineDetail: {
            ItemRef: {
              value: await this.getOrCreateServiceItem(),
              name: 'Dog Waste Removal Service'
            },
            Qty: item.quantity,
            UnitPrice: item.unit_price
          },
          Description: item.description
        }))
      };

      if (invoice.quickbooks_id) {
        return await this.updateQBInvoice(invoice.quickbooks_id, qbInvoiceData);
      } else {
        return await this.createQBInvoice(qbInvoiceData, invoiceId);
      }
    } catch (error) {
      console.error('Error syncing invoice to QuickBooks:', error);
      throw error;
    }
  }

  async createQBInvoice(invoiceData, invoiceId) {
    return new Promise((resolve, reject) => {
      this.qbo.createInvoice(invoiceData, (err, invoice) => {
        if (err) {
          reject(err);
        } else {
          // Update invoice with QuickBooks ID
          Invoice.update(invoiceId, { quickbooks_id: invoice.Id });
          resolve(invoice);
        }
      });
    });
  }

  async updateQBInvoice(qbInvoiceId, invoiceData) {
    return new Promise((resolve, reject) => {
      this.qbo.getInvoice(qbInvoiceId, (err, invoice) => {
        if (err) {
          reject(err);
          return;
        }

        const updateData = {
          ...invoiceData,
          Id: qbInvoiceId,
          SyncToken: invoice.SyncToken
        };

        this.qbo.updateInvoice(updateData, (updateErr, updatedInvoice) => {
          if (updateErr) {
            reject(updateErr);
          } else {
            resolve(updatedInvoice);
          }
        });
      });
    });
  }

  // Sync payment to QuickBooks
  async syncPaymentToQB(paymentId) {
    try {
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      const invoice = await Invoice.findById(payment.invoice_id);
      const client = await Client.findById(payment.client_id);

      if (!invoice.quickbooks_id) {
        throw new Error('Invoice must be synced to QuickBooks first');
      }

      const qbPaymentData = {
        CustomerRef: {
          value: client.quickbooks_id
        },
        TotalAmt: payment.amount,
        TxnDate: payment.transaction_date.toISOString().split('T')[0],
        PaymentMethodRef: {
          value: await this.getPaymentMethodRef(payment.payment_method)
        },
        Line: [{
          Amount: payment.amount,
          LinkedTxn: [{
            TxnId: invoice.quickbooks_id,
            TxnType: 'Invoice'
          }]
        }]
      };

      return await this.createQBPayment(qbPaymentData, paymentId);
    } catch (error) {
      console.error('Error syncing payment to QuickBooks:', error);
      throw error;
    }
  }

  async createQBPayment(paymentData, paymentId) {
    return new Promise((resolve, reject) => {
      this.qbo.createPayment(paymentData, (err, payment) => {
        if (err) {
          reject(err);
        } else {
          // Update payment with QuickBooks ID
          Payment.update(paymentId, { quickbooks_id: payment.Id });
          resolve(payment);
        }
      });
    });
  }

  // Get or create service item for dog waste removal
  async getOrCreateServiceItem() {
    try {
      // First try to find existing item
      const items = await this.findQBItems('Dog Waste Removal Service');
      
      if (items && items.length > 0) {
        return items[0].Id;
      }

      // Create new service item
      const itemData = {
        Name: 'Dog Waste Removal Service',
        Type: 'Service',
        IncomeAccountRef: {
          value: await this.getIncomeAccountId()
        },
        UnitPrice: 35.00, // Default price
        Description: 'Professional dog waste removal service'
      };

      const newItem = await this.createQBItem(itemData);
      return newItem.Id;
    } catch (error) {
      console.error('Error getting/creating service item:', error);
      throw error;
    }
  }

  async findQBItems(name) {
    return new Promise((resolve, reject) => {
      this.qbo.findItems({ Name: name }, (err, items) => {
        if (err) {
          reject(err);
        } else {
          resolve(items);
        }
      });
    });
  }

  async createQBItem(itemData) {
    return new Promise((resolve, reject) => {
      this.qbo.createItem(itemData, (err, item) => {
        if (err) {
          reject(err);
        } else {
          resolve(item);
        }
      });
    });
  }

  // Get income account ID
  async getIncomeAccountId() {
    return new Promise((resolve, reject) => {
      this.qbo.findAccounts({ AccountType: 'Income' }, (err, accounts) => {
        if (err) {
          reject(err);
        } else {
          // Use first income account or create default
          if (accounts && accounts.length > 0) {
            resolve(accounts[0].Id);
          } else {
            // Create default income account
            const accountData = {
              Name: 'Service Revenue',
              AccountType: 'Income',
              AccountSubType: 'ServiceFeeIncome'
            };
            
            this.qbo.createAccount(accountData, (createErr, account) => {
              if (createErr) {
                reject(createErr);
              } else {
                resolve(account.Id);
              }
            });
          }
        }
      });
    });
  }

  // Get payment method reference
  async getPaymentMethodRef(paymentMethod) {
    const methodMap = {
      'card': 'Credit Card',
      'ach': 'Bank Transfer',
      'cash': 'Cash',
      'check': 'Check'
    };

    const qbMethodName = methodMap[paymentMethod] || 'Credit Card';
    
    return new Promise((resolve, reject) => {
      this.qbo.findPaymentMethods({ Name: qbMethodName }, (err, methods) => {
        if (err) {
          reject(err);
        } else if (methods && methods.length > 0) {
          resolve(methods[0].Id);
        } else {
          // Create payment method if not found
          const methodData = {
            Name: qbMethodName,
            Type: paymentMethod === 'card' ? 'CREDIT_CARD' : 'NON_CREDIT_CARD'
          };
          
          this.qbo.createPaymentMethod(methodData, (createErr, method) => {
            if (createErr) {
              reject(createErr);
            } else {
              resolve(method.Id);
            }
          });
        }
      });
    });
  }

  // Batch sync operations
  async syncAllClients() {
    try {
      const clients = await Client.getUnsyncedToQB();
      const results = [];

      for (const client of clients) {
        try {
          const result = await this.syncClientToQB(client.id);
          results.push({ clientId: client.id, success: true, qbId: result.Id });
        } catch (error) {
          results.push({ clientId: client.id, success: false, error: error.message });
        }
      }

      return results;
    } catch (error) {
      console.error('Error in batch client sync:', error);
      throw error;
    }
  }

  async syncAllInvoices() {
    try {
      const invoices = await Invoice.getUnsyncedToQB();
      const results = [];

      for (const invoice of invoices) {
        try {
          const result = await this.syncInvoiceToQB(invoice.id);
          results.push({ invoiceId: invoice.id, success: true, qbId: result.Id });
        } catch (error) {
          results.push({ invoiceId: invoice.id, success: false, error: error.message });
        }
      }

      return results;
    } catch (error) {
      console.error('Error in batch invoice sync:', error);
      throw error;
    }
  }

  // Webhook handler for QuickBooks changes
  async handleWebhook(webhookData) {
    try {
      for (const entity of webhookData.eventNotifications) {
        for (const dataChangeEvent of entity.dataChangeEvent) {
          await this.processDataChangeEvent(dataChangeEvent);
        }
      }
    } catch (error) {
      console.error('Error handling QuickBooks webhook:', error);
      throw error;
    }
  }

  async processDataChangeEvent(event) {
    switch (event.operation) {
      case 'Create':
      case 'Update':
        await this.syncFromQBToLocal(event.name, event.id);
        break;
      case 'Delete':
        await this.handleQBDeletion(event.name, event.id);
        break;
    }
  }

  async syncFromQBToLocal(entityType, qbId) {
    // Implement reverse sync from QuickBooks to local database
    // This ensures data consistency when changes are made in QuickBooks
    console.log(`Syncing ${entityType} ${qbId} from QuickBooks to local database`);
  }

  async handleQBDeletion(entityType, qbId) {
    // Handle deletions in QuickBooks
    console.log(`Handling deletion of ${entityType} ${qbId} in QuickBooks`);
  }
}

module.exports = new QuickBooksService();