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
        <Modal isOpen={isOpen} onClose={onClose} hideHeader width="6xl">
            <EmployeeForm onSuccess={onSuccess} onCancel={onClose} />
        </Modal>
    );
}
