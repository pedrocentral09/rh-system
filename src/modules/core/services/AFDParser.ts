
export interface AFDPunch {
    nsr: string;
    date: Date;
    time: string; // HH:mm
    pis: string;
}

export interface AFDEmployee {
    nsr: string;
    date: Date;
    operation: 'I' | 'A' | 'E'; // Inclusão, Alteração, Exclusão
    pis: string;
    name: string;
}

export interface AFDHeader {
    nsr: string;
    type: number;
    serialNumber: string;
    companyName: string;
    cnpj: string;
    cei: string;
    startDate: Date;
    endDate: Date;
}

export interface AFDParseResult {
    punches: AFDPunch[];
    employees: AFDEmployee[];
    totalLines: number;
    skippedLines: number;
}

export class AFDParser {

    /**
     * Parse a single AFD line and return its type and data.
     * AFD Portaria 1510 layout:
     * - Positions 0-8: NSR (9 digits, sequential)
     * - Position 9: Record Type (1=Header, 2=Company, 3=Punch, 4=Adjustment, 5=Employee, 9=Trailer)
     * 
     * Type 3 (Punch):
     *   10-17: Date (DDMMYYYY, 8 digits)
     *   18-21: Time (HHMM, 4 digits)
     *   22-33: PIS (12 digits)
     * 
     * Type 5 (Employee):
     *   10-17: Date (DDMMYYYY, 8 digits)
     *   18: Operation (I=Include, A=Alter, E=Exclude)
     *   19-30: PIS (12 digits)
     *   31-82: Name (52 chars)
     */
    static parsePunchLine(line: string): AFDPunch | null {
        if (line.length < 34 || line.charAt(9) !== '3') return null;

        try {
            const nsr = line.substring(0, 9).trim();
            const dateStr = line.substring(10, 18);
            const timeStr = line.substring(18, 22);
            const pis = line.substring(22, 34).trim();

            const day = parseInt(dateStr.substring(0, 2));
            const month = parseInt(dateStr.substring(2, 4)) - 1;
            const year = parseInt(dateStr.substring(4, 8));
            const date = new Date(Date.UTC(year, month, day));

            if (isNaN(date.getTime())) return null;

            const formattedTime = `${timeStr.substring(0, 2)}:${timeStr.substring(2, 4)}`;

            return { nsr, date, time: formattedTime, pis };
        } catch {
            return null;
        }
    }

    static parseEmployeeLine(line: string): AFDEmployee | null {
        if (line.length < 83 || line.charAt(9) !== '5') return null;

        try {
            const nsr = line.substring(0, 9).trim();
            const dateStr = line.substring(10, 18);
            const operation = line.charAt(18) as 'I' | 'A' | 'E';
            const pis = line.substring(19, 31).trim();
            const name = line.substring(31, 83).trim();

            const day = parseInt(dateStr.substring(0, 2));
            const month = parseInt(dateStr.substring(2, 4)) - 1;
            const year = parseInt(dateStr.substring(4, 8));
            const date = new Date(Date.UTC(year, month, day));

            if (isNaN(date.getTime())) return null;

            return { nsr, date, operation, pis, name };
        } catch {
            return null;
        }
    }

    static parseFile(content: string): AFDParseResult {
        const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
        const punches: AFDPunch[] = [];
        const employees: AFDEmployee[] = [];
        let skippedLines = 0;

        for (const line of lines) {
            if (line.length < 10) {
                skippedLines++;
                continue;
            }

            const type = line.charAt(9);

            if (type === '3') {
                const punch = this.parsePunchLine(line);
                if (punch) {
                    punches.push(punch);
                } else {
                    skippedLines++;
                }
            } else if (type === '5') {
                const employee = this.parseEmployeeLine(line);
                if (employee) {
                    employees.push(employee);
                } else {
                    skippedLines++;
                }
            }
            // Types 1, 2, 4, 9 are intentionally skipped (header, company, adjustment, trailer)
        }

        return {
            punches,
            employees,
            totalLines: lines.length,
            skippedLines
        };
    }
}
