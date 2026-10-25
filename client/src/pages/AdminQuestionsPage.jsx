import { Edit3, Plus, Save, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ErrorAlert from '../components/ErrorAlert';
import LoadingState from '../components/LoadingState';
import { createQuestion, deleteQuestion, fetchQuestions, updateQuestion } from '../features/questions/questionsSlice';

const emptyForm = { text: '', options: '', keywords: '', correctAnswerIndex: 0 };
const payload = form => ({ ...form, options: form.options.split('\n').map(v => v.trim()).filter(Boolean), keywords: form.keywords.split(',').map(v => v.trim()).filter(Boolean), correctAnswerIndex: Number(form.correctAnswerIndex) });

export default function AdminQuestionsPage() {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector(state => state.questions);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  useEffect(() => { dispatch(fetchQuestions()); }, [dispatch]);
  const submit = async event => { event.preventDefault(); const action = editingId ? updateQuestion({ id: editingId, payload: payload(form) }) : createQuestion(payload(form)); const result = await dispatch(action); if (!result.error) { setForm(emptyForm); setEditingId(null); } };
  const edit = item => { setEditingId(item._id); setForm({ text: item.text, options: item.options.join('\n'), keywords: (item.keywords || []).join(', '), correctAnswerIndex: item.correctAnswerIndex }); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return <><div className="page-heading-row"><div><span className="eyebrow">Content management</span><h1>Question bank</h1><p>Create reusable questions and maintain correct answer indexes.</p></div></div><ErrorAlert message={error} /><div className="management-layout"><form className="editor-panel" onSubmit={submit}><div className="panel-heading"><span><Plus size={18} /></span><div><h2>{editingId ? 'Edit question' : 'New question'}</h2><p>Options are entered one per line.</p></div></div><label className="form-label">Question text</label><textarea className="form-control" rows="3" required value={form.text} onChange={e => setForm({ ...form, text: e.target.value })} /><label className="form-label mt-3">Options</label><textarea className="form-control" rows="5" required value={form.options} onChange={e => setForm({ ...form, options: e.target.value })} placeholder={'Paris\nLondon\nBerlin'} /><div className="row mt-3"><div className="col-md-8"><label className="form-label">Keywords</label><input className="form-control" value={form.keywords} onChange={e => setForm({ ...form, keywords: e.target.value })} placeholder="geography, europe" /></div><div className="col-md-4"><label className="form-label">Correct index</label><input className="form-control" type="number" min="0" required value={form.correctAnswerIndex} onChange={e => setForm({ ...form, correctAnswerIndex: e.target.value })} /></div></div><div className="d-flex gap-2 mt-4"><button className="btn btn-primary" disabled={status === 'loading'}><Save size={16} /> {editingId ? 'Save changes' : 'Create question'}</button>{editingId && <button type="button" className="btn btn-outline-secondary" onClick={() => { setEditingId(null); setForm(emptyForm); }}><X size={16} /> Cancel</button>}</div></form><section className="data-panel"><div className="panel-heading"><span>{items.length}</span><div><h2>Questions</h2><p>All records in MongoDB.</p></div></div>{status === 'loading' && !items.length ? <LoadingState /> : <div className="record-list">{items.map(item => <article className="record-row" key={item._id}><div><h3>{item.text}</h3><p>{item.options.length} options · correct answer {item.correctAnswerIndex + 1}</p></div><div className="record-actions"><button onClick={() => edit(item)} title="Edit"><Edit3 size={17} /></button><button className="danger" onClick={() => confirm('Delete this question?') && dispatch(deleteQuestion(item._id))} title="Delete"><Trash2 size={17} /></button></div></article>)}</div>}</section></div></>;
}
