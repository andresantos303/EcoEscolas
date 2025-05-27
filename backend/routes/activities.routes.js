// route for /activities requests

const express = require('express');
const router = express.Router();

// include controller functions
const activitiesController= require('../controllers/activities.controller.js');
const authMiddleware = require('../auth.js');

// POST /activities/:idActividade/participants — adiciona participantes a uma atividade
router.post('/:idAtividade/participants', activitiesController.addParticipant);

router.use(authMiddleware);

// GET /activities — lista todas as atividades (Admin apenas)
router.get('/', activitiesController.getAllActivities);
// GET /activities/:id — obtém detalhes de uma atividade (Admin apenas)
router.get('/:id', activitiesController.getActivityById);
// POST /activities — cria uma nova atividade (Conselho Eco-Escolas / Secretariado)
router.post('/:idPlano', activitiesController.createActivity);
// PATCH /activities/:id — atualiza uma atividade existente (Conselho Eco-Escolas / Secretariado)
router.patch('/:id', activitiesController.updateActivity);
// DELETE /activities/:id — remove uma atividade (Coordenador / Admin)
router.delete('/:id', activitiesController.deleteActivity);

module.exports = router;