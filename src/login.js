/**
 * BLENDIFY AUTHENTICATION & ROLE ROUTING SYSTEM
 * Implements the Flowchart Lifecycle:
 * 1. First-time visit: Loads Login Screen.
 * 2. Login screen: Enters email & password (or Google SSO / demo accounts).
 * 3. Choose role: Selects Student or Teacher (one-time selection for new users).
 * 4. Branches to Student portal (loads student dashboard) or Teacher portal (loads teacher dashboard).
 * 5. Choice saved: Permanently saves role so return visits skip login entirely.
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // STORAGE KEYS & ROLES PERSISTENCE
  // =========================================================================
  const STORAGE_KEY_USER = 'blendify_auth_user';
  const STORAGE_KEY_ROLE = 'blendify_role';
  const STORAGE_KEY_ACCOUNTS_MAP = 'blendify_account_roles';

  // Preset demo accounts with pre-mapped roles
  function getAccountRolesMap() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ACCOUNTS_MAP);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    const defaultMap = {
      'alex.student@gmail.com': 'student',
      'harsh.teacher@blendify.edu': 'teacher',
      'elena.design@gmail.com': 'teacher'
    };
    try {
      localStorage.setItem(STORAGE_KEY_ACCOUNTS_MAP, JSON.stringify(defaultMap));
    } catch (e) {}
    return defaultMap;
  }

  function getSavedRoleForEmail(email) {
    if (!email) return null;
    const map = getAccountRolesMap();
    return map[email.trim().toLowerCase()] || null;
  }

  function saveRoleForEmail(email, role) {
    if (!email || !role) return;
    const map = getAccountRolesMap();
    map[email.trim().toLowerCase()] = role;
    localStorage.setItem(STORAGE_KEY_ACCOUNTS_MAP, JSON.stringify(map));
  }

  // Application State
  const state = {
    currentUser: null
  };

  // Toast Notification System
  const CHECK_SVG = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  const toastContainer = document.getElementById('toastContainer');
  function showToast(message, icon = CHECK_SVG) {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span class="toast-icon-box">${icon}</span><span>${message}</span>`;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // DOM Elements
  const sectionSignIn = document.getElementById('sectionSignIn');
  const sectionRoleSelection = document.getElementById('sectionRoleSelection');
  const googleAccountModal = document.getElementById('googleAccountModal');
  const authLoadingOverlay = document.getElementById('authLoadingOverlay');
  const loadingStatusText = document.getElementById('loadingStatusText');

  // Header Elements
  const signedInUserPill = document.getElementById('signedInUserPill');
  const headerUserAvatar = document.getElementById('headerUserAvatar');
  const headerUserName = document.getElementById('headerUserName');
  const headerUserEmail = document.getElementById('headerUserEmail');
  const btnSwitchAccount = document.getElementById('btnSwitchAccount');

  // Login Form Elements
  const formEmailPassword = document.getElementById('formEmailPassword');
  const inputEmail = document.getElementById('inputEmail');
  const inputPassword = document.getElementById('inputPassword');
  const btnTogglePassword = document.getElementById('btnTogglePassword');
  const checkRememberMe = document.getElementById('checkRememberMe');
  const btnForgotPassword = document.getElementById('btnForgotPassword');

  // Quick Demo Account Buttons
  const demoChipStudent = document.getElementById('demoChipStudent');
  const demoChipTeacher = document.getElementById('demoChipTeacher');
  const demoChipNew = document.getElementById('demoChipNew');

  // Google SSO Elements
  const btnGoogleSignIn = document.getElementById('btnGoogleSignIn');
  const btnCloseGoogleModal = document.getElementById('btnCloseGoogleModal');
  const btnToggleCustomEntry = document.getElementById('btnToggleCustomEntry');
  const customEntryForm = document.getElementById('customEntryForm');
  const btnSubmitCustomAccount = document.getElementById('btnSubmitCustomAccount');
  const customGoogleEmail = document.getElementById('customGoogleEmail');
  const customGoogleName = document.getElementById('customGoogleName');

  // Role Selection Cards & Buttons
  const cardChooseStudent = document.getElementById('cardChooseStudent');
  const cardChooseTeacher = document.getElementById('cardChooseTeacher');
  const btnEnterStudentPortal = document.getElementById('btnEnterStudentPortal');
  const btnEnterTeacherStudio = document.getElementById('btnEnterTeacherStudio');

  // Clean Account tags in Google Chooser modal
  function updateModalAccountTags() {
    document.querySelectorAll('.google-account-item').forEach(item => {
      const email = item.getAttribute('data-email');
      const role = getSavedRoleForEmail(email);
      const tagEl = item.querySelector('.acc-tag');
      if (tagEl) {
        if (role === 'student') {
          tagEl.className = 'acc-tag student';
          tagEl.textContent = 'Student';
        } else if (role === 'teacher') {
          tagEl.className = 'acc-tag teacher';
          tagEl.textContent = 'Teacher';
        } else {
          tagEl.className = 'acc-tag';
          tagEl.textContent = 'Google Account';
        }
      }
    });
  }

  // =========================================================================
  // VIEW SWITCHING
  // =========================================================================
  function renderSignInView() {
    sectionSignIn.style.display = 'block';
    sectionRoleSelection.style.display = 'none';
    signedInUserPill.style.display = 'none';
    updateModalAccountTags();
  }

  function renderRoleView() {
    sectionSignIn.style.display = 'none';
    sectionRoleSelection.style.display = 'block';

    if (state.currentUser) {
      signedInUserPill.style.display = 'flex';
      headerUserName.textContent = state.currentUser.name || 'User';
      headerUserEmail.textContent = state.currentUser.email || 'user@example.com';

      const firstLetter = (state.currentUser.name || state.currentUser.email || 'U').charAt(0).toUpperCase();
      if (headerUserAvatar) {
        headerUserAvatar.textContent = firstLetter;
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Check saved choice on initial page load: if already saved, skip login immediately
  try {
    const savedUserRaw = localStorage.getItem(STORAGE_KEY_USER);
    const savedRole = localStorage.getItem(STORAGE_KEY_ROLE);
    if (savedUserRaw && savedRole) {
      const savedUser = JSON.parse(savedUserRaw);
      state.currentUser = savedUser;

      if (savedRole === 'student') {
        window.location.replace('index.html');
        return;
      } else if (savedRole === 'teacher') {
        window.location.replace('create-course.html');
        return;
      }
    }
  } catch (e) {}

  // Otherwise, default to Login Screen for first-time or returning unauthenticated visit
  renderSignInView();

  // =========================================================================
  // PASSWORD VISIBILITY TOGGLE
  // =========================================================================
  btnTogglePassword?.addEventListener('click', () => {
    if (!inputPassword) return;
    const isPassword = inputPassword.type === 'password';
    inputPassword.type = isPassword ? 'text' : 'password';
    const eyeShow = btnTogglePassword.querySelector('.eye-show');
    const eyeHide = btnTogglePassword.querySelector('.eye-hide');
    if (eyeShow && eyeHide) {
      eyeShow.style.display = isPassword ? 'none' : 'block';
      eyeHide.style.display = isPassword ? 'block' : 'none';
    }
  });

  // Forgot password mock prompt
  btnForgotPassword?.addEventListener('click', () => {
    showToast('A password reset link has been dispatched to your email.');
  });

  // =========================================================================
  // AUTHENTICATION PROCESSOR (CORE FLOW)
  // =========================================================================
  function processAuthentication(user) {
    if (googleAccountModal) googleAccountModal.style.display = 'none';
    if (authLoadingOverlay) {
      authLoadingOverlay.style.display = 'flex';
      if (loadingStatusText) {
        loadingStatusText.textContent = `Signing in as ${user.name}...`;
      }
    }

    setTimeout(() => {
      if (authLoadingOverlay) authLoadingOverlay.style.display = 'none';
      state.currentUser = user;

      const email = user.email ? user.email.toLowerCase().trim() : '';
      const existingRole = getSavedRoleForEmail(email) || user.role;

      if (existingRole) {
        // CHOICE ALREADY SAVED FOR THIS ACCOUNT:
        // Skips login on return and loads portal directly!
        user.role = existingRole;
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
        localStorage.setItem(STORAGE_KEY_ROLE, existingRole);

        showToast(`Welcome back, ${user.name}!`);

        setTimeout(() => {
          if (existingRole === 'student') {
            window.location.href = 'index.html';
          } else {
            window.location.href = 'create-course.html';
          }
        }, 350);
      } else {
        // FIRST-TIME VISIT FOR THIS ACCOUNT:
        // Proceeds to Choose role screen (Student or teacher)
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
        renderRoleView();
        showToast(`Signed in as ${user.name}. Please choose your role.`);
      }
    }, 450);
  }

  // =========================================================================
  // EMAIL & PASSWORD FORM SUBMISSION
  // =========================================================================
  formEmailPassword?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = inputEmail?.value.trim();
    const password = inputPassword?.value;

    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address.');
      inputEmail?.focus();
      return;
    }

    if (!password || password.length < 3) {
      showToast('Please enter a password with at least 3 characters.');
      inputPassword?.focus();
      return;
    }

    // Derive display name from email or preset accounts
    let name = '';
    const lowerEmail = email.toLowerCase();
    if (lowerEmail === 'alex.student@gmail.com') {
      name = 'Alex Rivers';
    } else if (lowerEmail === 'harsh.teacher@blendify.edu') {
      name = 'Harsh Vardhan';
    } else if (lowerEmail === 'elena.design@gmail.com') {
      name = 'Elena Rostova';
    } else {
      const prefix = email.split('@')[0];
      name = prefix.charAt(0).toUpperCase() + prefix.slice(1);
    }

    processAuthentication({
      name,
      email,
      remember: checkRememberMe ? checkRememberMe.checked : true
    });
  });

  // =========================================================================
  // QUICK DEMO ACCOUNTS HELPER
  // =========================================================================
  demoChipStudent?.addEventListener('click', () => {
    if (inputEmail) inputEmail.value = 'alex.student@gmail.com';
    if (inputPassword) inputPassword.value = 'student123';
    showToast('Loaded Student demo account credentials.');
  });

  demoChipTeacher?.addEventListener('click', () => {
    if (inputEmail) inputEmail.value = 'harsh.teacher@blendify.edu';
    if (inputPassword) inputPassword.value = 'teacher123';
    showToast('Loaded Teacher demo account credentials.');
  });

  demoChipNew?.addEventListener('click', () => {
    const randomId = Math.floor(100 + Math.random() * 900);
    if (inputEmail) inputEmail.value = `student${randomId}@blendify.io`;
    if (inputPassword) inputPassword.value = 'welcome123';
    showToast('Generated fresh first-time user credentials.');
  });

  // =========================================================================
  // GOOGLE SIGN-IN MODAL (SSO ALTERNATIVE)
  // =========================================================================
  function openGoogleModal() {
    updateModalAccountTags();
    if (googleAccountModal) googleAccountModal.style.display = 'flex';
  }

  function closeGoogleModal() {
    if (googleAccountModal) googleAccountModal.style.display = 'none';
  }

  btnGoogleSignIn?.addEventListener('click', openGoogleModal);
  btnCloseGoogleModal?.addEventListener('click', closeGoogleModal);

  googleAccountModal?.addEventListener('click', (e) => {
    if (e.target === googleAccountModal) {
      closeGoogleModal();
    }
  });

  document.querySelectorAll('.google-account-item').forEach(item => {
    item.addEventListener('click', () => {
      const name = item.getAttribute('data-name');
      const email = item.getAttribute('data-email');
      const defaultRole = item.getAttribute('data-role');
      if (defaultRole && !getSavedRoleForEmail(email)) {
        saveRoleForEmail(email, defaultRole);
      }
      processAuthentication({ name, email });
    });
  });

  btnToggleCustomEntry?.addEventListener('click', () => {
    if (!customEntryForm) return;
    const isHidden = customEntryForm.style.display === 'none';
    customEntryForm.style.display = isHidden ? 'flex' : 'none';
    if (isHidden) {
      customGoogleEmail?.focus();
    }
  });

  btnSubmitCustomAccount?.addEventListener('click', () => {
    const email = customGoogleEmail?.value.trim();
    const name = customGoogleName?.value.trim() || (email ? email.split('@')[0] : '') || 'Google User';

    if (!email || !email.includes('@')) {
      showToast('Please enter a valid Google email address.');
      customGoogleEmail?.focus();
      return;
    }

    processAuthentication({ name, email });
  });

  // =========================================================================
  // SWITCH ACCOUNT / SIGN OUT
  // =========================================================================
  btnSwitchAccount?.addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_ROLE);
    state.currentUser = null;
    renderSignInView();
    showToast('Signed out. Ready for new sign-in.');
  });

  // =========================================================================
  // ROLE SELECTION HANDLERS: STUDENT vs TEACHER
  // =========================================================================
  function handleStudentSelection() {
    const email = state.currentUser?.email || 'student@blendify.io';
    saveRoleForEmail(email, 'student');

    if (!state.currentUser) {
      state.currentUser = { name: 'Student', email: email };
    }
    state.currentUser.role = 'student';

    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(state.currentUser));
    localStorage.setItem(STORAGE_KEY_ROLE, 'student');

    showToast('Choice saved! Loading Student Dashboard...');

    setTimeout(() => {
      window.location.href = 'index.html';
    }, 400);
  }

  function handleTeacherSelection() {
    const email = state.currentUser?.email || 'teacher@blendify.edu';
    saveRoleForEmail(email, 'teacher');

    if (!state.currentUser) {
      state.currentUser = { name: 'Instructor', email: email };
    }
    state.currentUser.role = 'teacher';

    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(state.currentUser));
    localStorage.setItem(STORAGE_KEY_ROLE, 'teacher');

    showToast('Choice saved! Loading Teacher Studio...');

    setTimeout(() => {
      window.location.href = 'create-course.html';
    }, 400);
  }

  btnEnterStudentPortal?.addEventListener('click', (e) => {
    e.stopPropagation();
    handleStudentSelection();
  });

  cardChooseStudent?.addEventListener('click', () => {
    handleStudentSelection();
  });

  btnEnterTeacherStudio?.addEventListener('click', (e) => {
    e.stopPropagation();
    handleTeacherSelection();
  });

  cardChooseTeacher?.addEventListener('click', () => {
    handleTeacherSelection();
  });

  console.log('Blendify Authentication & Role Flow initialized.');
});
