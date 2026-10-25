export default function LoadingState({ label = 'Loading data...' }) {
  return <div className="loading-state"><span className="spinner-border spinner-border-sm" aria-hidden="true" /> {label}</div>;
}
