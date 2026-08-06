/**
 * Atsoca Elite Dashboard Main Controller
 */
import { db } from './dbState.js';
import { getEliteLevel } from './matrixEngine.js';
import { renderOverview } from './modules/overview.js';
import { renderPublicEnrollments } from './modules/publicEnrollments.js';
import { renderInvites } from './modules/invites.js';
import { renderEnrollments } from './modules/enrollments.js';
import { renderAnalytics } from './modules/analytics.js';
import { renderUnits } from './modules/units.js';
import { renderLevelTracker } from './modules/levelTracker.js';
import { renderLeaderboard } from './modules/leaderboard.js';
import { renderReferralFees } from './modules/referralFees.js';
import { renderReleases } from './modules/releases.js';
import { renderNotifications } from './modules/notifications.js';
import { renderReports } from './modules/reports.js';
import { renderAdmin } from './modules/admin.js';
import { renderProfileModal } from './modules/profile.js';

class AppController {
  constructor() {
    this.currentTab = 'overview';
    this.init();
  }

  init() {
    try { this.cacheElements(); } catch (e) { console.warn('cacheElements:', e); }
    try { this.initTheme(); } catch (e) { console.warn('initTheme:', e); }
    try { this.initLoginSession(); } catch (e) { console.warn('initLoginSession:', e); }
    try { this.initSecurityModal(); } catch (e) { console.warn('initSecurityModal:', e); }
    try { this.updateAdminNavVisibility(); } catch (e) { console.warn('updateAdminNavVisibility:', e); }
    try { this.updateProfileWidget(); } catch (e) { console.warn('updateProfileWidget:', e); }
    try { this.bindEvents(); } catch (e) { console.warn('bindEvents:', e); }
    try { this.subscribeState(); } catch (e) { console.warn('subscribeState:', e); }
    try { this.renderActiveTab(); } catch (e) { console.warn('renderActiveTab:', e); }
    try { this.updateNotificationBadge(); } catch (e) { console.warn('updateNotificationBadge:', e); }
  }

  cacheElements() {
    this.roleSelect = document.querySelector('#header-role-select');
    this.memberSelect = document.querySelector('#header-member-select');
    this.navItems = document.querySelectorAll('.nav-item');
    this.contentContainer = document.querySelector('#content-mount');
    this.pageTitle = document.querySelector('#page-title');
    this.btnNotif = document.querySelector('#btn-notif-toggle');
    this.btnThemeToggle = document.querySelector('#btn-theme-toggle');
    this.themeToggleIcon = document.querySelector('#theme-toggle-icon');
    this.notifDrawer = document.querySelector('#notifications-drawer');
    this.notifBadge = document.querySelector('#notif-badge-dot');
    this.currentUserAvatar = document.querySelector('#current-user-avatar');
    this.currentUserName = document.querySelector('#current-user-name');
    this.currentUserRole = document.querySelector('#current-user-role');
  }

  initTheme() {
    const savedTheme = localStorage.getItem('atsoca_theme') || 'light';
    this.setTheme(savedTheme);
  }

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('atsoca_theme', theme);

    const icon = document.querySelector('#theme-toggle-icon');
    const btn = document.querySelector('#btn-theme-toggle');

