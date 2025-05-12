// route for /users requests

const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const User = require('../models/user.model');
const authMiddleware = require('../auth.js');
=======
>>>>>>> d79ac0919279036421d53d7b7af8120f8ccf6718

// include controller functions
const usersController = require('../controllers/users.controller.js');

// GET /users — retorna todos os utilizadores (Admin apenas)
<<<<<<< HEAD
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



=======
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
>>>>>>> d79ac0919279036421d53d7b7af8120f8ccf6718

module.exports = router;