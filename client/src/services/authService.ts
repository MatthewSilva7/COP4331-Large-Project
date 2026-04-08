import type {
  AuthUser,
  CreateSessionPayload,
  DashboardData,
  SessionSummary,
} from "../types/auth";

const API_BASE_URL = "https://largeproj.msilvacop4331.site/api";

// Define what the server's response looks like for TypeScript
interface LoginResponse {
  token: string;
  user: AuthUser;
}

export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
  const API_URL = `${API_BASE_URL}/auth/login`;

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();

    // Check if the server sent a specific message about verification
    if (response.status === 403 && errorData.message.includes("verify")) {
        throw new Error("VERIFICATION_REQUIRED");
    }

    throw new Error(errorData.message || "Login failed");
  }

  return response.json();
};

export const verifyEmail = async (token: string): Promise<{ message: string }> => {
    const API_URL = `${API_BASE_URL}/auth/verify/${token}`;

    const response = await fetch(API_URL, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Verification failed");
    }

    return response.json();
};

export const registerUser = async (firstName: string, lastName: string, email: string, password: string): Promise<{ message: string }> => {
  const API_URL = `${API_BASE_URL}/auth/register`;

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ firstName, lastName, email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Registration failed");
  }

  return data;
};

export const getDashboardData = async (userId: string): Promise<DashboardData> => {
  const response = await fetch(`${API_BASE_URL}/sessions/user/${userId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Could not load dashboard");
  }

  return data;
};

export const createSession = async (
  payload: CreateSessionPayload,
): Promise<{ message: string; session: SessionSummary }> => {
  const response = await fetch(`${API_BASE_URL}/sessions/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Could not create session");
  }

  return data;
};
