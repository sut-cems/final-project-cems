import type { Activity } from "./IActivitys";

export interface ActivityStatus {
  ID: number;
  Name: string;
  Description: string;
  IsActive: boolean;
  Activities?: Activity[];
}