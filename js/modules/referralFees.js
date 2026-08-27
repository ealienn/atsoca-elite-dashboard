/**
 * Referral Fee Monitoring & Memo 1 Matrix 2026 Component
 */
import { db } from '../dbState.js';
import { MATRIX_RATES, getEliteLevel, calculateReferralFee, formatPHP } from '../matrixEngine.js';

export function renderReferralFees(container) {
  if (!container) return;
  const member = (db && typeof db.getCurrentMember === 'function' ? db.getCurrentMember() : null) || { id: '004', name: 'Joshua Villafuerte', totalUnits: 0 };
  const currentLevelInfo = getEliteLevel(member ? member.totalUnits : 0);
  const allEnrollments = (db && db.data && Array.isArray(db.data.enrollments)) ? db.data.enrollments : [];

  const enrollments = allEnrollments.filter(e => e && (db && db.activeRole === 'Elite Member' ? (e.referrerId === member.id || (e.referrerName && member.name && e.referrerName.toLowerCase() === member.name.toLowerCase())) : e.isReferred));

  container.innerHTML = `
    <div class="welcome-banner-card">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; width: 100%;">
        <div>
          <h2>Referral Fee Monitoring</h2>
        </div>
        <div class="tier-badge tier-${currentLevelInfo.name.replace(/\s+/g, '')}">
          <i class="fas ${currentLevelInfo.icon}"></i> Applicable Tier Rate: ${currentLevelInfo.name}
        </div>
      </div>
    </div>

    <!-- Live Matrix Table & Dynamic Simulator Row -->
    <div class="grid-2">
      <!-- Matrix Table Card -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">Memo 1: Atsoca Elite Matrix 2026</div>
        </div>

        <div class="table-responsive">
          <table class="custom-table matrix-table">
            <thead>
              <tr>
                <th style="text-align: left;">Elite Level</th>
                <th>≤ ₱1,999</th>
                <th>₱2,000–2,499</th>
                <th>₱2,500–2,999</th>
                <th>≥ ₱3,000</th>
              </tr>
            </thead>
            <tbody>
              ${Object.keys(MATRIX_RATES).map(levelKey => {
    const rates = MATRIX_RATES[levelKey];
    const isCurrent = currentLevelInfo.name === levelKey;
    return `
                  <tr class="${isCurrent ? 'matrix-active-row' : ''}">
                    <td style="text-align: left;"><strong>${levelKey}</strong></td>
                    <td class="${isCurrent ? 'highlight' : ''}">${(rates.bracket1 * 100).toFixed(0)}%</td>
                    <td class="${isCurrent ? 'highlight' : ''}">${(rates.bracket2 * 100).toFixed(0)}%</td>
                    <td class="${isCurrent ? 'highlight' : ''}">${(rates.bracket3 * 100).toFixed(0)}%</td>
                    <td class="${isCurrent ? 'highlight' : ''}">${(rates.bracket4 * 100).toFixed(0)}%</td>
                  </tr>
                `;
  }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Interactive Calculator Tool -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">Live Fee Calculator Simulator</div>
        </div>
        <form id="calc-sim-form">
          <div class="form-group">
            <label>Select Elite Level Rank</label>
            <select id="sim-level" class="form-control">
              ${Object.keys(MATRIX_RATES).map(lvl => `
                <option value="${lvl}" ${lvl === currentLevelInfo.name ? 'selected' : ''}>${lvl}</option>
              `).join('')}
            </select>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="form-group">
              <label>Training Fee per Pax (₱)</label>
              <input type="number" id="sim-fee" class="form-control" value="4500" min="0" step="100">
            </div>
            <div class="form-group">
              <label>Number of Pax / Participants</label>
              <input type="number" id="sim-pax" class="form-control" value="1" min="1" step="1" placeholder="e.g. 1, 5, 10">
            </div>
          </div>

          <div class="sim-result-card" id="sim-result-box" style="background: var(--box-inner-bg); border: 1px solid var(--box-inner-border); border-radius: 12px; padding: 18px 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span class="sim-result-label" style="font-size: 0.82rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; color: var(--text-muted);">Applicable Fee Bracket:</span>
              <span style="font-weight: 800; color: var(--text-primary); font-size: 0.95rem;" id="sim-bracket-label">≥ ₱3,000</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span class="sim-result-label" style="font-size: 0.82rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; color: var(--text-muted);">Matrix Percentage Rate:</span>
              <span style="font-weight: 900; color: var(--accent-blue); font-size: 1.2rem;" id="sim-rate-label">18%</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span class="sim-result-label" style="font-size: 0.82rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; color: var(--text-muted);">Referral Fee per Pax:</span>
              <span style="font-weight: 800; color: var(--text-primary); font-size: 1.05rem;" id="sim-perpax-label">₱810.00 / pax</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;" id="sim-volume-row">
              <span class="sim-result-label" style="font-size: 0.82rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; color: var(--text-muted);">Total Net Investment Volume:</span>
              <span style="font-weight: 800; color: var(--text-primary); font-size: 1.05rem;" id="sim-volume-label">₱4,500.00 (1 Pax)</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 2px dashed var(--border-color); padding-top: 14px; margin-top: 4px;">
              <div>
                <span style="color: var(--heading-color); font-weight: 800; font-size: 0.95rem; display: block;">Total Calculated Referral Fee:</span>
                <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 700;" id="sim-units-label">+1.00 Matrix Units Earned</span>
              </div>
              <span style="font-weight: 900; color: var(--text-primary); font-size: 1.8rem; letter-spacing: -0.02em;" id="sim-total-label">₱810.00</span>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Referral Fee Earnings Table for Participants -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">Verified Referrals Fee Statement</div>
      </div>

      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Submission ID</th>
              <th>Participant Name</th>
              <th>Course / Program</th>
              <th>Fee</th>
              <th>Amount Paid</th>
              <th>Applicable Level</th>
              <th>Referral %</th>
              <th>Computed Referral Fee</th>
            </tr>
          </thead>
          <tbody>
            ${enrollments.map(enr => {
              const calc = calculateReferralFee(enr.paymentMade, member.totalUnits ? currentLevelInfo.name : 'Bronze');
              const isPaid = enr.paymentStatus === 'Fully Paid';
              return `
                <tr>
                  <td><code>${enr.id}</code></td>
                  <td><strong>${enr.participantName}</strong></td>
                  <td>${enr.trainingType}</td>
                  <td><strong>${formatPHP(enr.investmentFee)}</strong></td>
                  <td><span style="color: var(--accent-emerald); font-weight: 700;">${formatPHP(enr.paymentMade)}</span></td>
                  <td><span class="tier-badge tier-${calc.eliteLevel.replace(/\s+/g, '')}">${calc.eliteLevel}</span></td>
                  <td><strong>${calc.percentageFormatted}</strong></td>
                  <td><strong style="color: var(--accent-amber); font-size: 1.05rem;">${formatPHP(calc.referralFee)}</strong></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Calculator interaction
  const simLevel = container.querySelector('#sim-level');
  const simFee = container.querySelector('#sim-fee');
  const simPax = container.querySelector('#sim-pax');

  const updateSim = () => {
    const feeVal = Math.max(0, Number(simFee.value) || 0);
    const paxVal = Math.max(1, Math.floor(Number(simPax.value) || 1));

    const singleRes = calculateReferralFee(feeVal, simLevel.value);
    const feePerPax = singleRes.referralFee;
    const totalVolume = feeVal * paxVal;
    const totalReferralFee = feePerPax * paxVal;
    const totalUnits = ((feeVal / 4500) * paxVal).toFixed(2);

    container.querySelector('#sim-bracket-label').innerText = singleRes.feeBracketLabel;
    container.querySelector('#sim-rate-label').innerText = singleRes.percentageFormatted;
    container.querySelector('#sim-perpax-label').innerText = `${formatPHP(feePerPax)} / pax`;
    container.querySelector('#sim-volume-label').innerText = `${formatPHP(totalVolume)} (${paxVal} Pax)`;
    container.querySelector('#sim-units-label').innerText = `+${totalUnits} Matrix Units Earned`;
    container.querySelector('#sim-total-label').innerText = formatPHP(totalReferralFee);
  };

  simLevel.addEventListener('change', updateSim);
  simFee.addEventListener('input', updateSim);
  if (simPax) simPax.addEventListener('input', updateSim);
}
