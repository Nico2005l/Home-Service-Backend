require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const db = require('./db/database');
const listEndpoints = require('express-list-endpoints'); // 👈 Importar la librería

const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Inicializar DB
const schema = fs.readFileSync('./models/schema.sql', 'utf8');
db.exec(schema);

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);


console.log('Auth routes:', listEndpoints(authRoutes).map(e => ({ endpoint: '/api/auth' + e.path, method: e.methods })));
console.log('Service routes:', listEndpoints(serviceRoutes).map(e => ({ endpoint: '/api/services' + e.path, method: e.methods })));
console.log('Booking routes:', listEndpoints(bookingRoutes).map(e => ({ endpoint: '/api/bookings' + e.path, method: e.methods })));
console.log('Review routes:', listEndpoints(reviewRoutes).map(e => ({ endpoint: '/api/reviews' + e.path, method: e.methods })));
 

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));


