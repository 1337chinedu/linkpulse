export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Link {
  code: string;
  url: string;
  shortUrl: string;
  createdAt: string;
  clicks: number;
  lastClickedAt?: string;
}

export interface ApiKey {
  id: string;
  createdAt: string;
  secret?: string;
}

export interface NewApiKey extends ApiKey {
  secret: string;
}
