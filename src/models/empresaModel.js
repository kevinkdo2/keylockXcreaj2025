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

  // Validar contraseña
  async validatePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }
};

module.exports = empresaModel;