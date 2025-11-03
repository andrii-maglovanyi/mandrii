import { useRestApi } from "~/hooks/useRestApi";

export const useGeocode = <T>() => {
  return useRestApi<T>(
    "/api/geocode",
    (payload: string) => {
      const { address, is_physical } = JSON.parse(payload);
      return {
        body: { address, is_physical },
        method: "POST",
      };
    },
    {
      minLength: 3,
      onError: (error) => console.error("Geocoding failed:", error),
      onSuccess: (data) => console.log("Geocoding successful:", data),
    },
  );
};
