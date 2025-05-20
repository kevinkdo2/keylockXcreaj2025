// src/routes/usuarioRoutes.js (actualizado para empresas)

const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const usuarioController = require('../controllers/usuarioController');
const { isAuthenticated, isEmpresa } = require('../middlewares/authMiddleware');

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

// Rutas para empresas
router.get('/empresa/usuarios', isEmpresa, usuarioController.index);
router.get('/empresa/usuarios/create', isEmpresa, usuarioController.showCreateForm);
router.post('/empresa/usuarios/create', isEmpresa, usuarioValidations, usuarioController.create);
router.get('/empresa/usuarios/edit/:id', isEmpresa, usuarioController.showEditForm);
router.post('/empresa/usuarios/update/:id', isEmpresa, usuarioValidations, usuarioController.update);
router.get('/empresa/usuarios/delete/:id', isEmpresa, usuarioController.delete);

module.exports = router;