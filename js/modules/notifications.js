/**
 * Notifications Center Component
 */
import { db } from '../dbState.js';

export function renderNotifications(container, activeFilter = 'all') {
  let notifs = db.data.notifications;

  if (activeFilter === 'unread') {
    notifs = notifs.filter(n => !n.read);
  } else if (activeFilter !== 'all') {
    notifs = notifs.filter(n => n.type.toLowerCase().includes(activeFilter.toLowerCase()));
  }

  const unreadCount = db.data.notifications.filter(n => !n.read).length;
  const unreadCountEl = document.querySelector('#notif-unread-count');
  if (unreadCountEl) {
    unreadCountEl.innerText = unreadCount > 0 ? `${unreadCount} Unread Audit Alerts` : 'All Alerts Caught Up!';
  }

  if (notifs.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 16px; color: var(--text-muted);">
        <i class="fas fa-bell-slash" style="font-size: 2.5rem; opacity: 0.4; margin-bottom: 12px;"></i>
        <div style="font-size: 0.9rem; font-weight: 700;">No Notifications Found</div>
        <div style="font-size: 0.78rem; margin-top: 4px;">You have no active alerts under this category.</div>
      </div>
    `;
    return;
  }

  container.innerHTML = notifs.map(n => {
    const isEmerald = n.type.includes('Verified') || n.type.includes('Enrolled');
    const isAmber = n.type.includes('Release') || n.type.includes('Fee');
    const iconClass = isEmerald ? 'emerald' : isAmber ? 'amber' : 'sky';
    const iconFa = isEmerald ? 'fa-check-circle' : isAmber ? 'fa-coins' : 'fa-info-circle';

    return `
      <div class="notif-card-item ${n.read ? '' : 'unread'}" data-id="${n.id}">
        <div class="notif-card-icon ${iconClass}">
          <i class="fas ${iconFa}"></i>
        </div>
        <div class="notif-card-content">
          <div class="notif-card-title-row">
            <div class="notif-card-title">${n.title}</div>
            <div class="notif-card-time">${n.timestamp}</div>
          </div>
          <div class="notif-card-body">${n.message}</div>
        </div>
      </div>
    `;
  }).join('');
}
