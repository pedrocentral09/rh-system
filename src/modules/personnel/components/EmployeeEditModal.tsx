import { useState, useEffect } from 'react';
import { Modal } from '@/shared/components/ui/modal';
import { EmployeeForm } from './EmployeeForm';
import { getEmployee } from '../actions';
import { Loader2 } from 'lucide-react';

interface EmployeeEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    employee: any; // The partial employee from list
    defaultTab?: string;
}

export function EmployeeEditModal({ isOpen, onClose, onSuccess, employee, defaultTab }: EmployeeEditModalProps) {
    const [fullEmployee, setFullEmployee] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && employee?.id) {
            setLoading(true);
            getEmployee(employee.id)
                .then(result => {
                    if (result.success) {
                        setFullEmployee(result.data);
                    } else {
                        console.error("Failed to load full employee details");
                        // Optional: show toast error
                    }
                })
                .finally(() => setLoading(false));
        } else {
            setFullEmployee(null);
        }
    }, [isOpen, employee]);

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Editar: ${employee?.name || 'Colaborador'}`} width="5xl">
            <div className="max-h-[70vh] overflow-y-auto px-1">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                    </div>
                ) : (
                    fullEmployee && (
                        <EmployeeForm
                            initialData={fullEmployee}
                            employeeId={fullEmployee.id}
                            onSuccess={onSuccess}
                            onCancel={onClose}
                            defaultTab={defaultTab}
                        />
                    )
                )}
            </div>
        </Modal>
    );
}
