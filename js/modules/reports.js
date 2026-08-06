/**
 * Downloadable Reports Module Component (Excel/CSV & Formatted PDF)
 */
import { db } from '../dbState.js';
import { formatPHP, calculateReferralFee, getEliteLevel } from '../matrixEngine.js';

export function renderReports(container) {
  if (!container) return;
  container.innerHTML = `
    <div class="card" style="margin-bottom: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div>
          <h2 style="margin: 0;">Reports & Data Export Center</h2>
          <p style="font-size: 0.84rem; color: var(--text-secondary); margin-top: 4px;">Generate, export to CSV/Excel, or download individual PDF reports for all matrix records.</p>
        </div>
        <button class="btn btn-primary" id="btn-print-pdf"><i class="fas fa-print"></i> Print Entire Dashboard Page</button>
      </div>
    </div>

    <!-- 5 Major Downloadable Reports Grid -->
    <div class="grid-3">
      <!-- 1. Invite Report -->
      <div class="card">
        <div class="card-header">
          <div class="card-title"><i class="fas fa-file-alt" style="color: var(--accent-blue);"></i> 1. Invite Report</div>
        </div>
        <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 16px;">
          Log of all submitted invites, schools/companies, training types, dates, and verification statuses.
        </p>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button class="btn btn-secondary btn-sm btn-export-csv" data-report="invites"><i class="fas fa-file-excel"></i> Export to Excel (CSV)</button>
          <button class="btn btn-primary btn-sm btn-export-pdf" data-report="invites" style="background: #0284c7; border: none;"><i class="fas fa-file-pdf"></i> Download PDF</button>
        </div>
      </div>

      <!-- 2. Enrollment Report -->
      <div class="card">
        <div class="card-header">
          <div class="card-title"><i class="fas fa-file-invoice" style="color: var(--accent-emerald);"></i> 2. Enrollment Report</div>
        </div>
        <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 16px;">
          Participants master list including net investment fees, payments collected, and balance details.
        </p>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button class="btn btn-secondary btn-sm btn-export-csv" data-report="enrollments"><i class="fas fa-file-excel"></i> Export to Excel (CSV)</button>
          <button class="btn btn-primary btn-sm btn-export-pdf" data-report="enrollments" style="background: #0284c7; border: none;"><i class="fas fa-file-pdf"></i> Download PDF</button>
        </div>
      </div>

      <!-- 3. Unit Report -->
      <div class="card">
        <div class="card-header">
          <div class="card-title"><i class="fas fa-star" style="color: var(--accent-amber);"></i> 3. Unit Report</div>
        </div>
        <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 16px;">
          Accumulated unit statements, monthly units earned, conversion calculations, and tier progress.
        </p>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button class="btn btn-secondary btn-sm btn-export-csv" data-report="units"><i class="fas fa-file-excel"></i> Export to Excel (CSV)</button>
          <button class="btn btn-primary btn-sm btn-export-pdf" data-report="units" style="background: #0284c7; border: none;"><i class="fas fa-file-pdf"></i> Download PDF</button>
        </div>
      </div>

      <!-- 4. Referral Fee Report -->
      <div class="card">
        <div class="card-header">
          <div class="card-title"><i class="fas fa-percentage" style="color: var(--accent-purple);"></i> 4. Referral Fee Report</div>
        </div>
        <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 16px;">
          Memo 1 Atsoca Matrix calculations, percentage rates, and computed referral fees by participant.
        </p>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button class="btn btn-secondary btn-sm btn-export-csv" data-report="fees"><i class="fas fa-file-excel"></i> Export to Excel (CSV)</button>
          <button class="btn btn-primary btn-sm btn-export-pdf" data-report="fees" style="background: #0284c7; border: none;"><i class="fas fa-file-pdf"></i> Download PDF</button>
        </div>
      </div>

      <!-- 5. Referral Fee Release History -->
      <div class="card">
        <div class="card-header">
          <div class="card-title"><i class="fas fa-history" style="color: var(--accent-rose);"></i> 5. Release History Report</div>
        </div>
        <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 16px;">
          Complete payout release log with reference numbers, amounts, dates, and finance status.
        </p>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button class="btn btn-secondary btn-sm btn-export-csv" data-report="releases"><i class="fas fa-file-excel"></i> Export to Excel (CSV)</button>
          <button class="btn btn-primary btn-sm btn-export-pdf" data-report="releases" style="background: #0284c7; border: none;"><i class="fas fa-file-pdf"></i> Download PDF</button>
        </div>
      </div>
    </div>

    <!-- Active Report Preview Area -->
    <div class="card" id="report-preview-card">
      <div class="card-header">
        <div class="card-title"><i class="fas fa-eye"></i> Master Audit Summary Report Preview</div>
      </div>
      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Total Count / Records</th>
              <th>Financial Valuation</th>
              <th>Audit Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Submitted Invites</strong></td>
              <td>${db.data.invites.length} Invites</td>
              <td>N/A</td>
              <td><span class="status-pill status-Verified">Synchronized</span></td>
            </tr>
            <tr>
              <td><strong>Enrolled Participants</strong></td>
              <td>${db.data.enrollments.length} Participants</td>
              <td>${formatPHP(db.data.enrollments.reduce((sum, e) => sum + e.investmentFee, 0))} Total Fees</td>
              <td><span class="status-pill status-Verified">Verified</span></td>
            </tr>
            <tr>
              <td><strong>Payout Releases</strong></td>
              <td>${db.data.releases.length} Requests</td>
              <td>${formatPHP(db.data.releases.reduce((sum, r) => sum + r.amount, 0))} Total Disbursed</td>
              <td><span class="status-pill status-Released">Audit Clean</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Print PDF Trigger
  container.querySelector('#btn-print-pdf').addEventListener('click', () => {
    window.print();
  });

  // Export to Excel / CSV Triggers
  container.querySelectorAll('.btn-export-csv').forEach(btn => {
    btn.addEventListener('click', () => {
      const reportType = btn.getAttribute('data-report');
      exportCSV(reportType);
    });
  });

  // Download Specific PDF Triggers
  container.querySelectorAll('.btn-export-pdf').forEach(btn => {
    btn.addEventListener('click', () => {
      const reportType = btn.getAttribute('data-report');
      exportPDF(reportType);
    });
  });
}

function exportCSV(type) {
  let csvContent = 'data:text/csv;charset=utf-8,';
  let filename = `Atsoca_Elite_${type}_Report_${new Date().toISOString().split('T')[0]}.csv`;

  if (type === 'invites') {
    csvContent += 'Invite ID,Invite Name,School/Company,Training Type,Training Date,Date Submitted,Verification Status,Enrollment Status\n';
    db.data.invites.forEach(i => {
      csvContent += `"${i.id}","${i.inviteName}","${i.schoolCompany}","${i.trainingType}","${i.trainingDate}","${i.dateSubmitted}","${i.verificationStatus}","${i.enrollmentStatus}"\n`;
    });
  } else if (type === 'enrollments') {
    csvContent += 'Enrollment ID,Participant Name,School/Company,Training Type,Referred,Referrer,Investment Fee,Payment Made,Balance,Payment Status\n';
    db.data.enrollments.forEach(e => {
      csvContent += `"${e.id}","${e.participantName}","${e.schoolCompany}","${e.trainingType}","${e.isReferred ? 'Yes' : 'No'}","${e.referrerName}",${e.investmentFee},${e.paymentMade},${e.balance},"${e.paymentStatus}"\n`;
    });
  } else if (type === 'units') {
    csvContent += 'Enrollment ID,Participant Name,Payment Made,Units Conversion Formula,Units Earned\n';
    db.data.enrollments.filter(e => e.isReferred).forEach(e => {
      csvContent += `"${e.id}","${e.participantName}",${e.paymentMade},"${e.paymentMade} / 4500",${e.unitsEarned}\n`;
    });
  } else if (type === 'fees') {
    csvContent += 'Enrollment ID,Participant Name,Payment Made,Elite Level,Percentage Rate,Referral Fee Amount\n';
    db.data.enrollments.filter(e => e.isReferred).forEach(e => {
      const calc = calculateReferralFee(e.paymentMade, 'Gold');
      csvContent += `"${e.id}","${e.participantName}",${e.paymentMade},"${calc.eliteLevel}","${calc.percentageFormatted}",${calc.referralFee}\n`;
    });
  } else if (type === 'releases') {
    csvContent += 'Request Number,Elite Member,Date Requested,Amount Requested,Disbursement Method,Status,Date Released,Notes\n';
    db.data.releases.forEach(r => {
      csvContent += `"${r.reqNumber}","${r.eliteMemberName}","${r.dateRequested}",${r.amount},"${r.disbursementMethod}","${r.processingStatus}","${r.dateReleased || 'N/A'}","${r.notes}"\n`;
    });
  }

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function exportPDF(type) {
  let title = '';
  let headers = [];
  let rows = [];
  let summaryHtml = '';

  if (type === 'invites') {
    title = 'Submitted Invites Master Log Report';
    headers = ['Invite ID', 'Invite Name', 'School / Company', 'Training Type', 'Training Date', 'Submitted Date', 'Status'];
    rows = db.data.invites.map(i => [
      i.id, i.inviteName, i.schoolCompany, i.trainingType, i.trainingDate, i.dateSubmitted, i.verificationStatus
    ]);
    summaryHtml = `<p><strong>Total Invites:</strong> ${db.data.invites.length} | <strong>Verified Count:</strong> ${db.data.invites.filter(x => x.verificationStatus === 'Verified').length}</p>`;
  } else if (type === 'enrollments') {
    title = 'Participant Enrollment & Payment Summary Report';
    headers = ['Enrollment ID', 'Participant Name', 'School / Company', 'Training Type', 'Investment Fee', 'Payment Made', 'Balance', 'Status'];
    rows = db.data.enrollments.map(e => [
      e.id, e.participantName, e.schoolCompany, e.trainingType, formatPHP(e.investmentFee), formatPHP(e.paymentMade), formatPHP(e.balance), e.paymentStatus
    ]);
    const totalCollected = db.data.enrollments.reduce((s, e) => s + e.paymentMade, 0);
    const totalBalance = db.data.enrollments.reduce((s, e) => s + e.balance, 0);
    summaryHtml = `<p><strong>Total Participants:</strong> ${db.data.enrollments.length} | <strong>Total Collected:</strong> ${formatPHP(totalCollected)} | <strong>Outstanding Balance:</strong> ${formatPHP(totalBalance)}</p>`;
  } else if (type === 'units') {
    title = 'Unit Accumulation & Conversion Statement Report';
    headers = ['Enrollment ID', 'Participant Name', 'Payment Made', 'Conversion Formula', 'Units Earned'];
    rows = db.data.enrollments.filter(e => e.isReferred).map(e => [
      e.id, e.participantName, formatPHP(e.paymentMade), `${formatPHP(e.paymentMade)} / ₱4,500`, `${e.unitsEarned} Units`
    ]);
    const totalUnits = db.data.enrollments.filter(e => e.isReferred).reduce((s, e) => s + e.unitsEarned, 0);
    summaryHtml = `<p><strong>Total Accumulated Units:</strong> ${totalUnits} Units | <strong>Current Tier Level:</strong> ${getEliteLevel(totalUnits)}</p>`;
  } else if (type === 'fees') {
    title = 'Memo 1 Atsoca Matrix Referral Fee Report';
    headers = ['Enrollment ID', 'Participant Name', 'Payment Made', 'Elite Level', 'Rate (%)', 'Referral Fee Amount'];
    rows = db.data.enrollments.filter(e => e.isReferred).map(e => {
      const calc = calculateReferralFee(e.paymentMade, 'Gold');
      return [e.id, e.participantName, formatPHP(e.paymentMade), calc.eliteLevel, calc.percentageFormatted, formatPHP(calc.referralFee)];
    });
    const totalFees = db.data.enrollments.filter(e => e.isReferred).reduce((s, e) => s + calculateReferralFee(e.paymentMade, 'Gold').referralFee, 0);
    summaryHtml = `<p><strong>Total Calculated Referral Fees:</strong> ${formatPHP(totalFees)}</p>`;
  } else if (type === 'releases') {
    title = 'Payout Release History Log Report';
    headers = ['Request No.', 'Member Name', 'Requested Date', 'Amount', 'Disbursement Method', 'Status', 'Date Released'];
    rows = db.data.releases.map(r => [
      r.reqNumber, r.eliteMemberName, r.dateRequested, formatPHP(r.amount), r.disbursementMethod, r.processingStatus, r.dateReleased || 'N/A'
    ]);
    const totalDisbursed = db.data.releases.filter(r => r.processingStatus === 'Released').reduce((s, r) => s + r.amount, 0);
    summaryHtml = `<p><strong>Total Payout Disbursed:</strong> ${formatPHP(totalDisbursed)}</p>`;
  }

  const printWin = window.open('', '_blank');
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  printWin.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title} - ATSOCA ELITE</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #0f172a; }
        .header-bar { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #002355; padding-bottom: 15px; margin-bottom: 20px; }
        .logo-title { font-size: 22px; font-weight: 900; color: #002355; letter-spacing: 0.05em; }
        .report-name { font-size: 16px; color: #0284c7; font-weight: 700; margin-top: 4px; }
        .meta-info { font-size: 12px; color: #64748b; text-align: right; }
        .summary-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 18px; margin-bottom: 20px; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
        th { background: #002355; color: #ffffff; text-align: left; padding: 10px 12px; font-weight: 700; text-transform: uppercase; font-size: 11px; }
        td { padding: 9px 12px; border-bottom: 1px solid #e2e8f0; color: #1e293b; }
        tr:nth-child(even) { background-color: #f8fafc; }
        .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 15px; display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; }
        @media print {
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="header-bar">
        <div>
          <div class="logo-title">ATSOCA ELITE DASHBOARD</div>
          <div class="report-name">${title}</div>
        </div>
        <div class="meta-info">
          <div><strong>Generated Date:</strong> ${dateStr}</div>
          <div><strong>System Memo:</strong> Memo 1 Matrix 2026</div>
          <div><strong>Audit Copy:</strong> Official System Log</div>
        </div>
      </div>

      <div class="summary-box">
        ${summaryHtml}
      </div>

      <table>
        <thead>
          <tr>
            ${headers.map(h => `<th>${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows.map(r => `<tr>${r.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table>

      <div class="footer">
        <div>ATSOCA Elite Real-Time System Portal © 2026</div>
        <div>Confidential & Proprietary Matrix Audit Report</div>
      </div>

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `);
  printWin.document.close();
}

