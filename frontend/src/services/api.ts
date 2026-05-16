const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api/v1";

type HealthResponse = {
  status: string;
  service: string;
};

export const api = {
  async health(): Promise<HealthResponse> {
    const response = await fetch(`${API_URL}/health`);

    if (!response.ok) {
      throw new Error("Backend health check failed");
    }

    return response.json();
  },
};
