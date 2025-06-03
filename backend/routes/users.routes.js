const express = require('express');
const router = express.Router();
const authMiddleware = require('../utils/auth.js');
const checkPermissions = require('../utils/checkPermissions.js');
const usersController = require('../controllers/users.controller.js');

router.post('/login', usersController.loginUser);

router.use(authMiddleware);

router.get('/', checkPermissions('users', 'read'), usersController.getAllUsers);

router.post('/', checkPermissions('users', 'create'), usersController.createUser);

router.get('/:id', checkPermissions('users', 'readById'), usersController.getUserById);

router.patch('/:id', checkPermissions('users', 'update'), usersController.updateUser);

router.delete('/:id', checkPermissions('users', 'delete'), usersController.deleteUser);

/* router.post('/create-admin', usersController.createAdmin); rota para criar o admin  */

module.exports = router;