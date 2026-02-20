import { Modal } from '@/shared/components/ui/modal';
import { EmployeeTimeSheetTab } from '@/modules/time-tracking/components/EmployeeTimeSheetTab';

interface EmployeeTimeTrackingModalProps {
    isOpen: boolean;
    onClose: () => void;
    employee: any;
}

export function EmployeeTimeTrackingModal({ isOpen, onClose, employee }: EmployeeTimeTrackingModalProps) {
    if (!employee) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Controle de Ponto: ${employee.name}`}
            width="5xl"
        >
            <div className="mt-4">
                {/* 
                    Directly reusing the TimeSheet module component.
                    This acts as a "portal" or "view" into the Time Tracking module 
                    without duplicating logic in Personnel.
                 */}
                <EmployeeTimeSheetTab employeeId={employee.id} />
            </div>
        </Modal>
    );
}
