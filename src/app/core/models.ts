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

export interface Astrophysics {
  exoplanet_id: number;
  exoplanet_name: string;
  host_star: string;
  stellar_luminosity_solar: number | null;
  habitable_zone: {
    available: boolean;
    reason?: string;
    teff_used_k?: number;
    optimistic_inner_au?: number;
    conservative_inner_au?: number;
    conservative_outer_au?: number;
    optimistic_outer_au?: number;
    planet_semi_major_axis_au?: number | null;
    in_conservative_hz?: boolean | null;
    in_optimistic_hz?: boolean | null;
    relative_position?: number | null;
    reference?: string;
  };
  energy_budget: {
    available: boolean;
    instellation_earth_flux?: number;
    instellation_w_m2?: number;
    equilibrium_temp_bond0_k?: number;
    equilibrium_temp_bond0_3_k?: number;
    equilibrium_temp_bond0_7_k?: number;
    catalog_equilibrium_temp_k?: number;
  };
  planet_physics: {
    surface_gravity_g?: number;
    surface_gravity_ms2?: number;
    escape_velocity_kms?: number;
    density_g_cm3?: number;
  };
  earth_similarity_index: {
    available: boolean;
    esi?: number;
    components?: Record<string, number>;
    parameters_used?: number;
    reference?: string;
  };
  galactic_position: {
    available: boolean;
    ra_deg?: number;
    dec_deg?: number;
    galactic_longitude_deg?: number;
    galactic_latitude_deg?: number;
    distance_pc?: number;
    distance_light_years?: number;
  };
  observability: {
    transit_depth_ppm?: number;
    transit_depth_percent?: number;
    rv_semi_amplitude_ms?: number;
    orbital_velocity_kms?: number;
  };
  stellar_light: {
    available: boolean;
    effective_temp_k?: number;
    wien_peak_nm?: number;
    approx_color?: string;
  };
  disclaimer: string;
}
