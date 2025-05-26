// Import data models
const Activity = require("../models/activity.model.js");
const Plan = require("../models/plan.model.js");

const getAllActivities = async (req, res) => {
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
      errorCode: "ACTIVITY_REGISTRATION_UNAUTHORIZED",
      message: "Não tem permissões para realizar esta ação",
    });
  }

  try {
    const filter = {};
    if (req.query.name) filter.name = req.query.name;
    if (req.query.status) filter.status = req.query.status;

    const atividades = await Activity.find(filter);
    return res.status(200).json({ atividades });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Erro interno ao buscar atividades." });
  }
};

const getActivityById = async (req, res) => {
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
      errorCode: "ACTIVITY_REGISTRATION_UNAUTHORIZED",
      message: "Não tem permissões para realizar esta ação",
    });
  }

  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({
        errorCode: "ACTIVITY_NOT_FOUND",
        message: "A atividade solicitada não foi encontrada.",
      });
    }
    return res.status(200).json(activity);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Erro interno ao obter atividade." });
  }
};

const createActivity = async (req, res) => {
  // 401 Unauthorized: token não fornecido ou inválido
  if (!req.user) {
    return res.status(401).json({
      errorCode: "AUTH_UNAUTHORIZED",
      message: "Token inválido ou não fornecido.",
    });
  }

  // 403 Forbidden: apenas Conselho Eco-Escolas ou Secretariado
  const role = req.user.type;
  if (role !== "Conselho Eco-Escolas" && role !== "Secretariado") {
    return res.status(403).json({
      errorCode: "ACTIVITY_REGISTRATION_UNAUTHORIZED",
      message:
        "Apenas membros do Conselho Eco-Escolas ou Secretariado podem registrar atividades.",
    });
  }

  const { nome, descricao, area, fotos, data, planActivitiesId } = req.body;

  // 400 Bad Request: campos obrigatórios em falta
  if (!nome || !descricao || !area || !data || !planActivitiesId) {
    return res.status(400).json({
      errorCode: "ACTIVITY_REGISTRATION_BAD_REQUEST",
      message: "Nome, descrição, local são obrigatórios!",
    });
  }

  // 400 Bad Request: data deve ser futura
  const activityDate = new Date(data);
  if (isNaN(activityDate.getTime()) || activityDate <= new Date()) {
    return res.status(400).json({
      errorCode: "ACTIVITY_REGISTRATION_INVALID_DATE",
      message: "A data da atividade deve ser futura.",
    });
  }

  try {
    // 404 Not Found: plano de atividades não existe
    const plan = await Plan.findById(planActivitiesId);
    if (!plan) {
      return res.status(404).json({
        errorCode: "PLAN_ACTIVITY_NOT_FOUND",
        message: "Plano de atividade solicitado não foi encontrado.",
      });
    }

    // 409 Conflict: atividade duplicada (mesmo nome, area e data)
    const duplicate = await Activity.findOne({
      nome,
      local: area,
      data: activityDate,
    });
    if (duplicate) {
      return res.status(409).json({
        errorCode: "ACTIVITY_REGISTRATION_DUPLICATE",
        message:
          "Já existe uma atividade com esse nome e local para essa data.",
      });
    }

    // cria e guarda a atividade
    const activity = new Activity({
      nome,
      descricao,
      local: area,
      photos: fotos,
      data: activityDate,
      plan: planActivitiesId,
    });
    await activity.save();

    return res.status(201).json({
      message: "Atividade registrada com sucesso!",
      atividadeId: activity._id,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Erro interno ao registrar atividade." });
  }
};

const addParticipant = async (req, res) => {
  const { nome, email } = req.query;

  // 400 Bad Request: campos obrigatórios em falta
  if (!nome || !email) {
    return res.status(400).json({
      errorCode: "ACTIVITY_REGISTRATION_BAD_REQUEST",
      message: "Nome, email são obrigatórios!",
    });
  }

  try {
    // verifica se a atividade existe
    const activity = await Activity.findById(req.params.idActividade);
    if (!activity) {
      return res.status(404).json({
        errorCode: "ACTIVITY_NOT_FOUND",
        message: "A atividade solicitada não foi encontrada.",
      });
    }

    // 409 Conflict: participante já inscrito
    if (
      activity.participants &&
      activity.participants.find((p) => p.email === email)
    ) {
      return res.status(409).json({
        errorCode: "ACTIVITY_REGISTRATION_DUPLICATE",
        message: "Aluno já inscrito nesta atividade",
      });
    }

    // adiciona participante
    activity.participants = activity.participants || [];
    activity.participants.push({ nome, email });
    await activity.save();

    return res.status(200).json({
      message: "Atividade registrada com sucesso!",
      atividadeId: activity._id,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Erro interno ao adicionar participante." });
  }
};

const updateActivity = async (req, res) => {
  // 401 Unauthorized: token não fornecido ou inválido
  if (!req.user) {
    return res.status(401).json({
      errorCode: 'AUTH_UNAUTHORIZED',
      message: 'Token inválido ou não fornecido.'
    });
  }

  // 403 Forbidden: apenas Conselho Eco-Escolas / Secretariado
  const role = req.user.type;
  if (role !== 'Conselho Eco-Escolas' && role !== 'Secretariado') {
    return res.status(403).json({
      errorCode: 'PLAN_CREATION_UNAUTHORIZED',
      message: 'Não tem permissões para realizar esta ação'
    });
  }

  const { id } = req.params;
  const { nome, descricao, area, fotos, data, planActivitiesId } = req.body;

  try {
    const activity = await Activity.findById(id);
    if (!activity) {
      return res.status(404).json({
        errorCode: 'ACTIVITY_NOT_FOUND',
        message: 'A atividade solicitada não foi encontrada.'
      });
    }

    // Atualiza apenas os campos fornecidos
    if (nome !== undefined)      activity.nome = nome;
    if (descricao !== undefined) activity.descricao = descricao;
    if (area !== undefined)      activity.area = area;
    if (fotos !== undefined)     activity.photos = fotos;
    if (data !== undefined) {
      const newDate = new Date(data);
      if (isNaN(newDate.getTime())) {
        return res.status(400).json({
          errorCode: 'ACTIVITY_REGISTRATION_BAD_REQUEST',
          message: 'Data inválida.'
        });
      }
      activity.data = newDate;
    }
    if (planActivitiesId !== undefined) {
      const plan = await Plan.findById(planActivitiesId);
      if (!plan) {
        return res.status(404).json({
          errorCode: 'PLAN_ACTIVITY_NOT_FOUND',
          message: 'Plano de atividade solicitado não foi encontrado.'
        });
      }
      activity.plan = planActivitiesId;
    }

    await activity.save();
    return res.status(200).json({
      message: 'Atividade atualizada com sucesso!'
    });
  } catch (err) {
    return res.status(500).json({ message: 'Erro interno ao atualizar atividade.' });
  }
};

const deleteActivity = async (req, res) => {
  // 401 Unauthorized: token não fornecido ou inválido
  if (!req.user) {
    return res.status(401).json({
      errorCode: 'AUTH_UNAUTHORIZED',
      message: 'Token inválido ou não fornecido.'
    });
  }

  // 403 Forbidden: apenas Coordenador ou Admin
  const role = req.user.type;
  if (role !== 'Coordenador' && role !== 'Admin') {
    return res.status(403).json({
      errorCode: 'PLAN_CREATION_UNAUTHORIZED',
      message: 'Não tem permissões para realizar esta ação'
    });
  }

  const { id } = req.params;

  try {
    // 404 Not Found: atividade não existe
    const activity = await Activity.findById(id);
    if (!activity) {
      return res.status(404).json({
        errorCode: 'ACTIVITY_NOT_FOUND',
        message: 'A atividade solicitada não foi encontrada.'
      });
    }

    // Remove a atividade
    await Activity.findByIdAndDelete(id);
    return res.status(200).json({
      message: 'Atividade removida com sucesso.'
    });
  } catch (err) {
    return res.status(500).json({ message: 'Erro interno ao remover atividade.' });
  }
};

module.exports = {
  getAllActivities,
  getActivityById,
  createActivity,
  addParticipant,
  updateActivity,
  deleteActivity
};
