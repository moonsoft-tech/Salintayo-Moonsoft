import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IonContent, IonIcon, IonPage } from '@ionic/react';
import {
  personCircleOutline,
  bookOutline,
  documentTextOutline,
  homeOutline,
  chatbubbleOutline,
} from 'ionicons/icons';
import './Home.css';

const imgLogo = '/logo.png';

const HomePage: React.FC = () => {
  const location = useLocation();
  const isHome = location.pathname === '/home';

  return (
    <IonPage>
      <IonContent fullscreen className="home-content">
        <div className="home-page">
          <header className="home-header">
            <div className="home-header__brand">
              <img src={imgLogo} alt="SalinTayo" className="home-header__logo" />
              <h1 className="home-header__title">SalinTayo</h1>
            </div>
            <Link to="/profile" className="home-header__profile-link" aria-label="Profile">
              <IonIcon icon={personCircleOutline} className="home-header__profile-icon" />
            </Link>
          </header>

          <section className="home-greeting">
            <h2 className="home-greeting__title">Mabuhay, Juan!</h2>
            <p className="home-greeting__subtitle">Here&apos;s your learning progress today.</p>
          </section>

          <section className="home-progress">
            <div className="home-progress__card">
              <div className="home-progress__content">
                <div className="home-progress__info">
                  <h3 className="home-progress__label">Fluency Level</h3>
                  <p className="home-progress__value">36% Fluent in Cebuano</p>
                  <p className="home-progress__change">+12% this week</p>
                  <div className="home-progress__bar-wrap">
                    <div className="home-progress__bar" role="progressbar" aria-valuenow={36} aria-valuemin={0} aria-valuemax={100}>
                      <div className="home-progress__bar-fill" style={{ width: '36%' }} />
                    </div>
                  </div>
                </div>
                <div className="home-progress__circle-wrap">
                  <svg className="home-progress__circle" viewBox="0 0 100 100">
                    <circle
                      className="home-progress__circle-bg"
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      strokeWidth="8"
                    />
                    <circle
                      className="home-progress__circle-fill"
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      strokeWidth="8"
                      strokeDasharray="264"
                      strokeDashoffset="169"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="home-progress__circle-text">
                    <span className="home-progress__circle-value">36</span>
                    <span className="home-progress__circle-percent">%</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="home-streak">
            <div className="home-streak__card">
              <div className="home-streak__header">
                <div className="home-streak__icon-wrap">
                  <span className="home-streak__icon" role="img" aria-label="Fire">🔥</span>
                </div>
                <div className="home-streak__info">
                  <h3 className="home-streak__title">5 Day Streak!</h3>
                  <p className="home-streak__subtitle">Keep it up! You&apos;re learning every day.</p>
                </div>
              </div>
              <div className="home-streak__days">
                <div className="home-streak__day home-streak__day--completed">
                  <span className="home-streak__day-label">M</span>
                </div>
                <div className="home-streak__day home-streak__day--completed">
                  <span className="home-streak__day-label">T</span>
                </div>
                <div className="home-streak__day home-streak__day--completed">
                  <span className="home-streak__day-label">W</span>
                </div>
                <div className="home-streak__day home-streak__day--completed">
                  <span className="home-streak__day-label">T</span>
                </div>
                <div className="home-streak__day home-streak__day--completed home-streak__day--today">
                  <span className="home-streak__day-label">F</span>
                </div>
                <div className="home-streak__day">
                  <span className="home-streak__day-label">S</span>
                </div>
                <div className="home-streak__day">
                  <span className="home-streak__day-label">S</span>
                </div>
              </div>
            </div>
          </section>

          <section className="home-lessons">
            <h3 className="home-lessons__title">Recent Lessons</h3>
            <div className="home-lessons__carousel">
              <div className="home-lessons__card">
                <div className="home-lessons__card-icon">
                  <span role="img" aria-label="Book">{'📖'}</span>
                </div>
                <h4 className="home-lessons__card-title">Basic Greetings</h4>
                <p className="home-lessons__card-desc">Learn common Filipino greetings</p>
                <span className="home-lessons__card-status">Completed</span>
              </div>
              <div className="home-lessons__card home-lessons__card--active">
                <div className="home-lessons__card-icon">
                  <span role="img" aria-label="Chat">{'💬'}</span>
                </div>
                <h4 className="home-lessons__card-title">Common Phrases</h4>
                <p className="home-lessons__card-desc">Everyday conversations</p>
                <span className="home-lessons__card-status">In Progress</span>
              </div>
              <div className="home-lessons__card">
                <div className="home-lessons__card-icon">
                  <span role="img" aria-label="Speaking">{'🗣️'}</span>
                </div>
                <h4 className="home-lessons__card-title">Pronunciation</h4>
                <p className="home-lessons__card-desc">Master Filipino sounds</p>
                <span className="home-lessons__card-status">Locked</span>
              </div>
            </div>
            <div className="home-lessons__dots">
              <span className="home-lessons__dot" />
              <span className="home-lessons__dot home-lessons__dot--active" />
              <span className="home-lessons__dot" />
            </div>
          </section>

          <section className="home-recommendations">
            <h3 className="home-recommendations__title">SalinTayo Recommends</h3>
            <ul className="home-recommendations__list">
              <li className="home-recommendations__item">
                <span className="home-recommendations__icon" role="img" aria-label="Robot">🤖</span>
                Try the new Ilocano Expert Mode
              </li>
              <li className="home-recommendations__item">
                <span className="home-recommendations__icon" role="img" aria-label="Microphone">🎤</span>
                Record your pronunciation now
              </li>
              <li className="home-recommendations__item">
                <span className="home-recommendations__icon" role="img" aria-label="Chat">💬</span>
                Chat with AI to review yesterday&apos;s words
              </li>
            </ul>
          </section>

          <div className="home-spacer" aria-hidden />
        </div>

        <footer className="home-footer">
          <nav className="home-nav" aria-label="Main">
            <Link to="/learn" className="home-nav__item">
              <IonIcon icon={bookOutline} className="home-nav__icon" />
              <span className="home-nav__label">Learn</span>
            </Link>
            <Link to="/quiz" className="home-nav__item">
              <IonIcon icon={documentTextOutline} className="home-nav__icon" />
              <span className="home-nav__label">Quiz</span>
            </Link>
            <Link to="/home" className={`home-nav__item ${isHome ? 'home-nav__item--active' : ''}`}>
              <IonIcon icon={homeOutline} className="home-nav__icon" />
              <span className="home-nav__label">Home</span>
            </Link>
            <Link to="/chat" className="home-nav__item">
              <IonIcon icon={chatbubbleOutline} className="home-nav__icon" />
              <span className="home-nav__label">Chat</span>
            </Link>
            <Link to="/profile" className="home-nav__item">
              <IonIcon icon={personCircleOutline} className="home-nav__icon" />
              <span className="home-nav__label">Profile</span>
            </Link>
          </nav>
        </footer>
      </IonContent>
    </IonPage>
  );
};

export default HomePage;
