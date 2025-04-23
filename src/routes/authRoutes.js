const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const { isAuthenticated, isNotAuthenticated } = require('../middlewares/authMiddleware');

// Validaciones para el registro
const registerValidations = [
  check('nombre')
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),
  check('correo')
    .notEmpty().withMessage('El correo es obligatorio')
    .isEmail().withMessage('Ingrese un correo electrónico válido'),
  check('contrasena')
    .notEmpty().withMessage('La contraseña es obligatoria')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/\d/).withMessage('La contraseña debe incluir al menos un número')
    .matches(/[a-z]/).withMessage('La contraseña debe incluir al menos una letra minúscula'),
  check('confirmar_contrasena')
    .notEmpty().withMessage('Confirmar contraseña es obligatorio')
    .custom((value, { req }) => {
      if (value !== req.body.contrasena) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    })
];

// Validaciones para el login
const loginValidations = [
  check('correo')
    .notEmpty().withMessage('El correo es obligatorio')
    .isEmail().withMessage('Ingrese un correo electrónico válido'),
  check('contrasena')
    .notEmpty().withMessage('La contraseña es obligatoria')
];

// Rutas de autenticación
router.get('/register', authController.showRegister);
router.post('/register', isNotAuthenticated, registerValidations, authController.register);
router.get('/login', authController.showLogin);
router.post('/login', isNotAuthenticated, loginValidations, authController.login);
router.get('/logout', isAuthenticated, authController.logout);

// Ruta para el dashboard (protegida)
router.get('/dashboard', isAuthenticated, (req, res) => {
  res.render('dashboard', {
    user: req.session.user
  });
});

// Ruta para el dashboard (protegida)
router.get('/dashboard', isAuthenticated, (req, res) => {
    res.render('dashboard', {
      user: req.session.user
    });
  });
  
  // Ruta principal (página de inicio)
  router.get('/', (req, res) => {
    res.render('index');
  });
  
  module.exports = router;