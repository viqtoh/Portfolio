import { CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import { PortfolioSection, ProjectData, SuperViewerMode, ViewerMode } from '../types';
import { MediaAsset } from './MediaAsset';
import { ProjectMediaGallery } from './ProjectMediaGallery';

interface ProjectViewerProps {
  sections: PortfolioSection[];
  projects: ProjectData[];
  selectedProject?: ProjectData | null;
}

const modeLabels: Record<ViewerMode, string> = {
  book: 'Book Turn',
  deck: 'Card deck',
  orbit: 'Orbit map',
  cinema: 'Cinema strip',
};

const modeLabels2: Record<SuperViewerMode, string> = {
  book: 'Carousel',
  orbit: 'Orbit map',
  cinema: 'Cinema strip',
};

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}


function useIsMobile(maxWidth = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${maxWidth}px)`);

    function update() {
      setIsMobile(mediaQuery.matches);
    }

    update();
    mediaQuery.addEventListener('change', update);

    return () => {
      mediaQuery.removeEventListener('change', update);
    };
  }, [maxWidth]);

  return isMobile;
}

export function ProjectViewer({ sections, projects, selectedProject }: ProjectViewerProps) {
  const [mode, setMode] = useState<ViewerMode>('book');
  const isMobile = useIsMobile();
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

      {isMobile ? <div className="viewer-tabs" role="tablist" aria-label="Project viewer modes">
        {(Object.keys(modeLabels2) as SuperViewerMode[]).map((viewerMode) => (
          <button
            key={viewerMode}
            type="button"
            className={mode === viewerMode ? 'active' : ''}
            onClick={() => setMode(viewerMode)}
          >
            {modeLabels2[viewerMode]}
          </button>
        ))}
      </div>:<div className="viewer-tabs" role="tablist" aria-label="Project viewer modes">
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
      </div>}

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

  

  const orderedProjects = useMemo(() => {
    if (projects.length <= 1) return projects;

    const safeInitialIndex = Math.min(
      Math.max(initialIndex, 0),
      projects.length - 1,
    );

    return [
      ...projects.slice(safeInitialIndex),
      ...projects.slice(0, safeInitialIndex),
    ];
  }, [projects, initialIndex]);

  const projectCount = orderedProjects.length;
  const hasMultipleProjects = projectCount > 1;
  const transitionCount = Math.max(0, projectCount - 1);

  useEffect(() => {
    if (!hasMultipleProjects) {
      setProgress(0);
      return;
    }

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
  }, [hasMultipleProjects]);

  const isMobile = useIsMobile(768);

  if (isMobile) {
    return (
      <MobileBookViewer
        projects={projects}
        initialIndex={initialIndex}
        sectionTitle={sectionTitle}
      />
    );
  }

  if (projectCount === 0) {
    return (
      <div className="viewer-empty-state">
        No projects available for {sectionTitle}.
      </div>
    );
  }

  if (!hasMultipleProjects) {
    const onlyProject = orderedProjects[0];

    return (
      <div className="book-stage single-book-stage book-static-stage">
        <div className="book-sticky">
          <div
            className="book-single-shell"
            aria-label={`${sectionTitle} single project book viewer`}
          >
            <div className="book-stack-sheet sheet-a" />
            <div className="book-stack-sheet sheet-b" />

            <div className="book-single-page">
              <ProjectPageContent
                project={onlyProject}
                label={`${sectionTitle} • Project 1 of 1`}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const segmentProgress = progress * transitionCount;
  const transitionIndex = Math.min(
    transitionCount - 1,
    Math.floor(segmentProgress),
  );

  const localProgress = clamp(segmentProgress - transitionIndex);

  const currentIndex = transitionIndex;
  const nextIndex = transitionIndex + 1;

  const current = orderedProjects[currentIndex];
  const next = orderedProjects[nextIndex];

  const lift = clamp((localProgress - 0.08) / 0.18);
  const turnProgress = clamp((localProgress - 0.24) / 0.62);
  const turn = turnProgress * -164;

  return (
    <div
      className="book-stage single-book-stage"
      ref={stageRef}
      style={{
        height: `calc(${130 + transitionCount * 115}svh)`,
      }}
    >
      <div className="book-sticky">
        <div className="book-progress" aria-label="Book scroll progress">
          <span style={{ width: `${progress * 100}%` }} />
        </div>

        <div
          className="book-single-shell"
          aria-label={`${sectionTitle} single page book viewer`}
          style={
            {
              '--book-lift': lift,
              '--book-turn-progress': turnProgress,
              '--book-turn': `${turn}deg`,
            } as CSSProperties
          }
        >
          <div className="book-stack-sheet sheet-a" />
          <div className="book-stack-sheet sheet-b" />

          <div className="book-single-next">
            <ProjectPageContent
              project={next}
              label={`${sectionTitle} • Project ${nextIndex + 1} of ${projectCount}`}
            />
          </div>

          <div className={`book-single-page ${lift > 0 ? 'lifted' : ''}`}>
            <ProjectPageContent
              project={current}
              label={`${sectionTitle} • Project ${currentIndex + 1} of ${projectCount}`}
            />
          </div>
        </div>

        <p className="book-hint">
          Scroll to lift the page, then continue scrolling to reveal the next {sectionTitle} project.
        </p>
      </div>
    </div>
  );
}


function MobileBookViewer({
  projects,
  initialIndex,
  sectionTitle,
}: {
  projects: ProjectData[];
  initialIndex: number;
  sectionTitle: string;
}) {
  const [activeIndex, setActiveIndex] = useState(() => {
    return Math.min(Math.max(initialIndex, 0), Math.max(projects.length - 1, 0));
  });

  const [direction, setDirection] = useState<1 | -1>(1);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    setActiveIndex(
      Math.min(Math.max(initialIndex, 0), Math.max(projects.length - 1, 0)),
    );
  }, [initialIndex, projects.length]);

  if (projects.length === 0) {
    return (
      <div className="viewer-empty-state">
        No projects available for {sectionTitle}.
      </div>
    );
  }

  const activeProject = projects[activeIndex];
  const hasMultipleProjects = projects.length > 1;

  function goToProject(nextIndex: number) {
    if (!hasMultipleProjects) return;

    const wrappedIndex = (nextIndex + projects.length) % projects.length;
    setDirection(wrappedIndex > activeIndex || nextIndex === 0 ? 1 : -1);
    setActiveIndex(wrappedIndex);
  }

  function handleTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
    if (touchStartX.current === null) return;

    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const diff = touchStartX.current - endX;

    touchStartX.current = null;

    if (Math.abs(diff) < 45) return;

    if (diff > 0) {
      goToProject(activeIndex + 1);
    } else {
      goToProject(activeIndex - 1);
    }
  }

  return (
    <div className="mobile-book-viewer">
      <div className="mobile-book-topbar">
        <span>{sectionTitle}</span>
        <strong>
          {activeIndex + 1} / {projects.length}
        </strong>
      </div>

      <div
        className={`mobile-book-card direction-${direction}`}
        key={activeProject.projectTitle}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <ProjectPageContent
          project={activeProject}
          label={`${sectionTitle} • Project ${activeIndex + 1} of ${projects.length}`}
        />
      </div>

      {hasMultipleProjects && (
        <>
          <div className="mobile-book-controls">
            <button type="button" onClick={() => goToProject(activeIndex - 1)}>
              ‹
            </button>

            <div className="mobile-book-dots">
              {projects.map((project, index) => (
                <button
                  key={`${project.projectTitle}-${index}`}
                  type="button"
                  className={index === activeIndex ? 'active' : ''}
                  onClick={() => goToProject(index)}
                  aria-label={`Show project ${index + 1}`}
                />
              ))}
            </div>

            <button type="button" onClick={() => goToProject(activeIndex + 1)}>
              ›
            </button>
          </div>

          <p className="mobile-book-hint">
            Swipe left or right to browse {sectionTitle} projects.
          </p>
        </>
      )}
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
        {project.link &&<a className="project-link" href={project.link} target="_blank" rel="noreferrer">
          Open project
        </a>}
      </div>
    </div>
  );
}
