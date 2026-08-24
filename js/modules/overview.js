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

  const totalInvites = invites.length;
  const monthlyInvites = invites.filter(i => i && i.dateSubmitted && i.dateSubmitted.startsWith('2026-08')).length;
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

    <!-- 1. Key Metric Stat Cards -->
    <div class="mock-grid-4" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px;">
      <div class="mock-stat-card" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em;">TOTAL ELITES REGISTERED</div>
          <div style="font-size: 2.1rem; font-weight: 900; color: var(--text-primary); margin: 4px 0;">${totalMembers}</div>
          <div style="font-size: 0.78rem; color: #0284c7; font-weight: 600;">Active Accounts</div>
        </div>
        <div style="background: rgba(2, 132, 199, 0.12); color: #0284c7; width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.25rem;">
          <i class="fas fa-users"></i>
        </div>
      </div>

      <div class="mock-stat-card" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em;">TOTAL SYSTEM INVITES</div>
          <div style="font-size: 2.1rem; font-weight: 900; color: var(--text-primary); margin: 4px 0;">${totalInvites}</div>
          <div style="font-size: 0.78rem; color: var(--text-muted); font-weight: 600;">${pendingInvites} Pending Verification</div>
        </div>
        <div style="background: rgba(2, 132, 199, 0.12); color: #0284c7; width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.25rem;">
          <i class="fas fa-paper-plane"></i>
        </div>
      </div>

      <div class="mock-stat-card" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em;">VERIFIED & ENROLLED</div>
          <div style="font-size: 2.1rem; font-weight: 900; color: var(--text-primary); margin: 4px 0;">${verifiedInvites} / ${enrolledInvites}</div>
          <div style="font-size: 0.78rem; color: var(--text-muted); font-weight: 600;">Verified / Enrolled</div>
        </div>
        <div style="background: rgba(2, 132, 199, 0.12); color: #0284c7; width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.25rem;">
          <i class="fas fa-check-circle"></i>
        </div>
      </div>

      <div class="mock-stat-card" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em;">ACCUMULATED UNITS</div>
          <div style="font-size: 2.1rem; font-weight: 900; color: var(--text-primary); margin: 4px 0;">${totalUnits.toFixed(2)}</div>
          <div style="font-size: 0.78rem; color: var(--text-muted); font-weight: 600;">1 Unit = ₱4,500</div>
        </div>
        <div style="background: rgba(2, 132, 199, 0.12); color: #0284c7; width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.25rem;">
          <i class="fas fa-award"></i>
        </div>
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
              <th>VERIFIED / ENROLLED</th>
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
                    <strong style="font-size: 0.88rem;">${mInvites.length} Invites</strong>
                    ${mPending > 0 ? `<span style="background: #e0f2fe; color: #0284c7; font-size: 0.72rem; padding: 2px 8px; border-radius: 10px; margin-left: 6px; font-weight: 700;">${mPending} Pending</span>` : ''}
                  </td>
                  <td>
                    <span style="font-size: 0.82rem; color: var(--text-primary); font-weight: 600;">✓ ${mVerified} Verified</span> / 
                    <span style="font-size: 0.82rem; color: var(--text-muted);">${mEnrolled} Enrolled</span>
                  </td>
                  <td><strong>${Number(m.totalUnits || 0).toFixed(2)} Units</strong></td>
                  <td><strong style="color: #0284c7;">₱${(m.availableForRelease || 0).toLocaleString()}</strong></td>
                  <td style="text-align: right;">
                    <div style="display: flex; justify-content: flex-end; gap: 6px;">
                      <button class="btn btn-secondary btn-xs btn-export-member-data" data-id="${m.id}" style="background: #e0f2fe; color: #0284c7; border: none; font-size: 0.72rem; font-weight: 700; padding: 5px 10px; border-radius: 6px;">
                        <i class="fas fa-file-export"></i> Export Data
                      </button>
                      <button class="btn btn-secondary btn-xs btn-view-member-portfolio" data-id="${m.id}" style="background: #e0f2fe; color: #0284c7; border: none; font-size: 0.72rem; font-weight: 700; padding: 5px 10px; border-radius: 6px;">
                        <i class="fas fa-folder"></i> Portfolio
                      </button>
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

  // Handle Export Data button in matrix table
  container.querySelectorAll('.btn-export-member-data').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const memId = btn.getAttribute('data-id');
      const reportsTab = document.querySelector('[data-tab="reports"]');
      if (reportsTab) reportsTab.click();
    });
  });

  // Handle Portfolio button in matrix table
  container.querySelectorAll('.btn-view-member-portfolio').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const memId = btn.getAttribute('data-id');
      openInspectModal(memId);
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

      <!-- Invites & Enrollments Table for Verification (12-Column Schema) -->
      <div style="margin-top: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <h4 style="margin: 0; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-list-check" style="color: var(--accent-amber);"></i> Submitted Enrollments & Verification Registry
          </h4>
          <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">${memberInvites.length} Records Scoped to Code [${targetMember.id}]</span>
        </div>

        <div class="table-responsive" style="max-height: 340px; overflow-y: auto;">
          <table class="custom-table" style="width: 100%; font-size: 0.82rem;">
            <thead>
              <tr>
                <th>Respondent ID</th>
                <th>Participant Name</th>
                <th>Duplicate Checker</th>
                <th>School / Company</th>
                <th>Training Program</th>
                <th>Referrer</th>
                <th>Unit Accumulation</th>
                <th>Investment Fee</th>
                <th>Payment Made</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${memberInvites.length === 0 ? `
                <tr><td colspan="12" style="text-align: center; color: var(--text-muted); padding: 28px;">No enrollment / invite records found for this Elite Member yet.</td></tr>
              ` : memberInvites.map(inv => {
                const enrRecord = (db.data.enrollments || []).find(e => e.id === inv.id || e.id === `ENR-${inv.id}`) || inv;
                const isDup = inv.duplicateChecker === 'DUPLICATE' || String(inv.duplicateChecker).toUpperCase().includes('DUP');
                const unitsEarned = Number(enrRecord.unitsEarned || ((enrRecord.paymentMade || 0) / 4500)).toFixed(2);
                const fee = Number(enrRecord.investmentFee || inv.investmentFee || 4500);
                const paid = Number(enrRecord.paymentMade || inv.paymentMade || 0);
                const bal = Math.max(0, fee - paid);
                const payStatus = enrRecord.paymentStatus || inv.paymentStatus || (paid >= fee ? 'Fully Paid' : (paid > 0 ? 'Partial' : 'Unpaid'));

                return `
                  <tr>
                    <td><code>${inv.id}</code></td>
                    <td><strong>${inv.inviteName || inv.participantName}</strong></td>
                    <td>
                      <span class="status-pill ${isDup ? 'status-Rejected' : 'status-Verified'}" style="font-size: 0.72rem; padding: 2px 8px;">
                        ${isDup ? 'DUPLICATE' : 'UNIQUE'}
                      </span>
                    </td>
                    <td>${inv.schoolCompany || 'N/A'}</td>
                    <td><small>${inv.trainingType}</small></td>
                    <td>${inv.referrerName || targetMember.name}</td>
                    <td><span class="unit-badge" style="font-size: 0.75rem;"><i class="fas fa-star"></i> +${unitsEarned} Units</span></td>
                    <td><strong>${formatPHP(fee)}</strong></td>
                    <td><span style="color: var(--accent-emerald); font-weight: 700;">${formatPHP(paid)}</span></td>
                    <td><span style="color: ${bal > 0 ? 'var(--accent-rose)' : 'var(--text-muted)'}; font-weight: 600;">${formatPHP(bal)}</span></td>
                    <td><span class="status-pill status-${payStatus.replace(/\s+/g, '')}">${payStatus}</span></td>
                    <td>
                      <button class="btn btn-secondary btn-xs btn-edit-inspect-pay" data-id="${enrRecord.id || inv.id}" style="padding: 3px 8px; font-size: 0.72rem;">
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

    modal.classList.add('active');

    // Bind Edit Payment action triggers inside verification table
    modalBody.querySelectorAll('.btn-edit-inspect-pay').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-id');
        const enr = (db.data.enrollments || []).find(e => e.id === targetId || e.id === `ENR-${targetId}`);
        const currentPaid = enr ? enr.paymentMade : 0;
        const currentFee = enr ? enr.investmentFee : 4500;
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

    // Bind Units adjust button to open Unit History Audit Trail Ledger Modal
    const btnAdjUnits = modalBody.querySelector('.btn-adjust-units');
    if (btnAdjUnits) {
      btnAdjUnits.addEventListener('click', () => {
        openAdjustUnitsModal(targetMember.id);
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
            <h3><i class="fas fa-history" style="color: var(--accent-purple);"></i> Total Accumulated Units Audit Trail</h3>
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
        <h5 style="margin: 0 0 12px 0; color: var(--text-primary);"><i class="fas fa-plus-minus" style="color: var(--accent-blue);"></i> New Unit Adjustment</h5>
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
      <h5 style="margin: 0 0 10px 0; color: var(--text-primary);"><i class="fas fa-list-ul" style="color: var(--accent-amber);"></i> Chronological Unit Ledger (Audit Trail)</h5>
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
