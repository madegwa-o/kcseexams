// middleware.ts (place this in your root directory)
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(req) {
        const { pathname } = req.nextUrl
        const isAuthenticated = !!req.nextauth.token


        return NextResponse.next()
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                const { pathname } = req.nextUrl

                // Public routes - accessible without authentication
                const publicRoutes = ['/', '/signin']
                if (publicRoutes.includes(pathname)) {
                    return true
                }

                // Allow access to auth-related pages
                if (pathname.startsWith('/api/auth')) {
                    return true
                }

                // For all other routes, require authentication
                if (!token) {
                    // Redirect to home page with a callback URL
                    return false
                }

                return true
            },
        },
        pages: {
            signIn: '/signin', // Redirect unauthorized users to sign in
        },
    }
)