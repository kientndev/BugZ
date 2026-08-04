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
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center space-x-2 text-zinc-300">
          <Terminal className="h-4 w-4 text-emerald-500" />
          <span className="text-xs font-semibold font-mono">BugZ Interactive Diff Visualizer</span>
        </div>
        <button
          onClick={copyPatch}
          className="flex items-center space-x-1.5 px-3 py-1 rounded bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-[10px] font-semibold text-zinc-300 transition"
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Left Column: Vulnerable Code */}
        <div className="border border-red-950 bg-red-950/5 rounded-xl overflow-hidden flex flex-col justify-between">
          <div className="bg-red-950/20 border-b border-red-950/40 px-4 py-2.5 flex items-center justify-between">
            <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider">Vulnerable Code</span>
            <span className="flex items-center space-x-1 text-[10px] font-semibold bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
              <ShieldAlert className="h-3 w-3" />
              <span>SQL Injection</span>
            </span>
          </div>

          <pre className="p-4 text-xs font-mono text-red-300/80 overflow-x-auto whitespace-pre-wrap leading-relaxed flex-1">
            <code>{`// Vulnerable raw query concat
const userId = req.query.id;
const query = "SELECT * FROM users WHERE id = '" + userId + "'";
db.query(query, (err, result) => {
  res.send(result);
});`}</code>
          </pre>
        </div>

        {/* Right Column: Patched Diff */}
        <div className="border border-emerald-950 bg-emerald-950/5 rounded-xl overflow-hidden flex flex-col justify-between">
          <div className="bg-emerald-950/20 border-b border-emerald-950/40 px-4 py-2.5 flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">BugZ Auto-Patch</span>
            <span className="flex items-center space-x-1 text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
              <ShieldCheck className="h-3 w-3" />
              <span>Parameterized Patch</span>
            </span>
          </div>

          <pre className="p-4 text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed flex-1 bg-zinc-950/50">
            <code>
              {diffText.split('\n').map((line, idx) => {
                let lineStyle = 'text-zinc-500';
                if (line.startsWith('+') && !line.startsWith('+++')) {
                  lineStyle = 'bg-emerald-950/40 text-emerald-300 border-l-2 border-emerald-500 px-1.5';
                } else if (line.startsWith('-') && !line.startsWith('---')) {
                  lineStyle = 'bg-red-950/40 text-red-300 border-l-2 border-red-500 px-1.5 line-through';
                } else if (line.startsWith('@@') || line.startsWith('---') || line.startsWith('+++')) {
                  lineStyle = 'text-zinc-450 font-bold';
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
  );
}
