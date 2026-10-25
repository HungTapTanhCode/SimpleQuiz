const Question = require('../models/question');
const Quiz = require('../models/quiz');

const asArray = value => {
    if (Array.isArray(value)) return value.filter(item => String(item).trim()).map(item => String(item).trim());
    return String(value || '').split(',').map(item => item.trim()).filter(Boolean);
};

const questionData = (body, author) => ({
    text: String(body.text || '').trim(),
    options: asArray(body.options),
    keywords: asArray(body.keywords),
    correctAnswerIndex: Number(body.correctAnswerIndex),
    // author is supplied by the authenticated request, never by the form.
    ...(author ? { author } : {})
});

// GET /question
const getAllQuestions = async (req, res) => {
    try {
        const questions = await Question.find();

        res.status(200).json(questions);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};


// GET /question/:questionId
const getQuestionById = async (req, res) => {
    try {
        const question = await Question.findById(req.params.questionId);

        if (!question) {
            return res.status(404).json({
                message: 'Question not found'
            });
        }

        res.status(200).json(question);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};


// POST /question
const createQuestion = async (req, res) => {
    try {
        // Stamp ownership when a new Question is created.
        const question = new Question(questionData(req.body, req.user._id));

        const savedQuestion = await question.save();

        res.status(201).json(savedQuestion);
    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
};


// PUT /question/:questionId
const updateQuestion = async (req, res) => {
    try {
        // ASM04 Question CRUD is Admin-only at the route layer.
        const question = await Question.findByIdAndUpdate(
            req.params.questionId,
            questionData(req.body),
            {
                returnDocument: 'after',
                runValidators: true
            }
        );

        if (!question) {
            return res.status(404).json({
                message: 'Question not found'
            });
        }

        res.status(200).json(question);
    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
};


// DELETE /question/:questionId
const deleteQuestion = async (req, res) => {
    try {
        const question = await Question.findByIdAndDelete(req.params.questionId);

        if (!question) {
            return res.status(404).json({
                message: 'Question not found'
            });
        }

        // Remove question ID from quizzes
        await Quiz.updateMany(
            { questions: req.params.questionId },
            { $pull: { questions: req.params.questionId } }
        );

        res.status(200).json({
            message: 'Question deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};


module.exports = {
    getAllQuestions,
    getQuestionById,
    createQuestion,
    updateQuestion,
    deleteQuestion
};
