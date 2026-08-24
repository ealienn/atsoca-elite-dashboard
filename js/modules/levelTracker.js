/**
 * Elite Level Tracker Module Component
 */
import { db } from '../dbState.js';
import { ELITE_LEVELS, getEliteLevel } from '../matrixEngine.js';

export function renderLevelTracker(container) {
  if (!container) return;
  const member = (db && typeof db.getCurrentMember === 'function' ? db.getCurrentMember() : null) || { id: '004', name: 'Joshua Villafuerte', totalUnits: 0 };
  const currentLevelInfo = getEliteLevel(member ? member.totalUnits : 0);

  container.innerHTML = `
    <div class="welcome-banner-card">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; width: 100%;">
        <div>
          <h2>Elite Level Tracker</h2>
        </div>
        <div class="tier-badge tier-${currentLevelInfo.name.replace(/\s+/g, '')}" style="font-size: 1rem; padding: 8px 18px;">
          <i class="fas ${currentLevelInfo.icon}"></i> Your Current Rank: ${currentLevelInfo.name}
        </div>
      </div>
    </div>

    <!-- Active Tier Overview Card -->
    <div class="card" style="margin-bottom: 28px;">
      <div class="card-header">
        <div class="card-title">Active Level Benchmark (${currentLevelInfo.name})</div>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
        <div style="background: rgba(255,255,255,0.03); padding: 20px 16px; border-radius: var(--radius-md); border: 1px solid var(--border-color); text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <div style="font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em;">Accumulated Units</div>
          <div style="font-size: 1.8rem; font-weight: 900; color: var(--accent-amber); margin-top: 4px;">${member.totalUnits} Units</div>
        </div>
        <div style="background: rgba(255,255,255,0.03); padding: 20px 16px; border-radius: var(--radius-md); border: 1px solid var(--border-color); text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <div style="font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em;">Tier Unit Range</div>
          <div style="font-size: 1.8rem; font-weight: 900; color: var(--accent-blue); margin-top: 4px;">${currentLevelInfo.minUnits} - ${currentLevelInfo.maxUnits === Infinity ? '1501+' : currentLevelInfo.maxUnits}</div>
        </div>
        <div style="background: rgba(255,255,255,0.03); padding: 20px 16px; border-radius: var(--radius-md); border: 1px solid var(--border-color); text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <div style="font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em;">Next Milestone Tier</div>
          <div style="font-size: 1.8rem; font-weight: 900; color: var(--accent-emerald); margin-top: 4px;">${currentLevelInfo.nextLevel}</div>
        </div>
      </div>
    </div>

    <!-- Official Tier Threshold Table -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">Official Memo 1</div>
      </div>

      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Elite Level Rank</th>
              <th>Required Unit Range</th>
              <th>Equivalent Investment Net Fee Range</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${ELITE_LEVELS.map(level => {
              const isCurrent = currentLevelInfo.name === level.name;
              return `
                <tr style="${isCurrent ? 'background: rgba(59, 130, 246, 0.1); border-left: 4px solid var(--accent-blue);' : ''}">
                  <td>
                    <span class="tier-badge tier-${level.name.replace(/\s+/g, '')}">
                      ${level.name}
                    </span>
                  </td>
                  <td><strong>${level.minUnits} – ${level.maxUnits === Infinity ? '1501+' : level.maxUnits} Units</strong></td>
                  <td>₱${(level.minUnits * 4500).toLocaleString()} – ${level.maxUnits === Infinity ? 'Above ₱6.75M' : '₱' + (level.maxUnits * 4500).toLocaleString()}</td>
                  <td>
                    ${isCurrent ? `
                      <span class="status-pill status-Verified"><i class="fas fa-user-check"></i> Active Rank</span>
                    ` : member.totalUnits > level.maxUnits ? `
                      <span style="color: var(--accent-emerald); font-size: 0.8rem; font-weight: 600;"><i class="fas fa-check-double"></i> Achieved</span>
                    ` : `
                      <span style="color: var(--text-muted); font-size: 0.8rem;"><i class="fas fa-lock"></i> Locked</span>
                    `}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
