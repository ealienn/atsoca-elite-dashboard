/**
 * Administrator & System Settings Component
 */
import { db } from '../dbState.js';
import { getEliteLevel } from '../matrixEngine.js';

export function renderAdmin(container) {
  if (!container) return;
  const isAdmin = db.activeRole === 'Administrator';

  if (!isAdmin) {
    container.innerHTML = `
      <div class="card" style="text-align: center; padding: 48px 24px;">
        <i class="fas fa-user-shield" style="font-size: 3rem; color: var(--accent-amber); margin-bottom: 16px;"></i>
        <h2>Administrator Access Only</h2>
        <p style="color: var(--text-secondary); max-width: 500px; margin: 12px auto;">
          This panel is restricted to system administrators for managing user roles, system configuration, and database maintenance.
        </p>
        <p style="font-size: 0.85rem; color: var(--accent-cyan); margin-top: 8px;">
          To access Admin controls, switch your role to <strong>Administrator</strong> in the header bar.
        </p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="welcome-banner-card">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; width: 100%;">
        <div>
          <h2>Administrator System Console</h2>
        </div>
        <div style="display: flex; gap: 12px;">
          <button class="btn btn-secondary btn-sm" id="btn-reset-db"><i class="fas fa-undo"></i> Reset Database</button>
        </div>
      </div>
    </div>

    <!-- Admin Grid Options -->
    <div class="grid-2">
      <!-- System Users Management -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">System Users & Profile Registry</div>
        </div>
        <div class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Member ID</th>
                <th>Name</th>
                <th>Calculated Tier</th>
                <th>Units</th>
                <th>Available Payout</th>
              </tr>
            </thead>
            <tbody>
              ${db.data.members.map(m => {
                const tier = getEliteLevel(m.totalUnits);
                return `
                  <tr>
                    <td><code>${m.id}</code></td>
                    <td><strong>${m.name}</strong></td>
                    <td><span class="mock-gold-badge" style="background: ${tier.badgeColor}; color: #ffffff;">${tier.name}</span></td>
                    <td>${m.totalUnits} Units</td>
                    <td>₱${m.availableForRelease.toLocaleString()}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal: Add New Member Profile -->
    <div class="modal-overlay" id="modal-add-member">
      <div class="modal-content">
        <div class="modal-header">
          <h3><i class="fas fa-user-plus" style="color: var(--accent-blue);"></i> Create New Member Profile</h3>
          <button class="modal-close" id="close-modal-member">&times;</button>
        </div>
        <form id="form-add-member">
          <div class="form-group">
            <label>Member Full Name</label>
            <input type="text" class="form-control" id="mem-name" required placeholder="e.g. Maria Clara Santos">
          </div>
          <div class="form-group">
            <label>Email Address</label>
            <input type="email" class="form-control" id="mem-email" required placeholder="e.g. maria.clara@atsoca.ph">
          </div>
          <div class="form-group">
            <label>Initial Total Units</label>
            <input type="number" class="form-control" id="mem-units" required value="25" min="0" placeholder="e.g. 25 (Bronze: 1-50, Gold: 101-150)">
          </div>
          <div class="form-group">
            <label>System Role</label>
            <select class="form-control" id="mem-role">
              <option value="Elite Member">Elite Member</option>
              <option value="Elite Manager">Elite Manager</option>
            </select>
          </div>
          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
            <button type="button" class="btn btn-secondary" id="cancel-add-member">Cancel</button>
            <button type="submit" class="btn btn-primary">Create Profile</button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Attach modal triggers
  const btnOpen = container.querySelector('#open-add-member-modal');
  const modal = container.querySelector('#modal-add-member');
  const btnClose = container.querySelector('#close-modal-member');
  const btnCancel = container.querySelector('#cancel-add-member');
  const form = container.querySelector('#form-add-member');

  if (btnOpen && modal) {
    btnOpen.addEventListener('click', () => modal.classList.add('active'));
    [btnClose, btnCancel].forEach(b => b && b.addEventListener('click', () => modal.classList.remove('active')));

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = container.querySelector('#mem-name').value;
      const email = container.querySelector('#mem-email').value;
      const units = container.querySelector('#mem-units').value;
      const role = container.querySelector('#mem-role').value;

      const newMember = db.addMember({
        name,
        email,
        totalUnits: units,
        role
      });

      modal.classList.remove('active');
      alert(`New Member Profile created successfully!\nID: ${newMember.id}\nName: ${newMember.name}`);
      renderAdmin(container);
    });
  }

  container.querySelector('#btn-reset-db').addEventListener('click', () => {
    if (confirm('Are you sure you want to reset the database to initial demo state?')) {
      db.resetDatabase();
      alert('Database state has been reset successfully!');
      renderAdmin(container);
    }
  });
}
