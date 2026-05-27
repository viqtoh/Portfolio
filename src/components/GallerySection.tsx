import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { GalleryItem } from '../types';

interface GallerySectionProps {
  items?: GalleryItem[];
}

function wrapIndex(index: number, total: number) {
  if (total <= 0) return 0;
  return (index + total) % total;
}

function GalleryMedia({ item, className = '' }: { item: GalleryItem; className?: string }) {
  if (item.type === 'video') {
    return (
      <video
        className={className}
        src={item.url}
        controls
        muted
        playsInline
        autoPlay
        preload="metadata"
      >
        Your browser does not support the video tag.
      </video>
    );
  }

  return <img className={className} src={item.url} alt={item.alt ?? item.title ?? 'Gallery item'} />;
}

function GalleryThumbnail({ item }: { item: GalleryItem }) {
  if (item.type === 'video') {
    return (
      <video
        className="gallery-thumb"
        src={item.url}
        muted
        playsInline
        preload="metadata"
      />
    );
  }

  return <img className="gallery-thumb" src={item.url} alt={item.alt ?? item.title ?? 'Gallery item'} />;
}

export function GallerySection({ items = [] }: GallerySectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const hasItems = items.length > 0;
  const activeItem = items[activeIndex];
  const hasMultipleItems = items.length > 1;

  function openGallery(index: number) {
    setActiveIndex(index);
    setIsOpen(true);
  }

  function move(direction: number) {
    setActiveIndex((current) => wrapIndex(current + direction, items.length));
  }

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
      if (event.key === 'ArrowRight') move(1);
      if (event.key === 'ArrowLeft') move(-1);
    }

    window.addEventListener('keydown', handleKeydown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeydown);
    };
  }, [isOpen, items.length]);

  if (!hasItems) return null;

  return (
    <section className="gallery-section" id="gallery">
      <div className="section-heading compact-heading">
        <span className="eyebrow">Visual archive</span>
        <h2>Gallery</h2>
        <p>Beyond the lines of code: A glimpse into my milestones, values, and life outside the editor.</p>
      </div>

      <div className="gallery-grid">
        {items.map((item, index) => (
          <button
            key={`${item.url}-${index}`}
            type="button"
            className={`gallery-card ${index === 0 ? 'featured' : ''}`}
            onClick={() => openGallery(index)}
            aria-label={`Open ${item.title ?? `gallery item ${index + 1}`}`}
          >
            <GalleryThumbnail item={item} />

            <span className="gallery-expand-icon" aria-hidden="true">
              ⤢
            </span>

            <span className="gallery-type-pill">
              {item.type}
            </span>

            <span className="gallery-overlay">
              {item.title && <strong>{item.title}</strong>}
              {item.caption && <small>{item.caption}</small>}
            </span>
          </button>
        ))}
      </div>

      {isOpen && activeItem && createPortal(
        <div
          className="media-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Gallery fullscreen viewer"
          onMouseDown={() => setIsOpen(false)}
        >
          <button
            className="media-lightbox-close"
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close gallery"
          >
            ×
          </button>

          <div
            className="media-lightbox-panel gallery-lightbox-panel"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="media-lightbox-header">
              <div>
                <span className="page-label">Gallery</span>
                <h3>{activeItem.title ?? `Media ${activeIndex + 1}`}</h3>
                {activeItem.caption && <p>{activeItem.caption}</p>}
              </div>

              <span>{activeIndex + 1} / {items.length}</span>
            </div>

            <div className="media-lightbox-stage">
              {hasMultipleItems && (
                <button
                  className="media-lightbox-nav previous"
                  type="button"
                  onClick={() => move(-1)}
                  aria-label="Previous gallery item"
                >
                  ‹
                </button>
              )}

              <GalleryMedia item={activeItem} className="media-asset" />

              {hasMultipleItems && (
                <button
                  className="media-lightbox-nav next"
                  type="button"
                  onClick={() => move(1)}
                  aria-label="Next gallery item"
                >
                  ›
                </button>
              )}
            </div>

            {hasMultipleItems && (
              <div className="media-lightbox-dots" aria-label="Select gallery item">
                {items.map((item, index) => (
                  <button
                    key={`${item.url}-dot-${index}`}
                    type="button"
                    className={index === activeIndex ? 'active' : ''}
                    onClick={() => setActiveIndex(index)}
                    aria-label={`Show gallery item ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>,
        document.body,
      )}
    </section>
  );
}