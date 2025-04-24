// Import data models
const Plan = require("../models/plan.model.js");
const Activity = require("../models/activity.model.js");

const getAllPlans = async (req, res) => {
  // 401 Unauthorized: token não fornecido ou inválido
  if (!req.user) {
    return res.status(401).json({
      errorCode: "AUTH_UNAUTHORIZED",
      message: "Token inválido ou não fornecido.",
    });
  }

  // 403 Forbidden: apenas admins podem listar planos
  if (req.user.type !== "Admin") {
    return res.status(403).json({
      errorCode: "PLAN_CREATION_UNAUTHORIZED",
      message: "Não tem permissões para realizar esta ação",
    });
  }

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
  // 401 Unauthorized: token não fornecido ou inválido
  if (!req.user) {
    return res.status(401).json({
      errorCode: "AUTH_UNAUTHORIZED",
      message: "Token inválido ou não fornecido.",
    });
  }

  // 403 Forbidden: apenas admins podem obter detalhes de um plano
  if (req.user.type !== "Admin") {
    return res.status(403).json({
      errorCode: "PLAN_CREATION_UNAUTHORIZED",
      message: "Não tem permissões para realizar esta ação",
    });
  }

  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({
        errorCode: "PLAN_NOT_FOUND",
        message: "O plano de atividades solicitado não foi encontrado.",
      });
    }
    return res.status(200).json(plan);
  } catch (err) {
    return res.status(500).json({ message: "Erro interno ao obter plano." });
  }
};

const createPlan = async (req, res) => {
  // 401 Unauthorized: token não fornecido ou inválido
  if (!req.user) {
    return res.status(401).json({
      errorCode: "AUTH_UNAUTHORIZED",
      message: "Token inválido ou não fornecido.",
    });
  }

  // 403 Forbidden: apenas Coordenadores podem criar planos
  if (req.user.type !== "Coordenador") {
    return res.status(403).json({
      errorCode: "PLAN_CREATION_UNAUTHORIZED",
      message: "Apenas Coordenadores podem criar planos de atividades.",
    });
  }

  const {
    nome,
    descricao,
    data_inicio,
    data_fim,
    associatedActivities,
    resources,
  } = req.body;

  // 400 Bad Request: campos obrigatórios em falta
  if (!nome || !descricao || !data_inicio || !data_fim || !resources) {
    return res.status(400).json({
      errorCode: "PLAN_CREATION_BAD_REQUEST",
      message: "Nome, descrição, datas e recursos são obrigatórios!",
    });
  }

  // validação de datas
  const inicio = new Date(data_inicio);
  const fim = new Date(data_fim);
  if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) {
    return res.status(400).json({
      errorCode: "PLAN_CREATION_BAD_REQUEST",
      message: "Nome, descrição, datas e recursos são obrigatórios!",
    });
  }
  if (inicio >= fim) {
    return res.status(409).json({
      errorCode: "PLAN_CREATION_INVALID_DATE",
      message: "A data de início deve ser anterior à data de término.",
    });
  }

  try {
    // 409 Conflict: nome duplicado
    const existing = await Plan.findOne({ nome });
    if (existing) {
      return res.status(409).json({
        errorCode: "PLAN_CREATION_DUPLICATE",
        message: "Já existe um plano de atividades com esse nome.",
      });
    }

    // cria e guarda o plano
    const plan = new Plan({
      nome,
      descricao,
      data_inicio: inicio,
      data_fim: fim,
      associatedActivities: associatedActivities || [],
      resources,
    });
    await plan.save();

    return res.status(201).json({
      message: "Plano de atividades criado com sucesso!",
      planoId: plan._id,
    });
  } catch (err) {
    return res.status(500).json({ message: "Erro interno ao criar plano." });
  }
};

