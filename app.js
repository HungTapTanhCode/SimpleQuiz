const createError = require('http-errors');
const express = require('express');
const fs = require('fs');
const path = require('path');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const quizzesRouter = require('./routes/quizzes');
const questionsRouter = require('./routes/questions');
const authRouter = require('./routes/authenticate');
const usersRouter = require('./routes/users');

const app = express();

// ========================= REQUEST FLOW =========================
// Browser/API request -> Express parser -> route group -> middleware
// (verifyUser/verifyAdmin/verifyAuthor where required) -> controller
// -> Mongoose model -> MongoDB -> JSON response or rendered web page.
// The browser UI calls the same REST API through routes/ui.js using Axios.
// Authentication is shared by Postman and the web UI through a Bearer JWT.

// Database connection: every API/controller operation uses these Mongoose models.
mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
    });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.JWT_SECRET));
// The web UI stores the signed user summary in auth_user for rendering only.
// Authorization never trusts this cookie: protected API requests send auth_token
// as a Bearer token and verifyUser loads the user again from MongoDB.
app.use((req, res, next) => {
    res.locals.currentUser = null;
    if (req.signedCookies.auth_user) {
        try {
            res.locals.currentUser = JSON.parse(req.signedCookies.auth_user);
        } catch (error) {
            res.clearCookie('auth_user');
        }
    }
    next();
});
app.use(express.static(path.join(__dirname, 'public')));
app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'favicon.svg'));
});

// ========================= ROUTE MAP =========================
// Public read API: GET quiz/question routes do not require authentication.
// Protected writes are guarded inside the routers before controllers run.
app.use('/api/quizzes', quizzesRouter);
app.use('/api/questions', questionsRouter);
// Account lifecycle and Admin directory.
app.use('/auth', authRouter);
app.use('/users', usersRouter);
// The React production build is served by Express. During frontend development,
// Vite serves client/ on port 5173 and proxies API requests to this server.
const clientDist = path.join(__dirname, 'client', 'dist');
if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get(/.*/, (req, res, next) => {
        if (!req.accepts('html')) return next();
        return res.sendFile(path.join(clientDist, 'index.html'));
    });
}

// catch 404
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    res.status(err.status || 500);

    res.json({
        error: err.message,
        message: err.message
    });
});

module.exports = app;
