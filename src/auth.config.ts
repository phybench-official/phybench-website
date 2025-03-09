import { type DefaultSession, type NextAuthConfig } from "next-auth"
import Authentik from "next-auth/providers/authentik"

declare module "next-auth" {
  interface Session {
    user: {
      role: string,
      realname: string,
      username: string,
    } & DefaultSession["user"]
  }
  interface User {
    id?: string
    name?: string | null
    email?: string | null
    image?: string | null
    role: string,
    realname: string,
    username: string,
  }
}

export default {
  providers: [
    {
      id: "uaaa",
      name: "PKU UAAA",
      type: "oidc",
      issuer: process.env.AUTH_CLIENT_ISSUER,
      clientId: process.env.AUTH_CLIENT_ID,
      clientSecret: process.env.AUTH_CLIENT_SECRET,
      profile(profile) {
        return {
          name: profile.name,
          role: "user",
          username: profile.name,
          realname: profile.realname,
          id: profile.sub,
          email: profile.email,
        }
      }
    }
  ],
  // session: {
  //   strategy: "database",
  // },
  callbacks: {
    jwt({ token, user }) {
      if(user) {
        token.role = user.role
        token.realname = user.realname,
        token.username = user.username
      }
      return token
    },
    session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          role: token.role as string,
          realname: token.realname as string,
          username: token.username as string,
        },
      }
    }
  }
} satisfies NextAuthConfig