import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ProfileData } from '../types';

interface ProfileHeroProps {
  profile: ProfileData;
}

export function ProfileHero({ profile }: ProfileHeroProps) {
  const profileImages = useMemo(() => {
    const images = profile.images?.filter(Boolean) ?? [];
    return images.length > 0 ? images : [profile.image].filter(Boolean);
  }, [profile.images, profile.image]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isRingBoosted, setIsRingBoosted] = useState(false);

  const autoTimerRef = useRef<number | null>(null);
  const boostTimerRef = useRef<number | null>(null);
  const scheduleAutoSwitchRef = useRef<(delay?: number) => void>(() => {});

  const imageSignature = profileImages.join('|');
  const currentImage = profileImages[activeImageIndex] ?? profileImages[0];

  const clearAutoTimer = useCallback(() => {
    if (autoTimerRef.current !== null) {
      window.clearTimeout(autoTimerRef.current);
      autoTimerRef.current = null;
    }
  }, []);

  const clearBoostTimer = useCallback(() => {
    if (boostTimerRef.current !== null) {
      window.clearTimeout(boostTimerRef.current);
      boostTimerRef.current = null;
    }
  }, []);

  const startRingBoost = useCallback(() => {
    setIsRingBoosted(true);
    clearBoostTimer();

    boostTimerRef.current = window.setTimeout(() => {
      setIsRingBoosted(false);
      boostTimerRef.current = null;
    }, 500);
  }, [clearBoostTimer]);

  const switchToNextImage = useCallback(() => {
    if (profileImages.length <= 1) return;

    setActiveImageIndex((currentIndex) => {
      return (currentIndex + 1) % profileImages.length;
    });

    startRingBoost();
  }, [profileImages.length, startRingBoost]);

  const scheduleAutoSwitch = useCallback(
    (delay = 3000) => {
      clearAutoTimer();

      if (profileImages.length <= 1) return;

      autoTimerRef.current = window.setTimeout(() => {
        switchToNextImage();
        scheduleAutoSwitchRef.current(5000);
      }, delay);
    },
    [clearAutoTimer, profileImages.length, switchToNextImage],
  );

  useEffect(() => {
    scheduleAutoSwitchRef.current = scheduleAutoSwitch;
  }, [scheduleAutoSwitch]);

  useEffect(() => {
    setActiveImageIndex(0);
    scheduleAutoSwitch(5000);

    return () => {
      clearAutoTimer();
    };
  }, [imageSignature, scheduleAutoSwitch, clearAutoTimer]);

  useEffect(() => {
    return () => {
      clearAutoTimer();
      clearBoostTimer();
    };
  }, [clearAutoTimer, clearBoostTimer]);

  const handleManualImageSwitch = () => {
    switchToNextImage();

    // After manual click, pause auto-switching for 10 seconds.
    scheduleAutoSwitch(10000);
  };

  return (
    <section className="hero-section" id="profile">
      <div className="hero-copy">
        <span className="eyebrow">Welcome to my Portfolio</span>
        <h1>Victor Aromiwe</h1>
        <p className="traits">{profile.traits}</p>

        <div
          className="about-card"
          dangerouslySetInnerHTML={{ __html: profile.aboutMeHtml }}
        />

        <div className="tech-cloud" aria-label="Technology stack">
          {profile.technologies.map((technology) => (
            <span key={technology}>{technology}</span>
          ))}
        </div>
      </div>

      <div className="hero-visual">
        <div className={`portrait-ring ${isRingBoosted ? 'is-ring-boosted' : ''}`}>
          <img
            key={currentImage}
            src={currentImage}
            alt="Profile portrait"
          />

          {profileImages.length > 1 && (
            <button
              type="button"
              className="portrait-switch-button"
              onClick={handleManualImageSwitch}
              aria-label="Show next profile image"
            >
             <svg 
  viewBox="0 0 24 24" 
  fill="none" 
  stroke="currentColor" 
  strokeWidth="2" 
  strokeLinecap="round" 
  strokeLinejoin="round"
  aria-hidden="true"
>
  <path d="M16 3h5v5" />
  <path d="M4 20l17-17" />
  <path d="M21 16v5h-5" />
  <path d="M15 15l6 6" />
  <path d="M4 4l5 5" />
</svg>
            </button>
          )}
        </div>

        <div className="floating-note note-a">Strategy → UI → API → Deploy → Support</div>
        <div className="floating-note note-b">Clean handover, scalable workflow</div>
      </div>
    </section>
  );
}