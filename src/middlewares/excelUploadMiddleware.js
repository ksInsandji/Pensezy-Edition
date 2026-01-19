const multer = require('multer');

// Configuration multer pour upload Excel en mémoire
const storage = multer.memoryStorage();

// Filtre pour accepter uniquement les fichiers Excel
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel' // .xls
  ];

  const allowedExtensions = ['.xlsx', '.xls'];
  const fileExtension = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));

  if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Format de fichier invalide. Seuls les fichiers Excel (.xlsx, .xls) sont acceptés.'), false);
  }
};

// Configuration de multer
const excelUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB maximum
  }
});

module.exports = { excelUpload };