    if (icon) {
      if (theme === 'dark') {
        icon.className = 'fas fa-sun';
        if (btn) btn.title = 'Switch to Light Mode';
      } else {
        icon.className = 'fas fa-moon';
        if (btn) btn.title = 'Switch to Dark Mode';
      }
    }
  }

  toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme') || 'light';
    const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(nextTheme);
    this.renderActiveTab();
  }

  initLoginSession() {
    const loginScreen = document.querySelector('#login-screen');
    const loginForm = document.querySelector('#login-form');
    const loginEmail = document.querySelector('#login-email');

    // Check saved login state (defaults to showing full active dashboard)
    if (localStorage.getItem('atsoca_logged_in') === null) {
      localStorage.setItem('atsoca_logged_in', 'true');
    }

    const isLoggedIn = localStorage.getItem('atsoca_logged_in') !== 'false';

    if (!isLoggedIn) {
      if (loginScreen) {
        loginScreen.classList.remove('hidden');
        loginScreen.style.display = 'flex';
      }
    } else {
      if (loginScreen) {
        loginScreen.classList.add('hidden');
        loginScreen.style.display = 'none';
      }
    }

    // Global Sign In Action Handler
    window.handleSignIn = () => {
      const rawEmail = loginEmail ? loginEmail.value.trim() : '';
      const emailVal = rawEmail ? rawEmail.toLowerCase() : 'ellaine.joyce@atsoca.ph';
      const passwordInput = document.querySelector('#login-password');
      const pwdVal = passwordInput ? passwordInput.value.trim() : '12345';
      const loginErrorAlert = document.querySelector('#login-error-alert');

      if (loginErrorAlert) {
        loginErrorAlert.style.display = 'none';
        loginErrorAlert.classList.add('hidden');
      }

      // Find member matching entered email
      let matchedMember = db.data.members.find(m => m.email && m.email.toLowerCase() === emailVal);

      let role = 'Elite Member';
      let memberId = 'ELITE-101';

      if (matchedMember) {
        role = matchedMember.role || 'Elite Member';
        memberId = matchedMember.id;
      } else if (emailVal.includes('admin')) {
        role = 'Administrator';
        memberId = db.data.members[0]?.id || 'ELITE-101';
      } else if (emailVal.includes('manager')) {
        role = 'Elite Manager';
        memberId = db.data.members[0]?.id || 'ELITE-101';
      } else if (emailVal.includes('finance')) {
        role = 'Finance';
        memberId = db.data.members[0]?.id || 'ELITE-101';
      } else {
        // Auto-create user account seamlessly so sign-in ALWAYS succeeds without blocking
        const displayName = rawEmail ? (rawEmail.split('@')[0].replace(/[\._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())) : 'Elite Member';
        matchedMember = db.addMember({
          name: displayName,
          email: emailVal,
          password: pwdVal || '12345',
          role: 'Elite Member',
          totalUnits: 25
        });
        role = 'Elite Member';
        memberId = matchedMember.id;
      }

      localStorage.setItem('atsoca_logged_in', 'true');
      db.setRole(role, memberId);

      if (loginScreen) {
        loginScreen.classList.add('hidden');
        loginScreen.style.display = 'none';
      }
      this.updateProfileWidget();
      this.renderActiveTab();
    };

    // Form submission (Login) listener
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        window.handleSignIn();
      });
    }

    const btnSubmitSignin = document.querySelector('#btn-submit-signin');
    if (btnSubmitSignin) {
      btnSubmitSignin.addEventListener('click', (e) => {
        e.preventDefault();
        window.handleSignIn();
      });
    }

    // Quick Role Demo Sign In buttons (1-Click Sign In)
    document.querySelectorAll('.btn-quick-login').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetEmail = btn.getAttribute('data-email') || 'ellaine.joyce@atsoca.ph';
        const targetRole = btn.getAttribute('data-role') || 'Elite Member';

        if (loginEmail) loginEmail.value = targetEmail;
        const passwordInput = document.querySelector('#login-password');
        if (passwordInput) passwordInput.value = '12345';

        const matchedMember = db.data.members.find(m => m.email && m.email.toLowerCase() === targetEmail.toLowerCase());
        const memberId = matchedMember ? matchedMember.id : (db.data.members[0]?.id || 'ELITE-101');

        localStorage.setItem('atsoca_logged_in', 'true');
        db.setRole(targetRole, memberId);

        if (loginScreen) {
          loginScreen.classList.add('hidden');
          loginScreen.style.display = 'none';
        }
        this.updateProfileWidget();
        this.renderActiveTab();
      });
    });

    // Smooth transition to sign up page
    const btnLoginSignup = document.querySelector('#btn-login-signup');
    if (btnLoginSignup) {
      btnLoginSignup.addEventListener('click', (e) => {
        e.preventDefault();
        const container = document.querySelector('.login-split-container');
        if (container) container.classList.add('portal-page-exit');
        setTimeout(() => {
          window.location.href = 'signup.html';
        }, 200);
      });
    }

    // Logout Button Listener
    document.addEventListener('click', (e) => {
      const logoutBtn = e.target.closest('#btn-logout');
      if (logoutBtn) {
        e.preventDefault();
        localStorage.setItem('atsoca_logged_in', 'false');
        if (loginScreen) {
          loginScreen.classList.remove('hidden');
          loginScreen.style.display = 'flex';
        }
      }
    });
  }

  promptSecurityVerification(targetRole, targetMemberId) {
    const modal = document.querySelector('#security-auth-modal');
    const label = document.querySelector('#security-target-account-label');
    const input = document.querySelector('#security-auth-password');
    const alertBox = document.querySelector('#security-error-alert');

    if (!modal) return;

    this.pendingSwitchRole = targetRole;
    this.pendingSwitchMemberId = targetMemberId;

    let targetName = targetRole;
    if (targetRole === 'Elite Member') {
      const member = db.data.members.find(m => m.id === targetMemberId);
      if (member) targetName = `${member.name} (${member.id})`;
    }

    if (label) label.innerText = `Switching Access To: ${targetName}`;
    if (input) input.value = '';
    if (alertBox) {
      alertBox.innerText = '';
      alertBox.style.display = 'none';
      alertBox.classList.add('hidden');
    }

    modal.classList.add('active');
  }

  initSecurityModal() {
    const modal = document.querySelector('#security-auth-modal');
    const closeBtn = document.querySelector('#security-close-modal');
    const cancelBtn = document.querySelector('#security-cancel-btn');
    const form = document.querySelector('#security-form-auth');
    const input = document.querySelector('#security-auth-password');
    const alertBox = document.querySelector('#security-error-alert');

    const closeModal = () => {
      if (modal) modal.classList.remove('active');
      this.pendingSwitchRole = null;
      this.pendingSwitchMemberId = null;
      // Ensure dropdowns stay synced to current profile
      if (this.roleSelect) this.roleSelect.value = db.activeRole;
      if (this.memberSelect) this.memberSelect.value = db.currentMemberId;
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const pwd = input ? input.value.trim() : '';
        const currentMember = db.getCurrentMember();
        const storedPwd = currentMember ? (currentMember.password || '12345') : '12345';

        // STRICT password validation: MUST be '12345' or custom account password
        const isValid = (pwd !== '' && (pwd === '12345' || pwd === storedPwd));

        if (!isValid) {
          if (alertBox) {
            alertBox.innerText = 'Security Alert: Access Denied. Incorrect password! Enter "12345".';
            alertBox.style.display = 'block';
            alertBox.classList.remove('hidden');
          }
          return;
        }

        // Security Passed - Execute Account Switch
        if (this.pendingSwitchRole) {
          db.setRole(this.pendingSwitchRole, this.pendingSwitchMemberId || 'ELITE-101');
          if (this.roleSelect) this.roleSelect.value = db.activeRole;
          if (this.memberSelect) this.memberSelect.value = db.currentMemberId;
          this.updateProfileWidget();
          this.renderActiveTab();
        }

        closeModal();
      });
    }
  }

  bindEvents() {
    // Document-wide Click Delegation for Theme, Tabs, Modals, and Action Buttons
    document.addEventListener('click', (e) => {
      // 1. Theme toggle click
      const themeBtn = e.target.closest('#btn-theme-toggle');
      if (themeBtn) {
        e.preventDefault();
        this.toggleTheme();
        return;
      }

      // 2. Sidebar & Nav Routing click
      const navItem = e.target.closest('.nav-item[data-tab]');
      if (navItem) {
        e.preventDefault();
        const tab = navItem.getAttribute('data-tab');
        if (tab) {
          this.switchTab(tab);
        }
        return;
      }

      // 3. Quick & Section Action Buttons for Invites & Release Modals
      const btnOpenInvite = e.target.closest('#open-add-invite, #btn-quick-invite');
      if (btnOpenInvite) {
        e.preventDefault();
        const modal = document.querySelector('#modal-add-invite');
        const emailInput = document.querySelector('#invite-referrer-email');
        const dateInput = document.querySelector('#invite-training-date');
        const member = db.getCurrentMember();
        if (emailInput && member) emailInput.value = member.email || 'ellaine.joyce@atsoca.ph';
        if (dateInput) dateInput.value = new Date(Date.now() + 14*86400000).toISOString().split('T')[0];
        if (modal) modal.classList.add('active');
        return;
      }

      const btnOpenRelease = e.target.closest('#open-release-modal, #btn-quick-release');
      if (btnOpenRelease) {
        e.preventDefault();
        const modal = document.querySelector('#modal-release-request');
        const emailInput = document.querySelector('#release-referrer-email');
        const amountInput = document.querySelector('#release-amount');
        const member = db.getCurrentMember();
        if (emailInput && member) emailInput.value = member.email || 'ellaine.joyce@atsoca.ph';
        if (amountInput && member) amountInput.value = member.availableForRelease || 28400;
        if (modal) modal.classList.add('active');
        return;
      }

      // 4. Global + Add Profile Header Button
      const btnHeaderAdd = e.target.closest('#btn-header-add-profile');
      if (btnHeaderAdd) {
        e.preventDefault();
        const globalModal = document.querySelector('#global-modal-add-member');
        if (globalModal) globalModal.classList.add('active');
        return;
      }

      // 5. Sidebar User Box Click -> Profile Edit Modal
      const sidebarUserBox = e.target.closest('#sidebar-user-box-click');
      if (sidebarUserBox) {
        e.preventDefault();
        const profileModal = document.querySelector('#modal-edit-user-profile');
        const profileModalBody = document.querySelector('#modal-user-profile-body');
        if (profileModal && profileModalBody) {
          renderProfileModal(profileModalBody, () => {
            this.updateProfileWidget();
            this.renderActiveTab();
          });
          profileModal.classList.add('active');
        }
        return;
      }

      // 6. Close buttons for overlays
      const modalCloseBtn = e.target.closest('.modal-close, #global-cancel-add-member, #security-cancel-btn');
      if (modalCloseBtn) {
        const overlay = modalCloseBtn.closest('.modal-overlay');
        if (overlay) overlay.classList.remove('active');
        return;
      }
    });

    // Intercept Role Selector change with Security Verification
    if (this.roleSelect) {
      this.roleSelect.addEventListener('change', (e) => {
        const targetRole = e.target.value;
        const targetMemberId = this.memberSelect ? this.memberSelect.value : 'ELITE-101';
        this.roleSelect.value = db.activeRole;
        this.promptSecurityVerification(targetRole, targetMemberId);
      });
    }

    // Intercept Member Selector change with Security Verification
    if (this.memberSelect) {
      this.memberSelect.addEventListener('change', (e) => {
        const targetRole = db.activeRole;
        const targetMemberId = e.target.value;
        this.memberSelect.value = db.currentMemberId;
        this.promptSecurityVerification(targetRole, targetMemberId);
      });
    }

    // Notification Drawer Toggle & Filter Events
    if (this.btnNotif) {
      this.btnNotif.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.notifDrawer) {
          const isActive = this.notifDrawer.classList.toggle('active');
          if (isActive) {
            renderNotifications(document.querySelector('#drawer-notif-content'), 'all');
          }
        }
      });
    }

    const btnCloseNotif = document.querySelector('#btn-close-notif-drawer');
    if (btnCloseNotif) {
      btnCloseNotif.addEventListener('click', () => {
        if (this.notifDrawer) this.notifDrawer.classList.remove('active');
      });
    }

    const btnMarkAllHeader = document.querySelector('#btn-mark-all-read-header');
    if (btnMarkAllHeader) {
      btnMarkAllHeader.addEventListener('click', () => {
        if (db && db.data && Array.isArray(db.data.notifications)) {
          db.data.notifications.forEach(n => n.read = true);
          db.save();
        }
        renderNotifications(document.querySelector('#drawer-notif-content'), 'all');
        this.updateNotificationBadge();
      });
    }

    // Filter tab buttons in Notification Drawer
    document.querySelectorAll('.notif-tab').forEach(tabBtn => {
      tabBtn.addEventListener('click', () => {
        document.querySelectorAll('.notif-tab').forEach(b => b.classList.remove('active'));
        tabBtn.classList.add('active');
        const filter = tabBtn.getAttribute('data-filter');
        renderNotifications(document.querySelector('#drawer-notif-content'), filter);
      });
    });

    // Global Add Member Form Submit
    const globalForm = document.querySelector('#global-form-add-member');
    if (globalForm) {
      globalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.querySelector('#global-mem-name').value;
        const email = document.querySelector('#global-mem-email').value;
        const units = document.querySelector('#global-mem-units').value;
        const role = document.querySelector('#global-mem-role').value;

        const newMember = db.addMember({ name, email, totalUnits: units, role });
        db.setRole('Elite Member', newMember.id);
        const globalModal = document.querySelector('#global-modal-add-member');
        if (globalModal) globalModal.classList.remove('active');
        alert(`New Member Profile created successfully!\n\nID: ${newMember.id}\nName: ${newMember.name}`);
      });
    }

    // Submit New Invite Form Listener
    const formSubmitInvite = document.querySelector('#form-submit-new-invite');
    if (formSubmitInvite) {
      formSubmitInvite.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.querySelector('#invite-participant-name')?.value.trim();
        const schoolCompany = document.querySelector('#invite-school-company')?.value.trim();
        const trainingType = document.querySelector('#invite-training-type')?.value;
        const trainingDate = document.querySelector('#invite-training-date')?.value;
        const referrerEmail = document.querySelector('#invite-referrer-email')?.value;

        if (!name || !schoolCompany || !trainingType || !trainingDate) {
          alert('Please complete all required invite fields.');
          return;
        }

        db.submitInvite({
          inviteName: name,
          schoolCompany: schoolCompany,
          trainingType: trainingType,
          trainingDate: trainingDate,
          referrerEmail: referrerEmail
        });

        const modal = document.querySelector('#modal-add-invite');
        if (modal) modal.classList.remove('active');
        formSubmitInvite.reset();
        alert(`Success! Invite for ${name} submitted to Elite Database & Google Sheets.`);
        this.renderActiveTab();
      });
    }

    // Submit Fee Release Request Form Listener
    const formSubmitRelease = document.querySelector('#form-submit-release-request');
    if (formSubmitRelease) {
      formSubmitRelease.addEventListener('submit', (e) => {
        e.preventDefault();
        const amount = Number(document.querySelector('#release-amount')?.value || 0);
        const method = document.querySelector('#release-disbursement-method')?.value;
        const notes = document.querySelector('#release-notes')?.value;
        const referrerEmail = document.querySelector('#release-referrer-email')?.value;

        if (!amount || amount <= 0) {
          alert('Please enter a valid release payout amount.');
          return;
        }

        const member = db.getCurrentMember();
        if (member && amount > member.availableForRelease) {
          alert(`Requested amount (₱${amount.toLocaleString()}) exceeds available balance (₱${member.availableForRelease.toLocaleString()}).`);
          return;
        }

        db.submitReleaseRequest(amount, method, notes, referrerEmail);

        const modal = document.querySelector('#modal-release-request');
        if (modal) modal.classList.remove('active');
        formSubmitRelease.reset();
        alert(`Success! Referral fee release request for ₱${amount.toLocaleString()} submitted to Finance.`);
        this.renderActiveTab();
      });
    }

    if (profileModalClose && profileModal) {
      profileModalClose.addEventListener('click', () => {
        profileModal.classList.remove('active');
      });
    }
  }

  subscribeState() {
    db.subscribe(() => {
      this.populateMemberSelect();
      this.updateProfileWidget();
      this.updateAdminNavVisibility();
      this.updateNotificationBadge();
      this.renderActiveTab();
    });
  }

  updateAdminNavVisibility() {
    const role = db ? db.activeRole : 'Elite Member';
    const isFinanceOrAdmin = role === 'Finance' || role === 'Administrator';

    const publicEnrollmentLink = document.querySelector('.nav-item[data-tab="public-enrollments"]');
    if (publicEnrollmentLink) {
      publicEnrollmentLink.style.display = isFinanceOrAdmin ? 'flex' : 'none';
    }

    const adminLink = document.querySelector('.nav-item[data-tab="admin"]');
    if (adminLink) {
      adminLink.style.display = (role === 'Administrator') ? 'flex' : 'none';
    }

    if (!isFinanceOrAdmin && this.currentTab === 'public-enrollments') {
      this.currentTab = 'overview';
      this.navItems.forEach(item => {
        if (item.getAttribute('data-tab') === 'overview') {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    }
  }

  populateMemberSelect() {
    if (!this.memberSelect) return;
    const currentVal = db ? db.currentMemberId : 'ELITE-101';
    const members = (db && db.data && Array.isArray(db.data.members)) ? db.data.members : [];
    if (members.length === 0) return;
    this.memberSelect.innerHTML = members.map(m => {
      if (!m) return '';
      const level = getEliteLevel(m.totalUnits || 0);
      return `<option value="${m.id}" ${m.id === currentVal ? 'selected' : ''}>${m.name || 'Member'} (${level.name})</option>`;
    }).join('');
  }

  populateLoginMemberSelect() {
    const loginMemberId = document.querySelector('#login-member-id');
    if (!loginMemberId) return;
    const currentVal = loginMemberId.value || (db ? db.currentMemberId : 'ELITE-101');
    const members = (db && db.data && Array.isArray(db.data.members)) ? db.data.members : [];
    if (members.length === 0) return;
    loginMemberId.innerHTML = members.map(m => {
      if (!m) return '';
      const level = getEliteLevel(m.totalUnits || 0);
      return `<option value="${m.id}" ${m.id === currentVal ? 'selected' : ''}>${m.name || 'Member'} — ${level.name} Partner</option>`;
    }).join('');
  }

  updateProfileWidget() {
    try {
      this.populateMemberSelect();
      this.updateAdminNavVisibility();
      if (!db || db.activeRole === 'Elite Member') {
        const member = (db && typeof db.getCurrentMember === 'function' ? db.getCurrentMember() : null) || (db && db.data && db.data.members && db.data.members[0]) || { name: 'Ellaine Joyce', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', totalUnits: 44 };
        const level = getEliteLevel(member ? member.totalUnits : 44);
        if (this.currentUserName) this.currentUserName.innerText = member ? member.name : 'Ellaine Joyce';
        if (this.currentUserRole) this.currentUserRole.innerText = `${level.name} Partner`;
        if (this.currentUserAvatar && member && member.avatar) this.currentUserAvatar.src = member.avatar;
        if (this.memberSelect) this.memberSelect.style.display = 'inline-block';
      } else {
        const mgmtAccount = (db && typeof db.getManagementProfile === 'function' ? db.getManagementProfile(db.activeRole) : null) || { name: 'Management', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80' };
        if (this.currentUserName) this.currentUserName.innerText = mgmtAccount.name || 'Management';
        if (this.currentUserRole) this.currentUserRole.innerText = 'Admin Scope';
        if (this.currentUserAvatar && mgmtAccount.avatar) this.currentUserAvatar.src = mgmtAccount.avatar;
        if (this.memberSelect) this.memberSelect.style.display = 'none';
      }
    } catch (err) {
      console.warn('updateProfileWidget:', err);
    }
  }

  updateNotificationBadge() {
    const unread = db.data.notifications.some(n => !n.read);
    if (this.notifBadge) {
      this.notifBadge.style.display = unread ? 'block' : 'none';
    }
  }

  switchTab(tabKey) {
    this.currentTab = tabKey;
    this.navItems.forEach(item => {
      if (item.getAttribute('data-tab') === tabKey) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Titles mapping
    const titleMap = {
      'overview': 'Dashboard Overview',
      'public-enrollments': 'Public Enrollment Monitoring',
      'invites': 'Invite Monitoring',
      'enrollments': 'Enrollment & Payment Tracking',
      'analytics': 'Invite Analytics & Recruitment Performance',
      'units': 'Unit Monitoring & Conversion',
      'level-tracker': 'Elite Level Tracker',
      'leaderboard': 'Partner Leaderboard & Rank Tracking',
      'referral-fees': 'Referral Fee Monitoring (Memo 1 Matrix)',
      'releases': 'Referral Fee Release Workflow',
      'notifications': 'Notification Center',
      'reports': 'Downloadable Reports Engine',
      'admin': 'Administrator Console'
    };

    if (this.pageTitle) {
      this.pageTitle.innerText = titleMap[tabKey] || 'ATSOCA Elite Dashboard';
    }

    this.renderActiveTab();
  }

  renderActiveTab() {
    if (!this.contentContainer) {
      this.contentContainer = document.querySelector('#content-mount');
    }
    if (!this.contentContainer) return;
    this.contentContainer.innerHTML = '';

    try {
      switch (this.currentTab) {
        case 'overview':
          renderOverview(this.contentContainer);
          break;
        case 'public-enrollments':
          renderPublicEnrollments(this.contentContainer);
          break;
        case 'invites':
          renderInvites(this.contentContainer);
          break;
        case 'enrollments':
          renderEnrollments(this.contentContainer);
          break;
        case 'analytics':
          renderAnalytics(this.contentContainer);
          break;
        case 'units':
          renderUnits(this.contentContainer);
          break;
        case 'level-tracker':
          renderLevelTracker(this.contentContainer);
          break;
        case 'leaderboard':
          renderLeaderboard(this.contentContainer);
          break;
        case 'referral-fees':
          renderReferralFees(this.contentContainer);
          break;
        case 'releases':
          renderReleases(this.contentContainer);
          break;
        case 'notifications':
          renderNotifications(this.contentContainer);
          break;
        case 'reports':
          renderReports(this.contentContainer);
          break;
        case 'admin':
          renderAdmin(this.contentContainer);
          break;
        default:
          renderOverview(this.contentContainer);
          break;
      }
    } catch (err) {
      console.warn('Tab Render Fallback:', err);
      renderOverview(this.contentContainer);
    }
  }
}

// Instantiate AppController immediately and expose globally
const app = new AppController();
window.app = app;
window.switchTab = function(tabKey) {
  if (app && typeof app.switchTab === 'function') {
    app.switchTab(tabKey);
  }
};

