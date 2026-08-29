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

  const members = db.data.members || [];
  const selectedMemberId = window.lastAssignedMemberId || (members[0] ? members[0].id : '004');
  const selectedMember = members.find(m => m.id === selectedMemberId) || members[0] || {};
  const defaultCode = selectedMember ? (selectedMember.referralCode || selectedMember.eliteCode || selectedMember.id) : '';

  container.innerHTML = `
    <div class="welcome-banner-card">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; width: 100%;">
        <div>
          <h2>Administrator System Console</h2>
          <p style="font-size: 0.85rem; opacity: 0.85; margin-top: 4px;">Manage system accounts, assign Elite Member codes, and oversee portal configurations.</p>
        </div>
        <div style="display: flex; gap: 12px;">
          <button class="btn btn-secondary btn-sm" id="btn-reset-db"><i class="fas fa-undo"></i> Reset Database</button>
        </div>
      </div>
    </div>

    <!-- Alert / Toast Container -->
    <div id="admin-toast-alert" style="display: none; background: rgba(16, 185, 129, 0.15); border: 1px solid var(--accent-emerald); color: var(--accent-emerald); padding: 12px 18px; border-radius: 10px; margin-bottom: 20px; font-weight: 700; font-size: 0.9rem; align-items: center; justify-content: space-between;">
      <span id="admin-toast-text"><i class="fas fa-check-circle"></i> Elite Code assigned successfully!</span>
      <button type="button" style="background: none; border: none; color: inherit; cursor: pointer; font-size: 1.1rem;" onclick="document.getElementById('admin-toast-alert').style.display='none'">&times;</button>
    </div>

    <!-- System Users & Elite Code Registry -->
    <div class="card">
      <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
        <div class="card-title"><i class="fas fa-users-cog" style="color: var(--accent-blue); margin-right: 8px;"></i> System Users & Elite Codes</div>
        <span style="font-size: 0.78rem; font-weight: 700; background: var(--header-btn-bg); padding: 4px 10px; border-radius: 20px; border: 1px solid var(--border-color);">${members.length} Active Accounts</span>
      </div>
      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Member ID</th>
              <th>Name</th>
              <th>Calculated Tier</th>
              <th>Elite Code</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${members.map(m => {
              const tier = getEliteLevel(m.totalUnits);
              const assignedCode = m.referralCode || m.eliteCode || m.id;
              return `
                  <tr>
                    <td><code>${m.id}</code></td>
                    <td>
                      <div style="display: flex; align-items: center; gap: 10px;">
                        <img src="${typeof db.getMemberAvatar === 'function' ? db.getMemberAvatar(m) : (m.avatar || 'assets/badges/badge_bronze.png')}" alt="${m.name}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover; border: 2px solid var(--border-color);" onerror="this.onerror=null; this.src='assets/badges/badge_bronze.png';">
                        <div>
                          <strong>${m.name}</strong>
                          <div style="font-size: 0.75rem; color: var(--text-muted);">${m.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span class="mock-gold-badge" style="background: ${tier.badgeColor}; color: #ffffff;">${tier.name}</span></td>
                    <td>
                      <span class="badge-elite-code" style="background: rgba(2, 132, 199, 0.12); color: var(--accent-blue); padding: 5px 10px; border-radius: 6px; font-family: monospace; font-weight: 800; font-size: 0.88rem; border: 1px solid rgba(2, 132, 199, 0.28); display: inline-flex; align-items: center;">
                        ${assignedCode}
                      </span>
                    </td>
                    <td>
                      <button type="button" class="btn btn-sm btn-primary btn-open-assign-modal" data-id="${m.id}" data-name="${m.name}" data-code="${assignedCode}" style="padding: 5px 12px; font-size: 0.8rem;">
                        Assign Code
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

    <!-- Modal: Assign Code Interactive Dialog -->
    <div class="modal-overlay" id="modal-assign-elite-code">
      <div class="modal-content" style="max-width: 480px;">
        <div class="modal-header">
          <h3>Assign Code for Elite Member</h3>
          <button class="modal-close" id="close-modal-assign-code">&times;</button>
        </div>
        <form id="form-modal-assign-code">
          <input type="hidden" id="modal-assign-member-id" value="">
          
          <div style="background: var(--header-btn-bg); padding: 12px 16px; border-radius: 10px; border: 1px solid var(--border-color); margin-bottom: 18px; display: flex; align-items: center; gap: 12px;">
            <img id="modal-assign-member-avatar" src="${members[0] ? (typeof db.getMemberAvatar === 'function' ? db.getMemberAvatar(members[0]) : (members[0].avatar || 'assets/badges/badge_bronze.png')) : 'assets/badges/badge_bronze.png'}" alt="Avatar" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid var(--accent-blue);" onerror="this.onerror=null; this.src='assets/badges/badge_bronze.png';">
            <div>
              <div id="modal-assign-member-name" style="font-weight: 800; font-size: 1rem;">${members[0] ? members[0].name : ''}</div>
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 16px;">
            <label style="font-weight: 700;">New Assigned Elite Code</label>
            <input type="text" class="form-control" id="modal-assign-code-input" required style="font-family: monospace; font-weight: 800; text-transform: uppercase; font-size: 1.05rem;">
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 24px; border-top: 1px solid var(--border-color); padding-top: 16px;">
            <button type="button" class="btn btn-secondary" id="cancel-modal-assign-code">Cancel</button>
            <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save Assigned Code</button>
          </div>
        </form>
      </div>
    </div>
  `;

  // --- Attach Event Handlers ---

  // Modal Setup
  const modal = container.querySelector('#modal-assign-elite-code');
  const modalClose = container.querySelector('#close-modal-assign-code');
  const modalCancel = container.querySelector('#cancel-modal-assign-code');
  const modalForm = container.querySelector('#form-modal-assign-code');
  const modalInput = container.querySelector('#modal-assign-code-input');
  const modalMemId = container.querySelector('#modal-assign-member-id');
  const modalMemName = container.querySelector('#modal-assign-member-name');
  const modalMemAvatar = container.querySelector('#modal-assign-member-avatar');

  const openModal = (id, fallbackName = '', fallbackCode = '') => {
    if (!modal) return;
    const targetMember = members.find(m => m && String(m.id).trim() === String(id).trim());
    const memberName = targetMember ? targetMember.name : (fallbackName || 'Elite Member');
    const memberCode = targetMember ? (targetMember.referralCode || targetMember.eliteCode || targetMember.id) : (fallbackCode || id);
    const memberAvatar = targetMember ? (typeof db.getMemberAvatar === 'function' ? db.getMemberAvatar(targetMember) : targetMember.avatar) : 'assets/badges/badge_bronze.png';

    if (modalMemId) modalMemId.value = id;
    if (modalMemName) modalMemName.innerText = memberName;
    if (modalMemAvatar) modalMemAvatar.src = memberAvatar;
    if (modalInput) modalInput.value = memberCode;

    window.activeModalState = window.activeModalState || {};
    window.activeModalState.activeModalIds = window.activeModalState.activeModalIds || new Set();
    window.activeModalState.activeModalIds.add('modal-assign-elite-code');
    modal.classList.add('active');
  };

  const closeModal = () => {
    if (!modal) return;
    if (window.activeModalState && window.activeModalState.activeModalIds) {
      window.activeModalState.activeModalIds.delete('modal-assign-elite-code');
    }
    modal.classList.remove('active');
  };

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalCancel) modalCancel.addEventListener('click', closeModal);

  container.querySelectorAll('.btn-open-assign-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const name = btn.dataset.name;
      const code = btn.dataset.code;
      openModal(id, name, code);
    });
  });

  // Modal Form Submit
  if (modalForm) {
    modalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const mId = modalMemId.value;
      const newCode = modalInput.value.trim().toUpperCase();

      const updated = db.assignEliteCode(mId, newCode);
      closeModal();
      if (updated) {
        window.lastAssignedMemberId = mId;
        renderAdmin(container);
        showToast(`Successfully assigned Elite Code "${newCode}" to ${updated.name}!`);
      }
    });
  }

  // Toast Notification Helper
  function showToast(msg) {
    const toast = document.querySelector('#admin-toast-alert');
    const toastText = document.querySelector('#admin-toast-text');
    if (toast && toastText) {
      toastText.innerHTML = `<i class="fas fa-check-circle"></i> ${msg}`;
      toast.style.display = 'flex';
      setTimeout(() => {
        if (toast) toast.style.display = 'none';
      }, 4500);
    } else {
      alert(msg);
    }
  }

  // Reset DB Listener
  const btnReset = container.querySelector('#btn-reset-db');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset the database to initial demo state?')) {
        db.resetDatabase();
        alert('Database state has been reset successfully!');
        renderAdmin(container);
      }
    });
  }
}

