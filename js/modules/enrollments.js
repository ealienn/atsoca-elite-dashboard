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

  const fin = (db && typeof db.getMemberFinancials === 'function') ? db.getMemberFinancials(member.id) : null;
  const rawPaid = enrollments.reduce((sum, e) => sum + (Number(e ? e.paymentMade : 0) || 0), 0);
  const totalPaid = (db && db.activeRole === 'Elite Member' && fin) ? fin.paymentsCollected : (rawPaid > 0 ? rawPaid : (fin ? fin.paymentsCollected : 0));
  const rawFee = enrollments.reduce((sum, e) => sum + (Number(e ? e.investmentFee : 0) || 0), 0);
  const totalFee = rawFee > 0 ? rawFee : totalPaid;
  const totalBal = Math.max(0, totalFee - totalPaid);

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
          <select id="filter-payment-status" class="form-control" style="width: 180px; padding: 6px 12px; font-size: 0.85rem;">
            <option value="ALL">Status</option>
            <option value="Fully Paid">Fully Paid</option>
            <option value="Partial">Partial</option>
            <option value="Unpaid">Unpaid</option>
          </select>
        </div>
      </div>

      <div class="table-responsive">
        <table class="custom-table" id="table-referral-enrollments">
          <thead>
            <tr>
              <th style="color: #002355; font-weight: 800;">Submission ID</th>
              <th style="color: #002355; font-weight: 800;">Participant Name</th>
              <th style="color: #002355; font-weight: 800;">Duplicate Checker</th>
              <th style="color: #002355; font-weight: 800;">Enrollment Status</th>
              <th style="color: #002355; font-weight: 800;">School / Company</th>
              <th style="color: #002355; font-weight: 800;">Course</th>
              <th style="color: #002355; font-weight: 800;">Fee</th>
              <th style="color: #002355; font-weight: 800;">Paid</th>
              <th style="color: #002355; font-weight: 800;">Balance</th>
              <th style="color: #002355; font-weight: 800;">Units Earned</th>
              <th style="color: #002355; font-weight: 800;">Payment Status</th>
              ${isFinanceOrAdmin ? '<th style="color: #002355; font-weight: 800;">Actions</th>' : ''}
            </tr>
          </thead>
          <tbody>
            ${enrollments.map(enr => {
              const enrollStatus = enr.enrollmentStatus || 'Enrolled';
              const isEnrolled = String(enrollStatus).trim().toLowerCase() === 'enrolled';
              const unitsDisplay = isEnrolled ? `${Number(enr.unitsEarned !== undefined ? enr.unitsEarned : (enr.paymentMade / 4500)).toFixed(2)} Units` : '0.00 Units';

              return `
                <tr>
                  <td><code>${enr.respondentId || enr.id.replace('ENR-', '')}</code></td>
                  <td><strong>${enr.participantName}</strong></td>
                  <td><span style="font-weight: 600;">${enr.duplicateChecker || 'N/A'}</span></td>
                  <td>
                    <span class="status-pill status-${(enrollStatus || '').replace(/\s+/g, '')}">
                      ${enrollStatus}
                    </span>
                  </td>
                  <td>${enr.schoolCompany}</td>
                  <td><span style="font-size: 0.8rem; font-weight: 700;">${enr.course || enr.trainingType}</span></td>
                  <td><strong>${formatPHP(enr.investmentFee)}</strong></td>
                  <td><span style="font-weight: 700;">${formatPHP(enr.paymentMade)}</span></td>
                  <td><span style="font-weight: 700;">${formatPHP(enr.balance)}</span></td>
                  <td><span style="font-weight: 700;">${unitsDisplay}</span></td>
                  <td>
                    <span class="status-pill status-${(enr.paymentStatus || '').replace(/\s+/g, '')}">
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
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Search & Filter event listeners
  const searchInput = container.querySelector('#search-enrollment');
  const payFilter = container.querySelector('#filter-payment-status');

  const filterLedger = () => {
    const query = searchInput ? searchInput.value.toLowerCase() : '';
    const statusVal = payFilter ? payFilter.value : 'ALL';
    const rows = container.querySelectorAll('#table-referral-enrollments tbody tr');

    rows.forEach(tr => {
      const text = tr.innerText.toLowerCase();
      const matchQuery = text.includes(query);
      const matchStatus = statusVal === 'ALL' || tr.innerText.includes(statusVal);
      tr.style.display = (matchQuery && matchStatus) ? '' : 'none';
    });
  };

  if (searchInput) searchInput.addEventListener('input', filterLedger);
  if (payFilter) payFilter.addEventListener('change', filterLedger);

  if (isFinanceOrAdmin) {
    container.querySelectorAll('.btn-update-pay').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openEditPaymentModal(id, () => renderEnrollments(container));
      });
    });
  }
}

export function openEditPaymentModal(enrollmentId, onSaveSuccess) {
  let enr = (db.data.enrollments || []).find(e => 
    String(e.id) === String(enrollmentId) || 
    String(e.respondentId) === String(enrollmentId) ||
    (e.id && String(e.id).includes(String(enrollmentId))) ||
    (enrollmentId && String(enrollmentId).includes(String(e.id)))
  );

  if (!enr) {
    const inv = (db.data.invites || []).find(i => 
      String(i.id) === String(enrollmentId) || 
      String(i.respondentId) === String(enrollmentId)
    );
    if (inv) {
      enr = {
        id: inv.id,
        respondentId: inv.respondentId || inv.id,
        participantName: inv.participantName || inv.inviteName,
        schoolCompany: inv.schoolCompany || 'N/A',
        course: inv.trainingType || 'COSH SO2',
        investmentFee: inv.investmentFee || 4500,
        paymentMade: inv.paymentMade || 0,
        balance: inv.balance || 4500,
        paymentStatus: inv.paymentStatus || 'Unpaid'
      };
    }
  }

  if (!enr) {
    console.warn('Enrollment record not found for ID:', enrollmentId);
    return;
  }

  const modal = document.querySelector('#modal-edit-payment-dialog');
  if (!modal) return;

  const pName = modal.querySelector('#pay-modal-participant');
  const pProg = modal.querySelector('#pay-modal-program');
  const pFee = modal.querySelector('#pay-modal-fee');
  const pCalcBal = modal.querySelector('#pay-modal-calc-bal');
  const inputAmt = modal.querySelector('#pay-modal-input-amount');

  const btnFull = modal.querySelector('#pay-modal-btn-full');
  const btnZero = modal.querySelector('#pay-modal-btn-zero');
  const btnClose = modal.querySelector('#close-modal-edit-pay');
  const btnCancel = modal.querySelector('#pay-modal-cancel-btn');
  const btnSave = modal.querySelector('#pay-modal-save-btn');

  const feeVal = Number(enr.investmentFee || 0);
  const currentPaid = Number(enr.paymentMade || 0);

  if (pName) pName.textContent = enr.participantName;
  if (pProg) pProg.textContent = `${enr.schoolCompany || ''} • ${enr.course || enr.trainingType || ''}`;
  if (pFee) pFee.textContent = formatPHP(feeVal);
  if (inputAmt) inputAmt.value = currentPaid;

  const updateCalculatedBalance = () => {
    const val = parseFloat(inputAmt ? inputAmt.value : 0) || 0;
    const remBal = Math.max(0, feeVal - val);
    if (pCalcBal) {
      pCalcBal.textContent = formatPHP(remBal);
      pCalcBal.style.color = remBal > 0 ? '#e11d48' : '#059669';
    }
  };

  updateCalculatedBalance();

  if (inputAmt) {
    inputAmt.oninput = updateCalculatedBalance;
  }

  if (btnFull) {
    btnFull.onclick = () => {
      if (inputAmt) {
        inputAmt.value = feeVal;
        updateCalculatedBalance();
      }
    };
  }

  if (btnZero) {
    btnZero.onclick = () => {
      if (inputAmt) {
        inputAmt.value = 0;
        updateCalculatedBalance();
      }
    };
  }

  const closeModal = () => {
    modal.classList.remove('active');
  };

  if (btnClose) btnClose.onclick = closeModal;
  if (btnCancel) btnCancel.onclick = closeModal;

  if (btnSave) {
    btnSave.onclick = () => {
      const newAmt = parseFloat(inputAmt ? inputAmt.value : 0);
      if (isNaN(newAmt) || newAmt < 0) {
        alert('Please enter a valid payment amount.');
        return;
      }

      db.updateEnrollmentPayment(enrollmentId, newAmt);
      closeModal();
      if (typeof onSaveSuccess === 'function') {
        onSaveSuccess();
      }
    };
  }

  modal.classList.add('active');
}
