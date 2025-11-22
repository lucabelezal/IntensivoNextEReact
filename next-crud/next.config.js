/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

    // Otimizações de performance
    swcMinify: true,
    compress: true,

    // Otimiza fontes automaticamente
    optimizeFonts: true,

    // Remove código não usado em produção
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production' ? {
            exclude: ['error', 'warn'],
        } : false,
    },

    // Headers para PWA e cache
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on'
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'SAMEORIGIN'
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
