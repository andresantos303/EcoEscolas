// route for /plans requests

const express = require('express');
const router = express.Router();

// include controller functions
const plansController= require('../controllers/plans.controller.js');

// GET /planos — lista todos os planos de atividades (Admin apenas)
router.get('/', plansController.getAllPlans);
// GET /planos/:id — obtém detalhes de um plano pelo ID (Admin apenas)
router.get('/:id', plansController.getPlanById);
// POST /planos — cria um novo plano de atividades (Coordenador apenas)
router.post('/', plansController.createPlan);
// PATCH /planos/:id — atualiza um plano de atividades (Coordenador apenas)
router.patch('/:id', plansController.updatePlan);
// DELETE /planos/:id — remove um plano de atividades (Admin apenas)
router.delete('/:id', plansController.deletePlan);

module.exports = router;