const express = require('express');
const router = express.Router();

// include controller functions
const checkPermissions = require('../utils/checkPermissions.js');
const plansController= require('../controllers/plans.controller.js');
const authMiddleware = require('../utils/auth.js');

// Rota sem checkPermissions
router.get('/public/names', plansController.getPublicPlanNames);

router.use(authMiddleware);


router.get('/', checkPermissions('plans', 'read'), plansController.getAllPlans);
router.get('/:id', checkPermissions('plans', 'readById'), plansController.getPlanById);
router.post('/', checkPermissions('plans', 'create'), plansController.createPlan);
router.patch('/:id', checkPermissions('plans', 'update'), plansController.updatePlan);
router.put('/:id/finalize', checkPermissions('plans', 'update'), plansController.finalizePlan);
router.put('/:id/start', checkPermissions('plans', 'update'), plansController.startPlan);
router.delete('/:id', checkPermissions('plans', 'delete'), plansController.deletePlan);
router.get('/stats/active-count', checkPermissions('plans', 'read'), plansController.countActivePlans);



module.exports = router;