/**
 * ATSOCA Elite Dashboard - Leaderboard & Partner Ranking Module
 */
import { db } from '../dbState.js';
import { getEliteLevel } from '../matrixEngine.js';

let activeSortMetric = 'totalUnits'; // 'totalUnits', 'monthlyUnits', 'releasedFees'

export function renderLeaderboard(container) {
  if (!container) return;
  const currentMember = (db && typeof db.getCurrentMember === 'function' ? db.getCurrentMember() : null) || { id: 'ELITE-101', name: 'Ellaine Joyce' };
  const members = (db && db.data && Array.isArray(db.data.members)) ? db.data.members : [];

  // Get and sort member list
  const sortedMembers = [...members].sort((a, b) => {
    if (activeSortMetric === 'monthlyUnits') {
      return (b.monthlyUnits || 0) - (a.monthlyUnits || 0);
    } else if (activeSortMetric === 'releasedFees') {
      return (b.releasedFees || 0) - (a.releasedFees || 0);
    }
    return (b.totalUnits || 0) - (a.totalUnits || 0);
  });

  // Calculate current user rank
  const userRankIndex = sortedMembers.findIndex(m => m.id === currentMember.id);
  const userRank = userRankIndex !== -1 ? userRankIndex + 1 : sortedMembers.length;
  const userLevel = getEliteLevel(currentMember.totalUnits);

  // Calculate gap to next rank
  let rankGapMessage = '🥇 You are currently holding the #1 Top Rank!';
  if (userRankIndex > 0) {
    const nextMemberAbove = sortedMembers[userRankIndex - 1];
    if (activeSortMetric === 'monthlyUnits') {
      const gap = (nextMemberAbove.monthlyUnits || 0) - (currentMember.monthlyUnits || 0) + 1;
      rankGapMessage = `Need <strong>+${gap} Monthly Units</strong> to overtake #${userRankIndex} ${nextMemberAbove.name}`;
    } else if (activeSortMetric === 'releasedFees') {
      const gap = (nextMemberAbove.releasedFees || 0) - (currentMember.releasedFees || 0) + 100;
      rankGapMessage = `Need <strong>+₱${gap.toLocaleString()} Fees</strong> to overtake #${userRankIndex} ${nextMemberAbove.name}`;
    } else {
      const gap = (nextMemberAbove.totalUnits || 0) - (currentMember.totalUnits || 0) + 1;
      rankGapMessage = `Need <strong>+${gap} Units</strong> to overtake #${userRankIndex} ${nextMemberAbove.name}`;
    }
  }

  // Top 3 Podium Members
  const top1 = sortedMembers[0] || null;
  const top2 = sortedMembers[1] || null;
  const top3 = sortedMembers[2] || null;

  container.innerHTML = `
    <!-- Top Personal Rank Banner -->
    <div class="card" style="margin-bottom: 24px; background: #002355; border: 1px solid var(--border-color); color: #ffffff;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div style="display: flex; align-items: center; gap: 18px;">
          <div style="background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%); color: #ffffff; padding: 6px 14px; border-radius: 20px; font-weight: 800; font-size: 0.95rem; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);">
            <i class="fas fa-crown"></i> #${userRank}
          </div>
          <div>
            <h2 style="color: #ffffff; margin: 0; font-size: 1.4rem; display: flex; align-items: center; gap: 10px;">
              ${currentMember.name}
              <span class="tier-badge tier-${userLevel.name.replace(/\s+/g, '')}" style="font-size: 0.78rem; padding: 4px 12px;">
                ${userLevel.name}
              </span>
            </h2>
          </div>
        </div>

        <div style="display: flex; gap: 16px; align-items: center;">
          <div style="background: rgba(255, 255, 255, 0.1); padding: 12px 18px; border-radius: 12px; text-align: center; border: 1px solid rgba(255, 255, 255, 0.15);">
            <div style="font-size: 0.72rem; color: rgba(255,255,255,0.7); text-transform: uppercase; font-weight: 700;">Total Units</div>
            <div style="font-size: 1.35rem; font-weight: 900; color: #38bdf8;">${currentMember.totalUnits} Units</div>
          </div>
          <div style="background: rgba(255, 255, 255, 0.1); padding: 12px 18px; border-radius: 12px; text-align: center; border: 1px solid rgba(255, 255, 255, 0.15);">
            <div style="font-size: 0.72rem; color: rgba(255,255,255,0.7); text-transform: uppercase; font-weight: 700;">Total Released</div>
            <div style="font-size: 1.35rem; font-weight: 900; color: #10b981;">₱${(currentMember.releasedFees || 0).toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Top 3 Podium Visual Cards -->
    <div class="podium-grid-container" style="margin-bottom: 28px;">
      <!-- 2nd Place Silver Podium -->
      ${top2 ? renderPodiumCard(top2, 2, 'silver', '🥈 2ND PLACE') : ''}

      <!-- 1st Place Gold Podium -->
      ${top1 ? renderPodiumCard(top1, 1, 'gold', '🥇 1ST PLACE') : ''}

      <!-- 3rd Place Bronze Podium -->
      ${top3 ? renderPodiumCard(top3, 3, 'bronze', '🥉 3RD PLACE') : ''}
    </div>

    <!-- Filter & Full Ranking Table -->
    <div class="card">
      <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div class="card-title">
          <i class="fas fa-list-ol" style="color: var(--text-primary);"></i> Complete Partner Performance Leaderboard
        </div>

        <!-- Sorting Filter Buttons -->
        <div class="leaderboard-filter-group">
          <button class="leaderboard-filter-btn ${activeSortMetric === 'totalUnits' ? 'active' : ''}" data-metric="totalUnits">
            <i class="fas fa-star"></i> Total Units
          </button>
          <button class="leaderboard-filter-btn ${activeSortMetric === 'monthlyUnits' ? 'active' : ''}" data-metric="monthlyUnits">
            <i class="fas fa-chart-line"></i> Monthly Units
          </button>
          <button class="leaderboard-filter-btn ${activeSortMetric === 'releasedFees' ? 'active' : ''}" data-metric="releasedFees">
            <i class="fas fa-coins"></i> Released Fees
          </button>
        </div>
      </div>

      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th style="width: 70px; text-align: center;">Rank</th>
              <th>Partner Profile</th>
              <th>Elite Tier Level</th>
              <th style="text-align: center;">Monthly Units</th>
              <th style="text-align: center;">Total Units</th>
              <th style="text-align: right;">Total Released</th>
              <th>Rank Progress Status</th>
            </tr>
          </thead>
          <tbody>
            ${sortedMembers.map((m, index) => {
              const rank = index + 1;
              const level = getEliteLevel(m.totalUnits);
              const isCurrentUser = m.id === currentMember.id;
              const rankBadgeClass = rank === 1 ? 'rank-gold' : rank === 2 ? 'rank-silver' : rank === 3 ? 'rank-bronze' : 'rank-standard';
              const rankIcon = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;

              return `
                <tr class="${isCurrentUser ? 'current-user-row' : ''}">
                  <td style="text-align: center;">
                    <span class="rank-position-badge ${rankBadgeClass}">${rankIcon}</span>
                  </td>
                  <td>
                    <div style="display: flex; align-items: center; gap: 12px;">
                      <img src="${m.avatar}" class="table-user-avatar" alt="${m.name}">
                      <div>
                        <div style="font-weight: 800; color: var(--text-primary); display: flex; align-items: center; gap: 6px;">
                          ${m.name}
                          ${isCurrentUser ? '<span class="you-pill-badge">YOU</span>' : ''}
                        </div>
                        <div style="font-size: 0.75rem; color: var(--text-secondary);">${m.email} • ID: ${m.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="tier-badge tier-${level.name.replace(/\s+/g, '')}">
                      ${level.name}
                    </span>
                  </td>
                  <td style="text-align: center; font-weight: 700; color: #0284c7;">
                    +${m.monthlyUnits || 0} Units
                  </td>
                  <td style="text-align: center; font-weight: 900; font-size: 1.05rem; color: #002355;">
                    ${m.totalUnits} Units
                  </td>
                  <td style="text-align: right; font-weight: 800; color: #10b981;">
                    ₱${(m.releasedFees || 0).toLocaleString()}
                  </td>
                  <td>
                    <div style="min-width: 140px;">
                      <div style="display: flex; justify-content: space-between; font-size: 0.72rem; font-weight: 700; margin-bottom: 4px;">
                        <span>${level.name}</span>
                        <span>${level.maxUnits === Infinity ? 'MAX' : `${m.totalUnits}/${level.maxUnits}`}</span>
                      </div>
                      <div class="progress-bar-container" style="height: 10px;">
                        <div class="progress-bar-fill" style="width: ${Math.min(100, Math.round((m.totalUnits / (level.maxUnits === Infinity ? m.totalUnits : level.maxUnits)) * 100))}%;"></div>
                      </div>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Bind filter button listeners
  container.querySelectorAll('.leaderboard-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const metric = btn.getAttribute('data-metric');
      if (metric) {
        activeSortMetric = metric;
        renderLeaderboard(container);
      }
    });
  });
}

function renderPodiumCard(member, rank, type, badgeTitle) {
  const level = getEliteLevel(member.totalUnits);
  const isGold = type === 'gold';

  return `
    <div class="podium-card podium-${type} ${isGold ? 'podium-champion' : ''}">
      <div class="podium-header-badge">${badgeTitle}</div>
      <div class="podium-avatar-wrapper">
        <img src="${member.avatar}" alt="${member.name}" class="podium-avatar">
        <span class="podium-crown-icon">${rank === 1 ? '👑' : rank === 2 ? '🥈' : '🥉'}</span>
      </div>
      <h3 class="podium-member-name">${member.name}</h3>
      <span class="tier-badge tier-${level.name.replace(/\s+/g, '')}" style="margin-bottom: 12px; display: inline-flex;">
        ${level.name}
      </span>
      <div class="podium-stat-box">
        <div class="podium-stat-unit">${member.totalUnits} Units</div>
        <div class="podium-stat-earned">₱${(member.releasedFees || 0).toLocaleString()} Released</div>
      </div>
    </div>
  `;
}
