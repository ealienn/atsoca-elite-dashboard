/**
 * Downloadable Reports Module Component (Excel/CSV & Formatted PDF)
 * Supports 2-Level Account Folder View, Per-Elite Isolation, Date Range Filtering & Full Scope Data
 */
import { db } from '../dbState.js';
import { formatPHP, calculateReferralFee, getEliteLevel } from '../matrixEngine.js';

// State: null = Level 1 (5 Elite Accounts View), '004'/'005'/etc. = Level 2 (Selected Member Dossier)
let activeDrillDownCode = null;
let activeStartDate = '';
let activeEndDate = '';

export function renderReports(container) {
  if (!container) return;

  const members = (db && db.data && Array.isArray(db.data.members)) ? db.data.members : [];
  const allEnrollments = (db && db.data && Array.isArray(db.data.enrollments)) ? db.data.enrollments : [];

  // Determine active member if in Level 2
  let targetMember = null;
  if (activeDrillDownCode) {
    targetMember = members.find(m => m.id === activeDrillDownCode || String(m.id).padStart(3, '0') === String(activeDrillDownCode).padStart(3, '0')) || members[0];
  }

  const { activeMember, invites, enrollments, units, fees, releases } = targetMember 
    ? getScopedReportData(targetMember.id, activeStartDate, activeEndDate)
    : { activeMember: null, invites: [], enrollments: [], units: [], fees: [], releases: [] };

  const totalCollected = enrollments.reduce((s, e) => s + (e.paymentMade || 0), 0);
  const totalUnitsEarned = units.reduce((s, u) => s + (u.unitsEarned || 0), 0);
  const totalReferralFees = fees.reduce((s, f) => s + f.calculatedFee, 0);
  const totalReleasedAmount = releases.filter(r => r.processingStatus === 'Released').reduce((s, r) => s + (r.amount || 0), 0);
  const tier = targetMember ? getEliteLevel(targetMember.totalUnits || 0) : { name: 'Gold', icon: 'fa-award', badgeColor: '#f59e0b' };

  container.innerHTML = `
    <!-- LEVEL 1 VIEW (#reports-elite-grid) -->
    <div id="reports-elite-grid" style="display: ${activeDrillDownCode ? 'none' : 'block'};">
      <!-- Executive Header -->
      <div class="welcome-banner-card" style="background: #002355; border: 1px solid var(--border-color); margin-bottom: 24px; padding: 18px 24px; min-height: 64px; box-sizing: border-box; display: flex; align-items: center; justify-content: space-between; border-radius: 12px; flex-wrap: wrap; gap: 16px;">
        <div class="welcome-text">
          <span style="font-size: 1.15rem !important; font-weight: 800 !important; color: #ffffff !important;">Reports & Data Export Center</span>
        </div>
        <button class="btn btn-sm" id="btn-print-summary" style="background: rgba(255, 255, 255, 0.14); color: #ffffff; border: 1px solid rgba(255, 255, 255, 0.35); font-size: 0.8rem; font-weight: 700; padding: 6px 16px; border-radius: 8px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; height: 34px;">
          Print Summary View
        </button>
      </div>

      <div style="margin-bottom: 16px; font-weight: 800; font-size: 0.95rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em;">
        <span>Elite Member Account Folders (${members.length} Accounts)</span>
      </div>

      <div class="grid-3" style="margin-bottom: 24px; gap: 18px;">
        ${members.map(m => {
          const mNameLower = (m.name || '').toLowerCase();
          const mCodePadded = String(m.id).padStart(3, '0');
          const mEnrollments = allEnrollments.filter(e => e && (String(e.referrerId || e.eliteCode || '').padStart(3, '0') === mCodePadded || (e.referrerName && e.referrerName.toLowerCase() === mNameLower)));
          const mTier = getEliteLevel(m.totalUnits || 0);

          return `
            <div class="card elite-folder-card" data-member-code="${m.id}" style="position: relative; overflow: hidden; padding: 20px; cursor: pointer; border-left: 4px solid var(--accent-blue);">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <img src="${m.avatar || ''}" alt="${m.name}" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover; border: 2.5px solid var(--accent-blue);">
                  <div>
                    <div style="font-size: 1.05rem; font-weight: 800; color: var(--text-primary);">${m.name}</div>
                    <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px;">
                      Code: <strong style="color: var(--text-primary);">[${m.id}]</strong>
                    </div>
                  </div>
                </div>
                <span class="mock-gold-badge" style="background: ${mTier.badgeColor}; color: #ffffff; font-size: 0.72rem; padding: 3px 10px; border-radius: 12px; font-weight: 700; white-space: nowrap;">
                  ${mTier.name}
                </span>
              </div>

              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 16px; background: var(--box-inner-bg); padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border-color);">
                <div style="text-align: center;">
                  <div style="font-size: 0.68rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase;">Participants</div>
                  <div style="font-size: 0.95rem; font-weight: 800; color: var(--text-primary); margin-top: 2px;">${mEnrollments.length} Pax</div>
                </div>
                <div style="text-align: center; border-left: 1px solid var(--border-color); border-right: 1px solid var(--border-color);">
                  <div style="font-size: 0.68rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase;">Units</div>
                  <div style="font-size: 0.95rem; font-weight: 800; color: var(--text-primary); margin-top: 2px;">${Number(m.totalUnits || 0).toFixed(1)}</div>
                </div>
                <div style="text-align: center;">
                  <div style="font-size: 0.68rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase;">Available</div>
                  <div style="font-size: 0.95rem; font-weight: 800; color: var(--text-primary); margin-top: 2px;">₱${(m.availableForRelease || 0).toLocaleString()}</div>
                </div>
              </div>

              <button class="btn btn-block btn-open-member-dossier" data-member-code="${m.id}" style="width: 100%; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 8px; background: #002355; color: #ffffff; border: none; padding: 10px; border-radius: 8px;">
                View Reports & Exports ➔
              </button>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- LEVEL 2 VIEW (#reports-matrix-view) FOR SELECTED ELITE MEMBER -->
    <div id="reports-matrix-view" style="display: ${activeDrillDownCode ? 'block' : 'none'};">
      ${targetMember ? `
        <!-- Level 2 Navigation Header -->
        <div class="welcome-banner-card" style="background: #002355; border: 1px solid var(--border-color); margin-bottom: 24px; padding: 18px 24px; min-height: 64px; box-sizing: border-box; display: flex; align-items: center; justify-content: space-between; border-radius: 12px; flex-wrap: wrap; gap: 16px;">
          <div style="display: flex; align-items: center; gap: 16px;">
            <button class="btn" id="btn-back-reports-grid" title="Back to All Elite Accounts" style="font-weight: 800; display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; padding: 0; font-size: 1.15rem; background: rgba(255, 255, 255, 0.14); color: #ffffff; border: 1px solid rgba(255, 255, 255, 0.35);">
              <i class="fas fa-arrow-left"></i>
            </button>
            <div>
              <div style="font-size: 1.25rem; font-weight: 900; color: #ffffff; display: flex; align-items: center; gap: 10px;">
                REPORTS DOSSIER: <span style="color: #38bdf8;">[${targetMember.id}] ${targetMember.name}</span>
              </div>
            </div>
          </div>

          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="btn btn-sm btn-compile-pdf" data-id="${targetMember.id}" style="background: rgba(255, 255, 255, 0.14); color: #ffffff; border: 1px solid rgba(255, 255, 255, 0.35); font-weight: 700; height: 34px; padding: 6px 16px; border-radius: 8px;">
              Download PDF Dossier
            </button>
            <button class="btn btn-sm btn-compile-csv" data-id="${targetMember.id}" style="background: rgba(255, 255, 255, 0.14); color: #ffffff; border: 1px solid rgba(255, 255, 255, 0.35); font-weight: 700; height: 34px; padding: 6px 16px; border-radius: 8px;">
              Export CSV Dossier
            </button>
          </div>
        </div>

        <!-- Individual Profile Banner -->
        <div class="card" style="margin-bottom: 24px; background: var(--box-inner-bg); border: 1px solid var(--border-color);">
          <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 16px;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <img src="${targetMember.avatar || ''}" alt="${targetMember.name}" style="width: 56px; height: 56px; border-radius: 50%; object-fit: cover; border: 3px solid var(--accent-blue);">
              <div>
                <h3 style="margin: 0; font-size: 1.15rem; color: var(--text-primary); font-weight: 800; display: flex; align-items: center; gap: 8px;">
                  ${targetMember.name}
                  <span class="mock-gold-badge" style="background: ${tier.badgeColor}; color: #ffffff; font-size: 0.72rem; padding: 2px 8px; border-radius: 12px;">
                    ${tier.name} Tier
                  </span>
                </h3>
                <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 3px;">
                  Member Code: <strong style="color: var(--text-primary);">[${targetMember.id}]</strong> | Total Accumulated Units: <strong style="color: var(--text-primary);">${Number(targetMember.totalUnits || 0).toFixed(2)} Units</strong>
                </div>
              </div>
            </div>

            <div style="display: flex; gap: 16px; flex-wrap: wrap;">
              <div style="background: var(--bg-card); padding: 10px 16px; border-radius: 8px; border: 1px solid var(--border-color); text-align: center;">
                <div style="font-size: 0.7rem; color: var(--text-secondary); font-weight: 700;">INVITES LOG</div>
                <div style="font-size: 1.1rem; font-weight: 800; color: var(--text-primary); margin-top: 2px;">${invites.length} Records</div>
              </div>
              <div style="background: var(--bg-card); padding: 10px 16px; border-radius: 8px; border: 1px solid var(--border-color); text-align: center;">
                <div style="font-size: 0.7rem; color: var(--text-secondary); font-weight: 700;">TOTAL FEES</div>
                <div style="font-size: 1.1rem; font-weight: 800; color: var(--text-primary); margin-top: 2px;">${formatPHP(totalReferralFees)}</div>
              </div>
              <div style="background: var(--bg-card); padding: 10px 16px; border-radius: 8px; border: 1px solid var(--border-color); text-align: center;">
                <div style="font-size: 0.7rem; color: var(--text-secondary); font-weight: 700;">AVAILABLE FUNDS</div>
                <div style="font-size: 1.1rem; font-weight: 800; color: var(--text-primary); margin-top: 2px;">₱${(targetMember.availableForRelease || 0).toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Dedicated Filter & Export Toolbar -->
        <div class="card" style="margin-bottom: 24px; background: var(--box-inner-bg); border: 1px solid var(--border-color); padding: 18px 20px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr auto; gap: 14px; align-items: flex-end;">
            <!-- Start Date (From) -->
            <div>
              <label style="display: block; font-size: 0.78rem; font-weight: 800; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px;" for="reports-start-date">
                From (Start Date):
              </label>
              <input type="date" id="reports-start-date" class="form-control" value="${activeStartDate || ''}" style="width: 100%; padding: 8px 10px; font-size: 0.85rem; font-weight: 600; border-radius: 6px; background: var(--bg-card); color: var(--text-primary); cursor: pointer; position: relative; z-index: 10; pointer-events: auto !important;">
            </div>

            <!-- End Date (To) -->
            <div>
              <label style="display: block; font-size: 0.78rem; font-weight: 800; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px;" for="reports-end-date">
                To (End Date):
              </label>
              <input type="date" id="reports-end-date" class="form-control" value="${activeEndDate || ''}" style="width: 100%; padding: 8px 10px; font-size: 0.85rem; font-weight: 600; border-radius: 6px; background: var(--bg-card); color: var(--text-primary); cursor: pointer; position: relative; z-index: 10; pointer-events: auto !important;">
            </div>

            <!-- Filter Action Buttons -->
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-primary btn-sm" id="btn-apply-reports-filter" style="padding: 9px 18px; font-weight: 700; font-size: 0.82rem; background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); border: none; color: white;">
                Apply Filter
              </button>
              <button class="btn btn-secondary btn-sm" id="btn-reset-reports-filter" style="padding: 9px 14px; font-weight: 700; font-size: 0.82rem;">
                Reset Filter
              </button>
            </div>
          </div>

          ${(activeStartDate || activeEndDate) ? `
            <div style="margin-top: 12px; padding-top: 10px; border-top: 1px dashed var(--border-color); font-size: 0.8rem; color: #0284c7; font-weight: 700; display: flex; align-items: center; justify-content: space-between;">
              <span>Active Date Range Scope: <strong>${activeStartDate || 'Beginning'}</strong> &rarr; <strong>${activeEndDate || 'Present'}</strong></span>
              <span style="background: rgba(2, 132, 199, 0.1); padding: 3px 10px; border-radius: 12px; font-size: 0.75rem;">Filtered Records Active</span>
            </div>
          ` : ''}
        </div>

        <div style="margin-bottom: 12px; font-weight: 800; font-size: 0.92rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em;">
          Individual Matrix Reports Scoped to Code [${targetMember.id}] ${targetMember.name}:
        </div>

        <!-- 5 Individual Matrix Reports Grid -->
        <div class="grid-3" style="margin-bottom: 24px;">
          <!-- 1. Invite Report -->
          <div class="card">
            <div class="card-header"><div class="card-title">1. Invite Report</div></div>
            <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin-bottom: 14px;">${invites.length} Records Found</div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button class="btn btn-secondary btn-sm btn-export-csv" data-report="invites">Export CSV</button>
              <button class="btn btn-primary btn-sm btn-export-pdf" data-report="invites" style="background: #002355; border: none; color: #ffffff;">Download PDF</button>
            </div>
          </div>

          <!-- 2. Enrollment Report -->
          <div class="card">
            <div class="card-header"><div class="card-title">2. Enrollment Report</div></div>
            <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin-bottom: 14px;">${enrollments.length} Participants (${formatPHP(totalCollected)})</div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button class="btn btn-secondary btn-sm btn-export-csv" data-report="enrollments">Export CSV</button>
              <button class="btn btn-primary btn-sm btn-export-pdf" data-report="enrollments" style="background: #002355; border: none; color: #ffffff;">Download PDF</button>
            </div>
          </div>

          <!-- 3. Unit Statement -->
          <div class="card">
            <div class="card-header"><div class="card-title">3. Unit Statement</div></div>
            <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin-bottom: 14px;">${totalUnitsEarned.toFixed(2)} Units Earned</div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button class="btn btn-secondary btn-sm btn-export-csv" data-report="units">Export CSV</button>
              <button class="btn btn-primary btn-sm btn-export-pdf" data-report="units" style="background: #002355; border: none; color: #ffffff;">Download PDF</button>
            </div>
          </div>

          <!-- 4. Referral Fee Report -->
          <div class="card">
            <div class="card-header"><div class="card-title">4. Referral Fee Report</div></div>
            <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin-bottom: 14px;">${formatPHP(totalReferralFees)} Total Computed Fees</div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button class="btn btn-secondary btn-sm btn-export-csv" data-report="fees">Export CSV</button>
              <button class="btn btn-primary btn-sm btn-export-pdf" data-report="fees" style="background: #002355; border: none; color: #ffffff;">Download PDF</button>
            </div>
          </div>

          <!-- 5. Release History Log -->
          <div class="card">
            <div class="card-header"><div class="card-title">5. Release History Log</div></div>
            <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin-bottom: 14px;">${formatPHP(totalReleasedAmount)} Total Disbursed</div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button class="btn btn-secondary btn-sm btn-export-csv" data-report="releases">Export CSV</button>
              <button class="btn btn-primary btn-sm btn-export-pdf" data-report="releases" style="background: #002355; border: none; color: #ffffff;">Download PDF</button>
            </div>
          </div>
        </div>
      ` : ''}
    </div>
  `;

  // Bind Level 1 event listeners
  container.querySelectorAll('.elite-folder-card, .btn-open-member-dossier').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const code = el.getAttribute('data-member-code') || el.closest('.elite-folder-card')?.getAttribute('data-member-code');
      if (code) {
        activeDrillDownCode = code;
        renderReports(container);
      }
    });
  });

  container.querySelector('#btn-print-summary')?.addEventListener('click', () => {
    window.print();
  });

  // Bind Level 2 event listeners
  if (activeDrillDownCode && targetMember) {
    container.querySelector('#btn-back-reports-grid')?.addEventListener('click', (e) => {
      e.stopPropagation();
      activeDrillDownCode = null;
      renderReports(container);
    });

    container.querySelector('.btn-compile-pdf')?.addEventListener('click', (e) => {
      e.stopPropagation();
      exportCompiledPDF(targetMember.id, activeStartDate, activeEndDate);
    });

    container.querySelector('.btn-compile-csv')?.addEventListener('click', (e) => {
      e.stopPropagation();
      exportCompiledCSV(targetMember.id, activeStartDate, activeEndDate);
    });

    const inpStartDate = container.querySelector('#reports-start-date');
    const inpEndDate = container.querySelector('#reports-end-date');

    [inpStartDate, inpEndDate].forEach(inp => {
      if (inp) {
        inp.addEventListener('click', (e) => {
          e.stopPropagation();
          if (typeof inp.showPicker === 'function') {
            try { inp.showPicker(); } catch (err) {}
          }
        });
      }
    });

    const btnApplyFilter = container.querySelector('#btn-apply-reports-filter');
    if (btnApplyFilter) {
      btnApplyFilter.addEventListener('click', (e) => {
        e.stopPropagation();
        activeStartDate = container.querySelector('#reports-start-date')?.value || '';
        activeEndDate = container.querySelector('#reports-end-date')?.value || '';
        renderReports(container);
      });
    }

    const btnResetFilter = container.querySelector('#btn-reset-reports-filter');
    if (btnResetFilter) {
      btnResetFilter.addEventListener('click', (e) => {
        e.stopPropagation();
        activeStartDate = '';
        activeEndDate = '';
        renderReports(container);
      });
    }

    container.querySelectorAll('.btn-export-csv').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const reportType = btn.getAttribute('data-report');
        exportIndividualCSV(reportType, targetMember.id, activeStartDate, activeEndDate);
      });
    });

    container.querySelectorAll('.btn-export-pdf').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const reportType = btn.getAttribute('data-report');
        exportIndividualPDF(reportType, targetMember.id, activeStartDate, activeEndDate);
      });
    });
  }
}

// Window Triggers for Open/Close Reports
if (typeof window !== 'undefined') {
  window.openEliteReports = (memberCode) => {
    activeDrillDownCode = memberCode || '004';
    const contentMount = document.querySelector('#content-mount');
    if (contentMount) {
      renderReports(contentMount);
    }
  };

  window.closeEliteReports = () => {
    activeDrillDownCode = null;
    const contentMount = document.querySelector('#content-mount');
    if (contentMount) {
      renderReports(contentMount);
    }
  };

  window.triggerOpenEliteReports = window.openEliteReports;
  window.triggerCloseEliteReports = window.closeEliteReports;
}

/**
 * Filter helper function for getting member records isolated by member & date range
 */
function getScopedReportData(targetMemberId, start, end) {
  const members = (db && db.data && Array.isArray(db.data.members)) ? db.data.members : [];
  const allInvites = (db && db.data && Array.isArray(db.data.invites)) ? db.data.invites : [];
  const allEnrollments = (db && db.data && Array.isArray(db.data.enrollments)) ? db.data.enrollments : [];
  const allReleases = (db && db.data && Array.isArray(db.data.releases)) ? db.data.releases : [];

  const activeMember = members.find(m => 
    m.id === targetMemberId || String(m.id).padStart(3, '0') === String(targetMemberId).padStart(3, '0')
  );
  const memberName = activeMember ? activeMember.name : null;

  let invites = [];
  let enrollments = [];
  let releases = [];

  const codePadded = String(targetMemberId).padStart(3, '0');
  invites = allInvites.filter(i => 
    i && (
      i.referrerId === targetMemberId ||
      String(i.referrerId || '').padStart(3, '0') === codePadded ||
      (memberName && i.referrerName && i.referrerName.toLowerCase() === memberName.toLowerCase())
    )
  );

  enrollments = allEnrollments.filter(e => 
    e && (
      e.referrerId === targetMemberId ||
      String(e.referrerId || e.eliteCode || '').padStart(3, '0') === codePadded ||
      (memberName && e.referrerName && e.referrerName.toLowerCase() === memberName.toLowerCase())
    )
  );

  releases = allReleases.filter(r => 
    r && (
      r.eliteMemberId === targetMemberId ||
      String(r.eliteMemberId || '').padStart(3, '0') === codePadded ||
      (memberName && r.eliteMemberName && r.eliteMemberName.toLowerCase() === memberName.toLowerCase())
    )
  );

  const inRange = (dStr) => {
    if (!dStr) return true;
    let s = String(dStr).trim();
    if (s.includes('T')) s = s.split('T')[0];
    if (s.includes(' ')) s = s.split(' ')[0];

    if (start && s < start) return false;
    if (end && s > end) return false;
    return true;
  };

  if (start || end) {
    invites = invites.filter(i => inRange(i.dateSubmitted || i.trainingDate || i.date));
    enrollments = enrollments.filter(e => inRange(e.dateSubmitted || e.verifiedDate || e.trainingDate || e.date));
    releases = releases.filter(r => inRange(r.requestDate || r.dateReleased || r.timestamp || r.date));
  }

  const units = enrollments.filter(e => e.isReferred).map(e => ({
    ...e,
    formula: `${formatPHP(e.paymentMade)} / ₱4,500`,
    unitsEarned: Number(e.unitsEarned || (e.paymentMade / 4500).toFixed(2))
  }));

  const fees = enrollments.filter(e => e.isReferred).map(e => {
    let levelName = 'Gold';
    if (activeMember) {
      levelName = getEliteLevel(activeMember.totalUnits || 0).name;
    }
    const calc = calculateReferralFee(e.paymentMade, levelName);
    return {
      ...e,
      eliteLevel: calc.eliteLevel,
      percentageFormatted: calc.percentageFormatted,
      calculatedFee: calc.referralFee
    };
  });

  return { activeMember, invites, enrollments, units, fees, releases };
}

/**
 * Output Filename Generator
 * Format: Report_[MemberCode]_[MemberName]_[DateRange].csv / .pdf
 */
function buildExportFilename(reportType, memberCode, memberName, start, end, extension) {
  let repName = '';
  if (reportType === 'invites') repName = 'Invite_Report';
  else if (reportType === 'enrollments') repName = 'Enrollment_Report';
  else if (reportType === 'units') repName = 'Unit_Report';
  else if (reportType === 'fees') repName = 'Referral_Fee_Report';
  else if (reportType === 'releases') repName = 'Release_History_Report';
  else if (reportType === 'dossier') repName = 'Master_Dossier';
  else repName = 'Report';

  const codeClean = memberCode ? String(memberCode).padStart(3, '0') : 'All';
  const nameClean = memberName ? memberName.trim().replace(/[^a-zA-Z0-9]/g, '_') : 'Member';

  let dateRangeStr = 'All_Time';
  if (start && end) {
    dateRangeStr = `${start}_to_${end}`;
  } else if (start) {
    dateRangeStr = `From_${start}`;
  } else if (end) {
    dateRangeStr = `Up_To_${end}`;
  }

  return `${repName}_${codeClean}_${nameClean}_${dateRangeStr}.${extension}`;
}

function exportIndividualCSV(type, targetMemberId, start, end) {
  const { activeMember, invites, enrollments, units, fees, releases } = getScopedReportData(targetMemberId, start, end);

  const memberCode = activeMember ? activeMember.id : targetMemberId;
  const memberName = activeMember ? activeMember.name : 'Elite_Member';
  const filename = buildExportFilename(type, memberCode, memberName, start, end, 'csv');

  let csvContent = 'data:text/csv;charset=utf-8,';

  if (type === 'invites') {
    csvContent += 'Elite Code,Participant Name,School/Company,Course,Fee,Paid,Balance,Enrollment Status,Payment Status,Date Submitted\n';
    invites.forEach(i => {
      csvContent += `"${i.referrerId || memberCode}","${i.inviteName}","${i.schoolCompany}","${i.trainingType || 'BOSH/COSH'}",0,0,0,"${i.enrollmentStatus || 'Pending'}","${i.verificationStatus || 'Unpaid'}","${i.dateSubmitted || i.trainingDate || ''}"\n`;
    });
  } else if (type === 'enrollments') {
    csvContent += 'Elite Code,Participant Name,School/Company,Course,Fee,Paid,Balance,Enrollment Status,Payment Status,Date Submitted\n';
    enrollments.forEach(e => {
      csvContent += `"${e.referrerId || memberCode}","${e.participantName}","${e.schoolCompany}","${e.trainingType || 'BOSH/COSH'}",${e.investmentFee},${e.paymentMade},${e.balance},"${e.enrollmentStatus || 'Enrolled'}","${e.paymentStatus}","${e.dateSubmitted || e.trainingDate || ''}"\n`;
    });
  } else if (type === 'units') {
    csvContent += 'Elite Code,Participant Name,School/Company,Course,Fee,Paid,Balance,Units Earned,Conversion Formula,Date Submitted\n';
    units.forEach(u => {
      csvContent += `"${u.referrerId || memberCode}","${u.participantName}","${u.schoolCompany}","${u.trainingType || 'BOSH/COSH'}",${u.investmentFee},${u.paymentMade},${u.balance},"+${u.unitsEarned} Units","${u.formula}","${u.dateSubmitted || u.trainingDate || ''}"\n`;
    });
  } else if (type === 'fees') {
    csvContent += 'Elite Code,Participant Name,School/Company,Course,Fee,Paid,Elite Level,Percentage Rate,Computed Fee,Date Submitted\n';
    fees.forEach(f => {
      csvContent += `"${f.referrerId || memberCode}","${f.participantName}","${f.schoolCompany}","${f.trainingType || 'BOSH/COSH'}",${f.investmentFee},${f.paymentMade},"${f.eliteLevel}","${f.percentageFormatted}",${f.calculatedFee},"${f.dateSubmitted || f.trainingDate || ''}"\n`;
    });
  } else if (type === 'releases') {
    csvContent += 'Elite Code,Elite Member Name,Request Number,Amount Requested,Disbursement Method,Processing Status,Date Requested,Date Released,Notes\n';
    releases.forEach(r => {
      csvContent += `"${r.eliteMemberId || memberCode}","${r.eliteMemberName}","${r.reqNumber}",${r.amount},"${r.disbursementMethod}","${r.processingStatus}","${r.dateRequested}","${r.dateReleased || 'N/A'}","${r.notes || 'N/A'}"\n`;
    });
  }

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function exportIndividualPDF(type, targetMemberId, start, end) {
  const { activeMember, invites, enrollments, units, fees, releases } = getScopedReportData(targetMemberId, start, end);

  const memberCode = activeMember ? activeMember.id : targetMemberId;
  const memberName = activeMember ? activeMember.name : 'Elite Member';
  const docFilename = buildExportFilename(type, memberCode, memberName, start, end, 'pdf');

  let title = '';
  let headers = [];
  let rows = [];
  let summaryHtml = '';

  const memberLabel = `[${memberCode}] ${memberName}`;
  const dateLabel = (start || end) ? `${start || 'Beginning'} to ${end || 'Present'}` : 'All Time (Full History)';

  if (type === 'invites') {
    title = `Submitted Invites Log Report (${memberLabel})`;
    headers = ['Elite Code', 'Participant Name', 'School / Company', 'Course', 'Fee', 'Paid', 'Balance', 'Enrollment Status', 'Payment Status', 'Date Submitted'];
    rows = invites.map(i => [
      i.referrerId || memberCode, i.inviteName, i.schoolCompany, i.trainingType || 'BOSH/COSH', '₱0.00', '₱0.00', '₱0.00', i.enrollmentStatus || 'Pending', i.verificationStatus || 'Unpaid', i.dateSubmitted || i.trainingDate || 'N/A'
    ]);
    summaryHtml = `<p><strong>Elite Member Scope:</strong> ${memberLabel} | <strong>Date Scope:</strong> ${dateLabel} | <strong>Total Invites:</strong> ${invites.length}</p>`;
  } else if (type === 'enrollments') {
    title = `Participant Enrollment & Payment Summary Report (${memberLabel})`;
    headers = ['Elite Code', 'Participant Name', 'School / Company', 'Course', 'Fee', 'Paid', 'Balance', 'Enrollment Status', 'Payment Status', 'Date Submitted'];
    rows = enrollments.map(e => [
      e.referrerId || memberCode, e.participantName, e.schoolCompany, e.trainingType || 'BOSH/COSH', formatPHP(e.investmentFee), formatPHP(e.paymentMade), formatPHP(e.balance), e.enrollmentStatus || 'Enrolled', e.paymentStatus, e.dateSubmitted || e.trainingDate || 'N/A'
    ]);
    const totalCollected = enrollments.reduce((s, e) => s + e.paymentMade, 0);
    const totalBalance = enrollments.reduce((s, e) => s + e.balance, 0);
    summaryHtml = `<p><strong>Elite Member Scope:</strong> ${memberLabel} | <strong>Date Scope:</strong> ${dateLabel} | <strong>Participants:</strong> ${enrollments.length} | <strong>Collected:</strong> ${formatPHP(totalCollected)} | <strong>Balance:</strong> ${formatPHP(totalBalance)}</p>`;
  } else if (type === 'units') {
    title = `Unit Accumulation & Conversion Statement (${memberLabel})`;
    headers = ['Elite Code', 'Participant Name', 'School / Company', 'Course', 'Fee', 'Paid', 'Balance', 'Units Earned', 'Conversion Formula', 'Date Submitted'];
    rows = units.map(u => [
      u.referrerId || memberCode, u.participantName, u.schoolCompany, u.trainingType || 'BOSH/COSH', formatPHP(u.investmentFee), formatPHP(u.paymentMade), formatPHP(u.balance), `+${u.unitsEarned} Units`, u.formula, u.dateSubmitted || u.trainingDate || 'N/A'
    ]);
    const totalUnits = units.reduce((s, u) => s + u.unitsEarned, 0);
    summaryHtml = `<p><strong>Elite Member Scope:</strong> ${memberLabel} | <strong>Date Scope:</strong> ${dateLabel} | <strong>Accumulated Units:</strong> ${totalUnits.toFixed(2)} Units</p>`;
  } else if (type === 'fees') {
    title = `Memo 1 Atsoca Matrix Referral Fee Report (${memberLabel})`;
    headers = ['Elite Code', 'Participant Name', 'School / Company', 'Course', 'Fee', 'Paid', 'Elite Level', 'Rate (%)', 'Computed Fee', 'Date Submitted'];
    rows = fees.map(f => [
      f.referrerId || memberCode, f.participantName, f.schoolCompany, f.trainingType || 'BOSH/COSH', formatPHP(f.investmentFee), formatPHP(f.paymentMade), f.eliteLevel, f.percentageFormatted, formatPHP(f.calculatedFee), f.dateSubmitted || f.trainingDate || 'N/A'
    ]);
    const totalFees = fees.reduce((s, f) => s + f.calculatedFee, 0);
    summaryHtml = `<p><strong>Elite Member Scope:</strong> ${memberLabel} | <strong>Date Scope:</strong> ${dateLabel} | <strong>Total Calculated Referral Fees:</strong> ${formatPHP(totalFees)}</p>`;
  } else if (type === 'releases') {
    title = `Payout Release History Log Report (${memberLabel})`;
    headers = ['Elite Code', 'Elite Member Name', 'Request No.', 'Amount Requested', 'Disbursement Method', 'Processing Status', 'Date Requested', 'Date Released', 'Notes'];
    rows = releases.map(r => [
      r.eliteMemberId || memberCode, r.eliteMemberName, r.reqNumber, formatPHP(r.amount), r.disbursementMethod, r.processingStatus, r.dateRequested, r.dateReleased || 'N/A', r.notes || 'N/A'
    ]);
    const totalDisbursed = releases.filter(r => r.processingStatus === 'Released').reduce((s, r) => s + r.amount, 0);
    summaryHtml = `<p><strong>Elite Member Scope:</strong> ${memberLabel} | <strong>Date Scope:</strong> ${dateLabel} | <strong>Total Disbursed:</strong> ${formatPHP(totalDisbursed)}</p>`;
  }

  const printWin = window.open('', '_blank');
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  printWin.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${docFilename} - ATSOCA ELITE</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px; color: #0f172a; line-height: 1.4; }
        .header-bar { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #002355; padding-bottom: 15px; margin-bottom: 20px; }
        .logo-title { font-size: 22px; font-weight: 900; color: #002355; letter-spacing: 0.05em; }
        .report-name { font-size: 15px; color: #0284c7; font-weight: 700; margin-top: 4px; }
        .meta-info { font-size: 11px; color: #64748b; text-align: right; }
        .summary-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 18px; margin-bottom: 20px; font-size: 13px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
        th { background: #002355; color: #ffffff; text-align: left; padding: 8px 10px; font-weight: 700; text-transform: uppercase; font-size: 10px; }
        td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; color: #1e293b; }
        tr:nth-child(even) { background-color: #f8fafc; }
        .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 15px; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; }
        @media print { body { padding: 0; } }
      </style>
    </head>
    <body>
      <div class="header-bar">
        <div>
          <div class="logo-title">ATSOCA ELITE DASHBOARD</div>
          <div class="report-name">${title}</div>
        </div>
        <div class="meta-info">
          <div><strong>Generated Date:</strong> ${dateStr}</div>
          <div><strong>Member Scope:</strong> ${memberLabel}</div>
          <div><strong>Date Filter Scope:</strong> ${dateLabel}</div>
          <div><strong>System Audit:</strong> Memo 1 Matrix 2026</div>
        </div>
      </div>

      <div class="summary-box">
        ${summaryHtml}
      </div>

      <table>
        <thead>
          <tr>
            ${headers.map(h => `<th>${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows.length > 0 ? rows.map(r => `<tr>${r.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="${headers.length}" style="text-align:center; padding:15px; color:#94a3b8;">No records found for this Elite member scope and date range.</td></tr>`}
        </tbody>
      </table>

      <div class="footer">
        <div>ATSOCA Elite Real-Time System Portal © 2026</div>
        <div>Confidential & Proprietary Matrix Audit Report</div>
      </div>

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `);
  printWin.document.close();
}

function exportCompiledCSV(targetMemberId, start, end) {
  const { activeMember, invites, enrollments, units, fees, releases } = getScopedReportData(targetMemberId, start, end);
  const memberCode = activeMember ? activeMember.id : targetMemberId;
  const memberName = activeMember ? activeMember.name : 'Elite Member';
  const filename = buildExportFilename('dossier', memberCode, memberName, start, end, 'csv');

  let csvContent = 'data:text/csv;charset=utf-8,';
  csvContent += `COMPILED MASTER REPORTS DOSSIER FOR ELITE CODE [${memberCode}] ${memberName}\n`;
  csvContent += `Date Scope: ${start || 'Beginning'} to ${end || 'Present'}\n\n`;

  csvContent += '--- 1. PARTICIPANT ENROLLMENTS & PAYMENTS ---\n';
  csvContent += 'Elite Code,Participant Name,School/Company,Course,Fee,Paid,Balance,Enrollment Status,Payment Status,Date Submitted\n';
  enrollments.forEach(e => {
    csvContent += `"${e.referrerId || memberCode}","${e.participantName}","${e.schoolCompany}","${e.trainingType || 'BOSH/COSH'}",${e.investmentFee},${e.paymentMade},${e.balance},"${e.enrollmentStatus || 'Enrolled'}","${e.paymentStatus}","${e.dateSubmitted || e.trainingDate || ''}"\n`;
  });

  csvContent += '\n--- 2. SUBMITTED INVITES LOG ---\n';
  csvContent += 'Elite Code,Participant Name,School/Company,Course,Fee,Paid,Balance,Enrollment Status,Payment Status,Date Submitted\n';
  invites.forEach(i => {
    csvContent += `"${i.referrerId || memberCode}","${i.inviteName}","${i.schoolCompany}","${i.trainingType || 'BOSH/COSH'}",0,0,0,"${i.enrollmentStatus || 'Pending'}","${i.verificationStatus || 'Unpaid'}","${i.dateSubmitted || i.trainingDate || ''}"\n`;
  });

  csvContent += '\n--- 3. UNIT ACCUMULATION STATEMENT ---\n';
  csvContent += 'Elite Code,Participant Name,School/Company,Course,Fee,Paid,Balance,Units Earned,Conversion Formula,Date Submitted\n';
  units.forEach(u => {
    csvContent += `"${u.referrerId || memberCode}","${u.participantName}","${u.schoolCompany}","${u.trainingType || 'BOSH/COSH'}",${u.investmentFee},${u.paymentMade},${u.balance},"+${u.unitsEarned} Units","${u.formula}","${u.dateSubmitted || u.trainingDate || ''}"\n`;
  });

  csvContent += '\n--- 4. REFERRAL FEE COMPUTATIONS ---\n';
  csvContent += 'Elite Code,Participant Name,School/Company,Course,Fee,Paid,Elite Level,Percentage Rate,Computed Fee,Date Submitted\n';
  fees.forEach(f => {
    csvContent += `"${f.referrerId || memberCode}","${f.participantName}","${f.schoolCompany}","${f.trainingType || 'BOSH/COSH'}",${f.investmentFee},${f.paymentMade},"${f.eliteLevel}","${f.percentageFormatted}",${f.calculatedFee},"${f.dateSubmitted || f.trainingDate || ''}"\n`;
  });

  csvContent += '\n--- 5. PAYOUT RELEASE HISTORY LOG ---\n';
  csvContent += 'Elite Code,Elite Member Name,Request Number,Amount Requested,Disbursement Method,Processing Status,Date Requested,Date Released,Notes\n';
  releases.forEach(r => {
    csvContent += `"${r.eliteMemberId || memberCode}","${r.eliteMemberName}","${r.reqNumber}",${r.amount},"${r.disbursementMethod}","${r.processingStatus}","${r.dateRequested}","${r.dateReleased || 'N/A'}","${r.notes || 'N/A'}"\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function exportCompiledPDF(targetMemberId, start, end) {
  const { activeMember, invites, enrollments, units, fees, releases } = getScopedReportData(targetMemberId, start, end);
  const memberCode = activeMember ? activeMember.id : targetMemberId;
  const memberName = activeMember ? activeMember.name : 'Elite Member';
  const docFilename = buildExportFilename('dossier', memberCode, memberName, start, end, 'pdf');

  const memberLabel = `[${memberCode}] ${memberName}`;
  const dateLabel = (start || end) ? `${start || 'Beginning'} to ${end || 'Present'}` : 'All Time (Full History)';

  const printWin = window.open('', '_blank');
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  printWin.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${docFilename} - ATSOCA ELITE</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px; color: #0f172a; line-height: 1.4; }
        .header-bar { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #002355; padding-bottom: 15px; margin-bottom: 20px; }
        .logo-title { font-size: 22px; font-weight: 900; color: #002355; letter-spacing: 0.05em; }
        .report-name { font-size: 15px; color: #0284c7; font-weight: 700; margin-top: 4px; }
        .meta-info { font-size: 11px; color: #64748b; text-align: right; }
        .summary-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 18px; margin-bottom: 20px; font-size: 13px; }
        h3 { color: #002355; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; margin-top: 25px; font-size: 14px; text-transform: uppercase; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 20px; font-size: 11px; }
        th { background: #002355; color: #ffffff; text-align: left; padding: 8px 10px; font-weight: 700; text-transform: uppercase; font-size: 10px; }
        td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; color: #1e293b; }
        tr:nth-child(even) { background-color: #f8fafc; }
        .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 15px; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; }
        @media print { body { padding: 0; } }
      </style>
    </head>
    <body>
      <div class="header-bar">
        <div>
          <div class="logo-title">ATSOCA ELITE DASHBOARD</div>
          <div class="report-name">COMPILED MASTER REPORTS DOSSIER FOR ${memberLabel}</div>
        </div>
        <div class="meta-info">
          <div><strong>Generated Date:</strong> ${dateStr}</div>
          <div><strong>Member Scope:</strong> ${memberLabel}</div>
          <div><strong>Date Filter Scope:</strong> ${dateLabel}</div>
          <div><strong>System Audit:</strong> Memo 1 Matrix 2026</div>
        </div>
      </div>

      <div class="summary-box">
        <p><strong>Member Code:</strong> ${memberCode} | <strong>Member Name:</strong> ${memberName} | <strong>Date Scope:</strong> ${dateLabel}</p>
        <p><strong>Total Invites:</strong> ${invites.length} | <strong>Total Participants:</strong> ${enrollments.length} | <strong>Total Fees:</strong> ${formatPHP(fees.reduce((s, f) => s + f.calculatedFee, 0))}</p>
      </div>

      <h3>1. Participant Enrollment Master List</h3>
      <table>
        <thead>
          <tr>
            <th>Elite Code</th><th>Participant Name</th><th>School / Company</th><th>Course</th><th>Fee</th><th>Paid</th><th>Balance</th><th>Status</th><th>Submitted</th>
          </tr>
        </thead>
        <tbody>
          ${enrollments.length > 0 ? enrollments.map(e => `
            <tr>
              <td>${e.referrerId || memberCode}</td>
              <td>${e.participantName}</td>
              <td>${e.schoolCompany}</td>
              <td>${e.trainingType || 'BOSH/COSH'}</td>
              <td>${formatPHP(e.investmentFee)}</td>
              <td>${formatPHP(e.paymentMade)}</td>
              <td>${formatPHP(e.balance)}</td>
              <td>${e.paymentStatus}</td>
              <td>${e.dateSubmitted || e.trainingDate || 'N/A'}</td>
            </tr>
          `).join('') : `<tr><td colspan="9" style="text-align:center; padding:12px; color:#94a3b8;">No enrollments found for this scope.</td></tr>`}
        </tbody>
      </table>

      <h3>2. Submitted Invites Log</h3>
      <table>
        <thead>
          <tr>
            <th>Elite Code</th><th>Participant Name</th><th>School / Company</th><th>Course</th><th>Enrollment Status</th><th>Verification</th><th>Submitted Date</th>
          </tr>
        </thead>
        <tbody>
          ${invites.length > 0 ? invites.map(i => `
            <tr>
              <td>${i.referrerId || memberCode}</td>
              <td>${i.inviteName}</td>
              <td>${i.schoolCompany}</td>
              <td>${i.trainingType || 'BOSH/COSH'}</td>
              <td>${i.enrollmentStatus || 'Pending'}</td>
              <td>${i.verificationStatus || 'Unpaid'}</td>
              <td>${i.dateSubmitted || i.trainingDate || 'N/A'}</td>
            </tr>
          `).join('') : `<tr><td colspan="7" style="text-align:center; padding:12px; color:#94a3b8;">No invites found for this scope.</td></tr>`}
        </tbody>
      </table>

      <h3>3. Payout Release History Log</h3>
      <table>
        <thead>
          <tr>
            <th>Elite Code</th><th>Member Name</th><th>Request No.</th><th>Amount</th><th>Method</th><th>Status</th><th>Date Requested</th><th>Date Released</th>
          </tr>
        </thead>
        <tbody>
          ${releases.length > 0 ? releases.map(r => `
            <tr>
              <td>${r.eliteMemberId || memberCode}</td>
              <td>${r.eliteMemberName}</td>
              <td>${r.reqNumber}</td>
              <td>${formatPHP(r.amount)}</td>
              <td>${r.disbursementMethod}</td>
              <td>${r.processingStatus}</td>
              <td>${r.dateRequested}</td>
              <td>${r.dateReleased || 'N/A'}</td>
            </tr>
          `).join('') : `<tr><td colspan="8" style="text-align:center; padding:12px; color:#94a3b8;">No payout release records found for this scope.</td></tr>`}
        </tbody>
      </table>

      <div class="footer">
        <div>ATSOCA Elite Real-Time System Portal © 2026</div>
        <div>Confidential & Proprietary Master Portfolio Dossier</div>
      </div>

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `);
  printWin.document.close();
}
