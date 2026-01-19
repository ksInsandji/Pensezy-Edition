const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/roleMiddleware');
const validate = require('../middlewares/validationMiddleware');
const { createDepartementSchema, updateDepartementSchema } = require('../validators/departementValidator');
const { createChefSchema } = require('../validators/chefValidator');

// Toutes les routes nécessitent authentification + rôle admin
router.use(authMiddleware);
router.use(checkRole('admin'));

// ==================== DASHBOARD & STATISTIQUES ====================
router.get('/dashboard', adminController.getDashboard);
router.get('/stats/comparatives', adminController.getStatsComparatives);
router.get('/alertes', adminController.getAlertes);

// ==================== GESTION DES DÉPARTEMENTS ====================
router.get('/departements', adminController.getDepartements);
router.post('/departements', validate(createDepartementSchema), adminController.createDepartement);
router.get('/departements/:id', adminController.getDepartementDetails);
router.put('/departements/:id', validate(updateDepartementSchema), adminController.updateDepartement);
router.delete('/departements/:id', adminController.deleteDepartement);

// ==================== GESTION DES CHEFS ====================
router.post('/chefs', validate(createChefSchema), adminController.createChef);
router.put('/departements/:departementId/chef', adminController.replacerChef);
router.delete('/departements/:departementId/chef', adminController.retirerChef);

// ==================== GESTION DES ENSEIGNANTS ====================
router.get('/enseignants', adminController.getAllEnseignants);
router.patch('/enseignants/:matricule/toggle-activation', adminController.toggleEnseignantActivation);

module.exports = router;