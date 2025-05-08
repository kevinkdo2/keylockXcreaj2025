// src/controllers/notificacionController.js

const notificacionModel = require('../models/notificacionModel');

const notificacionController = {
  // Obtener notificaciones para API
  getNotificaciones: async (req, res) => {
    try {
      const usuarioId = req.params.usuarioId;
      
      // Verificar si es el mismo usuario de la sesión o es administrador
      if (req.session.user.id !== parseInt(usuarioId) && !req.session.user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'No tiene permiso para acceder a estas notificaciones'
        });
      }
      
      const notificaciones = await notificacionModel.getByUsuarioId(usuarioId);
      
      res.json({
        success: true,
        data: notificaciones
      });
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener notificaciones'
      });
    }
  },

  // Obtener solo notificaciones no leídas para API
  getNoLeidas: async (req, res) => {
    try {
      const usuarioId = req.params.usuarioId;
      
      // Verificar si es el mismo usuario de la sesión o es administrador
      if (req.session.user.id !== parseInt(usuarioId) && !req.session.user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'No tiene permiso para acceder a estas notificaciones'
        });
      }
      
      const notificaciones = await notificacionModel.getNoLeidasByUsuarioId(usuarioId);
      
      res.json({
        success: true,
        data: notificaciones,
        count: notificaciones.length
      });
    } catch (error) {
      console.error('Error al obtener notificaciones no leídas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener notificaciones no leídas'
      });
    }
  },

  // Marcar notificación como leída para API
  marcarLeida: async (req, res) => {
    try {
      const id = req.params.id;
      const usuarioId = req.body.usuarioId;
      
      // Verificar autorización
      if (req.session.user.id !== parseInt(usuarioId) && !req.session.user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'No tiene permiso para modificar esta notificación'
        });
      }
      
      const resultado = await notificacionModel.marcarComoLeida(id);
      
      if (resultado) {
        res.json({
          success: true,
          message: 'Notificación marcada como leída'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Notificación no encontrada'
        });
      }
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
      res.status(500).json({
        success: false,
        message: 'Error al marcar la notificación como leída'
      });
    }
  },

  // Marcar todas las notificaciones como leídas para API
  marcarTodasLeidas: async (req, res) => {
    try {
      const usuarioId = req.params.usuarioId;
      
      // Verificar autorización
      if (req.session.user.id !== parseInt(usuarioId) && !req.session.user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'No tiene permiso para modificar estas notificaciones'
        });
      }
      
      const cantidad = await notificacionModel.marcarTodasComoLeidas(usuarioId);
      
      res.json({
        success: true,
        message: `${cantidad} notificaciones marcadas como leídas`,
        count: cantidad
      });
    } catch (error) {
      console.error('Error al marcar todas las notificaciones como leídas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al marcar las notificaciones como leídas'
      });
    }
  }
};

module.exports = notificacionController;