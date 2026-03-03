import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IonContent, IonIcon, IonPage } from '@ionic/react';
import {
  personCircleOutline,
  createOutline,
  bookOutline,
  documentTextOutline,
  homeOutline,
  chatbubbleOutline,
  statsChartOutline,
  globeOutline,
  settingsOutline,
  notificationsOutline,
  helpCircleOutline,
  logOutOutline,
  checkmarkCircle,
} from 'ionicons/icons';
import './Profile.css';

import NotifModal from './NotifModal';
import EditProfileModal from './EditProfileModal';
import LanguageModal from './LanguageModal';
import HelpModal from './HelpModal';
import LogoutModal from './LogoutModal';

// Firebase
import { auth, db } from '../utils/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const ProfilePage: React.FC = () => {
  const location = useLocation();
  const isProfile = location.pathname === '/profile';

  const [showNotifModal, setShowNotifModal]           = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal]     = useState(false);
  const [showHelpModal, setShowHelpModal]             = useState(false);
  const [showLogoutModal, setShowLogoutModal]         = useState(false);

  // Profile data
  const [displayName, setDisplayName] = useState('Juan Dela Cruz');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [photoSrc, setPhotoSrc]       = useState<string | null>(null);
  
  // Stats
  const [streak, setStreak] = useState(7);
  const [lessons, setLessons] = useState(24);
  const [xpPoints, setXpPoints] = useState(1340);
  const [progress, setProgress] = useState(50);

  // Load profile from Firebase on mount + on auth change
  const loadProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setDisplayName(user.displayName ?? 'Juan Dela Cruz');
    setEmail(user.email ?? '');
    setPhotoSrc(user.photoURL ?? null);

    // Get photo + extras from Firestore
    try {
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) {
        const data = snap.data();
        if (data.displayName) setDisplayName(data.displayName);
        if (data.email) setEmail(data.email);
        if (data.phone) setPhone(data.phone);
        if (data.bio) setBio(data.bio);
        if (data.photoBase64) setPhotoSrc(data.photoBase64);
        if (data.streak) setStreak(data.streak);
        if (data.lessons) setLessons(data.lessons);
        if (data.xpPoints) setXpPoints(data.xpPoints);
        if (data.progress) setProgress(data.progress);
      }
    } catch (e) {
      console.error('Firestore load error:', e);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) loadProfile();
    });
    return () => unsub();
  }, []);

  // Called when EditProfileModal saves — update state directly, no re-fetch needed
  const handleProfileSave = useCallback((data: {
    displayName: string;
    email: string;
    phone: string;
    bio: string;
    photoBase64?: string;
  }) => {
    setDisplayName(data.displayName);
    setEmail(data.email);
    setPhone(data.phone);
    setBio(data.bio);
    if (data.photoBase64) setPhotoSrc(data.photoBase64);
  }, []);

  return (
    <IonPage>
      <IonContent fullscreen className="profile-content">
        <div className="page">

          {/* ═══ HERO BANNER ═══ */}
          <div className="hero">
            <div className="hero-banner"></div>
            
            {/* Wave bottom edge */}
            <svg className="hero-wave" viewBox="0 0 430 40" preserveAspectRatio="none">
              <path d="M0,20 C80,40 180,0 280,20 C350,35 400,10 430,18 L430,40 L0,40 Z" fill="#f4f6fb"/>
            </svg>

            {/* Edit banner button */}
            <button 
              className="hero-edit-btn" 
              title="Edit banner"
              onClick={() => setShowEditProfileModal(true)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>

            {/* Avatar overlapping the banner */}
            <div className="avatar-wrap">
              <div className="avatar-ring">
                {photoSrc ? (
                  <img
                    className="avatar-img"
                    src={photoSrc}
                    alt="User profile photo"
                  />
                ) : (
                  <div className="avatar-fallback">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                    </svg>
                  </div>
                )}
              </div>
              {/* Edit photo badge */}
              <button 
                className="avatar-edit-badge" 
                title="Change photo"
                onClick={() => setShowEditProfileModal(true)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
              </button>
            </div>
          </div>

          {/* ═══ IDENTITY ═══ */}
          <div className="identity">
            <h1 className="identity-name">
              {displayName}
              <span className="verified-badge" title="Verified learner">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </span>
            </h1>
            <p className="identity-sub">
              {email} {phone ? `· ${phone}` : ''}
            </p>
            <div>
              <span className="level-pill">
                <span className="level-dot"></span>
                Learning Cebuano · Intermediate
              </span>
            </div>
          </div>

          {/* ═══ QUICK STATS ═══ */}
          <div className="stats-row">
            <div className="stat-item">
              <div className="stat-value streak">{streak} 🔥</div>
              <div className="stat-label">Day Streak</div>
            </div>
            <div className="stat-item">
              <div className="stat-value lessons">{lessons}</div>
              <div className="stat-label">Lessons</div>
            </div>
            <div className="stat-item">
              <div className="stat-value points">{xpPoints.toLocaleString()}</div>
              <div className="stat-label">XP Points</div>
            </div>
          </div>

          {/* ═══ PROGRESS CARD ═══ */}
          <div className="card">
            <div className="card-head">
              <span className="card-icon blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
              </span>
              <span className="card-title">Progress Overview</span>
            </div>
            <div className="card-body">
              <div className="progress-labels">
                <span>Newbie</span>
                <span>Expert</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" id="prog-fill" style={{ width: `${progress}%` }}></div>
              </div>
              <div className="progress-current">Intermediate — {progress}% to Advanced</div>
            </div>
          </div>

          {/* ═══ BIO CARD ═══ */}
          {bio && (
            <div className="card">
              <div className="card-head">
                <span className="card-icon teal">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </span>
                <span className="card-title">About Me</span>
              </div>
              <div className="card-body">
                <p className="bio-text">{bio}</p>
              </div>
            </div>
          )}

          {/* ═══ PREFERRED DIALECTS ═══ */}
          <div className="card">
            <div className="card-head">
              <span className="card-icon yellow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </span>
              <span className="card-title">Preferred Dialects</span>
            </div>
            <div className="card-body">
              <div className="dialect-tags">
                <span className="dialect-tag">🇵🇭 Tagalog</span>
                <span className="dialect-tag active">🌴 Cebuano</span>
                <span className="dialect-tag">🏝️ Ilokano</span>
              </div>
              <button className="change-btn" onClick={() => setShowLanguageModal(true)}>Change Dialect</button>
            </div>
          </div>

          {/* ═══ ACCOUNT SETTINGS ═══ */}
          <div className="card">
            <div className="card-head">
              <span className="card-icon grey">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              </span>
              <span className="card-title">Account Settings</span>
            </div>
            <ul className="settings-list">
              <li>
                <button className="settings-item" onClick={() => setShowEditProfileModal(true)}>
                  <div className="settings-item-left">
                    <span className="settings-item-icon blue">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    </span>
                    <span className="settings-item-label">Edit Profile</span>
                  </div>
                  <span className="settings-chevron">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </span>
                </button>
              </li>

              <li>
                <button className="settings-item" onClick={() => setShowLanguageModal(true)}>
                  <div className="settings-item-left">
                    <span className="settings-item-icon green">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="2" y1="12" x2="22" y2="12"/>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                      </svg>
                    </span>
                    <span className="settings-item-label">Language & Region</span>
                  </div>
                  <span className="settings-chevron">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </span>
                </button>
              </li>

              <li>
                <button className="settings-item" onClick={() => setShowNotifModal(true)}>
                  <div className="settings-item-left">
                    <span className="settings-item-icon teal">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
                        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
                        <line x1="6" y1="1" x2="6" y2="4"/>
                        <line x1="10" y1="1" x2="10" y2="4"/>
                        <line x1="14" y1="1" x2="14" y2="4"/>
                      </svg>
                    </span>
                    <span className="settings-item-label">Notification Preferences</span>
                  </div>
                  <span className="settings-chevron">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </span>
                </button>
              </li>

              <li>
                <button className="settings-item" onClick={() => setShowHelpModal(true)}>
                  <div className="settings-item-left">
                    <span className="settings-item-icon orange">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                    </span>
                    <span className="settings-item-label">Help Center</span>
                  </div>
                  <span className="settings-chevron">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </span>
                </button>
              </li>

              <li>
                <button className="settings-item" onClick={() => setShowLogoutModal(true)}>
                  <div className="settings-item-left">
                    <span className="settings-item-icon red">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                    </span>
                    <span className="settings-item-label danger">Logout</span>
                  </div>
                  <span className="settings-chevron">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </span>
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Modals */}
        <NotifModal
          isOpen={showNotifModal}
          onClose={() => setShowNotifModal(false)}
        />
        <EditProfileModal
          isOpen={showEditProfileModal}
          onClose={() => setShowEditProfileModal(false)}
          onSave={handleProfileSave}
        />
        <LanguageModal
          isOpen={showLanguageModal}
          onClose={() => setShowLanguageModal(false)}
        />
        <HelpModal
          isOpen={showHelpModal}
          onClose={() => setShowHelpModal(false)}
        />
        <LogoutModal
          isOpen={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
        />

        {/* Ionic Footer - Same as other pages */}
        <footer className="profile-footer">
          <nav className="profile-nav" aria-label="Main">
            <Link to="/learn" className="profile-nav__item">
              <IonIcon icon={bookOutline} className="profile-nav__icon" />
              <span className="profile-nav__label">Learn</span>
            </Link>
            <Link to="/quiz" className="profile-nav__item">
              <IonIcon icon={documentTextOutline} className="profile-nav__icon" />
              <span className="profile-nav__label">Quiz</span>
            </Link>
            <Link to="/home" className="profile-nav__item">
              <IonIcon icon={homeOutline} className="profile-nav__icon" />
              <span className="profile-nav__label">Home</span>
            </Link>
            <Link to="/chat" className={`profile-nav__item ${location.pathname === '/chat' ? 'profile-nav__item--active' : ''}`}>
              <IonIcon icon={chatbubbleOutline} className="profile-nav__icon" />
              <span className="profile-nav__label">Chat</span>
            </Link>
            <Link to="/profile" className={`profile-nav__item ${isProfile ? 'profile-nav__item--active' : ''}`}>
              <IonIcon icon={personCircleOutline} className="profile-nav__icon" />
              <span className="profile-nav__label">Profile</span>
            </Link>
          </nav>
        </footer>
      </IonContent>
    </IonPage>
  );
};

export default ProfilePage;
