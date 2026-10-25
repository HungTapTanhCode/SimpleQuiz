import { ArrowLeft, ArrowRight, CheckCircle2, Send } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ErrorAlert from '../components/ErrorAlert';
import LoadingState from '../components/LoadingState';
import { clearCurrentQuiz, fetchQuiz } from '../features/quizzes/quizzesSlice';

export default function TakeQuizPage() {
  const { quizId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current: quiz, status, error } = useSelector(state => state.quizzes);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});

  useEffect(() => { dispatch(clearCurrentQuiz()); dispatch(fetchQuiz(quizId)); }, [dispatch, quizId]);
  const questions = quiz?.questions || [];
  const answered = Object.keys(answers).length;
  const progress = questions.length ? ((step + 1) / questions.length) * 100 : 0;
  const currentQuestion = questions[step];
  const allAnswered = answered === questions.length;
  const selected = currentQuestion ? answers[currentQuestion._id] : undefined;
  const result = useMemo(() => questions.reduce((score, question) => score + (answers[question._id] === question.correctAnswerIndex ? 1 : 0), 0), [questions, answers]);

  if (status === 'loading' || !quiz) return <LoadingState label="Preparing your quiz..." />;
  if (error) return <ErrorAlert message={error} />;
  if (!questions.length) return <div className="empty-panel"><h2>This quiz has no questions</h2><Link to="/quizzes" className="btn btn-primary">Back to quizzes</Link></div>;

  const submit = () => navigate(`/quizzes/${quizId}/result`, { state: { quiz, answers, score: result } });

  return (
    <div className="take-quiz-shell">
      <div className="quiz-progress-header"><Link to="/quizzes" className="back-link"><ArrowLeft size={17} /> Exit quiz</Link><span>{answered}/{questions.length} answered</span></div>
      <div className="progress thin-progress"><div className="progress-bar" style={{ width: `${progress}%` }} /></div>
      <section className="question-stage">
        <span className="question-count">Question {step + 1} of {questions.length}</span><h1>{currentQuestion.text}</h1>
        <div className="option-list">
          {currentQuestion.options.map((option, index) => (
            <button key={option + index} className={`option-button ${selected === index ? 'selected' : ''}`} onClick={() => setAnswers({ ...answers, [currentQuestion._id]: index })}><span>{String.fromCharCode(65 + index)}</span><strong>{option}</strong>{selected === index && <CheckCircle2 size={20} />}</button>
          ))}
        </div>
      </section>
      <div className="quiz-controls"><button className="btn btn-outline-secondary" disabled={step === 0} onClick={() => setStep(step - 1)}><ArrowLeft size={17} /> Previous</button>{step < questions.length - 1 ? <button className="btn btn-primary" disabled={selected === undefined} onClick={() => setStep(step + 1)}>Next <ArrowRight size={17} /></button> : <button className="btn btn-success" disabled={!allAnswered} onClick={submit}><Send size={17} /> Finish quiz</button>}</div>
    </div>
  );
}
