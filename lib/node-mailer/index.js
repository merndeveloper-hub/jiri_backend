import nodemailer from "nodemailer";
import handlebars from "handlebars";
import fs from "fs";
import { MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS } from "../../config/index.js";


const transporter = nodemailer.createTransport({
  host: MAIL_HOST,
  port: MAIL_PORT,
  secure: true,
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});


const readHTMLFile = function (path, callback) {
  fs.readFile(path, { encoding: "utf-8" }, function (err, html) {
    if (err) {
      console.log(err);
      callback(err);
    } else {
      callback(null, html);
    }
  });
};

const send_email = async  (template, replacements, from, subject, email) => {
   console.log("send_email");
  readHTMLFile(
    `./public/email-templates/${template}.html`,
    function (err, html) {
      var template = handlebars.compile(html);
      //   var replacements = {
      //     username: "ghous ahmed",
      //     locationDescription: "test",
      //   };
      var htmlToSend = template(replacements);

      const mailOptions = {
        from: `${from}`,
        to: email,
        subject: subject, //"Awaiting Admin Approval",
        html: htmlToSend,
        
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log("Error===>", error);
        }
        // console.log(`Email sent: ${info.response}`);
      });
    }
  );
};

export default send_email

