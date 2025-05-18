// src/routes/usuarioRoutes.js (corregido)

const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const usuarioController = require('../controllers/usuarioController');
const { isAuthenticated } = require('../middlewares/authMiddleware');

// Validaciones para usuarios
const usuarioValidations = [
  check('nombre')
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),
  check('correo')
    .notEmpty().withMessage('El correo es obligatorio')
    .isEmail().withMessage('Ingrese un correo electrónico válido'),
  check('contrasena')
    .optional({ checkFalsy: true }) // Solo validar si existe
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
];

// Middleware para proteger todas las rutas
router.use(isAuthenticated);

// Rutas CRUD para usuarios
router.get('/usuarios', usuarioController.index);
router.get('/usuarios/create', usuarioController.showCreateForm);
router.post('/usuarios/create', usuarioValidations, usuarioController.create);
router.get('/usuarios/edit/:id', usuarioController.showEditForm);
router.post('/usuarios/update/:id', usuarioValidations, usuarioController.update);
router.get('/usuarios/delete/:id', usuarioController.delete);

module.exports = router;