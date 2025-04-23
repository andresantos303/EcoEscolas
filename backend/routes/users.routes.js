// route for /users requests

const express = require('express');
const router = express.Router();

// include controller functions
const usersController = require('../controllers/users.controller.js');

// GET /users — retorna todos os utilizadores (Admin apenas)
router.get('/', usersController.getAllUsers);
// POST /users — regista um novo utilizador (Admin apenas)
router.post('/', usersController.createUser);
// POST /users/login — autentica utilizador
router.post('/login', usersController.loginUser);
// GET/users/:id — obtém dados de um utilizador (Admin ou dono)
router.get('/:id', usersController.getUserById);
// PATCH /users/:id — atualiza perfil do utilizador (Admin apenas)
router.patch('/:id', usersController.updateUser);
// DELETE /users/:id — remove um utilizador (Admin apenas)
router.delete('/:id', usersController.deleteUser);

module.exports = router;