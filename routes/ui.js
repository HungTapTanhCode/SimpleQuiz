const express = require('express');
const axios = require('axios');
const https = require('https');

const router = express.Router();
const apiBaseUrl = (process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 3000}/api`).replace(/\/$/, '');
const appBaseUrl = apiBaseUrl.replace(/\/api$/, '');
const axiosOptions = apiBaseUrl.startsWith('https://')
    ? { httpsAgent: new https.Agent({ rejectUnauthorized: false }) }
    : {};
const api = axios.create({ ...axiosOptions, timeout: 8000 });

const authOptions = req => req.cookies?.auth_token
    ? { headers: { Authorization: `Bearer ${req.cookies.auth_token}` } }
    : {};

const setAuthCookies = (res, data) => {
    res.cookie('auth_token', data.token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        maxAge: 24 * 60 * 60 * 1000
    });
    res.cookie('auth_user', JSON.stringify(data.user), {
        httpOnly: true,
        signed: true,
        sameSite: 'lax',
        secure: false,
        maxAge: 24 * 60 * 60 * 1000
    });
};

const requireLogin = (req, res) => {
    if (req.cookies?.auth_token) return true;
    res.redirect(`/login?next=${encodeURIComponent(req.originalUrl)}`);
    return false;
};

const requireAdmin = (req, res) => {
    if (req.cookies?.auth_token && res.locals.currentUser?.admin === true) return true;
    if (!req.cookies?.auth_token) {
        res.redirect(`/login?next=${encodeURIComponent(req.originalUrl)}`);
    } else {
        res.status(403).render('error.ejs', {
            title: 'Admin access required',
            message: 'This action is available to administrators only.',
            error: { status: 403, stack: '' }
        });
    }
    return false;
};

// The browser routes use this Axios client as the integration layer between
// the EJS pages and the Assignment 01 REST API. UI handlers call api.get(),
// api.post(), api.put() and api.delete(), then render or redirect the result.

const splitValues = value => String(value || '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);

const questionPayload = body => ({
    text: String(body.text || '').trim(),
    options: splitValues(body.options),
    keywords: splitValues(body.keywords),
    correctAnswerIndex: Number(body.correctAnswerIndex)
});

const renderError = (res, error, fallback = 'Unable to complete the request.') => {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || error.response?.data?.error || error.message || fallback;
    return res.status(status).render('error.ejs', {
        title: 'Request error',
        message,
        error: { status, stack: '' }
    });
};

router.get('/', (req, res) => res.redirect('/quizzes'));

// Authentication UI
router.get('/login', (req, res) => {
    res.render('auth/login.ejs', {
        title: 'Sign in',
        currentPath: '/login',
        next: req.query.next || '/quizzes',
        registered: req.query.registered === '1',
        loggedOut: req.query.loggedOut === '1'
    });
});

router.post('/login', async (req, res) => {
    try {
        const response = await api.post(`${appBaseUrl}/auth/login`, {
            username: String(req.body.username || '').trim(),
            password: req.body.password
        });
        setAuthCookies(res, response.data);
        res.redirect(req.body.next || '/quizzes');
    } catch (error) {
        const message = error.response?.data?.message || error.response?.data?.error || 'Unable to sign in.';
        res.status(error.response?.status || 500).render('auth/login.ejs', {
            title: 'Sign in', currentPath: '/login', next: req.body.next || '/quizzes',
            registered: false, loggedOut: false, message, username: req.body.username || ''
        });
    }
});

router.get('/register', (req, res) => {
    res.render('auth/register.ejs', {
        title: 'Create account',
        currentPath: '/register'
    });
});

router.post('/register', async (req, res) => {
    try {
        await api.post(`${appBaseUrl}/auth/register`, {
            username: String(req.body.username || '').trim(),
            password: req.body.password,
            admin: req.body.admin === 'on'
        });
        res.redirect('/login?registered=1');
    } catch (error) {
        const message = error.response?.data?.message || error.response?.data?.error || 'Unable to create the account.';
        res.status(error.response?.status || 500).render('auth/register.ejs', {
            title: 'Create account', currentPath: '/register', message,
            username: req.body.username || '', admin: req.body.admin === 'on'
        });
    }
});

router.post('/logout', (req, res) => {
    res.clearCookie('auth_token');
    res.clearCookie('auth_user');
    res.redirect('/login?loggedOut=1');
});

// Admin user directory. The underlying REST endpoint remains GET /users.
router.get('/admin/users', async (req, res) => {
    try {
        if (!requireAdmin(req, res)) return;
        const response = await api.get(`${appBaseUrl}/users`, authOptions(req));
        res.render('admin/users.ejs', {
            title: 'Users', currentPath: '/admin/users', users: response.data
        });
    } catch (error) { renderError(res, error, 'Unable to load users.'); }
});

// Quiz UI
router.get('/quizzes', async (req, res) => {
    try {
        const response = await api.get(`${apiBaseUrl}/quizzes`);
        res.render('quiz/list.ejs', { title: 'Quizzes', quizzes: response.data, currentPath: '/quizzes' });
    } catch (error) { renderError(res, error); }
});

router.get('/quizzes/new', (req, res) => {
    if (!requireAdmin(req, res)) return;
    res.render('quiz/create.ejs', { title: 'Create New Quiz', currentPath: '/quizzes', quiz: {} });
});

router.post('/quizzes', async (req, res) => {
    try {
        if (!requireAdmin(req, res)) return;
        const response = await api.post(`${apiBaseUrl}/quizzes`, {
            title: String(req.body.title || '').trim(),
            description: String(req.body.description || '').trim()
        }, authOptions(req));
        res.redirect(`/quizzes/${response.data._id}?success=${encodeURIComponent('Quiz created successfully.')}`);
    } catch (error) { renderError(res, error); }
});

router.get('/quizzes/:quizId/edit', async (req, res) => {
    try {
        if (!requireAdmin(req, res)) return;
        const response = await api.get(`${apiBaseUrl}/quizzes/${req.params.quizId}`);
        res.render('quiz/edit.ejs', { title: 'Edit Quiz', currentPath: '/quizzes', quiz: response.data });
    } catch (error) { renderError(res, error); }
});

router.put('/quizzes/:quizId', async (req, res) => {
    try {
        if (!requireAdmin(req, res)) return;
        const currentQuiz = await api.get(`${apiBaseUrl}/quizzes/${req.params.quizId}`);
        const questionIds = (currentQuiz.data.questions || []).map(question => question._id || question);
        await api.put(`${apiBaseUrl}/quizzes/${req.params.quizId}`, {
            title: String(req.body.title || '').trim(),
            description: String(req.body.description || '').trim(),
            questions: questionIds
        }, authOptions(req));
        res.redirect(`/quizzes/${req.params.quizId}?success=${encodeURIComponent('Quiz updated successfully.')}`);
    } catch (error) { renderError(res, error); }
});

router.delete('/quizzes/:quizId', async (req, res) => {
    try {
        if (!requireAdmin(req, res)) return;
        await api.delete(`${apiBaseUrl}/quizzes/${req.params.quizId}`, authOptions(req));
        res.redirect(`/quizzes?success=${encodeURIComponent('Quiz deleted successfully.')}`);
    } catch (error) { renderError(res, error); }
});

router.get('/quizzes/:quizId', async (req, res) => {
    try {
        const [quizResponse, questionsResponse] = await Promise.all([
            api.get(`${apiBaseUrl}/quizzes/${req.params.quizId}`),
            api.get(`${apiBaseUrl}/questions`)
        ]);
        res.render('quiz/details.ejs', {
            title: quizResponse.data.title,
            quiz: quizResponse.data,
            allQuestions: questionsResponse.data,
            currentPath: '/quizzes'
        });
    } catch (error) { renderError(res, error); }
});

router.post('/quizzes/:quizId/questions', async (req, res) => {
    try {
        if (!requireAdmin(req, res)) return;
        await api.post(`${apiBaseUrl}/quizzes/${req.params.quizId}/questions/${req.body.questionId}`, null, authOptions(req));
        res.redirect(`/quizzes/${req.params.quizId}?success=${encodeURIComponent('Question added to quiz.')}`);
    } catch (error) { renderError(res, error); }
});

// Question UI
router.get('/questions', async (req, res) => {
    try {
        const response = await api.get(`${apiBaseUrl}/questions`);
        res.render('question/list.ejs', { title: 'Questions', questions: response.data, currentPath: '/questions' });
    } catch (error) { renderError(res, error); }
});

router.get('/questions/new', (req, res) => {
    if (!requireLogin(req, res)) return;
    res.render('question/create.ejs', { title: 'Create New Question', currentPath: '/questions', question: {} });
});

router.post('/questions', async (req, res) => {
    try {
        if (!requireLogin(req, res)) return;
        const response = await api.post(`${apiBaseUrl}/questions`, questionPayload(req.body), authOptions(req));
        res.redirect(`/questions/${response.data._id}?success=${encodeURIComponent('Question created successfully.')}`);
    } catch (error) { renderError(res, error); }
});

router.get('/questions/:questionId/edit', async (req, res) => {
    try {
        if (!requireLogin(req, res)) return;
        const response = await api.get(`${apiBaseUrl}/questions/${req.params.questionId}`);
        res.render('question/edit.ejs', { title: 'Edit Question', currentPath: '/questions', question: response.data });
    } catch (error) { renderError(res, error); }
});

router.put('/questions/:questionId', async (req, res) => {
    try {
        if (!requireLogin(req, res)) return;
        await api.put(`${apiBaseUrl}/questions/${req.params.questionId}`, questionPayload(req.body), authOptions(req));
        res.redirect(`/questions/${req.params.questionId}?success=${encodeURIComponent('Question updated successfully.')}`);
    } catch (error) { renderError(res, error); }
});

router.delete('/questions/:questionId', async (req, res) => {
    try {
        if (!requireLogin(req, res)) return;
        await api.delete(`${apiBaseUrl}/questions/${req.params.questionId}`, authOptions(req));
        res.redirect(`/questions?success=${encodeURIComponent('Question deleted successfully.')}`);
    } catch (error) { renderError(res, error); }
});

router.get('/questions/:questionId', async (req, res) => {
    try {
        const response = await api.get(`${apiBaseUrl}/questions/${req.params.questionId}`);
        res.render('question/details.ejs', { title: 'Question Details', question: response.data, currentPath: '/questions' });
    } catch (error) { renderError(res, error); }
});

module.exports = router;
