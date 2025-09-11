const express = require('express');
const router = express.Router();
const { verifyToken, requireEmployee, requireManager } = require('../middleware/auth');
const EmployeeController = require('../controllers/EmployeeController');
const JobController = require('../controllers/JobController');
const RouteController = require('../controllers/RouteController');
const DispatchController = require('../controllers/DispatchController');

// Apply authentication to all employee portal routes
router.use(verifyToken);
router.use(requireEmployee);

// Employee Dashboard
router.get('/dashboard', EmployeeController.getDashboard);
router.get('/profile', EmployeeController.getProfile);
router.put('/profile', EmployeeController.updateProfile);

// Field Tech Specific Routes
router.get('/today-jobs', JobController.getTodayJobs);
router.get('/jobs/:id', JobController.getJobDetails);
router.put('/jobs/:id/start', JobController.startJob);
router.put('/jobs/:id/complete', JobController.completeJob);
router.put('/jobs/:id/update-status', JobController.updateJobStatus);
router.post('/jobs/:id/notes', JobController.addJobNotes);
router.post('/jobs/:id/photos', JobController.uploadJobPhotos);

// Route Management
router.get('/routes/today', RouteController.getTodayRoute);
router.get('/routes/:date', RouteController.getRouteByDate);
router.put('/routes/:id/optimize', RouteController.optimizeRoute);
router.put('/routes/:id/start', RouteController.startRoute);
router.put('/routes/:id/complete', RouteController.completeRoute);

// Location Tracking
router.post('/location/update', EmployeeController.updateLocation);
router.get('/location/breadcrumbs', EmployeeController.getLocationHistory);

// Time Tracking
router.post('/timesheet/clock-in', EmployeeController.clockIn);
router.post('/timesheet/clock-out', EmployeeController.clockOut);
router.post('/timesheet/break-start', EmployeeController.startBreak);
router.post('/timesheet/break-end', EmployeeController.endBreak);
router.get('/timesheet/:date?', EmployeeController.getTimesheet);

// Performance & Stats
router.get('/performance/stats', EmployeeController.getPerformanceStats);
router.get('/performance/daily/:date?', EmployeeController.getDailyPerformance);
router.get('/performance/weekly', EmployeeController.getWeeklyPerformance);
router.get('/performance/monthly', EmployeeController.getMonthlyPerformance);

// Manager/Admin Only Routes
router.use(requireManager);

// Staff Management
router.get('/staff', EmployeeController.getAllStaff);
router.get('/staff/:id', EmployeeController.getStaffMember);
router.put('/staff/:id', EmployeeController.updateStaffMember);
router.post('/staff/:id/assign-equipment', EmployeeController.assignEquipment);

// Dispatch Board
router.get('/dispatch/board', DispatchController.getDispatchBoard);
router.get('/dispatch/unassigned', DispatchController.getUnassignedJobs);
router.post('/dispatch/assign', DispatchController.assignJob);
router.put('/dispatch/reassign', DispatchController.reassignJob);
router.post('/dispatch/bulk-assign', DispatchController.bulkAssignJobs);

// Route Planning & Optimization
router.get('/routes/plan/:date', RouteController.getPlanningData);
router.post('/routes/create', RouteController.createRoute);
router.put('/routes/:id/reoptimize', RouteController.reoptimizeRoute);
router.get('/routes/analytics', RouteController.getRouteAnalytics);

// Staff Tracking
router.get('/tracking/live', EmployeeController.getLiveTracking);
router.get('/tracking/staff/:id/history', EmployeeController.getStaffLocationHistory);
router.get('/tracking/geofence-alerts', EmployeeController.getGeofenceAlerts);

// Payroll Management
router.get('/payroll/calculate/:period', EmployeeController.calculatePayroll);
router.get('/payroll/export/:period', EmployeeController.exportPayroll);
router.get('/payroll/staff/:id/:period', EmployeeController.getStaffPayroll);

// Cross-sell Management
router.get('/cross-sells/opportunities', EmployeeController.getCrossSellOpportunities);
router.post('/cross-sells/track', EmployeeController.trackCrossSell);
router.get('/cross-sells/performance', EmployeeController.getCrossSellPerformance);

// Reports
router.get('/reports/daily-summary/:date?', EmployeeController.getDailySummaryReport);
router.get('/reports/staff-performance', EmployeeController.getStaffPerformanceReport);
router.get('/reports/route-efficiency', EmployeeController.getRouteEfficiencyReport);
router.get('/reports/client-satisfaction', EmployeeController.getClientSatisfactionReport);

module.exports = router;