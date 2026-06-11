import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "./App.css";

/* ─────────────────────────────────────────
   Constants
───────────────────────────────────────── */
const MESSAGES = [
  "You are a cutie 🥰",
  "You are a hotie 😘",
  "I miss youuu ❤️",
  "Abh paani pee loo 💧",
];

const POPUP_COLORS = ["popup-pink", "popup-yellow", "popup-blue", "popup-green"];

// Stable hearts for after-yes — created once at module load
const AFTER_HEARTS = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  delay: Math.random() * 2,
}));

interface PopupItem {
  id: number;
  text: string;
  colorClass: string;
  top: number;
  left: number;
}

/* Read visual-viewport (respects mobile browser chrome) */
function getViewport() {
  const vp = window.visualViewport;
  return {
    vw: vp?.width  ?? window.innerWidth,
    vh: vp?.height ?? window.innerHeight,
    ox: vp?.offsetLeft ?? 0,
    oy: vp?.offsetTop  ?? 0,
  };
}

/* ─────────────────────────────────────────
   Component
───────────────────────────────────────── */
const App: React.FC = () => {
  const [accepted, setAccepted]           = useState(false);
  const [msgIndex, setMsgIndex]           = useState(-1);
  const [visiblePopups, setVisiblePopups] = useState<PopupItem[]>([]);
  const noButtonRef                       = useRef<HTMLButtonElement>(null);

  const [noPos, setNoPos] = useState(() => {
    const { vw, vh } = getViewport();
    return { top: vh / 2 + 60, left: vw / 2 - 60 };
  });

  // Stable background hearts
  const bgHearts = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2,
        glyph: i % 2 === 0 ? "❤️" : "💖",
      })),
    []
  );

  /* ── No-button: always within visual viewport ── */
  const moveNo = useCallback(() => {
    const { vw, vh, ox, oy } = getViewport();
    const btn = noButtonRef.current;
    const bw  = btn?.offsetWidth  ?? 110;
    const bh  = btn?.offsetHeight ?? 44;
    const pad = 14;
    setNoPos({
      top:  oy + pad + Math.random() * Math.max(0, vh - bh - pad * 2),
      left: ox + pad + Math.random() * Math.max(0, vw - bw - pad * 2),
    });
  }, []);

  /* ── Non-passive touch listener so preventDefault() works on mobile ── */
  useEffect(() => {
    const btn = noButtonRef.current;
    if (!btn) return;

    const handler = (e: TouchEvent) => {
      e.preventDefault(); // works because listener is non-passive
      moveNo();
    };

    btn.addEventListener("touchstart", handler, { passive: false });
    return () => btn.removeEventListener("touchstart", handler);
  }, [moveNo]);

  /* ── Popup: random position within screen ── */
  const randomPopupPos = useCallback(() => {
    const { vw, vh } = getViewport();
    const pw = 190, ph = 60, pad = 16;
    return {
      top:  pad + Math.random() * Math.max(0, vh - ph - pad * 2),
      left: pad + Math.random() * Math.max(0, vw - pw - pad * 2),
    };
  }, []);

  const handleAccept = useCallback(() => {
    setAccepted(true);
    setMsgIndex(0);
  }, []);

  /* ── Add one popup per tick; all stay on screen ── */
  useEffect(() => {
    if (msgIndex < 0) return;

    setVisiblePopups((prev) => [
      ...prev,
      {
        id: msgIndex,
        text: MESSAGES[msgIndex],
        colorClass: POPUP_COLORS[msgIndex % POPUP_COLORS.length],
        ...randomPopupPos(),
      },
    ]);

    if (msgIndex < MESSAGES.length - 1) {
      const t = setTimeout(() => setMsgIndex((i) => i + 1), 1800);
      return () => clearTimeout(t);
    }
  }, [msgIndex, randomPopupPos]);

  return (
    <div className="container">
      {/* Background hearts */}
      <div className="love-bg" aria-hidden="true">
        {bgHearts.map((h) => (
          <span key={h.id} style={{ left: `${h.left}%`, animationDelay: `${h.delay}s` }}>
            {h.glyph}
          </span>
        ))}
      </div>

      {/* Main card */}
      <div className="teddy-container">
        <div className={`teddy ${accepted ? "kiss-animation" : ""}`}>🧸</div>

        {!accepted && (
          <>
            <h1>Puchku, will you give me a kiss? 💖</h1>
            <div className="buttons">
              <button className="yes-btn" onClick={handleAccept}>
                Yes 💋
              </button>

              {/* onTouchStart removed — handled via non-passive useEffect above */}
              <button
                ref={noButtonRef}
                className="no-btn"
                style={{ position: "fixed", top: noPos.top, left: noPos.left }}
                onMouseEnter={moveNo}
                onClick={moveNo}
              >
                No 😢
              </button>
            </div>
          </>
        )}

        {accepted && (
          <>
            <div className="kiss">💋</div>
            <div className="hearts" aria-hidden="true">
              {AFTER_HEARTS.map((h) => (
                <span
                  key={h.id}
                  className="heart"
                  style={{ left: `${h.left}%`, animationDelay: `${h.delay}s` }}
                >
                  ❤️
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Floating popup cards — outside card so they cover full screen */}
      {visiblePopups.map((p) => (
        <div
          key={p.id}
          className={`popup-card ${p.colorClass}`}
          style={{ top: p.top, left: p.left }}
        >
          <div className="popup-float" style={{ animationDuration: `${2.8 + p.id * 0.45}s` }}>
            <div className="popup-body">{p.text}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default App;