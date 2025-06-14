import type { Users } from "./IUsers";

export interface Role {
  ID: number;
  RoleName: string;
  Description: string;
  Users?: Users[];
}