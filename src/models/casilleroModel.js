// src/models/casilleroModel.js

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
      const sql = 'UPDATE casillero SET estado = ? WHERE id = ?';
      const result = await db.query(sql, [estado, id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al actualizar estado del casillero:', error);
      throw error;
    }
  },
  
  // Crear un nuevo casillero
  async create(casillero) {
    try {
      const sql = `
        INSERT INTO casillero (ubicacion, tamano, caracteristicas, estado) 
        VALUES (?, ?, ?, ?)
      `;
      
      const result = await db.query(sql, [
        casillero.ubicacion,
        casillero.tamano,
        casillero.caracteristicas,
        casillero.estado || 'disponible'
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
      const sql = `
        UPDATE casillero 
        SET ubicacion = ?, tamano = ?, caracteristicas = ?, estado = ? 
        WHERE id = ?
      `;
      
      const result = await db.query(sql, [
        casillero.ubicacion,
        casillero.tamano,
        casillero.caracteristicas,
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