import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Família RH - Sistema de Gestão',
        short_name: 'Família RH',
        description: 'Portal do Colaborador e Gestão de Pessoas',
        start_url: '/',
        display: 'standalone',
        background_color: '#0f172a',
        theme_color: '#fb923c',
        icons: [
            {
                src: '/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}
