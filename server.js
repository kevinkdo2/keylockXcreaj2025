// server.js (actualizado con nuevas rutas para empresas)
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const cors = require('cors');
require('dotenv').config();

// Importar rutas
const authRoutes = require('./src/routes/authRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const empresaRoutes = require('./src/routes/empresaRoutes'); // Nueva ruta para empresas
const usuarioRoutes = require('./src/routes/usuarioRoutes');
const paqueteRoutes = require('./src/routes/paqueteRoutes');
const mobileRoutes = require('./src/routes/mobileRoutes');

// Inicializar app
const app = express();
const PORT = process.env.PORT || 3000;
 
// Configurar motor de vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'secreto',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3600000 } // 1 hora
}));
app.use(flash());

// Variables globales para mensajes flash y usuario en sesión
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.session.user || null;
  next();
});

// Rutas
app.use('/', authRoutes);
app.use('/admin', adminRoutes);
app.use('/', empresaRoutes); // Nueva ruta para empresas
app.use('/admin', usuarioRoutes);
app.use('/', paqueteRoutes); // Actualizado para usar tanto por admin como por empresas

// Rutas para la app móvil
app.use('/api/mobile', mobileRoutes);

// Ruta principal
app.get('/', (req, res) => {
  res.render('index');
});

// Ruta de prueba para verificar funcionamiento
app.get('/test', (req, res) => {
  res.send('¡Servidor funcionando correctamente!');
});

// Ruta de prueba para verificar API móvil
app.get('/api/test', (req, res) => {
  res.json({ status: 'success', message: 'API móvil funcionando correctamente' });
});

// Manejador de errores 404
app.use((req, res, next) => {
  // Para peticiones API, devolver JSON
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ 
      status: 'error', 
      message: 'Endpoint no encontrado' 
    });
  }
  
  // Para peticiones web, renderizar vista de error
  res.status(404).render('error', {
    message: 'Página no encontrada',
    error: {status: 404},
    user: req.session.user
  });
});

// Manejador de errores generales
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Para peticiones API, devolver JSON
  if (req.path.startsWith('/api/')) {
    return res.status(err.status || 500).json({ 
      status: 'error', 
      message: err.message,
      details: process.env.NODE_ENV === 'development' ? err : {}
    });
  }
  
  // Para peticiones web, renderizar vista de error
  res.status(err.status || 500).render('error', {
    message: err.message,
    error: process.env.NODE_ENV === 'development' ? err : {},
    user: req.session.user
  });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en: http://localhost:${PORT}`);
  console.log(`API móvil disponible en: http://localhost:${PORT}/api/mobile`);
});