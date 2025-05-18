// src/models/paqueteModel.js (adaptado a la nueva BD)

const db = require('../config/database');
const { generateUniqueCode } = require('../utils/codeGenerator');
const casilleroModel = require('./casilleroModel');

const paqueteModel = {
  // Crear un nuevo paquete
  async create(paquete) {
    try {
      // Generar código único
      const codigoUnico = generateUniqueCode();
      
      // Actualizar estado del casillero a ocupado
      await casilleroModel.updateEstado(paquete.id_casillero, 'ocupado');
      
      // Insertar paquete en la base de datos
      const sql = `
        INSERT INTO paquete (
          codigo_unico, 
          remitente, 
          id_usuario, 
          id_casillero, 
          tamano, 
          caracteristicas, 
          estado,
          fecha_entrega
        ) VALUES (?, ?, ?, ?, ?, ?, 'pendiente', NOW())
      `;
      
      const result = await db.query(sql, [
        codigoUnico,
        paquete.remitente,
        paquete.id_usuario,
        paquete.id_casillero,
        paquete.tamano,
        paquete.caracteristicas
      ]);
      
      // Registrar en el historial del casillero
      await casilleroModel.registrarHistorial(
        paquete.id_casillero, 
        `Paquete registrado: ${codigoUnico} para usuario ID: ${paquete.id_usuario}`
      );
      
      // Devolver objeto con id y código único generado
      return {
        id: result.insertId,
        codigo_unico: codigoUnico
      };
    } catch (error) {
      console.error('Error al crear paquete:', error);
      throw error;
    }
  },

  // Obtener todos los paquetes
  async getAll() {
    try {
      const sql = `
        SELECT p.*, 
               u.nombre AS nombre_usuario, 
               c.ubicacion AS ubicacion_casillero,
               c.tamanio AS tamano_casillero 
        FROM paquete p
        JOIN usuario u ON p.id_usuario = u.id
        JOIN casillero c ON p.id_casillero = c.id
        ORDER BY p.fecha_entrega DESC
      `;
      return await db.query(sql);
    } catch (error) {
      console.error('Error al obtener paquetes:', error);
      throw error;
    }
  },

  // Obtener paquetes por ID de empresa
  async getByEmpresaId(empresaId) {
    try {
      const sql = `
        SELECT p.*, 
               u.nombre AS nombre_usuario, 
               c.ubicacion AS ubicacion_casillero,
               c.tamanio AS tamano_casillero 
        FROM paquete p
        JOIN usuario u ON p.id_usuario = u.id
        JOIN casillero c ON p.id_casillero = c.id
        WHERE u.id_empresa = ?
        ORDER BY p.fecha_entrega DESC
      `;
      return await db.query(sql, [empresaId]);
    } catch (error) {
      console.error('Error al obtener paquetes por empresa:', error);
      throw error;
    }
  },

  // Obtener paquetes por ID de usuario
  async getByUsuarioId(usuarioId) {
    try {
      const sql = `
        SELECT p.*, 
               c.ubicacion AS ubicacion_casillero,
               c.tamanio AS tamano_casillero 
        FROM paquete p
        JOIN casillero c ON p.id_casillero = c.id
        WHERE p.id_usuario = ?
        ORDER BY p.fecha_entrega DESC
      `;
      return await db.query(sql, [usuarioId]);
    } catch (error) {
      console.error('Error al obtener paquetes por usuario:', error);
      throw error;
    }
  },

  // Obtener paquete por ID
  async findById(id) {
    try {
      const sql = `
        SELECT p.*, 
               u.nombre AS nombre_usuario, 
               c.ubicacion AS ubicacion_casillero,
               c.tamanio AS tamano_casillero 
        FROM paquete p
        JOIN usuario u ON p.id_usuario = u.id
        JOIN casillero c ON p.id_casillero = c.id
        WHERE p.id = ?
      `;
      const results = await db.query(sql, [id]);
      return results[0];
    } catch (error) {
      console.error('Error al buscar paquete por ID:', error);
      throw error;
    }
  },

  // Obtener paquete por código único
  async findByCodigoUnico(codigoUnico) {
    try {
      const sql = `
        SELECT p.*, 
               u.nombre AS nombre_usuario, 
               c.ubicacion AS ubicacion_casillero,
               c.tamanio AS tamano_casillero 
        FROM paquete p
        JOIN usuario u ON p.id_usuario = u.id
        JOIN casillero c ON p.id_casillero = c.id
        WHERE p.codigo_unico = ?
      `;
      const results = await db.query(sql, [codigoUnico]);
      return results[0];
    } catch (error) {
      console.error('Error al buscar paquete por código único:', error);
      throw error;
    }
  },

  // Actualizar estado del paquete
  async updateEstado(id, estado) {
    try {
      const sql = 'UPDATE paquete SET estado = ? WHERE id = ?';
      const result = await db.query(sql, [estado, id]);
      
      // Si el paquete fue recogido, marcar la fecha de recogida
      if (estado === 'recogido') {
        await db.query('UPDATE paquete SET fecha_recogida = NOW() WHERE id = ?', [id]);
        
        // Liberar el casillero
        const paquete = await this.findById(id);
        if (paquete) {
          await casilleroModel.updateEstado(paquete.id_casillero, 'disponible');
          
          // Registrar en el historial del casillero
          await casilleroModel.registrarHistorial(
            paquete.id_casillero, 
            `Paquete ${paquete.codigo_unico} recogido`
          );
        }
      }
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al actualizar estado del paquete:', error);
      throw error;
    }
  },

  // Eliminar paquete
  async delete(id) {
    try {
      // Primero obtenemos el paquete para conocer el casillero
      const paquete = await this.findById(id);
      if (!paquete) {
        return false;
      }
      
      // Liberar el casillero si el paquete no ha sido recogido
      if (paquete.estado !== 'recogido') {
        await casilleroModel.updateEstado(paquete.id_casillero, 'disponible');
        
        // Registrar en el historial del casillero
        await casilleroModel.registrarHistorial(
          paquete.id_casillero, 
          `Paquete ${paquete.codigo_unico} eliminado del sistema`
        );
      }
      
      // Eliminar el paquete
      const sql = 'DELETE FROM paquete WHERE id = ?';
      const result = await db.query(sql, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al eliminar paquete:', error);
      throw error;
    }
  }
};

module.exports = paqueteModel;