import React, { useState } from 'react';
import { IonIcon } from '@ionic/react';
import { notificationsOutline, closeOutline } from 'ionicons/icons';
import './NotifModal.css';

// ── Types ────────────────────────────────────────────────────
interface NotifPrefs {
  dailyReminders: boolean;
  weeklyReports: boolean;
  featureAnnouncements: boolean;
}

interface NotifModalProps {
  /** Whether the modal is visible */
  isOpen: boolean;
  /** Called when user taps Done or the backdrop */
  onClose: () => void;
}

// ── Component ─────────────────────────────────────────────────
const NotifModal: React.FC<NotifModalProps> = ({ isOpen, onClose }) => {
  // Default state matches Figma: first two ON, third OFF
  const [prefs, setPrefs] = useState<NotifPrefs>({
    dailyReminders: true,
    weeklyReports: true,
    featureAnnouncements: false,
  });

  const toggle = (key: keyof NotifPrefs) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDone = () => {
    // TODO: persist prefs (e.g. localStorage, Capacitor Preferences, or API call)
    // Example: localStorage.setItem('notifPrefs', JSON.stringify(prefs));
    onClose();
  };

  // Don't render at all when closed (keeps DOM clean)
  if (!isOpen) return null;

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        className="notif-backdrop"
        aria-hidden
        onClick={onClose}
      />

      {/* ── Bottom Sheet ── */}
      <div
        className="notif-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notif-title"
      >
        {/* Drag handle */}
        <div className="notif-handle" aria-hidden />

        {/* Header */}
        <div className="notif-header">
          <div className="notif-header__left">
            <IonIcon icon={notificationsOutline} className="notif-header__icon" aria-hidden />
            <h2 className="notif-header__title" id="notif-title">
              Notification Preferences
            </h2>
          </div>
          <button
            type="button"
            className="notif-close-btn"
            aria-label="Close notification preferences"
            onClick={onClose}
          >
            <IonIcon icon={closeOutline} />
          </button>
        </div>

        {/* Body */}
        <div className="notif-body">
          <p className="notif-description">
            Manage how SalinTayo notifies you.
          </p>

          {/* Toggle: Daily Learning Reminders */}
          <div className="notif-toggle-row">
            <span className="notif-toggle-label">Daily Learning Reminders</span>
            <button
              type="button"
              role="switch"
              aria-checked={prefs.dailyReminders}
              aria-label="Daily Learning Reminders"
              className={`notif-toggle ${prefs.dailyReminders ? 'notif-toggle--on' : 'notif-toggle--off'}`}
              onClick={() => toggle('dailyReminders')}
            >
              <span className="notif-toggle__thumb" />
            </button>
          </div>

          {/* Toggle: Weekly Progress Reports */}
          <div className="notif-toggle-row">
            <span className="notif-toggle-label">Weekly Progress Reports</span>
            <button
              type="button"
              role="switch"
              aria-checked={prefs.weeklyReports}
              aria-label="Weekly Progress Reports"
              className={`notif-toggle ${prefs.weeklyReports ? 'notif-toggle--on' : 'notif-toggle--off'}`}
              onClick={() => toggle('weeklyReports')}
            >
              <span className="notif-toggle__thumb" />
            </button>
          </div>

          {/* Toggle: New Feature Announcements */}
          <div className="notif-toggle-row notif-toggle-row--last">
            <span className="notif-toggle-label">New Feature Announcements</span>
            <button
              type="button"
              role="switch"
              aria-checked={prefs.featureAnnouncements}
              aria-label="New Feature Announcements"
              className={`notif-toggle ${prefs.featureAnnouncements ? 'notif-toggle--on' : 'notif-toggle--off'}`}
              onClick={() => toggle('featureAnnouncements')}
            >
              <span className="notif-toggle__thumb" />
            </button>
          </div>

          {/* Done button */}
          <button
            type="button"
            className="notif-done-btn"
            onClick={handleDone}
          >
            Done
          </button>
        </div>
      </div>
    </>
  );
};

export default NotifModal;
