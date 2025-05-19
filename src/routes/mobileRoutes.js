const express = require('express');
const router = express.Router();

// Intentar importar el controlador y manejar cualquier error
let mobileAppController;
try {
    mobileAppController = require('../controllers/mobileAppController');
    console.log('Controlador móvil cargado correctamente');
} catch (error) {
    console.error('Error al cargar el controlador móvil:', error);
    // Crear un objeto de respaldo con funciones vacías para evitar errores
    mobileAppController = {
        registroDesdeApp: (req, res) => res.status(500).json({ exito: false, mensaje: 'Controlador no disponible' }),
        loginDesdeApp: (req, res) => res.status(500).json({ exito: false, mensaje: 'Controlador no disponible' }),
        testConexion: (req, res) => res.json({ exito: false, mensaje: 'Controlador no disponible, pero ruta funciona' })
    };
}

// Ruta para registro de usuarios desde la app móvil
router.post('/registro', mobileAppController.registroDesdeApp);

// Ruta para inicio de sesión desde la app móvil
router.post('/login', mobileAppController.loginDesdeApp);

// Ruta de prueba 
router.get('/test', mobileAppController.testConexion);

// Ruta de respaldo por si acaso
router.get('/ping', (req, res) => {
    res.json({
        exito: true,
        mensaje: 'Servidor respondiendo correctamente',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;