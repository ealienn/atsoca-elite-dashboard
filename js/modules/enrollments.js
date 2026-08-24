/**
 * Enrollment & Payment Tracking Module Component
 */
import { db } from '../dbState.js';
import { formatPHP } from '../matrixEngine.js';

export function renderEnrollments(container) {
  if (!container) return;
  const isFinanceOrAdmin = (db && (db.activeRole === 'Finance' || db.activeRole === 'Administrator'));
  const member = (db && typeof db.getCurrentMember === 'function' ? db.getCurrentMember() : null) || { id: '004', name: 'Joshua Villafuerte' };
  const allEnrollments = (db && db.data && Array.isArray(db.data.enrollments)) ? db.data.enrollments : [];

  const enrollments = allEnrollments.filter(e => {
    if (!e) return false;
    if (db && db.activeRole === 'Elite Member') {
      return e.referrerId === member.id || (e.referrerName && member.name && e.referrerName.toLowerCase() === member.name.toLowerCase());
    }
    return e.isReferred;
  });

  const totalFee = enrollments.reduce((sum, e) => sum + (Number(e ? e.investmentFee : 0) || 0), 0);
  const totalPaid = enrollments.reduce((sum, e) => sum + (Number(e ? e.paymentMade : 0) || 0), 0);
  const totalBal = enrollments.reduce((sum, e) => sum + (Number(e ? e.balance : 0) || 0), 0);

  container.innerHTML = `
    <div class="welcome-banner-card">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; width: 100%;">
        <div>
          <h2>Enrollment & Payment Tracking</h2>
        </div>
      </div>
    </div>

    <!-- Summary Metrics -->
    <div class="grid-3">
      <div class="card stat-card" style="text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 22px 18px;">
        <div class="stat-info" style="text-align: center;">
          <span style="font-size: 0.72rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Total Referral Investment Fees</span>
          <div class="stat-value" style="font-size: 2.2rem; font-weight: 900; margin-top: 6px;">${formatPHP(totalFee)}</div>
        </div>
      </div>

      <div class="card stat-card emerald" style="text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 22px 18px;">
        <div class="stat-info" style="text-align: center;">
          <span style="font-size: 0.72rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Payments Collected</span>
          <div class="stat-value" style="font-size: 2.2rem; font-weight: 900; margin-top: 6px; color: #10b981;">${formatPHP(totalPaid)}</div>
        </div>
      </div>

      <div class="card stat-card rose" style="text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 22px 18px;">
        <div class="stat-info" style="text-align: center;">
          <span style="font-size: 0.72rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Outstanding Balance</span>
          <div class="stat-value" style="font-size: 2.2rem; font-weight: 900; margin-top: 6px; color: #f43f5e;">${formatPHP(totalBal)}</div>
        </div>
      </div>
    </div>

    <!-- Enrollment & Payment Tracking Table -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">Referral Payment Ledger</div>
      </div>

      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Respondent ID</th>
              <th>Participant Name</th>
              <th>School / Company</th>
              <th>Course</th>
              <th>Fee</th>
              <th>Paid</th>
              <th>Balance</th>
              <th>Enrollment Status</th>
              <th>Payment Status</th>
              ${isFinanceOrAdmin ? '<th>Actions</th>' : ''}
            </tr>
          </thead>
          <tbody>
            ${enrollments.map(enr => `
              <tr>
                <td><code>${enr.respondentId || enr.id.replace('ENR-', '')}</code></td>
                <td><strong>${enr.participantName}</strong></td>
                <td>${enr.schoolCompany}</td>
                <td><span style="font-size: 0.8rem; font-weight: 700;">${enr.course || enr.trainingType}</span></td>
                <td><strong>${formatPHP(enr.investmentFee)}</strong></td>
                <td><span style="color: var(--accent-emerald); font-weight: 700;">${formatPHP(enr.paymentMade)}</span></td>
                <td><span style="color: ${enr.balance > 0 ? 'var(--accent-rose)' : 'var(--text-muted)'}; font-weight: 600;">${formatPHP(enr.balance)}</span></td>
                <td><span class="status-pill status-${(enr.enrollmentStatus || 'Enrolled').replace(/\s+/g, '')}">${enr.enrollmentStatus || 'Enrolled'}</span></td>
                <td><span class="status-pill status-${enr.paymentStatus.replace(/\s+/g, '')}">${enr.paymentStatus}</span></td>
                ${isFinanceOrAdmin ? `
                  <td>
                    <button class="btn btn-secondary btn-sm btn-update-pay" data-id="${enr.id}">
                      <i class="fas fa-edit"></i> Edit Payment
                    </button>
                  </td>
                ` : ''}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  if (isFinanceOrAdmin) {
    container.querySelectorAll('.btn-update-pay').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const enr = db.data.enrollments.find(e => e.id === id);
        if (!enr) return;

        const newAmount = prompt(`Enter updated Payment Amount Made for ${enr.participantName} (Total Investment Fee: ₱${enr.investmentFee}):`, enr.paymentMade);
        if (newAmount !== null && !isNaN(newAmount)) {
          db.updateEnrollmentPayment(id, newAmount);
          renderEnrollments(container);
        }
      });
    });
  }
}
