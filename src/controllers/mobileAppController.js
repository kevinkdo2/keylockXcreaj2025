const db = require('../config/database');

// Controlador específico para las operaciones desde la app móvil
const mobileAppController = {
    // Función para registrar información desde la app móvil
    registroDesdeApp: async (req, res) => {
        console.log('Recibida solicitud de registro:', req.body);
        
        // Extraer datos del cuerpo de la solicitud
        const { nombre, correo, contraseña } = req.body;
        
        // Validar que todos los campos requeridos estén presentes
        if (!nombre || !correo || !contraseña) {
            console.log('Faltan campos requeridos:', { nombre: !!nombre, correo: !!correo, contraseña: !!contraseña });
            return res.status(400).json({ 
                exito: false,
                mensaje: 'Todos los campos son obligatorios' 
            });
        }
        
        try {
            // Consulta SQL para insertar el nuevo usuario
            const sql = 'INSERT INTO usuario (nombre, correo, contraseña) VALUES (?, ?, ?)';
            console.log('Ejecutando consulta SQL:', sql);
            console.log('Con parámetros:', [nombre, correo, '******']);
            
            // Ejecutar la consulta con los parámetros proporcionados
            const result = await db.query(sql, [nombre, correo, contraseña]);
            console.log('Resultado de la consulta:', result);
            
            // Responder con éxito
            res.json({ 
                exito: true,
                mensaje: 'Usuario registrado correctamente desde app móvil' 
            });
        } catch (err) {
            // Manejar errores de base de datos
            console.error('Error detallado al insertar en la base de datos:', err);
            return res.status(500).json({ 
                exito: false,
                mensaje: 'Error al registrar el usuario',
                error: err.message 
            });
        }
    },
    
    // Función para iniciar sesión desde la app móvil
    loginDesdeApp: async (req, res) => {
        console.log('Recibida solicitud de login:', { 
            correo: req.body.correo, 
            contraseña: '******' // Ocultar contraseña en logs
        });
        
        // Extraer datos del cuerpo de la solicitud
        const { correo, contraseña } = req.body;
        
        // Validar que todos los campos requeridos estén presentes
        if (!correo || !contraseña) {
            console.log('Faltan campos requeridos:', { correo: !!correo, contraseña: !!contraseña });
            return res.status(400).json({ 
                exito: false,
                mensaje: 'Correo y contraseña son obligatorios' 
            });
        }
        
        try {
            // Consulta SQL para verificar credenciales
            const sql = 'SELECT id, nombre, correo FROM usuario WHERE correo = ? AND contraseña = ?';
            console.log('Ejecutando consulta SQL:', sql.replace('?', '***'));
            
            // Ejecutar la consulta con los parámetros proporcionados
            const [usuarios] = await db.query(sql, [correo, contraseña]);
            console.log('Resultado de la consulta:', usuarios.length ? 'Usuario encontrado' : 'No se encontró usuario');
            
            // Verificar si se encontró algún usuario con esas credenciales
            if (usuarios.length === 0) {
                return res.status(401).json({
                    exito: false,
                    mensaje: 'Credenciales incorrectas'
                });
            }
            
            // Obtener el usuario encontrado
            const usuario = usuarios[0];
            console.log('Usuario autenticado:', { id: usuario.id, nombre: usuario.nombre });
            
            // Responder con éxito y datos del usuario (excluyendo la contraseña)
            res.json({ 
                exito: true,
                mensaje: 'Inicio de sesión correcto',
                usuario: {
                    id: usuario.id,
                    nombre: usuario.nombre,
                    correo: usuario.correo
                }
            });
        } catch (err) {
            // Manejar errores de base de datos
            console.error('Error detallado al verificar credenciales:', err);
            return res.status(500).json({ 
                exito: false,
                mensaje: 'Error al iniciar sesión',
                error: err.message 
            });
        }
    },

    // Función de prueba para verificar la conexión desde la app móvil
    testConexion: async (req, res) => {
        console.log('Recibida solicitud de prueba de conexión');
        res.json({
            exito: true,
            mensaje: 'Conexión con la API móvil establecida correctamente',
            timestamp: new Date().toISOString()
        });
    }
};


module.exports = mobileAppController;