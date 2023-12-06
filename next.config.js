/** @type {import('next').NextConfig} */
const nextConfig = {
  // Here, I have added a rewrite to the API path to point to the API server.
  // This proxies the API requests from the Next.js app to the API server.
  // This makes it possible to use the same domain for the Flask App and the Next.js App.
  rewrites: async () => {
    return [
      {
        source: '/api/:path*',
        destination:
          process.env.NODE_ENV === 'development'
            ? 'http://127.0.0.1:5328/api/:path*'
            : '/api/',
      },
    ]
  },
  // Here, localhost has been added to create a new domain for images.
  images: {
    domains: ['localhost'], 
    loader: 'default',
  }
}

module.exports = nextConfig
