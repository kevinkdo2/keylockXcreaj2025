// src/models/casilleroModel.js (modificado para ignorar relación con empresa)

const db = require('../config/database');

const casilleroModel = {
  // Obtener todos los casilleros sin importar su estado
  async getAll() {
    try {
      const sql = 'SELECT * FROM casillero';
      const casilleros = await db.query(sql);
      console.log(`Obtenidos ${casilleros.length} casilleros en total`);
      return casilleros;
    } catch (error) {
      console.error('Error al obtener casilleros:', error);
      throw error;
    }
  },

  // Obtener casilleros disponibles y sin filtrar por empresa
  async getDisponibles() {
    try {
      console.log('Buscando todos los casilleros disponibles sin filtrar por empresa');
      // Modificado para obtener todos los casilleros disponibles
      const sql = 'SELECT * FROM casillero WHERE estado = "disponible"';
      const casilleros = await db.query(sql);
      console.log(`Encontrados ${casilleros.length} casilleros disponibles`);
      
      // Si hay casilleros, mostrar información del primero para depuración
      if (casilleros.length > 0) {
        console.log('Primer casillero:', JSON.stringify(casilleros[0], null, 2));
      }
      
      return casilleros;
    } catch (error) {
      console.error('Error al obtener casilleros disponibles:', error);
      throw error;
    }
  },
  
  // Obtener casilleros por id
  async findById(id) {
    try {
      console.log(`Buscando casillero con ID: ${id}`);
      const sql = 'SELECT * FROM casillero WHERE id = ?';
      const results = await db.query(sql, [id]);
      
      if (results.length > 0) {
        console.log(`Casillero encontrado: ${results[0].ubicacion} (${results[0].tamanio})`);
        return results[0];
      } else {
        console.log(`No se encontró casillero con ID: ${id}`);
        return null;
      }
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
      
      console.log(`Actualizando estado del casillero ID: ${id} a "${estado}"`);
      const sql = 'UPDATE casillero SET estado = ? WHERE id = ?';
      const result = await db.query(sql, [estado, id]);
      
      // Registrar en el historial si se realiza el cambio
      if (result.affectedRows > 0) {
        console.log(`Casillero ID: ${id} actualizado correctamente`);
        await this.registrarHistorial(id, `Cambio de estado a: ${estado}`);
      } else {
        console.log(`No se encontró casillero con ID: ${id} para actualizar`);
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