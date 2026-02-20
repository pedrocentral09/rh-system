
/**
 * Calculadora de Horas Extras e Faltas
 */

export interface TimeCalculationResult {
    value: number;
    hours: number;
    description: string;
}

export class OvertimeCalculator {
    private static DEFAULT_DIVISOR = 220;

    /**
     * Calcula o valor de horas extras (50% por padrão)
     */
    static calculateOvertime(baseSalary: number, minutes: number, multiplier: number = 1.5): TimeCalculationResult {
        const hourlyRate = baseSalary / this.DEFAULT_DIVISOR;
        const hours = minutes / 60;
        const value = hours * hourlyRate * multiplier;

        return {
            value: this.round(value),
            hours: this.round(hours),
            description: `Hora Extra (${(multiplier - 1) * 100}%)`
        };
    }

    /**
     * Calcula o valor de faltas/atrasos
     */
    static calculateAbsence(baseSalary: number, minutes: number): TimeCalculationResult {
        const hourlyRate = baseSalary / this.DEFAULT_DIVISOR;
        const hours = minutes / 60;
        const value = hours * hourlyRate;

        return {
            value: this.round(value),
            hours: this.round(hours),
            description: 'Faltas/Atrasos'
        };
    }

    private static round(num: number): number {
        return Math.round(num * 100) / 100;
    }
}
