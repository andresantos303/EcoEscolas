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
      if (notification.createdUserId.toString() !== req.user.id) {
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
  
    // 403 Forbidden: apenas Admins podem obter detalhes de atividades
    if (req.user.type !== "Admin") {
      return res.status(403).json({
        errorCode: "NOTIFICATION_REGISTRATION_UNAUTHORIZED",
        message: "Não tem permissões para realizar esta ação",
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
  
    // 403 Forbidden: apenas Admins podem listar atividades
    if (req.user.type !== "Admin") {
      return res.status(403).json({
        errorCode: "NOTIFICATION_REGISTRATION_UNAUTHORIZED",
        message: "Não tem permissões para realizar esta ação",
      });
    }
  
    try {
      const filter = {};
      if (req.query.date) filter.date = req.query.date;
      if (req.query.body) filter.body = req.query.body;
  
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
  
    // 403 Forbidden
     if (req.user.type !== 'Admin') {
       return res.status(403).json({
         errorCode: "ACTIVITY_REGISTRATION_UNAUTHORIZED",
         message: "Não tem permissões para realizar esta ação",
      });
     }
  
    const { body, associatedUsers } = req.body;
  
    // 400 Bad Request
    if (!body || !associatedUsers || !Array.isArray(associatedUsers) || associatedUsers.length === 0) {
      return res.status(400).json({
        errorCode: "NOTIFICATION_BAD_REQUEST",
        message: "Texto da notificação e utilizadores associados são obrigatórios.",
      });
    }
  
    try {
      const newNotification = new Notification({
        body,
        associatedUsers,
        createdUserId: req.user.id,
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