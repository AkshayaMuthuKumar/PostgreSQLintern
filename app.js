const express = require('express');
const sequelize = require('./config/database');
const studentRoutes = require('./routes/studentRoutes');
const customerRoutes = require('./routes/customerRoutes');
require('./utils.js/notification');

require('./models/company');
require('./models/product');
require('./models/customer');
require('./models/customerproducts');

const app = express();
app.use(express.json());
app.use('/api', studentRoutes);
app.use('/api', customerRoutes);

sequelize.sync()
    .then(() => console.log('Models synchronized...'))
    .catch(err => console.log('Error: ' + err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


