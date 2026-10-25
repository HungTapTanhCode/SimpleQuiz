const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },

    options: {
        type: [String],
        required: true
    },

    keywords: {
        type: [String],
        default: []
    },

    // Ownership marker. This ObjectId identifies the only account allowed to
    // update/delete the question through the Author middleware.
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    correctAnswerIndex: {
        type: Number,
        required: true,
        min: 0,
        validate: {
            validator(value) {
                const options = this instanceof mongoose.Query ? this.get('options') : this.options;
                return Number.isInteger(value) && Array.isArray(options) && value < options.length;
            },
            message: 'correctAnswerIndex must point to an existing option'
        }
    }
});

module.exports = mongoose.model('Question', questionSchema);
