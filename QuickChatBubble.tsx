import React, { useState, useRef, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import {
  chatbubbleEllipsesOutline,
  flashOutline,
  warningOutline,
  checkmarkCircleOutline,
} from 'ionicons/icons';
import './QuickChatBubble.css';

const STORAGE_KEY    = 'salintayo_quickchat_enabled';
const POS_KEY        = 'salintayo_quickchat_pos';
const BUBBLE_SIZE    = 52;
const MOVE_THRESHOLD = 8;

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

const QuickChatBubble: React.FC = () => {
  const history  = useHistory();
  const location = useLocation();

  /* ── renderable state ─────────────────────────────────────────── */
  const [isEnabled,  setIsEnabled]  = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === 'true'; } catch { return false; }
  });
  const [showDialog, setShowDialog] = useState<'enable' | 'disable' | null>(null);
  const [isPulsing,  setIsPulsing]  = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number }>(() => {
    try {
      const s = localStorage.getItem(POS_KEY);
      if (s) return JSON.parse(s);
    } catch {}
    return { x: window.innerWidth - BUBBLE_SIZE - 16, y: window.innerHeight - 180 };
  });

  /* ── refs: ALL mutable drag state lives here — never stale ───── */
  const bubbleRef  = useRef<HTMLDivElement>(null);
  const posRef     = useRef(pos);
  const enabledRef = useRef(isEnabled);
  const historyRef = useRef(history);

  // keep refs in sync with state
  useEffect(() => { posRef.current     = pos;       }, [pos]);
  useEffect(() => { enabledRef.current = isEnabled; }, [isEnabled]);
  useEffect(() => { historyRef.current = history;   }, [history]);

  const ds     = useRef({ active: false, moved: false, startX: 0, startY: 0, originX: 0, originY: 0 });
  const lpTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── helpers ──────────────────────────────────────────────────── */
  const savePos = (x: number, y: number) => {
    try { localStorage.setItem(POS_KEY, JSON.stringify({ x, y })); } catch {}
  };
  const persistEnabled = (val: boolean) => {
    setIsEnabled(val);
    try { localStorage.setItem(STORAGE_KEY, String(val)); } catch {}
  };

  /* ── drag handlers — plain functions, read state via refs ─────── */
  const onStart = (clientX: number, clientY: number) => {
    const { x, y } = posRef.current;
    ds.current = { active: true, moved: false, startX: clientX, startY: clientY, originX: x, originY: y };

    // long-press → disable dialog (only when enabled)
    if (enabledRef.current) {
      lpTimer.current = setTimeout(() => {
        if (!ds.current.moved) setShowDialog('disable');
      }, 600);
    }
  };

  const onMove = (clientX: number, clientY: number) => {
    if (!ds.current.active) return;
    const dx = clientX - ds.current.startX;
    const dy = clientY - ds.current.startY;

    if (!ds.current.moved) {
      if (Math.hypot(dx, dy) < MOVE_THRESHOLD) return; // still within tap zone
      ds.current.moved = true;
      setIsDragging(true);
      if (lpTimer.current) clearTimeout(lpTimer.current);
    }

    const nx = clamp(ds.current.originX + dx, 4, window.innerWidth  - BUBBLE_SIZE - 4);
    const ny = clamp(ds.current.originY + dy, 60, window.innerHeight - BUBBLE_SIZE - 4);

    setPos({ x: nx, y: ny });
    posRef.current = { x: nx, y: ny };
  };

  const onEnd = (clientX: number) => {
    if (!ds.current.active) return;
    if (lpTimer.current) clearTimeout(lpTimer.current);
    const wasMoved = ds.current.moved;
    ds.current.active = false;
    setIsDragging(false);

    if (!wasMoved) {
      /* TAP: open dialog regardless of enabled state */
      if (!enabledRef.current) {
        setShowDialog('enable');
      } else {
        setIsPulsing(true);
        setTimeout(() => {
          setIsPulsing(false);
          historyRef.current.push('/chat?quickmode=true');
        }, 300);
      }
    } else {
      /* DRAG END: snap bubble to nearest left/right edge */
      const snapX = clientX < window.innerWidth / 2
        ? 4
        : window.innerWidth - BUBBLE_SIZE - 4;
      const snapY = posRef.current.y;
      setPos({ x: snapX, y: snapY });
      posRef.current = { x: snapX, y: snapY };
      savePos(snapX, snapY);
    }
  };

  /* ── attach native listeners ONCE — empty dep array is intentional */
  useEffect(() => {
    const el = bubbleRef.current;
    if (!el) return;

    const tStart = (e: TouchEvent) => {
      e.stopPropagation();
      onStart(e.touches[0].clientX, e.touches[0].clientY);
    };
    const tMove = (e: TouchEvent) => {
      if (!ds.current.active) return;
      e.preventDefault(); // blocks page scroll during drag
      onMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const tEnd = (e: TouchEvent) => onEnd(e.changedTouches[0].clientX);

    const mDown = (e: MouseEvent) => { e.preventDefault(); onStart(e.clientX, e.clientY); };
    const mMove = (e: MouseEvent) => onMove(e.clientX, e.clientY);
    const mUp   = (e: MouseEvent) => onEnd(e.clientX);

    el.addEventListener('touchstart', tStart, { passive: false });
    el.addEventListener('touchmove',  tMove,  { passive: false });
    el.addEventListener('touchend',   tEnd);
    el.addEventListener('mousedown',  mDown);
    window.addEventListener('mousemove', mMove);
    window.addEventListener('mouseup',   mUp);

    return () => {
      el.removeEventListener('touchstart', tStart);
      el.removeEventListener('touchmove',  tMove);
      el.removeEventListener('touchend',   tEnd);
      el.removeEventListener('mousedown',  mDown);
      window.removeEventListener('mousemove', mMove);
      window.removeEventListener('mouseup',   mUp);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (location.pathname === '/chat') return null;

  return (
    <>
      {/* ── Floating Bubble ── */}
      <div
        ref={bubbleRef}
        className={[
          'qcb-bubble',
          isEnabled  ? 'qcb-bubble--on'      : 'qcb-bubble--off',
          isPulsing  ? 'qcb-bubble--pulse'    : '',
          isDragging ? 'qcb-bubble--dragging' : '',
        ].filter(Boolean).join(' ')}
        style={{ left: pos.x, top: pos.y }}
        role="button"
        aria-label="Quick Chat"
      >
        <div className="qcb-bubble__inner">
          <IonIcon
            icon={isEnabled ? flashOutline : chatbubbleEllipsesOutline}
            className="qcb-bubble__icon"
          />
          {isEnabled && <span className="qcb-bubble__badge" />}
        </div>
        {isEnabled && <div className="qcb-bubble__ripple" />}
      </div>

      {/* ── Validation Dialog ── */}
      {showDialog && (
        <div className="qcb-overlay" onClick={() => setShowDialog(null)}>
          <div className="qcb-dialog" onClick={e => e.stopPropagation()}>
            <div className={`qcb-dialog__icon-wrap ${showDialog === 'enable' ? 'qcb-dialog__icon-wrap--enable' : 'qcb-dialog__icon-wrap--disable'}`}>
              <IonIcon
                icon={showDialog === 'enable' ? flashOutline : warningOutline}
                className="qcb-dialog__icon"
              />
            </div>

            {showDialog === 'enable' ? (
              <>
                <h2 className="qcb-dialog__title">Enable Quick Chat?</h2>
                <p className="qcb-dialog__desc">
                  Quick Chat gives you a floating shortcut to open emergency AI-assisted chat from{' '}
                  <strong>any screen</strong>. Tap the bubble anytime to jump straight into a fast conversation.
                </p>
                <div className="qcb-dialog__features">
                  <div className="qcb-dialog__feature">
                    <IonIcon icon={flashOutline} /> Instant access from all pages
                  </div>
                  <div className="qcb-dialog__feature">
                    <IonIcon icon={checkmarkCircleOutline} /> Pre-loaded emergency mode
                  </div>
                  <div className="qcb-dialog__feature">
                    <IonIcon icon={chatbubbleEllipsesOutline} /> Drag to reposition anywhere
                  </div>
                </div>
                <div className="qcb-dialog__actions">
                  <button className="qcb-dialog__btn qcb-dialog__btn--cancel" onClick={() => setShowDialog(null)}>
                    Not now
                  </button>
                  <button
                    className="qcb-dialog__btn qcb-dialog__btn--confirm"
                    onClick={() => { persistEnabled(true); setShowDialog(null); }}
                  >
                    Enable
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="qcb-dialog__title">Disable Quick Chat?</h2>
                <p className="qcb-dialog__desc">
                  The floating bubble will be hidden. You can re-enable it anytime by tapping it again.
                </p>
                <div className="qcb-dialog__actions">
                  <button className="qcb-dialog__btn qcb-dialog__btn--cancel" onClick={() => setShowDialog(null)}>
                    Keep it
                  </button>
                  <button
                    className="qcb-dialog__btn qcb-dialog__btn--danger"
                    onClick={() => { persistEnabled(false); setShowDialog(null); }}
                  >
                    Disable
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default QuickChatBubble;