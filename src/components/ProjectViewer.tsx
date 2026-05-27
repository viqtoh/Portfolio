import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { PortfolioSection, ProjectData, ViewerMode } from '../types';
import { MediaAsset } from './MediaAsset';
import { ProjectMediaGallery } from './ProjectMediaGallery';

interface ProjectViewerProps {
  sections: PortfolioSection[];
  projects: ProjectData[];
  selectedProject?: ProjectData | null;
}

const modeLabels: Record<ViewerMode, string> = {
  book: 'Book turn',
  deck: 'Card deck',
  orbit: 'Orbit map',
  cinema: 'Cinema strip',
};

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export function ProjectViewer({ sections, projects, selectedProject }: ProjectViewerProps) {
  const [mode, setMode] = useState<ViewerMode>('book');
  const firstSectionWithProjects =
    sections.find((section) => projects.some((project) => project.sections.includes(section.title)))?.title ??
    sections[0]?.title ??
    '';
  const [activeSectionTitle, setActiveSectionTitle] = useState(firstSectionWithProjects);

  useEffect(() => {
    if (!selectedProject) return;

    const sectionForSelectedProject = sections.find((section) =>
      selectedProject.sections.includes(section.title),
    );

    if (sectionForSelectedProject) {
      setActiveSectionTitle(sectionForSelectedProject.title);
    }
  }, [sections, selectedProject]);

  const projectsForActiveSection = useMemo(
    () => projects.filter((project) => project.sections.includes(activeSectionTitle)),
    [activeSectionTitle, projects],
  );

  const selectedIndex = selectedProject
    ? Math.max(0, projectsForActiveSection.findIndex((project) => project.projectTitle === selectedProject.projectTitle))
    : 0;

  return (
    <section className="project-viewer" id="viewer">
      <div className="section-heading compact-heading">
        <span className="eyebrow">My Projects</span>
        <h2>Here are some of my notable projects</h2>
        <p>
          Pick a platform first, then switch the display style.
        </p>
      </div>

      <div className="viewer-platform-tabs" role="tablist" aria-label="Project platform filters">
        {sections.map((section) => {
          const count = projects.filter((project) => project.sections.includes(section.title)).length;
          return (
            <button
              key={section.title}
              type="button"
              className={activeSectionTitle === section.title ? 'active' : ''}
              onClick={() => setActiveSectionTitle(section.title)}
            >
              <span>{section.title}</span>
              <small>{count}</small>
            </button>
          );
        })}
      </div>

      <div className="viewer-tabs" role="tablist" aria-label="Project viewer modes">
        {(Object.keys(modeLabels) as ViewerMode[]).map((viewerMode) => (
          <button
            key={viewerMode}
            type="button"
            className={mode === viewerMode ? 'active' : ''}
            onClick={() => setMode(viewerMode)}
          >
            {modeLabels[viewerMode]}
          </button>
        ))}
      </div>

      {projectsForActiveSection.length === 0 ? (
        <p className="empty-state viewer-empty-state">No projects found for {activeSectionTitle} yet.</p>
      ) : (
        <>
          {mode === 'book' && (
            <BookViewer
              projects={projectsForActiveSection}
              initialIndex={selectedIndex}
              sectionTitle={activeSectionTitle}
            />
          )}
          {mode === 'deck' && (
            <DeckViewer
              projects={projectsForActiveSection}
              initialIndex={selectedIndex}
              sectionTitle={activeSectionTitle}
            />
          )}
          {mode === 'orbit' && (
            <OrbitViewer
              projects={projectsForActiveSection}
              initialIndex={selectedIndex}
              sectionTitle={activeSectionTitle}
            />
          )}
          {mode === 'cinema' && (
            <CinemaViewer
              projects={projectsForActiveSection}
              initialIndex={selectedIndex}
              sectionTitle={activeSectionTitle}
            />
          )}
        </>
      )}
    </section>
  );
}

