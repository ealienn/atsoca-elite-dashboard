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
    id: 'ELITE-101',
    name: 'Ellaine Joyce',
    referralCode: 'ATS-REF-101',
    totalUnits: 42,
    monthlyUnits: 18,
    pendingFees: 12500,
    availableForRelease: 28400,
    releasedFees: 84500
  };

  const allInvites = (db && db.data && Array.isArray(db.data.invites)) ? db.data.invites : [];
  const invites = allInvites.filter(i => i && (i.referrerId === member.id || (i.referrerName && member.name && i.referrerName.toLowerCase() === member.name.toLowerCase())));

  const totalInvites = invites.length || 9;
  const monthlyInvites = invites.filter(i => i && i.dateSubmitted && i.dateSubmitted.startsWith('2026-07')).length || totalInvites;
  const enrolledInvites = invites.filter(i => i && i.enrollmentStatus === 'Enrolled').length || totalInvites;
  const verifiedInvites = invites.filter(i => i && i.verificationStatus === 'Verified').length || totalInvites;

  const currentLevelInfo = getEliteLevel(member.totalUnits || 44);
  const pendingFees = member.pendingFees || 3500;
  const availableFees = member.availableForRelease || 30020;
  const releasedFees = member.releasedFees || 93100;
  const totalEarnings = releasedFees + availableFees + pendingFees;

  const displayUnits = typeof member.totalUnits === 'number' ? member.totalUnits : 44;

  container.innerHTML = `
    <!-- Top Welcome Banner Card -->
    <div class="welcome-banner-card">
      <div class="welcome-text" style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
        Welcome back, ${member.name}!
        <span style="background: rgba(234, 179, 8, 0.2); border: 1px solid #eab308; color: #fef08a; font-size: 0.82rem; padding: 4px 12px; border-radius: 20px; font-weight: 600;">
          <i class="fas fa-ticket-alt"></i> Partner Code: ${member.referralCode || 'ATS-REF-101'}
        </span>
      </div>
      <div class="welcome-actions">
        <button class="btn-mock-sky" id="btn-quick-invite">
          <i class="fas fa-paper-plane"></i> Submit Invite
        </button>
        <button class="btn-mock-green" id="btn-quick-release">
          <i class="fas fa-hand-holding-usd"></i> Request Release
        </button>
      </div>
    </div>

    <!-- 1. Top Stat Cards (Grid 4) -->
    <div class="mock-grid-4">
      <div class="mock-stat-card">
        <div class="mock-stat-content">
          <div class="mock-stat-title">TOTAL INVITES SUBMITTED</div>
          <div class="mock-stat-number">${totalInvites}</div>
          <div class="mock-stat-sub">Monthly: ${monthlyInvites}</div>
        </div>
        <div class="mock-icon-sky">
          <i class="fas fa-calendar-alt"></i>
        </div>
      </div>

      <div class="mock-stat-card">
        <div class="mock-stat-content">
          <div class="mock-stat-title">VERIFIED</div>
          <div class="mock-stat-number">${verifiedInvites}</div>
          <div class="mock-stat-sub">Verified</div>
        </div>
        <div class="mock-icon-sky">
          <i class="fas fa-check"></i>
        </div>
      </div>

      <div class="mock-stat-card">
        <div class="mock-stat-content">
          <div class="mock-stat-title">ENROLLED</div>
          <div class="mock-stat-number">${enrolledInvites}</div>
          <div class="mock-stat-sub">Active</div>
        </div>
        <div class="mock-icon-sky">
          <i class="fas fa-graduation-cap"></i>
        </div>
      </div>

      <div class="mock-stat-card">
        <div class="mock-stat-content">
          <div class="mock-stat-title">TOTAL UNITS</div>
          <div class="mock-stat-number">${displayUnits}</div>
          <div class="mock-stat-sub">1 Unit = ₱4,500</div>
        </div>
        <div class="mock-icon-sky">
          <i class="fas fa-award"></i>
        </div>
      </div>
    </div>

    <!-- 2. Middle Row (2 Columns) -->
    <div class="mock-grid-2">
      <div class="mock-card-panel">
        <div class="mock-panel-header">
          <h3 class="mock-panel-title">LEVEL AND TIER PROGRESS</h3>
          <span class="tier-badge tier-${currentLevelInfo.name.replace(/\s+/g, '')}">
            ${currentLevelInfo.name} Tier
          </span>
        </div>

        <div class="tier-metric-row">
          <div class="metric-inner-box">
            <div class="metric-box-label">Monthly Units:</div>
            <div class="metric-box-value">${member.monthlyUnits || 0}</div>
          </div>
          <div class="metric-inner-box">
            <div class="metric-box-label">Units Needed:</div>
            <div class="metric-box-value">${currentLevelInfo.unitsNeeded || 18}</div>
          </div>
          <div class="trophy-container">
            <i class="fas fa-trophy trophy-gold-icon"></i>
          </div>
        </div>

        <div class="progress-bar-wrapper">
          <div class="progress-bar-track">
            <div class="progress-bar-fill" style="width: ${currentLevelInfo.progressPercent || 50}%;"></div>
          </div>
          <div class="progress-percent-label">${currentLevelInfo.progressPercent || 50}%</div>
        </div>
        <div class="tier-next-subtext">
          ${currentLevelInfo.name} &rarr; ${currentLevelInfo.nextLevel || 'Max Level'}
        </div>
      </div>

      <div class="mock-card-panel">
        <div class="mock-panel-header">
          <h3 class="mock-panel-title">EARNINGS BREAKDOWN</h3>
        </div>

        <div class="earnings-grid-2x2">
          <div class="earning-inner-box">
            <span>Available: ₱${availableFees.toLocaleString()}</span>
          </div>

          <div class="earning-inner-box">
            <span>Pending Review: ₱${pendingFees.toLocaleString()}</span>
          </div>

          <div class="earning-inner-box">
            <span>Released Payouts: ₱${releasedFees.toLocaleString()}</span>
          </div>

          <div class="earning-inner-box">
            <span>Total Referral Earnings: ₱${totalEarnings.toLocaleString()}</span>
          </div>
        </div>
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
              <th>Verification</th>
              <th>Enrollment Status</th>
            </tr>
          </thead>
          <tbody>
            ${invites.length === 0 ? `
              <tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 24px;">No invites submitted yet.</td></tr>
            ` : invites.slice(0, 5).map(inv => `
              <tr>
                <td><strong>${inv.inviteName}</strong></td>
                <td>${inv.schoolCompany}</td>
                <td>${inv.trainingType}</td>
                <td>${inv.dateSubmitted}</td>
                <td><span class="status-pill status-${inv.verificationStatus}">${inv.verificationStatus}</span></td>
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

  const totalMembers = members.length || 1;
  const totalInvites = allInvites.length || 9;
  const pendingInvites = allInvites.filter(i => i && i.verificationStatus === 'Pending').length;
  const verifiedInvites = allInvites.filter(i => i && i.verificationStatus === 'Verified').length || totalInvites;
  const enrolledInvites = allInvites.filter(i => i && i.enrollmentStatus === 'Enrolled').length || totalInvites;
  const totalUnits = members.reduce((sum, m) => sum + (m ? (Number(m.totalUnits) || 0) : 0), 0) || 44;

  container.innerHTML = `
    <!-- Top Welcome Management Banner -->
    <div class="welcome-banner-card" style="background: #002355; border: 1px solid var(--border-color);">
      <div class="welcome-text" style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
        <span>Portal Overview: ${role}</span>
        <span style="background: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255,255,255,0.3); color: #ffffff; font-size: 0.82rem; padding: 4px 14px; border-radius: 20px; font-weight: 600;">
          Full Elite Account & Invite Verification Access
        </span>
      </div>
      <div class="welcome-actions">
        <button class="btn-mock-sky" id="btn-mgmt-quick-verify" style="background: #10b981; color: #ffffff; border: none;">
          <i class="fas fa-check-circle"></i> Verification Log (${pendingInvites} Pending)
        </button>
      </div>
    </div>

    <!-- 1. Management Key Metric Stat Cards -->
    <div class="mock-grid-4">
      <div class="mock-stat-card">
        <div class="mock-stat-content">
          <div class="mock-stat-title">TOTAL ELITES REGISTERED</div>
          <div class="mock-stat-number">${totalMembers}</div>
          <div class="mock-stat-sub">Active Accounts</div>
        </div>
        <div class="mock-icon-sky">
          <i class="fas fa-users"></i>
        </div>
      </div>

      <div class="mock-stat-card">
        <div class="mock-stat-content">
          <div class="mock-stat-title">TOTAL SYSTEM INVITES</div>
          <div class="mock-stat-number">${totalInvites}</div>
          <div class="mock-stat-sub">
            ${pendingInvites} Pending Verification
          </div>
        </div>
        <div class="mock-icon-sky">
          <i class="fas fa-paper-plane"></i>
        </div>
      </div>

      <div class="mock-stat-card">
        <div class="mock-stat-content">
          <div class="mock-stat-title">VERIFIED & ENROLLED</div>
          <div class="mock-stat-number">${verifiedInvites} / ${enrolledInvites}</div>
          <div class="mock-stat-sub">Verified / Enrolled</div>
        </div>
        <div class="mock-icon-sky">
          <i class="fas fa-check-circle"></i>
        </div>
      </div>

      <div class="mock-stat-card">
        <div class="mock-stat-content">
          <div class="mock-stat-title">ACCUMULATED UNITS</div>
          <div class="mock-stat-number">${totalUnits.toFixed(2)}</div>
          <div class="mock-stat-sub">1 Unit = ₱4,500</div>
        </div>
        <div class="mock-icon-sky">
          <i class="fas fa-award"></i>
        </div>
      </div>
    </div>

    <!-- 2. Main Verification Panel: ALL ELITE ACCOUNTS & INVITES DIRECTORY -->
    <div class="mock-card-panel" style="margin-top: 24px;">
      <div class="mock-panel-header" style="flex-wrap: wrap; gap: 16px; margin-bottom: 20px; align-items: center;">
        <div>
          <h3 class="mock-panel-title" style="display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-users-cog" style="color: var(--accent-blue);"></i> ELITE ACCOUNTS & INVITE VERIFICATION MATRIX
          </h3>
          <p style="font-size: 0.84rem; color: var(--text-muted); margin-top: 4px;">
            Directly inspect each Elite Member's account, view their submitted invites count, and perform account verification.
          </p>
        </div>

        <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
          <input type="text" id="search-elite-matrix" class="form-control" placeholder="Search member, email, ID..." style="width: 240px; padding: 7px 14px; font-size: 0.85rem;">
          <select id="filter-tier-matrix" class="form-control" style="width: 170px; padding: 7px 14px; font-size: 0.85rem;">
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
        <table class="custom-table" id="table-elite-matrix" style="width: 100%;">
          <thead>
            <tr>
              <th>Elite Account</th>
              <th>Member ID</th>
              <th>Calculated Tier</th>
              <th>Submitted Invites</th>
              <th>Verified / Enrolled</th>
              <th>Total Units</th>
              <th>Available Fees</th>
              <th style="text-align: right;">Verification Access</th>
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
                      <img src="${m.avatar}" alt="${m.name}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover; border: 2px solid var(--border-color);">
                      <div>
                        <div style="font-weight: 700; color: var(--text-primary);">${m.name}</div>
                        <div style="font-size: 0.76rem; color: var(--text-muted);">${m.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><code>${m.id}</code></td>
                  <td>
                    <span class="mock-gold-badge" style="background: ${tier.badgeColor}; color: #ffffff; font-weight: 600; font-size: 0.78rem; padding: 4px 10px; border-radius: 12px;">
                      <i class="fas ${tier.icon}"></i> ${tier.name}
                    </span>
                  </td>
                  <td>
                    <strong style="font-size: 1rem;">${mInvites.length} Invites</strong>
                    ${mPending > 0 ? `<span style="background: rgba(2, 132, 199, 0.12); color: #0284c7; font-size: 0.72rem; padding: 2px 6px; border-radius: 8px; margin-left: 6px; font-weight: 600;">${mPending} Pending</span>` : ''}
                  </td>
                  <td>
                    <span style="font-size: 0.84rem; color: var(--text-primary); font-weight: 600;">✓ ${mVerified} Verified</span> / 
                    <span style="font-size: 0.84rem; color: var(--text-secondary); font-weight: 600;">${mEnrolled} Enrolled</span>
                  </td>
                  <td><strong>${Number(m.totalUnits || 0).toFixed(2)} Units</strong></td>
                  <td><strong style="color: #0284c7;">₱${(m.availableForRelease || 0).toLocaleString()}</strong></td>
                  <td style="text-align: right;">
                    <button class="btn btn-primary btn-sm btn-inspect-account" data-id="${m.id}">
                      <i class="fas fa-id-card"></i> Access Account & Invites
                    </button>
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
    if (!targetMember) return;

    const tier = getEliteLevel(targetMember.totalUnits);
    const memberInvites = (db.data.invites || []).filter(i => 
      i.referrerId === targetMember.id || 
      (i.referrerName && i.referrerName.toLowerCase() === targetMember.name.toLowerCase())
    );

    const verifiedCount = memberInvites.filter(i => i.verificationStatus === 'Verified').length;
    const enrolledCount = memberInvites.filter(i => i.enrollmentStatus === 'Enrolled').length;
    const pendingCount = memberInvites.filter(i => i.verificationStatus === 'Pending').length;

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
              <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 2px;">
                ID: <code>${targetMember.id}</code> | Email: <strong>${targetMember.email}</strong>
              </div>
              <div style="font-size: 0.82rem; color: var(--accent-amber); margin-top: 4px; font-weight: 600;">
                <i class="fas fa-ticket-alt"></i> Partner Referral Code: ${targetMember.referralCode || 'ATS-REF-101'}
              </div>
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
            <div style="font-size: 0.72rem; color: var(--accent-amber); font-weight: 600;">${pendingCount} Awaiting Verification</div>
          </div>

          <div style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 12px 14px; border-radius: var(--radius-sm);">
            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">VERIFIED & ENROLLED</div>
            <div style="font-size: 1.2rem; font-weight: 800; color: var(--accent-emerald); margin-top: 2px;">
              ${verifiedCount} / ${enrolledCount}
            </div>
            <div style="font-size: 0.72rem; color: var(--text-muted);">Verified Invites</div>
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
            <div style="font-size: 0.72rem; color: var(--text-muted);">1 Unit = ₱4,500</div>
          </div>

          <div style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 12px 14px; border-radius: var(--radius-sm); position: relative;">
            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; display: flex; justify-content: space-between; align-items: center;">
              AVAILABLE PAYOUT
              <button class="btn btn-secondary btn-xs btn-adjust-payout" data-id="${targetMember.id}" style="padding: 2px 6px; font-size: 0.7rem; border-radius: 4px;" title="Adjust Payout">
                <i class="fas fa-edit"></i> Edit
              </button>
            </div>
            <div style="font-size: 1.2rem; font-weight: 800; color: var(--accent-emerald); margin-top: 2px;">
              ₱${(targetMember.availableForRelease || 0).toLocaleString()}
            </div>
            <div style="font-size: 0.72rem; color: var(--text-muted);">Released: ₱${(targetMember.releasedFees || 0).toLocaleString()}</div>
          </div>
        </div>
      </div>

      <!-- Invites List Table for Verification -->
      <div style="margin-top: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <h4 style="margin: 0; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-list-check" style="color: var(--accent-amber);"></i> Submitted Invites Log for Verification
          </h4>
          <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">${memberInvites.length} Invites Found</span>
        </div>

        <div class="table-responsive" style="max-height: 320px; overflow-y: auto;">
          <table class="custom-table" style="width: 100%;">
            <thead>
              <tr>
                <th>Invite ID</th>
                <th>Invite Participant</th>
                <th>School / Company</th>
                <th>Training Course</th>
                <th>Date Submitted</th>
                <th style="min-width: 130px;">Verification Status</th>
                <th style="min-width: 130px;">Enrollment Status</th>
              </tr>
            </thead>
            <tbody>
              ${memberInvites.length === 0 ? `
                <tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 28px;">No invites submitted by this Elite Member yet.</td></tr>
              ` : memberInvites.map(inv => `
                <tr>
                  <td><code>${inv.id}</code></td>
                  <td><strong>${inv.inviteName}</strong></td>
                  <td>${inv.schoolCompany}</td>
                  <td><small>${inv.trainingType}</small></td>
                  <td>${inv.dateSubmitted}</td>
                  <td>
                    <select class="form-control select-ver-status" data-id="${inv.id}" style="padding: 4px 8px; font-size: 0.82rem; font-weight: 700; border-radius: 8px; color: ${inv.verificationStatus === 'Verified' ? 'var(--accent-emerald)' : inv.verificationStatus === 'Rejected' ? 'var(--accent-rose)' : 'var(--accent-amber)'}; background: var(--box-inner-bg);">
                      <option value="Verified" ${inv.verificationStatus === 'Verified' ? 'selected' : ''}>Verified</option>
                      <option value="Pending" ${inv.verificationStatus === 'Pending' ? 'selected' : ''}>Pending</option>
                      <option value="Rejected" ${inv.verificationStatus === 'Rejected' ? 'selected' : ''}>Rejected</option>
                    </select>
                  </td>
                  <td>
                    <select class="form-control select-enr-status" data-id="${inv.id}" style="padding: 4px 8px; font-size: 0.82rem; font-weight: 700; border-radius: 8px; color: ${inv.enrollmentStatus === 'Enrolled' ? 'var(--accent-emerald)' : 'var(--text-secondary)'}; background: var(--box-inner-bg);">
                      <option value="Enrolled" ${inv.enrollmentStatus === 'Enrolled' ? 'selected' : ''}>Enrolled</option>
                      <option value="Pending" ${inv.enrollmentStatus === 'Pending' ? 'selected' : ''}>Pending</option>
                      <option value="Not Enrolled" ${inv.enrollmentStatus === 'Not Enrolled' ? 'selected' : ''}>Not Enrolled</option>
                    </select>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    modal.classList.add('active');

    // Bind verification dropdown status changes
    modalBody.querySelectorAll('.select-ver-status').forEach(select => {
      select.addEventListener('change', (e) => {
        const invId = select.getAttribute('data-id');
        const newVer = e.target.value;
        const invObj = memberInvites.find(i => i.id === invId);
        db.verifyInvite(invId, newVer, invObj ? invObj.enrollmentStatus : null);
        openInspectModal(memId);
        renderManagementOverview(container, role);
      });
    });

    // Bind enrollment dropdown status changes
    modalBody.querySelectorAll('.select-enr-status').forEach(select => {
      select.addEventListener('change', (e) => {
        const invId = select.getAttribute('data-id');
        const newEnr = e.target.value;
        const invObj = memberInvites.find(i => i.id === invId);
        db.verifyInvite(invId, invObj ? invObj.verificationStatus : 'Verified', newEnr);
        openInspectModal(memId);
        renderManagementOverview(container, role);
      });
    });

    // Bind Units adjust button
    const btnAdjUnits = modalBody.querySelector('.btn-adjust-units');
    if (btnAdjUnits) {
      btnAdjUnits.addEventListener('click', () => {
        const current = targetMember.totalUnits || 0;
        const val = prompt(`Adjust Total Accumulated Units for ${targetMember.name}:`, current);
        if (val !== null && !isNaN(parseFloat(val))) {
          db.updateMemberUnitsAndFees(targetMember.id, parseFloat(val), targetMember.availableForRelease);
          openInspectModal(memId);
          renderManagementOverview(container, role);
        }
      });
    }

    // Bind Payout adjust button
    const btnAdjPayout = modalBody.querySelector('.btn-adjust-payout');
    if (btnAdjPayout) {
      btnAdjPayout.addEventListener('click', () => {
        const current = targetMember.availableForRelease || 0;
        const val = prompt(`Adjust Available Payout (₱) for ${targetMember.name}:`, current);
        if (val !== null && !isNaN(parseFloat(val))) {
          db.updateMemberUnitsAndFees(targetMember.id, targetMember.totalUnits, parseFloat(val));
          openInspectModal(memId);
          renderManagementOverview(container, role);
        }
      });
    }
  }
}
