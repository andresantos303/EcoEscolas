const express = require('express');
const router = express.Router();

// include controller functions
const checkPermissions = require('../utils/checkPermissions.js');
const plansController= require('../controllers/plans.controller.js');
const authMiddleware = require('../utils/auth.js');
const { upload } = require('../utils/upload.js');

router.use(authMiddleware);

router.get('/', checkPermissions('plans', 'read'), plansController.getAllPlans);
router.get('/:id', checkPermissions('plans', 'readById'), plansController.getPlanById);
router.post('/', checkPermissions('plans', 'create'), upload.array('recursos', 6), plansController.createPlan);
router.patch('/:id', checkPermissions('plans', 'update'), plansController.updatePlan);
router.put('/:id', checkPermissions('plans', 'update'), upload.array('recursos', 6), plansController.finalizePlan);
router.delete('/:id', checkPermissions('plans', 'delete'), plansController.deletePlan);

module.exports = router;