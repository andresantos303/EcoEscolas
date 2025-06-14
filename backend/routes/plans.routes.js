const express = require('express');
const router = express.Router();

// include controller functions
const checkPermissions = require('../utils/checkPermissions.js');
const plansController = require('../controllers/plans.controller.js');
const authMiddleware = require('../utils/auth.js');
const { upload } = require('../utils/upload.js');

// Rota sem checkPermissions
router.get('/public/names', plansController.getPublicPlanNames);
router.get('/:id/public', plansController.getPlanById);

router.use(authMiddleware);


router.get('/', checkPermissions('plans', 'read'), plansController.getAllPlans);
router.post('/', checkPermissions('plans', 'create'), upload.array('recursos', 6), plansController.createPlan);
router.patch('/:id', checkPermissions('plans', 'update'), plansController.updatePlan);
router.put('/:id/finalize', checkPermissions('plans', 'update'), upload.array('recursos', 6), plansController.finalizePlan);
router.put('/:id/start', checkPermissions('plans', 'update'), plansController.startPlan);
router.delete('/:id', checkPermissions('plans', 'delete'), plansController.deletePlan);
router.get('/stats/active-count', checkPermissions('plans', 'read'), plansController.countActivePlans);



module.exports = router;