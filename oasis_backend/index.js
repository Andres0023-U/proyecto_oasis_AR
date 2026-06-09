const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

app.use(cors());
app.use(express.json());

const reservationRoutes = require('./src/routes/reservationRoutes');
app.use('/reservas', reservationRoutes);

app.get('/', (req, res) => {
    res.json({ message: '¡API Oasis funcionando!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

const authRoutes = require('./src/routes/authRoutes');
app.use('/auth', authRoutes);

const pool = require('./src/config/db');

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Error DB:', err);
  } else {
    console.log('🟢 DB conectada:', res.rows);
  }
});


const paymentRoutes = require('./src/routes/paymentRoutes');
app.use('/pagos', paymentRoutes);

const userRoutes = require('./src/routes/userRoutes');
app.use('/usuarios', userRoutes);

const reviewRoutes = require('./src/routes/reviewRoutes');
app.use('/resenas', reviewRoutes);