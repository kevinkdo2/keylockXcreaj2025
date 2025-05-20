// src/routes/paqueteRoutes.js (completamente corregido)

const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const paqueteController = require('../controllers/paqueteController');
const notificacionController = require('../controllers/notificacionController');
const { isAuthenticated, isEmpresa } = require('../middlewares/authMiddleware');

// Añadir depuración para identificar el problema
console.log('Cargando rutas de paquetes...');
console.log('Tipo de paqueteController:', typeof paqueteController);
if (paqueteController) {
  console.log('Métodos disponibles:', Object.keys(paqueteController));
  console.log('Tipo de showCreateForm:', typeof paqueteController.showCreateForm);
  console.log('Tipo de create:', typeof paqueteController.create);
}

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

// Función para manejar errores de rutas
function ensureFunction(handler, defaultHandler) {
  if (typeof handler === 'function') {
    return handler;
  } else {
    console.error(`Error: handler no es una función, es un ${typeof handler}`);
    // Devolver un handler por defecto si el original no es una función
    return defaultHandler || function(req, res) {
      res.status(500).send('Método no implementado');
    };
  }
}

// Rutas de paquetes para empresas (asegurando que todos los handlers sean funciones)
router.get('/empresa/paquetes', 
  isEmpresa, 
  ensureFunction(paqueteController.index)
);

router.get('/empresa/paquetes/create', 
  isEmpresa, 
  ensureFunction(paqueteController.showCreateForm)
);

router.post('/empresa/paquetes/create', 
  isEmpresa, 
  paqueteValidations, 
  ensureFunction(paqueteController.create)
);

router.get('/empresa/paquetes/qr/:id', 
  isEmpresa, 
  ensureFunction(paqueteController.showQR)
);

router.post('/empresa/paquetes/estado/:id', 
  isEmpresa, 
  ensureFunction(paqueteController.updateEstado)
);

router.get('/empresa/paquetes/delete/:id', 
  isEmpresa, 
  ensureFunction(paqueteController.delete)
);

router.post('/empresa/paquetes/verificar', 
  isEmpresa, 
  ensureFunction(paqueteController.verificar)
);

// API de notificaciones (para usar desde la app móvil)
router.get('/api/notificaciones/:usuarioId', 
  isAuthenticated, 
  ensureFunction(notificacionController.getNotificaciones)
);

router.get('/api/notificaciones/:usuarioId/noleidas', 
  isAuthenticated, 
  ensureFunction(notificacionController.getNoLeidas)
);

router.put('/api/notificaciones/:id/leer', 
  isAuthenticated, 
  ensureFunction(notificacionController.marcarLeida)
);

router.put('/api/notificaciones/:usuarioId/leertodas', 
  isAuthenticated, 
  ensureFunction(notificacionController.marcarTodasLeidas)
);

module.exports = router;