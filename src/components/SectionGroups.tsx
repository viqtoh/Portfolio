import { PortfolioSection, ProjectData } from '../types';

interface SectionGroupsProps {
  sections: PortfolioSection[];
  projects: ProjectData[];
  onSelectProject: (project: ProjectData) => void;
}

export function SectionGroups({ sections, projects, onSelectProject }: SectionGroupsProps) {
  return (
    <section className="section-groups" id="sections">
  <div className="section-heading">
    <span className="eyebrow">Expertise</span>
    <h2>Projects by Technology Stack</h2>
    <p>
      Explore my work organized by the tools and frameworks used. 
      This section is built with a <strong>modular logic</strong> that automatically 
      sorts and displays projects based on their technical requirements.
    </p>
  </div>

      <div className="group-grid">
        {sections.map((section) => {
          const matchingProjects = projects.filter((project) =>
            project.sections.includes(section.title),
          );

          return (
            <article className="group-card" key={section.title}>
              <div className="group-card-header">
                <h3>{section.title}</h3>
                <span>{matchingProjects.length} project{matchingProjects.length === 1 ? '' : 's'}</span>
              </div>

              {matchingProjects.length > 0 ? (
                <ul>
                  {matchingProjects.map((project) => (
                    <li key={`${section.title}-${project.projectTitle}`}>
                      <button type="button" onClick={() => onSelectProject(project)}>
                        <strong>{project.projectTitle}</strong>
                        <small>{project.summary}</small>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-state">No projects yet.</p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
