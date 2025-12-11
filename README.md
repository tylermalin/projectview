# Malama Credit Explorer

A web application for exploring carbon projects and visualizing the data that proves carbon drawdown. The app displays major lifecycle events and sensor readings along the path of credit creation, with an interactive map showing where each event occurred.

## Features

- **Project Explorer**: Browse a list of carbon projects with key metrics
- **Project Detail View**: 
  - Left panel: Timeline of lifecycle events and sensor readings
  - Right panel: Interactive map showing event locations with path visualization
- **Event Stepping**: Click through events sequentially to see the path drawn on the map
- **Sensor Readings**: Includes various sensor data types:
  - Biochar Weight readings
  - Reactor Feedstock Images
  - Reactor Temperature readings
  - Reactor Runtime (with start/stop times and GPS)
  - Finished Biochar Weight
  - Soil Temperature readings
  - Project Land Baseline Carbon (with soil/biomass breakdown and evidence)
  - Current Carbon Sequestration

## Technology Stack

- React 18 with TypeScript
- React Router for navigation
- Tailwind CSS for styling
- Leaflet/React-Leaflet for interactive maps
- Vite for build tooling

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to the URL shown in the terminal (typically http://localhost:5173)

## Project Structure

```
src/
  components/
    ProjectList.tsx      # List view of all projects
    ProjectDetail.tsx    # Detail view with timeline and map
  data/
    mockData.ts          # Sample project data
  types.ts               # TypeScript type definitions
  App.tsx                # Main app component with routing
  main.tsx               # Entry point
  index.css              # Global styles
```

## Usage

1. From the home page, select a project from the list
2. In the project detail view:
   - Scroll through the timeline on the left to see all events
   - Click on events sequentially to step through them
   - Watch the map on the right update with markers and path as you progress
   - Each event shows relevant sensor data and evidence

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Deployment

### Vercel Deployment

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)

2. Import your project in [Vercel](https://vercel.com):
   - Click "New Project"
   - Import your Git repository
   - Vercel will auto-detect Vite settings
   - Click "Deploy"

3. Your app will be live at `https://your-project.vercel.app`

### Environment Variables

Currently, no environment variables are required. If you need to add API keys or other secrets in the future:
- Add them in Vercel Dashboard → Project Settings → Environment Variables
- Prefix with `VITE_` for Vite to expose them (e.g., `VITE_API_KEY`)

## Git Setup

The project is already configured with:
- `.gitignore` - Excludes `node_modules`, `dist`, and other build artifacts
- `vercel.json` - Vercel deployment configuration for SPA routing
- Repository: https://github.com/tylermalin/projectview.git

