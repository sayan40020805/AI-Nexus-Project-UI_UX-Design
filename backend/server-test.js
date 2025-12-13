const express = require('express');
const cors = require('cors');

const app = express();

// Init Middleware
app.use(cors());
app.use(express.json());

// Define Routes (Simplified without database)
app.use('/api/auth', require('./routes/auth'));

// Simple test route
app.get('/', (req, res) => {
  res.json({ message: 'AI Nexus API Server is running!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Test server started on port ${PORT}`));
