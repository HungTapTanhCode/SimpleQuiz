const User = require('../models/user');
const { comparePassword, hashPassword, signToken } = require('../middleware/authenticate');

const register = async (req, res) => {
    try {
        // The browser checkbox sends "on"; Postman may send true or "true".
        // No checkbox means Author (admin=false).
        const { username = '', password, admin = false } = req.body;
        if (!String(username).trim()) return res.status(400).json({ message: 'Username is required' });
        if (typeof password !== 'string' || password.length < 6) return res.status(400).json({ message: 'Password must contain at least 6 characters' });
        const isAdmin = admin === true || admin === 'true' || admin === 'on';
        const existingUser = await User.findOne({ username: String(username).trim() });
        if (existingUser) return res.status(409).json({ message: 'Username is already registered' });
        const user = await User.create({ username: String(username).trim(), passwordHash: hashPassword(password), admin: isAdmin });
        return res.status(201).json({ message: 'User registered successfully', user: { id: user._id, username: user.username, admin: user.admin } });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { username = '', password } = req.body;
        const user = await User.findOne({ username }).select('+passwordHash');
        if (!user || typeof password !== 'string' || !comparePassword(password, user.passwordHash)) return res.status(401).json({ message: 'Invalid username or password' });
        // The JWT carries identity. verifyUser reloads the database user so
        // current role data is used on every protected request.
        const token = signToken({ userId: user._id.toString(), exp: Math.floor(Date.now() / 1000) + 86400 });
        return res.status(200).json({ token, user: { id: user._id, username: user.username, admin: user.admin } });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = { login, register };
