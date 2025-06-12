// upload.js (novo módulo de configuração)
const cloudinary = require('cloudinary').v2;
const multer  = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// configura o Cloudinary
cloudinary.config({
  cloud_name:   process.env.C_CLOUD_NAME,
  api_key:      process.env.C_API_KEY,
  api_secret:   process.env.C_API_SECRET,
});

// configura o storage do multer para enviar direto ao Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'plans',                // pasta no painel Cloudinary
    allowed_formats: ['jpg', 'png'],// formatos permitidos
    transformation: [{ width: 1200, crop: 'limit' }],
  },
});

const upload = multer({ storage });

module.exports = { upload, cloudinary };
