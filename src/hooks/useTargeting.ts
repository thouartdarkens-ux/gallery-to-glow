import { useQuery } from "@tanstack/react-query";
import { fetchRecipients, AudienceFilter } from "@/lib/targeting";

export function useRecipients(filter: AudienceFilter, enabled = true) {
  return useQuery({
    queryKey: ["recipients", filter],
    queryFn: () => fetchRecipients(filter),
    enabled,
  });
}
