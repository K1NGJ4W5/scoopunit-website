const express = require('express');
const router = express.Router();
const { verifyToken, requireClient } = require('../middleware/auth');
const ClientController = require('../controllers/ClientController');
const ClientSubscriptionController = require('../controllers/ClientSubscriptionController');
const InvoiceController = require('../controllers/InvoiceController');
const PaymentController = require('../controllers/PaymentController');

// Apply authentication to all client portal routes
router.use(verifyToken);
router.use(requireClient);

// Client Dashboard
router.get('/dashboard', ClientController.getDashboard);
router.get('/profile', ClientController.getProfile);
router.put('/profile', ClientController.updateProfile);

// Enhanced Subscription Management
router.get('/subscription', ClientSubscriptionController.getSubscription);
router.put('/subscription/service-requirements', ClientSubscriptionController.updateServiceRequirements);
router.put('/subscription/payment-method', ClientSubscriptionController.updatePaymentMethod);
router.put('/subscription/pause', ClientSubscriptionController.pauseSubscription);
router.put('/subscription/resume', ClientSubscriptionController.resumeSubscription);
router.put('/subscription/cancel', ClientSubscriptionController.cancelSubscription);

// Billing Preview & Management
router.post('/subscription/preview-changes', ClientSubscriptionController.previewBillingChanges);
router.get('/billing/history', ClientSubscriptionController.getBillingHistory);
router.get('/billing/next-amount', ClientSubscriptionController.calculateNextBillingAmount);

// Customer Information Management
router.get('/customer-info', ClientController.getCustomerInfo);
router.put('/customer-info', ClientController.updateCustomerInfo);
router.put('/customer-info/address', ClientController.updateAddress);
router.put('/customer-info/contact', ClientController.updateContactInfo);
router.put('/customer-info/emergency-contact', ClientController.updateEmergencyContact);

// Payment Methods (Enhanced with Provider Switching)
router.get('/payment-methods', PaymentController.getPaymentMethods);
router.post('/payment-methods/credit-card', PaymentController.addCreditCard);
router.post('/payment-methods/ach', PaymentController.addACHAccount);
router.put('/payment-methods/:id/default', PaymentController.setDefaultPaymentMethod);
router.delete('/payment-methods/:id', PaymentController.removePaymentMethod);
router.get('/payment-methods/providers', PaymentController.getAvailableProviders);

// Service Requests
router.get('/service-requests', ClientController.getServiceRequests);
router.post('/service-requests', ClientController.createServiceRequest);
router.get('/service-requests/:id', ClientController.getServiceRequest);

// Upcoming Services
router.get('/upcoming-services', ClientController.getUpcomingServices);
router.put('/services/:id/reschedule', ClientController.rescheduleService);
router.post('/services/:id/add-notes', ClientController.addServiceNotes);

// Service History
router.get('/service-history', ClientController.getServiceHistory);
router.get('/services/:id', ClientController.getServiceDetails);
router.post('/services/:id/feedback', ClientController.submitFeedback);
router.post('/services/:id/report-issue', ClientController.reportServiceIssue);

// Billing & Invoices (Enhanced)
router.get('/invoices', InvoiceController.getClientInvoices);
router.get('/invoices/:id', InvoiceController.getInvoice);
router.get('/invoices/:id/download', InvoiceController.downloadInvoice);
router.get('/invoices/:id/proration-details', InvoiceController.getProrationDetails);

// Make Payments
router.post('/payments', PaymentController.makePayment);
router.get('/payment-history', PaymentController.getPaymentHistory);
router.post('/payments/retry-failed', PaymentController.retryFailedPayment);

// Estimation Tool (for existing clients)
router.post('/estimate', ClientController.getEstimate);
router.post('/estimate/upgrade', ClientController.upgradeService);
router.get('/estimate/current-plan', ClientController.getCurrentPlanEstimate);

// Property Information
router.get('/property', ClientController.getPropertyInfo);
router.put('/property', ClientController.updatePropertyInfo);
router.put('/property/yard-details', ClientController.updateYardDetails);
router.put('/property/access-instructions', ClientController.updateAccessInstructions);
router.put('/property/pet-details', ClientController.updatePetDetails);

// Service Preferences
router.get('/preferences', ClientController.getServicePreferences);
router.put('/preferences', ClientController.updateServicePreferences);
router.put('/preferences/frequency', ClientController.updateFrequency);
router.put('/preferences/special-instructions', ClientController.updateSpecialInstructions);
router.put('/preferences/communication', ClientController.updateCommunicationPreferences);

// Add-On Services Management
router.get('/add-ons/available', ClientController.getAvailableAddOns);
router.post('/add-ons/add', ClientController.addService);
router.delete('/add-ons/:id/remove', ClientController.removeAddOnService);
router.get('/add-ons/current', ClientController.getCurrentAddOns);

// Cancellation Management
router.get('/cancellation/options', ClientController.getCancellationOptions);
router.post('/cancellation/request', ClientSubscriptionController.cancelSubscription);
router.get('/cancellation/status', ClientController.getCancellationStatus);
router.put('/cancellation/modify', ClientController.modifyCancellationRequest);
router.delete('/cancellation/withdraw', ClientController.withdrawCancellationRequest);

// Communication
router.get('/notifications', ClientController.getNotifications);
router.put('/notifications/:id/read', ClientController.markNotificationRead);
router.get('/messages', ClientController.getMessages);
router.post('/messages', ClientController.sendMessage);
router.get('/support/contacts', ClientController.getSupportContacts);

// Account Settings
router.get('/settings', ClientController.getAccountSettings);
router.put('/settings', ClientController.updateAccountSettings);
router.put('/settings/password', ClientController.changePassword);
router.put('/settings/email', ClientController.changeEmail);
router.put('/settings/notifications', ClientController.updateNotificationSettings);

// Credits & Promotions
router.get('/credits/balance', ClientController.getCreditsBalance);
router.get('/credits/history', ClientController.getCreditsHistory);
router.post('/promotions/apply', ClientController.applyPromoCode);
router.get('/promotions/available', ClientController.getAvailablePromotions);

// Referral Program
router.get('/referrals', ClientController.getReferralInfo);
router.post('/referrals/send', ClientController.sendReferral);
router.get('/referrals/history', ClientController.getReferralHistory);

// Seasonal & Temporary Services
router.get('/seasonal-options', ClientController.getSeasonalOptions);
router.post('/seasonal/request', ClientController.requestSeasonalService);
router.get('/temporary-pause/options', ClientController.getTemporaryPauseOptions);

module.exports = router;