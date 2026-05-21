import { API_URL } from "./env";
import { createAuthClient } from "better-auth/react";
import { twoFactorClient } from "better-auth/client/plugins";


export const authClient = createAuthClient({
  baseURL: API_URL,
  fetchOptions: {
    credentials: "include",
  },
  plugins: [
    twoFactorClient({
      // After a successful login the server returns a redirect URL when
      // the user has 2FA enabled — point it at our verify screen.
      onTwoFactorRedirect: () => {
        if (typeof window !== "undefined") {
          window.location.href = "/login/two-factor";
        }
      },
    }),
  ],
});
