const crypto = require('crypto');
const Question = require('../models/question');
const User = require('../models/user');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET is required in the environment');

// Authentication model used by every protected endpoint:
// register stores a salted hash; login signs a JWT; verifyUser loads req.user;
// verifyAdmin checks req.user.admin; verifyAuthor checks Question.author.

const base64UrlEncode = value => Buffer.from(value).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
const base64UrlDecode = value => Buffer.from(value.replace(/-/g, '+').replace(/_/g, '/'), 'base64');

const signToken = payload => {
    const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const body = base64UrlEncode(JSON.stringify(payload));
    const signature = base64UrlEncode(crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest());
    return `${header}.${body}.${signature}`;
};

const verifyToken = token => {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid token');
    const [header, body, signature] = parts;
    const expected = base64UrlEncode(crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest());
    if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) throw new Error('Invalid token');
    const payload = JSON.parse(base64UrlDecode(body).toString('utf8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) throw new Error('Token expired');
    return payload;
};

const hashPassword = password => {
    const salt = crypto.randomBytes(16).toString('hex');
    return `scrypt$${salt}$${crypto.scryptSync(password, salt, 64).toString('hex')}`;
};

const comparePassword = (password, storedHash) => {
    const [algorithm, salt, storedKey] = storedHash.split('$');
    if (algorithm !== 'scrypt' || !salt || !storedKey) return false;
    const actual = crypto.scryptSync(password, salt, 64);
    const expected = Buffer.from(storedKey, 'hex');
    return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
};

const verifyUser = async (req, res, next) => {
    try {
        const [scheme, token] = (req.headers.authorization || '').split(' ');
        if (scheme !== 'Bearer' || !token) return res.status(401).json({ message: 'Authentication required' });
        // Do not trust role data from the client. Reload the current User record.
        const payload = verifyToken(token);
        const user = await User.findById(payload.userId).select('+passwordHash');
        if (!user) return res.status(401).json({ message: 'User not found' });
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

const verifyAdmin = (req, res, next) => {
    // This middleware follows verifyUser. It is the role gate for Quiz writes
    // and the /users directory. Ordinary Authors stop with status 403.
    if (req.user?.admin === true) return next();
    const error = new Error('You are not authorized to perform this operation!');
    error.status = 403;
    return next(error);
};

const verifyAuthor = async (req, res, next) => {
    try {
        const question = await Question.findById(req.params.questionId);
        if (!question) {
            const error = new Error('Question not found');
            error.status = 404;
            return next(error);
        }
        // Admin is not a bypass: only the account stored in Question.author
        // can update/delete that question.
        if (!question.author || !question.author.equals(req.user._id)) {
            const error = new Error('You are not the author of this question');
            error.status = 403;
            return next(error);
        }
        req.question = question;
        next();
    } catch (error) {
        error.status = 400;
        return next(error);
    }
};

module.exports = { comparePassword, hashPassword, signToken, verifyAdmin, verifyAuthor, verifyUser };
