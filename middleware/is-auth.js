const utils = require("../utils");

module.exports = (req, res, next) => {
  // protect routes from unauthorized access (guard clause)
  if (!req.session.isLoggedIn) {
    utils.warn("Unauthorized access! Route is protected.");
    return res.redirect("/login");
  }
  next();
};
