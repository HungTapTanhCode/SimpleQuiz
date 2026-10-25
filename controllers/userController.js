const User = require('../models/user');

const getAllUsers = async (req, res) => {
    try {
        return res.status(200).json(await User.find().select('-passwordHash'));
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = { getAllUsers };
