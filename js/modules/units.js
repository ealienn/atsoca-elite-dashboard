/**
 * Unit Monitoring Module Component
 */
import { db } from '../dbState.js';
import { getEliteLevel, formatPHP, UNIT_VALUATION } from '../matrixEngine.js';

export function renderUnits(container) {
  if (!container) return;
  const member = (db && typeof db.getCurrentMember === 'function' ? db.getCurrentMember() : null) || { id: '004', name: 'Joshua Villafuerte', totalUnits: 0, monthlyUnits: 0 };
  const levelInfo = getEliteLevel(member ? member.totalUnits : 0);
  const allEnrollments = (db && db.data && Array.isArray(db.data.enrollments)) ? db.data.enrollments : [];

  const enrollments = allEnrollments.filter(e => e && (db && db.activeRole === 'Elite Member' ? (e.referrerId === member.id || (e.referrerName && member.name && e.referrerName.toLowerCase() === member.name.toLowerCase())) : e.isReferred));

  container.innerHTML = `
    <div class="card" style="margin-bottom: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div>
          <h2>Unit Monitoring & Conversion</h2>
        </div>
        <div class="tier-badge" style="background: #002355; color: #ffffff; border: 1px solid #38bdf8;">
          <i class="fas fa-calculator" style="color: #38bdf8;"></i> 1 Unit = ${formatPHP(UNIT_VALUATION)} Net Fee
        </div>
      </div>
    </div>

    <!-- Unit Stat Cards -->
    <div class="grid-3">
      <div class="card stat-card amber">
        <div class="stat-info">
          <span>Monthly Units Earned</span>
          <div class="stat-value">${member.monthlyUnits} Units</div>
          <div class="stat-sub">Current month accumulation</div>
        </div>
        <div class="stat-icon"><i class="fas fa-calendar-check"></i></div>
      </div>

      <div class="card stat-card emerald">
        <div class="stat-info">
          <span>Total Accumulated Units</span>
          <div class="stat-value">${member.totalUnits} Units</div>
          <div class="stat-sub">All-time lifetime balance</div>
        </div>
        <div class="stat-icon"><i class="fas fa-award"></i></div>
      </div>

      <div class="card stat-card purple">
        <div class="stat-info">
          <span>Next Elite Level</span>
          <div class="stat-value">${levelInfo.nextLevel}</div>
          <div class="stat-sub">Requires <strong>${levelInfo.unitsNeeded}</strong> additional units</div>
        </div>
        <div class="stat-icon"><i class="fas fa-level-up-alt"></i></div>
      </div>
    </div>

    <!-- Tier Progression Card -->
    <div class="card" style="margin-bottom: 28px;">
      <div class="card-header">
        <div class="card-title"><i class="fas fa-running"></i> Tier Elevation Track (${levelInfo.name} Rank)</div>
        <span class="tier-badge tier-${levelInfo.name.replace(/\s+/g, '')}"><i class="fas ${levelInfo.icon}"></i> ${levelInfo.name}</span>
      </div>

      <div class="progress-container" style="margin-bottom: 12px;">
        <div class="progress-labels">
          <span>Current Units: <strong>${member.totalUnits}</strong></span>
          <span>Next Level Target: <strong>${levelInfo.maxUnits === Infinity ? 'MAX' : levelInfo.maxUnits + 1} Units</strong></span>
        </div>
        <div class="progress-track" style="height: 14px;">
          <div class="progress-bar" style="width: ${levelInfo.progressPercent}%;"></div>
        </div>
      </div>
      <p style="font-size: 0.8rem; color: var(--text-muted); text-align: right;">${levelInfo.progressPercent}% achieved toward next level upgrade.</p>
    </div>

    <!-- Verified Payment to Unit Conversion Ledger -->
    <div class="card">
      <div class="card-header">
        <div class="card-title"><i class="fas fa-list-ol"></i> Unit Conversion Credit History</div>
      </div>

      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Enrollment ID</th>
              <th>Participant</th>
              <th>Course / Program</th>
              <th>Training Fee</th>
              <th>Amount Paid</th>
              <th>Unit Conversion Formula</th>
              <th>Units Earned</th>
            </tr>
          </thead>
          <tbody>
            ${enrollments.map(enr => `
              <tr>
                <td><code>${enr.id}</code></td>
                <td><strong>${enr.participantName}</strong></td>
                <td>${enr.trainingType}</td>
                <td>${formatPHP(enr.investmentFee)}</td>
                <td><span style="color: var(--accent-emerald); font-weight: 700;">${formatPHP(enr.paymentMade)}</span></td>
                <td><small style="color: var(--text-muted);">${formatPHP(enr.paymentMade)} ÷ ₱4,500</small></td>
                <td>
                  <span class="unit-badge">
                    <i class="fas fa-star"></i> +${enr.unitsEarned} Units
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
