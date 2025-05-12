// route for /executions requests

const express = require('express');
const router = express.Router();

// include controller functions
const executionsController= require('../controllers/executions.controller.js');

// DELETE /executions/:id — remove uma execução
router.delete("/:id", executionsController.deleteExecutionById);
// PATCH /executions/:id — atualiza uma execução
router.patch('/:id', executionsController.updateExecution);
// GET /executions/:id — obtém uma execução especifica
router.get('/:id', executionsController.getExecutionById);
// GET /executions/:id — obtém todas as execuções
router.get("/", executionsController.getAllExecutions);
// POST /executions — cria uma nova execução
router.post("/", executionsController.createExecution);



module.exports = router;