// 404 and other errors etc...
// ===============================
// logic linking model (data, core logic) and views

const utils = require("../utils");

// 404
module.exports.get404 = (req, res, next) => {
  utils.warn("404");

  res.status(404).render("404", {
    pageTitle: "Page Not Found",
  });
};
