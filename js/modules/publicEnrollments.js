/**
 * Public Enrollment Monitoring Module Component
 * (Accessible to Finance & Administrator accounts)
 */
import { db } from '../dbState.js';
import { formatPHP } from '../matrixEngine.js';
import { openEditPaymentModal } from './enrollments.js';

export function renderPublicEnrollments(container) {
  const isAuthorized = db.activeRole === 'Finance' || db.activeRole === 'Administrator';

  if (!isAuthorized) {
    container.innerHTML = `
      <div class="card" style="text-align: center; padding: 48px 24px;">
        <i class="fas fa-lock" style="font-size: 3rem; color: var(--accent-rose); margin-bottom: 16px;"></i>
        <h2>Restricted Module Access</h2>
        <p style="color: var(--text-secondary); max-width: 500px; margin: 12px auto;">
          The Public Enrollment Monitoring module is restricted strictly to <strong>Finance</strong> and <strong>Administrator</strong> accounts to maintain payment verification privacy.
        </p>
        <p style="font-size: 0.85rem; color: var(--accent-cyan); margin-top: 8px;">
          To access this module, switch your active role to <strong>Finance</strong> or <strong>Administrator</strong> using the role selector in the top-right header bar.
        </p>
      </div>
    `;
    return;
  }

  const allEnrollments = db.data.enrollments;
  const totalEnrolled = allEnrollments.length;
  const referredCount = allEnrollments.filter(e => e.isReferred).length;
  const nonReferredCount = allEnrollments.filter(e => !e.isReferred).length;

  const totalCollected = allEnrollments.reduce((sum, e) => sum + e.paymentMade, 0);
  const totalOutstanding = allEnrollments.reduce((sum, e) => sum + e.balance, 0);

  container.innerHTML = `
    <div class="welcome-banner-card">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; width: 100%;">
        <div>
          <h2>Public Enrollment Monitoring</h2>
        </div>
        <button class="btn btn-primary" id="btn-add-public-enr"><i class="fas fa-user-plus"></i> Add Public Participant</button>
      </div>
    </div>

    <div class="grid-3">
      <div class="card stat-card" style="text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 22px 18px;">
        <div class="stat-info" style="text-align: center;">
          <span style="font-size: 0.72rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Total Participants Enrolled</span>
          <div class="stat-value" style="font-size: 2.2rem; font-weight: 900; margin-top: 6px;">${totalEnrolled}</div>
        </div>
      </div>

      <div class="card stat-card emerald" style="text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 22px 18px;">
        <div class="stat-info" style="text-align: center;">
          <span style="font-size: 0.72rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Total Payments Collected</span>
          <div class="stat-value" style="font-size: 2.2rem; font-weight: 900; margin-top: 6px; color: #10b981;">${formatPHP(totalCollected)}</div>
        </div>
      </div>

      <div class="card stat-card rose" style="text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 22px 18px;">
        <div class="stat-info" style="text-align: center;">
          <span style="font-size: 0.72rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Outstanding Balances</span>
          <div class="stat-value" style="font-size: 2.2rem; font-weight: 900; margin-top: 6px; color: #f43f5e;">${formatPHP(totalOutstanding)}</div>
        </div>
      </div>
    </div>

    <!-- Filter & Master Table -->
    <div class="card">
      <div class="card-header" style="flex-wrap: wrap; gap: 12px;">
        <div class="card-title">All Enrolled Participants Registry</div>
        <div style="display: flex; gap: 12px; align-items: center;">
          <input type="text" id="search-public-enr" class="form-control" placeholder="Search participant or school..." style="width: 240px; padding: 6px 12px;">
          <select id="filter-enroll-status" class="form-control" style="width: 180px; padding: 6px 12px;">
            <option value="ALL">Status</option>
            <option value="Enrolled">Enrolled</option>
            <option value="Pending">Pending</option>
            <option value="Not Enrolled">Not Enrolled</option>
          </select>
        </div>
      </div>

      <div class="table-responsive">
        <table class="custom-table" id="table-public-enrollments">
          <thead>
            <tr>
              <th>SUBMISSION ID</th>
              <th>Participant Name</th>
              <th>Duplicate Checker</th>
              <th>Enrollment Status</th>
              <th>School / Company</th>
              <th>Training Program</th>
              <th>Referrer</th>
              <th>Training Fee</th>
              <th>Amount Paid</th>
              <th>Balance</th>
              <th>Payment Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${allEnrollments.map(enr => `
              <tr>
                <td><code>${enr.id}</code></td>
                <td><strong>${enr.participantName}</strong></td>
                <td><span style="font-weight: 600; color: var(--text-primary);">${enr.duplicateChecker || 'N/A'}</span></td>
                <td>
                  <span class="status-pill status-${(enr.enrollmentStatus || 'Enrolled').replace(/\s+/g, '')}">
                    ${enr.enrollmentStatus || 'Enrolled'}
                  </span>
                </td>
                <td>${enr.schoolCompany}</td>
                <td><small>${enr.trainingType}</small></td>
                <td>${enr.referrerName}</td>
                <td><strong>${formatPHP(enr.investmentFee)}</strong></td>
                <td><span style="color: var(--accent-emerald); font-weight: 700;">${formatPHP(enr.paymentMade)}</span></td>
                <td><span style="color: ${enr.balance > 0 ? 'var(--accent-rose)' : 'var(--text-muted)'}; font-weight: 600;">${formatPHP(enr.balance)}</span></td>
                <td><span class="status-pill status-${enr.paymentStatus.replace(/\s+/g, '')}">${enr.paymentStatus}</span></td>
                <td>
                  <button class="btn btn-secondary btn-sm btn-edit-payment" data-id="${enr.id}">
                    <i class="fas fa-edit"></i> Update
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal: Add Public Participant -->
    <div class="modal-overlay" id="modal-add-public">
      <div class="modal-content">
        <div class="modal-header">
          <h3><i class="fas fa-user-plus" style="color: var(--accent-cyan);"></i> Add Public Participant (Finance Record)</h3>
          <button class="modal-close" id="close-modal-public">&times;</button>
        </div>
        <form id="form-add-public">
          <div class="form-group">
            <label>Participant Full Name</label>
            <input type="text" class="form-control" id="pub-name" required placeholder="e.g. Dr. Alejandro Cruz">
          </div>
          <div class="form-group">
            <label>School / Institution / Company</label>
            <input type="text" class="form-control" id="pub-school" required placeholder="e.g. Mapúa University">
          </div>
          <div class="form-group">
            <label>Training Course / Program</label>
            <select class="form-control" id="pub-course" required>
              <option value="COSH SO2">COSH SO2</option>
              <option value="BOSH SO2">BOSH SO2</option>
            </select>
          </div>
          <div class="form-group">
            <label>Training Date</label>
            <input type="date" class="form-control" id="pub-date" required value="2026-08-20">
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="form-group">
              <label>Training Fee (₱)</label>
              <input type="number" class="form-control" id="pub-fee" required value="4500" min="0">
            </div>
            <div class="form-group">
              <label>Initial Amount Paid (₱)</label>
              <input type="number" class="form-control" id="pub-payment" required value="4500" min="0">
            </div>
          </div>
          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
            <button type="button" class="btn btn-secondary" id="cancel-add-public">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Enrollment Record</button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Filter functionality
  const searchInput = container.querySelector('#search-public-enr');
  const statusFilter = container.querySelector('#filter-enroll-status');

  const filterRows = () => {
    const query = searchInput.value.toLowerCase();
    const statusVal = statusFilter.value;
    const rows = container.querySelectorAll('#table-public-enrollments tbody tr');

    rows.forEach(tr => {
      const text = tr.innerText.toLowerCase();
      const matchQuery = text.includes(query);
      let matchStatus = statusVal === 'ALL';
      if (!matchStatus) {
        const enrollCell = tr.children[3];
        const cellText = enrollCell ? enrollCell.innerText.trim() : tr.innerText;
        if (statusVal === 'Enrolled') {
          matchStatus = cellText === 'Enrolled';
        } else {
          matchStatus = cellText.includes(statusVal);
        }
      }
      tr.style.display = (matchQuery && matchStatus) ? '' : 'none';
    });
  };

  searchInput.addEventListener('input', filterRows);
  statusFilter.addEventListener('change', filterRows);

  // Add public modal triggers
  const btnAdd = container.querySelector('#btn-add-public-enr');
  const modalAdd = container.querySelector('#modal-add-public');
  const closeAdd = container.querySelector('#close-modal-public');
  const cancelAdd = container.querySelector('#cancel-add-public');
  const formAdd = container.querySelector('#form-add-public');

  if (btnAdd && modalAdd) {
    btnAdd.addEventListener('click', () => {
      window.activeModalState = window.activeModalState || {};
      window.activeModalState.activeModalIds = window.activeModalState.activeModalIds || new Set();
      window.activeModalState.activeModalIds.add('modal-add-public');
      modalAdd.classList.add('active');
    });
  }

  if (closeAdd && modalAdd) {
    closeAdd.addEventListener('click', () => {
      if (window.activeModalState && window.activeModalState.activeModalIds) {
        window.activeModalState.activeModalIds.delete('modal-add-public');
      }
      modalAdd.classList.remove('active');
    });
  }

  if (formAdd && modalAdd) {
    formAdd.addEventListener('submit', (e) => {
      e.preventDefault();
      db.addPublicEnrollment({
        participantName: container.querySelector('#pub-name').value,
        schoolCompany: container.querySelector('#pub-school').value,
        trainingType: container.querySelector('#pub-course').value,
        trainingDate: container.querySelector('#pub-date').value,
        investmentFee: container.querySelector('#pub-fee').value,
        paymentMade: container.querySelector('#pub-payment').value
      });
      formAdd.reset();
      alert('Public Enrollment added successfully!');
      renderPublicEnrollments(container);
    });
  }

  // Edit payment triggers
  container.querySelectorAll('.btn-edit-payment').forEach(btn => {
    btn.addEventListener('click', () => {
      const enrId = btn.getAttribute('data-id');
      openEditPaymentModal(enrId, () => renderPublicEnrollments(container));
    });
  });
}
