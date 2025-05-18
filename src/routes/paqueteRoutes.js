// src/routes/paqueteRoutes.js (corregido)

const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const paqueteController = require('../controllers/paqueteController');
const notificacionController = require('../controllers/notificacionController');
const { isAuthenticated, isEmpresaOrAdmin } = require('../middlewares/authMiddleware');

// Validaciones para paquetes
const paqueteValidations = [
  check('remitente')
    .notEmpty().withMessage('El remitente es obligatorio')
    .isLength({ min: 2 }).withMessage('El remitente debe tener al menos 2 caracteres'),
  check('id_usuario')
    .notEmpty().withMessage('Debe seleccionar un usuario destinatario')
    .isInt().withMessage('ID de usuario inválido'),
  check('id_casillero')
    .notEmpty().withMessage('Debe seleccionar un casillero')
    .isInt().withMessage('ID de casillero inválido'),
  check('tamano')
    .notEmpty().withMessage('El tamaño es obligatorio')
];

// Rutas principales de paquetes - Todas accesibles para empresas y admins
router.get('/paquetes', isEmpresaOrAdmin, paqueteController.index);
router.get('/paquetes/create', isEmpresaOrAdmin, paqueteController.showCreateForm);
router.post('/paquetes/create', isEmpresaOrAdmin, paqueteValidations, paqueteController.create);
router.get('/paquetes/qr/:id', isEmpresaOrAdmin, paqueteController.showQR);
router.post('/paquetes/estado/:id', isEmpresaOrAdmin, paqueteController.updateEstado);
router.get('/paquetes/delete/:id', isEmpresaOrAdmin, paqueteController.delete);
router.post('/paquetes/verificar', isEmpresaOrAdmin, paqueteController.verificar);

// API de notificaciones (para usar desde la app móvil)
router.get('/api/notificaciones/:usuarioId', isAuthenticated, notificacionController.getNotificaciones);
router.get('/api/notificaciones/:usuarioId/noleidas', isAuthenticated, notificacionController.getNoLeidas);
router.put('/api/notificaciones/:id/leer', isAuthenticated, notificacionController.marcarLeida);
router.put('/api/notificaciones/:usuarioId/leertodas', isAuthenticated, notificacionController.marcarTodasLeidas);

module.exports = router;