import { claimAnonymousHistory } from "../api/viewHistoryApi.js";
import {
  clearGuestRecentlyViewed,
  getAnonymousIdForClaim,
  rotateAnonymousIdentity
} from "./viewerIdentity.js";

let claimPromise;

export function claimGuestViewHistory() {
  const anonymousId = getAnonymousIdForClaim();
  if (!anonymousId) return Promise.resolve(null);
  if (!claimPromise) {
    claimPromise = claimAnonymousHistory(anonymousId)
      .then((result) => {
        clearGuestRecentlyViewed();
        rotateAnonymousIdentity();
        window.dispatchEvent(new Event("aivira-recently-viewed"));
        return result;
      })
      .finally(() => {
        claimPromise = null;
      });
  }
  return claimPromise;
}
