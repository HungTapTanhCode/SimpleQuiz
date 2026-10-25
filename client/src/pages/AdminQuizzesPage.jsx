import { Edit3, Plus, Save, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ErrorAlert from '../components/ErrorAlert';
import { fetchQuestions } from '../features/questions/questionsSlice';
import { createQuiz, deleteQuiz, fetchQuizzes, updateQuiz } from '../features/quizzes/quizzesSlice';

const blank = { title: '', description: '', questions: [] };

export default function AdminQuizzesPage() {
  const dispatch = useDispatch();
  const quizzes = useSelector(state => state.quizzes);
  const questions = useSelector(state => state.questions.items);
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  useEffect(() => { dispatch(fetchQuizzes()); dispatch(fetchQuestions()); }, [dispatch]);
  const toggleQuestion = id => setForm({ ...form, questions: form.questions.includes(id) ? form.questions.filter(value => value !== id) : [...form.questions, id] });
  const submit = async event => { event.preventDefault(); const action = editingId ? updateQuiz({ id: editingId, payload: form }) : createQuiz(form); const result = await dispatch(action); if (!result.error) { setForm(blank); setEditingId(null); } };
  const edit = quiz => { setEditingId(quiz._id); setForm({ title: quiz.title, description: quiz.description, questions: (quiz.questions || []).map(item => item._id || item) }); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return <><div className="page-heading-row"><div><span className="eyebrow">Assessment management</span><h1>Quizzes</h1><p>Create a quiz and choose which questions participants will answer.</p></div></div><ErrorAlert message={quizzes.error} /><div className="management-layout"><form className="editor-panel" onSubmit={submit}><div className="panel-heading"><span><Plus size={18} /></span><div><h2>{editingId ? 'Edit quiz' : 'New quiz'}</h2><p>Assign one or more questions.</p></div></div><label className="form-label">Title</label><input className="form-control" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /><label className="form-label mt-3">Description</label><textarea className="form-control" rows="3" required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /><label className="form-label mt-3">Questions</label><div className="question-picker">{questions.map(question => <label key={question._id}><input type="checkbox" checked={form.questions.includes(question._id)} onChange={() => toggleQuestion(question._id)} /><span>{question.text}<small>{question.options.length} options</small></span></label>)}{!questions.length && <p>Create questions before assigning them.</p>}</div><div className="d-flex gap-2 mt-4"><button className="btn btn-primary"><Save size={16} /> {editingId ? 'Save changes' : 'Create quiz'}</button>{editingId && <button type="button" className="btn btn-outline-secondary" onClick={() => { setEditingId(null); setForm(blank); }}><X size={16} /> Cancel</button>}</div></form><section className="data-panel"><div className="panel-heading"><span>{quizzes.items.length}</span><div><h2>Quiz records</h2><p>Available to signed-in participants.</p></div></div><div className="record-list">{quizzes.items.map(quiz => <article className="record-row" key={quiz._id}><div><h3>{quiz.title}</h3><p>{quiz.questions?.length || 0} questions · {quiz.description}</p></div><div className="record-actions"><button onClick={() => edit(quiz)} title="Edit"><Edit3 size={17} /></button><button className="danger" onClick={() => confirm('Delete this quiz?') && dispatch(deleteQuiz(quiz._id))} title="Delete"><Trash2 size={17} /></button></div></article>)}</div></section></div></>;
}
