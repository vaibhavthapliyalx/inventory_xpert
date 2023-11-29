/** @type {import('next').NextConfig} */
const nextConfig = {
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
  images: {
    domains: ['localhost'], // Add your domain(s) here
    loader: 'default',
  }
}
// const withTM = require('next-transpile-modules')([
//     '@mui/material',
//     '@mui/system',
//   ]);
  
//   const tm = withTM({
//    webpack: (config) => {
//      config.resolve.alias = {
//        ...config.resolve.alias,
//       '@mui/styled-engine': '@mui/styled-engine-sc',
//       };
//       return config;
//     }
//   });

module.exports = nextConfig
