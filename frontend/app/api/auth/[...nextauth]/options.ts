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
        error: '/not-found',
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60,
    },
    callbacks: {
        async session({ session, token }: { session: CustomSession, token: JWT }) {
            if (token && session.user) {
                session.user.id = token.sub as string
            }
            return session
        },
        async jwt({ token, user, account }) {
            if (user) {
                token.sub = user.id as string
            }
            if (account) {
                token.accessToken = account.access_token
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
