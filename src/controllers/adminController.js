// src/controllers/adminController.js

const empresaModel = require('../models/empresaModel');
const { validationResult } = require('express-validator');

const adminController = {
  // Mostrar dashboard de administrador
  dashboard: async (req, res) => {
    try {
      res.render('admin/dashboard', {
        user: req.session.user
      });
    } catch (error) {
      console.error('Error en dashboard admin:', error);
      req.flash('error_msg', 'Error al cargar el dashboard');
      res.redirect('/');
    }
  },

  // Ver lista de empresas
  empresas: async (req, res) => {
    try {
      const empresas = await empresaModel.getAll();
      
      res.render('admin/empresas', {
        empresas,
        user: req.session.user
      });
    } catch (error) {
      console.error('Error al listar empresas:', error);
      req.flash('error_msg', 'Error al cargar la lista de empresas');
      res.redirect('/admin/dashboard');
    }
  },

  // Mostrar formulario para crear empresa
  showCreateEmpresa: (req, res) => {
    res.render('admin/empresa-form', {
      title: 'Crear Empresa',
      empresa: {},
      action: '/admin/empresas/create',
      user: req.session.user
    });
  },

  // Procesar creación de empresa
  createEmpresa: async (req, res) => {
    try {
      // Validar errores del formulario
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).render('admin/empresa-form', {
          title: 'Crear Empresa',
          empresa: req.body,
          action: '/admin/empresas/create',
          errors: errors.array(),
          user: req.session.user
        });
      }

      // Verificar si el correo ya está registrado
      const existingEmpresa = await empresaModel.findByEmail(req.body.correo);
      if (existingEmpresa) {
        req.flash('error_msg', 'Este correo electrónico ya está registrado');
        return res.render('admin/empresa-form', {
          title: 'Crear Empresa',
          empresa: req.body,
          action: '/admin/empresas/create',
          user: req.session.user
        });
      }

      // Crear nueva empresa
      await empresaModel.create(req.body);

      req.flash('success_msg', 'Empresa creada exitosamente');
      res.redirect('/admin/empresas');
    } catch (error) {
      console.error('Error al crear empresa:', error);
      req.flash('error_msg', 'Error al crear la empresa');
      res.render('admin/empresa-form', {
        title: 'Crear Empresa',
        empresa: req.body,
        action: '/admin/empresas/create',
        user: req.session.user
      });
    }
  },

  // Mostrar formulario para editar empresa
  showEditEmpresa: async (req, res) => {
    try {
      const empresa = await empresaModel.findById(req.params.id);
      
      if (!empresa) {
        req.flash('error_msg', 'Empresa no encontrada');
        return res.redirect('/admin/empresas');
      }
      
      res.render('admin/empresa-form', {
        title: 'Editar Empresa',
        empresa,
        action: `/admin/empresas/update/${empresa.id}`,
        user: req.session.user
      });
    } catch (error) {
      console.error('Error al cargar empresa para editar:', error);
      req.flash('error_msg', 'Error al cargar datos de la empresa');
      res.redirect('/admin/empresas');
    }
  },

  // Procesar actualización de empresa
  updateEmpresa: async (req, res) => {
    try {
      const id = req.params.id;
      
      // Validar errores del formulario
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).render('admin/empresa-form', {
          title: 'Editar Empresa',
          empresa: {...req.body, id},
          action: `/admin/empresas/update/${id}`,
          errors: errors.array(),
          user: req.session.user
        });
      }

      // Verificar si existe la empresa
      const empresa = await empresaModel.findById(id);
      if (!empresa) {
        req.flash('error_msg', 'Empresa no encontrada');
        return res.redirect('/admin/empresas');
      }

      // Verificar si el nuevo correo ya está en uso por otra empresa
      if (empresa.correo !== req.body.correo) {
        const existingEmpresa = await empresaModel.findByEmail(req.body.correo);
        if (existingEmpresa && existingEmpresa.id !== parseInt(id)) {
          req.flash('error_msg', 'Este correo electrónico ya está en uso por otra empresa');
          return res.render('admin/empresa-form', {
            title: 'Editar Empresa',
            empresa: {...req.body, id},
            action: `/admin/empresas/update/${id}`,
            user: req.session.user
          });
        }
      }

      // Actualizar empresa
      const updated = await empresaModel.update(id, req.body);
      
      if (updated) {
        req.flash('success_msg', 'Empresa actualizada exitosamente');
      } else {
        req.flash('error_msg', 'No se pudo actualizar la empresa');
      }
      
      res.redirect('/admin/empresas');
    } catch (error) {
      console.error('Error al actualizar empresa:', error);
      req.flash('error_msg', 'Error al actualizar la empresa');
      res.redirect('/admin/empresas');
    }
  },

  // Eliminar empresa
  deleteEmpresa: async (req, res) => {
    try {
      const id = req.params.id;
      
      // Verificar si existe la empresa
      const empresa = await empresaModel.findById(id);
      if (!empresa) {
        req.flash('error_msg', 'Empresa no encontrada');
        return res.redirect('/admin/empresas');
      }

      // Eliminar empresa
      const deleted = await empresaModel.delete(id);
      
      if (deleted) {
        req.flash('success_msg', 'Empresa eliminada exitosamente');
      } else {
        req.flash('error_msg', 'No se pudo eliminar la empresa');
      }
      
      res.redirect('/admin/empresas');
    } catch (error) {
      console.error('Error al eliminar empresa:', error);
      req.flash('error_msg', 'Error al eliminar la empresa');
      res.redirect('/admin/empresas');
    }
  }
};

module.exports = adminController;