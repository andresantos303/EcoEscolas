const express = require('express');
const router = express.Router();

// include controller functions
const checkPermissions = require('../utils/checkPermissions.js');

const activitiesController= require('../controllers/activities.controller.js');
const authMiddleware = require('../utils/auth.js');

// POST /activities/:idActividade/participants — adiciona participantes a uma atividade
router.post('/:idAtividade/participants', activitiesController.addParticipant);

router.use(authMiddleware);

router.get('/', checkPermissions('activities', 'read'), activitiesController.getAllActivities);
router.get('/:id', checkPermissions('activities', 'readById'), activitiesController.getActivityById);
router.post('/:idPlano', checkPermissions('activities', 'create'), activitiesController.createActivity);
router.put('/:id/finalize', checkPermissions('activities', 'update'), activitiesController.finalizeActivity);
router.put('/:id/start', checkPermissions('activities', 'update'), activitiesController.startActivity);
router.patch('/:id', checkPermissions('activities', 'update'), activitiesController.updateActivity);
router.delete('/:id', checkPermissions('activities', 'delete'), activitiesController.deleteActivity);
router.get('/stats/count', checkPermissions('activities', 'read'), activitiesController.getActivitiesCount);

module.exports = router;