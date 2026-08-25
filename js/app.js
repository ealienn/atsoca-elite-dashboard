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
    this.headerUserAvatar = document.querySelector('#header-user-avatar');
    this.headerUserName = document.querySelector('#header-user-name');
  }

  initTheme() {
    const savedTheme = localStorage.getItem('atsoca_theme') || 'light';
    this.setTheme(savedTheme);
  }

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('atsoca_theme', theme);

    const brandLogos = document.querySelectorAll('.brand-logo-img, .sidebar-logo-img, .top-logo-mark-img');
    brandLogos.forEach(img => {
      if (theme === 'light') {
        img.src = 'assets/logo.png';
      } else {
        img.src = 'assets/logo_white.png';
      }
    });

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
      const emailVal = rawEmail ? rawEmail.toLowerCase() : 'joshua.villafuerte@atsoca.ph';
      const passwordInput = document.querySelector('#login-password');
      const pwdVal = passwordInput ? passwordInput.value.trim() : '12345';
      const loginErrorAlert = document.querySelector('#login-error-alert');

      if (loginErrorAlert) {
        loginErrorAlert.style.display = 'none';
        loginErrorAlert.classList.add('hidden');
      }

      const OFFICIAL_MEMBER_EMAILS = {
        '004': 'joshua.villafuerte@atsoca.ph',
        '005': 'kent.lontok@atsoca.ph',
        '006': 'ce.box@atsoca.ph',
        '007': 'charlene.hilvano@atsoca.ph',
        '008': 'jenelle.mangubat@atsoca.ph'
      };

      let matchedMember = db.data.members.find(m => 
        (m.email && m.email.toLowerCase() === emailVal) ||
        (m.id && m.id.toLowerCase() === emailVal)
      );

      let role = null;
      let memberId = '004';

      if (emailVal.includes('admin@atsoca.ph') || emailVal === 'admin') {
        role = 'Administrator';
        memberId = db.data.members[0]?.id || '004';
      } else if (emailVal.includes('manager@atsoca.ph') || emailVal === 'manager') {
        role = 'Elite Manager';
        memberId = db.data.members[0]?.id || '004';
      } else if (emailVal.includes('finance@atsoca.ph') || emailVal === 'finance') {
        role = 'Finance';
        memberId = db.data.members[0]?.id || '004';
      } else if (matchedMember) {
        role = 'Elite Member';
        memberId = matchedMember.id;
      }

      const executeLoginWithAnimation = (role, memberId) => {
        const btnSubmitSignin = document.querySelector('#btn-submit-signin');
        const loginCardInner = document.querySelector('#login-card-inner');
        const appContainer = document.querySelector('#app-container');

        if (btnSubmitSignin) {
          btnSubmitSignin.disabled = true;
          btnSubmitSignin.classList.add('btn-logging-in');
          btnSubmitSignin.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> VERIFYING...';
        }

        setTimeout(() => {
          if (btnSubmitSignin) {
            btnSubmitSignin.classList.remove('btn-logging-in');
            btnSubmitSignin.classList.add('btn-login-success');
            btnSubmitSignin.innerHTML = '<i class="fas fa-check-circle"></i> WELCOME TO ELITE!';
          }

          if (loginCardInner) {
            loginCardInner.classList.add('login-success-card');
          }

          setTimeout(() => {
            if (loginScreen) {
              loginScreen.classList.add('login-fade-out');
            }

            localStorage.setItem('atsoca_logged_in', 'true');
            db.setRole(role, memberId);

            this.updateProfileWidget();
            this.renderActiveTab();

            if (appContainer) {
              appContainer.classList.remove('app-entrance-anim');
              void appContainer.offsetWidth; // trigger reflow
              appContainer.classList.add('app-entrance-anim');
            }

            setTimeout(() => {
              if (loginScreen) {
                loginScreen.classList.add('hidden');
                loginScreen.style.display = 'none';
                loginScreen.classList.remove('login-fade-out');
              }
              if (loginCardInner) {
                loginCardInner.classList.remove('login-success-card');
              }
              if (btnSubmitSignin) {
                btnSubmitSignin.disabled = false;
                btnSubmitSignin.classList.remove('btn-login-success');
                btnSubmitSignin.innerHTML = '<i class="fas fa-sign-in-alt"></i> SIGN IN';
              }
            }, 550);

          }, 350);

        }, 450);
      };

      this.executeLoginWithAnimation = executeLoginWithAnimation;

      if (!role) {
        if (loginErrorAlert) {
          loginErrorAlert.innerText = 'Access Denied: Account not authorized. Access is strictly restricted to the 4 official roles: Administrator, Elite Manager, Finance, and Elite Members (004 to 008).';
          loginErrorAlert.style.display = 'block';
          loginErrorAlert.classList.remove('hidden');
        }
        return;
      }

      executeLoginWithAnimation(role, memberId);
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

    // Password Visibility View Mode Toggle
    window.togglePasswordVisibility = function(inputId, iconId) {
      const input = document.getElementById(inputId);
      const icon = document.getElementById(iconId);
      if (input) {
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        if (icon) {
          icon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
        }
      }
    };

    const btnToggleLoginPwd = document.querySelector('#btn-toggle-login-password');
    if (btnToggleLoginPwd) {
      btnToggleLoginPwd.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.togglePasswordVisibility('login-password', 'icon-toggle-login-password');
      });
    }

    // Enter Key Keyboard Trigger for Sign In
    const loginInputElements = document.querySelectorAll('#login-form input');
    loginInputElements.forEach(input => {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.keyCode === 13) {
          e.preventDefault();
          window.handleSignIn();
        }
      });
    });

    // Quick Role Demo Sign In buttons (1-Click Sign In)
    document.querySelectorAll('.btn-quick-login').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetEmail = btn.getAttribute('data-email') || 'joshua.villafuerte@atsoca.ph';
        const targetRole = btn.getAttribute('data-role') || 'Elite Member';
        const targetMemberId = btn.getAttribute('data-member-id') || '004';

        if (loginEmail) loginEmail.value = targetEmail;
        const passwordInput = document.querySelector('#login-password');
        if (passwordInput) passwordInput.value = '12345';

        const matchedMember = db.data.members.find(m => m.id === targetMemberId || (m.email && m.email.toLowerCase() === targetEmail.toLowerCase()));
        const memberId = matchedMember ? matchedMember.id : targetMemberId;

        if (typeof this.executeLoginWithAnimation === 'function') {
          this.executeLoginWithAnimation(targetRole, memberId);
        } else {
          localStorage.setItem('atsoca_logged_in', 'true');
          db.setRole(targetRole, memberId);
          if (loginScreen) {
            loginScreen.classList.add('hidden');
            loginScreen.style.display = 'none';
          }
          this.updateProfileWidget();
          this.renderActiveTab();
        }
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

    // Global Logout Handler
    window.handleLogout = (e) => {
      this.handleLogout(e);
    };

    // Global Open Profile Modal Handler
    window.openProfileModal = () => {
      this.openProfileModal();
    };
  }

  openProfileModal() {
    const profileModal = document.querySelector('#modal-edit-user-profile') || document.querySelector('#profile-modal');
    const profileModalBody = document.querySelector('#modal-user-profile-body');
    if (profileModal && profileModalBody) {
      renderProfileModal(profileModalBody, () => {
        this.updateProfileWidget();
        this.renderActiveTab();
      });
      window.activeModalState = window.activeModalState || {};
      window.activeModalState.activeModalIds = window.activeModalState.activeModalIds || new Set();
      window.activeModalState.activeModalIds.add('modal-edit-user-profile');
      profileModal.classList.add('active');
    }
  }

  handleLogout(e) {
    if (e) {
      try { e.preventDefault(); } catch (err) {}
      try { e.stopPropagation(); } catch (err) {}
    }
    localStorage.setItem('atsoca_logged_in', 'false');
    
    const hideStyle = document.getElementById('login-hide-style');
    if (hideStyle) hideStyle.remove();

    const loginScreen = document.querySelector('#login-screen');
    if (loginScreen) {
      loginScreen.classList.remove('hidden');
      loginScreen.style.setProperty('display', 'flex', 'important');
      loginScreen.style.setProperty('visibility', 'visible', 'important');
      loginScreen.style.setProperty('opacity', '1', 'important');
      loginScreen.style.setProperty('pointer-events', 'auto', 'important');
    } else {
      window.location.reload();
    }
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
          db.setRole(this.pendingSwitchRole, this.pendingSwitchMemberId || '004');
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
    // 1. Dedicated Isolated Event Listeners for Profile Triggers (Navbar & Sidebar)
    const profileElements = document.querySelectorAll('#btn-profile, #sidebar-user-box-click, #user-profile-btn, .user-profile-btn');
    profileElements.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.openProfileModal();
      });
    });

    // 2. Dedicated Isolated Event Listeners for Logout Buttons
    const logoutElements = document.querySelectorAll('#btn-logout, .btn-logout-icon, .logout-btn, #btn-header-logout');
    logoutElements.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.handleLogout(e);
      });
    });

    // 3. Document-wide Click Delegation for remaining interactive elements
    document.addEventListener('click', (e) => {
      // Standalone Logout click delegation check
      const logoutTarget = e.target.closest('#btn-logout, .btn-logout-icon, .logout-btn, #btn-header-logout');
      if (logoutTarget) {
        e.preventDefault();
        e.stopPropagation();
        this.handleLogout(e);
        return;
      }

      // Standalone Profile click delegation check
      const profileTarget = e.target.closest('#btn-profile, #sidebar-user-box-click, #user-profile-btn, .user-profile-btn');
      if (profileTarget) {
        e.preventDefault();
        e.stopPropagation();
        this.openProfileModal();
        return;
      }

      // Theme toggle click
      const themeBtn = e.target.closest('#btn-theme-toggle');
      if (themeBtn) {
        e.preventDefault();
        this.toggleTheme();
        return;
      }

      // Sidebar & Nav Routing click
      const navItem = e.target.closest('.nav-item[data-tab]');
      if (navItem) {
        e.preventDefault();
        const tab = navItem.getAttribute('data-tab');
        if (tab) {
          this.switchTab(tab);
        }
        return;
      }

      // Quick & Section Action Buttons for Invites & Release Modals
      const btnOpenInvite = e.target.closest('#open-add-invite, #btn-quick-invite');
      if (btnOpenInvite) {
        e.preventDefault();
        const modal = document.querySelector('#modal-add-invite');
        const emailInput = document.querySelector('#invite-referrer-email');
        const dateInput = document.querySelector('#invite-training-date');
        const member = db.getCurrentMember();
        if (emailInput && member) emailInput.value = member.email || 'joshua.villafuerte@atsoca.ph';
        if (dateInput) dateInput.value = new Date(Date.now() + 14*86400000).toISOString().split('T')[0];
        if (modal) {
          window.activeModalState = window.activeModalState || {};
          window.activeModalState.activeModalIds = window.activeModalState.activeModalIds || new Set();
          window.activeModalState.activeModalIds.add('modal-add-invite');
          modal.classList.add('active');
        }
        return;
      }

      const btnOpenRelease = e.target.closest('#open-release-modal, #btn-quick-release');
      if (btnOpenRelease) {
        e.preventDefault();
        const modal = document.querySelector('#modal-release-request');
        const emailInput = document.querySelector('#release-referrer-email');
        const amountInput = document.querySelector('#release-amount');
        const member = db.getCurrentMember();
        if (emailInput && member) emailInput.value = member.email || 'joshua.villafuerte@atsoca.ph';
        if (amountInput && member) amountInput.value = member.availableForRelease || 24050;
        if (modal) {
          window.activeModalState = window.activeModalState || {};
          window.activeModalState.activeModalIds = window.activeModalState.activeModalIds || new Set();
          window.activeModalState.activeModalIds.add('modal-release-request');
          modal.classList.add('active');
        }
        return;
      }

      // Global + Add Profile Header Button
      const btnHeaderAdd = e.target.closest('#btn-header-add-profile');
      if (btnHeaderAdd) {
        e.preventDefault();
        const globalModal = document.querySelector('#global-modal-add-member');
        if (globalModal) {
          window.activeModalState = window.activeModalState || {};
          window.activeModalState.activeModalIds = window.activeModalState.activeModalIds || new Set();
          window.activeModalState.activeModalIds.add('global-modal-add-member');
          globalModal.classList.add('active');
        }
        return;
      }

      // Close buttons for overlays - ONLY triggered by explicit modal close buttons
      const modalCloseBtn = e.target.closest('.modal-close, #close-modal-user-profile, #global-close-modal-member, #global-cancel-add-member, #security-cancel-btn, #security-close-modal, #btn-close-notif-drawer');
      if (modalCloseBtn) {
        const overlay = modalCloseBtn.closest('.modal-overlay, .notif-drawer');
        if (overlay) {
          overlay.classList.remove('active');
          if (window.activeModalState) {
            if (window.activeModalState.activeModalIds && overlay.id) {
              window.activeModalState.activeModalIds.delete(overlay.id);
            }
            if (overlay.id === 'modal-inspect-account') window.activeModalState.inspectMemberId = null;
            if (overlay.id === 'modal-adjust-units') window.activeModalState.unitsMemberId = null;
          }
        }
        return;
      }
    });

    // Intercept Role Selector change with Security Verification
    if (this.roleSelect) {
      this.roleSelect.addEventListener('change', (e) => {
        const targetRole = e.target.value;
        const targetMemberId = this.memberSelect ? this.memberSelect.value : '004';
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

        formSubmitRelease.reset();
        alert(`Success! Referral fee release request for ₱${amount.toLocaleString()} submitted to Finance.`);
        this.renderActiveTab();
      });
    }

    const profileModalClose = document.querySelector('#close-modal-user-profile');
    const profileModal = document.querySelector('#modal-edit-user-profile');
    if (profileModalClose && profileModal) {
      profileModalClose.addEventListener('click', () => {
        if (window.activeModalState && window.activeModalState.activeModalIds) {
          window.activeModalState.activeModalIds.delete('modal-edit-user-profile');
        }
        profileModal.classList.remove('active');
      });
    }
  }

  subscribeState() {
    db.subscribe(() => {
      const inspectMemId = window.activeModalState ? window.activeModalState.inspectMemberId : null;
      const unitsMemId = window.activeModalState ? window.activeModalState.unitsMemberId : null;
      const openIds = (window.activeModalState && window.activeModalState.activeModalIds) ? Array.from(window.activeModalState.activeModalIds) : [];

      this.populateMemberSelect();
      this.updateProfileWidget();
      this.updateAdminNavVisibility();
      this.updateNotificationBadge();
      this.renderActiveTab();

      // Restore active inspect account modal if it was open
      if (inspectMemId && typeof window.reopenInspectModal === 'function') {
        window.reopenInspectModal(inspectMemId);
      }
      // Restore active units adjustment modal if it was open
      if (unitsMemId && typeof window.reopenUnitsAdjustmentModal === 'function') {
        window.reopenUnitsAdjustmentModal(unitsMemId);
      }
      // Restore any generic open modals
      openIds.forEach(id => {
        if (id !== 'modal-inspect-account' && id !== 'modal-adjust-units') {
          const el = document.querySelector(`#${id}`);
          if (el) {
            el.classList.add('active');
          }
        }
      });
    });
  }

  updateAdminNavVisibility() {
    const role = db ? db.activeRole : 'Elite Member';
    const isEliteMember = role === 'Elite Member';
    const isManagerOrFinance = role === 'Elite Manager' || role === 'Finance';
    const isAdmin = role === 'Administrator';

    const adminNavGroup = document.querySelector('#admin-nav-group');
    if (adminNavGroup) {
      adminNavGroup.style.display = isEliteMember ? 'none' : 'block';
    }

    const publicEnrollmentLink = document.querySelector('.nav-item[data-tab="public-enrollments"]');
    if (publicEnrollmentLink) {
      publicEnrollmentLink.style.display = isManagerOrFinance ? 'flex' : 'none';
    }

    const reportsLink = document.querySelector('.nav-item[data-tab="reports"]');
    if (reportsLink) {
      reportsLink.style.display = isManagerOrFinance ? 'flex' : 'none';
    }

    const notifLink = document.querySelector('.nav-item[data-tab="notifications"]');
    if (notifLink) {
      notifLink.style.display = isManagerOrFinance ? 'flex' : 'none';
    }

    const adminLink = document.querySelector('.nav-item[data-tab="admin"]');
    if (adminLink) {
      adminLink.style.display = isAdmin ? 'flex' : 'none';
    }

    if (!isAdmin && this.currentTab === 'admin') {
      this.currentTab = 'overview';
      this.navItems.forEach(item => {
        if (item.getAttribute('data-tab') === 'overview') {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    } else if (!isManagerOrFinance && ['notifications', 'public-enrollments', 'reports'].includes(this.currentTab) && !isAdmin) {
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
    const currentVal = db ? db.currentMemberId : '004';
    const members = (db && db.data && Array.isArray(db.data.members)) ? db.data.members : [];
    if (members.length === 0) return;
    this.memberSelect.innerHTML = members.map(m => {
      if (!m) return '';
      const level = getEliteLevel(m.totalUnits || 0);
      return `<option value="${m.id}" ${m.id === currentVal ? 'selected' : ''}>${m.id} - ${m.name || 'Member'} (${level.name})</option>`;
    }).join('');
  }

  populateLoginMemberSelect() {
    const loginMemberId = document.querySelector('#login-member-id');
    if (!loginMemberId) return;
    const currentVal = loginMemberId.value || (db ? db.currentMemberId : '004');
    const members = (db && db.data && Array.isArray(db.data.members)) ? db.data.members : [];
    if (members.length === 0) return;
    loginMemberId.innerHTML = members.map(m => {
      if (!m) return '';
      const level = getEliteLevel(m.totalUnits || 0);
      return `<option value="${m.id}" ${m.id === currentVal ? 'selected' : ''}>${m.id} - ${m.name || 'Member'} — ${level.name} Partner</option>`;
    }).join('');
  }

  updateProfileWidget() {
    try {
      this.populateMemberSelect();
      this.updateAdminNavVisibility();
      if (!db || db.activeRole === 'Elite Member') {
        const member = (db && typeof db.getCurrentMember === 'function' ? db.getCurrentMember() : null) || (db && db.data && db.data.members && db.data.members[0]) || { name: 'Joshua Villafuerte', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', totalUnits: 0.73 };
        const level = getEliteLevel(member ? member.totalUnits : 0.73);
        if (this.currentUserName) this.currentUserName.innerText = member ? member.name : 'Joshua Villafuerte';
        if (this.currentUserRole) this.currentUserRole.innerText = `${level.name} Partner`;
        if (this.currentUserAvatar && member && member.avatar) this.currentUserAvatar.src = member.avatar;
        if (this.headerUserName) this.headerUserName.innerText = member ? member.name : 'Joshua Villafuerte';
        if (this.headerUserAvatar && member && member.avatar) this.headerUserAvatar.src = member.avatar;
        if (this.memberSelect) this.memberSelect.style.display = 'inline-block';
      } else {
        const mgmtAccount = (db && typeof db.getManagementProfile === 'function' ? db.getManagementProfile(db.activeRole) : null) || { name: 'Management', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80' };
        if (this.currentUserName) this.currentUserName.innerText = mgmtAccount.name || 'Management';
        if (this.currentUserRole) this.currentUserRole.innerText = `${db.activeRole} Account`;
        if (this.currentUserAvatar && mgmtAccount.avatar) this.currentUserAvatar.src = mgmtAccount.avatar;
        if (this.headerUserName) this.headerUserName.innerText = mgmtAccount.name || 'Management';
        if (this.headerUserAvatar && mgmtAccount.avatar) this.headerUserAvatar.src = mgmtAccount.avatar;
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
          if (!db || db.activeRole !== 'Administrator') {
            this.switchTab('overview');
            return;
          }
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