const updatePlan = async (req, res) => {
  // 401 Unauthorized
  if (!req.user) {
    return res.status(401).json({
      errorCode: "AUTH_UNAUTHORIZED",
      message: "Token inválido ou não fornecido.",
    });
  }

  // 403 Forbidden: só Coordenadores podem editar planos
  if (req.user.type !== "Coordenador") {
    return res.status(403).json({
      errorCode: "PLAN_CREATION_UNAUTHORIZED",
      message: "Não tem permissões para realizar esta ação",
    });
  }

  const { id } = req.params;
  const {
    nome,
    descricao,
    data_inicio,
    data_fim,
    associatedActivities,
    resources,
  } = req.body;

  // 400 Bad Request: nenhum campo fornecido
  if (
    nome === undefined &&
    descricao === undefined &&
    data_inicio === undefined &&
    data_fim === undefined &&
    associatedActivities === undefined &&
    resources === undefined
  ) {
    return res.status(400).json({
      errorCode: "PLAN_CREATION_BAD_REQUEST",
      message: "Nome, descrição, datas e atividades são obrigatórios!",
    });
  }

  // validações de datas, se fornecidas
  let inicio, fim;
  if (data_inicio) {
    inicio = new Date(data_inicio);
    if (isNaN(inicio.getTime())) {
      return res.status(400).json({
        errorCode: "PLAN_CREATION_BAD_REQUEST",
        message: "Nome, descrição, datas e atividades são obrigatórios!",
      });
    }
  }
  if (data_fim) {
    fim = new Date(data_fim);
    if (isNaN(fim.getTime())) {
      return res.status(400).json({
        errorCode: "PLAN_CREATION_BAD_REQUEST",
        message: "Nome, descrição, datas e atividades são obrigatórios!",
      });
    }
  }
  if (inicio && fim && inicio >= fim) {
    return res.status(400).json({
      errorCode: "PLAN_CREATION_BAD_REQUEST",
      message: "A data de início deve ser anterior à data de término.",
    });
  }

  try {
    const plan = await Plan.findById(id);
    if (!plan) {
      // 404 Not Found
      return res.status(404).json({
        errorCode: "PLAN_NOT_FOUND",
        message: "O plano de atividades solicitado não foi encontrado.",
      });
    }

    // aplica apenas os campos fornecidos
    if (nome !== undefined) plan.nome = nome;
    if (descricao !== undefined) plan.descricao = descricao;
    if (data_inicio !== undefined) plan.data_inicio = inicio;
    if (data_fim !== undefined) plan.data_fim = fim;
    if (associatedActivities !== undefined)
      plan.associatedActivities = associatedActivities;
    if (resources !== undefined) plan.resources = resources;

    await plan.save();

    return res.status(200).json({
      message: "Plano de atividades atualizado com sucesso!",
    });
  } catch (err) {
    return res.status(500).json({ message: "Erro interno ao atualizar plano." });
  }
};

const deletePlan = async (req, res) => {
  // 401 Unauthorized: token não fornecido ou inválido
  if (!req.user) {
    return res.status(401).json({
      errorCode: "AUTH_UNAUTHORIZED",
      message: "Token inválido ou não fornecido.",
    });
  }

  // 403 Forbidden: apenas Admins podem remover planos
  if (req.user.type !== "Admin") {
    return res.status(403).json({
      errorCode: "PLAN_CREATION_UNAUTHORIZED",
      message: "Não tem permissões para realizar esta ação",
    });
  }

  const { id } = req.params;

  try {
    // 404 Not Found: plano não existe
    const plan = await Plan.findById(id);
    if (!plan) {
      return res.status(404).json({
        errorCode: "PLAN_NOT_FOUND",
        message: "O plano de atividades solicitado não foi encontrado.",
      });
    }

    // 409 Conflict: plano vinculado a atividades em andamento
    const ongoing = await Activity.findOne({ plan: id, isActive: true });
    if (ongoing) {
      return res.status(409).json({
        errorCode: "PLAN_DELETE_BLOCKED",
        message:
          "Este plano está vinculado a atividades em andamento e não pode ser removido.",
      });
    }

    // Remove o plano
    await Plan.findByIdAndDelete(id);
    return res.status(200).json({
      message: "Plano de atividades removido com sucesso.",
    });
  } catch (err) {
    return res.status(500).json({ message: "Erro interno ao remover plano." });
  }
};

module.exports = {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
};
