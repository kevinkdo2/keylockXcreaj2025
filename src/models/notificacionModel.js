// src/models/notificacionModel.js (adaptado a la nueva BD)

const db = require('../config/database');

const notificacionModel = {
  // Crear una nueva notificación
  async create(notificacion) {
    try {
      const sql = `
        INSERT INTO notificacion (
          id_usuario, 
          id_paquete, 
          titulo, 
          mensaje, 
          fecha, 
          leida
        ) VALUES (?, ?, ?, ?, NOW(), false)
      `;
      
      const result = await db.query(sql, [
        notificacion.id_usuario,
        notificacion.id_paquete,
        notificacion.titulo,
        notificacion.mensaje
      ]);
      
      return result.insertId;
    } catch (error) {
      console.error('Error al crear notificación:', error);
      throw error;
    }
  },

  // Obtener notificaciones por ID de usuario
  async getByUsuarioId(usuarioId, leidas = null) {
    try {
      let sql = `
        SELECT n.*, p.codigo_unico, p.estado AS estado_paquete
        FROM notificacion n
        JOIN paquete p ON n.id_paquete = p.id
        WHERE n.id_usuario = ?
      `;
      
      const params = [usuarioId];
      
      // Filtrar por leídas/no leídas si se especifica
      if (leidas !== null) {
        sql += ' AND n.leida = ?';
        params.push(leidas);
      }
      
      // Ordenar por fecha (más recientes primero)
      sql += ' ORDER BY n.fecha DESC';
      
      return await db.query(sql, params);
    } catch (error) {
      console.error('Error al obtener notificaciones por usuario:', error);
      throw error;
    }
  },

  // Obtener notificaciones no leídas por ID de usuario
  async getNoLeidasByUsuarioId(usuarioId) {
    return this.getByUsuarioId(usuarioId, false);
  },

  // Marcar notificación como leída
  async marcarComoLeida(id) {
    try {
      const sql = 'UPDATE notificacion SET leida = true WHERE id = ?';
      const result = await db.query(sql, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
      throw error;
    }
  },

  // Marcar todas las notificaciones del usuario como leídas
  async marcarTodasComoLeidas(usuarioId) {
    try {
      const sql = 'UPDATE notificacion SET leida = true WHERE id_usuario = ? AND leida = false';
      const result = await db.query(sql, [usuarioId]);
      return result.affectedRows;
    } catch (error) {
      console.error('Error al marcar todas las notificaciones como leídas:', error);
      throw error;
    }
  },

  // Eliminar notificaciones por ID de paquete
  async deleteByPaqueteId(paqueteId) {
    try {
      const sql = 'DELETE FROM notificacion WHERE id_paquete = ?';
      const result = await db.query(sql, [paqueteId]);
      return result.affectedRows;
    } catch (error) {
      console.error('Error al eliminar notificaciones por paquete:', error);
      throw error;
    }
  }
};

module.exports = notificacionModel;