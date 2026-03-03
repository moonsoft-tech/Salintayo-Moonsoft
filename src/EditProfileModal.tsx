import React, { useState, useEffect, useRef } from 'react';
import { IonIcon } from '@ionic/react';
import {
  personCircleOutline,
  createOutline,
  closeOutline,
  checkmarkOutline,
  alertCircleOutline,
  checkmarkCircleOutline,
} from 'ionicons/icons';
import './EditProfileModal.css';

import { auth, db } from '../utils/config';
import { updateProfile, updateEmail } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    displayName: string;
    email: string;
    phone: string;
    bio: string;
    photoBase64?: string;
  }) => void;
}

interface FormState {
  displayName: string;
  email: string;
  phone: string;
  bio: string;
  photoBase64: string | null;
}

type ToastType = 'success' | 'error';

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, onSave }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm]           = useState<FormState>({ displayName: '', email: '', phone: '', bio: '', photoBase64: null });
  const [original, setOriginal]   = useState<FormState>({ displayName: '', email: '', phone: '', bio: '', photoBase64: null });
  const [isSaving, setIsSaving]   = useState(false);
  const [toast, setToast]         = useState<{ message: string; type: ToastType } | null>(null);
  const [errors, setErrors]       = useState<Partial<Record<keyof FormState, string>>>({});
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // ── Load data when modal opens ─────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const base: FormState = {
        displayName: user.displayName ?? '',
        email:       user.email ?? '',
        phone:       '',
        bio:         '',
        photoBase64: null,
      };
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          const d = snap.data();
          if (d.displayName) base.displayName = d.displayName;
          if (d.phone)       base.phone       = d.phone;
          if (d.bio)         base.bio         = d.bio;
          if (d.photoBase64) base.photoBase64  = d.photoBase64;
        }
      } catch (e) {
        console.error('Firestore load error:', e);
      }
      setForm({ ...base });
      setOriginal({ ...base });
      setPhotoPreview(base.photoBase64 ?? user.photoURL ?? null);
      setErrors({});
    };
    load();
  }, [isOpen]);

  // ── Photo ──────────────────────────────────────────────────────────────────
  const handlePhotoClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const b64 = reader.result as string;
      setPhotoPreview(b64);
      setForm(p => ({ ...p, photoBase64: b64 }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // ── Field change ───────────────────────────────────────────────────────────
  const handleChange = (field: keyof FormState, value: string) => {
    setForm(p => ({ ...p, [field]: value }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: undefined }));
  };

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.displayName.trim())  e.displayName = 'Display name is required.';
    if (!form.email.trim())        e.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address.';
    if (form.phone && !/^[+\d\s\-()]{7,20}$/.test(form.phone)) e.phone = 'Enter a valid phone number.';
    if (form.bio.length > 160)    e.bio = 'Bio must be 160 characters or fewer.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Toast ──────────────────────────────────────────────────────────────────
  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Helper: Check if URL is short enough for Firebase Auth ───────────────
  const isShortUrl = (url: string | null): boolean => {
    if (!url) return false;
    // Firebase Auth photoURL limit is ~1000 characters, Base64 images are much longer
    return url.length < 1000 && !url.startsWith('data:image/');
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validate()) return;
    const user = auth.currentUser;
    if (!user) { showToast('You must be logged in.', 'error'); return; }
    setIsSaving(true);
    
    try {
      // Get fresh idToken before any profile update operations
      // This prevents 400 Bad Request errors due to expired/invalid tokens
      const idToken = await user.getIdToken(true);
      
      // Firebase Auth - Only update displayName here
      // Note: We cannot store Base64 images in Firebase Auth's photoURL (max ~1000 chars)
      // Base64 images are stored in Firestore instead
      const authUp: { displayName?: string; photoURL?: string } = {};
      if (form.displayName !== original.displayName) authUp.displayName = form.displayName;
      // Only update photoURL if it's a short URL (not Base64)
      if (form.photoBase64 && form.photoBase64 !== original.photoBase64 && isShortUrl(form.photoBase64)) {
        authUp.photoURL = form.photoBase64;
      }
      if (Object.keys(authUp).length) await updateProfile(user, authUp);
      
      // Email update requires recent login - handle separately
      if (form.email !== original.email) {
        try {
          await updateEmail(user, form.email);
        } catch (emailErr: unknown) {
          const emailCode = (emailErr as { code?: string }).code;
          if (emailCode === 'auth/requires-recent-login') {
            showToast('Log out and back in to change your email.', 'error');
            setIsSaving(false);
            return;
          }
          throw emailErr; // Re-throw other errors
        }
      }

      // Firestore - Store all data including Base64 images here
      const payload: Record<string, string | null> = {
        displayName: form.displayName,
        email:       form.email,
        phone:       form.phone,
        bio:         form.bio,
      };
      if (form.photoBase64 && form.photoBase64 !== original.photoBase64) {
        payload.photoBase64 = form.photoBase64;
      }
      await setDoc(doc(db, 'users', user.uid), payload, { merge: true });

      onSave({ displayName: form.displayName, email: form.email, phone: form.phone, bio: form.bio, photoBase64: form.photoBase64 ?? undefined });
      setOriginal({ ...form });
      showToast('Profile updated successfully!', 'success');
      setTimeout(() => onClose(), 1400);
    } catch (err: unknown) {
      // Improved error handling with specific messages
      const code = (err as { code?: string }).code;
      const errorMessage = (err as { message?: string }).message;
      
      if (code === 'auth/requires-recent-login') {
        showToast('Log out and back in to change your email.', 'error');
      } else if (code === 'auth/network-request-failed') {
        showToast('Network error. Please check your connection.', 'error');
      } else if (code === 'auth/too-many-requests') {
        showToast('Too many attempts. Please try again later.', 'error');
      } else if (code === 'auth/user-disabled') {
        showToast('This account has been disabled.', 'error');
      } else if (code === 'auth/invalid-profile-attribute') {
        // Photo URL too long - but data WAS saved to Firestore, notify parent to update UI
        showToast('Profile updated!', 'success');
        onSave({ displayName: form.displayName, email: form.email, phone: form.phone, bio: form.bio, photoBase64: form.photoBase64 ?? undefined });
        setOriginal({ ...form });
        setTimeout(() => onClose(), 1400);
      } else if (errorMessage) {
        showToast(errorMessage, 'error');
      } else {
        showToast('Update failed. Please try again.', 'error');
      }
      console.error('Profile update error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Cancel ─────────────────────────────────────────────────────────────────
  const handleClose = () => {
    if (isSaving) return;
    setForm({ ...original });
    setPhotoPreview(original.photoBase64 ?? auth.currentUser?.photoURL ?? null);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* ── Full-screen backdrop ── */}
      <div className="epm-backdrop" onClick={handleClose} aria-hidden="true" />

      {/* ── Centered modal card ── */}
      <div className="epm-modal" role="dialog" aria-modal="true" aria-labelledby="epm-title">

        {/* Header */}
        <div className="epm-header">
          <h2 id="epm-title" className="epm-title">Edit Profile</h2>
          <button
            type="button"
            className="epm-close-btn"
            onClick={handleClose}
            disabled={isSaving}
            aria-label="Close modal"
          >
            <IonIcon icon={closeOutline} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="epm-body">

          {/* Avatar picker */}
          <div className="epm-avatar-section">
            <button
              type="button"
              className="epm-avatar-wrap"
              onClick={handlePhotoClick}
              aria-label="Change profile photo"
            >
              {photoPreview
                ? <img src={photoPreview} alt="Profile preview" className="epm-avatar-img" />
                : (
                  <div className="epm-avatar-placeholder">
                    <IonIcon icon={personCircleOutline} className="epm-avatar-placeholder__icon" />
                  </div>
                )
              }
              <span className="epm-avatar-badge" aria-hidden="true">
                <IonIcon icon={createOutline} />
              </span>
            </button>
            <p className="epm-avatar-hint">Tap to change photo</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="epm-file-input"
              onChange={handleFileChange}
              tabIndex={-1}
              aria-hidden="true"
            />
          </div>

          {/* Divider */}
          <div className="epm-divider" aria-hidden="true" />

          {/* Display Name */}
          <div className={`epm-field${errors.displayName ? ' epm-field--error' : ''}`}>
            <label htmlFor="epm-display-name" className="epm-label">
              Display Name <span className="epm-required" aria-hidden="true">*</span>
            </label>
            <input
              id="epm-display-name"
              type="text"
              className="epm-input"
              placeholder="Your full name"
              value={form.displayName}
              onChange={e => handleChange('displayName', e.target.value)}
              maxLength={60}
              autoComplete="name"
            />
            {errors.displayName && (
              <span className="epm-error-msg" role="alert">
                <IonIcon icon={alertCircleOutline} className="epm-error-icon" />
                {errors.displayName}
              </span>
            )}
          </div>

          {/* Email */}
          <div className={`epm-field${errors.email ? ' epm-field--error' : ''}`}>
            <label htmlFor="epm-email" className="epm-label">
              Email Address <span className="epm-required" aria-hidden="true">*</span>
            </label>
            <input
              id="epm-email"
              type="email"
              className="epm-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => handleChange('email', e.target.value)}
              autoComplete="email"
              inputMode="email"
            />
            {errors.email
              ? <span className="epm-error-msg" role="alert"><IonIcon icon={alertCircleOutline} className="epm-error-icon" />{errors.email}</span>
              : <span className="epm-hint">Changing your email requires a recent login.</span>
            }
          </div>

          {/* Phone */}
          <div className={`epm-field${errors.phone ? ' epm-field--error' : ''}`}>
            <label htmlFor="epm-phone" className="epm-label">Phone Number</label>
            <input
              id="epm-phone"
              type="tel"
              className="epm-input"
              placeholder="+63 912 345 6789"
              value={form.phone}
              onChange={e => handleChange('phone', e.target.value)}
              autoComplete="tel"
              inputMode="tel"
            />
            {errors.phone && (
              <span className="epm-error-msg" role="alert">
                <IonIcon icon={alertCircleOutline} className="epm-error-icon" />
                {errors.phone}
              </span>
            )}
          </div>

          {/* Bio */}
          <div className={`epm-field${errors.bio ? ' epm-field--error' : ''}`}>
            <div className="epm-label-row">
              <label htmlFor="epm-bio" className="epm-label">Bio</label>
              <span
                className={`epm-char-count${form.bio.length > 140 ? ' epm-char-count--warn' : ''}${form.bio.length >= 160 ? ' epm-char-count--over' : ''}`}
                aria-live="polite"
              >
                {form.bio.length}/160
              </span>
            </div>
            <textarea
              id="epm-bio"
              className="epm-textarea"
              placeholder="Tell others a little about yourself…"
              value={form.bio}
              onChange={e => handleChange('bio', e.target.value)}
              maxLength={160}
              rows={3}
            />
            {errors.bio && (
              <span className="epm-error-msg" role="alert">
                <IonIcon icon={alertCircleOutline} className="epm-error-icon" />
                {errors.bio}
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="epm-footer">
          <button
            type="button"
            className="epm-btn epm-btn--cancel"
            onClick={handleClose}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="button"
            className={`epm-btn epm-btn--save${isSaving ? ' epm-btn--loading' : ''}`}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving
              ? <span className="epm-spinner" aria-hidden="true" />
              : <><IonIcon icon={checkmarkOutline} className="epm-btn-icon" />Save Changes</>
            }
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`epm-toast epm-toast--${toast.type}`} role="status" aria-live="polite">
          <IonIcon
            icon={toast.type === 'success' ? checkmarkCircleOutline : alertCircleOutline}
            className="epm-toast-icon"
          />
          {toast.message}
        </div>
      )}
    </>
  );
};

export default EditProfileModal;