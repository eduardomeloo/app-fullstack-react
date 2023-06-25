const express = require('express');
const apiRoutes = require('./api/apiRoutes');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', apiRoutes);

app.listen(3001, () => {
  console.log('Serviço da API iniciado na porta 3001.');
});