import { useCallback, useState } from "react";

interface ApiRequestConfig {
  body?: unknown;
  headers?: Record<string, string>;
  method?: "DELETE" | "GET" | "POST" | "PUT";
}

interface UseApiOptions {
  enabled?: boolean;
  minLength?: number;
  onError?: (error: string) => void;
  onSuccess?: (data: unknown) => void;
}

type UseApiReturn<T> = {
  data: null | T;
  error: null | string;
  execute: (value?: string) => Promise<void>;
  loading: boolean;
  reset: () => void;
};

export const useRestApi = <T = unknown>(
  endpoint: string,
  requestConfig: (value: string) => ApiRequestConfig = () => ({ method: "POST" }),
  options: UseApiOptions = {},
): UseApiReturn<T> => {
  const { enabled = true, minLength = 1, onError, onSuccess } = options;

  const [data, setData] = useState<null | T>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);

  const execute = useCallback(
    async (value = "") => {
      if (!enabled || value.trim().length < minLength) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const config = requestConfig(value);
        const { body, headers = {}, method = "POST" } = config;

        const fetchOptions: RequestInit = {
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          method,
        };

        if (body && method !== "GET") {
          fetchOptions.body = typeof body === "string" ? body : JSON.stringify(body);
        }

        const url = method === "GET" && body ? `${endpoint}?${new URLSearchParams(String(body)).toString()}` : endpoint;

        const response = await fetch(url, fetchOptions);

        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        setData(result);
        onSuccess?.(result);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
        setError(errorMessage);
        setData(null);
        onError?.(errorMessage);
        console.error("API call failed:", err);
      } finally {
        setLoading(false);
      }
    },
    [endpoint, requestConfig, enabled, minLength, onSuccess, onError],
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    error,
    execute,
    loading,
    reset,
  };
};
