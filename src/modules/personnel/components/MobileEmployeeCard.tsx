
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";

interface Employee {
    id: string;
    name: string;
    cpf: string;
    department: string | null;
    jobTitle: string | null;
    status: string;
    photoUrl: string | null;
}

interface MobileEmployeeCardProps {
    employee: Employee;
    onClick: (e: any) => void;
    onEdit: (e: any) => void;
    onTransfer: (e: any) => void;
    onTimeTracking: (e: any) => void;
    onVacation: (e: any) => void;
    translateStatus: (status: string) => string;
}

export function MobileEmployeeCard({
    employee,
    onClick,
    onEdit,
    onTransfer,
    onTimeTracking,
    onVacation,
    translateStatus
}: MobileEmployeeCardProps) {
    return (
        <Card
            className="mb-4 shadow-sm active:scale-[0.99] transition-transform cursor-pointer border-l-4 border-l-indigo-500 bg-white dark:bg-slate-800 dark:border-slate-700"
            onClick={onClick}
        >
            <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                        {employee.photoUrl ? (
                            <img src={employee.photoUrl} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-600" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-500 dark:text-slate-300">
                                {employee.name.charAt(0)}
                            </div>
                        )}
                        <div>
                            <h3 className="font-semibold text-slate-800 dark:text-slate-100">{employee.name}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{employee.jobTitle || 'Sem cargo'}</p>
                        </div>
                    </div>
                    <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full 
                        ${employee.status === 'ACTIVE' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                        {translateStatus(employee.status)}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 mb-4 bg-slate-50 dark:bg-slate-900 p-2 rounded">
                    <div>
                        <span className="block text-slate-400 dark:text-slate-500">Departamento</span>
                        <span className="font-medium text-slate-700 dark:text-slate-200">{employee.department || '-'}</span>
                    </div>
                    <div>
                        <span className="block text-slate-400 dark:text-slate-500">CPF</span>
                        <span className="font-medium text-slate-700 dark:text-slate-200">{employee.cpf}</span>
                    </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex space-x-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300" onClick={onEdit}>✏️</Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300" onClick={onTransfer}>🚚</Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300" onClick={onTimeTracking}>⏰</Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-sky-500 hover:text-sky-600 dark:hover:text-sky-400" onClick={onVacation}>🏖️</Button>
                    </div>
                    <span className="text-xs text-indigo-500 dark:text-indigo-400 font-medium">Ver Detalhes →</span>
                </div>
            </CardContent>
        </Card>
    );
}
