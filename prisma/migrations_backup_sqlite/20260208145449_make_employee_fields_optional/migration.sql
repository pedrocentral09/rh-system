-- CreateTable
CREATE TABLE "core_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firebaseUid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'EMPLOYEE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "roleId" TEXT,
    CONSTRAINT "core_users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "core_roles" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "core_roles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "permissions" TEXT NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "personnel_employees" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "rg" TEXT NOT NULL,
    "dateOfBirth" DATETIME NOT NULL,
    "gender" TEXT NOT NULL,
    "maritalStatus" TEXT NOT NULL,
    "pis" TEXT,
    "ctps" TEXT,
    "voterTitle" TEXT,
    "phone" TEXT,
    "landline" TEXT,
    "photoUrl" TEXT,
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "emergencyContactRelationship" TEXT,
    "hireDate" DATETIME,
    "jobTitle" TEXT,
    "department" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "personnel_employees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "core_users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "personnel_addresses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "complement" TEXT,
    "neighborhood" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    CONSTRAINT "personnel_addresses_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "personnel_employees" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "personnel_bank_data" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "agency" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "accountType" TEXT NOT NULL,
    "pixKey" TEXT,
    CONSTRAINT "personnel_bank_data_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "personnel_employees" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "personnel_legal_guardians" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "rg" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    CONSTRAINT "personnel_legal_guardians_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "personnel_employees" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "personnel_health_data" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "asoType" TEXT NOT NULL,
    "lastAsoDate" DATETIME NOT NULL,
    "periodicity" INTEGER NOT NULL,
    "observations" TEXT,
    CONSTRAINT "personnel_health_data_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "personnel_employees" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "personnel_contracts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "companyId" TEXT,
    "storeId" TEXT,
    "sector" TEXT NOT NULL,
    "baseSalary" DECIMAL NOT NULL,
    "contractType" TEXT NOT NULL,
    "workShift" TEXT NOT NULL DEFAULT 'FULL_TIME',
    "admissionDate" DATETIME NOT NULL,
    "isExperienceContract" BOOLEAN NOT NULL DEFAULT false,
    "experienceDays" INTEGER,
    "isExperienceExtended" BOOLEAN NOT NULL DEFAULT false,
    "transportVoucherValue" DECIMAL,
    "mealVoucherValue" DECIMAL,
    "foodVoucherValue" DECIMAL,
    "hasFamilySalary" BOOLEAN NOT NULL DEFAULT false,
    "familySalaryDependents" INTEGER NOT NULL DEFAULT 0,
    "terminationDate" DATETIME,
    "terminationReason" TEXT,
    "hasInsalubrity" BOOLEAN NOT NULL DEFAULT false,
    "insalubrityLevel" INTEGER NOT NULL DEFAULT 0,
    "insalubrityBase" DECIMAL,
    "hasDangerousness" BOOLEAN NOT NULL DEFAULT false,
    "dangerousnessBase" DECIMAL,
    "hasTrustPosition" BOOLEAN NOT NULL DEFAULT false,
    "trustPositionBase" DECIMAL,
    "hasCashHandling" BOOLEAN NOT NULL DEFAULT false,
    "cashHandlingBase" DECIMAL,
    "monthlyBonus" DECIMAL,
    "otherBenefits" TEXT,
    CONSTRAINT "personnel_contracts_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "personnel_employees" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "personnel_contracts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "core_companies" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "personnel_contracts_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "core_stores" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "personnel_documents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "signatureHash" TEXT,
    "signatureDate" DATETIME,
    "signatureIp" TEXT,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "personnel_documents_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "personnel_employees" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "personnel_transfer_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "previousStore" TEXT NOT NULL,
    "newStore" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    CONSTRAINT "personnel_transfer_history_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "personnel_employees" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "config_company" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "updatedBy" TEXT
);

-- CreateTable
CREATE TABLE "config_audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "details" TEXT,
    "ipAddress" TEXT,
    "userId" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "config_audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "core_users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "core_companies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "street" TEXT,
    "number" TEXT,
    "neighborhood" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "core_stores" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "companyId" TEXT,
    "street" TEXT,
    "number" TEXT,
    "neighborhood" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "core_stores_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "core_companies" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "time_shift_types" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "breakDuration" INTEGER NOT NULL DEFAULT 60,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "time_work_scales" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "employeeId" TEXT NOT NULL,
    "shiftTypeId" TEXT,
    CONSTRAINT "time_work_scales_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "personnel_employees" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "time_work_scales_shiftTypeId_fkey" FOREIGN KEY ("shiftTypeId") REFERENCES "time_shift_types" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "personnel_employment_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "store" TEXT NOT NULL,
    "admissionDate" DATETIME NOT NULL,
    "terminationDate" DATETIME NOT NULL,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "personnel_employment_history_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "personnel_employees" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "time_clock_files" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fileName" TEXT NOT NULL,
    "fileHash" TEXT NOT NULL,
    "store" TEXT,
    "uploadDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'PROCESSING',
    "errorLog" TEXT
);

