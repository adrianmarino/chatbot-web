import axios from 'axios';

export const API_HOST = import.meta.env.VITE_API_URL || 'http://nonosoft.ddns.net:8080';
export const BASE_URL = `${API_HOST}/api/v1`;

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types & Interfaces
export interface UserProfile {
  name: string;
  email: string;
  metadata: {
    studies?: string;
    age?: number;
    genre?: string;
    nationality?: string;
    work?: string;
    preferred_movies: {
      release: {
        from: string;
      };
      genres: string[];
    };
  };
}

export interface RecommendationSettings {
  llm: string;
  retry?: number;
  plain?: boolean;
  include_metadata?: boolean;
  rag?: {
    candidates_limit?: number;
    llm_response_limit?: number;
    recommendations_limit?: number;
    similar_items_augmentation_limit?: number;
    not_seen?: boolean;
  };
  collaborative_filtering?: {
    candidates_limit?: number;
    llm_response_limit?: number;
    recommendations_limit?: number;
    similar_items_augmentation_limit?: number;
    not_seen?: boolean;
    k_sim_users?: number;
    min_rating_by_user?: number;
  };
}

export interface RecommendationQuery {
  message: {
    author: string;
    content: string;
  };
  settings: RecommendationSettings;
}

export interface ResultItemMetadata {
  position: number;
  title: string;
}

export interface DbItemMetadata {
  id: string;
  title: string;
  release: string;
  rating: number;
  query_sim: number;
  title_sim: number;
  release_sim: number;
}

export interface RecommendationMetadata {
  result_item: ResultItemMetadata;
  db_item: DbItemMetadata;
}

export interface Recommendation {
  title: string;
  poster?: string | null;
  release: string;
  description: string;
  genres: string[];
  votes: string[];
  metadata?: RecommendationMetadata | null;
}

export interface ChatBotResultModel {
  content: string;
  metadata: Record<string, any>;
}

export interface RecommendationsMetadata {
  excluded_items: Recommendation[];
  response?: ChatBotResultModel | null;
  elapsed_time?: string | null;
  logs: string[];
}

export interface RecommendationsResponse {
  items: Recommendation[];
  metadata?: RecommendationsMetadata | null;
}

export interface UserInteraction {
  user_id: string;
  item_id: string;
  rating: number;
}

// API Functions
export const api = {
  // Profiles
  getProfiles: async (): Promise<UserProfile[]> => {
    const res = await client.get<UserProfile[]>('/profiles');
    return res.data;
  },
  
  getProfile: async (email: string): Promise<UserProfile> => {
    const res = await client.get<UserProfile>(`/profiles/${encodeURIComponent(email)}`);
    return res.data;
  },

  createProfile: async (profile: UserProfile): Promise<void> => {
    await client.post('/profiles', profile);
  },

  updateProfile: async (email: string, profile: UserProfile): Promise<UserProfile> => {
    const res = await client.put<UserProfile>(`/profiles/${encodeURIComponent(email)}`, profile);
    return res.data;
  },

  deleteProfile: async (email: string): Promise<void> => {
    await client.delete(`/profiles/${encodeURIComponent(email)}`);
  },

  // LLM Models
  getAvailableModels: async (): Promise<string[]> => {
    const res = await client.get<{ models: string[] }>('/recommendations/models');
    return res.data.models;
  },

  // Recommendations
  askRecommendation: async (query: RecommendationQuery): Promise<RecommendationsResponse> => {
    const res = await client.post<RecommendationsResponse>('/recommendations', query);
    return res.data;
  },

  // Histories
  getHistory: async (email: string): Promise<any> => {
    const res = await client.get(`/histories/${encodeURIComponent(email)}`);
    return res.data;
  },

  deleteHistory: async (email: string): Promise<void> => {
    await client.delete(`/histories/${encodeURIComponent(email)}`);
  },

  // Interactions (Ratings)
  addInteraction: async (interaction: UserInteraction): Promise<any> => {
    const res = await client.post('/interactions', interaction);
    return res.data;
  },

  getUserInteractions: async (userId: string): Promise<UserInteraction[]> => {
    const res = await client.get<UserInteraction[]>(`/interactions/users/${encodeURIComponent(userId)}`);
    return res.data;
  },
};
