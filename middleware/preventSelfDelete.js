module.exports = function (rolesToProtect = []) {
  return (req, res, next) => {
    const targetId = req.params.id;
    const userId = req.user.id;
    const role = req.user.role;

    if (rolesToProtect.includes(role) && String(userId) === String(targetId)) {
      return res.status(403).json({ message: `${role} cannot delete own account.` });
    }
    next();
  };
};
