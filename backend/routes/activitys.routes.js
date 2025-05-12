// route for /activities requests

const express = require('express');
const router = express.Router();

// include controller functions
const activitiesController= require('../controllers/activities.controller.js');

// GET /atividades — lista todas as atividades (Admin apenas)
router.get('/', activitiesController.getAllActivities);
// GET /atividades/:id — obtém detalhes de uma atividade (Admin apenas)
router.get('/:id', activitiesController.getActivityById);
// POST /atividades — cria uma nova atividade (Conselho Eco-Escolas / Secretariado)
router.post('/', activitiesController.createActivity);
// POST /atividades/:idActividade/participants — adiciona participantes a uma atividade
router.post('/:idActividade/participants', activitiesController.addParticipant);
// PATCH /atividades/:id — atualiza uma atividade existente (Conselho Eco-Escolas / Secretariado)
router.patch('/:id', activitiesController.updateActivity);
// DELETE /atividades/:id — remove uma atividade (Coordenador / Admin)
router.delete('/:id', activitiesController.deleteActivity);

module.exports = router;