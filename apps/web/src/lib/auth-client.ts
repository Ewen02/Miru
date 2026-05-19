import { API_URL } from "./env";
import { createAuthClient } from "better-auth/react";


export const authClient = createAuthClient({
  baseURL: API_URL,
  fetchOptions: {
    credentials: "include",
  },
});
