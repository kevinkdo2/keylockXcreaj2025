/**
 * Middleware para proteger rutas que requieren autenticación
 */
const isAuthenticated = (req, res, next) => {
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
  const isNotAuthenticated = (req, res, next) => {
    if (!req.session.isAuthenticated) {
      return next();
    }
    
    res.redirect('/dashboard');
  };
  
  module.exports = {
    isAuthenticated,
    isNotAuthenticated
  };