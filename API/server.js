const express = require('express');
const bodyParser = require('body-parser');
const cors = require("cors");
const data_routes = require('./routes/data.route');
const app = express();
const port = 3000;

app.use(cors());

app.use(bodyParser.json({limit: '200mb'}));
app.use('/api/data', data_routes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});