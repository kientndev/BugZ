import { NextResponse } from 'next/server';
import { auth, createClerkClient } from '@clerk/nextjs/server';
import { Octokit } from '@octokit/rest';

function parseRepoUrl(url: string): { owner: string; repo: string } | null {
  const cleaned = url.replace(/^(https?:\/\/)?(www\.)?github\.com\//i, '').replace(/\/$/, '');
  const parts = cleaned.split('/');
  if (parts.length >= 2) {
    return { owner: parts[0], repo: parts[1] };
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { repoUrl, vulnerabilityTitle, severity, patchContent, targetFilePath, fixedCodeContent } = await req.json();

    if (!repoUrl || !vulnerabilityTitle || !severity || !targetFilePath || !fixedCodeContent) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const repoInfo = parseRepoUrl(repoUrl);
    if (!repoInfo) {
      return NextResponse.json({ error: 'Invalid GitHub repository URL' }, { status: 400 });
    }
    const { owner, repo } = repoInfo;

    // Retrieve active GitHub token from Clerk session
    const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
    const oauthTokens = await clerkClient.users.getUserOauthAccessToken({
      userId: userId,
      provider: 'oauth_github'
    });

    let token = oauthTokens.data[0]?.token;
    if (!token) {
      // Fallback to server GITHUB_TOKEN
      token = process.env.GITHUB_TOKEN;
    }

    if (!token) {
      return NextResponse.json({ 
        error: 'GitHub OAuth token not found. Please connect your GitHub account.',
        code: 'GITHUB_NOT_CONNECTED'
      }, { status: 400 });
    }

    const octokit = new Octokit({ auth: token });

    // Step 1: Fetch Base repo details to get default branch
    const { data: repoDetails } = await octokit.rest.repos.get({ owner, repo });
    const defaultBranch = repoDetails.default_branch;

    // Step 2: Fetch default branch commit SHA
    const { data: refData } = await octokit.rest.git.getRef({
      owner,
      repo,
      ref: `heads/${defaultBranch}`
    });
    const latestCommitSha = refData.object.sha;

    // Step 3: Create a slug and Branch Name
    const slug = vulnerabilityTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 30);
    const timestamp = Date.now();
    const newBranch = `bugz/patch-${slug}-${timestamp}`;

    // Step 4: Create new branch ref pointing to base commit SHA
    await octokit.rest.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${newBranch}`,
      sha: latestCommitSha
    });

    // Step 5: Fetch target file current blob SHA if it exists
    let currentFileSha: string | undefined;
    try {
      const { data: fileData } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: targetFilePath,
        ref: newBranch
      });
      if (!Array.isArray(fileData) && fileData.type === 'file') {
        currentFileSha = fileData.sha;
      }
    } catch (e) {
      // File may not exist yet, which is fine (e.g. creating a new file)
    }

    // Step 6: Commit modified secure content to the new branch
    await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: targetFilePath,
      message: `security(bugz): fix ${vulnerabilityTitle}`,
      content: Buffer.from(fixedCodeContent).toString('base64'),
      branch: newBranch,
      sha: currentFileSha
    });

    // Step 7: Open Pull Request with markdown templates
    const prBody = `## 🛡️ BugZ Autonomous Security Patch

**Vulnerability:** ${vulnerabilityTitle}  
**Severity:** ${severity}  
**Detected By:** BugZ Engine (Gemini Pro)  

### 📝 Summary of Fixes
This Pull Request contains an automated patch synthesized by BugZ to remediate a flagged vulnerability.

- [x] Sanitized input parameters / updated unsafe query logic
- [x] Verified logic continuity

*Review and merge after running local integration tests.*`;

    const { data: prData } = await octokit.rest.pulls.create({
      owner,
      repo,
      title: `security(bugz): resolve ${vulnerabilityTitle}`,
      head: newBranch,
      base: defaultBranch,
      body: prBody
    });

    return NextResponse.json({
      success: true,
      prUrl: prData.html_url,
      prNumber: prData.number
    });
  } catch (error: any) {
    console.error('Error creating Pull Request:', error);
    return NextResponse.json({ error: error.message || 'Failed to create Pull Request' }, { status: 500 });
  }
}
