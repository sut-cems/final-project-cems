import type { Club } from "./IClubs";

export interface ClubCategory {
  ID: number;
  Name: string;
  Description: string;
  Clubs?: Club[];
}