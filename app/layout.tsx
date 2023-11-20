// Importing global styles
import './globals.css';

// React imports
import { Suspense } from 'react';
import Footer from './components/footer';

// Metadata for the layout
export const metadata = {
  title: 'Inventory Xpert',
  description:
    'A user admin dashboard configured with Next.js, Flask, Mongo DB, Tailwind CSS, TypeScript, ESLint, and Prettier.'
};

// Root layout component
export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // Rendering the layout
  return (
    <html lang="en" className="h-full bg-gray-50">
      <body className="flex flex-col min-h-screen">
        <Suspense fallback={<div>Loading...</div>}>
          <main className="flex-grow">
            {children as React.ReactElement}
          </main>
          <footer className="mt-auto">
            <Footer/>
          </footer>
        </Suspense>
      </body>
    </html>
  );
}
