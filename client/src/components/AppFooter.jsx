import { AtSign, Globe2, Mail, MapPin, MessageCircle, ShieldCheck } from 'lucide-react';

const go = url => {
  if (url.startsWith('/')) window.location.assign(url);
  else window.open(url, '_blank', 'noopener,noreferrer');
};

export default function AppFooter() {
  return (
    <footer className="app-footer">
      <div className="app-footer-inner">
        <div className="footer-brand-block">
          <div className="footer-brand"><span className="footer-brand-mark">Q</span><strong>SimpleQuiz</strong></div>
          <p>Focused quiz experiences for curious learners and the teams who create them.</p>
          <span className="footer-trust"><ShieldCheck size={15} /> Secure learning workspace</span>
        </div>
        <div className="footer-links">
          <strong>Workspace</strong>
          <button onClick={() => go('/quizzes')}>Quiz library</button>
          <button onClick={() => go('/login')}>Sign in</button>
          <button onClick={() => go('/signup')}>Create account</button>
        </div>
        <div className="footer-links">
          <strong>Support</strong>
          <button onClick={() => go('mailto:support@simplequiz.example')}>Contact support</button>
          <button onClick={() => go('mailto:hello@simplequiz.example')}>Become a creator</button>
          <button onClick={() => go('https://example.com/privacy')}>Privacy & terms</button>
        </div>
        <div className="footer-contact">
          <strong>Stay connected</strong>
          <span><MapPin size={15} /> Ho Chi Minh City, Vietnam</span>
          <span><Mail size={15} /> hello@simplequiz.example</span>
          <div className="footer-socials"><button onClick={() => go('https://example.com/community')} aria-label="Community"><Globe2 size={16} /></button><button onClick={() => go('mailto:hello@simplequiz.example')} aria-label="Email"><AtSign size={16} /></button><button onClick={() => go('mailto:hello@simplequiz.example')} aria-label="Contact"><MessageCircle size={16} /></button></div>
        </div>
      </div>
      <div className="footer-bottom"><span>© 2026 SimpleQuiz. Built for better learning.</span><span className="footer-status">● All systems operational</span></div>
    </footer>
  );
}
