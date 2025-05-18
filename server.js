// server.js (actualizado para la BD)

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
require('dotenv').config();

// Importar rutas
const authRoutes = require('./src/routes/authRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const usuarioRoutes = require('./src/routes/usuarioRoutes');
const paqueteRoutes = require('./src/routes/paqueteRoutes');

// Inicializar app
const app = express();
const PORT = process.env.PORT || 3000;

// Configurar motor de vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
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
  res.locals.user = req.session.user || null; // Agregar usuario a las variables locales
  next();
});

// Rutas
app.use('/', authRoutes);
app.use('/admin', adminRoutes);
app.use('/admin', usuarioRoutes);
app.use('/admin', paqueteRoutes);

// Ruta principal
app.get('/', (req, res) => {
  res.render('index');
});

// Ruta de prueba para verificar funcionamiento
app.get('/test', (req, res) => {
  res.send('¡Servidor funcionando correctamente!');
});

// Manejador de errores 404
app.use((req, res, next) => {
  res.status(404).render('error', {
    message: 'Página no encontrada',
    error: {status: 404},
    user: req.session.user
  });
});

// Manejador de errores generales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).render('error', {
    message: err.message,
    error: process.env.NODE_ENV === 'development' ? err : {},
    user: req.session.user
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en: http://localhost:${PORT}`);
});