import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

const apiKey = process.env.GEMINI_API_KEY;

interface GithubUrlInfo {
  type: 'file' | 'repo';
  owner: string;
  repo: string;
  branch?: string;
  filePath?: string;
}

function parseGithubUrl(urlStr: string): GithubUrlInfo | null {
  try {
    const cleaned = urlStr.trim().replace(/\/+$/, ''); // Remove trailing slashes
    const url = new URL(cleaned);
    if (!url.hostname.includes('github.com')) return null;

    const parts = url.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;

    const owner = parts[0];
    const repo = parts[1];

    // Check if it matches tree/branch/filepath structure or blob/branch/filepath
    if ((parts[2] === 'blob' || parts[2] === 'tree') && parts.length > 3) {
      const branch = parts[3];
      const filePath = parts.slice(4).join('/');
      return { type: 'file', owner, repo, branch, filePath };
    }

    return { type: 'repo', owner, repo };
  } catch {
    return null;
  }
}

async function fetchGithubFile(owner: string, repo: string, filePath: string, branch = 'main'): Promise<string> {
  // First try the raw user content URL
  const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
  let response;
  try {
    response = await fetch(rawUrl, { headers: { 'User-Agent': 'BugZ-AI-Security-Scanner' } });
  } catch (err: any) {
    throw new Error(`Failed to resolve raw user content for GitHub: ${err.message}`);
  }
  
  if (!response.ok) {
    // Attempt standard API route as fallback (handles specific encoding/branches better)
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;
    let apiResponse;
    try {
      apiResponse = await fetch(apiUrl, { headers: { 'User-Agent': 'BugZ-AI-Security-Scanner' } });
    } catch (err: any) {
      throw new Error(`GitHub API network request failed: ${err.message}`);
    }

    if (apiResponse.status === 404) {
      throw new Error(`The file "${filePath}" on branch "${branch}" was not found (404). Verify the path and branch name.`);
    } else if (apiResponse.status === 403) {
      throw new Error(`GitHub API rate limit exceeded or access forbidden (403).`);
    } else if (!apiResponse.ok) {
      throw new Error(`GitHub API returned error: ${apiResponse.statusText} (${apiResponse.status})`);
    }

    const data = await apiResponse.json();
    if (data.encoding === 'base64' && data.content) {
      return Buffer.from(data.content, 'base64').toString('utf-8');
    }
    throw new Error('Could not parse or decode file contents from GitHub API.');
  }
  return response.text();
}

async function fetchGithubRepoContents(owner: string, repo: string): Promise<string> {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents`;
  let response;
  try {
    response = await fetch(apiUrl, { headers: { 'User-Agent': 'BugZ-AI-Security-Scanner' } });
  } catch (err: any) {
    throw new Error(`Failed to connect to GitHub API: ${err.message}`);
  }
  
  if (response.status === 404) {
    throw new Error('Repository not found. Please ensure it is a public repository and the URL is spelled correctly.');
  } else if (response.status === 403) {
    throw new Error('GitHub API rate limit exceeded or access forbidden (403).');
  } else if (!response.ok) {
    throw new Error(`Failed to fetch repository contents: ${response.statusText} (${response.status})`);
  }
  
  const items = await response.json();
  if (!Array.isArray(items)) {
    throw new Error('Invalid or empty repository layout returned by GitHub.');
  }

  // Broadened file extension support
  const sourceExtensions = [
    '.js', '.jsx', '.ts', '.tsx', '.py', '.go', '.java', '.cpp', 
    '.c', '.rs', '.php', '.rb', '.cs', '.vue', '.svelte', 
    '.html', '.css', '.json', '.sql', '.sh'
  ];

  // Target directories for scan
  const targetDirs = ['src', 'app', 'pages', 'lib', 'components', 'core', 'pkg', 'server', 'client', 'main'];

  let candidateFiles: any[] = [];

  // 1. Gather matching files in the root folder
  const rootFiles = items.filter(item => 
    item.type === 'file' && sourceExtensions.some(ext => item.name.toLowerCase().endsWith(ext))
  );
  candidateFiles.push(...rootFiles);

  // 2. Identify candidate directories from root level
  const dirsToScan = items.filter(item => 
    item.type === 'dir' && targetDirs.includes(item.name.toLowerCase())
  );

  // 3. Scan top directories (limit to 4 requests max to stay within public rate limits)
  for (const dir of dirsToScan.slice(0, 4)) {
    try {
      const dirResponse = await fetch(dir.url, { headers: { 'User-Agent': 'BugZ-AI-Security-Scanner' } });
      if (dirResponse.ok) {
        const dirItems = await dirResponse.json();
        if (Array.isArray(dirItems)) {
          const matchingSubFiles = dirItems.filter(item => 
            item.type === 'file' && sourceExtensions.some(ext => item.name.toLowerCase().endsWith(ext))
          );
          candidateFiles.push(...matchingSubFiles);
        }
      }
    } catch (err) {
      console.warn(`Subdirectory search failed for ${dir.name}:`, err);
    }
  }

  // 4. Sort candidates by size descending to prioritize analyzing actual code logic
  candidateFiles.sort((a, b) => (b.size || 0) - (a.size || 0));

  // Pick up to the top 5 largest source files
  const filesToFetch = candidateFiles.slice(0, 5);

  if (filesToFetch.length === 0) {
    throw new Error("No supported source code files found in this repo. Try pasting a direct link to a specific file or raw code.");
  }

  let aggregatedCode = '';
  for (const file of filesToFetch) {
    try {
      const content = await fetchGithubFile(owner, repo, file.path);
      aggregatedCode += `\n\n// --- File: ${file.path} ---\n${content}`;
    } catch (e: any) {
      console.warn(`Failed to fetch ${file.path}: ${e.message}`);
    }
  }

  if (!aggregatedCode.trim()) {
    throw new Error("No supported source code files found in this repo. Try pasting a direct link to a specific file or raw code.");
  }

  return aggregatedCode.trim();
}

