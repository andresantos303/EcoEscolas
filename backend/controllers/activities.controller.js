const Activity = require("../models/activity.model.js");
const Plan = require("../models/plan.model.js");
const User = require("../models/user.model.js");
const { enviarEmail, enviarEmailNotificação } = require("../utils/nodemailer.js");
const { handleError } = require("../utils/errorHandler.js");
const { cloudinary } = require('../utils/upload.js');


const getAllActivities = async (req, res) => {
  try {
    const filter = {};
    if (req.query.nome) filter.nome = req.query.nome;
    if (req.params.estado) filter.estado = req.params.estado;

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
  const { nome, descricao, local, data } = req.body;
  const estado = req.body.estado === 'true';
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
    if (!plan) return handleError(res, "PLAN_ACTIVITY_NOT_FOUND");

    const duplicate = await Activity.findOne({ nome, local, data });
    if (duplicate) return handleError(res, "ACTIVITY_REGISTRATION_DUPLICATE");

    const recursosCloud = [];

    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path);
      recursosCloud.push({
        profile_image: result.secure_url,
        cloudinary_id: result.public_id,
      });
    }

    const activity = new Activity({
      nome,
      descricao,
      local,
      fotos: recursosCloud,
      estado,
      data,
      planActivitiesId: idPlano,
      createdUserId: req.user.userId,
    });

    await activity.save();

    await Plan.findByIdAndUpdate(idPlano, { $push: { associatedActivities: activity._id } });

    const user = await User.findById(req.user.userId);
    if (user) {
      user.associatedActivities.push(activity._id);
      await user.save();
    }

    try {
      await enviarEmailNotificação(
        "Secretariado",
        `Criação da Atividade ${nome}`,
        `O utilizador ${user.name} criou a atividade "${nome}" dentro do plano ${plan.nome} com a data de início ${data} e no local ${local}.`
      );
    } catch (emailError) {
      console.error("Erro ao enviar notificação por e-mail:", emailError);
    }

    return res.status(201).json({
      message: "Atividade registrada com sucesso!",
      atividadeId: activity._id,
    });
  } catch (err) {
    console.error("Erro interno ao registrar atividade:", err);
    return res.status(500).json({ message: "Erro interno ao registrar atividade." });
  }

};

const addParticipant = async (req, res) => {
  const { nome, email } = req.body;

  if (!nome || !email) {
    return handleError(res, "ACTIVITY_PARTICIPANT_BAD_REQUEST");
  }

  try {
    const activity = await Activity.findById(req.params.idAtividade);
    if (!activity) {
      return handleError(res, "ACTIVITY_NOT_FOUND");
    }

    if (activity.participants && activity.participants.find(p => p.email === email)) {
      return handleError(res, "ACTIVITY_PARTICIPANT_DUPLICATE");
    }

    activity.participants.push({ nome, email });
    await activity.save();
    await enviarEmail(
      `${email}`,
      `Confirmação de Inscrição na Atividade ${activity.nome}`,
      `Olá ${nome}!`,
      `<p>Olá <strong>${nome}</strong>,</p><p>Sua inscrição na atividade <strong>${activity.nome}</strong> foi confirmada.</p><p>Em breve você receberá mais informações sobre data, horário e local.</p><p>Obrigado por participar!</p>`
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
      const activityDate = new Date(data);
      if (isNaN(newDate.getTime()) || newDate <= new Date()) {
        return handleError(res, "ACTIVITY_REGISTRATION_INVALID_DATE");
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

    // --- Remoção das imagens no Cloudinary ---
    if (Array.isArray(activity.fotos) && activity.fotos.length > 0) {
      // chama destroy para cada public_id salvo
      await Promise.all(activity.fotos.map(({ cloudinary_id }) =>
        cloudinary.uploader.destroy(cloudinary_id)
      ));
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

    if (!participantsCount) {
      return res.status(400).json({
        errorCode: "PARTICIPANTS_COUNT_REQUIRED",
        message: "O número de participantes é obrigatório para finalizar a atividade.",
      });
    }

    // Extrair URLs das imagens do Cloudinary
    const novasImagens = req.files?.map(file => file.path) || [];

    await Activity.findByIdAndUpdate(id, {
      estado: false,
      fotos: [...activity.fotos, ...novasImagens],
      participantsCount,
    });

    return res.status(200).json({ message: "Atividade finalizada com sucesso." });
  } catch (err) {
    return res.status(500).json({ message: "Erro interno ao finalizar atividade." });
  }
};

const startActivity = async (req, res) => {
  const { id } = req.params;

  try {
    const activity = await Activity.findById(id);
    if (!activity) {
      return handleError(res, "ACTIVITY_NOT_FOUND");
    }

    await Activity.findByIdAndUpdate(id, { estado: true });

    return res.status(200).json({ message: "Atividade inicializada com sucesso." });
  } catch (err) {
    return res.status(500).json({ message: "Erro interno ao inicializar atividade." });
  }
};

const getActivitiesCount = async (req, res) => {
  try {
    const count = await Activity.countDocuments();
    res.status(200).json({ count });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao contar atividades.' });
  }
};

const getActivitiesByPlan = async (req, res) => {
  try {
    const idPlano = req.params.idPlano;
    if (!idPlano) {
      return res.status(400).json({ message: "ID do plano é obrigatório" });
    }
    const atividades = await Activity.find({ planActivitiesId: idPlano });
    return res.status(200).json(atividades);
  } catch (error) {
    console.error("Erro ao buscar atividades por plano:", error);
    return res.status(500).json({ message: "Erro ao buscar atividades por plano." });
  }
};

const getActivitiesPublic = async (req, res) => {
  try {
    const activities = await Activity.find({ planActivitiesId: req.params.id });
    res.json(activities);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar atividades' });
  }
};

const getActivityPublicById = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id)
      .select('nome descricao local data fotos estado planActivitiesId')
      .populate('planActivitiesId', 'nome');

    if (!activity) {
      return res.status(404).json({ message: "Atividade não encontrada" });
    }

    return res.status(200).json(activity);
  } catch (err) {
    return res.status(500).json({ message: "Erro interno ao buscar atividade." });
  }
};


module.exports = {
  getAllActivities,
  getActivityById,
  getActivitiesByPlan,
  createActivity,
  addParticipant,
  updateActivity,
  deleteActivity,
  finalizeActivity,
  startActivity,
  getActivitiesCount,
  getActivitiesPublic,
  getActivityPublicById
};
