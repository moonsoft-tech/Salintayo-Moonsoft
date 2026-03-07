import React, { useState, useEffect, useCallback } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { hasSeenWelcome, setHasSeenWelcome } from '../utils/welcomeStorage';
import './WelcomeSlides.css';

const imgLogo = '/logo.png';

type Experience = 'tourist' | 'local' | null;

const OPTIONS = [
  { icon: '💚', label: 'Filipino reconnecting with roots' },
  { icon: '✈️', label: 'Tourist exploring the Philippines' },
  { icon: '🎓', label: 'Language enthusiast' },
  { icon: '🌐', label: 'Cultural explorer' },
];

const TOURIST_FEATURES = [
  'Quick translations on the go',
  'Essential traveler phrases',
  'Local cultural tips',
];
const LOCAL_FEATURES = [
  'Learn regional dialects',
  'Connect across regions',
  'Deepen cultural roots',
];

// ─── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({ step }: { step: 1 | 2 }) {
  return (
    <div className="ws-progress" aria-label={`Step ${step} of 2`}>
      <div className="ws-progress-bar ws-progress-bar--active" />
      <div className={`ws-progress-bar${step === 2 ? ' ws-progress-bar--active' : ''}`} />
    </div>
  );
}

// ─── Slide 1 ──────────────────────────────────────────────────────────────────
function Slide1({ onNext }: { onNext: () => void }) {
  return (
    <div className="ws-slide ws-animate-in">
      <ProgressBar step={1} />

      <div className="ws-hero">
        <div className="ws-logo-wrap">
          <img src={imgLogo} alt="SalinTayo logo" className="ws-logo" />
          <div className="ws-logo-glow" aria-hidden />
        </div>
        <div className="ws-hero-text">
          <p className="ws-eyebrow">Maligayang pagdating 👋</p>
          <h1 className="ws-title">
            Your Filipino language<br />
            <span className="ws-title-accent">journey starts here</span>
          </h1>
          <p className="ws-subtitle">
            Whether you&apos;re coming home or discovering the Philippines for the first time —
            SalinTayo bridges the gap.
          </p>
        </div>
      </div>

      <p className="ws-section-label">I am a…</p>

      <ul className="ws-options" aria-label="Who are you?">
        {OPTIONS.map((opt, i) => (
          <li
            key={opt.label}
            className="ws-option-item"
            style={{ animationDelay: `${0.14 + i * 0.07}s` }}
          >
            <div className="ws-option-card">
              <span className="ws-option-emoji" aria-hidden>{opt.icon}</span>
              <span className="ws-option-text">{opt.label}</span>
              <span className="ws-option-arrow" aria-hidden>›</span>
            </div>
          </li>
        ))}
      </ul>

      <div className="ws-trust-row">
        <span className="ws-trust-badge">🇵🇭 Made for Filipinos</span>
        <span className="ws-trust-dot" aria-hidden />
        <span className="ws-trust-badge">🔒 Free to use</span>
      </div>

      <button type="button" className="ws-cta" onClick={onNext}>
        Get Started
        <span className="ws-cta-arrow" aria-hidden>→</span>
      </button>
    </div>
  );
}

// ─── Slide 2 ──────────────────────────────────────────────────────────────────
function Slide2({ onContinue }: { onContinue: () => void }) {
  const [selected, setSelected] = useState<Experience>(null);

  return (
    <div className="ws-slide ws-animate-in">
      <ProgressBar step={2} />

      <div className="ws-hero ws-hero--compact">
        <div className="ws-logo-wrap ws-logo-wrap--sm">
          <img src={imgLogo} alt="SalinTayo logo" className="ws-logo ws-logo--sm" />
        </div>
        <div className="ws-hero-text">
          <p className="ws-eyebrow">Almost there ✨</p>
          <h1 className="ws-title">
            How will you use<br />
            <span className="ws-title-accent">SalinTayo?</span>
          </h1>
          <p className="ws-subtitle">
            Pick the experience that fits you best. You can always change this later.
          </p>
        </div>
      </div>

      <div className="ws-exp-cards" role="radiogroup" aria-label="Choose your experience">

        {/* Tourist */}
        <button
          type="button"
          role="radio"
          aria-checked={selected === 'tourist'}
          className={`ws-exp-card${selected === 'tourist' ? ' ws-exp-card--on' : ''}`}
          onClick={() => setSelected('tourist')}
        >
          <div className="ws-exp-card-top">
            <span className="ws-exp-emoji ws-exp-emoji--tourist" aria-hidden>🧳</span>
            <div className="ws-exp-info">
              <span className="ws-exp-tag">Visitor</span>
              <span className="ws-exp-name">Exploring the Philippines</span>
            </div>
            <div className="ws-radio-circle" aria-hidden>
              <div className="ws-radio-dot" />
            </div>
          </div>
          <ul className="ws-feat-list">
            {TOURIST_FEATURES.map((f) => (
              <li key={f}>
                <span className="ws-feat-check" aria-hidden>✓</span>
                {f}
              </li>
            ))}
          </ul>
        </button>

        {/* Local */}
        <button
          type="button"
          role="radio"
          aria-checked={selected === 'local'}
          className={`ws-exp-card${selected === 'local' ? ' ws-exp-card--on' : ''}`}
          onClick={() => setSelected('local')}
        >
          <div className="ws-exp-card-top">
            <span className="ws-exp-emoji ws-exp-emoji--local" aria-hidden>🏠</span>
            <div className="ws-exp-info">
              <span className="ws-exp-tag">Local / Filipino</span>
              <span className="ws-exp-name">Living or knowing the Philippines</span>
            </div>
            <div className="ws-radio-circle" aria-hidden>
              <div className="ws-radio-dot" />
            </div>
          </div>
          <ul className="ws-feat-list">
            {LOCAL_FEATURES.map((f) => (
              <li key={f}>
                <span className="ws-feat-check" aria-hidden>✓</span>
                {f}
              </li>
            ))}
          </ul>
        </button>

      </div>

      <button
        type="button"
        className={`ws-cta${!selected ? ' ws-cta--disabled' : ''}`}
        disabled={!selected}
        onClick={onContinue}
        aria-disabled={!selected}
      >
        {selected ? 'Start my experience' : 'Select an option above'}
        {selected && <span className="ws-cta-arrow" aria-hidden>→</span>}
      </button>

      <p className="ws-signin">
        Already have an account?{' '}
        <Link to="/login" className="ws-signin-link">Sign in</Link>
      </p>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function WelcomeSlides() {
  const history = useHistory();
  const { user } = useAuth();
  const [slide, setSlide] = useState<1 | 2>(1);

  useEffect(() => {
    if (hasSeenWelcome(user?.uid)) {
      history.replace('/home');
    }
  }, [history, user?.uid]);

  const handleContinue = useCallback(() => {
    setHasSeenWelcome(user?.uid);
    history.push('/home');
  }, [history, user?.uid]);

  return (
    // ws-root is a plain block div — NO height/overflow set here.
    // Scrolling is owned by Ionic's ion-content (or the browser body).
    <div className="ws-root">
      <div className="ws-inner">
        {slide === 1
          ? <Slide1 onNext={() => setSlide(2)} />
          : <Slide2 onContinue={handleContinue} />
        }
      </div>
    </div>
  );
}