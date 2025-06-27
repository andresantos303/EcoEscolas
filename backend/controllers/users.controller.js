const User = require("../models/user.model.js");
const Plan = require("../models/plan.model.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { handleError } = require("../utils/errorHandler.js");
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

  if (!name || !email || !password || !type) {
    return handleError(res, "USER_REGISTRATION_BAD_REQUEST");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return handleError(res, "USER_REGISTRATION_INVALID_EMAIL");
  }

  const pwdRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#\$%\^&\*]).{8,}$/;
  if (!pwdRegex.test(password)) {
    return handleError(res, "USER_REGISTRATION_WEAK_PASSWORD");
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return handleError(res, "USER_EMAIL_ALREADY_EXISTS");
    }

    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    const user = new User({ name, email, password: hash, type });
    await user.save();

    return res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      type: user.type,
    });
  } catch (err) {
    return res.status(500).json({ message: "Erro interno ao registar utilizador." });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return handleError(res, "LOGIN_BAD_REQUEST");
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return handleError(res, "LOGIN_USER_NOT_REGISTERED");
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return handleError(res, "LOGIN_INVALID_CREDENTIALS");
    }

    const payload = { userId: user._id, type: user.type };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    return res.status(200).json({
      id: user._id,
      token,
    });
  } catch (err) {
    return res.status(500).json({ message: "Erro interno no login." });
  }
};

const getUserById = async (req, res) => {
  const requestedId = req.params.id;

  try {
    const user = await User.findById(requestedId).populate("associatedActivities");
    if (!user) {
      return handleError(res, "AUTH_UNAUTHORIZED");
    }
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ message: "Erro interno ao obter utilizador." });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, type } = req.body;

  if (!name && !email && !type) {
    return handleError(res, "USER_DATA_INVALID");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
    return handleError(res, "USER_DATA_INVALID");
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return handleError(res, "USER_NOT_FOUND");
    }

    if (email && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists) {
        return handleError(res, "USER_ALREADY_EXISTS");
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
    return res.status(500).json({ message: "Erro interno ao atualizar utilizador." });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) {
      return handleError(res, "USER_NOT_FOUND");
    }

    const activeProject = await Plan.findOne({ owner: id, isActive: true });
    if (activeProject) {
      return handleError(res, "USER_DELETE_BLOCKED");
    }

    await User.findByIdAndDelete(id);
    return res.status(200).json({ message: 'Utilizador removido com sucesso.' });
  } catch (err) {
    return res.status(500).json({ message: 'Erro interno ao remover utilizador.' });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  loginUser,
  getUserById,
  updateUser,
  deleteUser,
};
