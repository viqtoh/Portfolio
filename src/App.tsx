import { useEffect, useMemo, useState } from 'react';
import portfolioJson from './data/portfolio.json';
import { PortfolioData, ProjectData } from './types';
import { ProfileHero } from './components/ProfileHero';
import { ProjectViewer } from './components/ProjectViewer';
import { SectionGroups } from './components/SectionGroups';
import { ThemeToggle } from './components/ThemeToggle';
import { GallerySection } from './components/GallerySection';

const portfolio = portfolioJson as PortfolioData;

type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
  const storedTheme = localStorage.getItem('portfolio-theme');
  if (storedTheme === 'light' || storedTheme === 'dark') return storedTheme;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function App() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);

  const totalSections = portfolio.sections.length;
  const totalProjects = portfolio.projects.length;

  const highlightedProjects = useMemo(
    () => portfolio.projects.filter((project) => project.sections.length >= 3),
    [],
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('portfolio-theme', theme);
  }, [theme]);

  function handleSelectProject(project: ProjectData) {
    setSelectedProject(project);
    document.getElementById('viewer')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <main className="app-shell">
      <header className="site-header">
        <a href="#profile" className="brand-mark" aria-label="Go to profile">
          <span>VA</span>
          Portfolio
        </a>
        <nav aria-label="Main navigation">
          <a href="#sections">Sections</a>
          <a href="#viewer">Viewer</a>
          <a href="#gallery">Gallery</a>
        </nav>
        <ThemeToggle
          theme={theme}
          onToggle={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
        />
      </header>

      <ProfileHero profile={portfolio.profile} />

      <section className="stats-row" aria-label="Portfolio stats">
        <div>
          <strong>{totalProjects}</strong>
          <span>Projects</span>
        </div>
        <div>
          <strong>{totalSections}</strong>
          <span>Sections</span>
        </div>
        <div>
          <strong>{highlightedProjects.length}</strong>
          <span>Cross-stack builds</span>
        </div>
      </section>

      <SectionGroups
        sections={portfolio.sections}
        projects={portfolio.projects}
        onSelectProject={handleSelectProject}
      />

      <ProjectViewer
        sections={portfolio.sections}
        projects={portfolio.projects}
        selectedProject={selectedProject}
      />

      <GallerySection items={portfolio.gallery} />
    </main>
  );
}
