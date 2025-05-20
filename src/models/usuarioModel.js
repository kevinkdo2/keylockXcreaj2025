// src/models/usuarioModel.js (modificado para obtener usuarios sin importar empresa)

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
      
      // Permitir id_empresa NULL si no se proporciona
      const id_empresa = usuario.id_empresa || null;
      
      // Insertar en la base de datos
      const sql = `
        INSERT INTO usuario (nombre, correo, contrasena, id_empresa) 
        VALUES (?, ?, ?, ?)
      `;
      console.log('Creando usuario:', {
        nombre: usuario.nombre,
        correo: usuario.correo,
        id_empresa: id_empresa
      });
      
      const result = await db.query(sql, [
        usuario.nombre,
        usuario.correo,
        hashedPassword,
        id_empresa
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
      const usuarios = await db.query(sql);
      console.log(`Obtenidos ${usuarios.length} usuarios en total`);
      return usuarios;
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw error;
    }
  },

  // Obtener usuarios por empresa (modificado para incluir usuarios sin empresa)
  async getByEmpresaId(empresaId) {
    try {
      console.log(`Buscando usuarios para la empresa ID: ${empresaId} o sin empresa asignada`);
      // Modificado para incluir usuarios sin empresa (id_empresa IS NULL)
      const sql = 'SELECT id, nombre, correo FROM usuario WHERE id_empresa = ? OR id_empresa IS NULL';
      const usuarios = await db.query(sql, [empresaId]);
      console.log(`Encontrados ${usuarios.length} usuarios (incluidos los que no tienen empresa asignada)`);
      
      // Si no se encontraron usuarios, verificar si la empresa existe
      if (usuarios.length === 0) {
        const empresaSql = 'SELECT id, nombre FROM empresa WHERE id = ?';
        const empresas = await db.query(empresaSql, [empresaId]);
        if (empresas.length > 0) {
          console.log(`La empresa ID: ${empresaId} (${empresas[0].nombre}) existe pero no tiene usuarios`);
        } else {
          console.log(`No se encontró la empresa con ID: ${empresaId}`);
        }
        
        // Intentar obtener usuarios sin empresa asignada como respaldo
        const sinEmpresaSql = 'SELECT id, nombre, correo FROM usuario WHERE id_empresa IS NULL';
        const usuariosSinEmpresa = await db.query(sinEmpresaSql);
        console.log(`Encontrados ${usuariosSinEmpresa.length} usuarios sin empresa asignada`);
        
        if (usuariosSinEmpresa.length > 0) {
          return usuariosSinEmpresa;
        }
      }
      
      return usuarios;
    } catch (error) {
      console.error(`Error al obtener usuarios por empresa (ID: ${empresaId}):`, error);
      throw error;
    }
  },

  // Buscar usuario por ID
  async findById(id) {
    try {
      console.log(`Buscando usuario con ID: ${id}`);
      const sql = 'SELECT id, nombre, correo, id_empresa FROM usuario WHERE id = ?';
      const results = await db.query(sql, [id]);
      if (results.length > 0) {
        console.log(`Usuario encontrado: ${results[0].nombre}`);
      } else {
        console.log(`No se encontró usuario con ID: ${id}`);
      }
      return results[0]; // Devolver el primer resultado o undefined
    } catch (error) {
      console.error('Error al buscar usuario por ID:', error);
      throw error;
    }
  },

  // Buscar usuario por correo
  async findByEmail(correo) {
    try {
      console.log(`Buscando usuario con correo: ${correo}`);
      const sql = 'SELECT * FROM usuario WHERE correo = ?';
      const results = await db.query(sql, [correo]);
      if (results.length > 0) {
        console.log(`Usuario encontrado por correo: ${results[0].nombre}`);
      } else {
        console.log(`No se encontró usuario con correo: ${correo}`);
      }
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
      if (usuario.id_empresa !== undefined) {
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
      
      console.log(`Actualizando usuario ID: ${id}`);
      const result = await db.query(sql, params);
      console.log(`Usuario actualizado: ${result.affectedRows} fila(s) afectada(s)`);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  },

  // Eliminar usuario
  async delete(id) {
    try {
      console.log(`Eliminando usuario ID: ${id}`);
      const sql = 'DELETE FROM usuario WHERE id = ?';
      const result = await db.query(sql, [id]);
      console.log(`Usuario eliminado: ${result.affectedRows} fila(s) afectada(s)`);
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