import { formatCurrency, formatPercent } from "@/lib/format"
import type { ProjectDashboardResponse } from "@/lib/types"

export function exportProjectPdf(project: ProjectDashboardResponse) {
  const printWindow = window.open("", "_blank")
  if (!printWindow) return

  const dateStr = new Date().toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  const spent = project.budget - project.remaining

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Project Report - ${project.name}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #111827;
            padding: 40px;
            margin: 0;
            background: #ffffff;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .brand {
            font-size: 24px;
            font-weight: 700;
            color: #059669;
            margin: 0;
          }
          .doc-type {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #6b7280;
            margin-top: 4px;
          }
          .meta {
            text-align: right;
            font-size: 13px;
            color: #6b7280;
          }
          .title-section {
            margin-bottom: 30px;
          }
          .title-section h1 {
            font-size: 22px;
            margin: 0 0 6px 0;
            color: #111827;
          }
          .title-section p {
            margin: 0;
            font-size: 14px;
            color: #6b7280;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            margin-bottom: 30px;
          }
          .stat-card {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 16px;
          }
          .stat-label {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #6b7280;
            margin-bottom: 6px;
          }
          .stat-value {
            font-size: 18px;
            font-weight: 700;
            color: #111827;
          }
          .progress-bar-bg {
            height: 8px;
            background: #e5e7eb;
            border-radius: 4px;
            overflow: hidden;
            margin-top: 8px;
          }
          .progress-bar-fill {
            height: 100%;
            background: #059669;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            padding: 12px 16px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
            font-size: 14px;
          }
          th {
            background: #f9fafb;
            font-weight: 600;
            color: #374151;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: #9ca3af;
          }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="brand">Zimba</h1>
            <div class="doc-type">Project Financial Report</div>
          </div>
          <div class="meta">
            <div>Date: ${dateStr}</div>
            <div>Status: ${project.pct > 90 ? "Over Budget" : "Active"}</div>
          </div>
        </div>

        <div class="title-section">
          <h1>${project.name}</h1>
          <p>Location: ${project.location || "N/A"}</p>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Total Budget</div>
            <div class="stat-value">${formatCurrency(project.budget)}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Amount Spent</div>
            <div class="stat-value">${formatCurrency(spent)}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Remaining Budget</div>
            <div class="stat-value">${formatCurrency(project.remaining)}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Utilization</div>
            <div class="stat-value">${formatPercent(project.pct)}</div>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" style="width: ${Math.min(100, project.pct)}%;"></div>
            </div>
          </div>
        </div>

        <h3>Financial Breakdown</h3>
        <table>
          <thead>
            <tr>
              <th>Metric</th>
              <th>Value</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Allocated Budget</td>
              <td><strong>${formatCurrency(project.budget)}</strong></td>
              <td>100%</td>
            </tr>
            <tr>
              <td>Total Expenses / Spent</td>
              <td><strong>${formatCurrency(spent)}</strong></td>
              <td>${formatPercent(project.pct)}</td>
            </tr>
            <tr>
              <td>Remaining Balance</td>
              <td><strong>${formatCurrency(project.remaining)}</strong></td>
              <td>${formatPercent(100 - project.pct)}</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <div>Generated via Zimba Platform Monitoring</div>
          <div>Confidential Report</div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `

  printWindow.document.write(html)
  printWindow.document.close()
}
