// route for /users requests

const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const authMiddleware = require('../auth.js');

// include controller functions
const usersController = require('../controllers/users.controller.js');

// GET /users — retorna todos os utilizadores (Admin apenas)
router.get('/', authMiddleware, usersController.getAllUsers);
// POST /users — regista um novo utilizador (Admin apenas)
router.post('/', authMiddleware, usersController.createUser);
// POST /users/login — autentica utilizador
router.post('/login', usersController.loginUser);
// GET/users/:id — obtém dados de um utilizador (Admin)
router.get('/:id', authMiddleware, usersController.getUserById);
// PATCH /users/:id — atualiza perfil do utilizador (Admin apenas)
router.patch('/:id', authMiddleware, usersController.updateUser);
// DELETE /users/:id — remove um utilizador (Admin apenas)
router.delete('/:id', authMiddleware, usersController.deleteUser);

/* router.post('/create-admin', usersController.createAdmin);  */



module.exports = router;