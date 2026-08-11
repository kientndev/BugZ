'use client';

import React, { useState } from 'react';
import { Copy, Check, Terminal, ShieldAlert, ShieldCheck } from 'lucide-react';

export default function InteractiveDiffPreview() {
  const [copied, setCopied] = useState(false);

  const diffText = `--- a/server.js
+++ b/server.js
@@ -2,4 +2,4 @@
-const userId = req.query.id;
-const query = "SELECT * FROM users WHERE id = '" + userId + "'";
-db.query(query, (err, result) => {
+const query = "SELECT * FROM users WHERE id = ?";
+db.query(query, [req.query.id], (err, result) => {
   res.send(result);
 });`;

  const copyPatch = () => {
    navigator.clipboard.writeText(diffText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 px-4 sm:px-6">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between bg-zinc-950/80 px-4 py-3 rounded-t-xl border-t border-x border-slate-800/80">
        <div className="flex items-center space-x-4">
          {/* Windows Dots */}
          <div className="flex space-x-1.5 shrink-0 select-none">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/70 border border-red-650" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70 border border-yellow-650" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70 border border-emerald-650" />
          </div>
          <div className="flex items-center space-x-2 text-slate-400">
            <Terminal className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
            <span className="text-[10px] font-bold font-mono tracking-wider">BUGZ_SEC_OPS_TERMINAL // v1.1.2</span>
          </div>
        </div>
        <button
          onClick={copyPatch}
          className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 text-[10px] font-semibold text-zinc-300 transition cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy .patch</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-800/80 border-b border-x border-slate-800/80 rounded-b-xl overflow-hidden items-stretch">
        {/* Left Column: Vulnerable Code */}
        <div className="bg-[#050811] flex flex-col justify-between p-4 min-h-[220px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-900/50">
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Vulnerable Code</span>
            <span className="flex items-center space-x-1 text-[9px] font-bold bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
              <ShieldAlert className="h-3 w-3 shrink-0" />
              <span>SQL Injection</span>
            </span>
          </div>

          <div className="flex flex-1 pt-3 font-mono text-[11px] leading-relaxed overflow-x-auto text-left">
            {/* Line numbers column */}
            <div className="text-zinc-650 pr-3 select-none border-r border-zinc-900 text-right flex flex-col space-y-1">
              <div>01</div>
              <div>02</div>
              <div>03</div>
              <div>04</div>
              <div>05</div>
            </div>
            {/* Code */}
            <pre className="pl-3 text-red-400/90 whitespace-pre flex-1">
              <code>{`// Vulnerable raw query concat
const userId = req.query.id;
const query = "SELECT * FROM users WHERE id = '" + userId + "'";
db.query(query, (err, result) => {
  res.send(result);
});`}</code>
            </pre>
          </div>
        </div>

        {/* Right Column: Patched Diff */}
        <div className="bg-[#050811] flex flex-col justify-between p-4 min-h-[220px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-900/50">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">BugZ Auto-Patch</span>
            <span className="flex items-center space-x-1 text-[9px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
              <ShieldCheck className="h-3 w-3 shrink-0" />
              <span>Parameterized Patch</span>
            </span>
          </div>

          <div className="flex flex-1 pt-3 font-mono text-[11px] leading-relaxed overflow-x-auto text-left">
            {/* Line numbers column */}
            <div className="text-zinc-650 pr-3 select-none border-r border-zinc-900 text-right flex flex-col space-y-1">
              <div>01</div>
              <div>02</div>
              <div>03</div>
              <div>04</div>
              <div>05</div>
              <div>06</div>
            </div>
            {/* Code */}
            <pre className="pl-3 flex-1 overflow-x-auto text-left">
              <code>
                {diffText.split('\n').map((line, idx) => {
                  let lineStyle = 'text-zinc-550';
                  if (line.startsWith('+') && !line.startsWith('+++')) {
                    lineStyle = 'bg-emerald-950/20 text-emerald-300 border-l-2 border-emerald-500 px-1.5';
                  } else if (line.startsWith('-') && !line.startsWith('---')) {
                    lineStyle = 'bg-red-950/20 text-red-300 border-l-2 border-red-500 px-1.5 line-through';
                  } else if (line.startsWith('@@') || line.startsWith('---') || line.startsWith('+++')) {
                    lineStyle = 'text-cyan-400 font-bold';
                  }
                  return (
                    <div key={idx} className={lineStyle}>
                      {line}
                    </div>
                  );
                })}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
