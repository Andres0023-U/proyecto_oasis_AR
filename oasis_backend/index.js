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