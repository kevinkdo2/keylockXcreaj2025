// src/controllers/paqueteController.js (adaptado a la nueva BD)

const paqueteModel = require('../models/paqueteModel');
const notificacionModel = require('../models/notificacionModel');
const casilleroModel = require('../models/casilleroModel');
const usuarioModel = require('../models/usuarioModel');
const { generateQRToDataURL } = require('../utils/qrGenerator');
const { validationResult } = require('express-validator');

const paqueteController = {
  // Mostrar lista de paquetes
  index: async (req, res) => {
    try {
      let paquetes;
      // Determinar si mostrar todos los paquetes o solo los de una empresa específica
      if (req.session.user.isAdmin) {
        paquetes = await paqueteModel.getAll();
      } else if (req.session.user.isEmpresa) {
        // Si es una empresa, mostrar los paquetes de sus usuarios
        paquetes = await paqueteModel.getByEmpresaId(req.session.user.id);
      }
      
      res.render('admin/paquetes', {
        title: 'Gestión de Paquetes',
        paquetes,
        user: req.session.user
      });
    } catch (error) {
      console.error('Error al listar paquetes:', error);
      req.flash('error_msg', 'Error al cargar la lista de paquetes');
      res.redirect('/admin/dashboard');
    }
  },

  // Mostrar formulario para crear paquete
  showCreateForm: async (req, res) => {
    try {
      // Obtener casilleros disponibles
      const casilleros = await casilleroModel.getDisponibles();
      
      // Obtener usuarios para el select
      let usuarios;
      if (req.session.user.isAdmin) {
        // Si es admin, mostrar todos los usuarios
        usuarios = await usuarioModel.getAll();
      } else if (req.session.user.isEmpresa) {
        // Si es empresa, mostrar solo sus usuarios
        usuarios = await usuarioModel.getByEmpresaId(req.session.user.id);
      }
      
      res.render('admin/paquete-form', {
        title: 'Registrar Paquete',
        paquete: {},
        casilleros,
        usuarios,
        action: '/admin/paquetes/create',
        user: req.session.user
      });
    } catch (error) {
      console.error('Error al mostrar formulario de paquete:', error);
      req.flash('error_msg', 'Error al cargar el formulario');
      res.redirect('/admin/paquetes');
    }
  },

  // Procesar creación de paquete
  create: async (req, res) => {
    try {
      // Validar errores del formulario
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Obtener casilleros y usuarios para volver a renderizar el formulario
        const casilleros = await casilleroModel.getDisponibles();
        let usuarios;
        if (req.session.user.isAdmin) {
          usuarios = await usuarioModel.getAll();
        } else if (req.session.user.isEmpresa) {
          usuarios = await usuarioModel.getByEmpresaId(req.session.user.id);
        }
        
        return res.status(400).render('admin/paquete-form', {
          title: 'Registrar Paquete',
          paquete: req.body,
          casilleros,
          usuarios,
          action: '/admin/paquetes/create',
          errors: errors.array(),
          user: req.session.user
        });
      }

      // Verificar que el casillero exista y esté disponible
      const casillero = await casilleroModel.findById(req.body.id_casillero);
      if (!casillero || casillero.estado !== 'disponible') {
        req.flash('error_msg', 'El casillero seleccionado no está disponible');
        return res.redirect('/admin/paquetes/create');
      }

      // Verificar que el usuario exista
      const usuario = await usuarioModel.findById(req.body.id_usuario);
      if (!usuario) {
        req.flash('error_msg', 'El usuario seleccionado no existe');
        return res.redirect('/admin/paquetes/create');
      }

      // Si es empresa, verificar que el usuario pertenezca a ella
      if (req.session.user.isEmpresa && usuario.id_empresa !== req.session.user.id) {
        req.flash('error_msg', 'No tiene permisos para registrar paquetes para este usuario');
        return res.redirect('/admin/paquetes');
      }

      // Crear nuevo paquete
      const nuevoPaquete = await paqueteModel.create({
        remitente: req.body.remitente,
        id_usuario: req.body.id_usuario,
        id_casillero: req.body.id_casillero,
        tamano: req.body.tamano,
        caracteristicas: req.body.caracteristicas
      });

      // Crear notificación para el usuario
      await notificacionModel.create({
        id_usuario: req.body.id_usuario,
        id_paquete: nuevoPaquete.id,
        titulo: 'Nuevo paquete recibido',
        mensaje: `Se ha recibido un paquete para ti. El código de recogida es: ${nuevoPaquete.codigo_unico}`
      });

      // Redirigir a la página para mostrar el QR
      res.redirect(`/admin/paquetes/qr/${nuevoPaquete.id}`);
    } catch (error) {
      console.error('Error al crear paquete:', error);
      req.flash('error_msg', 'Error al registrar el paquete');
      res.redirect('/admin/paquetes/create');
    }
  },

  // Mostrar código QR del paquete
  showQR: async (req, res) => {
    try {
      const id = req.params.id;
      const paquete = await paqueteModel.findById(id);
      
      if (!paquete) {
        req.flash('error_msg', 'Paquete no encontrado');
        return res.redirect('/admin/paquetes');
      }
      
      // Verificar permisos
      if (!req.session.user.isAdmin && req.session.user.isEmpresa) {
        const usuario = await usuarioModel.findById(paquete.id_usuario);
        if (usuario.id_empresa !== req.session.user.id) {
          req.flash('error_msg', 'No tiene permisos para ver este paquete');
          return res.redirect('/admin/paquetes');
        }
      }
      
      // Generar QR con el código único
      const qrDataURL = await generateQRToDataURL(paquete.codigo_unico);
      
      res.render('admin/paquete-qr', {
        title: 'Código QR del Paquete',
        paquete,
        qrDataURL,
        user: req.session.user
      });
    } catch (error) {
      console.error('Error al generar QR:', error);
      req.flash('error_msg', 'Error al generar el código QR');
      res.redirect('/admin/paquetes');
    }
  },

  // Actualizar estado del paquete
  updateEstado: async (req, res) => {
    try {
      const id = req.params.id;
      const { estado } = req.body;
      
      // Verificar si el paquete existe
      const paquete = await paqueteModel.findById(id);
      if (!paquete) {
        req.flash('error_msg', 'Paquete no encontrado');
        return res.redirect('/admin/paquetes');
      }
      
      // Verificar permisos
      if (!req.session.user.isAdmin && req.session.user.isEmpresa) {
        const usuario = await usuarioModel.findById(paquete.id_usuario);
        if (usuario.id_empresa !== req.session.user.id) {
          req.flash('error_msg', 'No tiene permisos para modificar este paquete');
          return res.redirect('/admin/paquetes');
        }
      }
      
      // Actualizar estado
      const updated = await paqueteModel.updateEstado(id, estado);
      
      if (updated) {
        // Crear notificación para el usuario según el nuevo estado
        let mensaje = '';
        let titulo = '';
        
        if (estado === 'recogido') {
          titulo = 'Paquete recogido';
          mensaje = `Tu paquete con código ${paquete.codigo_unico} ha sido recogido correctamente.`;
        } else if (estado === 'cancelado') {
          titulo = 'Paquete cancelado';
          mensaje = `Tu paquete con código ${paquete.codigo_unico} ha sido cancelado.`;
        }
        
        await notificacionModel.create({
          id_usuario: paquete.id_usuario,
          id_paquete: paquete.id,
          titulo,
          mensaje
        });
        
        req.flash('success_msg', `Estado del paquete actualizado a: ${estado}`);
      } else {
        req.flash('error_msg', 'No se pudo actualizar el estado del paquete');
      }
      
      res.redirect('/admin/paquetes');
    } catch (error) {
      console.error('Error al actualizar estado del paquete:', error);
      req.flash('error_msg', 'Error al actualizar el estado del paquete');
      res.redirect('/admin/paquetes');
    }
  },

  // Eliminar paquete
  delete: async (req, res) => {
    try {
      const id = req.params.id;
      
      // Verificar si el paquete existe
      const paquete = await paqueteModel.findById(id);
      if (!paquete) {
        req.flash('error_msg', 'Paquete no encontrado');
        return res.redirect('/admin/paquetes');
      }
      
      // Verificar permisos
      if (!req.session.user.isAdmin && req.session.user.isEmpresa) {
        const usuario = await usuarioModel.findById(paquete.id_usuario);
        if (usuario.id_empresa !== req.session.user.id) {
          req.flash('error_msg', 'No tiene permisos para eliminar este paquete');
          return res.redirect('/admin/paquetes');
        }
      }
      
      // Eliminar notificaciones asociadas al paquete
      await notificacionModel.deleteByPaqueteId(id);
      
      // Eliminar paquete (esto también liberará el casillero si es necesario)
      const deleted = await paqueteModel.delete(id);
      
      if (deleted) {
        req.flash('success_msg', 'Paquete eliminado correctamente');
      } else {
        req.flash('error_msg', 'No se pudo eliminar el paquete');
      }
      
      res.redirect('/admin/paquetes');
    } catch (error) {
      console.error('Error al eliminar paquete:', error);
      req.flash('error_msg', 'Error al eliminar el paquete');
      res.redirect('/admin/paquetes');
    }
  },
  
  // Verificar paquete por código
  verificar: async (req, res) => {
    try {
      const { codigo } = req.body;
      
      // Buscar paquete por código único
      const paquete = await paqueteModel.findByCodigoUnico(codigo);
      
      if (!paquete) {
        req.flash('error_msg', 'Código de paquete no válido');
        return res.redirect('/admin/paquetes');
      }
      
      // Verificar permisos
      if (!req.session.user.isAdmin && req.session.user.isEmpresa) {
        const usuario = await usuarioModel.findById(paquete.id_usuario);
        if (usuario.id_empresa !== req.session.user.id) {
          req.flash('error_msg', 'No tiene permisos para ver este paquete');
          return res.redirect('/admin/paquetes');
        }
      }
      
      // Si el paquete ya fue recogido
      if (paquete.estado === 'recogido') {
        req.flash('error_msg', 'Este paquete ya ha sido recogido');
        return res.redirect('/admin/paquetes');
      }
      
      res.render('admin/verificar-paquete', {
        title: 'Verificación de Paquete',
        paquete,
        user: req.session.user
      });
    } catch (error) {
      console.error('Error al verificar paquete:', error);
      req.flash('error_msg', 'Error al verificar el código del paquete');
      res.redirect('/admin/paquetes');
    }
  }
};

module.exports = paqueteController;