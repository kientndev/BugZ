'use client';

import React, { useState, useEffect, useRef } from 'react';

interface LogLine {
  timestamp: string;
  type: string;
  text: string;
}

const AUDIT_STEPS = [
  { delay: 100, type: 'INGEST', text: 'Initializing isolated execution sandbox...' },
  { delay: 400, type: 'INGEST', text: 'Target ingested: Parsing Abstract Syntax Tree (AST)...' },
  { delay: 800, type: 'AST_SEARCH', text: 'Analyzing control flow & dependency parameters.' },
  { delay: 1350, type: 'GEMINI_PRO', text: 'Invoking Gemini Pro security reasoning pipeline...' },
  { delay: 2000, type: 'OWASP_CHECK', text: 'Evaluating threat vectors against OWASP templates...' },
  { delay: 2800, type: 'PATCH_SYNTH', text: 'Synthesizing recommendations & AST patches...' },
];

export default function TerminalAuditStream() {
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [timer, setTimer] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Time formatter [HH:MM:SS]
  const getTimestamp = () => {
    const d = new Date();
    return d.toTimeString().split(' ')[0];
  };

  // 1. Logs Append Engine
  useEffect(() => {
    const timers = AUDIT_STEPS.map((step) => {
      return setTimeout(() => {
        setLogs((prev) => [
          ...prev,
          {
            timestamp: getTimestamp(),
            type: step.type,
            text: step.text
          }
        ]);
      }, step.delay);
    });

    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  // 2. Millisecond stopwatch
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((t) => t + 10);
    }, 10);

    return () => clearInterval(interval);
  }, []);

  // 3. Scroll-to-bottom anchor
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // Color mapping helper
  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'INGEST': return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/30';
      case 'AST_SEARCH': return 'text-cyan-400 bg-cyan-950/40 border-cyan-800/30';
      case 'GEMINI_PRO': return 'text-purple-400 bg-purple-950/40 border-purple-800/30';
      case 'OWASP_CHECK': return 'text-yellow-400 bg-yellow-950/40 border-yellow-800/30';
      case 'PATCH_SYNTH': return 'text-emerald-305 bg-emerald-950/30 border-emerald-800/20';
      case 'SUCCESS': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-zinc-400 bg-zinc-900 border-zinc-800';
    }
  };

  const getFormatTime = (ms: number) => {
    const totalSecs = (ms / 1000).toFixed(2);
    return `${totalSecs}s`;
  };

  const step1Status = logs.length >= 3 ? '✓' : '...';
  const step2Status = logs.length >= 5 ? '✓' : (logs.length >= 3 ? '...' : ' ');
  const step3Status = logs.length >= 6 ? '✓' : (logs.length >= 5 ? '...' : ' ');

  return (
    <div className="w-full bg-[#050811] border border-cyan-500/30 rounded-xl shadow-2xl shadow-cyan-950/20 font-mono text-[11px] text-zinc-300 p-5 relative overflow-hidden flex flex-col h-[420px] transition-all">
      
      {/* Scanline overlay */}
      <div className="absolute inset-0 bg-scanlines pointer-events-none opacity-[0.02]"></div>

      {/* Top Window Bar */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4 select-none">
        <div className="flex space-x-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/70 border border-red-650"></span>
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70 border border-yellow-650"></span>
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70 border border-emerald-650"></span>
        </div>
        <div className="text-[10px] text-zinc-500 font-bold">
          BUGZ_CORE_AUDIT_KERNEL // v1.0.4
        </div>
        <div className="text-[10px] text-cyan-400 font-bold">
          EXEC_TIME: {getFormatTime(timer)}
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0">
        {/* Left column: Radar Graphic & Pipeline */}
        <div className="flex flex-col items-center justify-center space-y-4 md:w-1/3 shrink-0 border-b md:border-b-0 md:border-r border-slate-900 pb-4 md:pb-0 md:pr-4">
          {/* Active Radar Graphic */}
          <div className="relative w-28 h-28 rounded-full border border-cyan-500/35 flex items-center justify-center bg-zinc-950/80 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
            {/* Concentric rings */}
            <div className="absolute inset-3 rounded-full border border-cyan-500/20" />
            <div className="absolute inset-6 rounded-full border border-cyan-500/10" />
            <div className="absolute inset-10 rounded-full border border-cyan-500/5" />
            
            {/* Pulsing ring */}
            <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-ping [animation-duration:3s]" />
            
            {/* Sweep line */}
            <div className="absolute inset-0 rounded-full border-r border-t border-cyan-400/40 animate-[spin_4s_linear_infinite]" />
            
            {/* Scanning text indicator */}
            <span className="text-[8px] font-bold tracking-widest text-cyan-400 animate-pulse uppercase">Scanning</span>
          </div>

          {/* Pipeline Progress Status */}
          <div className="w-full space-y-2 text-[10px] bg-slate-950/50 p-3 rounded-lg border border-slate-900">
            <div className="flex items-center space-x-2">
              <span className={`w-3.5 h-3.5 flex items-center justify-center rounded border font-bold text-[8px] ${step1Status === '✓' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5' : 'text-cyan-400 border-cyan-500/30 animate-pulse'}`}>
                {step1Status}
              </span>
              <span className={step1Status === '✓' ? 'text-slate-300 font-semibold' : 'text-slate-500'}>Parsed AST & Dependencies</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`w-3.5 h-3.5 flex items-center justify-center rounded border font-bold text-[8px] ${step2Status === '✓' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5' : (step2Status === '...' ? 'text-cyan-400 border-cyan-500/30 animate-pulse' : 'text-slate-700 border-slate-900')}`}>
                {step2Status}
              </span>
              <span className={step2Status === '✓' ? 'text-slate-300 font-semibold' : (step2Status === '...' ? 'text-slate-400' : 'text-slate-550')}>AI Vulnerability Audit</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`w-3.5 h-3.5 flex items-center justify-center rounded border font-bold text-[8px] ${step3Status === '✓' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5' : (step3Status === '...' ? 'text-cyan-400 border-cyan-500/30 animate-pulse' : 'text-slate-700 border-slate-900')}`}>
                {step3Status}
              </span>
              <span className={step3Status === '✓' ? 'text-slate-300 font-semibold' : (step3Status === '...' ? 'text-slate-400' : 'text-slate-550')}>Synthesizing One-Click Patches</span>
            </div>
          </div>
        </div>

        {/* Right column: Log Output Terminal */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-zinc-900 scrollbar-track-transparent text-left"
        >
          {logs.map((log, index) => (
            <div key={index} className="flex items-start space-x-2 leading-relaxed animate-fade-in">
              <span className="text-zinc-600 shrink-0">[{log.timestamp}]</span>
              <span className={`px-1.5 py-0.5 rounded border text-[9px] font-bold shrink-0 leading-none ${getBadgeColor(log.type)}`}>
                {log.type}
              </span>
              <span className="text-zinc-300">{log.text}</span>
            </div>
          ))}
          
          {/* Blinking cursor line */}
          <div className="flex items-center space-x-2 pt-1">
            <span className="text-zinc-650 animate-pulse">bugz@audit-kernel:~$</span>
            <span className="w-1.5 h-3.5 bg-cyan-400 animate-blink"></span>
          </div>
        </div>
      </div>
    </div>
  );
}
