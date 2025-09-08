'use client'

import Image from "next/image";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

export default function Header() {
    const { data: session } = useSession();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navigationItems = [
        { label: "Home", href: "/" },
        { label: "Chat", href: "/chat" }
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-black/80 backdrop-blur-lg supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/60">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center">
                        <h1 className="text-xl font-bold bg-gradient-to-r from-white to-purple-600 bg-clip-text text-transparent">
                            KMF.AI
                        </h1>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        {navigationItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 font-medium"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Desktop User Section */}
                    <div className="hidden md:flex items-center gap-4">
                        {session ? (
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    {session?.user?.image ? (
                                        <Image
                                            src={session.user.image}
                                            alt="avatar"
                                            width={32}
                                            height={32}
                                            className="w-8 h-8 rounded-full ring-2 ring-gray-200 dark:ring-gray-700"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                                            {session?.user?.name?.charAt(0) ?? "G"}
                                        </div>
                                    )}
                                    <div className="text-sm">
                                        <div className="font-medium text-gray-900 dark:text-white">
                                            {session?.user?.name ?? "Guest"}
                                        </div>
                                        <div className="text-gray-500 dark:text-gray-400 text-xs">
                                            {session?.user?.email ?? "Not signed in"}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                                    onClick={() => signOut()}
                                >
                                    Sign out
                                </button>
                            </div>
                        ) : (
                            <button
                                className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                                onClick={() => signIn("google")}
                            >
                                Sign in
                            </button>
                        )}
                    </div>

                    {/* Mobile Hamburger Button */}
                    <button
                        className="md:hidden relative p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <div className="flex items-center justify-center">
                            {/* User Avatar/Initial - Always visible when menu is closed */}
                            <div className={`transition-all duration-300 ${isMenuOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}>
                                {session ? (
                                    <>
                                        {session?.user?.image ? (
                                            <Image
                                                src={session.user.image}
                                                alt="avatar"
                                                width={32}
                                                height={32}
                                                className="w-8 h-8 rounded-full ring-2 ring-gray-200 dark:ring-gray-700 group-hover:ring-gray-300 dark:group-hover:ring-gray-600 transition-all duration-200"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium ring-2 ring-gray-200 dark:ring-gray-700 group-hover:ring-gray-300 dark:group-hover:ring-gray-600 transition-all duration-200 group-hover:scale-110">
                                                {session?.user?.name?.charAt(0) ?? "G"}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 dark:from-gray-600 dark:to-gray-400 flex items-center justify-center text-white text-sm font-medium ring-2 ring-gray-200 dark:ring-gray-700 group-hover:ring-gray-300 dark:group-hover:ring-gray-600 transition-all duration-200 group-hover:scale-110">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {/* Hamburger/Close Icon - Overlays on menu open */}
                            <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isMenuOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
                                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                    <svg
                                        className="w-5 h-5 text-gray-600 dark:text-gray-300"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Active indicator dot */}
                        {session && !isMenuOpen && (
                            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></div>
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                <div className={`md:hidden transition-all duration-300 ease-in-out ${
                    isMenuOpen
                        ? 'max-h-96 opacity-100 pb-6'
                        : 'max-h-0 opacity-0 overflow-hidden'
                }`}>
                    <div className="pt-4 space-y-2">
                        {navigationItems.map((item) => (
                            <a
                                key={item.label}
                                href={item.href}
                                className="block px-3 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {item.label}
                            </a>
                        ))}

                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            {session ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 px-3 py-2">
                                        {session?.user?.image ? (
                                            <Image
                                                src={session.user.image}
                                                alt="avatar"
                                                width={40}
                                                height={40}
                                                className="w-10 h-10 rounded-full ring-2 ring-gray-200 dark:ring-gray-700"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                                                {session?.user?.name?.charAt(0) ?? "G"}
                                            </div>
                                        )}
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {session?.user?.name ?? "Guest"}
                                            </div>
                                            <div className="text-gray-500 dark:text-gray-400 text-sm">
                                                {session?.user?.email ?? "Not signed in"}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        className="w-full text-left px-3 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
                                        onClick={() => {
                                            signOut();
                                            setIsMenuOpen(false);
                                        }}
                                    >
                                        Sign out
                                    </button>
                                </div>
                            ) : (
                                <button
                                    className="w-full px-3 py-2 text-base font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                                    onClick={() => {
                                        signIn("google");
                                        setIsMenuOpen(false);
                                    }}
                                >
                                    Sign in with Google
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}