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
      <div class="card-header" style="flex-wrap: wrap; gap: 12px; justify-content: space-between; align-items: center;">
        <div class="card-title" style="color: #002355; font-weight: 800;">Referral Payment Ledger</div>
        <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
          <input type="text" id="search-enrollment" class="form-control" placeholder="Search by participant, school..." style="width: 220px; padding: 6px 12px; font-size: 0.85rem;">
          <select id="filter-enroll-status" class="form-control" style="width: 180px; padding: 6px 12px; font-size: 0.85rem;">
            <option value="ALL">All Enrollment Status</option>
            <option value="Enrolled">Enrolled</option>
            <option value="Pending">Pending</option>
            <option value="Not Enrolled">Not Enrolled</option>
          </select>
        </div>
      </div>

      <div class="table-responsive">
        <table class="custom-table" id="table-referral-enrollments">
          <thead>
            <tr>
              <th style="color: #002355; font-weight: 800;">Respondent ID</th>
              <th style="color: #002355; font-weight: 800;">Participant Name</th>
              <th style="color: #002355; font-weight: 800;">Duplicate Checker</th>
              <th style="color: #002355; font-weight: 800;">Enrollment Status</th>
              <th style="color: #002355; font-weight: 800;">School / Company</th>
              <th style="color: #002355; font-weight: 800;">Course</th>
              <th style="color: #002355; font-weight: 800;">Fee</th>
              <th style="color: #002355; font-weight: 800;">Paid</th>
              <th style="color: #002355; font-weight: 800;">Balance</th>
              <th style="color: #002355; font-weight: 800;">Payment Status</th>
              ${isFinanceOrAdmin ? '<th style="color: #002355; font-weight: 800;">Actions</th>' : ''}
            </tr>
          </thead>
          <tbody>
            ${enrollments.map(enr => `
              <tr>
                <td><code style="color: #002355; font-weight: 700;">${enr.respondentId || enr.id.replace('ENR-', '')}</code></td>
                <td><strong style="color: #002355;">${enr.participantName}</strong></td>
                <td><span style="font-weight: 600; color: #002355;">${enr.duplicateChecker || 'N/A'}</span></td>
                <td>
                  <span class="status-pill" style="background: #dbeafe; color: #002355; font-weight: 700; font-size: 0.75rem; padding: 4px 10px; border-radius: 12px; border: 1px solid #cbd5e1; display: inline-block;">
                    ${enr.enrollmentStatus || 'Enrolled'}
                  </span>
                </td>
                <td><span style="color: #002355;">${enr.schoolCompany}</span></td>
                <td><span style="font-size: 0.8rem; font-weight: 700; color: #002355;">${enr.course || enr.trainingType}</span></td>
                <td><strong style="color: #002355;">${formatPHP(enr.investmentFee)}</strong></td>
                <td><span style="color: #002355; font-weight: 700;">${formatPHP(enr.paymentMade)}</span></td>
                <td><span style="color: #002355; font-weight: 700;">${formatPHP(enr.balance)}</span></td>
                <td>
                  <span class="status-pill" style="background: #f1f5f9; color: #002355; font-weight: 700; font-size: 0.75rem; padding: 4px 10px; border-radius: 12px; border: 1px solid #cbd5e1; display: inline-block;">
                    ${enr.paymentStatus}
                  </span>
                </td>
                ${isFinanceOrAdmin ? `
                  <td>
                    <button class="btn btn-secondary btn-sm btn-update-pay" data-id="${enr.id}" style="background: #002355; color: #ffffff; border: none; font-weight: 700;">
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

  // Search & Filter event listeners
  const searchInput = container.querySelector('#search-enrollment');
  const enrollFilter = container.querySelector('#filter-enroll-status');

  const filterLedger = () => {
    const query = searchInput ? searchInput.value.toLowerCase() : '';
    const statusVal = enrollFilter ? enrollFilter.value : 'ALL';
    const rows = container.querySelectorAll('#table-referral-enrollments tbody tr');

    rows.forEach(tr => {
      const text = tr.innerText.toLowerCase();
      const matchQuery = text.includes(query);
      const matchStatus = statusVal === 'ALL' || tr.innerText.includes(statusVal);
      tr.style.display = (matchQuery && matchStatus) ? '' : 'none';
    });
  };

  if (searchInput) searchInput.addEventListener('input', filterLedger);
  if (enrollFilter) enrollFilter.addEventListener('change', filterLedger);

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
