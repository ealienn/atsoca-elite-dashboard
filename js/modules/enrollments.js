/**
 * Enrollment & Payment Tracking Module Component
 */
import { db } from '../dbState.js';
import { formatPHP } from '../matrixEngine.js';

export function renderEnrollments(container) {
  if (!container) return;
  const isFinanceOrAdmin = (db && (db.activeRole === 'Finance' || db.activeRole === 'Administrator'));
  const member = (db && typeof db.getCurrentMember === 'function' ? db.getCurrentMember() : null) || { id: 'ELITE-101', name: 'Ellaine Joyce' };
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
    <div class="card" style="margin-bottom: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div>
          <h2>Enrollment & Payment Tracking</h2>
        </div>
      </div>
    </div>

    <!-- Summary Metrics -->
    <div class="grid-3">
      <div class="card stat-card">
        <div class="stat-info">
          <span>Total Referral Investment Fees</span>
          <div class="stat-value">${formatPHP(totalFee)}</div>
          <div class="stat-sub">Sum of Gross Fees</div>
        </div>
        <div class="stat-icon"><i class="fas fa-coins"></i></div>
      </div>

      <div class="card stat-card emerald">
        <div class="stat-info">
          <span>Payments Collected</span>
          <div class="stat-value">${formatPHP(totalPaid)}</div>
          <div class="stat-sub"><i class="fas fa-check-circle"></i> Basis for Units & Referral %</div>
        </div>
        <div class="stat-icon"><i class="fas fa-wallet"></i></div>
      </div>

      <div class="card stat-card rose">
        <div class="stat-info">
          <span>Outstanding Balance</span>
          <div class="stat-value">${formatPHP(totalBal)}</div>
          <div class="stat-sub">Pending Student Collections</div>
        </div>
        <div class="stat-icon"><i class="fas fa-exclamation-triangle"></i></div>
      </div>
    </div>

    <!-- Enrollment & Payment Tracking Table -->
    <div class="card">
      <div class="card-header">
        <div class="card-title"><i class="fas fa-receipt"></i> Referral Payment Ledger</div>
      </div>

      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Enrollment ID</th>
              <th>Participant Name</th>
              <th>School / Company</th>
              <th>Training Date</th>
              ${isFinanceOrAdmin ? '<th>Referrer</th>' : ''}
              <th>Investment Fee</th>
              <th>Payment Made</th>
              <th>Outstanding Balance</th>
              <th>Units Credit</th>
              <th>Payment Status</th>
              ${isFinanceOrAdmin ? '<th>Finance Action</th>' : ''}
            </tr>
          </thead>
          <tbody>
            ${enrollments.map(enr => `
              <tr>
                <td><code>${enr.id}</code></td>
                <td><strong>${enr.participantName}</strong></td>
                <td>${enr.schoolCompany}</td>
                <td>${enr.trainingDate}</td>
                ${isFinanceOrAdmin ? `<td>${enr.referrerName}</td>` : ''}
                <td><strong>${formatPHP(enr.investmentFee)}</strong></td>
                <td><span style="color: var(--accent-emerald); font-weight: 700;">${formatPHP(enr.paymentMade)}</span></td>
                <td><span style="color: ${enr.balance > 0 ? 'var(--accent-rose)' : 'var(--text-muted)'}; font-weight: 600;">${formatPHP(enr.balance)}</span></td>
                <td><span class="unit-badge"><i class="fas fa-star"></i> +${enr.unitsEarned} Units</span></td>
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
