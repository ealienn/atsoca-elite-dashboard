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

  const presetAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
  ];

  container.innerHTML = `
    <!-- Header Avatar & Account Summary -->
    <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px; background: var(--box-inner-bg); padding: 14px; border-radius: 12px; border: 1px solid var(--border-color);">
      <img src="${account.avatar || presetAvatars[0]}" id="modal-profile-preview-avatar" alt="${account.name}" style="width: 64px; height: 64px; border-radius: 50%; object-fit: cover; border: 2px solid var(--accent-blue);">
      <div>
        <h4 style="margin: 0; font-size: 1.15rem; font-weight: 800; color: var(--text-primary);">${account.name}</h4>
        ${isManagementRole ? `
          <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px;">
            Role Account: <strong>${activeRole}</strong> &bull; Email: ${account.email}
          </div>
        ` : ''}
        <div style="margin-top: 6px; display: flex; align-items: center; gap: 8px;">
          ${isManagementRole ? `
            <span class="status-pill status-Verified" style="font-size: 0.75rem; padding: 2px 10px;">
              <i class="fas fa-shield-alt"></i> ${activeRole} Account (${account.department || 'Management'})
            </span>
          ` : `
            <span class="tier-badge tier-${levelInfo.name.replace(/\s+/g, '')}" style="font-size: 0.75rem; padding: 2px 8px;">
              ${levelInfo.name} Partner
            </span>
            <span style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 600;">
              ${Number(account.totalUnits || 0).toFixed(2)} Units
            </span>
          `}
        </div>
      </div>
    </div>

    <!-- Alert Notification -->
    <div id="modal-profile-save-alert" style="display: none; background: rgba(16, 185, 129, 0.1); border: 1px solid var(--accent-emerald); color: var(--accent-emerald); padding: 10px 14px; border-radius: 8px; margin-bottom: 16px; font-weight: 600; font-size: 0.85rem;">
      <i class="fas fa-check-circle"></i> Profile settings for ${account.name} saved successfully!
    </div>

    <!-- Profile Form -->
    <form id="modal-form-edit-profile">
      ${isManagementRole ? `
        <!-- Management Role Profile Settings Form -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div>
            <div class="form-group">
              <label><i class="fas fa-user-shield"></i> Account Name</label>
              <input type="text" id="modal-prof-name" class="form-control" value="${account.name}" required placeholder="Enter account name">
            </div>

            <div class="form-group">
              <label><i class="fas fa-envelope"></i> Official Email</label>
              <input type="email" id="modal-prof-email" class="form-control" value="${account.email}" required placeholder="e.g. admin@atsoca.ph">
            </div>

            <div class="form-group">
              <label><i class="fas fa-sitemap"></i> Department / Scope</label>
              <input type="text" id="modal-prof-dept" class="form-control" value="${account.department || 'Operations'}" placeholder="e.g. Operations, Finance, Systems">
            </div>
          </div>

          <div>
            <div class="form-group">
              <label><i class="fas fa-phone"></i> Contact Number</label>
              <input type="text" id="modal-prof-phone" class="form-control" value="${account.phone || '0917-888-1029'}" placeholder="e.g. 0917-123-4567">
            </div>

            <div class="form-group">
              <label><i class="fas fa-key"></i> Management Password</label>
              <input type="password" id="modal-prof-password" class="form-control" value="${account.password || '12345'}" required placeholder="Set password">
              <small style="font-size: 0.74rem; color: var(--text-secondary); margin-top: 4px; display: block;">Default password is 12345.</small>
            </div>

            <div class="form-group">
              <label><i class="fas fa-image"></i> Avatar Selection</label>
              <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px;" id="modal-preset-avatar-container">
                ${presetAvatars.map((url, idx) => `
                  <img src="${url}" data-url="${url}" class="preset-avatar-item ${account.avatar === url ? 'selected' : ''}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover; cursor: pointer; border: 2px solid ${account.avatar === url ? 'var(--accent-blue)' : 'transparent'};" title="Avatar ${idx + 1}">
                `).join('')}
              </div>
              <input type="url" id="modal-prof-avatar-url" class="form-control" value="${account.avatar || ''}" placeholder="Custom Image URL">
            </div>
          </div>
        </div>
      ` : `
        <!-- Elite Member Profile Settings Form -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div>
            <div class="form-group">
              <label><i class="fas fa-user"></i> Full Name</label>
              <input type="text" id="modal-prof-name" class="form-control" value="${account.name}" required placeholder="Enter full name">
            </div>

            <div class="form-group">
              <label><i class="fas fa-envelope"></i> Email Address</label>
              <input type="email" id="modal-prof-email" class="form-control" value="${account.email}" required placeholder="e.g. name@atsoca.ph">
            </div>

            <div class="form-group">
              <label><i class="fas fa-phone"></i> Phone Number</label>
              <input type="text" id="modal-prof-phone" class="form-control" value="${account.phone || '0917-555-0192'}" placeholder="e.g. 0917-123-4567">
            </div>

            <div class="form-group">
              <label><i class="fas fa-key"></i> Password</label>
              <input type="password" id="modal-prof-password" class="form-control" value="${account.password || '12345'}" required placeholder="Set password">
            </div>

            <div class="form-group">
              <label><i class="fas fa-image"></i> Preset Avatars</label>
              <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px;" id="modal-preset-avatar-container">
                ${presetAvatars.map((url, idx) => `
                  <img src="${url}" data-url="${url}" class="preset-avatar-item ${account.avatar === url ? 'selected' : ''}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover; cursor: pointer; border: 2px solid ${account.avatar === url ? 'var(--accent-blue)' : 'transparent'};" title="Avatar ${idx + 1}">
                `).join('')}
              </div>
              <input type="url" id="modal-prof-avatar-url" class="form-control" value="${account.avatar || ''}" placeholder="Custom Image URL">
            </div>
          </div>

          <div>
            <div class="form-group">
              <label><i class="fas fa-mobile-alt"></i> GCash Mobile Number</label>
              <input type="text" id="modal-prof-gcash" class="form-control" value="${account.gcashNumber || '0917-882-9041'}" placeholder="e.g. 0917-123-4567">
            </div>

            <div class="form-group">
              <label><i class="fas fa-university"></i> Bank Name</label>
              <input type="text" id="modal-prof-bank-name" class="form-control" value="${account.bankName || 'BDO Unibank'}" placeholder="e.g. BDO, BPI">
            </div>

            <div class="form-group">
              <label><i class="fas fa-id-card"></i> Bank Account Holder Name</label>
              <input type="text" id="modal-prof-bank-account-name" class="form-control" value="${account.bankAccountName || account.name}" placeholder="Exact account name">
            </div>

            <div class="form-group">
              <label><i class="fas fa-list-ol"></i> Bank Account Number</label>
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

  // Bind Avatar Selection
  const avatarUrlInput = container.querySelector('#modal-prof-avatar-url');
  const avatarPreview = container.querySelector('#modal-profile-preview-avatar');
  const presetItems = container.querySelectorAll('.preset-avatar-item');

  presetItems.forEach(item => {
    item.addEventListener('click', () => {
      presetItems.forEach(i => i.style.borderColor = 'transparent');
      item.style.borderColor = 'var(--accent-blue)';
      const selectedUrl = item.getAttribute('data-url');
      if (avatarUrlInput) avatarUrlInput.value = selectedUrl;
      if (avatarPreview) avatarPreview.src = selectedUrl;
    });
  });

  if (avatarUrlInput && avatarPreview) {
    avatarUrlInput.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      if (val) avatarPreview.src = val;
    });
  }

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
      const avatar = container.querySelector('#modal-prof-avatar-url').value;

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

      setTimeout(() => {
        const modal = document.querySelector('#modal-edit-user-profile');
        if (modal) modal.classList.remove('active');
        if (onSaveSuccess) onSaveSuccess();
      }, 700);
    });
  }
}
