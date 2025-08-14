import type {Activity} from "./IActivitys";
import type {Users} from "./IUsers";
import type {ActivityRegistrationStatus} from "./IActivityRegistrationStatuses";

export interface ActivityRegistration {
  ID: number;
  ActivityID: number;
  UserID: number;
  StatusID: number;
  RegisteredAt: string;
  Activity?: Activity;
  User?: Users;
  Status?: ActivityRegistrationStatus;
}