/**
 * ATSOCA Elite Dashboard - Standalone Sign Up Controller
 */
import { db } from './dbState.js';

document.addEventListener('DOMContentLoaded', () => {
  // Sync Saved Theme
  const savedTheme = localStorage.getItem('atsoca_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  document.body.setAttribute('data-theme', savedTheme);

  // Tier package radio selection styling listener
  document.querySelectorAll('input[name="signup-tier"]').forEach(radio => {
    radio.addEventListener('change', () => {
      document.querySelectorAll('.tier-option-card').forEach(card => card.classList.remove('active'));
      const activeCard = radio.closest('.tier-option-card');
      if (activeCard) activeCard.classList.add('active');
    });
  });

  // Global Sign Up Handler
  window.handleSignUp = () => {
    const name = document.querySelector('#signup-name')?.value.trim();
    const email = document.querySelector('#signup-email')?.value.trim();
    const signupErrorAlert = document.querySelector('#signup-error-alert');

    if (!email) {
      if (signupErrorAlert) {
        signupErrorAlert.innerText = 'Please enter your email address.';
        signupErrorAlert.style.display = 'block';
        signupErrorAlert.classList.remove('hidden');
      }
      return;
    }

    const emailVal = email.toLowerCase();

    // Check match against official accounts
    const existingMember = db.data.members.find(m => m.email && m.email.toLowerCase() === emailVal);
    let matchedRole = null;
    let matchedMemberId = '004';

    if (emailVal.includes('admin@atsoca.ph') || emailVal === 'admin') {
      matchedRole = 'Administrator';
    } else if (emailVal.includes('manager@atsoca.ph') || emailVal === 'manager') {
      matchedRole = 'Elite Manager';
    } else if (emailVal.includes('finance@atsoca.ph') || emailVal === 'finance') {
      matchedRole = 'Finance';
    } else if (existingMember) {
      matchedRole = 'Elite Member';
      matchedMemberId = existingMember.id;
    }

    if (!matchedRole) {
      if (signupErrorAlert) {
        signupErrorAlert.innerText = 'Registration Restricted: Only official Elite Member accounts (004 to 008) and official management roles (Administrator, Elite Manager, Finance) are permitted access.';
        signupErrorAlert.style.display = 'block';
        signupErrorAlert.classList.remove('hidden');
      }
      return;
    }

    localStorage.setItem('atsoca_logged_in', 'true');
    db.setRole(matchedRole, matchedMemberId);

    const container = document.querySelector('.login-split-container');
    if (container) container.classList.add('portal-page-exit');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 150);
  };

  const signupForm = document.querySelector('#signup-standalone-form');
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      window.handleSignUp();
    });
  }

  const btnSubmitSignup = document.querySelector('#btn-submit-signup');
  if (btnSubmitSignup) {
    btnSubmitSignup.addEventListener('click', (e) => {
      e.preventDefault();
      window.handleSignUp();
    });
  }

  // Toggle Password Visibility
  const toggleVisibility = (btnId, inputId, iconId) => {
    const btn = document.querySelector(btnId);
    const input = document.querySelector(inputId);
    const icon = document.querySelector(iconId);
    if (btn && input) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        if (icon) icon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
      });
    }
  };

  toggleVisibility('#btn-toggle-signup-password', '#signup-password', '#icon-toggle-signup-password');
  toggleVisibility('#btn-toggle-signup-confirm', '#signup-confirm-password', '#icon-toggle-signup-confirm');

  // Enter Key Listener
  document.querySelectorAll('#signup-standalone-form input').forEach(input => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.keyCode === 13) {
        e.preventDefault();
        window.handleSignUp();
      }
    });
  });

  // Smooth transition when clicking ALREADY HAVE AN ACCOUNT? SIGN IN
  const btnGotoLogin = document.querySelector('#btn-goto-login');
  if (btnGotoLogin) {
    btnGotoLogin.addEventListener('click', (e) => {
      e.preventDefault();
      const container = document.querySelector('.login-split-container');
      if (container) container.classList.add('portal-page-exit');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 200);
    });
  }
});