function BookViewer({
  projects,
  initialIndex,
  sectionTitle,
}: {
  projects: ProjectData[];
  initialIndex: number;
  sectionTitle: string;
}) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function updateProgress() {
      const node = stageRef.current;
      if (!node) return;

      const rect = node.getBoundingClientRect();
      const scrollableDistance = Math.max(1, rect.height - window.innerHeight);
      const passed = Math.min(Math.max(-rect.top, 0), scrollableDistance);
      setProgress(passed / scrollableDistance);
    }

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);

    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, []);

  const segmentProgress = progress * projects.length;
  const currentIndex = Math.min(projects.length - 1, Math.floor(segmentProgress));
  const localProgress = currentIndex === projects.length - 1
    ? clamp(segmentProgress - currentIndex)
    : clamp(segmentProgress - currentIndex);
  const nextIndex = (currentIndex + 1) % projects.length;
  const current = projects[currentIndex] ?? projects[initialIndex] ?? projects[0];
  const next = projects[nextIndex] ?? current;

  const lift = clamp((localProgress - 0.08) / 0.2);
  const turn = clamp((localProgress - 0.24) / 0.62) * -164;

  return (
    <div
      className="book-stage single-book-stage"
      ref={stageRef}
      style={{ height: `${Math.max(230, projects.length * 92)}vh` }}
    >
      <div className="book-sticky">
        <div className="book-progress" aria-label="Book scroll progress">
          <span style={{ width: `${progress * 100}%` }} />
        </div>

        <div
          className="book-single-shell"
          aria-label={`${sectionTitle} single page book viewer`}
          style={{ '--book-lift': lift, '--book-turn': `${turn}deg` } as CSSProperties}
        >
          <div className="book-stack-sheet sheet-a" />
          <div className="book-stack-sheet sheet-b" />

          <div className="book-single-next" aria-hidden={turn > -82 ? 'true' : 'false'}>
            <ProjectPageContent project={next} label={`Next in ${sectionTitle}`} />
          </div>

          <div
            className={`book-single-page ${lift > 0 ? 'lifted' : ''}`}
          >
            <ProjectPageContent
              project={current}
              label={`${sectionTitle} • Project ${currentIndex + 1} of ${projects.length}`}
            />
          </div>
        </div>

        <p className="book-hint">
          One-page book mode: scroll a little to lift the page, then continue scrolling to turn it into the next {sectionTitle} project.
        </p>
      </div>
    </div>
  );
}

function ProjectPageContent({ project, label }: { project: ProjectData; label: string }) {
  return (
    <div className="project-page-content">
      <span className="page-label">{label}</span>
      <h3>{project.projectTitle}</h3>
      <p>{project.summary}</p>
      <div className="project-tags">
        {project.sections.map((section) => (
          <span key={`${project.projectTitle}-${section}`}>{section}</span>
        ))}
      </div>
      <ProjectMediaGallery project={project} compact />
      <div className='profile-links'>
        {project.link && (
        <a className="project-link" href={project.link} target="_blank" rel="noreferrer">
        View project
      </a>
      )}
      {project.github && (
        <a className="project-link" href={project.github} target="_blank" rel="noreferrer">
        View Github
      </a>
      )}
      </div>
    </div>
  );
}

