// 404 and other errors etc...
// ===============================
// CONTROLLER
// logic linking model (data, core logic) and views

const utils = require("../utils");

// 404
module.exports.get404 = (req, res, next) => {
  utils.warn("404");

  res.status(404).render("404", {
    pageTitle: "Page Not Found",
  });
};

// 500
module.exports.get500 = (req, res, next) => {
  // utils.warn("500");

  res.status(500).render("500", {
    pageTitle: "Error",
  });
};

// test trigger error
module.exports.triggerError = (req, res, next) => {
  // ERROR test

  const error = new Error("Error handling test");
  error.httpStatusCode = 500; // extra
  // next() called with argument is error handler itself (see 'app.js')
  return next(error);

  // throw error;
  // this would also work ONLY because it's sync. code
  // async. code (eg. in promise) needs to be handled with 'next'
};
