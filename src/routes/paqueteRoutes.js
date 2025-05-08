// src/routes/paqueteRoutes.js

const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const paqueteController = require('../controllers/paqueteController');
const notificacionController = require('../controllers/notificacionController');
const { isAdmin } = require('../middlewares/adminMiddleware');
const { isAuthenticated } = require('../middlewares/authMiddleware');

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

// Rutas para la gestión de paquetes (requieren autenticación)
router.use(isAuthenticated);

// Rutas principales de paquetes
router.get('/paquetes', paqueteController.index);
router.get('/paquetes/create', paqueteController.showCreateForm);
router.post('/paquetes/create', paqueteValidations, paqueteController.create);
router.get('/paquetes/qr/:id', paqueteController.showQR);
router.post('/paquetes/estado/:id', paqueteController.updateEstado);
router.get('/paquetes/delete/:id', paqueteController.delete);
router.post('/paquetes/verificar', paqueteController.verificar);

// API de notificaciones (para usar desde la app móvil)
router.get('/api/notificaciones/:usuarioId', notificacionController.getNotificaciones);
router.get('/api/notificaciones/:usuarioId/noleidas', notificacionController.getNoLeidas);
router.put('/api/notificaciones/:id/leer', notificacionController.marcarLeida);
router.put('/api/notificaciones/:usuarioId/leertodas', notificacionController.marcarTodasLeidas);

module.exports = router;