interface SignupInput {
  Email: string;
  Password: string;
  FirstName: string;
  LastName: string;
  StudentID: string;
  profileImage?: string; 
  RoleID?: number;        
}

interface LoginInput {
  identifier: string;
  password: string;
}

interface LoginResponse {
  message: string;
  token: string;
  user: {
    id:number;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
  };
}


interface SingupResponse {
  message: string;
  token: string;
  user: {
    id:number;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
  };
}

export type { SignupInput, LoginInput, LoginResponse , SingupResponse };