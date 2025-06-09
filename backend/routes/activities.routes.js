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
router.put('/:id', checkPermissions('activities', 'update'), activitiesController.finalizeActivity);
router.patch('/:id', checkPermissions('activities', 'update'), activitiesController.updateActivity);
router.delete('/:id', checkPermissions('activities', 'delete'), activitiesController.deleteActivity);

module.exports = router;