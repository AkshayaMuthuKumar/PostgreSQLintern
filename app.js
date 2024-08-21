const express = require('express');
const sequelize = require('./config/database');
const studentRoutes = require('./routes/studentRoutes');
require('./utils.js/notification');

const app = express();
app.use(express.json());
app.use('/api', studentRoutes);

sequelize.sync()
    .then(() => console.log('Models synchronized...'))
    .catch(err => console.log('Error: ' + err));


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
