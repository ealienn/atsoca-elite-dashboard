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
    const role = 'Elite Member';
    const totalUnits = 25; // Default Bronze package (25 units)
    const password = document.querySelector('#signup-password')?.value;
    const confirmPassword = document.querySelector('#signup-confirm-password')?.value;

    if (!name || !email) {
      if (signupErrorAlert) {
        signupErrorAlert.innerText = 'Please enter your full name and email address.';
        signupErrorAlert.style.display = 'block';
        signupErrorAlert.classList.remove('hidden');
      }
      return;
    }

    // Validation
    if (password && confirmPassword && password !== confirmPassword) {
      if (signupErrorAlert) {
        signupErrorAlert.innerText = 'Passwords do not match. Please verify and try again.';
        signupErrorAlert.style.display = 'block';
        signupErrorAlert.classList.remove('hidden');
      }
      return;
    }

    if (password && password.length < 6) {
      if (signupErrorAlert) {
        signupErrorAlert.innerText = 'Password must be at least 6 characters long.';
        signupErrorAlert.style.display = 'block';
        signupErrorAlert.classList.remove('hidden');
      }
      return;
    }

    // Check duplicate email
    const existingMember = db.data.members.find(m => m.email && m.email.toLowerCase() === email.toLowerCase());
    if (existingMember) {
      // If already registered, log in directly as existing member!
      localStorage.setItem('atsoca_logged_in', 'true');
      db.setRole(existingMember.role || 'Elite Member', existingMember.id);
      window.location.href = 'index.html';
      return;
    }

    // Create new member in dbState
    const newMember = db.addMember({
      name: name,
      email: email,
      password: password || '12345',
      role: role,
      totalUnits: totalUnits,
      monthlyUnits: Math.min(totalUnits, 15),
      pendingFees: 0,
      availableForRelease: 0,
      releasedFees: 0
    });

    // Auto login as new member
    localStorage.setItem('atsoca_logged_in', 'true');
    db.setRole(role, newMember.id);

    // Smooth transition to main dashboard
    const container = document.querySelector('.login-split-container');
    if (container) container.classList.add('portal-page-exit');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 150);
  };

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
