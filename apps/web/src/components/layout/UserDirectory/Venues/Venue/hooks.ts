import { useRestApi } from "~/hooks/useRestApi";

export const useGeocode = <T>() => {
  return useRestApi<T>(
    "/api/geocode",
    (address) => ({
      body: { address },
      method: "POST",
    }),
    {
      minLength: 3,
      onError: (error) => console.error("Geocoding failed:", error),
      onSuccess: (data) => console.log("Geocoding successful:", data),
    },
  );
};
