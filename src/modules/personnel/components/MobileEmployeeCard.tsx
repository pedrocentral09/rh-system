
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
            className="mb-4 shadow-xl active:scale-[0.98] transition-all cursor-pointer border-l-4 border-l-brand-blue bg-surface text-text-primary rounded-2xl overflow-hidden hover:shadow-2xl"
            onClick={onClick}
        >
            <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        {employee.photoUrl ? (
                            <img src={employee.photoUrl} alt="" className="w-12 h-12 rounded-xl object-cover border border-border" />
                        ) : (
                            <div className="w-12 h-12 rounded-xl bg-surface-secondary border border-border flex items-center justify-center text-sm font-black text-text-secondary uppercase">
                                {employee.name.charAt(0)}
                            </div>
                        )}
                        <div>
                            <h3 className="text-sm font-black text-text-primary uppercase tracking-tight truncate max-w-[150px]">{employee.name}</h3>
                            <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest truncate max-w-[150px] opacity-80">{employee.jobTitle || (employee as any).jobRole?.name || 'Sem cargo'}</p>
                        </div>
                    </div>
                    <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border
                        ${employee.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
                            : 'bg-surface-secondary border-border text-text-secondary opacity-70'}`}>
                        {translateStatus(employee.status)}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-[10px] text-text-secondary uppercase font-black mb-5 bg-surface-secondary/50 p-4 rounded-xl border border-border shadow-inner">
                    <div className="border-r border-border pr-2">
                        <span className="block text-text-secondary opacity-60 mb-1 tracking-tighter">LOJA / FILIAL</span>
                        <span className="font-black text-text-primary tracking-tight">{(employee as any).contract?.store?.name || '-'}</span>
                    </div>
                    <div className="pl-2">
                        <span className="block text-text-secondary opacity-60 mb-1 tracking-tighter">DEPARTAMENTO</span>
                        <span className="font-black text-text-primary tracking-tight">{(employee as any).contract?.sectorDef?.name || employee.department || '-'}</span>
                    </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-border">
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-9 w-9 bg-surface-secondary border border-border rounded-lg text-brand-blue hover:bg-brand-blue hover:text-white transition-all shadow-sm" onClick={onEdit} title="Editar">✏️</Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 bg-surface-secondary border border-border rounded-lg text-brand-orange hover:bg-brand-orange hover:text-white transition-all shadow-sm" onClick={onTransfer} title="Transferir">🚚</Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 bg-surface-secondary border border-border rounded-lg text-brand-blue hover:bg-brand-blue hover:text-white transition-all shadow-sm" onClick={onTimeTracking} title="Ponto">⏰</Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 bg-surface-secondary border border-border rounded-lg text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-sm" onClick={onVacation} title="Férias">🌴</Button>
                    </div>
                    <span className="text-[10px] text-brand-blue font-black uppercase tracking-widest flex items-center gap-1 active:translate-x-1 transition-transform">
                        Detalhes ➜
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
