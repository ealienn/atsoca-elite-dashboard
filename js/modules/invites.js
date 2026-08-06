/**
 * Invite Monitoring Module Component
 */
import { db } from '../dbState.js';

export function renderInvites(container) {
  if (!container) return;
  const member = (db && typeof db.getCurrentMember === 'function' ? db.getCurrentMember() : null) || { id: 'ELITE-101', name: 'Ellaine Joyce' };
  const allInvites = (db && db.data && Array.isArray(db.data.invites)) ? db.data.invites : [];

  const invites = allInvites.filter(i => {
    if (!i) return false;
    if (db && db.activeRole === 'Elite Member') {
      return i.referrerId === member.id || (i.referrerName && member.name && i.referrerName.toLowerCase() === member.name.toLowerCase());
    }
    return true;
  });

  container.innerHTML = `
    <div class="card" style="margin-bottom: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div>
          <h2>Invite Monitoring</h2>
        </div>
        <button class="btn btn-primary" id="open-add-invite"><i class="fas fa-plus-circle"></i> Submit New Invite</button>
      </div>
    </div>

    <!-- Invites Table Card -->
    <div class="card">
      <div class="card-header" style="flex-wrap: wrap; gap: 12px;">
        <div class="card-title">Submitted Invites Log</div>
        <div style="display: flex; gap: 12px; align-items: center;">
          <input type="text" id="search-invite" class="form-control" placeholder="Search by name, school..." style="width: 220px; padding: 6px 12px;">
          <select id="filter-verify-status" class="form-control" style="width: 170px; padding: 6px 12px;">
            <option value="ALL">All Verifications</option>
            <option value="Verified">Verified</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div class="table-responsive">
        <table class="custom-table" id="table-invites">
          <thead>
            <tr>
              <th>Invite ID</th>
              <th>Invite Name</th>
              <th>School / Company</th>
              <th>Training Type</th>
              <th>Training Date</th>
              <th>Date Submitted</th>
              ${isManagerOrAdmin ? '<th>Submitted By</th>' : ''}
              <th>Verification Status</th>
              <th>Enrollment Status</th>
              ${isManagerOrAdmin ? '<th>Validation Actions</th>' : ''}
            </tr>
          </thead>
          <tbody>
            ${invites.map(inv => `
              <tr>
                <td><code>${inv.id}</code></td>
                <td><strong>${inv.inviteName}</strong></td>
                <td>${inv.schoolCompany}</td>
                <td><small>${inv.trainingType}</small></td>
                <td>${inv.trainingDate}</td>
                <td>${inv.dateSubmitted}</td>
                ${isManagerOrAdmin ? `<td>${inv.referrerName}</td>` : ''}
                <td><span class="status-pill status-${inv.verificationStatus}">${inv.verificationStatus}</span></td>
                <td><span class="status-pill status-${inv.enrollmentStatus.replace(/\s+/g, '')}">${inv.enrollmentStatus}</span></td>
                ${isManagerOrAdmin ? `
                  <td>
                    ${inv.verificationStatus === 'Pending' ? `
                      <button class="btn btn-emerald btn-sm btn-verify" data-id="${inv.id}"><i class="fas fa-check"></i> Verify</button>
                      <button class="btn btn-secondary btn-sm btn-reject" data-id="${inv.id}" style="color: var(--accent-rose);"><i class="fas fa-times"></i></button>
                    ` : `
                      <span style="font-size: 0.78rem; color: var(--text-muted);"><i class="fas fa-lock"></i> Verified</span>
                    `}
                  </td>
                ` : ''}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal: Add Invite -->
    <div class="modal-overlay" id="modal-add-invite">
      <div class="modal-content">
        <div class="modal-header">
          <h3><i class="fas fa-user-plus" style="color: var(--accent-blue);"></i> Submit New Elite Invite</h3>
          <button class="modal-close" id="close-modal-invite">&times;</button>
        </div>
        <form id="form-add-invite">
          <div class="form-group">
            <label>Invite Full Name</label>
            <input type="text" class="form-control" id="inv-name" required placeholder="e.g. Engr. Gabriel Santos">
          </div>
          <div class="form-group">
            <label>School / Company / Institution</label>
            <input type="text" class="form-control" id="inv-school" required placeholder="e.g. Ayala Land Corp / UST">
          </div>
          <div class="form-group">
            <label>Training Type / Course</label>
            <select class="form-control" id="inv-type" required>
              <option value="COSH SO2">COSH SO2</option>
              <option value="BOSH SO2">BOSH SO2</option>
            </select>
          </div>
          <div class="form-group">
            <label>Expected Training Date</label>
            <input type="date" class="form-control" id="inv-date" required value="2026-08-28">
          </div>
          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
            <button type="button" class="btn btn-secondary" id="cancel-add-invite">Cancel</button>
            <button type="submit" class="btn btn-primary">Submit Invite</button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Filter triggers
  const searchInput = container.querySelector('#search-invite');
  const verifyFilter = container.querySelector('#filter-verify-status');

  const filterInvites = () => {
    const query = searchInput.value.toLowerCase();
    const statusVal = verifyFilter.value;
    const rows = container.querySelectorAll('#table-invites tbody tr');

    rows.forEach(tr => {
      const text = tr.innerText.toLowerCase();
      const matchQuery = text.includes(query);
      const matchStatus = statusVal === 'ALL' || tr.innerText.includes(statusVal);
      tr.style.display = (matchQuery && matchStatus) ? '' : 'none';
    });
  };

  searchInput.addEventListener('input', filterInvites);
  verifyFilter.addEventListener('change', filterInvites);

  // Modal triggers
  const btnOpen = container.querySelector('#open-add-invite');
  const modal = container.querySelector('#modal-add-invite');
  const btnClose = container.querySelector('#close-modal-invite');
  const btnCancel = container.querySelector('#cancel-add-invite');
  const form = container.querySelector('#form-add-invite');

  btnOpen.addEventListener('click', () => modal.classList.add('active'));
  [btnClose, btnCancel].forEach(b => b.addEventListener('click', () => modal.classList.remove('active')));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    db.addInvite({
      inviteName: container.querySelector('#inv-name').value,
      schoolCompany: container.querySelector('#inv-school').value,
      trainingType: container.querySelector('#inv-type').value,
      trainingDate: container.querySelector('#inv-date').value
    });
    modal.classList.remove('active');
    renderInvites(container);
  });

  // Manager action triggers
  if (isManagerOrAdmin) {
    container.querySelectorAll('.btn-verify').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        db.verifyInvite(id, 'Verified');
        renderInvites(container);
      });
    });

    container.querySelectorAll('.btn-reject').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        db.verifyInvite(id, 'Rejected');
        renderInvites(container);
      });
    });
  }
}
