const utils = require("../utils");

module.exports = (req, res, next) => {
  // protect routes from unauthorized access (guard clause)
  if (!req.session.isLoggedIn) {
    // status '401' would be used in REST API
    // here it's overwritten with '300' - redirect command
    utils.warn("Unauthorized access! Route is protected.");
    return res.redirect("/login");
  }
  next();
};
