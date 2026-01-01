
import React, { useState, useEffect } from 'react';
import { AudioToCode } from './components/AudioToCode';
import { 
  ICommandContext, 
  CodeOutputLanguage, 
  CodeFramework, 
  CodeGenerationMode,
  IProjectConfiguration,
  CloudProvider
} from './types';

export default function App() {
  const [projectConfig, setProjectConfig] = useState<IProjectConfiguration>({
    id: 'phoenix-001',
    name: 'Genesis Project',
    cloudProvider: CloudProvider.NONE
  });

  const [context, setContext] = useState<ICommandContext>({
    currentProjectId: 'phoenix-001',
    targetLanguage: CodeOutputLanguage.TYPESCRIPT,
    targetFramework: CodeFramework.REACT,
    generationMode: CodeGenerationMode.GENERATE_NEW,
    promptTemperature: 0.7,
    maxTokens: 4096,
  });

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Navigation Header */}
      <nav className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center px-8 justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-lg shadow-cyan-500/20 flex items-center justify-center font-bold text-white italic">
            P
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Phoenix <span className="text-cyan-400">Ascent</span></span>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex flex-col items-end">
            <span className="text-slate-400 font-medium">Project: {projectConfig.name}</span>
            <span className="text-xs text-slate-600">ID: {projectConfig.id}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
             <span className="text-xs text-slate-400">JD</span>
          </div>
        </div>
      </nav>

      <main className="flex-grow overflow-hidden relative">
        <AudioToCode 
          context={context} 
          setContext={setContext} 
          projectConfig={projectConfig}
          setProjectConfig={setProjectConfig}
        />
      </main>

      <footer className="h-10 bg-slate-900 border-t border-slate-800 flex items-center px-8 justify-between text-[10px] text-slate-500 uppercase tracking-widest">
        <span>© 2024 Phoenix Ascent Engineering</span>
        <div className="flex gap-4">
          <span>System Healthy</span>
          <span>Gemini 3 Pro Engine Connected</span>
        </div>
      </footer>
    </div>
  );
}
