// src/models/usuarioModel.js (adaptado a la nueva BD)

const db = require('../config/database');
const bcrypt = require('bcryptjs');

const usuarioModel = {
  // Crear un nuevo usuario
  async create(usuario) {
    try {
      // Generar hash de la contraseña si existe
      let hashedPassword = null;
      if (usuario.contrasena) {
        const salt = await bcrypt.genSalt(10);
        hashedPassword = await bcrypt.hash(usuario.contrasena, salt);
      }
      
      // Insertar en la base de datos
      const sql = `
        INSERT INTO usuario (nombre, correo, contrasena, id_empresa) 
        VALUES (?, ?, ?, ?)
      `;
      const result = await db.query(sql, [
        usuario.nombre,
        usuario.correo,
        hashedPassword,
        usuario.id_empresa
      ]);
      
      return result.insertId;
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  },

  // Obtener todos los usuarios
  async getAll() {
    try {
      const sql = 'SELECT id, nombre, correo, id_empresa FROM usuario';
      return await db.query(sql);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw error;
    }
  },

  // Obtener usuarios por empresa
  async getByEmpresaId(empresaId) {
    try {
      const sql = 'SELECT id, nombre, correo FROM usuario WHERE id_empresa = ?';
      return await db.query(sql, [empresaId]);
    } catch (error) {
      console.error('Error al obtener usuarios por empresa:', error);
      throw error;
    }
  },

  // Buscar usuario por ID
  async findById(id) {
    try {
      const sql = 'SELECT id, nombre, correo, id_empresa FROM usuario WHERE id = ?';
      const results = await db.query(sql, [id]);
      return results[0]; // Devolver el primer resultado o undefined
    } catch (error) {
      console.error('Error al buscar usuario por ID:', error);
      throw error;
    }
  },

  // Buscar usuario por correo
  async findByEmail(correo) {
    try {
      const sql = 'SELECT * FROM usuario WHERE correo = ?';
      const results = await db.query(sql, [correo]);
      return results[0]; // Devolver el primer resultado o undefined
    } catch (error) {
      console.error('Error al buscar usuario por correo:', error);
      throw error;
    }
  },

  // Actualizar usuario
  async update(id, usuario) {
    try {
      // Consulta base sin contraseña
      let sql = 'UPDATE usuario SET nombre = ?, correo = ?';
      let params = [usuario.nombre, usuario.correo];
      
      // Si se proporciona id_empresa, incluirlo en la actualización
      if (usuario.id_empresa) {
        sql += ', id_empresa = ?';
        params.push(usuario.id_empresa);
      }
      
      // Si se proporciona nueva contraseña, actualizarla también
      if (usuario.contrasena) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(usuario.contrasena, salt);
        sql += ', contrasena = ?';
        params.push(hashedPassword);
      }
      
      // Completar la consulta
      sql += ' WHERE id = ?';
      params.push(id);
      
      const result = await db.query(sql, params);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  },

  // Eliminar usuario
  async delete(id) {
    try {
      const sql = 'DELETE FROM usuario WHERE id = ?';
      const result = await db.query(sql, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw error;
    }
  },

  // Validar contraseña
  async validatePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }
};

module.exports = usuarioModel;