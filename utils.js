// impot 'nodemailer'
const nodemailer = require("nodemailer");
const authData = require("./authData");

const logger = function (msg, header, color = 0) {
  // helper fun.
  const colorCoder = function (colorNr) {
    const style = {
      col: ["\x1b[31m", "\x1b[36m", "\x1b[33m"],
      reset: "\x1b[0m",
      bold: "\x1b[1m",
      rev: "\x1b[7m",
    };

    const evColor = style.col[colorNr];
    return `${evColor}${style.bold}${style.rev}%s${style.reset}`;
  };

  // new event
  const stack = new Error().stack;

  try {
    // console.log(stack.split("\n"));
    const stackArr = stack.split("\n")[3];

    console.log(
      colorCoder(color),
      ` *** ${header} *** `,
      msg,
      `\n${stackArr.trim()}\n`
    );
  } catch (err) {
    console.log(colorCoder(err), " LOGGER FAIL ", `\n${err}`);
  }
};

// exporting module
module.exports = {
  rootDir: __dirname,

  log(msg) {
    logger(msg, "LOG", 1);
  },
  err(msg) {
    logger(msg, "ERROR", 0);
  },
  warn(msg) {
    logger(msg, "WARN", 2);
  },
  // based on 'nodemailer'
  emailSender(senderEmail, subject, content) {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: senderEmail,
        pass: authData.gmailPass, // "app pass"
      },
    });

    // create options
    const mailOptions = {
      from: senderEmail,
      to: senderEmail,
      subject: subject,
      html: content,
    };

    // send email
    transporter.sendMail(mailOptions, function (error, info) {
      // escape clause
      if (error) return console.log(error);

      console.log("Email sent: " + info.response);
    });
  },
};
