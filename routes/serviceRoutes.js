const express = require('express');
const router = express.Router();

const controller = require('../controllers/serviceController');
const upload = require('../utils/multer');
const cloudinary = require('../utils/cloudinary');
const streamifier = require('streamifier');

// Rutas CRUD básicas
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

// Ruta para subir una imagen a Cloudinary
router.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ninguna imagen.' });
    }

    const streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) resolve(result);
          else reject(error);
        });
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    const result = await streamUpload(req);
    res.status(200).json({ url: result.secure_url });
  } catch (error) {
    console.error('[BACKEND] Error al subir imagen:', error);
    res.status(500).json({ error: 'Error al subir la imagen' });
  }
});

module.exports = router;
