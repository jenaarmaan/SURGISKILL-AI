const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

interface RequestOptions extends RequestInit {
  token?: string | null;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { token, headers, ...customOptions } = options;

  const defaultHeaders: HeadersInit = {};
  
  // Set JSON content-type only if we are not transmitting FormData
  if (!(options.body instanceof FormData)) {
    defaultHeaders["Content-Type"] = "application/json";
  }

  // Add authorization header if token exists
  const activeToken = token || (typeof window !== "undefined" ? localStorage.getItem("surgiskill_token") : null);
  if (activeToken) {
    defaultHeaders["Authorization"] = `Bearer ${activeToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    ...customOptions,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  // Auth
  register: (body: any) => request<any>("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body: any) => request<any>("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  me: (token?: string) => request<any>("/auth/me", { method: "GET", token }),

  // Stations
  getStations: () => request<any[]>("/stations", { method: "GET" }),
  createStation: (body: any) => request<any>("/stations", { method: "POST", body: JSON.stringify(body) }),
  getRubric: (stationId: string) => request<any>(`/stations/${stationId}/rubric`, { method: "GET" }),
  addRubricVersion: (stationId: string, body: any) => request<any>(`/stations/${stationId}/rubric/version`, { method: "POST", body: JSON.stringify(body) }),

  // Attempts
  getAttempts: () => request<any[]>("/attempts", { method: "GET" }),
  initializeAttempt: (stationId: string) => request<any>("/attempts", { method: "POST", body: JSON.stringify({ stationId }) }),
  getAttemptDetails: (attemptId: string) => request<any>(`/attempts/${attemptId}`, { method: "GET" }),
  getTrackingDetails: (attemptId: string) => request<any>(`/attempts/${attemptId}/tracking`, { method: "GET" }),
  
  // Real video upload accepting binary blobs and passing simulateFailure via request headers
  uploadAttemptVideo: async (attemptId: string, videoBlob: Blob, simulateFailure = false, onProgress?: (percent: number) => void): Promise<any> => {
    const formData = new FormData();
    formData.append("video", videoBlob, `recording_${attemptId}.mp4`);

    // To track progress, we can use XMLHttpRequest in raw JS since fetch API doesn't support progress events easily
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${API_BASE_URL}/attempts/${attemptId}/upload`);

      // Add auth header
      const activeToken = typeof window !== "undefined" ? localStorage.getItem("surgiskill_token") : null;
      if (activeToken) {
        xhr.setRequestHeader("Authorization", `Bearer ${activeToken}`);
      }
      
      // Simulate failure flag in header
      if (simulateFailure) {
        xhr.setRequestHeader("x-simulate-failure", "true");
      }

      // Track progress
      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            onProgress(percentComplete);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch {
            resolve(xhr.responseText);
          }
        } else {
          try {
            const errJson = JSON.parse(xhr.responseText);
            reject(new Error(errJson.error || `Upload failed with status ${xhr.status}`));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => {
        reject(new Error("Network upload connection interrupted."));
      };

      xhr.send(formData);
    });
  },

  overrideScore: (attemptId: string, newScore: number, reason: string) => request<any>(`/attempts/${attemptId}/override`, { method: "PATCH", body: JSON.stringify({ newScore, reason }) }),
};
