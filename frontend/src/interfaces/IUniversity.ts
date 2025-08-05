export interface University {
  ID: number;
  Name: string;
  Address: string;
  Phone: string;
  Logo: string;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface UniversityRequest {
  name: string;
  address: string;
  phone: string;
  logo: string;
}
