// src/models/empresaModel.js

const db = require('../config/database');
const bcrypt = require('bcryptjs');

const empresaModel = {
  // Crear una nueva empresa
  async create(empresa) {
    try {
      // Generar hash de la contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(empresa.contrasena, salt);
      
      // Insertar en la base de datos
      const sql = `
        INSERT INTO empresa (nombre, correo, contrasena) 
        VALUES (?, ?, ?)
      `;
      const result = await db.query(sql, [
        empresa.nombre,
        empresa.correo,
        hashedPassword
      ]);
      
      return result.insertId;
    } catch (error) {
      console.error('Error al crear empresa:', error);
      throw error;
    }
  },

  // Obtener todas las empresas
  async getAll() {
    try {
      const sql = 'SELECT id, nombre, correo, creado_en FROM empresa';
      return await db.query(sql);
    } catch (error) {
      console.error('Error al obtener empresas:', error);
      throw error;
    }
  },

  // Buscar empresa por ID
  async findById(id) {
    try {
      const sql = 'SELECT id, nombre, correo, creado_en FROM empresa WHERE id = ?';
      const results = await db.query(sql, [id]);
      return results[0]; // Devolver el primer resultado o undefined
    } catch (error) {
      console.error('Error al buscar empresa por ID:', error);
      throw error;
    }
  },

  // Buscar empresa por correo
  async findByEmail(correo) {
    try {
      const sql = 'SELECT * FROM empresa WHERE correo = ?';
      const results = await db.query(sql, [correo]);
      return results[0]; // Devolver el primer resultado o undefined
    } catch (error) {
      console.error('Error al buscar empresa por correo:', error);
      throw error;
    }
  },

  // Actualizar empresa
  async update(id, empresa) {
    try {
      // Consulta base sin contraseña
      let sql = 'UPDATE empresa SET nombre = ?, correo = ? WHERE id = ?';
      let params = [empresa.nombre, empresa.correo, id];
      
      // Si se proporciona nueva contraseña, actualizarla también
      if (empresa.contrasena) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(empresa.contrasena, salt);
        sql = 'UPDATE empresa SET nombre = ?, correo = ?, contrasena = ? WHERE id = ?';
        params = [empresa.nombre, empresa.correo, hashedPassword, id];
      }
      
      const result = await db.query(sql, params);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al actualizar empresa:', error);
      throw error;
    }
  },

  // Eliminar empresa
  async delete(id) {
    try {
      const sql = 'DELETE FROM empresa WHERE id = ?';
      const result = await db.query(sql, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al eliminar empresa:', error);
      throw error;
    }
  },

  // Validar contraseña
  async validatePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }
};

module.exports = empresaModel;