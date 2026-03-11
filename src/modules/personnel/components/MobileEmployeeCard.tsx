
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { User, Pencil, Truck, Clock, Palmtree, ChevronRight, Building2, MapPin } from "lucide-react";

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
            className="mb-4 shadow-xl active:scale-[0.98] transition-all cursor-pointer border border-border bg-surface text-text-primary rounded-3xl overflow-hidden hover:shadow-2xl relative"
            onClick={onClick}
        >
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            {employee.photoUrl ? (
                                <img src={employee.photoUrl} alt="" className="w-14 h-14 rounded-2xl object-cover border border-border shadow-md" />
                            ) : (
                                <div className="w-14 h-14 rounded-2xl bg-surface-secondary border border-border flex items-center justify-center">
                                    <User className="h-6 w-6 text-text-secondary" />
                                </div>
                            )}
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-surface ${employee.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-text-muted'}`} />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-[13px] font-black text-text-primary uppercase tracking-tight truncate">{employee.name}</h3>
                            <p className="text-[9px] text-brand-orange font-bold uppercase tracking-[0.15em] mt-1 opacity-90">{employee.jobTitle || (employee as any).jobRole?.name || 'Sem cargo'}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-px bg-border rounded-2xl overflow-hidden border border-border mb-6">
                    <div className="bg-surface-secondary/40 p-4">
                        <div className="flex items-center gap-2 mb-1 opacity-70">
                            <Building2 className="h-3 w-3" />
                            <span className="text-[8px] font-black uppercase tracking-wider">UNIDADE</span>
                        </div>
                        <span className="block text-[10px] font-black text-text-primary truncate uppercase">{(employee as any).contract?.store?.name || '-'}</span>
                    </div>
                    <div className="bg-surface-secondary/40 p-4">
                        <div className="flex items-center gap-2 mb-1 opacity-70">
                            <MapPin className="h-3 w-3" />
                            <span className="text-[8px] font-black uppercase tracking-wider">SETOR</span>
                        </div>
                        <span className="block text-[10px] font-black text-text-primary truncate uppercase">{(employee as any).contract?.sectorDef?.name || employee.department || '-'}</span>
                    </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                    <div className="flex gap-2">
                        <button onClick={onEdit} className="w-10 h-10 rounded-xl bg-surface-secondary border border-border flex items-center justify-center text-brand-orange hover:bg-brand-orange hover:text-white transition-all active:scale-90" title="Editar"><Pencil className="h-4 w-4" /></button>
                        <button onClick={onTransfer} className="w-10 h-10 rounded-xl bg-surface-secondary border border-border flex items-center justify-center text-brand-blue hover:bg-brand-blue hover:text-white transition-all active:scale-90" title="Transferir"><Truck className="h-4 w-4" /></button>
                        <button onClick={onTimeTracking} className="w-10 h-10 rounded-xl bg-surface-secondary border border-border flex items-center justify-center text-text-secondary hover:bg-text-primary hover:text-white transition-all active:scale-90" title="Ponto"><Clock className="h-4 w-4" /></button>
                        <button onClick={onVacation} className="w-10 h-10 rounded-xl bg-surface-secondary border border-border flex items-center justify-center text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all active:scale-90" title="Férias"><Palmtree className="h-4 w-4" /></button>
                    </div>
                    <ChevronRight className="h-5 w-5 text-text-secondary opacity-30" />
                </div>
            </CardContent>
        </Card>
    );
}
