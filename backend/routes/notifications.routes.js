// route for /notifications requests

const express = require('express');
const router = express.Router();

// include controller functions
const notificationsController= require('../controllers/notifications.controller.js');


// DELETE /notifications/:id — remove uma notificação
router.delete("/:id", notificationsController.deleteNotification);
// GET /notifications/:id — obtem uma notificação especifica
router.get("/:id", notificationsController.getNotificationById);
// GET /notifications/:id — obtém uma todas as notificações
router.get("/", notificationsController.getAllNotifications);
// POST /notifications — cria uma nova notificação
router.post("/", notificationsController.createNotification);

module.exports = router;