// src/controllers/usuarioController.js (actualizado para empresas)

const usuarioModel = require('../models/usuarioModel');
const empresaModel = require('../models/empresaModel');
const { validationResult } = require('express-validator');

const usuarioController = {
  // Mostrar lista de usuarios
  index: async (req, res) => {
    try {
      let usuarios;
      let viewPath;
      
      // Si es admin, mostrar todos los usuarios
      if (req.session.user.isAdmin) {
        usuarios = await usuarioModel.getAll();
        
        // Obtener información de las empresas para mostrar el nombre
        const empresas = await empresaModel.getAll();
        const empresasMap = {};
        
        empresas.forEach(empresa => {
          empresasMap[empresa.id] = empresa.nombre;
        });
        
        // Añadir nombre de la empresa a cada usuario
        usuarios = usuarios.map(usuario => ({
          ...usuario,
          empresa_nombre: empresasMap[usuario.id_empresa] || 'Sin empresa'
        }));
        
        viewPath = 'admin/usuarios';
      } else {
        // Si es una empresa, mostrar solo sus usuarios
        usuarios = await usuarioModel.getByEmpresaId(req.session.user.id);
        viewPath = 'empresa/usuarios';
      }
      
      res.render(viewPath, {
        usuarios,
        user: req.session.user
      });
    } catch (error) {
      console.error('Error al listar usuarios:', error);
      req.flash('error_msg', 'Error al cargar la lista de usuarios');
      if (req.session.user.isAdmin) {
        res.redirect('/admin/dashboard');
      } else {
        res.redirect('/empresa/dashboard');
      }
    }
  },

  // Mostrar formulario para crear usuario
  showCreateForm: async (req, res) => {
    try {
      // Si es admin, obtener todas las empresas para el select
      let empresas = [];
      let viewPath;
      let actionPath;
      
      if (req.session.user.isAdmin) {
        empresas = await empresaModel.getAll();
        viewPath = 'admin/usuario-form';
        actionPath = '/admin/usuarios/create';
      } else {
        viewPath = 'empresa/usuario-form';
        actionPath = '/empresa/usuarios/create';
      }
      
      res.render(viewPath, {
        title: 'Crear Usuario',
        usuario: {},
        empresas,
        action: actionPath,
        user: req.session.user
      });
    } catch (error) {
      console.error('Error al mostrar formulario de usuario:', error);
      req.flash('error_msg', 'Error al cargar el formulario');
      if (req.session.user.isAdmin) {
        res.redirect('/admin/usuarios');
      } else {
        res.redirect('/empresa/usuarios');
      }
    }
  },

  // Procesar creación de usuario
  create: async (req, res) => {
    try {
      // Validar errores del formulario
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Si es admin, obtener todas las empresas para el select
        let empresas = [];
        let viewPath;
        let actionPath;
        
        if (req.session.user.isAdmin) {
          empresas = await empresaModel.getAll();
          viewPath = 'admin/usuario-form';
          actionPath = '/admin/usuarios/create';
        } else {
          viewPath = 'empresa/usuario-form';
          actionPath = '/empresa/usuarios/create';
        }
        
        return res.status(400).render(viewPath, {
          title: 'Crear Usuario',
          usuario: req.body,
          empresas,
          action: actionPath,
          errors: errors.array(),
          user: req.session.user
        });
      }

      // Verificar si el correo ya está registrado
      const existingUsuario = await usuarioModel.findByEmail(req.body.correo);
      if (existingUsuario) {
        req.flash('error_msg', 'Este correo electrónico ya está registrado');
        return res.redirect(req.session.user.isAdmin ? 
                          '/admin/usuarios/create' : 
                          '/empresa/usuarios/create');
      }

      // Si no es admin, asignar automáticamente la empresa del usuario logueado
      let id_empresa = req.body.id_empresa;
      if (!req.session.user.isAdmin) {
        id_empresa = req.session.user.id;
      }

      // Crear nuevo usuario
      await usuarioModel.create({
        nombre: req.body.nombre,
        correo: req.body.correo,
        contrasena: req.body.contrasena,
        id_empresa: id_empresa
      });

      req.flash('success_msg', 'Usuario creado exitosamente');
      res.redirect(req.session.user.isAdmin ? 
                 '/admin/usuarios' : 
                 '/empresa/usuarios');
    } catch (error) {
      console.error('Error al crear usuario:', error);
      req.flash('error_msg', 'Error al crear el usuario');
      res.redirect(req.session.user.isAdmin ? 
                 '/admin/usuarios/create' : 
                 '/empresa/usuarios/create');
    }
  },

  // Mostrar formulario para editar usuario
  showEditForm: async (req, res) => {
    try {
      const usuario = await usuarioModel.findById(req.params.id);
      
      // Verificar si el usuario existe
      if (!usuario) {
        req.flash('error_msg', 'Usuario no encontrado');
        return res.redirect(req.session.user.isAdmin ? 
                          '/admin/usuarios' : 
                          '/empresa/usuarios');
      }
      
      // Verificar permisos (solo el admin puede editar usuarios de otras empresas)
      if (!req.session.user.isAdmin && usuario.id_empresa !== req.session.user.id) {
        req.flash('error_msg', 'No tienes permiso para editar este usuario');
        return res.redirect('/empresa/usuarios');
      }
      
      // Si es admin, obtener todas las empresas para el select
      let empresas = [];
      let viewPath;
      let actionPath;
      
      if (req.session.user.isAdmin) {
        empresas = await empresaModel.getAll();
        viewPath = 'admin/usuario-form';
        actionPath = `/admin/usuarios/update/${usuario.id}`;
      } else {
        viewPath = 'empresa/usuario-form';
        actionPath = `/empresa/usuarios/update/${usuario.id}`;
      }
      
      res.render(viewPath, {
        title: 'Editar Usuario',
        usuario,
        empresas,
        action: actionPath,
        user: req.session.user
      });
    } catch (error) {
      console.error('Error al mostrar formulario de edición:', error);
      req.flash('error_msg', 'Error al cargar el formulario');
      res.redirect(req.session.user.isAdmin ? 
                 '/admin/usuarios' : 
                 '/empresa/usuarios');
    }
  },

  // Procesar actualización de usuario
  update: async (req, res) => {
    try {
      const id = req.params.id;
      
      // Validar errores del formulario
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Si es admin, obtener todas las empresas para el select
        let empresas = [];
        let viewPath;
        let actionPath;
        
        if (req.session.user.isAdmin) {
          empresas = await empresaModel.getAll();
          viewPath = 'admin/usuario-form';
          actionPath = `/admin/usuarios/update/${id}`;
        } else {
          viewPath = 'empresa/usuario-form';
          actionPath = `/empresa/usuarios/update/${id}`;
        }
        
        return res.status(400).render(viewPath, {
          title: 'Editar Usuario',
          usuario: {...req.body, id},
          empresas,
          action: actionPath,
          errors: errors.array(),
          user: req.session.user
        });
      }

      // Verificar si el usuario existe
      const usuario = await usuarioModel.findById(id);
      if (!usuario) {
        req.flash('error_msg', 'Usuario no encontrado');
        return res.redirect(req.session.user.isAdmin ? 
                          '/admin/usuarios' : 
                          '/empresa/usuarios');
      }
      
      // Verificar permisos (solo el admin puede editar usuarios de otras empresas)
      if (!req.session.user.isAdmin && usuario.id_empresa !== req.session.user.id) {
        req.flash('error_msg', 'No tienes permiso para editar este usuario');
        return res.redirect('/empresa/usuarios');
      }

      // Verificar si el nuevo correo ya está en uso
      if (usuario.correo !== req.body.correo) {
        const existingUsuario = await usuarioModel.findByEmail(req.body.correo);
        if (existingUsuario && existingUsuario.id !== parseInt(id)) {
          req.flash('error_msg', 'Este correo electrónico ya está en uso por otro usuario');
          return res.redirect(req.session.user.isAdmin ? 
                           `/admin/usuarios/edit/${id}` : 
                           `/empresa/usuarios/edit/${id}`);
        }
      }

      // Si no es admin, mantener la empresa original
      let id_empresa = req.body.id_empresa;
      if (!req.session.user.isAdmin) {
        id_empresa = usuario.id_empresa;
      }

      // Actualizar usuario
      await usuarioModel.update(id, {
        nombre: req.body.nombre,
        correo: req.body.correo,
        contrasena: req.body.contrasena, // Si está vacío, el modelo lo manejará
        id_empresa: id_empresa
      });

      req.flash('success_msg', 'Usuario actualizado exitosamente');
      res.redirect(req.session.user.isAdmin ? 
                 '/admin/usuarios' : 
                 '/empresa/usuarios');
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      req.flash('error_msg', 'Error al actualizar el usuario');
      res.redirect(req.session.user.isAdmin ? 
                 '/admin/usuarios' : 
                 '/empresa/usuarios');
    }
  },

  // Eliminar usuario
  delete: async (req, res) => {
    try {
      const id = req.params.id;
      
      // Verificar si el usuario existe
      const usuario = await usuarioModel.findById(id);
      if (!usuario) {
        req.flash('error_msg', 'Usuario no encontrado');
        return res.redirect(req.session.user.isAdmin ? 
                          '/admin/usuarios' : 
                          '/empresa/usuarios');
      }
      
      // Verificar permisos (solo el admin puede eliminar usuarios de otras empresas)
      if (!req.session.user.isAdmin && usuario.id_empresa !== req.session.user.id) {
        req.flash('error_msg', 'No tienes permiso para eliminar este usuario');
        return res.redirect('/empresa/usuarios');
      }

      // Eliminar usuario
      await usuarioModel.delete(id);

      req.flash('success_msg', 'Usuario eliminado exitosamente');
      res.redirect(req.session.user.isAdmin ? 
                 '/admin/usuarios' : 
                 '/empresa/usuarios');
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      req.flash('error_msg', 'Error al eliminar el usuario');
      res.redirect(req.session.user.isAdmin ? 
                 '/admin/usuarios' : 
                 '/empresa/usuarios');
    }
  }
};

module.exports = usuarioController;