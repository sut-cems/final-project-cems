import type { Activity } from "./IActivitys";

export interface EventCategory {
  ID: number;
  Name: string;
  Description: string;
  Activities?: Activity[];
}