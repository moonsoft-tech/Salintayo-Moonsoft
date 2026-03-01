import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IonContent, IonIcon, IonPage } from '@ionic/react';
import {
  personCircleOutline,
  bookOutline,
  documentTextOutline,
  homeOutline,
  chatbubbleOutline,
  chevronBackOutline,
  chevronForwardOutline,
} from 'ionicons/icons';
import './Home.css';

const imgLogo = '/logo.png';

// Each lesson has its own progress bar color
const lessons = [
  { id: 0, icon: '📖', title: 'Basic Greetings', desc: 'Learn common Filipino greetings', percent: '100%', progress: 100, color: '#0038a8' }, // Blue
  { id: 1, icon: '💬', title: 'Common Phrases', desc: 'Everyday conversations', percent: '45%', progress: 45, color: '#ce1126' }, // Red
  { id: 2, icon: '🗣️', title: 'Pronunciation', desc: 'Master Filipino sounds', percent: '0%', progress: 0, color: '#009639' }, // Green
];

const HomePage: React.FC = () => {
  const location = useLocation();
  const isHome = location.pathname === '/home';
  const [activeIndex, setActiveIndex] = useState(1);
  const carouselRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);

  const totalCards = lessons.length;
  const cardWidth = 180;
  const cardGap = 12;

  // Create infinite loop carousel: [last, 0, 1, 2, first]
  const getInfiniteCards = () => {
    const lastCard = lessons[totalCards - 1];
    const firstCard = lessons[0];
    return [
      { ...lastCard, isClone: true, originalIndex: totalCards - 1 },
      ...lessons.map((lesson, i) => ({ ...lesson, isClone: false, originalIndex: i })),
      { ...firstCard, isClone: true, originalIndex: 0 },
    ];
  };

  const infiniteCards = getInfiniteCards();

  const scrollToCard = (index: number, smooth = true) => {
    if (carouselRef.current && !isScrolling.current) {
      const carousel = carouselRef.current;
      const centerOffset = (carousel.offsetWidth - cardWidth) / 2;
      const scrollPosition = index * (cardWidth + cardGap) - centerOffset + cardGap / 2;
      carousel.scrollTo({ left: scrollPosition, behavior: smooth ? 'smooth' : 'auto' });
      setActiveIndex(index);
    }
  };

  const handleScroll = () => {
    if (carouselRef.current && !isScrolling.current) {
      const carousel = carouselRef.current;
      const centerOffset = (carousel.offsetWidth - cardWidth) / 2;
      const scrollLeft = carousel.scrollLeft;
      const rawIndex = (scrollLeft - cardGap / 2 + centerOffset) / (cardWidth + cardGap);
      const newActiveIndex = Math.round(rawIndex);

      // Handle infinite scroll boundaries
      if (newActiveIndex === 0) {
        // Scrolled to clone of last card - jump to real last card
        isScrolling.current = true;
        scrollToCard(totalCards, false);
        setTimeout(() => { isScrolling.current = false; }, 50);
      } else if (newActiveIndex === infiniteCards.length - 1) {
        // Scrolled to clone of first card - jump to real first card
        isScrolling.current = true;
        scrollToCard(1, false);
        setTimeout(() => { isScrolling.current = false; }, 50);
      } else {
        // Normal scroll - update active index (subtract 1 because of the leading clone)
        setActiveIndex(newActiveIndex);
      }
    }
  };

  const goToPrev = () => {
    if (isScrolling.current) return;
    const currentRealIndex = activeIndex <= 1 ? totalCards : activeIndex - 1;
    const newIndex = currentRealIndex;
    scrollToCard(newIndex);
  };

  const goToNext = () => {
    if (isScrolling.current) return;
    const currentRealIndex = activeIndex >= totalCards ? 1 : activeIndex + 1;
    const newIndex = currentRealIndex;
    scrollToCard(newIndex);
  };

  useEffect(() => {
    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener('scroll', handleScroll);
      // Initial scroll to center card
      setTimeout(() => scrollToCard(1, false), 100);
      return () => carousel.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Get the actual active index for display (1, 2, or 3)
  const getDisplayIndex = () => {
    if (activeIndex <= 0) return totalCards - 1;
    if (activeIndex > totalCards) return 0;
    return activeIndex - 1;
  };

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
                    <circle className="home-progress__circle-bg" cx="50" cy="50" r="42" fill="none" strokeWidth="8" />
                    <circle className="home-progress__circle-fill" cx="50" cy="50" r="42" fill="none" strokeWidth="8" strokeDasharray="264" strokeDashoffset="169" strokeLinecap="round" />
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
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                  <div key={i} className={`home-streak__day ${i < 5 ? 'home-streak__day--completed' : ''} ${i === 4 ? 'home-streak__day--today' : ''}`}>
                    <span className="home-streak__day-label">{day}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="home-lessons">
            <h3 className="home-lessons__title">Recent Lessons</h3>
            <div className="home-lessons__carousel-wrapper">
              <button className="home-lessons__nav home-lessons__nav--prev" onClick={goToPrev} aria-label="Previous">
                <IonIcon icon={chevronBackOutline} />
              </button>
              <div className="home-lessons__carousel" ref={carouselRef}>
                {infiniteCards.map((lesson, index) => (
                  <div
                    key={`${lesson.id}-${index}`}
                    className={`home-lessons__card ${!lesson.isClone && activeIndex === lesson.originalIndex + 1 ? 'home-lessons__card--center' : ''}`}
                    onClick={() => !lesson.isClone && scrollToCard(lesson.originalIndex + 1)}
                  >
                    <div className="home-lessons__card-header">
                      <div className="home-lessons__card-icon">
                        <span role="img" aria-label={lesson.title}>{lesson.icon}</span>
                      </div>
                      <span className="home-lessons__card-percent">{lesson.percent}</span>
                    </div>
                    <h4 className="home-lessons__card-title">{lesson.title}</h4>
                    <p className="home-lessons__card-desc">{lesson.desc}</p>
                    <div className="home-lessons__card-progress">
                      <div className="home-lessons__progress-bar">
                        <div 
                          className="home-lessons__progress-fill" 
                          style={{ width: `${lesson.progress}%`, backgroundColor: lesson.color }} 
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="home-lessons__nav home-lessons__nav--next" onClick={goToNext} aria-label="Next">
                <IonIcon icon={chevronForwardOutline} />
              </button>
            </div>
            <div className="home-lessons__dots">
              {lessons.map((_, index) => (
                <span
                  key={index}
                  className={`home-lessons__dot ${getDisplayIndex() === index ? 'home-lessons__dot--active' : ''}`}
                  onClick={() => scrollToCard(index + 1)}
                />
              ))}
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
