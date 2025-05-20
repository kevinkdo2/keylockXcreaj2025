// src/controllers/paqueteController.js (actualizado para manejar NULL)

const paqueteModel = require('../models/paqueteModel');
const notificacionModel = require('../models/notificacionModel');
const casilleroModel = require('../models/casilleroModel');
const usuarioModel = require('../models/usuarioModel');
const { generateQRToDataURL } = require('../utils/qrGenerator');
const { validationResult } = require('express-validator');

const paqueteController = {
  // Mostrar lista de paquetes
  index: async function(req, res) {
    try {
      let paquetes;
      let viewPath;
      
      // Determinar si mostrar todos los paquetes o solo los de una empresa específica
      if (req.session.user.isAdmin) {
        paquetes = await paqueteModel.getAll();
        viewPath = 'admin/paquetes';
      } else if (req.session.user.isEmpresa) {
        // Si es una empresa, mostrar los paquetes de sus usuarios
        paquetes = await paqueteModel.getByEmpresaId(req.session.user.id);
        viewPath = 'empresa/paquetes'; // Nueva vista para empresas
      }
      
      // Manejar campos NULL en cada paquete
      if (paquetes && paquetes.length > 0) {
        paquetes.forEach(paquete => {
          // Asegurar que características tenga un valor válido
          if (paquete.caracteristicas === null) {
            paquete.caracteristicas = '';
          }
          
          // Convertir tamaño para mostrar correctamente
          if (paquete.tamano === 'pequeno') {
            paquete.tamano_visual = 'Pequeño';
          } else if (paquete.tamano === 'mediano') {
            paquete.tamano_visual = 'Mediano';
          } else if (paquete.tamano === 'grande') {
            paquete.tamano_visual = 'Grande';
          } else {
            paquete.tamano_visual = paquete.tamano || 'No especificado';
          }
        });
      }
      
      res.render(viewPath, {
        title: 'Gestión de Paquetes',
        paquetes,
        user: req.session.user
      });
    } catch (error) {
      console.error('Error al listar paquetes:', error);
      req.flash('error_msg', 'Error al cargar la lista de paquetes');
      
      // Redireccionar según el tipo de usuario
      if (req.session.user.isAdmin) {
        res.redirect('/admin/dashboard');
      } else {
        res.redirect('/empresa/dashboard');
      }
    }
  },

  // Mostrar formulario para crear paquete
  showCreateForm: async function(req, res) {
    try {
      // Obtener casilleros disponibles
      const casilleros = await casilleroModel.getDisponibles();
      
      // Verificar si hay casilleros disponibles
      if (!casilleros || casilleros.length === 0) {
        console.log("No hay casilleros disponibles");
      } else {
        console.log(`Se encontraron ${casilleros.length} casilleros disponibles`);
        // Verificar estructura de datos
        console.log("Primer casillero:", JSON.stringify(casilleros[0], null, 2));
      }
      
      // Obtener usuarios para el select
      let usuarios;
      let viewPath;
      
      if (req.session.user.isAdmin) {
        // Si es admin, mostrar todos los usuarios
        usuarios = await usuarioModel.getAll();
        viewPath = 'admin/paquete-form';
      } else if (req.session.user.isEmpresa) {
        // Si es empresa, mostrar solo sus usuarios
        usuarios = await usuarioModel.getByEmpresaId(req.session.user.id);
        viewPath = 'empresa/paquete-form'; // Nueva vista para empresas
      }
      
      // Verificar si hay usuarios
      if (!usuarios || usuarios.length === 0) {
        console.log("No hay usuarios disponibles");
        if (req.session.user.isEmpresa) {
          console.log(`Buscando usuarios para la empresa ID: ${req.session.user.id}`);
        }
      } else {
        console.log(`Se encontraron ${usuarios.length} usuarios`);
        // Verificar estructura de datos
        console.log("Primer usuario:", JSON.stringify(usuarios[0], null, 2));
      }
      
      res.render(viewPath, {
        title: 'Registrar Paquete',
        paquete: {},
        casilleros,
        usuarios,
        action: req.session.user.isAdmin ? 
                '/admin/paquetes/create' : 
                '/empresa/paquetes/create',
        user: req.session.user
      });
    } catch (error) {
      console.error('Error al mostrar formulario de paquete:', error);
      console.error(error.stack); // Mostrar el stack trace completo
      req.flash('error_msg', 'Error al cargar el formulario');
      
      // Redireccionar según el tipo de usuario
      if (req.session.user.isAdmin) {
        res.redirect('/admin/paquetes');
      } else {
        res.redirect('/empresa/paquetes');
      }
    }
  },

  // Procesar creación de paquete
  create: async function(req, res) {
    try {
      console.log("Método create llamado con datos:", req.body);
      
      // Validar errores del formulario
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Obtener casilleros y usuarios para volver a renderizar el formulario
        const casilleros = await casilleroModel.getDisponibles();
        let usuarios;
        let viewPath;
        let redirectPath;
        
        if (req.session.user.isAdmin) {
          usuarios = await usuarioModel.getAll();
          viewPath = 'admin/paquete-form';
          redirectPath = '/admin/paquetes/create';
        } else if (req.session.user.isEmpresa) {
          usuarios = await usuarioModel.getByEmpresaId(req.session.user.id);
          viewPath = 'empresa/paquete-form';
          redirectPath = '/empresa/paquetes/create';
        }
        
        return res.status(400).render(viewPath, {
          title: 'Registrar Paquete',
          paquete: req.body,
          casilleros,
          usuarios,
          action: req.session.user.isAdmin ? 
                  '/admin/paquetes/create' : 
                  '/empresa/paquetes/create',
          errors: errors.array(),
          user: req.session.user
        });
      }

      // Verificar que el casillero exista y esté disponible
      const casillero = await casilleroModel.findById(req.body.id_casillero);
      if (!casillero || casillero.estado !== 'disponible') {
        req.flash('error_msg', 'El casillero seleccionado no está disponible');
        return res.redirect(req.session.user.isAdmin ? 
                           '/admin/paquetes/create' : 
                           '/empresa/paquetes/create');
      }

      // Verificar que el usuario exista
      const usuario = await usuarioModel.findById(req.body.id_usuario);
      if (!usuario) {
        req.flash('error_msg', 'El usuario seleccionado no existe');
        return res.redirect(req.session.user.isAdmin ? 
                           '/admin/paquetes/create' : 
                           '/empresa/paquetes/create');
      }

      // Convertir tamano a formato adecuado para la base de datos
      let tamanoDb = req.body.tamano;
      // Si el valor es 'pequeño', conviértelo a 'pequeno' para la base de datos
      if (tamanoDb === 'pequeño') tamanoDb = 'pequeno';
      if (tamanoDb === 'mediano') tamanoDb = 'mediano';
      if (tamanoDb === 'grande') tamanoDb = 'grande';

      // Asegurar que características no sea NULL
      const caracteristicas = req.body.caracteristicas || '';

      // Crear nuevo paquete
      const nuevoPaquete = await paqueteModel.create({
        remitente: req.body.remitente,
        id_usuario: req.body.id_usuario,
        id_casillero: req.body.id_casillero,
        tamano: tamanoDb, // Usar el formato convertido
        caracteristicas: caracteristicas // Usar valor seguro
      });

      // Crear notificación para el usuario
      await notificacionModel.create({
        id_usuario: req.body.id_usuario,
        id_paquete: nuevoPaquete.id,
        titulo: 'Nuevo paquete recibido',
        mensaje: `Se ha recibido un paquete para ti. El código de recogida es: ${nuevoPaquete.codigo_unico}`
      });

      // Redirigir a la página para mostrar el QR
      res.redirect(req.session.user.isAdmin ? 
                   `/admin/paquetes/qr/${nuevoPaquete.id}` : 
                   `/empresa/paquetes/qr/${nuevoPaquete.id}`);
    } catch (error) {
      console.error('Error al crear paquete:', error);
      console.error(error.stack); // Mostrar stack trace completo
      req.flash('error_msg', 'Error al registrar el paquete');
      res.redirect(req.session.user.isAdmin ? 
                   '/admin/paquetes/create' : 
                   '/empresa/paquetes/create');
    }
  },

  // Mostrar código QR del paquete
  showQR: async function(req, res) {
    try {
      const id = req.params.id;
      const paquete = await paqueteModel.findById(id);
      
      if (!paquete) {
        req.flash('error_msg', 'Paquete no encontrado');
        return res.redirect(req.session.user.isAdmin ? 
                           '/admin/paquetes' : 
                           '/empresa/paquetes');
      }
      
      // Asegurar que características no sea NULL
      if (paquete.caracteristicas === null) {
        paquete.caracteristicas = '';
      }
      
      // Convertir tamaño para mostrar correctamente
      if (paquete.tamano === 'pequeno') {
        paquete.tamano_visual = 'Pequeño';
      } else if (paquete.tamano === 'mediano') {
        paquete.tamano_visual = 'Mediano';
      } else if (paquete.tamano === 'grande') {
        paquete.tamano_visual = 'Grande';
      } else {
        paquete.tamano_visual = paquete.tamano || 'No especificado';
      }
      
      // Verificar permisos
      if (!req.session.user.isAdmin && req.session.user.isEmpresa) {
        const usuario = await usuarioModel.findById(paquete.id_usuario);
        if (usuario && usuario.id_empresa !== req.session.user.id) {
          req.flash('error_msg', 'No tiene permisos para ver este paquete');
          return res.redirect('/empresa/paquetes');
        }
      }
      
      // Generar QR con el código único
      const qrDataURL = await generateQRToDataURL(paquete.codigo_unico);
      
      // Seleccionar la vista según el tipo de usuario
      const viewPath = req.session.user.isAdmin ? 
                      'admin/paquete-qr' : 
                      'empresa/paquete-qr';
      
      res.render(viewPath, {
        title: 'Código QR del Paquete',
        paquete,
        qrDataURL,
        user: req.session.user
      });
    } catch (error) {
      console.error('Error al generar QR:', error);
      req.flash('error_msg', 'Error al generar el código QR');
      res.redirect(req.session.user.isAdmin ? 
                   '/admin/paquetes' : 
                   '/empresa/paquetes');
    }
  },

  // Actualizar estado del paquete
  updateEstado: async function(req, res) {
    try {
      const id = req.params.id;
      const { estado } = req.body;
      
      // Verificar si el paquete existe
      const paquete = await paqueteModel.findById(id);
      if (!paquete) {
        req.flash('error_msg', 'Paquete no encontrado');
        return res.redirect(req.session.user.isAdmin ? 
                           '/admin/paquetes' : 
                           '/empresa/paquetes');
      }
      
      // Verificar permisos
      if (!req.session.user.isAdmin && req.session.user.isEmpresa) {
        const usuario = await usuarioModel.findById(paquete.id_usuario);
        if (usuario && usuario.id_empresa !== req.session.user.id) {
          req.flash('error_msg', 'No tiene permisos para modificar este paquete');
          return res.redirect('/empresa/paquetes');
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
      
      res.redirect(req.session.user.isAdmin ? 
                   '/admin/paquetes' : 
                   '/empresa/paquetes');
    } catch (error) {
      console.error('Error al actualizar estado del paquete:', error);
      req.flash('error_msg', 'Error al actualizar el estado del paquete');
      res.redirect(req.session.user.isAdmin ? 
                   '/admin/paquetes' : 
                   '/empresa/paquetes');
    }
  },

  // Eliminar paquete
  delete: async function(req, res) {
    try {
      const id = req.params.id;
      
      // Verificar si el paquete existe
      const paquete = await paqueteModel.findById(id);
      if (!paquete) {
        req.flash('error_msg', 'Paquete no encontrado');
        return res.redirect(req.session.user.isAdmin ? 
                           '/admin/paquetes' : 
                           '/empresa/paquetes');
      }
      
      // Verificar permisos
      if (!req.session.user.isAdmin && req.session.user.isEmpresa) {
        const usuario = await usuarioModel.findById(paquete.id_usuario);
        if (usuario && usuario.id_empresa !== req.session.user.id) {
          req.flash('error_msg', 'No tiene permisos para eliminar este paquete');
          return res.redirect('/empresa/paquetes');
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
      
      res.redirect(req.session.user.isAdmin ? 
                   '/admin/paquetes' : 
                   '/empresa/paquetes');
    } catch (error) {
      console.error('Error al eliminar paquete:', error);
      req.flash('error_msg', 'Error al eliminar el paquete');
      res.redirect(req.session.user.isAdmin ? 
                   '/admin/paquetes' : 
                   '/empresa/paquetes');
    }
  },
  
  // Verificar paquete por código
  verificar: async function(req, res) {
    try {
      const { codigo } = req.body;
      
      // Buscar paquete por código único
      const paquete = await paqueteModel.findByCodigoUnico(codigo);
      
      if (!paquete) {
        req.flash('error_msg', 'Código de paquete no válido');
        return res.redirect(req.session.user.isAdmin ? 
                           '/admin/paquetes' : 
                           '/empresa/paquetes');
      }
      
      // Asegurar que características no sea NULL
      if (paquete.caracteristicas === null) {
        paquete.caracteristicas = '';
      }
      
      // Convertir tamaño para mostrar correctamente
      if (paquete.tamano === 'pequeno') {
        paquete.tamano_visual = 'Pequeño';
      } else if (paquete.tamano === 'mediano') {
        paquete.tamano_visual = 'Mediano';
      } else if (paquete.tamano === 'grande') {
        paquete.tamano_visual = 'Grande';
      } else {
        paquete.tamano_visual = paquete.tamano || 'No especificado';
      }
      
      // Verificar permisos
      if (!req.session.user.isAdmin && req.session.user.isEmpresa) {
        const usuario = await usuarioModel.findById(paquete.id_usuario);
        if (usuario && usuario.id_empresa !== req.session.user.id) {
          req.flash('error_msg', 'No tiene permisos para ver este paquete');
          return res.redirect('/empresa/paquetes');
        }
      }
      
      // Si el paquete ya fue recogido
      if (paquete.estado === 'recogido') {
        req.flash('error_msg', 'Este paquete ya ha sido recogido');
        return res.redirect(req.session.user.isAdmin ? 
                           '/admin/paquetes' : 
                           '/empresa/paquetes');
      }
      
      // Seleccionar la vista según el tipo de usuario
      const viewPath = req.session.user.isAdmin ? 
                      'admin/verificar-paquete' : 
                      'empresa/verificar-paquete';
      
      res.render(viewPath, {
        title: 'Verificación de Paquete',
        paquete,
        user: req.session.user
      });
    } catch (error) {
      console.error('Error al verificar paquete:', error);
      req.flash('error_msg', 'Error al verificar el código del paquete');
      res.redirect(req.session.user.isAdmin ? 
                   '/admin/paquetes' : 
                   '/empresa/paquetes');
    }
  }
};

module.exports = paqueteController;