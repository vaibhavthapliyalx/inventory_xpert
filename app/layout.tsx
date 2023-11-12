import './globals.css';
import Nav from './nav';
import Toast from './toast';
import { Suspense } from 'react';

export const metadata = {
  title: 'Inventory Xpert',
  description:
    'A user admin dashboard configured with Next.js, Flask, Mongo DB, Tailwind CSS, TypeScript, ESLint, and Prettier.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  
  return (
    <html lang="en" className="h-full bg-gray-50">
      <body className="h-full">
        <Suspense fallback={<div>Loading...</div>}>
          <Nav/>
        </Suspense>
        {children}
        <Toast />
      </body>
    </html>
  );
}

