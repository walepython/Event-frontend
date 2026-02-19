import { useAuth } from "@/context/AuthContext";

export const useApi = () => {
  const { authTokens } = useAuth();

  const request = async (url, options = {}) => {
    const headers = {
      ...options.headers,
      Authorization: `Bearer ${authTokens?.access}`,
    };

    const res = await fetch(url, { ...options, headers });
    if (!res.ok) throw new Error("Request failed");
    return res.json();
  };

  return { request };
};
