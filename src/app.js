const express = require('express');
const userRoutes = require('./routes/userRoutes');
const path = require('path');
const app = express();
const { initializeCronJobs } = require('./controllers/cronController');
// Middleware to parse JSON bodies with a limit of 50MB
app.use(express.json({ limit: '50mb' }));

// Middleware to parse URL-encoded bodies with a limit of 50MB
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// Example global middleware
// app.use((req, res, next) => {
//     console.log(`${req.method} ${req.url}`);
//     next();
// });
// start cronjob
initializeCronJobs()

app.use('/uploads/thumbnails', express.static(path.join(__dirname, '..', 'uploads', 'thumbnails')));
app.use('/api', userRoutes.apiRouter);
app.use(userRoutes.api);

module.exports = app;
