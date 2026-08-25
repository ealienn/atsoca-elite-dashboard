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
    <div class="welcome-banner-card">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; width: 100%;">
        <div>
          <h2>Unit Monitoring & Conversion</h2>
        </div>
      </div>
    </div>

    <!-- Unit Stat Cards -->
    <div class="grid-3">
      <div class="card stat-card" style="text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 22px 18px;">
        <div class="stat-info" style="text-align: center;">
          <span style="font-size: 0.72rem; font-weight: 800; color: #002355; text-transform: uppercase; letter-spacing: 0.05em;">Monthly Units Earned</span>
          <div class="stat-value" style="font-size: 2.2rem; font-weight: 900; margin-top: 6px; color: #002355;">${member.monthlyUnits} Units</div>
        </div>
      </div>

      <div class="card stat-card" style="text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 22px 18px;">
        <div class="stat-info" style="text-align: center;">
          <span style="font-size: 0.72rem; font-weight: 800; color: #002355; text-transform: uppercase; letter-spacing: 0.05em;">Total Accumulated Units</span>
          <div class="stat-value" style="font-size: 2.2rem; font-weight: 900; margin-top: 6px; color: #002355;">${member.totalUnits} Units</div>
        </div>
      </div>

      <div class="card stat-card" style="text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 22px 18px;">
        <div class="stat-info" style="text-align: center;">
          <span style="font-size: 0.72rem; font-weight: 800; color: #002355; text-transform: uppercase; letter-spacing: 0.05em;">Next Elite Level</span>
          <div class="stat-value" style="font-size: 2.2rem; font-weight: 900; margin-top: 6px; color: #002355;">${levelInfo.nextLevel}</div>
        </div>
      </div>
    </div>

    <!-- Tier Progression Card -->
    <div class="card" style="margin-bottom: 28px;">
      <div class="card-header">
        <div class="card-title">Tier Elevation Track (${levelInfo.name} Rank)</div>
        <span class="tier-badge tier-${levelInfo.name.replace(/\s+/g, '')}"><i class="fas ${levelInfo.icon}"></i> ${levelInfo.name}</span>
      </div>

      <div class="progress-container" style="margin-bottom: 12px;">
        <div class="progress-labels">
          <span>Current Units: <strong>${member.totalUnits}</strong></span>
        </div>
        <div class="progress-track" style="height: 14px;">
          <div class="progress-bar" style="width: ${levelInfo.progressPercent}%;"></div>
        </div>
      </div>
    </div>

    <!-- Verified Payment to Unit Conversion Ledger -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">Unit Conversion Credit History</div>
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
