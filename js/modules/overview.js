/**
 * Dashboard Overview Module Component
 * Supports both Elite Member view & Management view
 * (Elite Manager, Finance, Administrator) with full access to inspect Elite accounts & verify invites.
 */
import { db } from '../dbState.js';
import { getEliteLevel } from '../matrixEngine.js';
import { openEditPaymentModal } from './enrollments.js';

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
    referralCode: '004',
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

    <!-- 1. Top Stat Cards (Grid 3 - Centered Minimal Layout) -->
    <div class="mock-grid-3" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-bottom: 24px;">
      <!-- Member Card 1: Invites Submitted -->
      <div class="mock-stat-card" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 14px; padding: 22px 18px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <div style="font-size: 0.72rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">TOTAL INVITES SUBMITTED</div>
        <div style="font-size: 2.3rem; font-weight: 900; color: var(--text-primary); line-height: 1;">${totalInvites}</div>
      </div>

      <!-- Member Card 2: Enrolled -->
      <div class="mock-stat-card" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 14px; padding: 22px 18px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <div style="font-size: 0.72rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">ENROLLED</div>
        <div style="font-size: 2.3rem; font-weight: 900; color: var(--text-primary); line-height: 1;">${enrolledInvites}</div>
      </div>

      <!-- Member Card 3: Total Units -->
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
              <th>ELITE CODE</th>
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
              const mInvites = allInvites.filter(i => i.referrerId === m.id || i.referrerId === m.referralCode || i.referrerId === m.eliteCode || (i.referrerName && i.referrerName.toLowerCase() === m.name.toLowerCase()));
              const mVerified = mInvites.filter(i => i.verificationStatus === 'Verified').length;
              const mEnrolled = mInvites.filter(i => i.enrollmentStatus === 'Enrolled').length;
              const mPending = mInvites.filter(i => i.verificationStatus === 'Pending').length;
              const assignedCode = m.referralCode || m.eliteCode || m.id;

              return `
                <tr data-member-id="${m.id}" data-tier="${tier.name}">
                  <td>
                    <div style="display: flex; align-items: center; gap: 12px;">
                      <img src="${typeof db.getMemberAvatar === 'function' ? db.getMemberAvatar(m) : (typeof window.getTierBadgeAsset === 'function' ? window.getTierBadgeAsset(tier.name) : 'assets/badges/badge_bronze.png')}" alt="${m.name}" class="tier-badge-img" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;" onerror="this.onerror=null; this.src='assets/logo_icon.png';">
                      <div>
                        <div style="font-weight: 800; color: var(--text-primary); font-size: 0.88rem;">${m.name}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">${m.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><code>${assignedCode}</code></td>
                  <td>
                    <span class="tier-badge tier-${tier.name.replace(/\s+/g, '')}" style="background: #fef3c7; color: #b45309; border: 1px solid #fde68a; font-weight: 700; font-size: 0.76rem; padding: 4px 12px; border-radius: 14px;">
                      <i class="fas ${tier.icon}"></i> ${tier.name}
                    </span>
                  </td>
                  <td>
                    <strong style="font-size: 0.88rem;">${mInvites.length} ${mInvites.length === 1 ? 'Invite' : 'Invites'}</strong>
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
          <h3 style="color: #002355; font-size: 1.2rem; font-weight: 800; margin: 0;">Elite Account & Invite Verification View</h3>
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
    btnCloseModal.addEventListener('click', () => {
      if (window.activeModalState) {
        window.activeModalState.inspectMemberId = null;
        if (window.activeModalState.activeModalIds) {
          window.activeModalState.activeModalIds.delete('modal-inspect-account');
        }
      }
      modal.classList.remove('active');
    });
  }

  container.querySelectorAll('.btn-inspect-account').forEach(btn => {
    btn.addEventListener('click', () => {
      const memId = btn.getAttribute('data-id');
      openInspectModal(memId);
    });
  });

  window.reopenInspectModal = function(memId) {
    openInspectModal(memId);
  };

  // Helper to normalize routing/referrer code to 3-digit format (e.g., "004", "005", "006")
  function normalizeCode(code) {
    if (!code) return '';
    const str = String(code).trim();
    const digits = str.replace(/\D/g, '');
    return digits ? digits.padStart(3, '0') : str.toLowerCase();
  }

  // Function to open and populate inspect account modal
  function openInspectModal(memId) {
    const targetMember = db.data.members.find(m => m.id === memId);
    if (!targetMember || !modal || !modalBody) return;

    window.activeModalState = window.activeModalState || {};
    window.activeModalState.inspectMemberId = memId;
    window.activeModalState.activeModalIds = window.activeModalState.activeModalIds || new Set();
    window.activeModalState.activeModalIds.add('modal-inspect-account');

    // 1. STRICT DATA ISOLATION & FILTERING LOGIC
    // Clear modal body DOM first to avoid any stale data leakage across account switches
    db.recalculateMemberUnits();
    modalBody.innerHTML = '';

    const targetCode = normalizeCode(targetMember.id);
    const targetNameLower = (targetMember.name || '').toLowerCase().trim();

    // Filter global invites strictly for this active Elite member
    const memberInvites = (db.data.invites || []).filter(i => {
      const iCode = normalizeCode(i.referrerId || i.eliteCode || i.referralCode);
      const nameMatch = i.referrerName && i.referrerName.toLowerCase().trim() === targetNameLower;
      return iCode === targetCode || nameMatch;
    });

    // Filter global enrollments strictly for this active Elite member
    const memberEnrollments = (db.data.enrollments || []).filter(e => {
      const eCode = normalizeCode(e.referrerId || e.eliteCode);
      const nameMatch = e.referrerName && e.referrerName.toLowerCase().trim() === targetNameLower;
      return eCode === targetCode || nameMatch;
    });

    // Summary Card Recomputations for this isolated subset
    const totalSubmittedInvites = memberInvites.length;
    const tier = getEliteLevel(targetMember.totalUnits);
    const totalAccumulatedUnits = Number(targetMember.totalUnits || 0).toFixed(2);
    const availablePayout = formatPHP(targetMember.availableForRelease || 0);

    modalBody.innerHTML = `
      <!-- Member Overview Header Box -->
      <div style="background: var(--box-inner-bg); border: 1px solid var(--box-inner-border); border-radius: var(--radius-md); padding: 20px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px;">
          <div style="display: flex; align-items: center; gap: 16px;">
            <img src="${typeof window.getTierBadgeAsset === 'function' ? window.getTierBadgeAsset(tier.name) : 'assets/badges/badge_bronze.png'}" alt="${targetMember.name}" class="tier-badge-img" style="width: 56px; height: 56px; border-radius: 50%; object-fit: contain; border: 3px solid #002355;" onerror="this.onerror=null; this.src='assets/logo_icon.png';">
            <div>
              <h3 style="margin: 0; font-size: 1.25rem; color: #002355; font-weight: 800; display: flex; align-items: center; gap: 8px;">
                ${targetMember.name}
                <span class="mock-gold-badge" style="background: ${tier.badgeColor}; color: #ffffff; font-size: 0.72rem; padding: 2px 8px; border-radius: 12px;">
                  ${tier.name} Tier
                </span>
              </h3>
            </div>
          </div>
        </div>

        <!-- 3 Recomputed Summary Cards (Strictly Isolated Subset) -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-top: 18px;">
          <div style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 16px 14px; border-radius: var(--radius-sm); text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 84px;">
            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em;">SUBMITTED INVITES</div>
            <div style="font-size: 1.3rem; font-weight: 800; color: var(--text-primary); margin-top: 6px;">
              ${totalSubmittedInvites} Records
            </div>
          </div>

          <div style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 16px 14px; border-radius: var(--radius-sm); text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 84px;">
            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em;">TOTAL ACCUMULATED UNITS</div>
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 6px;">
              <span style="font-size: 1.3rem; font-weight: 800; color: var(--text-primary);">${totalAccumulatedUnits} Units</span>
              <button class="btn btn-secondary btn-xs btn-adjust-units" data-id="${targetMember.id}" style="padding: 3px 8px; font-size: 0.72rem; border-radius: 6px; background: #002355; color: #ffffff; border: none; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;" title="Adjust Units">
                <i class="fas fa-edit"></i> Edit
              </button>
            </div>
          </div>

          <div style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 16px 14px; border-radius: var(--radius-sm); text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 84px;">
            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em;">AVAILABLE PAYOUT</div>
            <div style="font-size: 1.3rem; font-weight: 800; color: var(--text-primary); margin-top: 6px;">
              ${availablePayout}
            </div>
          </div>
        </div>
      </div>

      <!-- 2. AUDIT TABLE SCHEMA -->
      <div style="margin-top: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
          <h4 style="margin: 0; color: #002355; font-size: 1.05rem; font-weight: 800;">
            Submitted Enrollments Registry
          </h4>
        </div>

        <div class="table-responsive" style="max-height: 380px; overflow-y: auto;">
          <table class="custom-table" style="width: 100%; font-size: 0.82rem;">
            <thead>
              <tr>
                <th style="font-weight: 800; font-size: 0.78rem;">SUBMISSION ID</th>
                <th style="font-weight: 800; font-size: 0.78rem;">PARTICIPANT NAME</th>
                <th style="font-weight: 800; font-size: 0.78rem;">DUPLICATE CHECKER</th>
                <th style="font-weight: 800; font-size: 0.78rem;">ENROLLMENT STATUS</th>
                <th style="font-weight: 800; font-size: 0.78rem;">SCHOOL / COMPANY</th>
                <th style="font-weight: 800; font-size: 0.78rem;">TRAINING PROGRAM</th>
                <th style="font-weight: 800; font-size: 0.78rem;">TRAINING FEE</th>
                <th style="font-weight: 800; font-size: 0.78rem;">AMOUNT PAID</th>
                <th style="font-weight: 800; font-size: 0.78rem;">BALANCE</th>
                <th style="font-weight: 800; font-size: 0.78rem;">UNITS EARNED</th>
                <th style="font-weight: 800; font-size: 0.78rem;">PAYMENT STATUS</th>
                <th style="font-weight: 800; font-size: 0.78rem;">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              ${memberInvites.length === 0 ? `
                <tr>
                  <td colspan="12" style="text-align: center; color: #002355; font-weight: 600; padding: 24px;">
                    No invite or enrollment records found for Elite Member Code [${targetMember.id}].
                  </td>
                </tr>
              ` : memberInvites.map(inv => {
                const enr = memberEnrollments.find(e => String(e.id) === String(inv.id) || String(e.respondentId) === String(inv.respondentId || inv.id));
                const respId = inv.respondentId || String(inv.id).replace('INV-', '');
                const partName = inv.participantName || inv.inviteName || 'Participant';
                const dupChecker = inv.duplicateChecker || (enr ? enr.duplicateChecker : 'N/A') || 'N/A';
                const schoolComp = inv.schoolCompany || '-';
                const program = inv.trainingType || inv.courseName || inv.course || 'COSH SO2';

                const fee = enr ? Number(enr.investmentFee || 4500) : Number(inv.investmentFee || 4500);
                const paid = enr ? Number(enr.paymentMade || 0) : Number(inv.paymentMade || 0);
                const bal = enr ? Number(enr.balance !== undefined ? enr.balance : Math.max(0, fee - paid)) : Math.max(0, fee - paid);

                const enrollStatus = (enr && enr.enrollmentStatus) || inv.enrollmentStatus || 'Enrolled';
                const isEnrolled = String(enrollStatus).trim().toLowerCase() === 'enrolled';
                const unitsVal = isEnrolled ? Number(enr ? (enr.unitsEarned !== undefined ? enr.unitsEarned : (paid / 4500)) : (paid / 4500)).toFixed(2) : '0.00';

                let statusStr = 'Unpaid';
                if (enr && enr.paymentStatus) {
                  statusStr = enr.paymentStatus;
                } else if (paid >= fee && fee > 0) {
                  statusStr = 'Fully Paid';
                } else if (paid > 0) {
                  statusStr = 'Partial';
                }

                let badgeColor = '#002355';
                let badgeBg = '#e2e8f0';
                if (statusStr === 'Fully Paid') {
                  badgeColor = '#002355';
                  badgeBg = '#dbeafe';
                } else if (statusStr === 'Partial') {
                  badgeColor = '#002355';
                  badgeBg = '#e0f2fe';
                } else {
                  badgeColor = '#002355';
                  badgeBg = '#f1f5f9';
                }

                return `
                  <tr>
                    <td style="font-size: 0.82rem;"><code>${respId}</code></td>
                    <td style="font-size: 0.82rem;"><strong>${partName}</strong></td>
                    <td style="font-size: 0.82rem;"><span style="font-weight: 600;">${dupChecker}</span></td>
                    <td style="font-size: 0.82rem;">
                      <span class="status-pill status-${(enrollStatus || '').replace(/\s+/g, '')}">
                        ${enrollStatus}
                      </span>
                    </td>
                    <td style="font-size: 0.82rem;">${schoolComp}</td>
                    <td style="font-size: 0.82rem;"><span style="font-weight: 600;">${program}</span></td>
                    <td style="font-size: 0.82rem;"><strong>${formatPHP(fee)}</strong></td>
                    <td style="font-size: 0.82rem;"><strong>${formatPHP(paid)}</strong></td>
                    <td style="font-size: 0.82rem;"><strong>${formatPHP(bal)}</strong></td>
                    <td style="font-size: 0.82rem;"><strong>${unitsVal} Units</strong></td>
                    <td style="font-size: 0.82rem;">
                      <span class="status-pill status-${(statusStr || '').replace(/\s+/g, '')}">
                        ${statusStr}
                      </span>
                    </td>
                    <td style="font-size: 0.82rem;">
                      <button class="btn btn-secondary btn-xs btn-edit-payment" data-id="${inv.id}" data-enr-id="${enr ? enr.id : inv.id}" style="padding: 4px 10px; font-size: 0.75rem; font-weight: 700; border-radius: 6px; background: #002355; color: #ffffff; border: none;">
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

    // 3. SYNCHRONIZED EDIT ACTIONS
    modalBody.querySelectorAll('.btn-edit-payment').forEach(btn => {
      btn.addEventListener('click', () => {
        const invId = btn.getAttribute('data-id');
        const enrId = btn.getAttribute('data-enr-id') || invId;
        const targetId = enrId || invId;

        openEditPaymentModal(targetId, () => {
          openInspectModal(memId);
          renderManagementOverview(container, role);
        });
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

  window.reopenUnitsAdjustmentModal = function(memId) {
    openAdjustUnitsModal(memId);
  };

  // Function to open Unit History Audit Trail Ledger Modal
  function openAdjustUnitsModal(memId) {
    const member = db.data.members.find(m => m.id === memId);
    if (!member) return;

    window.activeModalState = window.activeModalState || {};
    window.activeModalState.unitsMemberId = memId;
    window.activeModalState.activeModalIds = window.activeModalState.activeModalIds || new Set();
    window.activeModalState.activeModalIds.add('modal-adjust-units');

    let unitsModal = document.querySelector('#modal-adjust-units');
    if (!unitsModal) {
      const modalDiv = document.createElement('div');
      modalDiv.className = 'modal-overlay';
      modalDiv.id = 'modal-adjust-units';
      modalDiv.innerHTML = `
        <div class="modal-content modal-lg">
          <div class="modal-header">
            <h3 style="color: #002355; font-size: 1.2rem; font-weight: 800; margin: 0;">Total Units</h3>
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
    if (closeBtn) {
      closeBtn.onclick = () => {
        if (window.activeModalState) {
          window.activeModalState.unitsMemberId = null;
          if (window.activeModalState.activeModalIds) {
            window.activeModalState.activeModalIds.delete('modal-adjust-units');
          }
        }
        unitsModal.classList.remove('active');
      };
    }

    const baselineUnits = Number(member.baselineUnits !== undefined ? member.baselineUnits : (member.totalUnits || 0)).toFixed(2);
    const currentTotalUnits = Number(member.totalUnits !== undefined ? member.totalUnits : baselineUnits).toFixed(2);

    const storageKey = `atsoca_unit_ledger_${member.id}`;
    let manualHistory = [];
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) manualHistory = JSON.parse(raw);
    } catch (e) {
      manualHistory = [];
    }

    // Always include immutable baseline record as the foundational first entry
    const baselineEntry = {
      timestamp: 'Previous Balance',
      type: 'Baseline Record',
      amount: `+${baselineUnits} Units`,
      runningTotal: `${baselineUnits} Units`,
      isBaseline: true
    };

    const fullLedger = [baselineEntry, ...manualHistory];

    const initialNewTotal = (Number(currentTotalUnits) + 1.00).toFixed(2);

    unitsBody.innerHTML = `
      <!-- Member Name & Current Total Header -->
      <div style="background: var(--box-inner-bg); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 18px; margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div>
            <h4 style="margin: 0; font-size: 1.15rem; color: var(--heading-color); font-weight: 800;">${member.name}</h4>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">CURRENT TOTAL UNITS</div>
            <div style="font-size: 1.5rem; font-weight: 800; color: var(--text-primary);">${currentTotalUnits} Units</div>
          </div>
        </div>
      </div>

      <!-- 1. Baseline Display with Interactive iOS Toggle Switch -->
      <div style="background: var(--box-inner-bg); border: 1px solid var(--border-color); border-left: 4px solid var(--accent-blue); padding: 14px 16px; border-radius: 8px; margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div>
            <span style="font-weight: 700; color: var(--text-muted); font-size: 0.85rem;">Baseline / Previous Units:</span>
            <strong id="display-baseline-val" style="color: var(--text-primary); font-size: 1.05rem; margin-left: 8px; font-weight: 800;">${baselineUnits} Units</strong>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <span id="badge-lock-status" style="background: var(--header-btn-bg); color: var(--text-primary); font-size: 0.72rem; padding: 4px 10px; border-radius: 12px; font-weight: 700; border: 1px solid var(--border-color); display: inline-flex; align-items: center; gap: 6px;">
              <i class="fas fa-lock" id="icon-baseline-lock" style="color: var(--text-primary);"></i> <span id="label-baseline-lock">Locked</span>
            </span>
            <label class="switch-toggle" title="Toggle Lock/Unlock Baseline Units">
              <input type="checkbox" id="toggle-baseline-switch">
              <span class="switch-slider"></span>
            </label>
          </div>
        </div>

        <!-- Inline Unlock Form (Hidden when Locked) -->
        <div id="baseline-edit-controls" style="display: none; margin-top: 12px; padding-top: 12px; border-top: 1px dashed var(--border-color); align-items: center; gap: 10px; flex-wrap: wrap;">
          <label style="font-size: 0.78rem; color: var(--text-muted); font-weight: 700; margin: 0;">New Baseline Value:</label>
          <input type="number" id="input-new-baseline" class="form-control" step="0.01" min="0" value="${baselineUnits}" style="width: 120px; padding: 5px 10px; font-size: 0.85rem; font-weight: 700; color: var(--text-primary);">
          <button id="btn-save-baseline" class="btn btn-primary btn-sm" style="padding: 6px 14px; font-size: 0.78rem; font-weight: 700; border-radius: 6px;">
            Save Baseline
          </button>
        </div>
      </div>

      <!-- 2. Adjustment Controls -->
      <div style="background: var(--box-inner-bg); border: 1px solid var(--border-color); padding: 18px; border-radius: var(--radius-md); margin-bottom: 18px;">
        <h5 style="margin: 0 0 14px 0; color: var(--heading-color); font-size: 1rem; font-weight: 800;">New Unit Adjustment</h5>
        <div style="display: grid; grid-template-columns: 1fr 1fr auto; gap: 14px; align-items: flex-end;">
          <div>
            <label style="display: block; font-size: 0.75rem; color: var(--text-muted); font-weight: 700; margin-bottom: 6px;">Action Type</label>
            <select id="adj-type" class="form-control" style="padding: 8px 12px; font-size: 0.85rem; font-weight: 700; color: var(--text-primary);">
              <option value="add">Add (+)</option>
              <option value="deduct">Deduct (-)</option>
            </select>
          </div>
          <div>
            <label style="display: block; font-size: 0.75rem; color: var(--text-muted); font-weight: 700; margin-bottom: 6px;">Units Input</label>
            <input type="number" id="adj-amount" class="form-control" step="0.01" min="0.01" value="1.00" style="padding: 8px 12px; font-size: 0.85rem; font-weight: 700; color: var(--text-primary);">
          </div>
          <div>
            <button class="btn btn-primary" id="btn-save-unit-adj" style="padding: 9px 20px; font-weight: 700; font-size: 0.85rem; border-radius: 6px;">
              Apply Adjustment
            </button>
          </div>
        </div>
      </div>

      <!-- 3. History Log Ledger Table -->
      <div class="table-responsive" style="max-height: 220px; overflow-y: auto;">
        <table class="custom-table" style="width: 100%; font-size: 0.82rem;">
          <thead>
            <tr>
              <th style="color: var(--text-muted); font-weight: 800; font-size: 0.78rem;">TIMESTAMP</th>
              <th style="color: var(--text-muted); font-weight: 800; font-size: 0.78rem;">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            ${fullLedger.map(entry => {
              const displayAmt = entry.amount || entry.units || entry.delta || entry.value || entry.amountDisplay || (entry.type ? entry.type : '+1.00 Units');
              return `
                <tr style="color: var(--text-primary);">
                  <td style="color: var(--text-primary); font-size: 0.82rem; ${entry.isBaseline ? 'font-weight: 700;' : ''}">${entry.timestamp}</td>
                  <td style="color: var(--text-primary); font-size: 0.82rem;">
                    <strong style="color: var(--text-primary);">
                      ${displayAmt}
                    </strong>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    unitsModal.classList.add('active');

    // Interactive Toggle Switch Listener
    const toggleSwitch = unitsBody.querySelector('#toggle-baseline-switch');
    const badgeStatus = unitsBody.querySelector('#badge-lock-status');
    const lockIcon = unitsBody.querySelector('#icon-baseline-lock');
    const lockLabel = unitsBody.querySelector('#label-baseline-lock');
    const editControls = unitsBody.querySelector('#baseline-edit-controls');
    const inputBaseline = unitsBody.querySelector('#input-new-baseline');
    const btnSaveBaseline = unitsBody.querySelector('#btn-save-baseline');

    if (toggleSwitch) {
      toggleSwitch.addEventListener('change', () => {
        const isChecked = toggleSwitch.checked;
        if (isChecked) {
          badgeStatus.style.background = '#fef3c7';
          badgeStatus.style.borderColor = '#fde68a';
          badgeStatus.style.setProperty('color', '#b45309', 'important');
          if (lockLabel) lockLabel.style.setProperty('color', '#b45309', 'important');
          if (lockIcon) {
            lockIcon.className = 'fas fa-unlock';
            lockIcon.style.setProperty('color', '#b45309', 'important');
          }
          if (lockLabel) lockLabel.textContent = 'Unlocked';
          if (editControls) editControls.style.display = 'flex';
        } else {
          badgeStatus.style.background = 'var(--header-btn-bg)';
          badgeStatus.style.borderColor = 'var(--border-color)';
          badgeStatus.style.setProperty('color', 'var(--text-primary)', 'important');
          if (lockLabel) lockLabel.style.setProperty('color', 'var(--text-primary)', 'important');
          if (lockIcon) {
            lockIcon.className = 'fas fa-lock';
            lockIcon.style.setProperty('color', 'var(--text-primary)', 'important');
          }
          if (lockLabel) lockLabel.textContent = 'Locked';
          if (editControls) editControls.style.display = 'none';
        }
      });
    }

    if (btnSaveBaseline) {
      btnSaveBaseline.onclick = () => {
        const val = parseFloat(inputBaseline ? inputBaseline.value : 0);
        if (isNaN(val) || val < 0) {
          alert('Please enter a valid non-negative baseline units value.');
          return;
        }

        const oldBaseline = member.baselineUnits || 0;
        const diff = val - oldBaseline;
        const newTotalUnits = Number((Number(currentTotalUnits) + diff).toFixed(2));

        member.baselineUnits = val;
        db.updateMemberUnitsAndFees(member.id, newTotalUnits, member.availableForRelease);

        openAdjustUnitsModal(memId);
        if (document.querySelector('#modal-inspect-account')?.classList.contains('active')) {
          openInspectModal(memId);
        }
        renderManagementOverview(container, role);
      };
    }

    // Save adjustment handler
    const typeSelect = unitsBody.querySelector('#adj-type');
    const amountInput = unitsBody.querySelector('#adj-amount');
    const btnSave = unitsBody.querySelector('#btn-save-unit-adj');

    if (btnSave) {
      btnSave.onclick = () => {
        const type = typeSelect ? typeSelect.value : 'add';
        const amt = parseFloat(amountInput ? amountInput.value : 0);

        if (isNaN(amt) || amt <= 0) {
          alert('Please enter a valid unit adjustment amount.');
          return;
        }

        const baseNum = Number(currentTotalUnits);
        const newBalance = type === 'add' ? Number((baseNum + amt).toFixed(2)) : Number(Math.max(0, baseNum - amt).toFixed(2));
        const adjStr = (type === 'add' ? '+' : '-') + amt.toFixed(2) + ' Units';

        const entry = {
          timestamp: new Date().toLocaleString(),
          amount: adjStr,
          isBaseline: false
        };

        manualHistory.push(entry);
        localStorage.setItem(storageKey, JSON.stringify(manualHistory));

        db.updateMemberUnitsAndFees(member.id, newBalance, member.availableForRelease);

        openAdjustUnitsModal(memId);
        if (document.querySelector('#modal-inspect-account')?.classList.contains('active')) {
          openInspectModal(memId);
        }
        renderManagementOverview(container, role);
      };
    }
  }
}
