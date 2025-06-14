import type { Activity } from './IActivitys';
import type { ClubAnnouncement } from './IClubAnnouncements';
import type { ClubCategory } from './IClubCategories';
import type { ClubMember } from './IClubMembers';
import type { ClubStatus } from './IClubStatuses';
export interface Club {
  ID: number;
  Name: string;
  Description: string;
  LogoImage: string;
  CreatedBy: number;
  StatusID: number;
  CategoryID: number;
  Status?: ClubStatus;
  Category?: ClubCategory;
  Members?: ClubMember[];
  Activities?: Activity[];
  Announcements?: ClubAnnouncement[];
}