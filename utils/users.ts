import { ENV } from "./env.js";

export type UserRole = "base_user" | "admin_user";

export interface UserCredentials {
  email: string;
  password: string;
}

export const USERS: Record<UserRole, UserCredentials> = {
  base_user: {
    email: ENV.HUDL_EMAIL,
    password: ENV.HUDL_PASSWORD,
  },
  admin_user: {
    email: ENV.HUDL_ADMIN_EMAIL,
    password: ENV.HUDL_ADMIN_PASSWORD,
  },
};
