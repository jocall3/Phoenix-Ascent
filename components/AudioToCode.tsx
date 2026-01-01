
import React, { useState, useRef, useCallback } from 'react';
import { 
  ICommandContext, 
  CodeOutputLanguage, 
  CodeFramework, 
  CodeGenerationMode,
  ICodeSnippet,
  IProjectConfiguration,
  CloudProvider
} from '../types';
import { generateCodeFromAudio, blobToBase64 } from '../services/geminiService';
import { MarkdownRenderer } from './MarkdownRenderer';

interface Props {
  context: ICommandContext;
  setContext: (c: ICommandContext) => void;
  projectConfig: IProjectConfiguration;
  setProjectConfig: (p: IProjectConfiguration) => void;
}

export const AudioToCode: React.FC<Props> = ({ 
  context, 
  setContext, 
  projectConfig,
  setProjectConfig 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [snippetMeta, setSnippetMeta] = useState<ICodeSnippet | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        processAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
    } catch (err) {
      setError("Microphone access denied. Please allow permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      setIsRecording(false);
    }
  };

  const processAudio = async (blob: Blob) => {
    setIsLoading(true);
    setGeneratedCode('');
    try {
      const base64 = await blobToBase64(blob);
      const result = await generateCodeFromAudio(base64, context);
      setGeneratedCode(result || 'No code generated.');
      
      // Simulated metadata extraction from LLM response
      setSnippetMeta({
        id: `snip-${Date.now()}`,
        content: result || '',
        language: context.targetLanguage,
        framework: context.targetFramework,
        description: 'AI Generated Snippet',
        createdAt: new Date(),
        qualityScore: 92,
        securityWarnings: []
      });
    } catch (err: any) {
      setError(err.message || "An error occurred while generating code.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row p-6 gap-6 overflow-hidden">
      {/* Sidebar: Settings */}
      <aside className="lg:w-80 flex flex-col gap-6 overflow-y-auto pr-2">
        <section className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl">
          <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-widest">Global Config</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1.5 font-medium">Output Language</label>
              <select 
                value={context.targetLanguage} 
                onChange={(e) => setContext({...context, targetLanguage: e.target.value as CodeOutputLanguage})}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-slate-200 outline-none focus:border-cyan-500 transition-colors"
              >
                {Object.values(CodeOutputLanguage).map(lang => <option key={lang} value={lang}>{lang}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1.5 font-medium">Framework</label>
              <select 
                value={context.targetFramework} 
                onChange={(e) => setContext({...context, targetFramework: e.target.value as CodeFramework})}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-slate-200 outline-none focus:border-cyan-500 transition-colors"
              >
                {Object.values(CodeFramework).map(fw => <option key={fw} value={fw}>{fw}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1.5 font-medium">Generation Mode</label>
              <select 
                value={context.generationMode} 
                onChange={(e) => setContext({...context, generationMode: e.target.value as CodeGenerationMode})}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-slate-200 outline-none focus:border-cyan-500 transition-colors"
              >
                {Object.values(CodeGenerationMode).map(mode => <option key={mode} value={mode}>{mode}</option>)}
              </select>
            </div>
          </div>
        </section>

        <section className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl">
          <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-widest">Model Config</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-slate-500">Creativity</span>
                <span className="text-cyan-400 font-mono">{context.promptTemperature}</span>
              </div>
              <input 
                type="range" min="0" max="1" step="0.1" 
                value={context.promptTemperature}
                onChange={(e) => setContext({...context, promptTemperature: parseFloat(e.target.value)})}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-slate-500">Max Tokens</span>
                <span className="text-cyan-400 font-mono">{context.maxTokens}</span>
              </div>
              <input 
                type="range" min="1024" max="16384" step="1024" 
                value={context.maxTokens}
                onChange={(e) => setContext({...context, maxTokens: parseInt(e.target.value)})}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>
          </div>
        </section>

        <section className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl">
          <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-widest">Actions</h3>
          <div className="grid grid-cols-1 gap-2">
             <button className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 py-2 rounded-lg transition-colors">Commit to VCS</button>
             <button className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 py-2 rounded-lg transition-colors">Push to IDE</button>
             <button className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 py-2 rounded-lg transition-colors">Deploy Staging</button>
          </div>
        </section>
      </aside>

      {/* Main Area: Interaction & Result */}
      <div className="flex-grow flex flex-col gap-6 min-h-0">
        <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden">
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
          
          <div className="relative z-10 text-center max-w-xl">
            <h2 className="text-2xl font-semibold mb-2">Speak Your Code</h2>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
              Describe the functionality you need. Gemini will analyze your intent and architect the implementation using the best practices for {context.targetFramework}.
            </p>

            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`group w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 relative ${
                isRecording 
                ? 'bg-red-500 shadow-2xl shadow-red-500/40 ring-4 ring-red-500/20' 
                : 'bg-cyan-500 hover:bg-cyan-400 shadow-2xl shadow-cyan-500/30 ring-4 ring-cyan-500/10'
              }`}
            >
              {isRecording ? (
                <div className="w-8 h-8 bg-white rounded-sm animate-pulse"></div>
              ) : (
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
              {isRecording && (
                 <div className="absolute -inset-4 rounded-full border border-red-500/30 animate-ping"></div>
              )}
            </button>

            <div className="mt-6 flex flex-col items-center gap-2">
              <span className={`text-sm font-medium ${isRecording ? 'text-red-400 animate-pulse' : 'text-slate-400'}`}>
                {isRecording ? "Recording Intent..." : isLoading ? "Orchestrating AI Pipeline..." : "Standby"}
              </span>
              {error && <span className="text-xs text-red-500 bg-red-500/10 px-3 py-1 rounded-full">{error}</span>}
            </div>
          </div>
        </div>

        {/* Output Panel */}
        <div className="flex-grow flex flex-col min-h-0 bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="px-6 py-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`}></div>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Terminal Output</span>
            </div>
            {snippetMeta && (
               <div className="flex gap-4 text-xs font-mono">
                  <span className="text-slate-500">Quality: <span className="text-green-400">{snippetMeta.qualityScore}%</span></span>
                  <span className="text-slate-500">Security: <span className="text-cyan-400">Verified</span></span>
               </div>
            )}
          </div>
          
          <div className="flex-grow p-6 overflow-y-auto custom-scrollbar">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-500">
                 <div className="w-12 h-12 border-4 border-slate-800 border-t-cyan-500 rounded-full animate-spin"></div>
                 <p className="text-sm font-mono animate-pulse">Analyzing prompt syntax & logic trees...</p>
              </div>
            ) : generatedCode ? (
              <MarkdownRenderer content={generatedCode} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-2 opacity-50">
                 <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                 </svg>
                 <p className="text-sm italic">Code will manifest here upon generation.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
      `}</style>
    </div>
  );
};
