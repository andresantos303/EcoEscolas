const Activity = require("../models/activity.model.js");
const Plan = require("../models/plan.model.js");
const User = require("../models/user.model.js");
const { enviarEmail } = require("../utils/nodemailer.js");
const { handleError } = require("../utils/errorHandler.js");

const getAllActivities = async (req, res) => {
  try {
    const filter = {};
    if (req.query.name) filter.name = req.query.name;
    if (req.query.status) filter.status = req.query.status;

    const atividades = await Activity.find(filter);
    return res.status(200).json(atividades);
  } catch (err) {
    return res.status(500).json({ message: "Erro interno ao buscar atividades." });
  }
};

const getActivityById = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id)
      .populate('planActivitiesId', 'nome')
      .populate('createdUserId', 'nome email');
    if (!activity) {
      return handleError(res, "ACTIVITY_NOT_FOUND");
    }
    return res.status(200).json(activity);
  } catch (err) {
    return res.status(500).json({ message: "Erro interno ao obter atividade." });
  }
};

const createActivity = async (req, res) => {

  const { nome, descricao, local, data, estado } = req.body;
  const idPlano = req.params.idPlano;

  if (!nome || !descricao || !local || !data || typeof estado !== 'boolean' || !idPlano) {
    return handleError(res, "ACTIVITY_REGISTRATION_BAD_REQUEST");
  }

  const activityDate = new Date(data);
  if (isNaN(activityDate.getTime()) || activityDate <= new Date()) {
    return handleError(res, "ACTIVITY_REGISTRATION_INVALID_DATE");
  }

  try {
    const plan = await Plan.findById(idPlano);
    if (!plan) {
      return handleError(res, "PLAN_ACTIVITY_NOT_FOUND");
    }

    const duplicate = await Activity.findOne({ nome, local, data });
    if (duplicate) {
      return handleError(res, "ACTIVITY_REGISTRATION_DUPLICATE");
    }

    const activity = new Activity({
      nome,
      descricao,
      local,
      fotos: [],
      estado,
      data,
      planActivitiesId: idPlano,
      createdUserId: req.user.userId,
    });

    await activity.save();
    plan.associatedActivities.push(activity._id);
    await plan.save();

    const user = await User.findById(req.user.userId);
    if (user) {
      user.associatedActivities.push(activity._id);
      await user.save();
    }

    try {
      await enviarEmail(
        `${user.email}`,
        `Confirmação de Inscrição na Atividade ${activity.nome}`,
        `Olá ${user.name}!`,
        `<p>Olá <strong>${user.name}</strong>,</p><p>Sua inscrição na atividade "<strong>${activity.nome}</strong>" foi confirmada.</p><p>Em breve você receberá mais informações sobre data, horário e local.</p><p>Obrigado por participar!</p>`
      );
    } catch (emailError) {
      console.error("Erro ao enviar notificação por e-mail:", emailError);
    }

    return res.status(201).json({
      message: "Atividade registrada com sucesso!",
      atividadeId: activity._id,
    });
  } catch (err) {
    return res.status(500).json({ message: "Erro interno ao registrar atividade." });
  }
};

const addParticipant = async (req, res) => {
  const { nome, email } = req.body;

  if (!nome || !email) {
    return handleError(res, "ACTIVITY_REGISTRATION_BAD_REQUEST");
  }

  try {
    const activity = await Activity.findById(req.params.idAtividade);
    if (!activity) {
      return handleError(res, "ACTIVITY_NOT_FOUND");
    }

    if (activity.participants && activity.participants.find(p => p.email === email)) {
      return handleError(res, "ACTIVITY_REGISTRATION_DUPLICATE");
    }

    activity.participants.push({ nome, email });
    await activity.save();

    await enviarEmail(
      `${email}`,
      `Confirmação de Inscrição na Atividade ${activity.nome}`,
      `Olá ${nome}!`,
      `<p>Olá <strong>${nome}</strong>,</p><p>Sua inscrição na atividade "<strong>${activity.nome}</strong>" foi confirmada.</p><p>Em breve você receberá mais informações sobre data, horário e local.</p><p>Obrigado por participar!</p>`
    );

    return res.status(200).json({
      message: "Participante adicionado com sucesso!",
      atividadeId: activity._id,
    });
  } catch (err) {
    return res.status(500).json({ message: "Erro interno ao adicionar participante." });
  }
};

const updateActivity = async (req, res) => {
  
  const { id } = req.params;
  const { nome, descricao, local, fotos, data, estado } = req.body;

  try {
    const activity = await Activity.findById(id);
    if (!activity) {
      return handleError(res, "ACTIVITY_NOT_FOUND");
    }

    if (nome !== undefined) activity.nome = nome;
    if (descricao !== undefined) activity.descricao = descricao;
    if (local !== undefined) activity.local = local;
    if (fotos !== undefined) activity.fotos = fotos;
    if (estado !== undefined) activity.estado = estado;
    if (data !== undefined) {
      const newDate = new Date(data);
      if (isNaN(newDate.getTime())) {
        return handleError(res, "ACTIVITY_REGISTRATION_BAD_REQUEST");
      }
      activity.data = data;
    }

    await activity.save();
    return res.status(200).json({ message: "Atividade atualizada com sucesso!" });
  } catch (err) {
    return res.status(500).json({ message: "Erro interno ao atualizar atividade." });
  }
};

const deleteActivity = async (req, res) => {
  const { id } = req.params;

  try {
    const activity = await Activity.findById(id);
    if (!activity) {
      return handleError(res, "ACTIVITY_NOT_FOUND");
    }
    if (activity.estado) {
      return handleError(res, "ACTIVITY_CANNOT_DELETE");
    }

    if (activity.planActivitiesId) {
      await Plan.findByIdAndUpdate(activity.planActivitiesId, {
        $pull: { associatedActivities: activity._id },
      });
    }

    await Activity.findByIdAndDelete(id);
    return res.status(200).json({ message: "Atividade removida com sucesso." });
  } catch (err) {
    return res.status(500).json({ message: "Erro interno ao remover atividade." });
  }
};

const finalizeActivity = async (req, res) => {

  const { id } = req.params;
  const { participantsCount } = req.body;

  try {
    const activity = await Activity.findById(id);
    if (!activity) {
      return handleError(res, "ACTIVITY_NOT_FOUND");
    }

    const currentDate = new Date();
    if (new Date(activity.data) > currentDate) {
      return handleError(res, "ACTIVITY_FINALIZE_BLOCKED");
    }

    await Activity.findByIdAndUpdate(id, {
      estado: false,
      participantsCount,
    });
    return res.status(200).json({ message: "Atividade finalizada com sucesso." });
  } catch (err) {
    return res.status(500).json({ message: "Erro interno ao remover atividade." });
  }
};

module.exports = {
  getAllActivities,
  getActivityById,
  createActivity,
  addParticipant,
  updateActivity,
  deleteActivity,
  finalizeActivity,
};
