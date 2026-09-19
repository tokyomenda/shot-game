// Public discovery data deliberately excludes all contact information.
export type DiscoveryProfile = {
  id: string;
  name: string;
  age: number;
  location: string;
  bio: string;
  interests: readonly string[];
  photo: string;
  photoAlt: string;
};
export type DiscoveryDecision = "skip" | "interested";
