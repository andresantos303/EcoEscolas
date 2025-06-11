const Plan = require("../models/plan.model.js");
const User = require("../models/user.model.js");
const Activity = require("../models/activity.model.js");
const { enviarEmailNotificação } = require("../utils/nodemailer.js");
const { handleError } = require("../utils/errorHandler.js");

const getAllPlans = async (req, res) => {
  try {
    const filter = {};
    if (req.query.name) filter.name = req.query.name;
    if (req.query.status) filter.status = req.query.status;

    const planos = await Plan.find(filter);
    return res.status(200).json(planos);
  } catch (err) {
    return res.status(500).json({ message: "Erro interno ao buscar planos." });
  }
};

const getPlanById = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id).populate("associatedActivities");
    if (!plan) {
      return handleError(res, "PLAN_NOT_FOUND");
    }
    return res.status(200).json(plan);
  } catch (err) {
    return res.status(500).json({ message: "Erro interno ao obter plano." });
  }
};

const createPlan = async (req, res) => {
  const {
    nome,
    descricao,
    data_inicio,
    data_fim,
    estado,
    nivel,
    associatedActivities,
    recursos,
  } = req.body;

  if (!nome || !descricao || !data_inicio || !data_fim || typeof estado !== 'boolean' || !nivel || !recursos) {
    return handleError(res, "PLAN_CREATION_BAD_REQUEST");
  }

  const inicio = new Date(data_inicio);
  const fim = new Date(data_fim);
  if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) {
    return handleError(res, "PLAN_CREATION_BAD_REQUEST");
  }
  if (inicio >= fim) {
    return handleError(res, "PLAN_CREATION_INVALID_DATE");
  }

  try {
    const existing = await Plan.findOne({ nome });
    if (existing) {
      return handleError(res, "PLAN_CREATION_DUPLICATE");
    }

    const plan = new Plan({
      nome,
      descricao,
      data_inicio,
      data_fim,
      nivel,
      estado,
      associatedActivities: associatedActivities || [],
      recursos,
      createdUserId: req.user.userId,
    });
    await plan.save();

    const user = await User.findById(req.user.userId);
    await enviarEmailNotificação(
      "Coordenador/Conselho Eco-Escolas",
      `Criação do Plano de Atividade ${nome}`,
      `O utilizador ${user.name} criou o plano de atividades "${nome}" com data de início ${data_inicio} e data de fim ${data_fim} e de nível ${nivel}.`
    );

    return res.status(201).json({
      message: "Plano de atividades criado com sucesso!",
      planoId: plan._id,
    });
  } catch (err) {
    return res.status(500).json({ message: "Erro interno ao criar plano." });
  }
};

const updatePlan = async (req, res) => {
  const { id } = req.params;
  const {
    nome,
    descricao,
    data_inicio,
    data_fim,
    estado,
    nivel,
    associatedActivities,
    recursos,
  } = req.body;

  if (
    nome === undefined &&
    descricao === undefined &&
    data_inicio === undefined &&
    data_fim === undefined &&
    associatedActivities === undefined &&
    recursos === undefined &&
    estado === undefined &&
    nivel === undefined
  ) {
    return handleError(res, "PLAN_CREATION_BAD_REQUEST");
  }

  let inicio, fim;
  if (data_inicio) {
    inicio = new Date(data_inicio);
    if (isNaN(inicio.getTime())) {
      return handleError(res, "PLAN_CREATION_BAD_REQUEST");
    }
  }
  if (data_fim) {
    fim = new Date(data_fim);
    if (isNaN(fim.getTime())) {
      return handleError(res, "PLAN_CREATION_BAD_REQUEST");
    }
  }
  if (inicio && fim && inicio >= fim) {
    return handleError(res, "PLAN_CREATION_BAD_REQUEST");
  }

  try {
    const plan = await Plan.findById(id);
    if (!plan) {
      return handleError(res, "PLAN_NOT_FOUND");
    }

    if (nome !== undefined) plan.nome = nome;
    if (descricao !== undefined) plan.descricao = descricao;
    if (data_inicio !== undefined) plan.data_inicio = data_inicio;
    if (data_fim !== undefined) plan.data_fim = data_fim;
    if (associatedActivities !== undefined) plan.associatedActivities = associatedActivities;
    if (recursos !== undefined) plan.recursos = recursos;
    if (estado !== undefined) plan.estado = estado;
    if (nivel !== undefined) plan.nivel = nivel;

    await plan.save();
    return res.status(200).json({ message: "Plano de atividades atualizado com sucesso!" });
  } catch (err) {
    return res.status(500).json({ message: "Erro interno ao atualizar plano." });
  }
};

const deletePlan = async (req, res) => {
  const { id } = req.params;

  try {
    const plan = await Plan.findById(id);
    if (!plan) {
      return handleError(res, "PLAN_NOT_FOUND");
    }

    const ongoing = await Activity.findOne({ plan: id, estado: true });
    if (ongoing) {
      return handleError(res, "PLAN_DELETE_BLOCKED");
    }

    if (plan.estado) {
      return handleError(res, "ACTIVITY_CANNOT_DELETE");
    }

    await Plan.findByIdAndDelete(id);
    return res.status(200).json({ message: "Plano de atividades removido com sucesso." });
  } catch (err) {
    return res.status(500).json({ message: "Erro interno ao remover plano." });
  }
};

const finalizePlan = async (req, res) => {
  const { id } = req.params;

  try {
    const plan = await Plan.findById(id);
    if (!plan) {
      return handleError(res, "PLAN_NOT_FOUND");
    }

    const ongoing = await Activity.findOne({ plan: id, estado: true });
    if (ongoing) {
      return handleError(res, "PLAN_DELETE_BLOCKED");
    }

    const currentDate = new Date();
    if (new Date(plan.data_fim) > currentDate) {
      return handleError(res, "PLAN_FINALIZE_BLOCKED");
    }

    await Plan.findByIdAndUpdate(id, { estado: false });
    return res.status(200).json({ message: "Plano de atividades finalizado com sucesso." });
  } catch (err) {
    return res.status(500).json({ message: "Erro interno ao remover plano." });
  }
};

const getPublicPlanNames = async (req, res) => {
  try {
    const planos = await Plan.find({}, { nome: 1, _id: 1 });
    return res.status(200).json(planos);
  } catch (err) {
    return res.status(500).json({ message: "Erro ao buscar nomes dos planos." });
  }
};


module.exports = {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  finalizePlan,
  getPublicPlanNames,
};
