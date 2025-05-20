// Revisión del middleware isEmpresa para asegurar que está bien definido

// src/middlewares/authMiddleware.js

/**
 * Middleware para proteger rutas que requieren autenticación
 */
const isAuthenticated = function(req, res, next) {
  if (req.session.isAuthenticated && req.session.user) {
    return next();
  }
  
  req.flash('error_msg', 'Debes iniciar sesión para acceder a esta página');
  res.redirect('/login');
};

/**
 * Middleware para redirigir usuarios autenticados
 * desde páginas de login/registro
 */
const isNotAuthenticated = function(req, res, next) {
  if (!req.session.isAuthenticated) {
    return next();
  }
  
  res.redirect('/dashboard');
};

/**
 * Middleware para proteger rutas que requieren permisos de administrador
 */
const isAdmin = function(req, res, next) {
  // Verificar si el usuario está autenticado
  if (!req.session.isAuthenticated || !req.session.user) {
    req.flash('error_msg', 'Debes iniciar sesión para acceder a esta página');
    return res.redirect('/login');
  }
  
  // Verificar si el usuario es administrador
  if (!req.session.user.isAdmin) {
    req.flash('error_msg', 'No tienes permisos de administrador para acceder a esta sección');
    return res.redirect('/dashboard');
  }
  
  return next();
};

/**
 * Middleware para proteger rutas que requieren permisos de empresa
 */
const isEmpresa = function(req, res, next) {
  // Verificar si el usuario está autenticado
  if (!req.session.isAuthenticated || !req.session.user) {
    req.flash('error_msg', 'Debes iniciar sesión para acceder a esta página');
    return res.redirect('/login');
  }
  
  // Verificar si el usuario es una empresa
  if (!req.session.user.isEmpresa) {
    req.flash('error_msg', 'No tienes permisos de empresa para acceder a esta sección');
    return res.redirect('/dashboard');
  }
  
  return next();
};

/**
 * Middleware para proteger rutas que requieren permisos de empresa o admin
 */
const isEmpresaOrAdmin = function(req, res, next) {
  // Verificar si el usuario está autenticado
  if (!req.session.isAuthenticated || !req.session.user) {
    req.flash('error_msg', 'Debes iniciar sesión para acceder a esta página');
    return res.redirect('/login');
  }
  
  // Permitir acceso si es empresa o admin
  if (req.session.user.isAdmin || req.session.user.isEmpresa) {
    return next();
  }
  
  req.flash('error_msg', 'No tienes permisos para acceder a esta sección');
  return res.redirect('/dashboard');
};

module.exports = {
  isAuthenticated,
  isNotAuthenticated,
  isAdmin,
  isEmpresa,
  isEmpresaOrAdmin
};