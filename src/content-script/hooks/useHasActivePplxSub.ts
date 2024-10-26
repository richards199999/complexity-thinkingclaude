import useFetchUserSettings from "@/content-script/hooks/useFetchUserSettings";
import { UserSettingsApiResponse } from "@/types/pplx-api.types";

export const validateHasActivePplxSub = (
  userSettings: UserSettingsApiResponse,
) =>
  userSettings != null &&
  (userSettings.subscriptionStatus === "active" ||
    userSettings.subscriptionStatus === "trialing");

export default function useHasActivePplxSub() {
  const query = useFetchUserSettings();

  return {
    query,
    hasActivePplxSub: query.data && validateHasActivePplxSub(query.data),
  };
}
