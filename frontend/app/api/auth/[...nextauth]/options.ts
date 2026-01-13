import { AuthOptions, ISODateString } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { JWT } from "next-auth/jwt";

// Extend the default User type to include token
declare module "next-auth" {
    interface User {
        token?: string;
    }
}

// Extend the JWT type to include backendToken
declare module "next-auth/jwt" {
    interface JWT {
        backendToken?: string;
        sub?: string;
    }
}

export interface CustomSession {
    user?: customUser;
    expires: ISODateString;
}

export interface customUser {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    token?: string | null;
};


export const authOptions: AuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/',
        error: '/not-found',
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60,
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            // ✅ Only sync for Google and Github
            if (account?.provider === "google" || account?.provider === "github") {
                try {
                    console.log("NextAuth SignIn: Attempting backend sync for", user.email);

                    // Prefer providerAccountId (guaranteed by NextAuth account object),
                    // fall back to profile.sub or user.id if available.
                    const oauthId = account?.providerAccountId || (profile as any)?.sub || user.id;

                    const response = await fetch("http://127.0.0.1:5000/api/auth/login", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            name: user.name,
                            email: user.email,
                            provider: account.provider,
                            image: user.image,
                            oauth_id: oauthId,
                        }),
                    });

                    const data = await response.json();
                    console.log("NextAuth SignIn: Backend response:", data);

                    if (data?.success) {
                        // attach backend token to user so it flows into jwt callback
                        (user as any).token = data.token;
                        console.log("✅ NextAuth SignIn: Token attached to user:", {
                            hasToken: !!(user as any).token,
                            userObject: user
                        });
                        return true;
                    }

                    console.error("NextAuth SignIn: Backend returned failure:", data?.message);
                    return false;
                } catch (error) {
                    console.error("NextAuth SignIn: Network error during backend sync:", error);
                    return false; // Fail sign-in if sync fails
                }
            }
            return true;
        },
        async session({ session, token }: { session: CustomSession, token: JWT }) {
            console.log("Session callback - token contents:", {
                sub: token.sub,
                hasBackendToken: !!token.backendToken,
                tokenKeys: Object.keys(token)
            });
            
            // Initialize user object if it doesn't exist
            if (!session.user) {
                session.user = {} as customUser;
            }
            
            // Always populate user data from token
            session.user.id = token.sub as string;
            const backendToken = token.backendToken as string;
            if (backendToken) {
                session.user.token = backendToken;
                console.log("✅ Session callback - token assigned successfully");
            } else {
                console.error("❌ Session callback - backendToken is missing from JWT token");
            }
            
            return session
        },
        async jwt({ token, user, account }) {
            // When user first logs in
            if (user) {
                token.sub = user.id as string;
                token.backendToken = (user as customUser).token;
                console.log("JWT callback - storing token:", {
                    userId: user.id,
                    hasBackendToken: !!token.backendToken,
                    tokenValue: token.backendToken
                });
            } else {
                // On subsequent calls, preserve existing backendToken
                if (!token.backendToken) {
                    console.warn("JWT callback - No backendToken found and no user provided");
                }
            }
            return token
        },
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            }
        }),
        GithubProvider({
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string
        })
    ]
}
