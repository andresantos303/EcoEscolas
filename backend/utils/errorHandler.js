const errorMap = {
  // Users
  USER_REGISTRATION_BAD_REQUEST:       { status: 400, message: "Todos os campos obrigatórios devem ser preenchidos!" },
  USER_REGISTRATION_INVALID_EMAIL:     { status: 400, message: "O e-mail fornecido não é válido. Insira um e-mail correto!" },
  USER_REGISTRATION_WEAK_PASSWORD:     { status: 400, message: "A password deve ter pelo menos 8 caracteres, incluindo letras maiúsculas, números e caracteres especiais." },
  USER_EMAIL_ALREADY_EXISTS:           { status: 409, message: "O e-mail fornecido já está em uso. Escolha outro e-mail!" },
  LOGIN_BAD_REQUEST:                   { status: 400, message: "E-mail e password são obrigatórios!" },
  LOGIN_USER_NOT_REGISTERED:           { status: 404, message: "Utilizador não encontrado. Registe-se primeiro!" },
  LOGIN_INVALID_CREDENTIALS:           { status: 401, message: "E-mail ou password incorretos!" },
  AUTH_UNAUTHORIZED:                   { status: 404, message: "Utilizador não encontrado" },
  USER_DATA_INVALID:                   { status: 400, message: "Dados inválidos. Verifique os campos obrigatórios e tente novamente." },
  USER_NOT_FOUND:                      { status: 404, message: "O utilizador solicitado não foi encontrado." },
  USER_ALREADY_EXISTS:                 { status: 409, message: "Este e-mail já está registado no sistema." },
  USER_DELETE_BLOCKED:                 { status: 403, message: "Este utilizador está associado a um projeto ativo e não pode ser removido." },

  // Plans
  PLAN_NOT_FOUND:                      { status: 404, message: "O plano de atividades solicitado não foi encontrado." },
  PLAN_CREATION_BAD_REQUEST:           { status: 400, message: "Nome, descrição, datas, estado, nivel e recursos são obrigatórios!" },
  PLAN_CREATION_INVALID_DATE:          { status: 409, message: "A data de início deve ser anterior à data de término." },
  PLAN_CREATION_DUPLICATE:             { status: 409, message: "Já existe um plano de atividades com esse nome." },
  PLAN_DELETE_BLOCKED:                 { status: 409, message: "Este plano está vinculado a atividades em andamento e não pode ser removido." },
  PLAN_CANNOT_DELETE:              { status: 400, message: "Este plano não pode ser removido, pois esta em andamento." },
  PLAN_FINALIZE_BLOCKED:               { status: 409, message: "A data de fim do plano é superior à data atual." },

  // Activities
  ACTIVITY_NOT_FOUND:                  { status: 404, message: "A atividade solicitada não foi encontrada." },
  ACTIVITY_REGISTRATION_UNAUTHORIZED:  { status: 403, message: "Apenas membros do Conselho Eco-Escolas ou Secretariado podem registrar atividades." },
  ACTIVITY_REGISTRATION_BAD_REQUEST:   { status: 400, message: "Nome, descrição, local, estado e plano associado são obrigatórios!" },
  ACTIVITY_PARTICIPANT_BAD_REQUEST:   { status: 400, message: "Nome e email são obrigatórios!" },
  ACTIVITY_PARTICIPANT_DUPLICATE:     { status: 409, message: "Este email já se encontra a ser utilizado por outro participante" },
  ACTIVITY_REGISTRATION_INVALID_DATE:  { status: 400, message: "A data da atividade deve ser futura." },
  PLAN_ACTIVITY_NOT_FOUND:             { status: 404, message: "Plano de atividade solicitado não foi encontrado." },
  ACTIVITY_REGISTRATION_DUPLICATE:     { status: 409, message: "Já existe uma atividade com esse nome e local para essa data." },
  PLAN_CREATION_UNAUTHORIZED:          { status: 403, message: "Não tem permissões para realizar esta ação" },
  ACTIVITY_CANNOT_DELETE:              { status: 400, message: "Atividade não pode ser removida, pois esta em andamento." },
  ACTIVITY_FINALIZE_BLOCKED:           { status: 409, message: "A data da atividade é superior à data atual." },
};

function handleError(res, errorCode) {
  const err = errorMap[errorCode];
  if (err) {
    return res.status(err.status).json({ errorCode, message: err.message });
  }
  return res.status(500).json({ errorCode: "INTERNAL_SERVER_ERROR", message: "Erro interno no servidor." });
}

module.exports = { handleError };
