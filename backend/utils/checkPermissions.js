module.exports = (resource, action) => {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        errorCode: "AUTH_UNAUTHORIZED",
        message: "Token inválido ou não fornecido.",
      });
    }

    if (resource === "users") {
      if (action === "read" && user.type === "Admin") return next();
      if (action === "create" && user.type === "Admin") return next();
      if (action === "update" && user.type === "Admin") return next();
      if (action === "delete" && user.type === "Admin") return next();
      if (action === "readById") {
        const requestedId = req.params.id;
        if (user.type === "Admin" || user.userId === requestedId) return next();
      }
    }

    return res.status(403).json({
      errorCode: "AUTH_FORBIDDEN",
      message: "Não tem permissões para realizar esta ação.",
    });
  };
};

