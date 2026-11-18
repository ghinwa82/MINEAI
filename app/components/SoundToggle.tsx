'use client';

import React, { useEffect, useState } from 'react';

import { useI18n } from '@/lib/i18n-provider';
import { sound } from '@/lib/sound-engine';

/**
 * The header sound switch.
 *
 * Audio only ever starts after a gesture, so this button is both the indicator
 * and the permission: pressing it enables the synthesised cues and plays one so
 * the visitor hears exactly what they just allowed.
 */

const LABELS: Record<string, { on: string; off: string; label: string }> = {
  en: { on: 'Sound on', off: 'Sound off', label: 'Toggle interface sounds' },
  ar: { on: 'الصوت مفعّل', off: 'الصوت مغلق', label: 'تشغيل أو إغلاق أصوات الواجهة' },
  fr: { on: 'Son activé', off: 'Son coupé', label: 'Activer ou couper les sons de l’interface' },
  es: { on: 'Sonido activado', off: 'Sonido desactivado', label: 'Activar o desactivar los sonidos de la interfaz' },
  zh: { on: '声音已开', off: '声音已关', label: '开启或关闭界面音效' },
  hi: { on: 'ध्वनि चालू', off: 'ध्वनि बंद', label: 'इंटरफ़ेस ध्वनि चालू या बंद करें' },
};

export default function SoundToggle() {
  const { lang } = useI18n();
  const copy = LABELS[lang] ?? LABELS.en;
  const [muted, setMuted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMuted(sound.isMuted());
    setMounted(true);
    return sound.subscribe(setMuted);
  }, []);

  const toggle = () => {
    const next = sound.toggle();
    setMuted(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={!muted}
      aria-label={copy.label}
      title={muted ? copy.off : copy.on}
      className={`grid h-9 w-9 place-items-center rounded-xl border transition ${
        muted
          ? 'border-white/10 text-ink-faint hover:border-white/25 hover:text-ink-mute'
          : 'border-cyan/35 text-cyan hover:border-cyan/60'
      }`}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path
          d="M2.6 6.1h2.2L7.6 3.6c.4-.4 1.1-.1 1.1.5v7.8c0 .6-.7.9-1.1.5L4.8 9.9H2.6a.7.7 0 0 1-.7-.7V6.8c0-.4.3-.7.7-.7Z"
          fill="currentColor"
          opacity="0.9"
        />
        {muted ? (
          <path d="M11 6.2 14 9.2M14 6.2l-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        ) : (
          <>
            <path d="M10.4 6.1a2.6 2.6 0 0 1 0 3.8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M12.1 4.4a5 5 0 0 1 0 7.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
          </>
        )}
      </svg>
      <span className="sr-only">{mounted && !muted ? copy.on : copy.off}</span>
    </button>
  );
}
