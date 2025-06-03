// route for /activities requests

const express = require('express');
const router = express.Router();

// include controller functions
const activitiesController= require('../controllers/activities.controller.js');
const authMiddleware = require('../utils/auth.js');

// POST /activities/:idActividade/participants — adiciona participantes a uma atividade
router.post('/:idAtividade/participants', activitiesController.addParticipant);

router.use(authMiddleware);

router.get('/', activitiesController.getAllActivities);
router.get('/:id', activitiesController.getActivityById);
router.post('/:idPlano', activitiesController.createActivity);
router.put('/:id', activitiesController.finalizeActivity);
router.patch('/:id', activitiesController.updateActivity);
router.delete('/:id', activitiesController.deleteActivity);

module.exports = router;