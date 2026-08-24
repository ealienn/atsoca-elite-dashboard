/**
 * Referral Fee Release Workflow Module Component
 */
import { db } from '../dbState.js';
import { formatPHP } from '../matrixEngine.js';

export function renderReleases(container) {
  if (!container) return;
  const isFinanceOrAdmin = (db && (db.activeRole === 'Finance' || db.activeRole === 'Administrator'));
  const member = (db && typeof db.getCurrentMember === 'function' ? db.getCurrentMember() : null) || { id: '004', name: 'Joshua Villafuerte' };
  const allReleases = (db && db.data && Array.isArray(db.data.releases)) ? db.data.releases : [];

  const releases = allReleases.filter(r => r && (db && db.activeRole === 'Elite Member' ? (r.eliteMemberId === member.id || (r.eliteMemberName && member.name && r.eliteMemberName.toLowerCase() === member.name.toLowerCase())) : true));

  container.innerHTML = `
    <div class="welcome-banner-card">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; width: 100%;">
        <div>
          <h2>Referral Fee Release Workflow</h2>
        </div>
        ${db.activeRole === 'Elite Member' ? `
          <button class="btn btn-emerald" id="open-release-modal"><i class="fas fa-paper-plane"></i> Submit Payout Request</button>
        ` : ''}
      </div>
    </div>

    <!-- Workflow Pipeline Step Indicator -->
    <div class="card" style="margin-bottom: 28px;">
      <div style="display: flex; justify-content: space-around; align-items: center; flex-wrap: wrap; gap: 16px; text-align: center;">
        <div style="flex: 1; min-width: 140px;">
          <div class="step-circle step-circle-1">1</div>
          <div style="font-size: 0.88rem; font-weight: 800;">Eligible Fee</div>
          <small style="color: var(--text-muted);">Verified Payments</small>
        </div>
        <i class="fas fa-chevron-right" style="color: var(--text-muted);"></i>
        <div style="flex: 1; min-width: 140px;">
          <div class="step-circle step-circle-2">2</div>
          <div style="font-size: 0.88rem; font-weight: 800;">Submit Request</div>
          <small style="color: var(--text-muted);">Online Dashboard Form</small>
        </div>
        <i class="fas fa-chevron-right" style="color: var(--text-muted);"></i>
        <div style="flex: 1; min-width: 140px;">
          <div class="step-circle step-circle-3">3</div>
          <div style="font-size: 0.88rem; font-weight: 800;">Finance Review</div>
          <small style="color: var(--text-muted);">Audit & Approval</small>
        </div>
        <i class="fas fa-chevron-right" style="color: var(--text-muted);"></i>
        <div style="flex: 1; min-width: 140px;">
          <div class="step-circle step-circle-4">4</div>
          <div style="font-size: 0.88rem; font-weight: 800;">Release Payout</div>
          <small style="color: var(--text-muted);">Disbursement Sent</small>
        </div>
      </div>
    </div>

    <!-- Payout Requests Table Card -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">Payout Release History & Requests</div>
      </div>

      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Request Reference #</th>
              ${isFinanceOrAdmin ? '<th>Elite Member Name</th>' : ''}
              <th>Date Requested</th>
              <th>Amount Requested</th>
              <th>Disbursement Method</th>
              <th>Processing Status</th>
              <th>Date Released</th>
              <th>Notes / Remarks</th>
              ${isFinanceOrAdmin ? '<th>Finance Actions</th>' : ''}
            </tr>
          </thead>
          <tbody>
            ${releases.length > 0 ? releases.map(rel => `
              <tr>
                <td><code>${rel.reqNumber}</code></td>
                ${isFinanceOrAdmin ? `<td><strong>${rel.eliteMemberName}</strong></td>` : ''}
                <td>${rel.dateRequested}</td>
                <td><strong style="color: var(--accent-emerald); font-size: 1.05rem;">${formatPHP(rel.amount)}</strong></td>
                <td><small>${rel.disbursementMethod}</small></td>
                <td><span class="status-pill status-${rel.processingStatus.replace(/\s+/g, '')}">${rel.processingStatus}</span></td>
                <td>${rel.dateReleased ? `<span style="color: var(--accent-emerald); font-weight: 600;"><i class="fas fa-check-circle"></i> ${rel.dateReleased}</span>` : '<span style="color: var(--text-muted);">Pending</span>'}</td>
                <td><small style="color: var(--text-secondary);">${rel.notes}</small></td>
                ${isFinanceOrAdmin ? `
                  <td>
                    ${rel.processingStatus !== 'Released' && rel.processingStatus !== 'Rejected' ? `
                      <button class="btn btn-emerald btn-sm btn-approve-release" data-id="${rel.id}"><i class="fas fa-check"></i> Approve & Release</button>
                    ` : `
                      <span style="font-size: 0.78rem; color: var(--text-muted);"><i class="fas fa-lock"></i> Finalized</span>
                    `}
                  </td>
                ` : ''}
              </tr>
            `).join('') : `
              <tr>
                <td colspan="${isFinanceOrAdmin ? 9 : 8}" style="text-align: center; padding: 40px 16px; color: var(--text-muted);">
                  <i class="fas fa-inbox" style="font-size: 2.2rem; display: block; margin-bottom: 8px; opacity: 0.4;"></i>
                  <div style="font-weight: 700; font-size: 0.92rem; color: var(--text-primary); margin-bottom: 4px;">No Payout Requests Found</div>
                  <div style="font-size: 0.78rem;">There are currently no payout release requests submitted.</div>
                </td>
              </tr>
            `}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal: Request Payout Release -->
    <div class="modal-overlay" id="modal-request-release">
      <div class="modal-content">
        <div class="modal-header">
          <h3><i class="fas fa-hand-holding-usd" style="color: var(--accent-emerald);"></i> Submit Referral Fee Release Request</h3>
          <button class="modal-close" id="close-modal-release">&times;</button>
        </div>
        <form id="form-request-release">
          <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); padding: 14px; border-radius: var(--radius-md); margin-bottom: 16px;">
            <div style="font-size: 0.78rem; color: var(--accent-emerald); font-weight: 700; text-transform: uppercase;">Available for Release</div>
            <div style="font-size: 1.5rem; font-weight: 800; color: #ffffff;">${formatPHP(member.availableForRelease)}</div>
          </div>
          <div class="form-group">
            <label>Requested Payout Amount (₱)</label>
            <input type="number" class="form-control" id="rel-amount" required value="${member.availableForRelease}" max="${member.availableForRelease}" min="100">
          </div>
          <div class="form-group">
            <label>Disbursement Channel / Method</label>
            <select class="form-control" id="rel-method" required>
              <option value="GCash (Registered Mobile)">GCash (Registered Mobile Number)</option>
              <option value="Bank Transfer (BDO / BPI / Metrobank)">Bank Transfer (BDO / BPI / Metrobank)</option>
              <option value="Check Pickup at Finance Office">Check Pickup at Finance Office</option>
            </select>
          </div>
          <div class="form-group">
            <label>Account Details / Remarks</label>
            <textarea class="form-control" id="rel-notes" rows="2" placeholder="e.g. Account Number: 0048-****-1192"></textarea>
          </div>
          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
            <button type="button" class="btn btn-secondary" id="cancel-request-release">Cancel</button>
            <button type="submit" class="btn btn-emerald">Submit Payout Request</button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Member Modal Triggers
  const btnOpen = container.querySelector('#open-release-modal');
  const modal = container.querySelector('#modal-request-release');
  const btnClose = container.querySelector('#close-modal-release');
  const btnCancel = container.querySelector('#cancel-request-release');
  const form = container.querySelector('#form-request-release');

  if (btnOpen) {
    btnOpen.addEventListener('click', () => modal.classList.add('active'));
  }
  if (modal) {
    [btnClose, btnCancel].forEach(b => b && b.addEventListener('click', () => modal.classList.remove('active')));
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const amount = container.querySelector('#rel-amount').value;
      const method = container.querySelector('#rel-method').value;
      const notes = container.querySelector('#rel-notes').value;

      db.submitReleaseRequest(amount, method, notes);
      modal.classList.remove('active');
      renderReleases(container);
    });
  }

  // Finance Approval Triggers
  if (isFinanceOrAdmin) {
    container.querySelectorAll('.btn-approve-release').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const notes = prompt('Enter Disbursement Transaction Reference / Check #:');
        db.updateReleaseStatus(id, 'Released', notes || 'Approved & Disbursed by Finance');
        renderReleases(container);
      });
    });
  }
}
