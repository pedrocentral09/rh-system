'use client';

import { Modal } from '@/shared/components/ui/modal';
import { EmployeeForm } from './EmployeeForm';

interface EmployeeEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    employee: any;
}

export function EmployeeEditModal({ isOpen, onClose, onSuccess, employee }: EmployeeEditModalProps) {
    if (!employee) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Editar: ${employee.firstName} ${employee.lastName}`} width="2xl">
            <div className="max-h-[70vh] overflow-y-auto px-1">
                <EmployeeForm
                    initialData={employee}
                    employeeId={employee.id}
                    onSuccess={onSuccess}
                    onCancel={onClose}
                />
            </div>
        </Modal>
    );
}
