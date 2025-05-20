// controladores de empresa registro 

const { validationResult } = require('express-validator');
const empresaModel = require('../models/empresaModel');
const bcrypt = require('bcryptjs');

const authController = {
  // Mostrar formulario de registro
  showRegister: (req, res) => {
    res.render('auth/register');
  },

  // Mostrar formulario de login
  showLogin: (req, res) => {
    res.render('auth/login');
  },

  // Procesar registro
  register: async (req, res) => {
    try {
      // Validar errores del formulario
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).render('auth/register', {
          errors: errors.array(),
          oldData: req.body
        });
      }

      // Verificar si el correo ya está registrado
      const existingEmpresa = await empresaModel.findByEmail(req.body.correo);
      if (existingEmpresa) {
        req.flash('error_msg', 'Este correo electrónico ya está registrado');
        return res.render('auth/register', {
          oldData: req.body
        });
      }

      // Crear nueva empresa
      await empresaModel.create({
        nombre: req.body.nombre,
        correo: req.body.correo,
        contrasena: req.body.contrasena
      });

      req.flash('success_msg', 'Registro exitoso, ahora puedes iniciar sesión');
      res.redirect('/login');
    } catch (error) {
      console.error('Error en el registro:', error);
      req.flash('error_msg', 'Ocurrió un error durante el registro');
      res.render('auth/register', {
        oldData: req.body
      });
    }
  },

  // Procesar login
  login: async (req, res) => {
    try {
      // Validar errores del formulario
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).render('auth/login', {
          errors: errors.array(),
          oldData: req.body
        });
      }

      // Comprobar si es el administrador
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@sistema.com';
      const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
      
      if (req.body.correo === adminEmail && req.body.contrasena === adminPassword) {
        // Crear sesión de administrador
        req.session.isAuthenticated = true;
        req.session.user = {
          id: 0, // ID especial para admin
          nombre: 'Administrador',
          correo: adminEmail,
          isAdmin: true,
          isEmpresa: false
        };
        
        req.flash('success_msg', '¡Bienvenido, Administrador!');
        return res.redirect('/admin/dashboard');
      }

      // Si no es admin, buscar empresa por correo
      const empresa = await empresaModel.findByEmail(req.body.correo);
      if (!empresa) {
        req.flash('error_msg', 'Correo electrónico o contraseña incorrectos');
        return res.render('auth/login', {
          oldData: {
            correo: req.body.correo
          }
        });
      }

      // Verificar contraseña
      const isMatch = await bcrypt.compare(req.body.contrasena, empresa.contrasena);
      if (!isMatch) {
        req.flash('error_msg', 'Correo electrónico o contraseña incorrectos');
        return res.render('auth/login', {
          oldData: {
            correo: req.body.correo
          }
        });
      }

      // Crear sesión para empresa
      req.session.isAuthenticated = true;
      req.session.user = {
        id: empresa.id,
        nombre: empresa.nombre,
        correo: empresa.correo,
        isAdmin: false,
        isEmpresa: true  // Marcamos explícitamente como empresa
      };

      req.flash('success_msg', '¡Bienvenido!');
      res.redirect('/dashboard'); // Redirigir al dashboard o página principal
    } catch (error) {
      console.error('Error en el login:', error);
      req.flash('error_msg', 'Ocurrió un error durante el inicio de sesión');
      res.render('auth/login', {
        oldData: {
          correo: req.body.correo
        }
      });
    }
  },

  // Cerrar sesión
  logout: (req, res) => {
    req.session.destroy(() => {
      res.redirect('/login');
    });
  }
};

module.exports = authController;