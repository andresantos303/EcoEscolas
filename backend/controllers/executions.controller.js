// Import the execution data model
const Execution = require('../models/execution.model.js');
<<<<<<< HEAD
const Activity = require("../models/activity.model.js");

const deleteExecutionById = async (req, res) => {
    // 401 Unauthorized: token não fornecido ou inválido
    if (!req.user) {
      return res.status(401).json({
        errorCode: "AUTH_UNAUTHORIZED",
        message: "Token inválido ou não fornecido.",
      });
    }
  
    // Apenas Coordenador ou Admin podem remover execuções
    const userType = req.user.type;
    if (userType !== "Admin" && userType !== "Coordenador") {
      return res.status(403).json({
        errorCode: "EXECUTION_DELETE_BLOCKED",
        message: "Esta execução só pode ser removida pelo coordenador ou administrador.",
      });
    }
  
    try {
      const execution = await Execution.findById(req.params.id);
  
      if (!execution) {
        return res.status(404).json({
          errorCode: "EXECUTION_NOT_FOUND",
          message: "A execução da atividade solicitada não foi encontrada.",
        });
      }
  
      // Se estiver concluída, só o Coordenador pode remover
      if (execution.status === "concluída" && userType !== "Coordenador") {
        return res.status(403).json({
          errorCode: "EXECUTION_DELETE_BLOCKED",
          message: "Esta execução está marcada como concluída e só pode ser removida pelo coordenador.",
        });
      }
  
      await Execution.findByIdAndDelete(req.params.id);
      return res.status(200).json({
        message: "Execução da atividade removida com sucesso.",
      });
  
    } catch (err) {
      return res.status(500).json({
        message: "Erro interno ao remover execução da atividade.",
      });
    }
  };

  const updateExecution = async (req, res) => {
    // 401 Unauthorized: token não fornecido ou inválido
    if (!req.user) {
      return res.status(401).json({
        errorCode: "AUTH_UNAUTHORIZED",
        message: "Token inválido ou não fornecido.",
      });
    }
  
    // 403 Forbidden: apenas Conselho Eco-Escolas ou Secretariado
    const userType = req.user.type;
    if (userType !== "Conselho Eco-Escolas" && userType !== "Secretariado") {
      return res.status(403).json({
        errorCode: "EXECUTION_REGISTRATION_UNAUTHORIZED",
        message:
          "Apenas membros do Conselho Eco-Escolas ou Secretariado podem editar a execução de atividades.",
      });
    }
  
    try {
      const execution = await Execution.findById(req.params.id);
  
      // 404 Not Found: Verifica se a execução existe
      if (!execution) {
        return res.status(404).json({
          errorCode: "EXECUTION_NOT_FOUND",
          message: "A execução da atividade solicitada não foi encontrada.",
        });
      }
  
      // Aqui você pode atualizar os campos que foram enviados na requisição (body params)
      const updateData = {};
  
      if (req.body.atividadeId) updateData.atividadeId = req.body.atividadeId;
      if (req.body.data_execucao) updateData.data_execucao = req.body.data_execucao;
      if (req.body.status) updateData.status = req.body.status;
      if (req.body.comments) updateData.comments = req.body.comments;
      if (req.body.fotos) updateData.fotos = req.body.fotos;
  
      // Atualiza a execução com os novos dados
      const updatedExecution = await Execution.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true } // Retorna o documento atualizado
      );
  
      return res.status(200).json({
        message: "Execução da atividade atualizada com sucesso.",
        updatedExecution,
      });
    } catch (err) {
      return res.status(500).json({
        message: "Erro interno ao atualizar execução da atividade.",
      });
    }
  };

  const getExecutionById = async (req, res) => {
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
      const execution = await Execution.findById(req.params.id);
      if (!execution) {
        return res.status(404).json({
          errorCode: "EXECUTION_NOT_FOUND",
          message: "A atividade solicitada não foi encontrada.",
        });
      }
      return res.status(200).json(execution);
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Erro interno ao obter atividade." });
    }
  };

  const getAllExecutions = async (req, res) => {
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
        errorCode: "EXECUTION_REGISTRATION_UNAUTHORIZED",
        message: "Não tem permissões para realizar esta ação",
      });
    }
  
    try {
      const filter = {};
      if (req.query.name) filter.name = req.query.name;
      if (req.query.status) filter.status = req.query.status;
  
      const execution = await Execution.find(filter);
      return res.status(200).json({ execution });
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Erro interno ao buscar atividades." });
    }
  };

  const createExecution = async (req, res) => {
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
        errorCode: "EXECUTION_REGISTRATION_UNAUTHORIZED",
        message:
          "Apenas membros do Conselho Eco-Escolas ou Secretariado podem registrar atividades.",
      });
    }
  
    const { atividadeId, executionDate, status, comments, fotos } = req.body;
  
    // 400 Bad Request: campos obrigatórios em falta
    if (!atividadeId || !executionDate || !status || !comments) {
      return res.status(400).json({
        errorCode: "EXECUTION_REGISTRATION_BAD_REQUEST",
        message: "Nome, descrição, local são obrigatórios!",
      });
    }
  
    // 400 Bad Request: data deve ser futura
    if (isNaN(executionDate.getTime()) || executionDate <= new Date()) {
      return res.status(400).json({
        errorCode: "EXECUTION_REGISTRATION_INVALID_DATE",
        message: "A data da atividade deve ser futura.",
      });
    }
  
    try {
      // 404 Not Found: atividade não existe
      const atividade = await Activity.findById(atividadeId);
      if (!atividade) {
        return res.status(404).json({
          errorCode: "ACTIVITY_NOT_FOUND",
          message: "Atividade solicitado não foi encontrado.",
        });
      }
  
      // cria e guarda a atividade
      const execution = new Execution({
        atividade: atividadeId,
        data: executionDate,
        status,
        comments,
        photos: fotos,
      });
      await execution.save();
  
      return res.status(201).json({
        message: "Execução registrada com sucesso!",
        atividadeId: execution._id,
      });
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Erro interno ao registrar atividade." });
    }
  };
  


module.exports = {
    deleteExecutionById,
    updateExecution,
    getExecutionById,
    getAllExecutions,
    createExecution
=======



module.exports = {
    
>>>>>>> d79ac0919279036421d53d7b7af8120f8ccf6718
}