import { NextResponse } from 'next/server';
import { auth, createClerkClient } from '@clerk/nextjs/server';
import { Octokit } from '@octokit/rest';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
    const oauthTokens = await clerkClient.users.getUserOauthAccessToken(userId, 'oauth_github');

    const token = oauthTokens.data[0]?.token;
    if (!token) {
      return NextResponse.json({ 
        error: 'GitHub account not connected', 
        code: 'GITHUB_NOT_CONNECTED' 
      }, { status: 400 });
    }

    const octokit = new Octokit({ auth: token });
    const response = await octokit.rest.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 30,
      type: 'all'
    });

    const repos = response.data.map(repo => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      isPrivate: repo.private,
      defaultBranch: repo.default_branch,
      language: repo.language || 'Plain Text',
      updatedAt: repo.updated_at,
      cloneUrl: repo.clone_url
    }));

    return NextResponse.json(repos);
  } catch (error: any) {
    console.error('Error fetching user repositories:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch repositories' }, { status: 500 });
  }
}
