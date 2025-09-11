const express = require('express');
const router = express.Router();
const multer = require('multer');
const { verifyToken, requireEmployee } = require('../middleware/auth');
const MobileController = require('../controllers/MobileController');

// Configure multer for photo uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'), false);
    }
  }
});

// Apply authentication to all mobile API routes
router.use(verifyToken);
router.use(requireEmployee);

// Field Tech Mobile App Routes

// App initialization & sync
router.get('/sync', MobileController.syncData);
router.post('/heartbeat', MobileController.heartbeat);

// Job Management
router.get('/jobs/today', MobileController.getTodayJobs);
router.get('/jobs/upcoming', MobileController.getUpcomingJobs);
router.get('/jobs/:id', MobileController.getJobDetails);

// Job Status Updates
router.put('/jobs/:id/start', MobileController.startJob);
router.put('/jobs/:id/complete', MobileController.completeJob);
router.put('/jobs/:id/pause', MobileController.pauseJob);
router.put('/jobs/:id/resume', MobileController.resumeJob);
router.put('/jobs/:id/cancel', MobileController.cancelJob);

// Job Documentation
router.post('/jobs/:id/notes', MobileController.addJobNotes);
router.post('/jobs/:id/photos/before', upload.array('photos', 5), MobileController.uploadBeforePhotos);
router.post('/jobs/:id/photos/after', upload.array('photos', 5), MobileController.uploadAfterPhotos);
router.post('/jobs/:id/issue', MobileController.reportIssue);

// Location & GPS
router.post('/location/update', MobileController.updateLocation);
router.get('/location/history', MobileController.getLocationHistory);
router.post('/location/geofence', MobileController.checkGeofence);

// Route Management
router.get('/routes/today', MobileController.getTodayRoute);
router.put('/routes/start', MobileController.startRoute);
router.put('/routes/complete', MobileController.completeRoute);
router.get('/routes/navigation/:jobId', MobileController.getNavigation);
router.post('/routes/optimize', MobileController.requestRouteOptimization);

// Time Tracking
router.post('/timesheet/clock-in', MobileController.clockIn);
router.post('/timesheet/clock-out', MobileController.clockOut);
router.post('/timesheet/break-start', MobileController.startBreak);
router.post('/timesheet/break-end', MobileController.endBreak);
router.get('/timesheet/current', MobileController.getCurrentTimesheet);

// Client Interaction
router.get('/clients/:id/info', MobileController.getClientInfo);
router.post('/clients/:id/contact', MobileController.contactClient);
router.get('/clients/:id/special-instructions', MobileController.getSpecialInstructions);
router.post('/clients/:id/feedback-request', MobileController.requestClientFeedback);

// Emergency & Support
router.post('/emergency/alert', MobileController.sendEmergencyAlert);
router.post('/support/message', MobileController.sendSupportMessage);
router.get('/support/contacts', MobileController.getSupportContacts);

// Vehicle & Equipment
router.get('/vehicle/info', MobileController.getVehicleInfo);
router.post('/vehicle/inspection', MobileController.submitVehicleInspection);
router.get('/equipment/assigned', MobileController.getAssignedEquipment);
router.post('/equipment/issue', MobileController.reportEquipmentIssue);

// Cross-sell Opportunities
router.get('/cross-sells/opportunities', MobileController.getCrossSellOpportunities);
router.post('/cross-sells/:id/present', MobileController.presentCrossSell);
router.post('/cross-sells/:id/complete', MobileController.completeCrossSell);

// Offline Support
router.post('/offline/queue', MobileController.queueOfflineAction);
router.post('/offline/sync', MobileController.syncOfflineData);
router.get('/offline/status', MobileController.getOfflineStatus);

// Performance & Analytics
router.get('/performance/daily', MobileController.getDailyPerformance);
router.get('/performance/weekly', MobileController.getWeeklyPerformance);
router.get('/performance/goals', MobileController.getPerformanceGoals);

// Notifications
router.get('/notifications', MobileController.getNotifications);
router.put('/notifications/:id/read', MobileController.markNotificationRead);
router.post('/notifications/register-device', MobileController.registerPushDevice);

// App Settings & Preferences
router.get('/settings', MobileController.getAppSettings);
router.put('/settings', MobileController.updateAppSettings);
router.get('/preferences', MobileController.getUserPreferences);
router.put('/preferences', MobileController.updateUserPreferences);

// App Version & Updates
router.get('/version/check', MobileController.checkAppVersion);
router.get('/version/changelog', MobileController.getChangelog);

module.exports = router;