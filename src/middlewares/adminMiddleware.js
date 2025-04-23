// src/middlewares/adminMiddleware.js

/**
 * Middleware para proteger rutas que requieren permisos de administrador
 */
const isAdmin = (req, res, next) => {
    // Verificar si el usuario está autenticado
    if (!req.session.isAuthenticated || !req.session.user) {
      req.flash('error_msg', 'Debes iniciar sesión para acceder a esta página');
      return res.redirect('/login');
    }
    
    // Verificar si el usuario es administrador
    if (!req.session.user.isAdmin) {
      req.flash('error_msg', 'No tienes permisos para acceder a esta sección');
      return res.redirect('/');
    }
    
    return next();
  };
  
  module.exports = {
    isAdmin
  };