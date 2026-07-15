const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const { buildResponse } = require('../../utils/helpers');

const uploadDir = path.join(__dirname, '..', '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Apenas imagens JPG, PNG, WebP e GIF são permitidas'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post('/', authenticate, (req, res) => {
  upload.array('images', 8)(req, res, (err) => {
    if (err) {
      return res.status(400).json(buildResponse(false, null, err.message));
    }

    const files = req.files.map(f => ({
      url: `/uploads/${f.filename}`,
      name: f.filename,
      size: f.size,
    }));

    res.json(buildResponse(true, { files }));
  });
});

module.exports = router;
