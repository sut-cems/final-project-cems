import type { ActivityRegistration } from "./IActivityRegistrations";
import type { ActivityStatus } from "./IActivityStatuses";
import type { Club } from "./IClubs";
import type { EventCategory } from "./IEventCategories";

export interface Activity {
  ID: number;
  Title: string;
  Description: string;
  Location: string;
  DateStart: string;
  DateEnd: string;
  Capacity: number;
  PosterImage: string;
  StatusID: number;
  ClubID: number;
  CategoryID: number;
  Status?: ActivityStatus;
  Club?: Club;
  Category?: EventCategory;
  ActivityRegistrations?: ActivityRegistration[];
}

