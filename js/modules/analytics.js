/**
 * Invite Analytics Module Component
 */
import { db } from '../dbState.js';

export function renderAnalytics(container) {
  if (!container) return;
  const member = (db && typeof db.getCurrentMember === 'function' ? db.getCurrentMember() : null) || { id: '004', name: 'Joshua Villafuerte' };
  const allInvites = (db && db.data && Array.isArray(db.data.invites)) ? db.data.invites : [];
  const allEnrollments = (db && db.data && Array.isArray(db.data.enrollments)) ? db.data.enrollments : [];

  const invites = allInvites.filter(i => i && (db && db.activeRole === 'Elite Member' ? (i.referrerId === member.id || (i.referrerName && member.name && i.referrerName.toLowerCase() === member.name.toLowerCase())) : true));
  const enrollments = allEnrollments.filter(e => e && (db && db.activeRole === 'Elite Member' ? (e.referrerId === member.id || (e.referrerName && member.name && e.referrerName.toLowerCase() === member.name.toLowerCase())) : true));

  const totalInvites = invites.length;
  const monthlyInvites = invites.filter(i => i.dateSubmitted.startsWith('2026-07')).length;
  const verifiedInvites = invites.filter(i => i.verificationStatus === 'Verified').length;
  const enrolledInvites = invites.filter(i => i.enrollmentStatus === 'Enrolled').length;

  const conversionRate = totalInvites > 0 ? Math.round((enrolledInvites / totalInvites) * 100) : 0;
  const verificationRate = totalInvites > 0 ? Math.round((verifiedInvites / totalInvites) * 100) : 0;

  container.innerHTML = `
    <div class="welcome-banner-card">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; width: 100%;">
        <div>
          <h2>Invite Analytics & Recruitment Metrics</h2>
        </div>
      </div>
    </div>

    <!-- Monthly Summary Stat Cards -->
    <div class="grid-4">
      <div class="card stat-card">
        <div class="stat-info">
          <span>Monthly Invites (July 2026)</span>
          <div class="stat-value">${monthlyInvites}</div>
          <div class="stat-sub">Recent activity this month</div>
        </div>
        <div class="stat-icon"><i class="fas fa-calendar-check"></i></div>
      </div>

      <div class="card stat-card emerald">
        <div class="stat-info">
          <span>Total Invites Cumulative</span>
          <div class="stat-value">${totalInvites}</div>
          <div class="stat-sub">All time invitations</div>
        </div>
        <div class="stat-icon"><i class="fas fa-paper-plane"></i></div>
      </div>

      <div class="card stat-card purple">
        <div class="stat-info">
          <span>Verified Invites</span>
          <div class="stat-value">${verifiedInvites}</div>
          <div class="stat-sub"><i class="fas fa-check"></i> Verification Rate: <strong>${verificationRate}%</strong></div>
        </div>
        <div class="stat-icon"><i class="fas fa-user-check"></i></div>
      </div>

      <div class="card stat-card amber">
        <div class="stat-info">
          <span>Enrolled Invites</span>
          <div class="stat-value">${enrolledInvites}</div>
          <div class="stat-sub"><i class="fas fa-graduation-cap"></i> Conversion Rate: <strong>${conversionRate}%</strong></div>
        </div>
        <div class="stat-icon"><i class="fas fa-user-graduate"></i></div>
      </div>
    </div>

    <!-- Visual Charts Row -->
    <div class="grid-2">
      <!-- Recruitment Funnel Chart -->
      <div class="card">
        <div class="card-header">
          <div class="card-title"><i class="fas fa-filter"></i> Recruitment Funnel Breakdown</div>
        </div>
        <div style="height: 280px; position: relative;">
          <canvas id="chart-funnel"></canvas>
        </div>
      </div>

      <!-- Monthly Trend Line Chart -->
      <div class="card">
        <div class="card-header">
          <div class="card-title"><i class="fas fa-chart-area"></i> Monthly Recruitment & Unit Trend</div>
        </div>
        <div style="height: 280px; position: relative;">
          <canvas id="chart-monthly"></canvas>
        </div>
      </div>
    </div>
  `;

  // Render Chart.js canvases after DOM paint
  setTimeout(() => {
    if (window.Chart) {
      const isDark = document.body.getAttribute('data-theme') === 'dark';
      const textColor = isDark ? '#ffffff' : '#0f172a';
      const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0';

      // 1. Funnel Bar Chart
      const ctxFunnel = container.querySelector('#chart-funnel').getContext('2d');
      new window.Chart(ctxFunnel, {
        type: 'bar',
        data: {
          labels: ['Total Submissions', 'Verified by Mgr', 'Enrolled Participants'],
          datasets: [{
            label: 'Invites Count',
            data: [totalInvites, verifiedInvites, enrolledInvites],
            backgroundColor: ['rgba(2, 132, 199, 0.85)', 'rgba(16, 185, 129, 0.85)', 'rgba(139, 92, 246, 0.85)'],
            borderColor: ['#0284c7', '#10b981', '#8b5cf6'],
            borderWidth: 2,
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor } },
            x: { grid: { display: false }, ticks: { color: textColor } }
          }
        }
      });

      // 2. Monthly Trend Chart
      const ctxMonthly = container.querySelector('#chart-monthly').getContext('2d');
      new window.Chart(ctxMonthly, {
        type: 'line',
        data: {
          labels: ['Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026 (Current)'],
          datasets: [
            {
              label: 'Invites Submitted',
              data: [3, 5, 8, 12, monthlyInvites],
              borderColor: '#0284c7',
              backgroundColor: 'rgba(2, 132, 199, 0.12)',
              fill: true,
              tension: 0.4
            },
            {
              label: 'Units Accumulated',
              data: [2, 4, 9, 14, 18],
              borderColor: '#f59e0b',
              backgroundColor: 'rgba(245, 158, 11, 0.12)',
              fill: true,
              tension: 0.4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { labels: { color: textColor } } },
          scales: {
            y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor } },
            x: { grid: { display: false }, ticks: { color: textColor } }
          }
        }
      });
    }
  }, 50);
}
