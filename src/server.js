require('dotenv').config();
const sequelize = require('./config/database');
const app = require('./app');

// prismaClient.js
// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();

// module.exports = prisma;


const PORT = process.env.PORT || 3000;

sequelize.authenticate()
  .then(() => {
    console.log('Database connected...');
    // if (process.env.environment == 'development' || process.env.environment !== 'production') {
      return sequelize.sync();
    // }
    return 0;
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(error => {
    console.error('Unable to connect to the database:', error);
  });
