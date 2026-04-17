require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth',       require('./routes/authRoutes'));
app.use('/api/settings',   require('./routes/settingsRoutes'));
app.use('/api/products',   require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/orders',     require('./routes/orderRoutes'));
app.use('/api/reviews',    require('./routes/reviewRoutes'));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Admin Backend Server running on port ${PORT}`));
