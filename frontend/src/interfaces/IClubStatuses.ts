import type { Club } from "./IClubs";

export interface ClubStatus {
  ID: number;
  Name: string;
  Description: string;
  IsActive: boolean;
  Clubs?: Club[];
}