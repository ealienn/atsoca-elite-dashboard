/**
 * Profile Management Module Component
 * Allows editing active account profile (Elite Member or Management Role Account) directly via interactive modal drawer
 */
import { db } from '../dbState.js';
import { getEliteLevel } from '../matrixEngine.js';

export function renderProfileModal(container, onSaveSuccess = null) {
  const activeRole = db.activeRole;
  const isManagementRole = activeRole !== 'Elite Member';

  let account;
  let levelInfo = null;

  if (isManagementRole) {
    account = db.getManagementProfile(activeRole);
  } else {
    account = db.getCurrentMember();
    levelInfo = getEliteLevel(account ? account.totalUnits : 0);
  }

  container.innerHTML = `
    <!-- Static Profile Picture Display -->
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; margin-bottom: 20px;">
      <div style="position: relative; width: 100px; height: 100px; margin-bottom: 8px;">
        <img src="${typeof db.getMemberAvatar === 'function' && !isManagementRole ? db.getMemberAvatar(account) : (account.avatar || 'assets/logo.png')}" id="modal-profile-preview-avatar" alt="${account.name}" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 3px solid var(--border-color); box-shadow: 0 4px 14px rgba(0,0,0,0.15);">
      </div>
      ${!isManagementRole ? `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; margin-top: 4px;">
          <span style="background: rgba(2, 132, 199, 0.12); color: var(--accent-blue); padding: 4px 14px; border-radius: 20px; font-family: monospace; font-weight: 800; font-size: 0.85rem; border: 1px solid rgba(2, 132, 199, 0.3); display: inline-flex; align-items: center; gap: 6px;">
            Elite Code: ${account.referralCode || account.eliteCode || account.id}
          </span>
          <div style="background: rgba(16, 185, 129, 0.12); color: var(--accent-emerald); padding: 8px 18px; border-radius: 24px; font-weight: 800; font-size: 0.95rem; border: 1px solid rgba(16, 185, 129, 0.3); display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.15);">
            Available Payout Request: ₱${(Number(account.availableForRelease) || 0).toLocaleString()}
          </div>
        </div>
      ` : ''}
    </div>

    <!-- Alert Notification -->
    <div id="modal-profile-save-alert" style="display: none; background: rgba(16, 185, 129, 0.1); border: 1px solid var(--accent-emerald); color: var(--accent-emerald); padding: 10px 14px; border-radius: 8px; margin-bottom: 16px; font-weight: 600; font-size: 0.85rem; text-align: center;">
      <i class="fas fa-check-circle"></i> Profile settings saved successfully!
    </div>

    <!-- Profile Form -->
    <form id="modal-form-edit-profile">
      ${isManagementRole ? `
        <!-- Management Role Profile Settings Form -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div>
            <div class="form-group">
              <label>Account Name</label>
              <input type="text" id="modal-prof-name" class="form-control" value="${account.name}" required placeholder="Enter account name">
            </div>

            <div class="form-group">
              <label>Official Email</label>
              <input type="email" id="modal-prof-email" class="form-control" value="${account.email}" required placeholder="e.g. admin@atsoca.ph">
            </div>

            <div class="form-group">
              <label>Department / Scope</label>
              <input type="text" id="modal-prof-dept" class="form-control" value="${account.department || 'Operations'}" placeholder="e.g. Operations, Finance, Systems">
            </div>
          </div>

          <div>
            <div class="form-group">
              <label>Contact Number</label>
              <input type="text" id="modal-prof-phone" class="form-control" value="${account.phone || '0917-888-1029'}" placeholder="e.g. 0917-123-4567">
            </div>

            <div class="form-group">
              <label>Management Password</label>
              <input type="password" id="modal-prof-password" class="form-control" value="${account.password || '12345'}" required placeholder="Set password">
              <small style="font-size: 0.74rem; color: var(--text-secondary); margin-top: 4px; display: block;">Default password is 12345.</small>
            </div>
          </div>
        </div>
      ` : `
        <!-- Elite Member Profile Settings Form -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div>
            <div class="form-group">
              <label>Full Name</label>
              <input type="text" id="modal-prof-name" class="form-control" value="${account.name}" required placeholder="Enter full name">
            </div>

            <div class="form-group">
              <label>Email Address</label>
              <input type="email" id="modal-prof-email" class="form-control" value="${account.email}" required placeholder="e.g. name@atsoca.ph">
            </div>

            <div class="form-group">
              <label>Phone Number</label>
              <input type="text" id="modal-prof-phone" class="form-control" value="${account.phone || '0917-555-0192'}" placeholder="e.g. 0917-123-4567">
            </div>

            <div class="form-group">
              <label>Password</label>
              <input type="password" id="modal-prof-password" class="form-control" value="${account.password || '12345'}" required placeholder="Set password">
            </div>
          </div>

          <div>
            <div class="form-group">
              <label>GCash Mobile Number</label>
              <input type="text" id="modal-prof-gcash" class="form-control" value="${account.gcashNumber || '0917-882-9041'}" placeholder="e.g. 0917-123-4567">
            </div>

            <div class="form-group">
              <label>Bank Name</label>
              <input type="text" id="modal-prof-bank-name" class="form-control" value="${account.bankName || 'BDO Unibank'}" placeholder="e.g. BDO, BPI">
            </div>

            <div class="form-group">
              <label>Bank Account Holder Name</label>
              <input type="text" id="modal-prof-bank-account-name" class="form-control" value="${account.bankAccountName || account.name}" placeholder="Exact account name">
            </div>

            <div class="form-group">
              <label>Bank Account Number</label>
              <input type="text" id="modal-prof-bank-account-num" class="form-control" value="${account.bankAccountNumber || '0048-9012-3456'}" placeholder="Account number">
            </div>
          </div>
        </div>
      `}

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; border-top: 1px solid var(--border-color); padding-top: 16px;">
        <button type="button" class="btn btn-secondary" id="modal-btn-cancel-profile">Cancel</button>
        <button type="submit" class="btn btn-primary">
          <i class="fas fa-save"></i> Save Profile Settings
        </button>
      </div>
    </form>
  `;

  // Handle Form Save
  const form = container.querySelector('#modal-form-edit-profile');
  const btnCancel = container.querySelector('#modal-btn-cancel-profile');

  if (btnCancel) {
    btnCancel.addEventListener('click', () => {
      const modal = document.querySelector('#modal-edit-user-profile');
      if (modal) modal.classList.remove('active');
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = container.querySelector('#modal-prof-name').value;
      const email = container.querySelector('#modal-prof-email').value;
      const phone = container.querySelector('#modal-prof-phone').value;
      const password = container.querySelector('#modal-prof-password').value;
      const avatar = account.avatar || 'assets/logo.png';

      if (isManagementRole) {
        const department = container.querySelector('#modal-prof-dept') ? container.querySelector('#modal-prof-dept').value : '';
        db.updateManagementProfile(activeRole, {
          name,
          email,
          phone,
          password,
          avatar,
          department
        });
      } else {
        const gcashNumber = container.querySelector('#modal-prof-gcash') ? container.querySelector('#modal-prof-gcash').value : '';
        const bankName = container.querySelector('#modal-prof-bank-name') ? container.querySelector('#modal-prof-bank-name').value : '';
        const bankAccountName = container.querySelector('#modal-prof-bank-account-name') ? container.querySelector('#modal-prof-bank-account-name').value : '';
        const bankAccountNumber = container.querySelector('#modal-prof-bank-account-num') ? container.querySelector('#modal-prof-bank-account-num').value : '';

        db.updateMemberProfile(account.id, {
          name,
          email,
          phone,
          password,
          avatar,
          gcashNumber,
          bankName,
          bankAccountName,
          bankAccountNumber
        });
      }

      const modalAlert = container.querySelector('#modal-profile-save-alert');
      if (modalAlert) {
        modalAlert.style.display = 'block';
      }
      if (onSaveSuccess) onSaveSuccess();
    });
  }
}
