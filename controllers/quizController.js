const Quiz = require('../models/quiz');
const Question = require('../models/question');


// GET /quizzes
const getAllQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find()
            .populate('questions');

        res.status(200).json(quizzes);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};


// GET /quizzes/:quizId
const getQuizById = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.quizId)
            .populate('questions');

        if (!quiz) {
            return res.status(404).json({
                message: 'Quiz not found'
            });
        }

        res.status(200).json(quiz);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};


// POST /quizzes
const createQuiz = async (req, res) => {
    try {
        const quiz = new Quiz({
            title: req.body.title,
            description: req.body.description,
            questions: req.body.questions || []
        });

        const savedQuiz = await quiz.save();

        res.status(201).json(savedQuiz);
    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
};


// PUT /quizzes/:quizId
const updateQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findByIdAndUpdate(
            req.params.quizId,
            {
                title: req.body.title,
                description: req.body.description,
                questions: req.body.questions
            },
            {
                returnDocument: 'after',
                runValidators: true
            }
        ).populate('questions');

        if (!quiz) {
            return res.status(404).json({
                message: 'Quiz not found'
            });
        }

        res.status(200).json(quiz);
    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
};


// DELETE /quizzes/:quizId
const deleteQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findByIdAndDelete(
            req.params.quizId
        );

        if (!quiz) {
            return res.status(404).json({
                message: 'Quiz not found'
            });
        }

        res.status(200).json({
            message: 'Quiz deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};


// GET /quizzes/:quizId/populate
const populateCapitalQuestions = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.quizId)
            .populate({
                path: 'questions',
                match: {
                    $or: [
                        {
                            text: {
                                $regex: 'capital',
                                $options: 'i'
                            }
                        },
                        {
                            keywords: {
                                $regex: 'capital',
                                $options: 'i'
                            }
                        }
                    ]
                }
            });

        if (!quiz) {
            return res.status(404).json({
                message: 'Quiz not found'
            });
        }

        res.status(200).json(quiz);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};


// POST /quizzes/:quizId/question
const addQuestionToQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.quizId);

        if (!quiz) {
            return res.status(404).json({
                message: 'Quiz not found'
            });
        }

        const list = value => Array.isArray(value) ? value : String(value || '').split(',').map(item => item.trim()).filter(Boolean);
        const question = new Question({
            text: String(req.body.text || '').trim(),
            options: list(req.body.options),
            keywords: list(req.body.keywords),
            correctAnswerIndex: Number(req.body.correctAnswerIndex),
            author: req.user._id
        });

        const savedQuestion = await question.save();

        quiz.questions.push(savedQuestion._id);

        await quiz.save();

        const updatedQuiz = await Quiz.findById(quiz._id)
            .populate('questions');

        res.status(201).json(updatedQuiz);
    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
};


// POST /quizzes/:quizId/questions
const addManyQuestionsToQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.quizId);

        if (!quiz) {
            return res.status(404).json({
                message: 'Quiz not found'
            });
        }

        const questionsData = req.body.questions;

        if (!Array.isArray(questionsData)) {
            return res.status(400).json({
                message: 'questions must be an array'
            });
        }

        const questions = await Question.insertMany(questionsData.map(question => ({
            ...question,
            author: req.user._id
        })));

        const questionIds = questions.map(
            question => question._id
        );

        quiz.questions.push(...questionIds);

        await quiz.save();

        res.status(200).json({
            message: 'Questions added successfully.'
        });
    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
};

// POST /quizzes/:quizId/questions/:questionId
const addExistingQuestionToQuiz = async (req, res) => {
    try {
        const [quiz, question] = await Promise.all([
            Quiz.findById(req.params.quizId),
            Question.findById(req.params.questionId)
        ]);

        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
        if (!question) return res.status(404).json({ message: 'Question not found' });

        if (!quiz.questions.some(id => id.equals(question._id))) {
            quiz.questions.push(question._id);
            await quiz.save();
        }

        const updatedQuiz = await Quiz.findById(quiz._id).populate('questions');
        res.status(200).json(updatedQuiz);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


module.exports = {
    getAllQuizzes,
    getQuizById,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    populateCapitalQuestions,
    addQuestionToQuiz,
    addManyQuestionsToQuiz,
    addExistingQuestionToQuiz
};
