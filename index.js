const express = require('express');
const app = express();
const path = require('path');

const triangulationRoutes = require('./routes/triangulation');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.use('/api/triangulation', triangulationRoutes);
app.use((req, res, next) => {
   res.sendFile('/index.html');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
   console.log(`Express started on http://localhost:${PORT}/`);
});
