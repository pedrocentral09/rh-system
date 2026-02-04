'use client';

import { Modal } from '@/shared/components/ui/modal';
import { EmployeeForm } from './EmployeeForm';

interface EmployeeCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function EmployeeCreateModal({ isOpen, onClose, onSuccess }: EmployeeCreateModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Cadastrar Novo Funcionário" width="2xl">
            <div className="max-h-[70vh] overflow-y-auto px-1">
                <EmployeeForm onSuccess={onSuccess} onCancel={onClose} />
            </div>
        </Modal>
    );
}
