

const multer = require('multer');
const path = require('path');

//Multer Config

module.exports = multer({
    limits: { fileSize: 1024 * 1024 },
    storage: multer.diskStorage({}),
    filename: function (req, file, cb) {
        cb(null, `${path.extname(file.originalname)}-${Date.now()}`)
    }
});








// // const { GridFsStorage } = require("multer-gridfs-storage");
// // const crypto = require("crypto");
// const multer = require("multer");
// // const { DB_USER, DB_PASS, DB_NAME } = require("../../config");
// const path = require("path");

// // const storage = new GridFsStorage({
// //   url: `mongodb+srv://${DB_USER}:${DB_PASS}@cluster0.eoppj.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`,
// //   file: (req, file) => {
// //     return new Promise((resolve, reject) => {
// //       crypto.randomBytes(16, (err, buf) => {
// //         if (err) {
// //           return reject(err);
// //         }
// //         const filename = buf.toString("hex") + path.extname(file.originalname);
// //         const fileInfo = {
// //           filename: filename,
// //           bucketName: "uploads",
// //         };
// //         resolve(fileInfo);
// //       });
// //     });
// //   },
// // });

// function checkFileType(file, cb) {
//   // https://youtu.be/9Qzmri1WaaE?t=1515
//   // define a regex that includes the file types we accept
//   const filetypes = /jpeg|jpg|png|gif|tiff|psd|raw|indd|ai|webp|avf/;
//   //check the file extention
//   const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//   // more importantly, check the mimetype
//   const mimetype = filetypes.test(file.mimetype);
//   // if both are good then continue
//   if (mimetype && extname) return cb(null, true);
//   // otherwise, return error message
//   cb(new Error("Image files only"));
// }

// const storageConfig = multer.diskStorage({
//   // destination: "../../tmp/",
//   destination: "tmp",
//   // destination:  path.join(__dirname, "tmp/"),
//   filename: function (req, file, cb) {
//     cb(null, `${new Date().getTime()}---${file.originalname}`);
//   },
// });

// // const upload = multer({
// //   storage,
// //   // limit the size to 20mb for any files coming in
// //   limits: { fileSize: 20000000 },
// //   // filer out invalid filetypes
// //   fileFilter: function (req, file, cb) {
// //     checkFileType(file, cb);
// //   },
// // });
// const upload = multer({
//   storage: storageConfig,
//   // limit the size to 20mb for any files coming in
//   limits: { fileSize: 20000000 },
//   // filer out invalid filetypes
//   fileFilter: function (req, file, cb) {
//     checkFileType(file, cb);
//   },
// });
// module.exports = { upload };

// // // GFS Storage
// // const { GridFsStorage } = require("multer-gridfs-storage");
// // const crypto = require("crypto");
// // const multer = require("multer");
// // const { DB_USER, DB_PASS, DB_NAME } = require("../../config");
// // const path = require("path");

// // const storage = new GridFsStorage({
// //   url: `mongodb+srv://${DB_USER}:${DB_PASS}@cluster0.eoppj.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`,
// //   file: (req, file) => {
// //     return new Promise((resolve, reject) => {
// //       crypto.randomBytes(16, (err, buf) => {
// //         if (err) {
// //           return reject(err);
// //         }
// //         const filename = buf.toString("hex") + path.extname(file.originalname);
// //         const fileInfo = {
// //           filename: filename,
// //           bucketName: "uploads",
// //         };
// //         resolve(fileInfo);
// //       });
// //     });
// //   },
// // });

// // function checkFileType(file, cb) {
// //   // https://youtu.be/9Qzmri1WaaE?t=1515
// //   // define a regex that includes the file types we accept
// //   const filetypes = /jpeg|jpg|png|gif|tiff|psd|raw|indd|ai|webp|avf/;
// //   //check the file extention
// //   const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
// //   // more importantly, check the mimetype
// //   const mimetype = filetypes.test(file.mimetype);
// //   // if both are good then continue
// //   if (mimetype && extname) return cb(null, true);
// //   // otherwise, return error message
// //   cb(new Error("Image files only"));
// // }

// // const storageConfig = multer.diskStorage({
// //   destination: "./uploads/",
// //   filename: function (req, file, cb) {
// //     cb(null, `${new Date().getTime()}---${file.originalname}`);
// //   },
// // });

// // const upload = multer({
// //   storage,
// //   // limit the size to 20mb for any files coming in
// //   limits: { fileSize: 20000000 },
// //   // filer out invalid filetypes
// //   fileFilter: function (req, file, cb) {
// //     checkFileType(file, cb);
// //   },
// // });
// // const pinataUpload = multer({
// //   storage: storageConfig,
// //   // limit the size to 20mb for any files coming in
// //   limits: { fileSize: 20000000 },
// //   // filer out invalid filetypes
// //   fileFilter: function (req, file, cb) {
// //     checkFileType(file, cb);
// //   },
// // });
// // module.exports = { upload, pinataUpload };
