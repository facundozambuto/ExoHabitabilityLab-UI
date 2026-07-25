export interface Exoplanet {
  id: number;
  nasa_id?: string;
  name: string;
  host_star?: string;
  discovery_method?: string;
  discovery_year?: number;
  orbital_period_days?: number;
  semi_major_axis_au?: number;
  eccentricity?: number;
  planet_radius_earth?: number;
  planet_mass_earth?: number;
  equilibrium_temp_k?: number;
  stellar_type?: string;
  stellar_mass_solar?: number;
  stellar_radius_solar?: number;
  stellar_temp_k?: number;
  distance_pc?: number;
}

export interface ExoplanetListResponse {
  items: Exoplanet[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ScoringFactor {
  factor_name: string;
  score: number;
  weight: number;
  weighted_contribution: number;
  input_value?: string | null;
  explanation: string;
  confidence: string;
}

export interface HabitabilityScore {
  exoplanet_id: number;
  exoplanet_name: string;
  total_score: number;
  score_category: string;
  factors: ScoringFactor[];
  data_completeness: number;
  missing_parameters: string[];
  scientific_disclaimer: string;
  methodology_summary: string;
}

export interface RankedPlanet {
  id: number;
  name: string;
  host_star?: string;
  stellar_type?: string;
  planet_radius_earth?: number;
  equilibrium_temp_k?: number;
  discovery_year?: number;
  distance_pc?: number;
  total_score: number;
  score_category: string;
  data_completeness: number;
}

export interface RankingResponse {
  count: number;
  total_scored: number;
  items: RankedPlanet[];
}

export interface ArtResult {
  exoplanet_id: number;
  exoplanet_name: string;
  style: string;
  format: string;
  prompt: string;
  negative_prompt: string;
  scientific_notes: string[];
  prompt_hash: string;
  generation_status: string;
  image_url: string | null;
  message: string;
}

export interface Methodology {
  version: string;
  factors: any[];
  references: string[];
  limitations: string[];
}
