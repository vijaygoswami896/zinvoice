const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const invoiceRoutes = require('./src/routes/invoiceRoutes');

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(cors());

app.use('/', invoiceRoutes);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});