interface AuditFinding {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  name: string;
  explanation: string;
  vulnerableCode: string;
  secureCode: string;
  gitDiff?: string;
  filePath?: string;
}

export async function POST(request: Request) {
  try {
    const { codeSnippet } = await request.json();
    if (!codeSnippet) {
      return NextResponse.json({ error: 'Code or GitHub URL is required' }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY environment variable is not configured on the server.' },
        { status: 500 }
      );
    }

    let codeToAnalyze = codeSnippet;
    const githubInfo = parseGithubUrl(codeSnippet);

    if (githubInfo) {
      try {
        if (githubInfo.type === 'file') {
          codeToAnalyze = await fetchGithubFile(githubInfo.owner, githubInfo.repo, githubInfo.filePath!, githubInfo.branch);
        } else {
          codeToAnalyze = await fetchGithubRepoContents(githubInfo.owner, githubInfo.repo);
        }
      } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Error fetching GitHub contents' }, { status: 400 });
      }
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `You are BugZ, an autonomous elite code vulnerability and patch generator.
Analyze the provided source code or PR diff for security issues (e.g. hardcoded secrets, SQL/NoSQL injections, broken auth, unsanitized inputs, XSS, CSRF, directory traversal, etc.).

For each security issue found, generate a patch.
You MUST respond with a valid JSON array of security findings adhering exactly to this TypeScript schema:
[
  {
    "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
    "name": "Vulnerability Name",
    "explanation": "Clear explanation of the risk.",
    "vulnerableCode": "The bad snippet line(s)",
    "secureCode": "The patched secure line(s)",
    "gitDiff": "A standard Unified Git Diff string (e.g. starting with '--- a/source' and '+++ b/source') displaying the removal of vulnerableCode and addition of secureCode.",
    "filePath": "The relative path of the file containing this vulnerability. If the input is raw code and not from a repository, use a default filename like 'index.js'."
  }
]

If no security issues are found, return a clean empty array [].
Do NOT generate hypothetical or generic placeholders. Only report explicit security flaws with exact line snippets.
Do not wrap your response in markdown code blocks or add any text outside of the JSON array. Output strictly valid JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze this code:\n\n${codeToAnalyze}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              severity: { type: 'STRING' },
              name: { type: 'STRING' },
              explanation: { type: 'STRING' },
              vulnerableCode: { type: 'STRING' },
              secureCode: { type: 'STRING' },
              gitDiff: { type: 'STRING' },
              filePath: { type: 'STRING' }
            },
            required: ['severity', 'name', 'explanation', 'vulnerableCode', 'secureCode']
          }
        },
        maxOutputTokens: 8192,
      }
    });

    const responseText = response.text ? response.text.trim() : '';
    let jsonText = responseText;
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(json)?\n/, '').replace(/\n```$/, '').trim();
    }

    // Helper to sanitize unescaped control characters (like raw newlines/tabs) inside JSON string values.
    const cleanJsonText = (rawJson: string): string => {
      let inString = false;
      let escaped = false;
      let cleaned = '';
      for (let i = 0; i < rawJson.length; i++) {
        const char = rawJson[i];
        if (escaped) {
          cleaned += char;
          escaped = false;
          continue;
        }
        if (char === '\\') {
          cleaned += char;
          escaped = true;
          continue;
        }
        if (char === '"') {
          inString = !inString;
          cleaned += char;
          continue;
        }
        if (inString) {
          if (char === '\n') {
            cleaned += '\\n';
          } else if (char === '\r') {
            cleaned += '\\r';
          } else if (char === '\t') {
            cleaned += '\\t';
          } else if (char.charCodeAt(0) < 32) {
            cleaned += '\\u' + char.charCodeAt(0).toString(16).padStart(4, '0');
          } else {
            cleaned += char;
          }
        } else {
          cleaned += char;
        }
      }
      return cleaned;
    };

    const parsedJsonText = cleanJsonText(jsonText);

    // Self-healing parser for truncated responses
    const parseSanitizedJson = (text: string) => {
      try {
        return JSON.parse(text);
      } catch (err) {
        console.warn("JSON parse failed, attempting self-healing on truncated array:", err);
        const trimmed = text.trim();
        if (trimmed.startsWith('[')) {
          const lastBrace = trimmed.lastIndexOf('}');
          if (lastBrace !== -1) {
            try {
              const repaired = trimmed.substring(0, lastBrace + 1) + ']';
              return JSON.parse(repaired);
            } catch (e) {
              // Ignore failure
            }
          }
        }
        return [];
      }
    };
    
    const auditResults = parseSanitizedJson(parsedJsonText);
    const validVulnerabilities = Array.isArray(auditResults)
      ? auditResults.filter(
          (v: any) =>
            v &&
            v.vulnerableCode &&
            v.vulnerableCode.trim() !== '' &&
            v.name &&
            v.name !== 'Security Flaw'
        )
      : [];

    return NextResponse.json(validVulnerabilities);
  } catch (error: any) {
    console.error('Audit API error:', error);
    return NextResponse.json({ error: error.message || 'An error occurred during code analysis.' }, { status: 500 });
  }
}


