import type { ActivityHour } from "./IActivityHours";
import type { ActivityRegistration } from "./IActivityRegistrations";
import type { ActivityReport } from "./IActivityReports";
import type { ClubMember } from "./IClubMembers";
import type { Club } from "./IClubs";
import type { Faculty, Program } from "./IFaculty";
import type { Notifications } from "./INotifications";
import type { Role } from "./IRoles";

export interface Users {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt?: string;
  Email: string;
  FirstName: string;
  LastName: string;
  StudentID: string;
  Password: string;
  ProfileImage: string;
  IsActive: boolean;
  RoleID: number;
  Role?: Role;
  FacultyID?: number;
  Faculty?: Faculty;
  ProgramID?: number;
  Program?: Program;
  ClubID?: number;
  ActivityHour?: number;
  CreatedClubs?: Club[];
  ClubMembers?: ClubMember[];
  Registrations?: ActivityRegistration[];
  VerifiedHours?: ActivityHour[];
  GeneratedReports?: ActivityReport[];
  Notifications?: Notifications[];
}