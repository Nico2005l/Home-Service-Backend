// utils/multer.js
const multer = require('multer');

const storage = multer.memoryStorage(); 

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // máximo 5 MB
});

module.exports = upload;
