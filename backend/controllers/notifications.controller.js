// Import the notification data model
const Notification = require('../models/notification.model.js');

const deleteNotification = async (req, res) => {
    // 401 Unauthorized: token não fornecido ou inválido
    if (!req.user) {
      return res.status(401).json({
        errorCode: "AUTH_UNAUTHORIZED",
        message: "Token inválido ou não fornecido.",
      });
    }
  
    try {
      const notification = await Notification.findById(req.params.id);
  
      if (!notification) {
        return res.status(404).json({
          errorCode: "NOTIFICATION_NOT_FOUND",
          message: "Notificação não encontrada.",
        });
      }
  
      // 403 Forbidden: apenas o criador pode remover
      if (notification.createdUserId.toString() !== req.user.userId) {
        return res.status(403).json({
          errorCode: "NOTIFICATION_DELETE_UNAUTHORIZED",
          message: "Apenas o criador da notificação pode removê-la.",
        });
      }
  
      await Notification.findByIdAndDelete(req.params.id);
  
      return res.status(200).json({
        message: "Notificação removida com sucesso.",
      });
  
    } catch (err) {
      return res.status(500).json({
        message: "Erro interno ao remover notificação.",
      });
    }
  };

const getNotificationById = async (req, res) => {
    // 401 Unauthorized: token não fornecido ou inválido
    if (!req.user) {
      return res.status(401).json({
        errorCode: "AUTH_UNAUTHORIZED",
        message: "Token inválido ou não fornecido.",
      });
    }
  
    try {
      const notification = await Notification.findById(req.params.id);
      if (!notification) {
        return res.status(404).json({
          errorCode: "NOTIFICATION_NOT_FOUND",
          message: "A atividade solicitada não foi encontrada.",
        });
      }
      return res.status(200).json(notification);
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Erro interno ao obter atividade." });
    }
  };

const getAllNotifications = async (req, res) => {
    // 401 Unauthorized: token não fornecido ou inválido
    if (!req.user) {
      return res.status(401).json({
        errorCode: "AUTH_UNAUTHORIZED",
        message: "Token inválido ou não fornecido.",
      });
    }
  
    try {
      const filter = {};
      if (req.query.titulo) filter.titulo = req.query.titulo;
      filter.createdUserId = req.user.userId; // Filtra notificações do user atual
  
      const notification = await Notification.find(filter);
      return res.status(200).json({ notification });
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Erro interno ao buscar notificações." });
    }
  };

  const createNotification = async (req, res) => {
    // 401 Unauthorized
    if (!req.user) {
      return res.status(401).json({
        errorCode: "AUTH_UNAUTHORIZED",
        message: "Token inválido ou não fornecido.",
      });
    }
  
    const { titulo, corpo, associatedRoles } = req.body;
  
    // 400 Bad Request
    if (!titulo || !corpo || !associatedRoles || !Array.isArray(associatedRoles) || associatedRoles.length === 0) {
      return res.status(400).json({
        errorCode: "NOTIFICATION_BAD_REQUEST",
        message: "Texto da notificação e utilizadores associados são obrigatórios.",
      });
    }
  
    try {
      const newNotification = new Notification({
        titulo,
        corpo,
        associatedRoles,
        createdUserId: req.user.userId,
      });
      await newNotification.save();

      return res.status(201).json({
        message: "Notificação criada com sucesso!",
        notificacaoId: newNotification._id,
      });
    } catch (err) {
      return res.status(500).json({
        message: "Erro ao criar notificação.",
      });
    }
  };


module.exports = {
    deleteNotification,
    getNotificationById,
    getAllNotifications,
    createNotification
}