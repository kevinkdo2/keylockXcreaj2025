// src/routes/empresaRoutes.js (nuevo archivo)

const express = require('express');
const router = express.Router();
const { isEmpresa } = require('../middlewares/authMiddleware');

// Ruta para el dashboard de empresa (protegida)
router.get('/empresa/dashboard', isEmpresa, (req, res) => {
  res.render('empresa/dashboard', {
    user: req.session.user
  });
});

module.exports = router;