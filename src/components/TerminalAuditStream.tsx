'use client';

import React, { useState, useEffect, useRef } from 'react';

interface LogLine {
  timestamp: string;
  type: string;
  text: string;
}

const AUDIT_STEPS = [
  { delay: 400, type: 'INGEST', text: 'Initializing isolated execution sandbox...' },
  { delay: 1200, type: 'INGEST', text: 'Target ingested: Parsing Abstract Syntax Tree (AST)...' },
  { delay: 2200, type: 'AST_SEARCH', text: 'Flagged dynamic query concatenation in handler route.' },
  { delay: 3500, type: 'GEMINI_PRO', text: 'Invoking Gemini Pro 1.5 security reasoning pipeline...' },
  { delay: 5000, type: 'OWASP_CHECK', text: 'Threat matched: OWASP A03:2021 (Injection) / CWE-89.' },
  { delay: 6500, type: 'PATCH_SYNTH', text: 'Synthesizing parameterized patch & verifying syntax...' },
  { delay: 7800, type: 'SUCCESS', text: 'Audit complete. 1 Critical vulnerability remediated.' }
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

  return (
    <div className="w-full bg-zinc-950 border border-emerald-500/30 rounded-lg shadow-2xl shadow-emerald-950/20 font-mono text-[11px] text-zinc-305 p-4 relative overflow-hidden flex flex-col h-[400px]">
      
      {/* Scanline overlay */}
      <div className="absolute inset-0 bg-scanlines pointer-events-none opacity-[0.03]"></div>

      {/* Top Window Bar */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-3 select-none">
        <div className="flex space-x-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/70 border border-red-650"></span>
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70 border border-yellow-650"></span>
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70 border border-emerald-650"></span>
        </div>
        <div className="text-[10px] text-zinc-500 font-bold">
          BUGZ_CORE_AUDIT_KERNEL // v1.0.4
        </div>
        <div className="text-[10px] text-emerald-400 font-bold">
          EXEC_TIME: {getFormatTime(timer)}
        </div>
      </div>

      {/* Terminal logs list */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-zinc-900 scrollbar-track-transparent"
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
          <span className="w-1.5 h-3.5 bg-emerald-500 animate-blink"></span>
        </div>
      </div>
    </div>
  );
}
