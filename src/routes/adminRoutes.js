// src/routes/adminRoutes.js

const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const adminController = require('../controllers/adminController');
const { isAdmin } = require('../middlewares/adminMiddleware');

// Validaciones para empresas
const empresaValidations = [
  check('nombre')
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),
  check('correo')
    .notEmpty().withMessage('El correo es obligatorio')
    .isEmail().withMessage('Ingrese un correo electrónico válido')
];

// Middleware para proteger todas las rutas de administrador
router.use(isAdmin);

// Rutas del panel de administración
router.get('/dashboard', adminController.dashboard);

// CRUD Empresas
router.get('/empresas', adminController.empresas);
router.get('/empresas/create', adminController.showCreateEmpresa);
router.post('/empresas/create', empresaValidations, adminController.createEmpresa);
router.get('/empresas/edit/:id', adminController.showEditEmpresa);
router.post('/empresas/update/:id', empresaValidations, adminController.updateEmpresa);
router.get('/empresas/delete/:id', adminController.deleteEmpresa);

module.exports = router;