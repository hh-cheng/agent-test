import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

const nextAuthSecret = process.env.NEXTAUTH_SECRET

if (!nextAuthSecret) {
  throw new Error('Missing NEXTAUTH_SECRET environment variable.')
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const username = credentials?.username
        const password = credentials?.password

        if (username === 'test123' && password === 'testpwd123!') {
          return {
            id: 'demo-user',
            name: 'Test User',
          }
        }

        return null
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  secret: nextAuthSecret,
  pages: {
    signIn: '/',
  },
})

export { handler as GET, handler as POST }
