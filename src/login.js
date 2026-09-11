/**
 * BLENDIFY AUTHENTICATION & ONE-TIME ROLE SELECTION
 * Enforces one-time role assignment per Google account silently:
 * - When signing in, checks if this Google account already selected a role.
 * - If already selected: Immediately navigates to their workspace (Student -> index.html, Teacher -> create-course.html).
 * - If first time: User chooses role once on a clean selection screen; that choice is permanently saved to the Google account.
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // STORAGE KEYS & PERSISTENT ROLE SYSTEM
  // =========================================================================
  const STORAGE_KEY_USER = 'blendify_auth_user';
  const STORAGE_KEY_ROLE = 'blendify_role';
  const STORAGE_KEY_ACCOUNTS_MAP = 'blendify_account_roles';

  // Seed default test accounts if not already stored
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

  // State
  const state = {
    currentUser: null
  };

  // Toast System
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

  // Buttons & Inputs
  const btnGoogleSignIn = document.getElementById('btnGoogleSignIn');
  const btnCloseGoogleModal = document.getElementById('btnCloseGoogleModal');
  const btnToggleCustomEntry = document.getElementById('btnToggleCustomEntry');
  const customEntryForm = document.getElementById('customEntryForm');
  const btnSubmitCustomAccount = document.getElementById('btnSubmitCustomAccount');
  const customGoogleEmail = document.getElementById('customGoogleEmail');
  const customGoogleName = document.getElementById('customGoogleName');

  // Role Cards & Buttons
  const cardChooseStudent = document.getElementById('cardChooseStudent');
  const cardChooseTeacher = document.getElementById('cardChooseTeacher');
  const btnEnterStudentPortal = document.getElementById('btnEnterStudentPortal');
  const btnEnterTeacherStudio = document.getElementById('btnEnterTeacherStudio');
  const studentPill = cardChooseStudent?.querySelector('.card-accent-pill');
  const teacherPill = cardChooseTeacher?.querySelector('.card-accent-pill');

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
  // VIEW RENDERING: SIGN IN vs ROLE SELECTION
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
      headerUserName.textContent = state.currentUser.name;
      headerUserEmail.textContent = state.currentUser.email;

      const firstLetter = state.currentUser.name.charAt(0).toUpperCase() || 'U';
      const existingAvatar = document.getElementById('headerUserAvatar');
      if (existingAvatar) {
        existingAvatar.outerHTML = `<div class="user-google-avatar" id="headerUserAvatar">${firstLetter}</div>`;
      }
    }

    // Clean, natural role cards without lock warnings
    cardChooseStudent.className = 'role-option-card student-card';
    if (studentPill) studentPill.textContent = 'Learner Portal';
    if (btnEnterStudentPortal) {
      btnEnterStudentPortal.innerHTML = `<span>Enter as Student</span>`;
    }

    cardChooseTeacher.className = 'role-option-card teacher-card';
    if (teacherPill) teacherPill.textContent = 'Faculty & Admin Studio';
    if (btnEnterTeacherStudio) {
      btnEnterTeacherStudio.innerHTML = `<span>Enter as Teacher</span>`;
    }
  }

  // Initial check on page load: if user already has a role saved, redirect immediately
  try {
    const savedUserRaw = localStorage.getItem(STORAGE_KEY_USER);
    if (savedUserRaw) {
      const savedUser = JSON.parse(savedUserRaw);
      state.currentUser = savedUser;
      const savedRole = getSavedRoleForEmail(savedUser.email) || savedUser.role || localStorage.getItem(STORAGE_KEY_ROLE);

      if (savedRole === 'student') {
        window.location.replace('index.html');
        return;
      } else if (savedRole === 'teacher') {
        window.location.replace('create-course.html');
        return;
      } else {
        renderRoleView();
      }
    } else {
      renderSignInView();
    }
  } catch {
    renderSignInView();
  }

  // =========================================================================
  // GOOGLE SIGN-IN FLOW
  // =========================================================================
  function openGoogleModal() {
    updateModalAccountTags();
    googleAccountModal.style.display = 'flex';
  }

  function closeGoogleModal() {
    googleAccountModal.style.display = 'none';
  }

  btnGoogleSignIn?.addEventListener('click', openGoogleModal);
  btnCloseGoogleModal?.addEventListener('click', closeGoogleModal);

  googleAccountModal?.addEventListener('click', (e) => {
    if (e.target === googleAccountModal) {
      closeGoogleModal();
    }
  });

  // Complete Google Sign-In: if role already chosen, forward directly to portal
  function completeGoogleSignIn(user) {
    closeGoogleModal();
    authLoadingOverlay.style.display = 'flex';
    if (loadingStatusText) {
      loadingStatusText.textContent = `Signing in as ${user.name}...`;
    }

    setTimeout(() => {
      authLoadingOverlay.style.display = 'none';
      state.currentUser = user;

      const email = user.email ? user.email.toLowerCase() : '';
      const existingRole = getSavedRoleForEmail(email);

      if (existingRole) {
        // Account ALREADY selected a role! Save session & route directly
        user.role = existingRole;
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
        localStorage.setItem(STORAGE_KEY_ROLE, existingRole);

        showToast(`Signed in as ${user.name}...`, '✓');

        setTimeout(() => {
          if (existingRole === 'student') {
            window.location.href = 'index.html';
          } else {
            window.location.href = 'create-course.html';
          }
        }, 400);
      } else {
        // First-time sign-in for this Google account: display clean role selection
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
        renderRoleView();
        showToast(`Signed in as ${user.name}.`, '✓');
      }
    }, 500);
  }

  // Account item clicks inside Google modal
  document.querySelectorAll('.google-account-item').forEach(item => {
    item.addEventListener('click', () => {
      const name = item.getAttribute('data-name');
      const email = item.getAttribute('data-email');
      const defaultRole = item.getAttribute('data-role');
      if (defaultRole && !getSavedRoleForEmail(email)) {
        saveRoleForEmail(email, defaultRole);
      }
      completeGoogleSignIn({ name, email });
    });
  });



  // Custom Google account entry toggle
  btnToggleCustomEntry?.addEventListener('click', () => {
    const isHidden = customEntryForm.style.display === 'none';
    customEntryForm.style.display = isHidden ? 'flex' : 'none';
    if (isHidden) {
      customGoogleEmail?.focus();
    }
  });

  // Custom account submit
  btnSubmitCustomAccount?.addEventListener('click', () => {
    const email = customGoogleEmail?.value.trim();
    const name = customGoogleName?.value.trim() || (email ? email.split('@')[0] : '') || 'Google User';

    if (!email || !email.includes('@')) {
      showToast('Please enter a valid Google email address.');
      customGoogleEmail?.focus();
      return;
    }

    completeGoogleSignIn({ name, email });
  });

  // Switch Google Account / Sign Out
  btnSwitchAccount?.addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_ROLE);
    state.currentUser = null;
    renderSignInView();
    showToast('Signed out of Google account.');
  });

  // =========================================================================
  // ONE-TIME ROLE SELECTION (Saves permanently to account without warnings)
  // =========================================================================
  function handleStudentSelection() {
    const email = state.currentUser?.email;
    if (email) {
      saveRoleForEmail(email, 'student');
    }
    if (state.currentUser) {
      state.currentUser.role = 'student';
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(state.currentUser));
    }
    localStorage.setItem(STORAGE_KEY_ROLE, 'student');
    showToast('Taking you to Student Portal...');

    setTimeout(() => {
      window.location.href = 'index.html';
    }, 400);
  }

  function handleTeacherSelection() {
    const email = state.currentUser?.email;
    if (email) {
      saveRoleForEmail(email, 'teacher');
    }
    if (state.currentUser) {
      state.currentUser.role = 'teacher';
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(state.currentUser));
    }
    localStorage.setItem(STORAGE_KEY_ROLE, 'teacher');
    showToast('Taking you to Teacher Studio...');

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

  console.log('Blendify Account Role System initialized.');
});

