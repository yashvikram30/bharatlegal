'use client';
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen text-center p-8">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-xl mb-6">This page could not be found.</p>
      <p className="mb-6 max-w-xl">
        Simplifying legal access for all Indians through AI-powered tools and plain language explanations.
      </p>
      <Link 
        href="/" 
        className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        Go Back Home
      </Link>
    </main>
  );
}
