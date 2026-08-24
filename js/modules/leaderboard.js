/**
 * ATSOCA Elite Dashboard - Leaderboard & Partner Ranking Module
 */
import { db } from '../dbState.js';
import { getEliteLevel } from '../matrixEngine.js';

let activeSortMetric = 'totalUnits'; // 'totalUnits', 'monthlyUnits', 'releasedFees'

export function renderLeaderboard(container) {
  if (!container) return;
  const isEliteMember = db && db.activeRole === 'Elite Member';
  const currentMember = isEliteMember && typeof db.getCurrentMember === 'function' ? db.getCurrentMember() : null;
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

  // Calculate current user rank if logged in as Elite Member
  const userRankIndex = currentMember ? sortedMembers.findIndex(m => m.id === currentMember.id) : -1;
  const userRank = userRankIndex !== -1 ? userRankIndex + 1 : 1;
  const userLevel = currentMember ? getEliteLevel(currentMember.totalUnits) : null;

  const isManagement = !isEliteMember; // Elite Manager, Finance, Administrator

  // Top 3 Podium Members
  const top1 = sortedMembers[0] || null;
  const top2 = sortedMembers[1] || null;
  const top3 = sortedMembers[2] || null;

  const topBannerHtml = (isEliteMember && currentMember && userLevel) ? `
    <!-- Top Personal Rank Banner for Elite Member -->
    <div class="welcome-banner-card">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; width: 100%;">
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
  ` : `
    <!-- Executive Leaderboard Banner for Management Roles -->
    <div class="welcome-banner-card">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; width: 100%;">
        <div>
          <h2>Leaderboard & Partner Ranking</h2>
        </div>
        <div style="display: flex; gap: 12px; align-items: center;">
          <span style="background: rgba(255, 255, 255, 0.14); color: #ffffff; padding: 6px 14px; border-radius: 20px; font-weight: 700; font-size: 0.82rem; border: 1px solid rgba(255, 255, 255, 0.3);">
            <i class="fas fa-users"></i> ${members.length} Active Elites
          </span>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = `
    ${topBannerHtml}

    <!-- Top 3 Podium Visual Cards (Elevated Physical Height Hierarchy) -->
    <div class="podium-grid-container" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; align-items: flex-end; margin-bottom: 32px; padding-top: 24px;">
      <!-- 2nd Place Silver Podium -->
      ${top2 ? renderPodiumCard(top2, 2, 'silver', '🥈 2ND PLACE', isManagement) : ''}

      <!-- 1st Place Gold Podium (TALLEST CENTER) -->
      ${top1 ? renderPodiumCard(top1, 1, 'gold', '👑 1ST PLACE', isManagement) : ''}

      <!-- 3rd Place Bronze Podium -->
      ${top3 ? renderPodiumCard(top3, 3, 'bronze', '🥉 3RD PLACE', isManagement) : ''}
    </div>

    <!-- Filter & Full Ranking Table -->
    <div class="card">
      <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div class="card-title">
          Elite Partner Leaderboard
        </div>

        ${isManagement ? `
          <!-- Sorting Filter Buttons for Management -->
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
        ` : ''}
      </div>

      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th style="width: 70px; text-align: center;">Rank</th>
              <th>Partner Profile</th>
              <th>Elite Tier Level</th>
              ${isManagement ? `
                <th style="text-align: center;">Monthly Units</th>
                <th style="text-align: center;">Total Units</th>
                <th style="text-align: right;">Total Released</th>
                <th>Rank Progress Status</th>
              ` : ''}
            </tr>
          </thead>
          <tbody>
            ${sortedMembers.map((m, index) => {
              const rank = index + 1;
              const level = getEliteLevel(m.totalUnits);
              const isCurrentUser = isEliteMember && currentMember && m.id === currentMember.id;
              const rankBadgeClass = rank === 1 ? 'rank-gold' : rank === 2 ? 'rank-silver' : rank === 3 ? 'rank-bronze' : 'rank-standard';
              const rankIcon = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;

              return `
                <tr class="${isCurrentUser ? 'current-user-row' : ''}">
                  <td style="text-align: center;">
                    <span class="rank-position-badge ${rankBadgeClass}">${rankIcon}</span>
                  </td>
                  <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <img src="${m.avatar}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;" alt="${m.name}">
                      <div>
                        <div style="font-weight: 800; font-size: 0.84rem; color: var(--text-primary); display: flex; align-items: center; gap: 6px;">
                          ${m.name}
                          ${isCurrentUser ? '<span class="you-pill-badge">YOU</span>' : ''}
                        </div>
                        ${isManagement || isCurrentUser ? `<div style="font-size: 0.72rem; color: var(--text-muted);">${m.email} • ID: ${m.id}</div>` : ''}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="tier-badge tier-${level.name.replace(/\s+/g, '')}" style="font-size: 0.72rem; padding: 2px 10px;">
                      ${level.name}
                    </span>
                  </td>
                  ${isManagement ? `
                    <td style="text-align: center; font-weight: 700; font-size: 0.82rem; color: #0284c7;">
                      +${m.monthlyUnits || 0} Units
                    </td>
                    <td style="text-align: center; font-weight: 900; font-size: 0.92rem; color: #002355;">
                      ${m.totalUnits} Units
                    </td>
                    <td style="text-align: right; font-weight: 800; font-size: 0.84rem; color: #10b981;">
                      ₱${(m.releasedFees || 0).toLocaleString()}
                    </td>
                    <td>
                      <div style="min-width: 120px;">
                        <div style="display: flex; justify-content: space-between; font-size: 0.7rem; font-weight: 700; margin-bottom: 3px;">
                          <span>${level.name}</span>
                          <span>${level.maxUnits === Infinity ? 'MAX' : `${m.totalUnits}/${level.maxUnits}`}</span>
                        </div>
                        <div class="progress-bar-container" style="height: 6px;">
                          <div class="progress-bar-fill" style="width: ${Math.min(100, Math.round((m.totalUnits / (level.maxUnits === Infinity ? m.totalUnits : level.maxUnits)) * 100))}%;"></div>
                        </div>
                      </div>
                    </td>
                  ` : ''}
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

function renderPodiumCard(member, rank, type, badgeTitle, isManagement = false) {
  const level = getEliteLevel(member.totalUnits);
  const showFees = isManagement && member.releasedFees && member.releasedFees > 0;

  // Distinct elevation styles for 1st, 2nd, 3rd place
  const styles = {
    1: {
      cardStyle: 'background: linear-gradient(180deg, rgba(254, 243, 199, 0.45) 0%, var(--bg-card) 100%); border: 2px solid #f59e0b; border-radius: 20px; padding: 32px 20px 24px 20px; box-shadow: 0 14px 32px rgba(245, 158, 11, 0.22); transform: translateY(-16px); text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative;',
      avatarStyle: 'width: 68px; height: 68px; border-radius: 50%; object-fit: cover; border: 3px solid #f59e0b; box-shadow: 0 0 16px rgba(245, 158, 11, 0.4);',
      badgeStyle: 'background: #f59e0b; color: #ffffff; padding: 5px 16px; border-radius: 20px; font-weight: 900; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.05em; margin: 10px 0 6px 0; box-shadow: 0 3px 10px rgba(245, 158, 11, 0.3);',
      nameStyle: 'font-size: 1.15rem; font-weight: 900; color: var(--text-primary); margin: 0 0 8px 0;',
      crown: '👑'
    },
    2: {
      cardStyle: 'background: linear-gradient(180deg, rgba(241, 245, 249, 0.6) 0%, var(--bg-card) 100%); border: 1.5px solid #94a3b8; border-radius: 18px; padding: 24px 18px 20px 18px; box-shadow: 0 6px 20px rgba(148, 163, 184, 0.18); transform: translateY(-6px); text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative;',
      avatarStyle: 'width: 56px; height: 56px; border-radius: 50%; object-fit: cover; border: 3px solid #94a3b8;',
      badgeStyle: 'background: #64748b; color: #ffffff; padding: 4px 14px; border-radius: 20px; font-weight: 800; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.04em; margin: 8px 0 6px 0;',
      nameStyle: 'font-size: 1.02rem; font-weight: 900; color: var(--text-primary); margin: 0 0 6px 0;',
      crown: '🥈'
    },
    3: {
      cardStyle: 'background: linear-gradient(180deg, rgba(254, 215, 170, 0.3) 0%, var(--bg-card) 100%); border: 1.5px solid #d97706; border-radius: 18px; padding: 20px 16px 18px 16px; box-shadow: 0 4px 16px rgba(217, 119, 6, 0.15); transform: translateY(0); text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative;',
      avatarStyle: 'width: 50px; height: 50px; border-radius: 50%; object-fit: cover; border: 3px solid #d97706;',
      badgeStyle: 'background: #d97706; color: #ffffff; padding: 4px 12px; border-radius: 20px; font-weight: 800; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.04em; margin: 6px 0 6px 0;',
      nameStyle: 'font-size: 0.95rem; font-weight: 900; color: var(--text-primary); margin: 0 0 6px 0;',
      crown: '🥉'
    }
  }[rank] || {};

  return `
    <div class="podium-card podium-${type}" style="${styles.cardStyle}">
      <div style="position: relative; display: inline-block;">
        <img src="${member.avatar}" alt="${member.name}" style="${styles.avatarStyle}">
        <span style="position: absolute; top: -10px; right: -8px; font-size: 1.2rem; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));">${styles.crown}</span>
      </div>
      <div style="margin-top: 4px;">
        <div style="${styles.badgeStyle}">${badgeTitle}</div>
        <h3 style="${styles.nameStyle}">${member.name}</h3>
        <div style="display: flex; align-items: center; justify-content: center; gap: 6px; flex-wrap: wrap;">
          <span class="tier-badge tier-${level.name.replace(/\s+/g, '')}" style="font-size: 0.72rem; padding: 2px 8px;">
            ${level.name}
          </span>
          ${isManagement ? `
            <span style="color: var(--text-muted);">•</span>
            <span style="font-weight: 800; font-size: 0.82rem; color: #0284c7;">${member.totalUnits} Units</span>
            ${showFees ? `
              <span style="color: var(--text-muted);">•</span>
              <span style="font-weight: 800; font-size: 0.82rem; color: #10b981;">₱${Number(member.releasedFees).toLocaleString()}</span>
            ` : ''}
          ` : ''}
        </div>
      </div>
    </div>
  `;
}
