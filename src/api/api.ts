import { NextPageContext } from 'next';
import { destroyCookie, parseCookies, setCookie } from 'nookies';

import {
  GITHUB_COOKIE_KEY,
  GITHUB_RATE_LIMIT_EXCEEDED_ERROR,
  GITHUB_UNKNOWN_ERROR,
} from '~/global';
import {
  GitHubRateLimit,
  Release,
  Repository,
  RepositoryQueryPayload,
} from '~/models';

function parseHeadersRateLimit(headers: Headers): GitHubRateLimit {
  const limit = parseInt(headers.get('x-ratelimit-limit') || '0', 10);
  const remaining = parseInt(headers.get('x-ratelimit-remaining') || '0', 10);
  const reset = parseInt(headers.get('x-ratelimit-reset') || '0', 10) * 1000;

  return {
    limit,
    remaining,
    reset,
  };
}

export class Api {
  #accessToken?: string;
  #rateLimit?: GitHubRateLimit;

  constructor() {
    this.initToken();
  }

  private initToken() {
    const cookies = parseCookies(null, { path: '/' });
    const token = cookies[GITHUB_COOKIE_KEY];

    if (token) {
      this.#accessToken = token;
    }
  }

  get accessToken(): string | undefined {
    return this.#accessToken;
  }

  set accessToken(newToken) {
    this.#accessToken = newToken;
  }

  saveAccessToken(newToken?: string, ctx?: NextPageContext) {
    this.accessToken = newToken;

    if (newToken) {
      setCookie(ctx, GITHUB_COOKIE_KEY, newToken, {
        maxAge: 31536000, // 1 year
        path: '/',
      });
    } else {
      destroyCookie(ctx, GITHUB_COOKIE_KEY);
    }
  }

  get rateLimitRemaining(): number {
    return this.#rateLimit?.remaining ?? -1;
  }

  get rateLimitWaitingMinutes(): number | undefined {
    const reset = this.#rateLimit?.reset;

    if (!reset) {
      return undefined;
    }

    const waitingMs = reset - new Date().getTime();

    if (waitingMs < 0) {
      return 0;
    }

    const waitingSec = waitingMs / 1000;
    return Math.round(waitingSec / 60);
  }

  get isAuth(): boolean {
    return !!this.#accessToken;
  }

  async request(uri: string, init?: RequestInit): Promise<any> {
    const defaultRequestConfig: RequestInit = {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent':
          process.env.NODE_ENV === 'production'
            ? 'Octoclairvoyant'
            : 'Test Octoclairvoyant',
      },
    };

    if (this.isAuth) {
      // @ts-ignore - I don't know why TS complains here
      defaultRequestConfig.headers['Authorization'] = `token ${
        this.#accessToken
      }`;
    }

    const finalInit = Object.assign(defaultRequestConfig, init);

    console.log('finalInit', finalInit);
    let response;
    try {
      response = await fetch(`https://api.github.com/${uri}`, finalInit);
    } catch (e) {
      // This is the best way I found to check if rate limit wasn't exceeded
      if (this.#rateLimit && this.#rateLimit.remaining > 1) {
        throw e;
      }
      throw new Error(GITHUB_RATE_LIMIT_EXCEEDED_ERROR);
    }

    this.#rateLimit = parseHeadersRateLimit(response.headers);

    if (response.status >= 200 && response.status < 300) {
      return await response.json();
    }

    throw new Error(response.statusText || GITHUB_UNKNOWN_ERROR);
  }

  readRepo({ owner, name }: RepositoryQueryPayload): Promise<Repository> {
    return this.request(`repos/${owner}/${name}`, { method: 'GET' });
  }

  readRepoReleases({
    owner,
    name,
  }: RepositoryQueryPayload): Promise<Release[]> {
    return this.request(`repos/${owner}/${name}/releases?page=1&per_page=100`, {
      method: 'GET',
    });
  }
}