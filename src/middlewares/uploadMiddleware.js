const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Créer le dossier uploads s'il n'existe pas
const uploadsDir = path.join(__dirname, '../../uploads/memoires');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuration du stockage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const matricule = req.user.matricule;
    const typeDoc = file.fieldname === 'pdf' ? 'PDF' : 'PPT';

    // Format: MATRICULE_TYPE_TIMESTAMP.ext
    cb(null, `${matricule}_${typeDoc}_${uniqueSuffix}${ext}`);
  }
});

// Filtrer les types de fichiers
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    pdf: /pdf/,
    powerpoint: /ppt|pptx|odp/
  };

  const ext = path.extname(file.originalname).toLowerCase();

  if (file.fieldname === 'pdf') {
    if (allowedTypes.pdf.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers PDF sont acceptés pour le mémoire'));
    }
  } else if (file.fieldname === 'powerpoint') {
    if (allowedTypes.powerpoint.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers PowerPoint (.ppt, .pptx, .odp) sont acceptés'));
    }
  } else {
    cb(new Error('Type de fichier non reconnu'));
  }
};

// Créer l'instance multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // Limite de 50MB
  }
});

module.exports = {
  upload,
  uploadsDir
};
