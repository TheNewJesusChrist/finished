@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Dark theme (Star Wars) variables */
  --jedi-blue: #00BFFF;
  --sith-red: #FF0000;
  --force-green: #00FF7F;
  --space-dark: #0A0A0F;
  --space-blue: #1A1A2E;
  --neon-glow: 0 0 10px currentColor;
  
  /* Light theme variables */
  --light-bg: #eaf6fd;
  --light-surface: #ffffff;
        'light-bg': '#eaf6fd',
        'light-heading': '#2e3a59',
        'light-subheading': '#7da4bd',
        'light-accent': '#2996d2',
  --light-text-secondary: #475569;
  --light-accent: #2563eb;
  --light-border: #e2e8f0;
}

/* Base styles */
body {
  font-family: 'Orbitron', 'Share Tech Mono', monospace;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  transition: all 0.3s ease;
}

/* Dark theme (Star Wars) styles */
.dark body {
  background: linear-gradient(135deg, var(--space-dark) 0%, var(--space-blue) 100%);
  color: #e5e7eb;
}

/* Light theme styles */
.light body {
  background: linear-gradient(135deg, var(--light-bg) 0%, #f1f5f9 100%);
  color: var(--light-text);
}

.orbitron {
  font-family: 'Orbitron', monospace;
}

.share-tech {
  font-family: 'Share Tech Mono', monospace;
}

/* Custom scrollbar - Dark theme */
.dark ::-webkit-scrollbar {
  width: 8px;
}

.dark ::-webkit-scrollbar-track {
  background: var(--space-dark);
}

.dark ::-webkit-scrollbar-thumb {
  background: var(--jedi-blue);
  border-radius: 4px;
  box-shadow: var(--neon-glow);
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: var(--force-green);
}

/* Custom scrollbar - Light theme */
.light ::-webkit-scrollbar {
  width: 8px;
}

.light ::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.light ::-webkit-scrollbar-thumb {
  background: var(--light-accent);
  border-radius: 4px;
}

.light ::-webkit-scrollbar-thumb:hover {
  background: #1d4ed8;
}

/* Lightsaber glow effects - Dark theme only */
.dark .lightsaber-glow {
  filter: drop-shadow(0 0 5px var(--jedi-blue)) drop-shadow(0 0 10px var(--jedi-blue));
  transition: all 0.3s ease;
}

.dark .lightsaber-glow:hover {
  filter: drop-shadow(0 0 8px var(--jedi-blue)) drop-shadow(0 0 15px var(--jedi-blue)) drop-shadow(0 0 20px var(--jedi-blue));
  transform: scale(1.1);
}

/* Light theme logo hover */
.light .lightsaber-glow:hover {
  transform: scale(1.1);
  filter: drop-shadow(0 2px 4px rgba(37, 99, 235, 0.3));
}

/* BB-8 rolling animation */
@keyframes bb8-roll {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes bb8-head-tilt {
  0%, 100% { transform: rotate(-2deg); }
  50% { transform: rotate(2deg); }
}

.bb8-body {
  animation: bb8-roll 8s linear infinite;
}

.bb8-head {
  animation: bb8-head-tilt 3s ease-in-out infinite;
}

/* Star Wars button effects - Dark theme */
.dark .sw-button {
  background: linear-gradient(45deg, var(--space-dark), var(--space-blue));
  border: 1px solid var(--jedi-blue);
  color: var(--jedi-blue);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.dark .sw-button:hover {
  background: linear-gradient(45deg, var(--space-blue), var(--jedi-blue));
  color: white;
  box-shadow: 0 0 20px var(--jedi-blue);
  transform: translateY(-2px);
}

/* Light theme button styles */
.light .sw-button {
  background: linear-gradient(45deg, #ffffff, #f8fafc);
  border: 1px solid var(--light-accent);
  color: var(--light-accent);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.light .sw-button:hover {
  background: linear-gradient(45deg, var(--light-accent), #1d4ed8);
  color: white;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  transform: translateY(-2px);
}

.dark .sw-button:hover::before,
.light .sw-button:hover::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  animation: lightsaber-sweep 0.6s ease-in-out;
}

@keyframes lightsaber-sweep {
  0% { left: -100%; }
  100% { left: 100%; }
}

/* Neon text effects - Dark theme only */
.dark .neon-text {
  color: var(--jedi-blue);
  text-shadow: 
    0 0 5px var(--jedi-blue),
    0 0 10px var(--jedi-blue),
    0 0 15px var(--jedi-blue);
}

.dark .neon-text-green {
  color: var(--force-green);
  text-shadow: 
    0 0 5px var(--force-green),
    0 0 10px var(--force-green),
    0 0 15px var(--force-green);
}

.dark .neon-text-red {
  color: var(--sith-red);
  text-shadow: 
    0 0 5px var(--sith-red),
    0 0 10px var(--sith-red),
    0 0 15px var(--sith-red);
}

/* Light theme text styles */
.light .neon-text {
  color: var(--light-accent);
  font-weight: 600;
}

.light .neon-text-green {
  color: #059669;
  font-weight: 600;
}

.light .neon-text-red {
  color: #dc2626;
  font-weight: 600;
}

/* Space background pattern - Dark theme only */
.dark .space-bg {
  background: 
    radial-gradient(2px 2px at 20px 30px, #eee, transparent),
    radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
    radial-gradient(1px 1px at 90px 40px, #fff, transparent),
    radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.6), transparent),
    radial-gradient(2px 2px at 160px 30px, #ddd, transparent),
    linear-gradient(135deg, var(--space-dark) 0%, var(--space-blue) 100%);
  background-repeat: repeat;
  background-size: 200px 100px;
}

/* Light theme background */
.light .space-bg {
  background: linear-gradient(135deg, var(--light-bg) 0%, #f3f4f6 100%);
}

/* Hologram effect - Dark theme */
.dark .hologram {
  background: linear-gradient(45deg, transparent 30%, rgba(0,191,255,0.1) 50%, transparent 70%);
  border: 1px solid var(--jedi-blue);
  box-shadow: inset 0 0 20px rgba(0,191,255,0.2);
  backdrop-filter: blur(1px);
}

/* Light theme card styles */
.light .hologram {
  background: var(--light-surface);
  border: 1px solid var(--light-border);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(1px);
}

/* Force lightning effect for errors */
@keyframes force-lightning {
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
}

.force-lightning {
  animation: force-lightning 0.1s infinite;
}

/* Floating animation */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.float-animation {
  animation: float 3s ease-in-out infinite;
}

/* Pulse glow - Dark theme */
.dark .pulse-glow {
  animation: pulse-glow-dark 2s ease-in-out infinite;
}

@keyframes pulse-glow-dark {
  0%, 100% { box-shadow: 0 0 5px var(--jedi-blue); }
  50% { box-shadow: 0 0 20px var(--jedi-blue), 0 0 30px var(--jedi-blue); }
}

/* Light theme pulse */
.light .pulse-glow {
  animation: pulse-glow-light 2s ease-in-out infinite;
}

@keyframes pulse-glow-light {
  0%, 100% { box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2); }
  50% { box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4); }
}

/* Progress bar lightsaber effect - Dark theme */
.dark .progress-lightsaber {
  background: linear-gradient(90deg, var(--jedi-blue), var(--force-green));
  box-shadow: 0 0 10px var(--jedi-blue);
  position: relative;
}

.dark .progress-lightsaber::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 4px;
  height: 100%;
  background: white;
  box-shadow: 0 0 8px white;
  border-radius: 2px;
}

/* Light theme progress bar */
.light .progress-lightsaber {
  background: linear-gradient(90deg, var(--light-accent), #1d4ed8);
  position: relative;
}

/* Theme-specific text colors */
.dark .text-primary { color: #e5e7eb; }
.dark .text-secondary { color: #9ca3af; }
.dark .text-accent { color: var(--jedi-blue); }

.light .text-primary { color: var(--light-text); }
.light .text-secondary { color: var(--light-text-secondary); }
.light .text-accent { color: var(--light-accent); }

/* Theme-specific background colors */
.dark .bg-surface { background-color: rgba(30, 41, 59, 0.5); }
.dark .bg-card { background-color: rgba(15, 23, 42, 0.8); }

.light .bg-surface { background-color: var(--light-surface); }
.light .bg-card { background-color: #f8fafc; }

/* Input styles */
.dark input, .dark textarea {
  background-color: rgba(15, 23, 42, 0.8);
  border-color: rgba(59, 130, 246, 0.3);
  color: #e5e7eb;
}

.dark input:focus, .dark textarea:focus {
  border-color: var(--jedi-blue);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.light input, .light textarea {
  background-color: var(--light-surface);
  border-color: var(--light-border);
  color: var(--light-text);
}

.light input:focus, .light textarea:focus {
  border-color: var(--light-accent);
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

/* Placeholder text */
.dark input::placeholder, .dark textarea::placeholder {
  color: #6b7280;
}

.light input::placeholder, .light textarea::placeholder {
  color: var(--light-text-secondary);
}