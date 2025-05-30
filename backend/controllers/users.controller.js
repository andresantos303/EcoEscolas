// Import data models
const User = require("../models/user.model.js");
const Plan = require('../models/plan.model.js');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const getAllUsers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.name) filter.name = req.query.name;
    if (req.query.type) filter.type = req.query.type;

    const users = await User.find(filter);
    return res.status(200).json(users);
  } catch (err) {
    return res.status(500).json({ message: "Erro ao buscar utilizadores." });
  }
};

const createUser = async (req, res) => {

  const { name, email, password, type } = req.body;

  // 400 Bad Request: campos em falta
  if (!name || !email || !password || !type) {
    return res.status(400).json({
      errorCode: "USER_REGISTRATION_BAD_REQUEST",
      message: "Todos os campos obrigatórios devem ser preenchidos!",
    });
  }

  // 400 Bad Request: email inválido
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      errorCode: "USER_REGISTRATION_INVALID_EMAIL",
      message: "O e-mail fornecido não é válido. Insira um e-mail correto!",
    });
  }

  // 400 Bad Request: password fraca
  const pwdRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#\$%\^&\*]).{8,}$/;
  if (!pwdRegex.test(password)) {
    return res.status(400).json({
      errorCode: "USER_REGISTRATION_WEAK_PASSWORD",
      message:
        "A password deve ter pelo menos 8 caracteres, incluindo letras maiúsculas, números e caracteres especiais.",
    });
  }

  try {
    // 409 Conflict: email já existe
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        errorCode: "USER_EMAIL_ALREADY_EXISTS",
        message: "O e-mail fornecido já está em uso. Escolha outro e-mail!",
      });
    }

    // cria e guarda o novo utilizador
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    const user = new User({ name, email, password: hash, type });
    await user.save();

    // 201 Created
    return res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      type: user.type,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Erro interno ao registar utilizador." });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      errorCode: "LOGIN_BAD_REQUEST",
      message: "E-mail e password são obrigatórios!",
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        errorCode: "LOGIN_USER_NOT_REGISTERED",
        message: "Utilizador não encontrado. Registe-se primeiro!",
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({
        errorCode: "LOGIN_INVALID_CREDENTIALS",
        message: "E-mail ou password incorretos!",
      });
    }

    //criação do jwt token
    const payload = { userId: user._id, type: user.type };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    return res.status(200).json({
      // id: user._id,
      //type: user.type,
      token,
      
    });
  } catch (err) {
    return res.status(500).json({ message: "Erro interno no login." });
  }
};

const getUserById = async (req, res) => {
  const requestedId = req.params.id;

  try {
    const user = await User.findById(requestedId);
    if (!user) {
      return res.status(404).json({
        errorCode: "AUTH_UNAUTHORIZED",
        message: "Utilizador não encontrado",
      });
    }

    return res.status(200).json(user);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Erro interno ao obter utilizador." });
  }
};


const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, type } = req.body;

  // 400 Bad Request: nenhum campo para atualizar ou dados inválidos
  if (!name && !email && !type) {
    return res.status(400).json({
      errorCode: "USER_DATA_INVALID",
      message:
        "Dados inválidos. Verifique os campos obrigatórios e tente novamente.",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  /* const pwdRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#\$%\^&\*]).{8,}$/; */
  if (email && !emailRegex.test(email)) {
    return res.status(400).json({
      errorCode: "USER_DATA_INVALID",
      message:
        "Dados inválidos. Verifique os campos obrigatórios e tente novamente.",
    });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        errorCode: "USER_NOT_FOUND",
        message: "O utilizador solicitado não foi encontrado.",
      });
    }

    // 409 Conflict: email já está em uso por outro utilizador
    if (email && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(409).json({
          errorCode: "USER_ALREADY_EXISTS",
          message: "Este e-mail já está registado no sistema.",
        });
      }
      user.email = email;
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (type) user.type = type;
    await user.save();

    return res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      type: user.type,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Erro interno ao atualizar utilizador." });
  }
};

const deleteUser = async (req, res) => {

    const { id } = req.params;
  
    try {
      // 404 Not Found: utilizador não existe
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          errorCode: 'USER_NOT_FOUND',
          message: 'O utilizador solicitado não foi encontrado.'
        });
      }
  
      // 403 Forbidden: associado a projeto ativo (ajuste a query ao seu schema)  É NECESSARIO REVER
      const activeProject = await Plan.findOne({ owner: id, isActive: true });
      if (activeProject) {
        return res.status(403).json({
          errorCode: 'USER_DELETE_BLOCKED',
          message: 'Este utilizador está associado a um projeto ativo e não pode ser removido.'
        });
      }
  
      // Remove o utilizador
      await User.findByIdAndDelete(id);
      return res.status(200).json({ message: 'Utilizador removido com sucesso.' });
    } catch (err) {
      return res.status(500).json({ message: 'Erro interno ao remover utilizador.' });
    }
  };


 /*   const createAdmin = async (req, res) => {
   try {
      const existingAdmin = await User.findOne({ email: "admin@teste.com" });
      if (existingAdmin) return res.status(400).json({ message: "Admin já existe." });
  
      const hashedPassword = await bcrypt.hash("admin123", 10);
      const admin = new User({
        name: "Admin",
        email: "admin@teste.com",
        password: hashedPassword,
        type: "Admin"
      });
  
      await admin.save();
      res.status(201).json({ message: "Admin criado com sucesso." });
    } catch (err) {
      res.status(500).json({ message: "Erro ao criar admin.", error: err.message });
    }
  }; 
   */
  module.exports = {
    getAllUsers,
    createUser,
    loginUser,
    getUserById,
    updateUser,
    deleteUser,
    /* createAdmin  */
  };
