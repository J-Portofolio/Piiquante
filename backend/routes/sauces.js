const express = require('express');
const router = express.Router();

// Charger les middleware en priorité sur le reste permet de sécuriser/
// assurer le bon traitement des requêtes
// effectuées par tout controlleur dont le chargement suivra.
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

const saucesCtrl = require('../controllers/sauces');

router.get('/', auth, saucesCtrl.getAllSauces);
router.get('/:id', auth, saucesCtrl.getOneSauce);

router.post('/', auth, multer, saucesCtrl.createSauce);
router.post('/:id/like', auth, saucesCtrl.updateLikesSauce);

router.put('/:id', auth, multer,saucesCtrl.updateSauce);

router.delete('/:id', auth, saucesCtrl.deleteSauce);

module.exports = router;