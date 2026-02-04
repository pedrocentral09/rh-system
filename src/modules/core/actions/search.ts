'use server';

import { prisma } from '@/lib/prisma';

export type SearchResult = {
    type: 'PAGE' | 'EMPLOYEE';
    id: string;
    title: string;
    subtitle?: string;
    url: string;
    icon?: string;
};

export async function globalSearch(query: string): Promise<SearchResult[]> {
    if (!query || query.length < 2) return [];

    const results: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    // 1. Static Pages
    const pages = [
        { title: 'Dashboard', url: '/dashboard', icon: '🏠' },
        { title: 'Pessoal', url: '/dashboard/personnel', icon: '👥' },
        { title: 'Escalas', url: '/dashboard/scales', icon: '🗓️' },
        { title: 'Ponto', url: '/dashboard/time-tracking', icon: '⏰' },
        { title: 'Configurações', url: '/dashboard/configuration', icon: '⚙️' },
    ];

    pages.forEach(p => {
        if (p.title.toLowerCase().includes(lowerQuery)) {
            results.push({
                type: 'PAGE',
                id: `page-${p.title}`,
                title: p.title,
                subtitle: 'Navegação',
                url: p.url,
                icon: p.icon
            });
        }
    });

    // 2. Employees
    // Optimization for SQLite Case Insensitivity: Fetch all tiny subset or use raw query.
    // Given the scale mentioned (~small team), fetching all names/IDs is fine and allows fuzzy matching in JS.
    const allEmployees = await prisma.employee.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true, name: true, jobTitle: true }
    });

    const employees = allEmployees.filter(e =>
        e.name.toLowerCase().includes(lowerQuery)
    ).slice(0, 5); // Limit result set manually

    employees.forEach(emp => {
        results.push({
            type: 'EMPLOYEE',
            id: emp.id,
            title: emp.name,
            subtitle: emp.jobTitle,
            url: `/dashboard/personnel?open=${emp.id}`, // Assuming we can open details via URL param or similar
            icon: 'bust_in_silhouette'
        });
    });

    return results;
}
