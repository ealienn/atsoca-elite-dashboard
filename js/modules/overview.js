/**
 * Dashboard Overview Module Component
 * Supports both Elite Member view & Management view
 * (Elite Manager, Finance, Administrator) with full access to inspect Elite accounts & verify invites.
 */
import { db } from '../dbState.js';
import { getEliteLevel } from '../matrixEngine.js';

const formatPHP = (amt) => '₱' + Number(amt || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function renderOverview(container) {
  const role = db.activeRole;
  const isManagerOrAdmin = role === 'Elite Manager' || role === 'Finance' || role === 'Administrator';

  if (!isManagerOrAdmin) {
    renderEliteMemberOverview(container);
  } else {
    renderManagementOverview(container, role);
  }
}

/**
 * Overview for Individual Elite Member
 */
function renderEliteMemberOverview(container) {
  if (!container) return;
  const member = (db && typeof db.getCurrentMember === 'function' ? db.getCurrentMember() : null) || (db && db.data && db.data.members && db.data.members[0]) || {
    id: '004',
    name: 'Joshua Villafuerte',
    referralCode: 'ATS-REF-004',
    totalUnits: 0.73,
    monthlyUnits: 0.73,
    pendingFees: 0,
    availableForRelease: 24050,
    releasedFees: 0
  };

  const allInvites = (db && db.data && Array.isArray(db.data.invites)) ? db.data.invites : [];
  const invites = allInvites.filter(i => {
    if (!i) return false;
    const matchId = i.referrerId && member.id && String(i.referrerId).trim() === String(member.id).trim();
    const matchEmail = i.referrerEmail && member.email && i.referrerEmail.toLowerCase().trim() === member.email.toLowerCase().trim();
    const matchName = i.referrerName && member.name && i.referrerName.toLowerCase().trim() === member.name.toLowerCase().trim();
    return matchId || matchEmail || matchName;
  });

  const totalInvites = invites.length;
  const currentYearMonth = new Date().toISOString().slice(0, 7);
  const monthlyInvites = invites.filter(i => i && i.dateSubmitted && (i.dateSubmitted.startsWith(currentYearMonth) || i.dateSubmitted.startsWith('2026-08'))).length;
  const enrolledInvites = invites.filter(i => i && i.enrollmentStatus === 'Enrolled').length;
  const verifiedInvites = invites.filter(i => i && i.verificationStatus === 'Verified').length;

  const currentLevelInfo = getEliteLevel(member ? member.totalUnits : 0);
  const pendingFees = Number(member.pendingFees) || 0;
  const availableFees = Number(member.availableForRelease) || 0;
  const releasedFees = Number(member.releasedFees) || 0;
  const totalEarnings = releasedFees + availableFees + pendingFees;

  const displayUnits = Number(member.totalUnits) || 0;

  container.innerHTML = `
    <!-- Top Welcome Banner Card -->
    <div class="welcome-banner-card">
      <div class="welcome-text" style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
        Welcome back, ${member.name}!
      </div>
    </div>

    <!-- 1. Top Stat Cards (Grid 4 - Centered Minimal Layout) -->
    <div class="mock-grid-4" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; margin-bottom: 24px;">
      <!-- Member Card 1: Invites Submitted -->
      <div class="mock-stat-card" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 14px; padding: 22px 18px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <div style="font-size: 0.72rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">TOTAL INVITES SUBMITTED</div>
        <div style="font-size: 2.3rem; font-weight: 900; color: var(--text-primary); line-height: 1;">${totalInvites}</div>
      </div>

      <!-- Member Card 2: Verified -->
      <div class="mock-stat-card" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 14px; padding: 22px 18px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <div style="font-size: 0.72rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">VERIFIED</div>
        <div style="font-size: 2.3rem; font-weight: 900; color: var(--text-primary); line-height: 1;">${verifiedInvites}</div>
      </div>

      <!-- Member Card 3: Enrolled -->
      <div class="mock-stat-card" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 14px; padding: 22px 18px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <div style="font-size: 0.72rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">ENROLLED</div>
        <div style="font-size: 2.3rem; font-weight: 900; color: var(--text-primary); line-height: 1;">${enrolledInvites}</div>
      </div>

      <!-- Member Card 4: Total Units -->
      <div class="mock-stat-card" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 14px; padding: 22px 18px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <div style="font-size: 0.72rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">TOTAL UNITS</div>
        <div style="font-size: 2.3rem; font-weight: 900; color: var(--text-primary); line-height: 1;">${displayUnits}</div>
      </div>
    </div>



    <!-- 3. Bottom Card: RECENT INVITES -->
    <div class="mock-card-panel">
      <div class="mock-panel-header" style="margin-bottom: 16px;">
        <h3 class="mock-panel-title">RECENT INVITES | ENROLLMENT STATUS</h3>
      </div>

      <div class="table-responsive">
        <table class="custom-table" style="width: 100%;">
          <thead>
            <tr>
              <th>Invite Name</th>
              <th>School / Company</th>
              <th>Training Type</th>
              <th>Date Submitted</th>
              <th>Enrollment Status</th>
            </tr>
          </thead>
          <tbody>
            ${invites.length === 0 ? `
              <tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 24px;">No invites submitted yet.</td></tr>
            ` : invites.map(inv => `
              <tr>
                <td><strong>${inv.inviteName}</strong></td>
                <td>${inv.schoolCompany}</td>
                <td>${inv.trainingType}</td>
                <td>${inv.dateSubmitted}</td>
                <td><span class="status-pill status-${inv.enrollmentStatus.replace(/\s+/g, '')}">${inv.enrollmentStatus}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Attach quick action handlers
  const btnQuickInvite = container.querySelector('#btn-quick-invite');
  if (btnQuickInvite) {
    btnQuickInvite.addEventListener('click', () => {
      const navItem = document.querySelector('[data-tab="invites"]');
      if (navItem) navItem.click();
    });
  }

  const btnQuickRelease = container.querySelector('#btn-quick-release');
  if (btnQuickRelease) {
    btnQuickRelease.addEventListener('click', () => {
      const navItem = document.querySelector('[data-tab="releases"]');
      if (navItem) navItem.click();
    });
  }
}

/**
 * Overview for Elite Manager, Finance, and Administrator
 * Direct access to all Elite Member accounts and invite counts for verification
 */
function renderManagementOverview(container, role) {
  if (!container) return;
  const members = (db && db.data && Array.isArray(db.data.members)) ? db.data.members : [];
  const allInvites = (db && db.data && Array.isArray(db.data.invites)) ? db.data.invites : [];

  const totalMembers = members.length;
  const totalInvites = allInvites.length;
  const pendingInvites = allInvites.filter(i => i && i.verificationStatus === 'Pending').length;
  const verifiedInvites = allInvites.filter(i => i && i.verificationStatus === 'Verified').length;
  const enrolledInvites = allInvites.filter(i => i && i.enrollmentStatus === 'Enrolled').length;
  const totalUnits = members.reduce((sum, m) => sum + (m ? (Number(m.totalUnits) || 0) : 0), 0);

  container.innerHTML = `
    <!-- Top Administrator Executive Console Banner -->
    <div class="welcome-banner-card" style="background: #002355; border: 1px solid var(--border-color); border-radius: 12px; padding: 20px 24px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
      <div>
        <h2 style="color: #ffffff; margin: 0; font-size: 1.35rem; font-weight: 800;">Administrator Executive Console</h2>
      </div>
      <div>
        <button class="btn btn-primary" id="btn-mgmt-quick-verify" style="background: #0284c7; color: #ffffff; border: none; font-weight: 700; border-radius: 8px; padding: 10px 20px; font-size: 0.88rem;">
          Verification Log (${pendingInvites} Pending)
        </button>
      </div>
    </div>

    <!-- 1. Key Metric Stat Cards (Centered Minimalist Layout) -->
    <div class="mock-grid-4" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 24px;">
      <!-- Card 1: Total Elites Registered -->
      <div class="mock-stat-card" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 14px; padding: 24px 20px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <div style="font-size: 0.72rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">TOTAL ELITES REGISTERED</div>
        <div style="font-size: 2.4rem; font-weight: 900; color: var(--text-primary); line-height: 1;">${totalMembers}</div>
      </div>

      <!-- Card 2: Total System Invites -->
      <div class="mock-stat-card" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 14px; padding: 24px 20px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <div style="font-size: 0.72rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">TOTAL SYSTEM INVITES</div>
        <div style="font-size: 2.4rem; font-weight: 900; color: var(--text-primary); line-height: 1;">${totalInvites}</div>
      </div>

      <!-- Card 3: Accumulated Units -->
      <div class="mock-stat-card" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 14px; padding: 24px 20px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <div style="font-size: 0.72rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">ACCUMULATED UNITS</div>
        <div style="font-size: 2.4rem; font-weight: 900; color: var(--text-primary); line-height: 1;">${totalUnits.toFixed(2)}</div>
      </div>
    </div>

    <!-- 2. Main Verification Panel: ALL ELITE ACCOUNTS & INVITES DIRECTORY -->
    <div class="mock-card-panel" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 24px;">
      <div class="mock-panel-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; margin-bottom: 20px;">
        <div style="font-size: 0.92rem; font-weight: 900; color: var(--heading-color); text-transform: uppercase; letter-spacing: 0.05em;">
          ELITE ACCOUNTS & INVITE VERIFICATION MATRIX
        </div>

        <div style="display: flex; gap: 12px; align-items: center;">
          <input type="text" id="search-elite-matrix" class="form-control" placeholder="Search member, email, or ID..." style="width: 220px; padding: 6px 12px; font-size: 0.82rem;">
          <select id="filter-tier-matrix" class="form-control" style="width: 140px; padding: 6px 12px; font-size: 0.82rem;">
            <option value="ALL">All Tiers</option>
            <option value="Bronze">Bronze</option>
            <option value="Silver">Silver</option>
            <option value="Gold">Gold</option>
            <option value="Platinum">Platinum</option>
            <option value="Diamond">Diamond</option>
            <option value="Associate">Associate</option>
            <option value="Associate Manager">Associate Manager</option>
          </select>
        </div>
      </div>

      <div class="table-responsive">
        <table class="custom-table" id="table-elite-matrix" style="width: 100%; font-size: 0.84rem;">
          <thead>
            <tr>
              <th>ELITE ACCOUNT</th>
              <th>MEMBER ID</th>
              <th>CALCULATED TIER</th>
              <th>SUBMITTED INVITES</th>
              <th>TOTAL UNITS</th>
              <th>AVAILABLE FEES</th>
              <th style="text-align: right;">VERIFICATION ACCESS</th>
            </tr>
          </thead>
          <tbody>
            ${members.map(m => {
              const tier = getEliteLevel(m.totalUnits);
              const mInvites = allInvites.filter(i => i.referrerId === m.id || (i.referrerName && i.referrerName.toLowerCase() === m.name.toLowerCase()));
              const mVerified = mInvites.filter(i => i.verificationStatus === 'Verified').length;
              const mEnrolled = mInvites.filter(i => i.enrollmentStatus === 'Enrolled').length;
              const mPending = mInvites.filter(i => i.verificationStatus === 'Pending').length;

              return `
                <tr data-member-id="${m.id}" data-tier="${tier.name}">
                  <td>
                    <div style="display: flex; align-items: center; gap: 12px;">
                      <img src="${m.avatar}" alt="${m.name}" style="width: 40px; height: 40px; border-radius: 8px; object-fit: cover;">
                      <div>
                        <div style="font-weight: 800; color: var(--text-primary); font-size: 0.88rem;">${m.name}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">${m.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><code>${m.id}</code></td>
                  <td>
                    <span class="tier-badge tier-${tier.name.replace(/\s+/g, '')}" style="background: #fef3c7; color: #b45309; border: 1px solid #fde68a; font-weight: 700; font-size: 0.76rem; padding: 4px 12px; border-radius: 14px;">
                      <i class="fas ${tier.icon}"></i> ${tier.name}
                    </span>
                  </td>
                  <td>
                    <strong style="font-size: 0.88rem;">${mInvites.length} ${mInvites.length === 1 ? 'Invite' : 'Invites'}</strong>
                    ${mPending > 0 ? `<span style="background: #e0f2fe; color: #0284c7; font-size: 0.72rem; padding: 2px 8px; border-radius: 10px; margin-left: 6px; font-weight: 700;">${mPending} Pending</span>` : ''}
                  </td>
                  <td><strong>${Number(m.totalUnits || 0).toFixed(2)} Units</strong></td>
                  <td><strong style="color: #0284c7;">₱${(m.availableForRelease || 0).toLocaleString()}</strong></td>
                  <td style="text-align: right;">
                    <div style="display: flex; justify-content: flex-end; gap: 6px;">
                      <button class="btn btn-primary btn-xs btn-inspect-account" data-id="${m.id}" style="background: #002355; color: #ffffff; border: none; font-size: 0.72rem; font-weight: 700; padding: 5px 10px; border-radius: 6px;">
                        <i class="fas fa-eye"></i> View Audit Details
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- 3. Modal Drawer: Elite Account Inspection & Invite Verification -->
    <div class="modal-overlay" id="modal-inspect-account">
      <div class="modal-content modal-lg">
        <div class="modal-header">
          <h3>Elite Account & Invite Verification View</h3>
          <button class="modal-close" id="close-modal-inspect">&times;</button>
        </div>
        <div id="modal-inspect-body">
          <!-- Dynamic Account Content Rendered Here -->
        </div>
      </div>
    </div>
  `;

  // Attach search & filter handlers
  const searchInput = container.querySelector('#search-elite-matrix');
  const tierFilter = container.querySelector('#filter-tier-matrix');

  const filterMatrix = () => {
    const query = searchInput.value.toLowerCase().trim();
    const selectedTier = tierFilter.value;
    const rows = container.querySelectorAll('#table-elite-matrix tbody tr');

    rows.forEach(tr => {
      const text = tr.innerText.toLowerCase();
      const rowTier = tr.getAttribute('data-tier');
      const matchQuery = text.includes(query);
      const matchTier = selectedTier === 'ALL' || rowTier === selectedTier;

      tr.style.display = (matchQuery && matchTier) ? '' : 'none';
    });
  };

  if (searchInput) searchInput.addEventListener('input', filterMatrix);
  if (tierFilter) tierFilter.addEventListener('change', filterMatrix);

  // Quick action: Pending Verifications trigger
  const btnQuickVerify = container.querySelector('#btn-mgmt-quick-verify');
  if (btnQuickVerify) {
    btnQuickVerify.addEventListener('click', () => {
      const navItem = document.querySelector('[data-tab="invites"]');
      if (navItem) navItem.click();
    });
  }

  // Handle Switch View button in matrix table
  container.querySelectorAll('.btn-switch-account').forEach(btn => {
    btn.addEventListener('click', () => {
      const memId = btn.getAttribute('data-id');
      const targetMem = members.find(m => m.id === memId);
      if (targetMem) {
        db.setRole('Elite Member', memId);
      }
    });
  });



  // Handle Inspect Account & Invites button
  const modal = container.querySelector('#modal-inspect-account');
  const modalBody = container.querySelector('#modal-inspect-body');
  const btnCloseModal = container.querySelector('#close-modal-inspect');

  if (btnCloseModal && modal) {
    btnCloseModal.addEventListener('click', () => modal.classList.remove('active'));
  }

  container.querySelectorAll('.btn-inspect-account').forEach(btn => {
    btn.addEventListener('click', () => {
      const memId = btn.getAttribute('data-id');
      openInspectModal(memId);
    });
  });

  // Function to open and populate inspect account modal
  function openInspectModal(memId) {
    const targetMember = db.data.members.find(m => m.id === memId);
    if (!targetMember || !modal || !modalBody) return;

    const tier = getEliteLevel(targetMember.totalUnits);
    const memberInvites = (db.data.invites || []).filter(i => 
      i.referrerId === targetMember.id || 
      (i.referrerName && i.referrerName.toLowerCase() === targetMember.name.toLowerCase())
    );

    const isEliteMember = db && db.activeRole === 'Elite Member';

    modalBody.innerHTML = `
      <!-- Member Overview Header Box -->
      <div style="background: var(--box-inner-bg); border: 1px solid var(--box-inner-border); border-radius: var(--radius-md); padding: 20px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px;">
          <div style="display: flex; align-items: center; gap: 16px;">
            <img src="${targetMember.avatar}" alt="${targetMember.name}" style="width: 56px; height: 56px; border-radius: 50%; object-fit: cover; border: 3px solid var(--accent-blue);">
            <div>
              <h3 style="margin: 0; font-size: 1.25rem; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
                ${targetMember.name}
                <span class="mock-gold-badge" style="background: ${tier.badgeColor}; color: #ffffff; font-size: 0.72rem; padding: 2px 8px; border-radius: 12px;">
                  ${tier.name} Tier
                </span>
              </h3>
              ${!isEliteMember ? `
                <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 2px;">
                  ID: <code>${targetMember.id}</code> | Email: <strong>${targetMember.email}</strong>
                </div>
                <div style="font-size: 0.82rem; color: var(--accent-amber); margin-top: 4px; font-weight: 600;">
                  Partner Referral Code: ${targetMember.referralCode || 'ATS-REF-101'}
                </div>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- 4 Metric Cards for this Member -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-top: 18px;">
          <div style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 12px 14px; border-radius: var(--radius-sm);">
            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">SUBMITTED INVITES</div>
            <div style="font-size: 1.2rem; font-weight: 800; color: var(--text-primary); margin-top: 2px;">
              ${memberInvites.length} Total
            </div>
          </div>

          <div style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 12px 14px; border-radius: var(--radius-sm); position: relative;">
            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; display: flex; justify-content: space-between; align-items: center;">
              TOTAL ACCUMULATED UNITS
              <button class="btn btn-secondary btn-xs btn-adjust-units" data-id="${targetMember.id}" style="padding: 2px 6px; font-size: 0.7rem; border-radius: 4px;" title="Adjust Units">
                <i class="fas fa-edit"></i> Edit
              </button>
            </div>
            <div style="font-size: 1.2rem; font-weight: 800; color: var(--accent-purple); margin-top: 2px;">
              ${Number(targetMember.totalUnits || 0).toFixed(2)} Units
            </div>
          </div>
        </div>
      </div>

      <!-- Invites & Enrollments Table -->
      <div style="margin-top: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <h4 style="margin: 0; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
            Submitted Enrollments & Verification Registry
          </h4>
          <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">${memberInvites.length} Records Scoped to Code [${targetMember.id}]</span>
        </div>

        <div class="table-responsive" style="max-height: 340px; overflow-y: auto;">
          <table class="custom-table" style="width: 100%; font-size: 0.8rem;">
            <thead>
              <tr>
                <th>ID</th>
                <th>Participant</th>
                <th>Email / Phone</th>
                <th>School / Company</th>
                <th>Program / Course</th>
                <th>Payment Fee</th>
                <th>Payment Made</th>
                <th>Verification</th>
                <th>Units</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${memberInvites.length === 0 ? `
                <tr><td colspan="10" style="text-align: center; color: var(--text-muted); padding: 24px;">No invites or enrollments submitted yet by this Elite Member.</td></tr>
              ` : memberInvites.map(i => {
                const enr = (db.data.enrollments || []).find(e => String(e.id) === String(i.id));
                const paidAmt = enr ? enr.paymentMade : (i.enrollmentStatus === 'Enrolled' ? 4500 : 0);
                const feeAmt = enr ? enr.trainingFee : 4500;
                const unitsEarned = enr ? enr.unitsEarned : (paidAmt / 4500);

                return `
                  <tr>
                    <td><code>${i.id}</code></td>
                    <td><strong>${i.participantName}</strong></td>
                    <td><div style="font-size: 0.75rem; color: var(--text-secondary);">${i.email}</div></td>
                    <td>${i.schoolCompany || '-'}</td>
                    <td>${i.courseName || '-'}</td>
                    <td><strong>${formatPHP(feeAmt)}</strong></td>
                    <td><strong style="color: var(--accent-emerald);">${formatPHP(paidAmt)}</strong></td>
                    <td>
                      <select class="form-control select-verify-status" data-id="${i.id}" style="padding: 2px 6px; font-size: 0.78rem; font-weight: 700; height: 28px;">
                        <option value="Pending" ${i.verificationStatus === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Verified" ${i.verificationStatus === 'Verified' ? 'selected' : ''}>Verified</option>
                        <option value="Rejected" ${i.verificationStatus === 'Rejected' ? 'selected' : ''}>Rejected</option>
                      </select>
                    </td>
                    <td><span class="unit-badge" style="font-size: 0.75rem;">+${unitsEarned} Units</span></td>
                    <td>
                      <button class="btn btn-secondary btn-xs btn-edit-payment" data-id="${i.id}" style="padding: 3px 8px; font-size: 0.72rem;">
                        <i class="fas fa-edit"></i> Edit Payment
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Bind dropdown handlers inside modal
    modalBody.querySelectorAll('.select-verify-status').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const invId = sel.getAttribute('data-id');
        const newStatus = e.target.value;
        db.updateInviteVerification(invId, newStatus);
        openInspectModal(memId);
        renderManagementOverview(container, role);
      });
    });

    // Bind Edit Payment buttons inside modal
    modalBody.querySelectorAll('.btn-edit-payment').forEach(btn => {
      btn.addEventListener('click', () => {
        const invId = btn.getAttribute('data-id');
        const enr = (db.data.enrollments || []).find(e => String(e.id) === String(invId));
        const currentPaid = enr ? enr.paymentMade : 0;
        const currentFee = enr ? enr.trainingFee : 4500;
        const targetName = enr ? enr.participantName : 'Participant';

        const val = prompt(`Enter updated Payment Amount Made for ${targetName} (Total Investment Fee: ${formatPHP(currentFee)}):`, currentPaid);
        if (val !== null && !isNaN(parseFloat(val))) {
          if (enr) {
            db.updateEnrollmentPayment(enr.id, parseFloat(val));
          }
          openInspectModal(memId);
          renderManagementOverview(container, role);
        }
      });
    });

    // Bind Units adjust button
    const btnAdjUnits = modalBody.querySelector('.btn-adjust-units');
    if (btnAdjUnits) {
      btnAdjUnits.addEventListener('click', () => {
        openAdjustUnitsModal(targetMember.id);
      });
    }

    modal.classList.add('active');
  }

  // Function to open Unit History Audit Trail Ledger Modal
  function openAdjustUnitsModal(memId) {
    const member = db.data.members.find(m => m.id === memId);
    if (!member) return;

    let unitsModal = document.querySelector('#modal-adjust-units');
    if (!unitsModal) {
      const modalDiv = document.createElement('div');
      modalDiv.className = 'modal-overlay';
      modalDiv.id = 'modal-adjust-units';
      modalDiv.innerHTML = `
        <div class="modal-content modal-lg">
          <div class="modal-header">
            <h3>Total Accumulated Units Audit Trail</h3>
            <button class="modal-close" id="close-modal-units">&times;</button>
          </div>
          <div id="modal-units-body"></div>
        </div>
      `;
      document.body.appendChild(modalDiv);
      unitsModal = modalDiv;
    }

    const unitsBody = unitsModal.querySelector('#modal-units-body');
    const closeBtn = unitsModal.querySelector('#close-modal-units');
    if (closeBtn) closeBtn.onclick = () => unitsModal.classList.remove('active');

    const storageKey = `atsoca_unit_ledger_${member.id}`;
    let ledger = [];
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) ledger = JSON.parse(raw);
    } catch (e) {
      ledger = [];
    }

    unitsBody.innerHTML = `
      <div style="background: var(--box-inner-bg); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 18px; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div>
            <h4 style="margin: 0; font-size: 1.1rem; color: var(--text-primary);">${member.name} (Code: [${member.id}])</h4>
            <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px;">Email: ${member.email}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Current Balance</div>
            <div style="font-size: 1.5rem; font-weight: 800; color: var(--accent-purple);">${Number(member.totalUnits || 0).toFixed(2)} Units</div>
          </div>
        </div>
      </div>

      <!-- Add / Deduct Adjustment Form -->
      <div style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 16px; border-radius: var(--radius-md); margin-bottom: 20px;">
        <h5 style="margin: 0 0 12px 0; color: var(--text-primary);">New Unit Adjustment</h5>
        <div style="display: grid; grid-template-columns: 140px 140px 1fr auto; gap: 12px; align-items: flex-end;">
          <div>
            <label style="display: block; font-size: 0.75rem; color: var(--text-muted); font-weight: 700; margin-bottom: 4px;">Action</label>
            <select id="adj-type" class="form-control" style="padding: 6px 10px; font-size: 0.85rem; font-weight: 700;">
              <option value="add">Add (+ Units)</option>
              <option value="deduct">Deduct (- Units)</option>
            </select>
          </div>
          <div>
            <label style="display: block; font-size: 0.75rem; color: var(--text-muted); font-weight: 700; margin-bottom: 4px;">Amount (Units)</label>
            <input type="number" id="adj-amount" class="form-control" step="0.01" min="0.01" value="1.00" style="padding: 6px 10px; font-size: 0.85rem; font-weight: 700;">
          </div>
          <div>
            <label style="display: block; font-size: 0.75rem; color: var(--text-muted); font-weight: 700; margin-bottom: 4px;">Reason / Note</label>
            <input type="text" id="adj-note" class="form-control" placeholder="e.g., Manual bonus credit for August" style="padding: 6px 10px; font-size: 0.85rem;">
          </div>
          <div>
            <button class="btn btn-primary" id="btn-save-unit-adj" style="padding: 8px 16px; font-weight: 700; font-size: 0.85rem;">
              Apply Adjustment
            </button>
          </div>
        </div>
      </div>

      <!-- Chronological Audit Trail History Table -->
      <h5 style="margin: 0 0 10px 0; color: var(--text-primary);">Chronological Unit Ledger (Audit Trail)</h5>
      <div class="table-responsive" style="max-height: 220px; overflow-y: auto;">
        <table class="custom-table" style="width: 100%; font-size: 0.82rem;">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Previous Units</th>
              <th>Adjustment Made</th>
              <th>New Balance</th>
              <th>Reason / Note</th>
            </tr>
          </thead>
          <tbody>
            ${ledger.length === 0 ? `
              <tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 20px;">No manual unit adjustments recorded yet for this member.</td></tr>
            ` : ledger.map(entry => `
              <tr>
                <td><small>${entry.timestamp}</small></td>
                <td>${entry.prevUnits} Units</td>
                <td>
                  <span class="status-pill ${entry.adjustment.startsWith('+') ? 'status-Verified' : 'status-Rejected'}" style="font-size: 0.75rem; font-weight: 700;">
                    ${entry.adjustment}
                  </span>
                </td>
                <td><strong>${entry.newBalance} Units</strong></td>
                <td><small>${entry.note || 'N/A'}</small></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    unitsModal.classList.add('active');

    const btnSave = unitsModal.querySelector('#btn-save-unit-adj');
    if (btnSave) {
      btnSave.onclick = () => {
        const type = unitsModal.querySelector('#adj-type').value;
        const amt = parseFloat(unitsModal.querySelector('#adj-amount').value);
        const note = unitsModal.querySelector('#adj-note').value.trim() || 'Manual Unit Adjustment';

        if (isNaN(amt) || amt <= 0) {
          alert('Please enter a valid unit adjustment amount.');
          return;
        }

        const prevUnits = Number(member.totalUnits || 0);
        const newBalance = type === 'add' ? Number((prevUnits + amt).toFixed(2)) : Number(Math.max(0, prevUnits - amt).toFixed(2));
        const adjStr = (type === 'add' ? '+' : '-') + amt.toFixed(2) + ' Units';

        db.updateMemberUnitsAndFees(member.id, newBalance, member.availableForRelease);

        const entry = {
          timestamp: new Date().toLocaleString(),
          prevUnits: prevUnits.toFixed(2),
          adjustment: adjStr,
          newBalance: newBalance.toFixed(2),
          note: note
        };

        ledger.unshift(entry);
        localStorage.setItem(storageKey, JSON.stringify(ledger));

        openAdjustUnitsModal(memId);
        if (document.querySelector('#modal-inspect-account')?.classList.contains('active')) {
          openInspectModal(memId);
        }
        renderManagementOverview(container, role);
      };
    }
  }
}
