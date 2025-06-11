module.exports = (resource, action) => {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        errorCode: "AUTH_UNAUTHORIZED",
        message: "Token inválido ou não fornecido.",
      });
    }


    // USERS PERMISSIONS
    if (resource === "users") {
      if (user.type === "Admin" || user.type === "Coordenador") return next();

      if (action === "readById") {
        const requestedId = req.params.id;
        if (user.userId === requestedId) return next();
      }
    }

    // PLANS PERMISSIONS
    if (resource === "plans") {
      if (user.type === "Admin" || user.type === "Coordenador") {
        return next();
      }
    }

    if (resource === "plans" && action === "read") {
      return next(); // Permitir leitura para todos
    }

    //ACTIVITIES PERMISSIONS
    if (resource === "activities") {
      if (user.type === "Admin" || user.type === "Secretariado" || user.type === "Conselho Eco-Escolas") {
        return next();
      }
    }

    return res.status(403).json({
      errorCode: "AUTH_FORBIDDEN",
      message: "Não tem permissões para realizar esta ação.",
    });
  };
};