-- CreateTable
CREATE TABLE "time_records" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fileId" TEXT,
    "pis" TEXT NOT NULL,
    "employeeId" TEXT,
    "date" DATETIME NOT NULL,
    "time" TEXT NOT NULL,
    "nsr" TEXT,
    "originalLine" TEXT,
    "isManual" BOOLEAN NOT NULL DEFAULT false,
    "justification" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "time_records_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "time_clock_files" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "time_records_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "personnel_employees" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "time_sheet_closings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "totalBalance" DECIMAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CLOSED',
    "pdfUrl" TEXT,
    "closedBy" TEXT,
    "closedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "time_sheet_closings_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "personnel_employees" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "vacations_periods" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "limitDate" DATETIME NOT NULL,
    "vested" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "vacations_periods_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "personnel_employees" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "vacations_requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "periodId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "daysCount" INTEGER NOT NULL,
    "soldDays" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "vacations_requests_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "vacations_periods" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "vacations_requests_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "personnel_employees" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "payroll_periods" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "payroll_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "payroll_payslips" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "periodId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "grossSalary" DECIMAL NOT NULL DEFAULT 0,
    "netSalary" DECIMAL NOT NULL DEFAULT 0,
    "totalAdditions" DECIMAL NOT NULL DEFAULT 0,
    "totalDeductions" DECIMAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "payroll_payslips_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "payroll_periods" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "payroll_payslips_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "personnel_employees" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "payroll_payslip_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "payslipId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "reference" DECIMAL,
    "value" DECIMAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "payroll_payslip_items_payslipId_fkey" FOREIGN KEY ("payslipId") REFERENCES "payroll_payslips" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "payroll_payslip_items_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "payroll_events" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "payroll_imports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "processedCount" INTEGER NOT NULL DEFAULT 0,
    "totalValue" DECIMAL NOT NULL DEFAULT 0,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "payroll_imports_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "payroll_periods" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "disciplinary_records" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "daysSuspended" INTEGER DEFAULT 0,
    "startDate" DATETIME,
    "returnDate" DATETIME,
    "documents" TEXT,
    "payrollStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "managerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "disciplinary_records_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "personnel_employees" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "recruitment_jobs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "type" TEXT NOT NULL DEFAULT 'CLT',
    "salaryRangeMin" DECIMAL,
    "salaryRangeMax" DECIMAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "recruitment_candidates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "linkedin" TEXT,
    "resumeUrl" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "recruitment_applications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "rating" INTEGER,
    "feedback" TEXT,
    "appliedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "recruitment_applications_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "recruitment_jobs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "recruitment_applications_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "recruitment_candidates" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "onboarding_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "items" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "onboarding_processes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT,
    "candidateId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "onboarding_processes_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "personnel_employees" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "onboarding_processes_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "recruitment_candidates" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "onboarding_tasks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "processId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "assignedTo" TEXT,
    "dueDate" DATETIME,
    "completedAt" DATETIME,
    "completedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "onboarding_tasks_processId_fkey" FOREIGN KEY ("processId") REFERENCES "onboarding_processes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "core_users_firebaseUid_key" ON "core_users"("firebaseUid");

-- CreateIndex
CREATE UNIQUE INDEX "core_users_email_key" ON "core_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "core_roles_name_key" ON "core_roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "personnel_employees_email_key" ON "personnel_employees"("email");

-- CreateIndex
CREATE UNIQUE INDEX "personnel_employees_cpf_key" ON "personnel_employees"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "personnel_employees_userId_key" ON "personnel_employees"("userId");

-- CreateIndex
CREATE INDEX "personnel_employees_status_idx" ON "personnel_employees"("status");

-- CreateIndex
CREATE INDEX "personnel_employees_department_idx" ON "personnel_employees"("department");

-- CreateIndex
CREATE INDEX "personnel_employees_email_idx" ON "personnel_employees"("email");

-- CreateIndex
CREATE UNIQUE INDEX "personnel_addresses_employeeId_key" ON "personnel_addresses"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "personnel_bank_data_employeeId_key" ON "personnel_bank_data"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "personnel_legal_guardians_employeeId_key" ON "personnel_legal_guardians"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "personnel_health_data_employeeId_key" ON "personnel_health_data"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "personnel_contracts_employeeId_key" ON "personnel_contracts"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "core_companies_cnpj_key" ON "core_companies"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "time_work_scales_employeeId_date_key" ON "time_work_scales"("employeeId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "time_clock_files_fileHash_key" ON "time_clock_files"("fileHash");

-- CreateIndex
CREATE INDEX "time_records_employeeId_date_idx" ON "time_records"("employeeId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "time_sheet_closings_employeeId_month_year_key" ON "time_sheet_closings"("employeeId", "month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_periods_month_year_key" ON "payroll_periods"("month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_events_code_key" ON "payroll_events"("code");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_payslips_periodId_employeeId_key" ON "payroll_payslips"("periodId", "employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "recruitment_candidates_email_key" ON "recruitment_candidates"("email");

-- CreateIndex
CREATE UNIQUE INDEX "recruitment_applications_jobId_candidateId_key" ON "recruitment_applications"("jobId", "candidateId");
