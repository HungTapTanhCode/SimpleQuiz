import { CheckCircle2, RotateCcw, Trophy, XCircle } from 'lucide-react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';

export default function QuizResultPage() {
  const { quizId } = useParams();
  const { state } = useLocation();
  if (!state?.quiz) return <Navigate to="/quizzes" replace />;
  const { quiz, answers, score } = state;
  const total = quiz.questions.length;
  const percent = Math.round((score / total) * 100);

  return (
    <div className="result-page">
      <section className="result-hero"><span className="result-icon"><Trophy size={30} /></span><p className="eyebrow">Quiz completed</p><h1>{quiz.title}</h1><div className="score-ring" style={{ '--score': `${percent * 3.6}deg` }}><div><strong>{percent}%</strong><span>{score} / {total} correct</span></div></div><p>{percent >= 80 ? 'Excellent work. You have a strong grasp of this quiz.' : percent >= 50 ? 'Good effort. Review the answers below and try again.' : 'Keep practicing. Every attempt helps you improve.'}</p><div className="d-flex gap-2 justify-content-center"><Link className="btn btn-primary" to={`/quizzes/${quizId}/play`}><RotateCcw size={17} /> Try again</Link><Link className="btn btn-outline-secondary" to="/quizzes">Quiz library</Link></div></section>
      <section className="review-list"><h2>Answer review</h2>{quiz.questions.map((question, index) => { const correct = answers[question._id] === question.correctAnswerIndex; return <article className="review-row" key={question._id}><span className={correct ? 'review-status correct' : 'review-status incorrect'}>{correct ? <CheckCircle2 /> : <XCircle />}</span><div><small>Question {index + 1}</small><h3>{question.text}</h3><p>Your answer: <strong>{question.options[answers[question._id]]}</strong></p>{!correct && <p className="correct-answer">Correct answer: {question.options[question.correctAnswerIndex]}</p>}</div></article>; })}</section>
    </div>
  );
}
