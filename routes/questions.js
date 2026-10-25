const express = require('express');
const router = express.Router();

const questionController = require('../controllers/questionController');
const { verifyAdmin, verifyUser } = require('../middleware/authenticate');

// ASM04 access policy: Question management belongs to Admin. Ordinary users
// receive questions only through their populated Quiz and cannot call this CRUD
// surface. Every route uses verifyUser -> verifyAdmin.
router.get('/', verifyUser, verifyAdmin, questionController.getAllQuestions);

// GET question by ID
router.get('/:questionId', verifyUser, verifyAdmin, questionController.getQuestionById);

// POST question
router.post('/', verifyUser, verifyAdmin, questionController.createQuestion);

// PUT question
router.put('/:questionId', verifyUser, verifyAdmin, questionController.updateQuestion);

// DELETE question
router.delete('/:questionId', verifyUser, verifyAdmin, questionController.deleteQuestion);

module.exports = router;
