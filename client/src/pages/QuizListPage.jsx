import { ArrowRight, BookOpen, Clock3, ListChecks } from 'lucide-react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import ErrorAlert from '../components/ErrorAlert';
import LoadingState from '../components/LoadingState';
import { fetchQuizzes } from '../features/quizzes/quizzesSlice';

export default function QuizListPage() {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector(state => state.quizzes);
  const user = useSelector(state => state.auth.user);
  useEffect(() => { dispatch(fetchQuizzes()); }, [dispatch]);

  return (
    <>
      <div className="page-heading-row"><div><span className="eyebrow">Quiz library</span><h1>{user.admin ? 'Quiz management' : 'Ready for your next quiz?'}</h1><p>{user.admin ? 'Review published quizzes and their question coverage.' : 'Choose a quiz, answer every question, and see your result instantly.'}</p></div>{user.admin && <Link className="btn btn-primary" to="/admin/quizzes">Manage quizzes</Link>}</div>
      <ErrorAlert message={error} />
      {status === 'loading' && !items.length ? <LoadingState label="Loading quizzes..." /> : (
        <div className="quiz-grid">
          {items.map((quiz, index) => (
            <article className="quiz-card" key={quiz._id}>
              <div className="quiz-card-top"><span className="quiz-index">{String(index + 1).padStart(2, '0')}</span><BookOpen size={21} /></div>
              <h2>{quiz.title}</h2><p>{quiz.description}</p>
              <div className="quiz-meta"><span><ListChecks size={15} /> {quiz.questions?.length || 0} questions</span><span><Clock3 size={15} /> ~{Math.max(2, (quiz.questions?.length || 0) * 1)} min</span></div>
              {quiz.questions?.length ? <Link className="quiz-action" to={`/quizzes/${quiz._id}/play`}>{user.admin ? 'Preview quiz' : 'Start quiz'} <ArrowRight size={17} /></Link> : <span className="quiz-action disabled">No questions assigned</span>}
            </article>
          ))}
          {!items.length && status !== 'loading' && <div className="empty-panel"><BookOpen size={30} /><h2>No quizzes available</h2><p>An administrator needs to create a quiz and assign questions first.</p></div>}
        </div>
      )}
    </>
  );
}
