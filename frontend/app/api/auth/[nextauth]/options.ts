import { AuthOptions, ISODateString } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { JWT } from "next-auth/jwt";

export interface CustomSession {
    user?: customUser;
    expires: ISODateString;
}

export interface customUser {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    token?: string | null;
};


export const authOptions: AuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/',

    },
    callbacks: {
        async session({ session, user, token }: { session: CustomSession, user: customUser, token: JWT }) {
            if (user) {
                session.user = user
            }
            return session
        },
        async jwt({ token, user }) {
            if (user) {
                token.user = user
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