function DeckViewer({
  projects,
  initialIndex,
  sectionTitle,
}: {
  projects: ProjectData[];
  initialIndex: number;
  sectionTitle: string;
}) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const activeProject = projects[activeIndex];

  useEffect(() => {
    setActiveIndex(Math.min(initialIndex, projects.length - 1));
  }, [initialIndex, projects.length]);

  function move(direction: number) {
    setActiveIndex((current) => (current + direction + projects.length) % projects.length);
  }

  return (
    <div className="deck-viewer">
      <div className="deck-controls">
        <button type="button" onClick={() => move(-1)}>Previous</button>
        <span>{activeIndex + 1} / {projects.length}</span>
        <button type="button" onClick={() => move(1)}>Next</button>
      </div>

      <div className="deck-stage" aria-label={`${sectionTitle} stacked project card viewer`}>
        {projects.map((project, index) => {
          const offset = (index - activeIndex + projects.length) % projects.length;
          const normalizedOffset = offset > projects.length / 2 ? offset - projects.length : offset;

          return (
            <article
              className={`deck-card ${index === activeIndex ? 'active' : ''}`}
              key={project.projectTitle}
              style={{
                transform: `translateX(${normalizedOffset * 34}px) translateY(${Math.abs(normalizedOffset) * 18}px) rotate(${normalizedOffset * -2.5}deg) scale(${index === activeIndex ? 1 : 0.92})`,
                zIndex: projects.length - Math.abs(normalizedOffset),
                opacity: Math.abs(normalizedOffset) > 2 ? 0 : 1,
              }}
              onClick={() => setActiveIndex(index)}
            >
              <ProjectCard project={project} />
            </article>
          );
        })}
      </div>

    
    </div>
  );
}

function OrbitViewer({
  projects,
  initialIndex,
  sectionTitle,
}: {
  projects: ProjectData[];
  initialIndex: number;
  sectionTitle: string;
}) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const activeProject = projects[activeIndex];

  useEffect(() => {
    setActiveIndex(Math.min(initialIndex, projects.length - 1));
  }, [initialIndex, projects.length]);

  return (
    <div className="orbit-viewer">
      <div className="orbit-map" aria-label={`${sectionTitle} orbit project viewer`}>
        <div className="orbit-core">
          <span>{sectionTitle}</span>
          <h3>{activeProject.projectTitle}</h3>
          <p>{activeProject.summary}</p>
        </div>

        {projects.map((project, index) => {
          const angle = (360 / projects.length) * index;
          const isActive = index === activeIndex;
          return (
            <button
              type="button"
              key={project.projectTitle}
              className={`orbit-node ${isActive ? 'active' : ''}`}
              style={{ '--angle': `${angle}deg` } as CSSProperties}
              onClick={() => setActiveIndex(index)}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      <div className="orbit-detail">
        <ProjectCard project={activeProject} />
      </div>
    </div>
  );
}

function CinemaViewer({
  projects,
  initialIndex,
  sectionTitle,
}: {
  projects: ProjectData[];
  initialIndex: number;
  sectionTitle: string;
}) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const activeProject = projects[activeIndex];

  useEffect(() => {
    setActiveIndex(Math.min(initialIndex, projects.length - 1));
  }, [initialIndex, projects.length]);

  return (
    <div className="cinema-viewer">
      <div className="cinema-screen">
        <ProjectCard project={activeProject} large />
      </div>

      <div className="film-strip" aria-label={`${sectionTitle} cinema project selector`}>
        {projects.map((project, index) => (
          <button
            key={project.projectTitle}
            className={index === activeIndex ? 'active' : ''}
            type="button"
            onClick={() => setActiveIndex(index)}
          >
            <span>{String(index + 1).padStart(2, '0')}</span>
            {project.assets[0] && <MediaAsset asset={project.assets[0]} compact />}
            <strong>{project.projectTitle}</strong>
          </button>
        ))}
      </div>
    </div>
  );
}

function ProjectCard({ project, large = false }: { project: ProjectData; large?: boolean }) {
  return (
    <div className={`project-card ${large ? 'large' : ''}`}>
      <ProjectMediaGallery project={project} compact={!large} />
      <div className="project-card-body">
        <span>{project.year ?? 'Selected work'}</span>
        <h3>{project.projectTitle}</h3>
        <p>{project.summary}</p>
        <div className="project-tags">
          {project.sections.map((section) => (
            <span key={`${project.projectTitle}-${section}`}>{section}</span>
          ))}
        </div>
        <a className="project-link" href={project.link} target="_blank" rel="noreferrer">
          Open project
        </a>
      </div>
    </div>
  );
}
