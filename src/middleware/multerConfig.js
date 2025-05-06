// src/middleware/multerConfig.js
const multer = require("multer");
const path = require("path");

// Storage config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "src/productUploads"); // updated
    },
    filename: function (req, file, cb) {
      const uniqueName = Date.now() + "-" + file.originalname;
      cb(null, uniqueName);
    },
  });
  

const upload = multer({ storage });

module.exports = upload;
