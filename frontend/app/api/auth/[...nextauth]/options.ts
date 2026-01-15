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
        token?: string;
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
            // ✅ Optional: Sync user with backend during signIn (non-blocking)
            // This is optional - login will succeed even if backend sync fails
            if (account?.provider === "google" || account?.provider === "github") {
                try {
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

                    if (data?.success && data.token) {
                        // Optional: store token if available
                        (user as any).backendToken = data.token;
                        console.log("✅ Backend token received");
                    } else {
                        console.log("⚠️ Backend token not available:", data?.message);
                        // Don't fail the login - just proceed without backend token
                    }
                } catch (error) {
                    console.error("⚠️ Backend sync error (non-blocking):", error);
                    // Non-blocking error - login still succeeds
                }
            }
            // Always return true to allow login
            return true;
        },
        async session({ session, token }: { session: CustomSession, token: JWT }) {
            // Add user data to session from token
            if (!session.user) {
                session.user = {} as customUser;
            }
            
            if (token.sub) {
                session.user.id = token.sub as string;
            }
            
            // Optional: Add backend token if available
            if (token.backendToken) {
                session.user.token = token.backendToken as string;
            }
            
            return session;
        },
        async jwt({ token, user }) {
            // When user first logs in, store user ID
            if (user) {
                token.sub = user.id as string;
                // Optional: Store backend token if available
                if ((user as any).backendToken) {
                    token.backendToken = (user as any).backendToken;
                }
            }
            return token;
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
