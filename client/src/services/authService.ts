// Define what the server's response looks like for TypeScript
interface LoginResponse {
  token: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
  // In development, this goes through Vite proxy to localhost:5000.
  // In production, set VITE_API_URL (e.g. https://your-domain.com/api).
  const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
  const API_URL = `${API_BASE_URL}/auth/login`;

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  if (!response.ok) {
    if (isJson) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Login failed");
    }

    const errorText = await response.text();
    throw new Error(
      `Login failed. Server returned non-JSON response: ${errorText.slice(0, 120)}`
    );
  }

  if (!isJson) {
    const bodyText = await response.text();
    throw new Error(
      `Login failed. Expected JSON but received: ${bodyText.slice(0, 120)}`
    );
  }

  return response.json();
};