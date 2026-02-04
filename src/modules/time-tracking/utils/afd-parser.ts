export interface AFDMarking {
    nsr: string;
    type: string;
    date: Date;
    time: string;
    pis: string;
    originalLine: string;
}

export function parseAFD(content: string): AFDMarking[] {
    const lines = content.split(/\r?\n/);
    const markings: AFDMarking[] = [];

    for (const line of lines) {
        if (!line || line.length < 10) continue;

        // Register Type 3: Marking (Marcacao de Ponto)
        // Layout Portaria 1510:
        // 0-9: NSR (Sequence)
        // 9-10: Type (should be '3')
        // 10-18: Date (DDMMYYYY)
        // 18-22: Time (HHMM)
        // 22-34: PIS (12 digits)

        const type = line.substring(9, 10);

        if (type === '3') {
            const nsr = line.substring(0, 9);
            const dateStr = line.substring(10, 18);
            const timeStr = line.substring(18, 22);
            const pis = line.substring(22, 34);

            // Parse Date
            const day = parseInt(dateStr.substring(0, 2));
            const month = parseInt(dateStr.substring(2, 4)) - 1; // JS Month is 0-indexed
            const year = parseInt(dateStr.substring(4, 8));
            const date = new Date(year, month, day);

            // Format Time
            const time = `${timeStr.substring(0, 2)}:${timeStr.substring(2, 4)}`;

            markings.push({
                nsr,
                type,
                date,
                time,
                pis,
                originalLine: line
            });
        }
    }

    return markings;
}
