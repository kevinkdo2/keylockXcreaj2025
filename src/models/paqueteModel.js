// src/models/paqueteModel.js (actualizado para manejar tamaño y depuración)

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
      
      // Verificar el formato del tamaño
      let tamanoDb = paquete.tamano;
      if (tamanoDb === 'pequeño') tamanoDb = 'pequeno';
      
      console.log('Creando paquete con datos:', {
        codigo_unico: codigoUnico,
        remitente: paquete.remitente,
        id_usuario: paquete.id_usuario,
        id_casillero: paquete.id_casillero,
        tamano: tamanoDb
      });
      
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
        tamanoDb,
        paquete.caracteristicas
      ]);
      
      // Registrar en el historial del casillero
      await casilleroModel.registrarHistorial(
        paquete.id_casillero, 
        `Paquete registrado: ${codigoUnico} para usuario ID: ${paquete.id_usuario}`
      );
      
      console.log(`Paquete creado con ID: ${result.insertId}, código: ${codigoUnico}`);
      
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
      const paquetes = await db.query(sql);
      console.log(`Obtenidos ${paquetes.length} paquetes`);
      return paquetes;
    } catch (error) {
      console.error('Error al obtener paquetes:', error);
      throw error;
    }
  },

  // Obtener paquetes por ID de empresa
  async getByEmpresaId(empresaId) {
    try {
      console.log(`Buscando paquetes para la empresa ID: ${empresaId}`);
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
      const paquetes = await db.query(sql, [empresaId]);
      console.log(`Encontrados ${paquetes.length} paquetes para la empresa ID: ${empresaId}`);
      
      // Adaptar nombres de tamaño para mostrar al usuario
      paquetes.forEach(paquete => {
        if (paquete.tamano === 'pequeno') paquete.tamano_visual = 'pequeño';
        else paquete.tamano_visual = paquete.tamano;
        
        if (paquete.tamano_casillero === 'pequeno') paquete.tamano_casillero_visual = 'pequeño';
        else paquete.tamano_casillero_visual = paquete.tamano_casillero;
      });
      
      return paquetes;
    } catch (error) {
      console.error(`Error al obtener paquetes por empresa (ID: ${empresaId}):`, error);
      throw error;
    }
  },

  // Obtener paquetes por ID de usuario
  async getByUsuarioId(usuarioId) {
    try {
      console.log(`Buscando paquetes para el usuario ID: ${usuarioId}`);
      const sql = `
        SELECT p.*, 
               c.ubicacion AS ubicacion_casillero,
               c.tamanio AS tamano_casillero 
        FROM paquete p
        JOIN casillero c ON p.id_casillero = c.id
        WHERE p.id_usuario = ?
        ORDER BY p.fecha_entrega DESC
      `;
      const paquetes = await db.query(sql, [usuarioId]);
      console.log(`Encontrados ${paquetes.length} paquetes para el usuario ID: ${usuarioId}`);
      return paquetes;
    } catch (error) {
      console.error(`Error al obtener paquetes por usuario (ID: ${usuarioId}):`, error);
      throw error;
    }
  },

  // Obtener paquete por ID
  async findById(id) {
    try {
      console.log(`Buscando paquete con ID: ${id}`);
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
      
      if (results.length > 0) {
        const paquete = results[0];
        // Adaptar nombres de tamaño para mostrar al usuario
        if (paquete.tamano === 'pequeno') paquete.tamano_visual = 'pequeño';
        else paquete.tamano_visual = paquete.tamano;
        
        if (paquete.tamano_casillero === 'pequeno') paquete.tamano_casillero_visual = 'pequeño';
        else paquete.tamano_casillero_visual = paquete.tamano_casillero;
        
        console.log(`Paquete encontrado: ${paquete.codigo_unico}`);
        return paquete;
      } else {
        console.log(`No se encontró paquete con ID: ${id}`);
        return null;
      }
    } catch (error) {
      console.error(`Error al buscar paquete por ID (${id}):`, error);
      throw error;
    }
  },

  // Obtener paquete por código único
  async findByCodigoUnico(codigoUnico) {
    try {
      console.log(`Buscando paquete con código único: ${codigoUnico}`);
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
      
      if (results.length > 0) {
        const paquete = results[0];
        // Adaptar nombres de tamaño para mostrar al usuario
        if (paquete.tamano === 'pequeno') paquete.tamano_visual = 'pequeño';
        else paquete.tamano_visual = paquete.tamano;
        
        if (paquete.tamano_casillero === 'pequeno') paquete.tamano_casillero_visual = 'pequeño';
        else paquete.tamano_casillero_visual = paquete.tamano_casillero;
        
        console.log(`Paquete encontrado: ${paquete.id}`);
        return paquete;
      } else {
        console.log(`No se encontró paquete con código único: ${codigoUnico}`);
        return null;
      }
    } catch (error) {
      console.error(`Error al buscar paquete por código único (${codigoUnico}):`, error);
      throw error;
    }
  },

  // Actualizar estado del paquete
  async updateEstado(id, estado) {
    try {
      console.log(`Actualizando estado del paquete ID: ${id} a "${estado}"`);
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
      
      console.log(`Estado del paquete actualizado: ${result.affectedRows} fila(s) afectada(s)`);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error al actualizar estado del paquete (ID: ${id}):`, error);
      throw error;
    }
  },

  // Eliminar paquete
  async delete(id) {
    try {
      console.log(`Eliminando paquete ID: ${id}`);
      // Primero obtenemos el paquete para conocer el casillero
      const paquete = await this.findById(id);
      if (!paquete) {
        console.log(`No se pudo encontrar el paquete ID: ${id} para eliminar`);
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
      console.log(`Paquete eliminado: ${result.affectedRows} fila(s) afectada(s)`);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error al eliminar paquete (ID: ${id}):`, error);
      throw error;
    }
  }
};

module.exports = paqueteModel;