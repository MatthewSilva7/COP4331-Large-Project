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
  // Use your real domain name here
  const API_URL = "https://largeproj.msilvacop4331.site/api/auth/login";

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Login failed");
  }

  return response.json();
};