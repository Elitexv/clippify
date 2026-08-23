export type Role = "brand" | "creator" | "both" | "admin";

export type MockUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  password: string;
  role: Role;
  initials: string;
};

export const mockUsers: MockUser[] = [
  {
    id: "test-user",
    name: "Jamie Rivera",
    username: "jamierivera",
    email: "creator@clippifi.test",
    password: "Test1234!",
    role: "both",
    initials: "JR",
  },
  {
    id: "test-admin",
    name: "Morgan Lee",
    username: "morganlee",
    email: "admin@clippifi.test",
    password: "Admin1234!",
    role: "admin",
    initials: "ML",
  },
  {
    id: "test-brand",
    name: "Nova Sportswear",
    username: "novasportswear",
    email: "brand@clippifi.test",
    password: "Brand1234!",
    role: "brand",
    initials: "NS",
  },
];
