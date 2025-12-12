import { Link } from 'react-router-dom';
import { Project } from '../types';

interface ProjectListProps {
  projects: Project[];
}

// Get project image based on methodology
const getProjectImage = (methodology?: string): string => {
  if (methodology === 'enhanced_rock_weathering') {
    return '/images/lifecycle/rock_analysis_report.png';
  }
  // Default to biochar
  return '/images/lifecycle/pyrolysis.png';
};

// Get methodology label
const getMethodologyLabel = (methodology?: string): string => {
  if (methodology === 'enhanced_rock_weathering') {
    return 'Enhanced Rock Weathering';
  }
  return 'Biochar';
};

// Get methodology badge color
const getMethodologyBadgeColor = (methodology?: string): string => {
  if (methodology === 'enhanced_rock_weathering') {
    return 'bg-slate-100 text-slate-700 border-slate-300';
  }
  return 'bg-green-50 text-green-700 border-green-300';
};

export default function ProjectList({ projects }: ProjectListProps) {
  return (
    <div className="min-h-screen bg-sustainability-bg p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-5xl font-bold text-sustainability-gray mb-2">Malama Credit Explorer</h1>
          <p className="text-lg text-sustainability-gray/70">Carbon Project Data Visualization Dashboard</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const projectImage = getProjectImage(project.methodology);
            const methodologyLabel = getMethodologyLabel(project.methodology);
            const badgeColor = getMethodologyBadgeColor(project.methodology);
            
            return (
              <Link
                key={project.id}
                to={`/project/${project.id}`}
                className="bg-white rounded-card border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden hover:border-sustainability-teal/30 group"
              >
                {/* Project Image */}
                <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-sustainability-bg to-gray-100">
                  <img
                    src={projectImage}
                    alt={`${project.name} - ${methodologyLabel}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      // Fallback to gradient if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.className += ' bg-gradient-to-br from-sustainability-green/20 to-sustainability-teal/20';
                    }}
                  />
                  {/* Methodology Badge */}
                  <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold border ${badgeColor} shadow-sm`}>
                    {methodologyLabel}
                  </div>
                </div>
                
                {/* Project Content */}
                <div className="p-6">
                  <div className="flex items-baseline gap-3 mb-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-sustainability-green to-sustainability-teal flex items-center justify-center shadow-sm flex-shrink-0">
                      <span className="text-white font-bold text-base">
                        {project.name.charAt(0)}
                      </span>
                    </div>
                    <h2 className="text-xl font-semibold text-sustainability-gray flex-1 truncate">
                      {project.name}
                    </h2>
                  </div>
                  
                  {/* Protocol and Project ID */}
                  {project.protocol && (
                    <div className="mb-3 space-y-1">
                      <div className="text-xs font-semibold text-sustainability-gray/70 uppercase tracking-wide">Protocol</div>
                      <div className="text-sm text-sustainability-gray">{project.protocol}</div>
                    </div>
                  )}
                  
                  {project.projectId && (
                    <div className="mb-3 space-y-1">
                      <div className="text-xs font-semibold text-sustainability-gray/70 uppercase tracking-wide">Project ID</div>
                      <div className="text-sm font-mono text-sustainability-gray">{project.projectId}</div>
                    </div>
                  )}
                  
                  {/* Project Design Document Link */}
                  {project.projectDesignDocument && (
                    <div className="mb-3">
                      <a
                        href={project.projectDesignDocument}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-2 text-sm text-sustainability-teal hover:text-sustainability-green hover:underline font-medium"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Project Design Document (PDD)</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  )}
                  
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl font-bold text-sustainability-green">
                      {project.co2Quantity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-sm text-sustainability-gray/70 font-medium">kg CO₂e</span>
                  </div>
                  
                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-sustainability-gray/60">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-sustainability-sky flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.727A8 8 0 0120 10c0-4.418-3.582-8-8-8S4 5.582 4 10a8 8 0 012.343 6.727L12 22l5.657-5.273z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span className="truncate">{project.location.lat.toFixed(3)}, {project.location.lng.toFixed(3)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-sustainability-gray/60">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-sustainability-sky flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      <span>{new Date(project.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

