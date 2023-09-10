require('dotenv').config();
const express = require('express');
const { default: mongoose } = require('mongoose');
const app = express();
const path = require('path');
const usersRouter = require('./controllers/users');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const loginRouter = require('./controllers/login');
const { userExtractor } = require('./middleware/auth');
const logoutRouter = require('./controllers/logout');
const { MONGO_URI } = require('./config');
const contactRouter = require('./controllers/contact');

(async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Conectó a mongodb');
    } catch (error) {
        console.error(error);
        console.log('No conectado con mongodb');
    }
})();

// manejo de rutas y creación de servidor estático.
app.use(express.json());

// creación, manejo y análisis de cookies con js.
app.use(cookieParser());

// seguridad en las interacciones entre diferentes sitios webs y prevencion de ataques no autorizados.
app.use(cors());

// Rutas Front-End
app.use('/', express.static(path.resolve(__dirname, 'views', 'home')));
app.use('/signup', express.static(path.resolve(__dirname, 'views', 'signup')));
app.use('/login', express.static(path.resolve(__dirname, 'views', 'login')));
app.use('/contacts', express.static(path.resolve(__dirname, 'views', 'contacts')));
app.use('/verify/:id/:token', express.static(path.resolve(__dirname, 'views', 'verify')));
app.use('/styles', express.static(path.resolve(__dirname, 'views', 'styles')));
app.use('/images', express.static(path.resolve(__dirname, 'img')));
app.use('/components', express.static(path.resolve(__dirname, 'views', 'components')));

// muestra mensajes en consola de los CRUD.
app.use(morgan('tiny'));

// Rutas Back-End

app.use('/api/users', usersRouter);
app.use('/api/login', loginRouter);
app.use('/api/logout', logoutRouter);
app.use('/api/contacts', userExtractor, contactRouter);

module.exports = app;