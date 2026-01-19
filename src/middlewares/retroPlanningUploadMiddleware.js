const multer = require('multer');
const crypto = require('crypto');
const supabase = require('../config/supabaseServer');

// Nom du bucket Supabase Storage
const BUCKET_NAME = 'livrables';

// Configuration du stockage en mémoire (buffer)
// Les fichiers seront ensuite uploadés vers Supabase Storage
const storage = multer.memoryStorage();

// Pas de filtre - tous les types de fichiers sont acceptés
const fileFilter = (req, file, cb) => {
  cb(null, true);
};

// Créer l'instance multer
const retroPlanningUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // Limite de 100MB par fichier
  }
});

/**
 * Génère un nom de fichier unique et sécurisé
 */
const generateUniqueFilename = (originalName) => {
  const uniqueId = crypto.randomBytes(8).toString('hex');
  const ext = originalName.substring(originalName.lastIndexOf('.')) || '';
  // Nettoyer le nom de fichier (enlever les caractères spéciaux)
  const safeName = originalName
    .replace(ext, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .substring(0, 50);

  return `${Date.now()}_${uniqueId}_${safeName}${ext}`;
};

/**
 * Upload un fichier vers Supabase Storage
 * @param {Buffer} fileBuffer - Le buffer du fichier
 * @param {string} originalName - Nom original du fichier
 * @param {string} mimeType - Type MIME du fichier
 * @param {number} jalonId - ID du jalon pour organiser les fichiers
 * @returns {Object} - Informations sur le fichier uploadé
 */
const uploadToSupabase = async (fileBuffer, originalName, mimeType, jalonId) => {
  const filename = generateUniqueFilename(originalName);
  const filePath = `jalon_${jalonId}/${filename}`;

  // Upload vers Supabase Storage
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, fileBuffer, {
      contentType: mimeType,
      upsert: false
    });

  if (error) {
    console.error('Erreur upload Supabase:', error);
    throw new Error(`Erreur lors de l'upload du fichier: ${error.message}`);
  }

  return {
    path: filePath,
    fullPath: data.path
  };
};

/**
 * Récupère l'URL publique ou signée d'un fichier
 * @param {string} filePath - Chemin du fichier dans le bucket
 * @returns {string} - URL du fichier
 */
const getFileUrl = async (filePath) => {
  // Créer une URL signée valide 1 heure
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(filePath, 3600);

  if (error) {
    console.error('Erreur création URL signée:', error);
    throw new Error(`Erreur lors de la récupération du fichier: ${error.message}`);
  }

  return data.signedUrl;
};

/**
 * Télécharge un fichier depuis Supabase Storage
 * @param {string} filePath - Chemin du fichier dans le bucket
 * @returns {Buffer} - Buffer du fichier
 */
const downloadFromSupabase = async (filePath) => {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .download(filePath);

  if (error) {
    console.error('Erreur download Supabase:', error);
    throw new Error(`Erreur lors du téléchargement du fichier: ${error.message}`);
  }

  // Convertir Blob en Buffer
  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

/**
 * Supprime un fichier de Supabase Storage
 * @param {string} filePath - Chemin du fichier dans le bucket
 */
const deleteFromSupabase = async (filePath) => {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath]);

  if (error) {
    console.error('Erreur suppression Supabase:', error);
    throw new Error(`Erreur lors de la suppression du fichier: ${error.message}`);
  }
};

/**
 * Initialise le bucket Supabase si nécessaire
 * Cette fonction doit être appelée au démarrage du serveur
 */
const initBucket = async () => {
  try {
    // Vérifier si le bucket existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('Erreur listage buckets:', listError);
      return;
    }

    const bucketExists = buckets.some(b => b.name === BUCKET_NAME);

    if (!bucketExists) {
      // Créer le bucket
      const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: false, // Fichiers privés (accès via URL signée)
        fileSizeLimit: 100 * 1024 * 1024 // 100MB
      });

      if (createError) {
        console.error('Erreur création bucket:', createError);
      } else {
        console.log(`✅ Bucket "${BUCKET_NAME}" créé avec succès`);
      }
    } else {
      console.log(`✅ Bucket "${BUCKET_NAME}" déjà existant`);
    }
  } catch (error) {
    console.error('Erreur initialisation bucket:', error);
  }
};

module.exports = {
  retroPlanningUpload,
  uploadToSupabase,
  getFileUrl,
  downloadFromSupabase,
  deleteFromSupabase,
  initBucket,
  BUCKET_NAME
};
