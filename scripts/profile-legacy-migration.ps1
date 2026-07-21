$ErrorActionPreference = 'Stop'

$config = @{}
Get-Content -LiteralPath 'apps/web/.env.local' | ForEach-Object {
    if ($_ -match '^(DATABASE_URL|DEV_DATABASE_URL)=(.*)$') {
        $config[$matches[1]] = $matches[2].Trim().Trim('"').Replace('postgresql+psycopg://', 'postgresql://')
    }
}

if (-not $config['DATABASE_URL'] -or -not $config['DEV_DATABASE_URL']) {
    throw 'DATABASE_URL and DEV_DATABASE_URL are required in apps/web/.env.local'
}

$sourceSql = @'
SELECT 'projects', count(*), count(DISTINCT organization_id) FROM projects
UNION ALL SELECT 'tasks', count(*), count(DISTINCT project_id) FROM tasks
UNION ALL SELECT 'suppliers', count(*), count(DISTINCT organization_id) FROM suppliers
UNION ALL SELECT 'expenses', count(*), count(DISTINCT COALESCE(receipt_id,id)) FROM expenses
UNION ALL SELECT 'upcoming_payments', count(*), count(DISTINCT project_id) FROM upcoming_payments
UNION ALL SELECT 'uploaded_files', count(*), count(DISTINCT organization_id) FROM uploaded_files
UNION ALL SELECT 'payable_expenses', count(*), count(DISTINCT project_id) FROM payable_expenses
UNION ALL SELECT 'payable_expense_lines', count(*), count(DISTINCT expense_id) FROM payable_expense_lines
UNION ALL SELECT 'ledger_payments', count(*), count(DISTINCT supplier_id) FROM ledger_payments
UNION ALL SELECT 'ledger_payment_allocations', count(*), count(DISTINCT payment_id) FROM ledger_payment_allocations
UNION ALL SELECT 'ledger_payment_reversals', count(*), count(DISTINCT payment_id) FROM ledger_payment_reversals
ORDER BY 1;
'@

$targetSql = @'
SELECT 'project', count(*) FROM project
UNION ALL SELECT 'allocation', count(*) FROM allocation
UNION ALL SELECT 'supplier', count(*) FROM supplier
UNION ALL SELECT 'expense', count(*) FROM expense
UNION ALL SELECT 'expense_line', count(*) FROM expense_line
UNION ALL SELECT 'payable', count(*) FROM payable
UNION ALL SELECT 'ledger_payment', count(*) FROM ledger_payment
UNION ALL SELECT 'uploaded_file', count(*) FROM uploaded_file
UNION ALL SELECT 'project_attachment', count(*) FROM project_attachment
ORDER BY 1;
'@

Write-Output 'SOURCE_PROFILE table|rows|groups'
& psql $config['DATABASE_URL'] -X -At -F '|' -v ON_ERROR_STOP=1 -c $sourceSql
Write-Output 'TARGET_PROFILE table|rows'
& psql $config['DEV_DATABASE_URL'] -X -At -F '|' -v ON_ERROR_STOP=1 -c $targetSql

Write-Output 'SOURCE_INTEGRITY issue|count'
& psql $config['DATABASE_URL'] -X -At -F '|' -v ON_ERROR_STOP=1 -c @'
SELECT 'expenses_missing_task', count(*) FROM expenses e LEFT JOIN tasks t ON t.id=e.task_id WHERE t.id IS NULL
UNION ALL SELECT 'expenses_missing_project', count(*) FROM expenses e LEFT JOIN projects p ON p.id=e.project_id WHERE p.id IS NULL
UNION ALL SELECT 'expenses_missing_supplier', count(*) FROM expenses e LEFT JOIN suppliers s ON s.id=e.supplier_id WHERE e.supplier_id IS NOT NULL AND s.id IS NULL
UNION ALL SELECT 'payables_without_lines', count(*) FROM payable_expenses p LEFT JOIN payable_expense_lines l ON l.expense_id=p.id WHERE l.id IS NULL
UNION ALL SELECT 'payments_without_allocations', count(*) FROM ledger_payments p LEFT JOIN ledger_payment_allocations a ON a.payment_id=p.id WHERE a.id IS NULL
UNION ALL SELECT 'files_without_uploader_column', count(*) FROM uploaded_files
UNION ALL SELECT 'expense_receipt_groups_cross_project', count(*) FROM (SELECT COALESCE(receipt_id,id) FROM expenses GROUP BY COALESCE(receipt_id,id) HAVING count(DISTINCT project_id)>1) q
UNION ALL SELECT 'expense_receipt_groups_cross_supplier', count(*) FROM (SELECT COALESCE(receipt_id,id) FROM expenses GROUP BY COALESCE(receipt_id,id) HAVING count(DISTINCT supplier_id)>1) q
ORDER BY 1;
'@

Write-Output 'SOURCE_IDENTITIES kind|id|key|name'
@'
SELECT 'user', id, email, name FROM "user"
UNION ALL SELECT 'organization', id, slug, name FROM organization
UNION ALL SELECT 'member', id, organization_id, user_id FROM member
ORDER BY 1,2;
'@ | & psql $config['DATABASE_URL'] -X -At -F '|' -v ON_ERROR_STOP=1

Write-Output 'TARGET_IDENTITIES kind|id|key|name'
@'
SELECT 'user', id, email, name FROM "user"
UNION ALL SELECT 'organization', id, slug, name FROM organization
UNION ALL SELECT 'member', id, organization_id, user_id FROM member
ORDER BY 1,2;
'@ | & psql $config['DEV_DATABASE_URL'] -X -At -F '|' -v ON_ERROR_STOP=1
