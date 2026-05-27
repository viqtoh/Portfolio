import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ProjectData } from '../types';
import { MediaAsset, MediaAsset2 } from './MediaAsset';

interface ProjectMediaGalleryProps {
  project: ProjectData;
  compact?: boolean;
}

function wrapIndex(index: number, total: number) {
  if (total <= 0) return 0;
  return (index + total) % total;
}

export function ProjectMediaGallery({ project, compact = false }: ProjectMediaGalleryProps) {
  const assets = project.assets ?? [];
  const [activeIndex, setActiveIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setActiveIndex(0);
  }, [project.projectTitle]);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
      if (event.key === 'ArrowRight') {
        setActiveIndex((current) => wrapIndex(current + 1, assets.length));
      }
      if (event.key === 'ArrowLeft') {
        setActiveIndex((current) => wrapIndex(current - 1, assets.length));
      }
    }

    window.addEventListener('keydown', handleKeydown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeydown);
    };
  }, [assets.length, isOpen]);

  if (assets.length === 0) return null;

  const activeAsset = assets[activeIndex];
  const hasMultipleAssets = assets.length > 1;

  function move(direction: number) {
    setActiveIndex((current) => wrapIndex(current + direction, assets.length));
  }

  return (
    <>
      <div className={`media-gallery ${compact ? 'compact' : ''}`} >
        <MediaAsset2 asset={activeAsset} compact={compact} onClick={() => setIsOpen(true)}  />

        <button
          className="media-expand-button"
          type="button"
          aria-label={`Expand media for ${project.projectTitle}`}
          onClick={() => setIsOpen(true)}
        >
          ⤢
        </button>

        {hasMultipleAssets && (
          <div className="media-gallery-controls" aria-label="Project media controls">
            <button type="button" onClick={() => move(-1)} aria-label="Previous media">‹</button>
            <span>{activeIndex + 1} / {assets.length}</span>
            <button type="button" onClick={() => move(1)} aria-label="Next media">›</button>
          </div>
        )}
      </div>

      {isOpen && createPortal(
        <div className="media-lightbox" role="dialog" aria-modal="true" aria-label={`${project.projectTitle} media viewer`} onMouseDown={() => setIsOpen(false)}>
          <button className="media-lightbox-close" type="button" onClick={() => setIsOpen(false)} aria-label="Close fullscreen media">
            ×
          </button>

          <div className="media-lightbox-panel" onMouseDown={(event) => event.stopPropagation()}>
            <div className="media-lightbox-header">
              <div>
                <span className="page-label">Media viewer</span>
                <h3>{project.projectTitle}</h3>
              </div>
              <span>{activeIndex + 1} / {assets.length}</span>
            </div>

            <div className="media-lightbox-stage">
              {hasMultipleAssets && (
                <button className="media-lightbox-nav previous" type="button" onClick={() => move(-1)} aria-label="Previous media">
                  ‹
                </button>
              )}

              <MediaAsset asset={activeAsset} />

              {hasMultipleAssets && (
                <button className="media-lightbox-nav next" type="button" onClick={() => move(1)} aria-label="Next media">
                  ›
                </button>
              )}
            </div>

            {hasMultipleAssets && (
              <div className="media-lightbox-dots" aria-label="Select media">
                {assets.map((asset, index) => (
                  <button
                    key={`${asset.url}-${index}`}
                    type="button"
                    className={index === activeIndex ? 'active' : ''}
                    onClick={() => setActiveIndex(index)}
                    aria-label={`Show media ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
