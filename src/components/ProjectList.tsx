import { Link } from 'react-router-dom';
import { Project } from '../types';

interface ProjectListProps {
  projects: Project[];
}

export default function ProjectList({ projects }: ProjectListProps) {
  return (
    <div className="min-h-screen bg-sustainability-bg p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-5xl font-bold text-sustainability-gray mb-2">Malama Credit Explorer</h1>
          <p className="text-lg text-sustainability-gray/70">Carbon Project Data Visualization Dashboard</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`/project/${project.id}`}
              className="bg-white rounded-card border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-6 hover:border-sustainability-teal/30"
            >
              <div className="flex items-baseline gap-3 mb-5">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-sustainability-green to-sustainability-teal flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-lg">
                    {project.name.charAt(0)}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-sustainability-gray flex-1 truncate">
                  {project.name}
                </h2>
              </div>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-bold text-sustainability-green">
                  {project.co2Quantity.toLocaleString()}
                </span>
                <span className="text-sm text-sustainability-gray/70 font-medium">kg CO₂e</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-sustainability-gray/60">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-sustainability-sky" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.727A8 8 0 0120 10c0-4.418-3.582-8-8-8S4 5.582 4 10a8 8 0 012.343 6.727L12 22l5.657-5.273z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>{project.location.lat.toFixed(3)}, {project.location.lng.toFixed(3)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-sustainability-gray/60">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-sustainability-sky" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <span>{new Date(project.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

