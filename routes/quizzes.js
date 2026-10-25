const express = require('express');
const router = express.Router();

const quizController = require('../controllers/quizController');
const { verifyAdmin, verifyUser } = require('../middleware/authenticate');

// ASM04 access policy: every quiz read requires a signed-in user. Mutations run
// verifyUser -> verifyAdmin, while ordinary users only read and take quizzes.
// GET all quizzes
router.get('/', verifyUser, quizController.getAllQuizzes);

// POST quiz
router.post('/', verifyUser, verifyAdmin, quizController.createQuiz);

// Special route: populate questions containing "capital"
router.get(
    '/:quizId/populate',
    verifyUser,
    quizController.populateCapitalQuestions
);

// Add one question
router.post(
    '/:quizId/question',
    verifyUser,
    verifyAdmin,
    quizController.addQuestionToQuiz
);

// Add many questions
router.post(
    '/:quizId/questions',
    verifyUser,
    verifyAdmin,
    quizController.addManyQuestionsToQuiz
);

// Attach an existing question to a quiz.
router.post(
    '/:quizId/questions/:questionId',
    verifyUser,
    verifyAdmin,
    quizController.addExistingQuestionToQuiz
);

// GET quiz by ID
router.get('/:quizId', verifyUser, quizController.getQuizById);

// PUT quiz
router.put('/:quizId', verifyUser, verifyAdmin, quizController.updateQuiz);

// DELETE quiz
router.delete('/:quizId', verifyUser, verifyAdmin, quizController.deleteQuiz);

module.exports = router;
