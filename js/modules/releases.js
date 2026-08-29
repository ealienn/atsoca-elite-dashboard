/**
 * Referral Fee Release Workflow Module Component
 */
import { db } from '../dbState.js';
import { formatPHP, getEliteLevel } from '../matrixEngine.js';

export function renderReleases(container) {
  if (!container) return;
  const isFinanceOrAdmin = (db && (db.activeRole === 'Finance' || db.activeRole === 'Administrator'));
  const isEliteMember = (db && db.activeRole === 'Elite Member');
  const member = (db && typeof db.getCurrentMember === 'function' ? db.getCurrentMember() : null) || { id: '004', name: 'Joshua Villafuerte' };
  const allReleases = (db && db.data && Array.isArray(db.data.releases)) ? db.data.releases : [];
  const members = (db && db.data && Array.isArray(db.data.members)) ? db.data.members : [];

  const sortedMembers = [...members].sort((a, b) => {
    const codeA = String(a.referralCode || a.eliteCode || a.id || '').trim();
    const codeB = String(b.referralCode || b.eliteCode || b.id || '').trim();
    return codeA.localeCompare(codeB, undefined, { numeric: true, sensitivity: 'base' });
  });

  const releases = allReleases.filter(r => r && (isEliteMember ? (r.eliteMemberId === member.id || (r.eliteMemberName && member.name && r.eliteMemberName.toLowerCase() === member.name.toLowerCase())) : true));

  container.innerHTML = `
    <div class="welcome-banner-card">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; width: 100%;">
        <div>
          <h2>Referral Fee Release Workflow</h2>
        </div>
      </div>
    </div>

    ${isEliteMember ? `
      <!-- Available Payout Request Banner Card for Elite Member -->
      <div class="card stat-card emerald" style="margin-bottom: 24px; padding: 22px 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.28); border-radius: 16px;">
        <div>
          <span style="font-size: 0.76rem; font-weight: 800; color: #059669; text-transform: uppercase; letter-spacing: 0.05em; display: block;">AVAILABLE PAYOUT REQUEST</span>
          <div style="font-size: 2.2rem; font-weight: 900; color: #059669; margin-top: 4px; line-height: 1.1;">${formatPHP(member.availableForRelease)}</div>
          <small style="color: var(--text-muted); font-size: 0.78rem; display: block; margin-top: 4px;">Based on total computed referral fees from your referred enrollments</small>
        </div>
        <button class="btn btn-emerald" id="open-release-modal" style="font-weight: 800; padding: 12px 22px; font-size: 0.95rem;"><i class="fas fa-paper-plane"></i> Submit Payout Request</button>
      </div>
    ` : `
      <!-- Available Payout Requests Summary Table Per Elite Member for Admin, Finance, and Elite Manager -->
      <div class="card" style="margin-bottom: 28px;">
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div class="card-title"><i class="fas fa-coins" style="color: var(--accent-emerald); margin-right: 8px;"></i> Summary of Available Payout Requests per Elite Member</div>
          <span style="font-size: 0.78rem; font-weight: 800; background: rgba(16, 185, 129, 0.12); color: #059669; padding: 5px 14px; border-radius: 20px; border: 1px solid rgba(16, 185, 129, 0.3);">
            System Total Available: ${formatPHP(sortedMembers.reduce((sum, m) => sum + (Number(m.availableForRelease) || 0), 0))}
          </span>
        </div>
        <div class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Elite Code</th>
                <th>Elite Member</th>
                <th>Calculated Tier</th>
                <th>Total Referral Fee Pool</th>
                <th>Released Fees</th>
                <th>Pending Releases</th>
                <th>Available Payout Request</th>
              </tr>
            </thead>
            <tbody>
              ${sortedMembers.map(m => {
                const fin = (db && typeof db.getMemberFinancials === 'function') ? db.getMemberFinancials(m.id) : null;
                const available = fin ? fin.availableForRelease : (Number(m.availableForRelease) || 0);
                const tier = getEliteLevel(m.totalUnits);
                return `
                  <tr>
                    <td><code>${m.referralCode || m.eliteCode || m.id}</code></td>
                    <td>
                      <div style="display: flex; align-items: center; gap: 10px;">
                        <img src="${typeof db.getMemberAvatar === 'function' ? db.getMemberAvatar(m) : 'assets/badges/badge_bronze.png'}" alt="${m.name}" style="width: 34px; height: 34px; border-radius: 50%; object-fit: cover;" onerror="this.onerror=null; this.src='assets/badges/badge_bronze.png';">
                        <div>
                          <strong>${m.name}</strong>
                          <div style="font-size: 0.75rem; color: var(--text-muted);">${m.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span class="mock-gold-badge" style="background: ${tier.badgeColor}; color: #ffffff;">${tier.name}</span></td>
                    <td><strong>${formatPHP(fin ? fin.earnedReferralFees : available)}</strong></td>
                    <td><span style="color: var(--text-muted);">${formatPHP(fin ? fin.releasedFees : 0)}</span></td>
                    <td><span style="color: var(--accent-amber); font-weight: 700;">${formatPHP(fin ? fin.pendingFees : 0)}</span></td>
                    <td><strong style="color: #059669; font-size: 1.05rem;">${formatPHP(available)}</strong></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `}

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
          <h3>Submit Referral Fee Release Request</h3>
          <button class="modal-close" id="close-modal-release">&times;</button>
        </div>
        <form id="form-request-release">
          <div style="background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3); padding: 14px; border-radius: var(--radius-md); margin-bottom: 16px;">
            <div style="font-size: 0.78rem; color: #059669; font-weight: 800; text-transform: uppercase;">Available for Release</div>
            <div style="font-size: 1.6rem; font-weight: 900; color: #059669;">${formatPHP(member.availableForRelease)}</div>
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
            <textarea class="form-control" id="rel-notes" rows="2"></textarea>
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

  if (btnOpen && modal) {
    btnOpen.addEventListener('click', () => {
      window.activeModalState = window.activeModalState || {};
      window.activeModalState.activeModalIds = window.activeModalState.activeModalIds || new Set();
      window.activeModalState.activeModalIds.add('modal-request-release');
      modal.classList.add('active');
    });
  }
  if (modal) {
    if (btnClose) {
      btnClose.addEventListener('click', () => {
        if (window.activeModalState && window.activeModalState.activeModalIds) {
          window.activeModalState.activeModalIds.delete('modal-request-release');
        }
        modal.classList.remove('active');
      });
    }
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const amount = container.querySelector('#rel-amount').value;
        const method = container.querySelector('#rel-method').value;
        const notes = container.querySelector('#rel-notes').value;

        db.submitReleaseRequest(amount, method, notes);
        form.reset();
        alert('Payout request submitted successfully.');
        renderReleases(container);
      });
    }
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
