const express = require('express');
const router = express.Router();

const activitiesController = require('../controllers/activities.controller.js');
const authMiddleware = require('../utils/auth.js');
const checkPermissions = require('../utils/checkPermissions.js');
const { upload } = require('../utils/upload.js');
const Activity = require('../models/activity.model.js');

// Rota pública: adicionar participante
router.post('/:idAtividade/participants', activitiesController.addParticipant);
router.get('/:id/public', activitiesController.getActivityPublicById);
router.get('/stats/count', activitiesController.getActivitiesCount);

// Middleware de autenticação   
router.use(authMiddleware);

// Outras rotas protegidas
router.get('/', checkPermissions('activities', 'read'), activitiesController.getAllActivities);
router.get('/:id', checkPermissions('activities', 'readById'), activitiesController.getActivityById);
router.post('/:idPlano', checkPermissions('activities', 'create'), upload.array('fotos', 6), activitiesController.createActivity);
router.put('/:id/finalize', checkPermissions('activities', 'update'), upload.array('fotos', 6), activitiesController.finalizeActivity);
router.put('/:id/start', checkPermissions('activities', 'update'), activitiesController.startActivity);
router.patch('/:id', checkPermissions('activities', 'update'), activitiesController.updateActivity);
router.delete('/:id', checkPermissions('activities', 'delete'), activitiesController.deleteActivity);


module.exports = router;
