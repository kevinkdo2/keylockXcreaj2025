// src/models/casilleroModel.js (adaptado a la nueva BD)

const db = require('../config/database');

const casilleroModel = {
  // Obtener todos los casilleros
  async getAll() {
    try {
      const sql = 'SELECT * FROM casillero';
      return await db.query(sql);
    } catch (error) {
      console.error('Error al obtener casilleros:', error);
      throw error;
    }
  },

  // Obtener casilleros disponibles
  async getDisponibles() {
    try {
      const sql = 'SELECT * FROM casillero WHERE estado = "disponible"';
      return await db.query(sql);
    } catch (error) {
      console.error('Error al obtener casilleros disponibles:', error);
      throw error;
    }
  },
  
  // Obtener casilleros por id
  async findById(id) {
    try {
      const sql = 'SELECT * FROM casillero WHERE id = ?';
      const results = await db.query(sql, [id]);
      return results[0];
    } catch (error) {
      console.error('Error al buscar casillero por ID:', error);
      throw error;
    }
  },

  // Actualizar estado de casillero
  async updateEstado(id, estado) {
    try {
      // Validar que el estado sea válido según el ENUM
      if (!['disponible', 'proximo_lleno', 'ocupado', 'mantenimiento'].includes(estado)) {
        throw new Error('Estado de casillero no válido');
      }
      
      const sql = 'UPDATE casillero SET estado = ? WHERE id = ?';
      const result = await db.query(sql, [estado, id]);
      
      // Registrar en el historial si se realiza el cambio
      if (result.affectedRows > 0) {
        await this.registrarHistorial(id, `Cambio de estado a: ${estado}`);
      }
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al actualizar estado del casillero:', error);
      throw error;
    }
  },
  
  // Registrar en el historial de uso
  async registrarHistorial(id, mensaje) {
    try {
      // Primero obtenemos el casillero para ver su historial actual
      const casillero = await this.findById(id);
      if (!casillero) return false;
      
      // Crear nuevo registro para el historial
      const fecha = new Date().toISOString();
      const nuevoRegistro = `${fecha}: ${mensaje}`;
      
      // Actualizar el historial (concatenar con el existente o crear nuevo)
      let historial = casillero.historial_uso || '';
      if (historial) {
        historial += '\n';
      }
      historial += nuevoRegistro;
      
      const sql = 'UPDATE casillero SET historial_uso = ? WHERE id = ?';
      const result = await db.query(sql, [historial, id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al registrar historial:', error);
      // No lanzamos el error para no interrumpir la operación principal
      return false;
    }
  },
  
  // Crear un nuevo casillero
  async create(casillero) {
    try {
      // Convertir características a JSON si no lo está ya
      let caracteristicasJSON;
      if (typeof casillero.caracteristicas === 'string') {
        try {
          // Verificar si es una cadena JSON válida
          JSON.parse(casillero.caracteristicas);
          caracteristicasJSON = casillero.caracteristicas;
        } catch (e) {
          // Si no es JSON válido, convertirlo a un objeto JSON
          caracteristicasJSON = JSON.stringify({ descripcion: casillero.caracteristicas });
        }
      } else if (typeof casillero.caracteristicas === 'object') {
        caracteristicasJSON = JSON.stringify(casillero.caracteristicas);
      } else {
        caracteristicasJSON = null;
      }
      
      const sql = `
        INSERT INTO casillero (ubicacion, tamanio, caracteristicas, estado, historial_uso) 
        VALUES (?, ?, ?, ?, ?)
      `;
      
      // Registrar creación en historial
      const historialInicial = `${new Date().toISOString()}: Casillero creado`;
      
      const result = await db.query(sql, [
        casillero.ubicacion,
        casillero.tamanio, // Usamos tamanio según la BD
        caracteristicasJSON,
        casillero.estado || 'disponible',
        historialInicial
      ]);
      
      return result.insertId;
    } catch (error) {
      console.error('Error al crear casillero:', error);
      throw error;
    }
  },
  
  // Actualizar casillero
  async update(id, casillero) {
    try {
      // Convertir características a JSON si no lo está ya
      let caracteristicasJSON;
      if (typeof casillero.caracteristicas === 'string') {
        try {
          // Verificar si es una cadena JSON válida
          JSON.parse(casillero.caracteristicas);
          caracteristicasJSON = casillero.caracteristicas;
        } catch (e) {
          // Si no es JSON válido, convertirlo a un objeto JSON
          caracteristicasJSON = JSON.stringify({ descripcion: casillero.caracteristicas });
        }
      } else if (typeof casillero.caracteristicas === 'object') {
        caracteristicasJSON = JSON.stringify(casillero.caracteristicas);
      } else {
        caracteristicasJSON = null;
      }
      
      const sql = `
        UPDATE casillero 
        SET ubicacion = ?, tamanio = ?, caracteristicas = ?, estado = ? 
        WHERE id = ?
      `;
      
      // Registrar actualización en historial
      await this.registrarHistorial(id, 'Casillero actualizado');
      
      const result = await db.query(sql, [
        casillero.ubicacion,
        casillero.tamanio, // Usamos tamanio según la BD
        caracteristicasJSON,
        casillero.estado,
        id
      ]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al actualizar casillero:', error);
      throw error;
    }
  },
  
  // Eliminar casillero
  async delete(id) {
    try {
      const sql = 'DELETE FROM casillero WHERE id = ?';
      const result = await db.query(sql, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al eliminar casillero:', error);
      throw error;
    }
  }
};

module.exports = casilleroModel;