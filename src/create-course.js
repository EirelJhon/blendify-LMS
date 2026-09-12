/**
 * BLENDIFY TEACHER & ADMINISTRATOR STUDIO - Client Logic
 * Powers the 5 core teacher/administrator management capabilities:
 * 1. Classroom Workplaces & Portals (create, tags, shareable links)
 * 2. Uploading Materials to LMS via Portal
 * 3. In-Time Activity Tracker (audit log: who, when, exact time)
 * 4. Customizable Quiz & Activity Builder
 * 5. Student Progression Assessment & Printable Record Sheet
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // APPLICATION STATE
  // =========================================================================
  const state = {
    activeView: 'workspaces',
    activePortal: {
      tag: '#PORTAL-FIGMA-101',
      name: 'UI/UX Cohort 4 — Webflow Breakpoints Lab',
      cohort: 'FIGMA-101',
      shareUrl: 'https://blendify.edu/portal/join?tag=PORTAL-FIGMA-101'
    },
    portals: [
      {
        tag: '#PORTAL-FIGMA-101',
        name: 'UI/UX Cohort 4 — Webflow Breakpoints Lab',
        cohort: 'FIGMA-101',
        desc: 'Focused on converting 1440px desktop wireframes to fluid flexbox and auto-layout containers.',
        learners: 18,
        materials: 6,
        quizzes: 2,
        url: 'https://blendify.edu/portal/join?tag=PORTAL-FIGMA-101'
      },
      {
        tag: '#PORTAL-WEBFLOW-88',
        name: 'Webflow CMS & Animations Workshop',
        cohort: 'WEBFLOW-88',
        desc: 'Structuring dynamic CMS collections, client-first classes, and scroll-driven micro-interactions.',
        learners: 24,
        materials: 8,
        quizzes: 1,
        url: 'https://blendify.edu/portal/join?tag=PORTAL-WEBFLOW-88'
      },
      {
        tag: '#PORTAL-TOKENS-22',
        name: 'Enterprise Design Tokens & Multi-Brand UI',
        cohort: 'TOKENS-22',
        desc: 'Figma variables, 8pt spacing rhythm, and fluid rem conversion formulas for production teams.',
        learners: 14,
        materials: 4,
        quizzes: 1,
        url: 'https://blendify.edu/portal/join?tag=PORTAL-TOKENS-22'
      }
    ],
    selectedUploadFile: null,
    metrics: {
      activeToday: 18,
      openings: 42,
      downloads: 14
    },
    students: [
      { name: 'Aria Montgomery', id: '#STU-9021', initials: 'AM', colorClass: '' },
      { name: 'Rahim Chowdhury', id: '#STU-4812', initials: 'RC', colorClass: 'rc-avatar' },
      { name: 'Harsh Vardhan', id: '#STU-1004', initials: 'HV', colorClass: '' },
      { name: 'Sarah Kim', id: '#STU-6523', initials: 'SK', colorClass: 'sk-avatar' },
      { name: 'Elena Rostova', id: '#STU-3190', initials: 'ER', colorClass: '' },
      { name: 'Marcus Chen', id: '#STU-7741', initials: 'MC', colorClass: '' }
    ],
    questionCount: 2
  };

  // Toast Notifications
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
    }, 3400);
  }

  // =========================================================================
  // VIEW NAVIGATION (5 MODULES)
  // =========================================================================
  const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
  const panels = {
    'workspaces': document.getElementById('viewWorkspaces'),
    'upload-materials': document.getElementById('viewUploadMaterials'),
    'activity-tracker': document.getElementById('viewActivityTracker'),
    'quiz-builder': document.getElementById('viewQuizBuilder'),
    'progression-sheet': document.getElementById('viewProgressionSheet')
  };

  function switchView(viewName) {
    if (!panels[viewName]) return;
    state.activeView = viewName;

    // Update sidebar nav buttons
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('data-view') === viewName);
    });

    // Update panel active states
    Object.keys(panels).forEach(key => {
      if (panels[key]) {
        panels[key].classList.toggle('active', key === viewName);
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      const targetView = link.getAttribute('data-view');
      switchView(targetView);
    });
  });

  // Mobile sidebar toggle
  const sidebar = document.getElementById('sidebar');
  document.getElementById('sidebarToggle')?.addEventListener('click', () => {
    sidebar?.classList.toggle('open');
  });

  // =========================================================================
  // ACTIVE PORTAL SYNCHRONIZATION
  // =========================================================================
  const headerPortalSelect = document.getElementById('headerPortalSelect');
  const currentUploadPortalName = document.getElementById('currentUploadPortalName');
  const currentQuizPortalName = document.getElementById('currentQuizPortalName');
  const printPortalTag = document.getElementById('printPortalTag');

  function setActivePortal(tag, name, cohort) {
    state.activePortal.tag = tag;
    state.activePortal.name = name || tag;
    state.activePortal.cohort = cohort || 'COHORT-2026';
    state.activePortal.shareUrl = `https://blendify.edu/portal/join?tag=${tag.replace('#', '')}`;

    if (currentUploadPortalName) currentUploadPortalName.textContent = tag;
    if (currentQuizPortalName) currentQuizPortalName.textContent = tag;
    if (printPortalTag) printPortalTag.textContent = tag;

    if (headerPortalSelect) {
      headerPortalSelect.value = tag;
    }

    // Update active highlight on cards in the portals directory
    document.querySelectorAll('.portal-card').forEach(card => {
      const cardTag = card.querySelector('.portal-tag-pill')?.textContent?.trim();
      const isActive = cardTag === tag;
      card.classList.toggle('active', isActive);
      const btn = card.querySelector('.btn-select-portal');
      if (btn) {
        if (isActive) {
          btn.className = 'btn-primary-sm btn-select-portal';
          btn.textContent = 'Active Portal';
        } else {
          btn.className = 'btn-secondary-sm btn-select-portal';
          btn.textContent = 'Manage Portal';
        }
      }
    });
  }

  // Header dropdown switcher
  headerPortalSelect?.addEventListener('change', (e) => {
    const selectedTag = e.target.value;
    const found = state.portals.find(p => p.tag === selectedTag);
    setActivePortal(selectedTag, found ? found.name : selectedTag);
    showToast(`Active Classroom Portal switched to ${selectedTag}`);
  });

  // =========================================================================
  // MODULE 1: CLASSROOM WORKPLACES & PORTALS
  // =========================================================================
  const newPortalTitleInput = document.getElementById('newPortalTitleInput');
  const newPortalCohortInput = document.getElementById('newPortalCohortInput');
  const liveGeneratedTag = document.getElementById('liveGeneratedTag');
  const liveGeneratedUrl = document.getElementById('liveGeneratedUrl');
  const btnRefreshGeneratedTag = document.getElementById('btnRefreshGeneratedTag');
  const btnSubmitCreatePortal = document.getElementById('btnSubmitCreatePortal');
  const portalsListGrid = document.getElementById('portalsListGrid');
  const portalsCount = document.getElementById('portalsCount');

  function generateRandomTagCode() {
    const prefixes = ['FIGMA', 'UIUX', 'WEBFLOW', 'TOKENS', 'DEV', 'REACT', 'DESIGN'];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomNum = Math.floor(100 + Math.random() * 900);
    return `#PORTAL-${randomPrefix}-${randomNum}`;
  }

  function updateLiveTagDisplay() {
    let rawCohort = newPortalCohortInput?.value.trim().toUpperCase();
    if (rawCohort) {
      rawCohort = rawCohort.replace(/[^A-Z0-9-]/g, '');
      liveGeneratedTag.textContent = `#PORTAL-${rawCohort}`;
      liveGeneratedUrl.textContent = `https://blendify.edu/portal/join?tag=PORTAL-${rawCohort}`;
    }
  }

  newPortalCohortInput?.addEventListener('input', updateLiveTagDisplay);

  btnRefreshGeneratedTag?.addEventListener('click', (e) => {
    e.preventDefault();
    const newTag = generateRandomTagCode();
    if (liveGeneratedTag) liveGeneratedTag.textContent = newTag;
    if (liveGeneratedUrl) liveGeneratedUrl.textContent = `https://blendify.edu/portal/join?tag=${newTag.replace('#', '')}`;
    if (newPortalCohortInput) {
      newPortalCohortInput.value = newTag.replace('#PORTAL-', '');
    }
    showToast(`New portal tag generated: ${newTag}`);
  });

  // Copy portal link to clipboard helper
  function attachCopyLinkEvents(container) {
    container.querySelectorAll('.btn-copy-portal-link').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const url = btn.getAttribute('data-url');
        if (!url) return;
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(url);
          } else {
            // Fallback for non-secure contexts
            const textarea = document.createElement('textarea');
            textarea.value = url;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            textarea.remove();
          }
          showToast('Portal invite link copied to clipboard!');
        } catch {
          showToast(`Invite Link: ${url}`);
        }
      });
    });
  }

  function attachSelectPortalEvents(container) {
    container.querySelectorAll('.btn-select-portal').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const tag = btn.getAttribute('data-tag');
        const name = btn.getAttribute('data-name');
        setActivePortal(tag, name);
        showToast(`Selected portal: ${tag}`);
      });
    });
  }

  // Attach initial listeners in portals grid
  if (portalsListGrid) {
    attachCopyLinkEvents(portalsListGrid);
    attachSelectPortalEvents(portalsListGrid);
  }

  // Handle portal creation form submission
  btnSubmitCreatePortal?.addEventListener('click', () => {
    const title = newPortalTitleInput?.value.trim();
    if (!title) {
      showToast('Please enter a Classroom Workspace Name.');
      newPortalTitleInput?.focus();
      return;
    }

    const tag = liveGeneratedTag?.textContent.trim() || generateRandomTagCode();
    const shareUrl = liveGeneratedUrl?.textContent.trim() || `https://blendify.edu/portal/join?tag=${tag.replace('#', '')}`;
    const cohortCode = newPortalCohortInput?.value.trim().toUpperCase() || 'COHORT-2026';

    // Add to portals state
    const newPortal = {
      tag,
      name: title,
      cohort: cohortCode,
      desc: `Dedicated portal for ${title}. Learners access materials, activities, and real-time tracking here.`,
      learners: 1,
      materials: 0,
      quizzes: 0,
      url: shareUrl
    };
    state.portals.unshift(newPortal);

    // Create DOM card in grid
    const portalCard = document.createElement('div');
    portalCard.className = 'portal-card active';
    portalCard.innerHTML = `
      <div class="portal-card-top">
        <span class="portal-tag-pill">${tag}</span>
        <span class="status-live-tag"><span class="green-dot"></span> Active</span>
      </div>
      <h4>${title}</h4>
      <p>${newPortal.desc}</p>
      <div class="portal-card-stats">
        <span><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg> 1 Learner</span>
        <span><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg> 0 Materials</span>
        <span><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><line x1="9" y1="15" x2="15" y2="15"></line><line x1="9" y1="11" x2="15" y2="11"></line></svg> 0 Quizzes</span>
      </div>
      <div class="portal-card-actions">
        <button class="btn-primary-sm btn-select-portal" data-tag="${tag}" data-name="${title}">Active Portal</button>
        <button class="btn-ghost-sm btn-copy-portal-link" data-url="${shareUrl}">Copy Link</button>
      </div>
    `;

    portalsListGrid?.prepend(portalCard);
    attachCopyLinkEvents(portalCard);
    attachSelectPortalEvents(portalCard);

    // Add to header dropdown
    if (headerPortalSelect) {
      const opt = document.createElement('option');
      opt.value = tag;
      opt.textContent = `${tag} (${title})`;
      headerPortalSelect.prepend(opt);
    }

    // Update active portal count badge
    if (portalsCount) {
      portalsCount.textContent = `${state.portals.length} Active Portals`;
    }

    // Set as currently active portal
    setActivePortal(tag, title, cohortCode);

    // Reset inputs
    if (newPortalTitleInput) newPortalTitleInput.value = '';
    if (newPortalCohortInput) newPortalCohortInput.value = '';
    const freshTag = generateRandomTagCode();
    if (liveGeneratedTag) liveGeneratedTag.textContent = freshTag;
    if (liveGeneratedUrl) liveGeneratedUrl.textContent = `https://blendify.edu/portal/join?tag=${freshTag.replace('#', '')}`;

    showToast(`Classroom Portal ${tag} launched successfully!`);

    // Add activity tracker log entry
    recordActivityEvent({
      studentName: 'Harsh Vardhan (Instructor)',
      studentId: '#FACULTY-01',
      materialName: `Created Classroom Portal: ${title} (${tag})`,
      action: 'Portal Created',
      actionClass: 'open',
      statusPill: 'Active Now'
    });
  });

  // =========================================================================
  // MODULE 2: UPLOAD MATERIALS THROUGH CLASSROOM PORTAL
  // =========================================================================
  const materialTitleInput = document.getElementById('materialTitleInput');
  const materialCategorySelect = document.getElementById('materialCategorySelect');
  const fileDropCard = document.getElementById('fileDropCard');
  const portalMaterialFileInput = document.getElementById('portalMaterialFileInput');
  const fileDropLabel = document.getElementById('fileDropLabel');
  const materialDescInput = document.getElementById('materialDescInput');
  const checkAllowDownload = document.getElementById('checkAllowDownload');
  const btnPublishMaterialToPortal = document.getElementById('btnPublishMaterialToPortal');
  const portalMaterialsTableBody = document.getElementById('portalMaterialsTableBody');

  // File drag & drop handling
  if (fileDropCard && portalMaterialFileInput) {
    fileDropCard.addEventListener('dragover', (e) => {
      e.preventDefault();
      fileDropCard.style.borderColor = 'var(--primary)';
      fileDropCard.style.backgroundColor = 'var(--primary-subtle)';
    });

    ['dragleave', 'dragend'].forEach(type => {
      fileDropCard.addEventListener(type, () => {
        fileDropCard.style.borderColor = '';
        fileDropCard.style.backgroundColor = '';
      });
    });

    fileDropCard.addEventListener('drop', (e) => {
      e.preventDefault();
      fileDropCard.style.borderColor = '';
      fileDropCard.style.backgroundColor = '';
      const files = e.dataTransfer.files;
      if (files && files[0]) {
        handleSelectedMaterialFile(files[0]);
      }
    });

    portalMaterialFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleSelectedMaterialFile(e.target.files[0]);
      }
    });
  }

  function handleSelectedMaterialFile(file) {
    state.selectedUploadFile = file;
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    if (fileDropLabel) {
      fileDropLabel.innerHTML = `<strong>Selected:</strong> ${file.name} (${sizeMb} MB)`;
    }
    // Auto fill title if empty
    if (materialTitleInput && !materialTitleInput.value.trim()) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      materialTitleInput.value = nameWithoutExt.replace(/[-_]/g, ' ');
    }
    showToast(`Attached ${file.name} for upload.`);
  }

  // Delete row listener helper
  function bindMaterialRowDelete(row) {
    row.querySelector('.btn-delete-mat')?.addEventListener('click', () => {
      const matName = row.querySelector('strong')?.textContent || 'Material';
      row.remove();
      showToast(`Removed "${matName}" from portal.`);
    });
  }

  // Bind initial rows in materials table
  document.querySelectorAll('#portalMaterialsTableBody tr').forEach(bindMaterialRowDelete);

  // Upload button handler
  btnPublishMaterialToPortal?.addEventListener('click', () => {
    const title = materialTitleInput?.value.trim();
    if (!title) {
      showToast('Please enter a Material Title.');
      materialTitleInput?.focus();
      return;
    }

    const category = materialCategorySelect?.value || 'Study Guide';
    let iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>`;
    let sizeText = '5.2 MB';

    if (category.includes('Figma')) {
      iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M12 2a4 4 0 0 0-4 4v4h4a4 4 0 0 0 0-8z"></path><path d="M12 10H8a4 4 0 0 0 0 8h4v-8z"></path><path d="M12 10h4a4 4 0 0 0 0-8h-4v8z"></path><path d="M12 18H8a4 4 0 0 0 4 4 4 4 0 0 0 4-4v-4h-4v4z"></path></svg>`;
      sizeText = '28.4 MB';
    } else if (category.includes('Webflow')) {
      iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`;
      sizeText = 'Live Template';
    } else if (category.includes('Lecture')) {
      iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><line x1="9" y1="15" x2="15" y2="15"></line><line x1="9" y1="11" x2="15" y2="11"></line></svg>`;
      sizeText = '1.8 MB';
    }

    if (state.selectedUploadFile) {
      sizeText = `${(state.selectedUploadFile.size / (1024 * 1024)).toFixed(1)} MB`;
    }

    const todayDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const newRow = document.createElement('tr');
    newRow.innerHTML = `
      <td>
        <div class="table-mat-name">
          <span class="file-badge vector-badge">${iconSvg}</span>
          <strong>${title}</strong>
        </div>
      </td>
      <td>${category}</td>
      <td>${sizeText}</td>
      <td>${todayDate}</td>
      <td><span class="status-pill open">Open Access</span></td>
      <td><button class="btn-ghost-xs text-danger btn-delete-mat">Delete</button></td>
    `;

    portalMaterialsTableBody?.prepend(newRow);
    bindMaterialRowDelete(newRow);

    // Reset upload form
    if (materialTitleInput) materialTitleInput.value = '';
    if (materialDescInput) materialDescInput.value = '';
    if (portalMaterialFileInput) portalMaterialFileInput.value = '';
    if (fileDropLabel) fileDropLabel.innerHTML = 'Choose a file or drag &amp; drop here';
    state.selectedUploadFile = null;

    showToast(`Uploaded "${title}" to portal ${state.activePortal.tag}!`);

    // Audit log entry
    recordActivityEvent({
      studentName: 'Harsh Vardhan (Instructor)',
      studentId: '#FACULTY-01',
      materialName: `${title} (${category})`,
      action: 'Uploaded Material',
      actionClass: 'download',
      statusPill: 'Active Now'
    });
  });

  // =========================================================================
  // MODULE 3: IN-TIME ACTIVITY TRACKER (WHO, WHEN, EXACT TIME)
  // =========================================================================
  const activityLogTableBody = document.getElementById('activityLogTableBody');
  const activitySearchInput = document.getElementById('activitySearchInput');
  const btnSimulateStudentAccess = document.getElementById('btnSimulateStudentAccess');
  const metricActiveToday = document.getElementById('metricActiveToday');
  const metricMaterialOpenings = document.getElementById('metricMaterialOpenings');
  const metricDownloads = document.getElementById('metricDownloads');

  function recordActivityEvent({ studentName, studentId, materialName, action, actionClass, statusPill }) {
    if (!activityLogTableBody) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    // Extract initials
    const initials = studentName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    const row = document.createElement('tr');
    row.className = 'activity-row';
    row.innerHTML = `
      <td>
        <div class="student-user-cell">
          <div class="stu-avatar">${initials}</div>
          <div>
            <strong>${studentName}</strong>
            <span class="stu-id">ID: ${studentId}</span>
          </div>
        </div>
      </td>
      <td>
        <strong>${materialName}</strong>
        <span class="mat-subtext">Classroom Portal: ${state.activePortal.tag}</span>
      </td>
      <td><span class="action-tag ${actionClass}">${action}</span></td>
      <td>
        <div class="timestamp-cell">
          <strong class="time-text">${timeStr}</strong>
          <span class="date-text">${dateStr}</span>
        </div>
      </td>
      <td><span class="live-status-pill online"><span class="green-dot"></span> ${statusPill || 'Active Now'}</span></td>
    `;

    activityLogTableBody.prepend(row);

    // Keep table to max 30 rows
    const rows = activityLogTableBody.querySelectorAll('tr');
    if (rows.length > 30) {
      rows[rows.length - 1].remove();
    }
  }

  // Simulation button for testing real-time logging
  btnSimulateStudentAccess?.addEventListener('click', () => {
    const randomStudent = state.students[Math.floor(Math.random() * state.students.length)];
    const sampleMaterials = [
      'Module 2.3: Fluid Grid Breakpoints Cheatsheet',
      'Figma Responsive Wireframe Starter Kit v2.4',
      'Webflow Client-First Component Library',
      'Typography & 8pt Spacing Rhythm Guide',
      'Module 1 Checkpoint Quiz: Responsive Grids'
    ];
    const randomMaterial = sampleMaterials[Math.floor(Math.random() * sampleMaterials.length)];

    const actions = [
      { action: 'Viewed Material', class: 'open' },
      { action: 'Downloaded (.fig)', class: 'download' },
      { action: 'Opened PDF Guide', class: 'open' }
    ];
    const chosenAction = actions[Math.floor(Math.random() * actions.length)];

    recordActivityEvent({
      studentName: randomStudent.name,
      studentId: randomStudent.id,
      materialName: randomMaterial,
      action: chosenAction.action,
      actionClass: chosenAction.class,
      statusPill: 'Just Now'
    });

    // Update metrics
    state.metrics.openings++;
    if (chosenAction.action.includes('Download')) {
      state.metrics.downloads++;
    }
    if (metricMaterialOpenings) metricMaterialOpenings.textContent = state.metrics.openings;
    if (metricDownloads) metricDownloads.textContent = state.metrics.downloads;

    showToast(`In-time log: ${randomStudent.name} ${chosenAction.action}`);
  });

  // Real-time table filter
  activitySearchInput?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase().trim();
    const rows = activityLogTableBody?.querySelectorAll('tr');
    rows?.forEach(r => {
      const text = r.textContent.toLowerCase();
      r.style.display = text.includes(term) ? '' : 'none';
    });
  });

  // =========================================================================
  // MODULE 4: CUSTOMIZABLE QUIZ & ACTIVITY BUILDER
  // =========================================================================
  const btnAddQuestionItem = document.getElementById('btnAddQuestionItem');
  const questionsListContainer = document.getElementById('questionsListContainer');
  const btnPublishQuizToPortal = document.getElementById('btnPublishQuizToPortal');
  const customQuizTitleInput = document.getElementById('customQuizTitleInput');
  const quizTypeSelect = document.getElementById('quizTypeSelect');

  function bindQuestionCardEvents(card) {
    const deleteBtn = card.querySelector('.btn-delete-question');
    deleteBtn?.addEventListener('click', () => {
      const cards = questionsListContainer.querySelectorAll('.question-builder-card');
      if (cards.length <= 1) {
        showToast('At least one question is required for the activity.');
        return;
      }
      card.remove();
      renumberQuestions();
      showToast('Question removed.');
    });

    // Radio button correct answer badge updates
    const radios = card.querySelectorAll('input[type="radio"]');
    radios.forEach(radio => {
      radio.addEventListener('change', () => {
        card.querySelectorAll('.correct-badge').forEach(b => b.remove());
        const row = radio.closest('.option-edit-row');
        if (row) {
          const badge = document.createElement('span');
          badge.className = 'correct-badge';
          badge.textContent = 'Correct Answer';
          row.appendChild(badge);
        }
      });
    });
  }

  function renumberQuestions() {
    const cards = questionsListContainer?.querySelectorAll('.question-builder-card');
    cards?.forEach((card, idx) => {
      const num = String(idx + 1).padStart(2, '0');
      const headerStrong = card.querySelector('.q-header-bar strong');
      if (headerStrong) headerStrong.textContent = `Question ${num}`;
      // Update radio group name to avoid collisions
      card.querySelectorAll('input[type="radio"]').forEach(r => {
        r.name = `q${idx + 1}_correct`;
      });
    });
  }

  // Bind initial question cards
  document.querySelectorAll('.question-builder-card').forEach(bindQuestionCardEvents);

  // Add question handler
  btnAddQuestionItem?.addEventListener('click', () => {
    state.questionCount++;
    const num = String(state.questionCount).padStart(2, '0');

    const card = document.createElement('div');
    card.className = 'question-builder-card';
    card.setAttribute('data-q', state.questionCount);
    card.innerHTML = `
      <div class="q-header-bar">
        <strong>Question ${num}</strong>
        <div class="q-points-wrap">
          <span>Points:</span>
          <input type="number" value="10" class="points-input" />
          <button class="btn-ghost-xs text-danger btn-delete-question">Remove</button>
        </div>
      </div>
      <div class="field-group">
        <input type="text" class="form-control q-prompt-input" placeholder="Enter customized question prompt..." value="" />
      </div>
      <div class="options-radio-list">
        <div class="option-edit-row">
          <input type="radio" name="q${state.questionCount}_correct" value="0" checked />
          <input type="text" class="form-control" placeholder="Option A (Correct answer)" />
          <span class="correct-badge">Correct Answer</span>
        </div>
        <div class="option-edit-row">
          <input type="radio" name="q${state.questionCount}_correct" value="1" />
          <input type="text" class="form-control" placeholder="Option B" />
        </div>
        <div class="option-edit-row">
          <input type="radio" name="q${state.questionCount}_correct" value="2" />
          <input type="text" class="form-control" placeholder="Option C" />
        </div>
      </div>
      <div class="field-group">
        <label class="field-label-sm">Custom Hint / Teacher Explanation for Learners</label>
        <input type="text" class="form-control input-sm" placeholder="Provide an explanation for students..." />
      </div>
    `;

    questionsListContainer?.appendChild(card);
    bindQuestionCardEvents(card);
    renumberQuestions();
    card.querySelector('.q-prompt-input')?.focus();
    showToast(`Added Question ${num}!`);
  });

  // Publish activity handler
  btnPublishQuizToPortal?.addEventListener('click', () => {
    const title = customQuizTitleInput?.value.trim();
    if (!title) {
      showToast('Please specify an Activity or Quiz Title.');
      customQuizTitleInput?.focus();
      return;
    }

    const type = quizTypeSelect?.options[quizTypeSelect.selectedIndex]?.text || 'Quiz';
    const totalQuestions = questionsListContainer?.querySelectorAll('.question-builder-card').length || 0;

    showToast(`Activity "${title}" (${totalQuestions} Questions) published to portal ${state.activePortal.tag}!`);

    // Record audit event
    recordActivityEvent({
      studentName: 'Harsh Vardhan (Instructor)',
      studentId: '#FACULTY-01',
      materialName: `Published Quiz: ${title}`,
      action: 'Quiz Published',
      actionClass: 'open',
      statusPill: 'Active Now'
    });
  });

  // =========================================================================
  // MODULE 5: PROGRESSION ASSESSMENT & PRINTABLE RECORD SHEET
  // =========================================================================
  const btnPrintRecordSheet = document.getElementById('btnPrintRecordSheet');
  const printReportDate = document.getElementById('printReportDate');

  // Format today's date for official academic report
  if (printReportDate) {
    const today = new Date();
    printReportDate.textContent = today.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }

  btnPrintRecordSheet?.addEventListener('click', () => {
    showToast('Preparing official academic progression data sheet for printing...');
    setTimeout(() => {
      window.print();
    }, 300);
  });

  // User Profile Dropdown
  const userProfileBtn = document.getElementById('userProfileBtn');
  const userPanel = document.getElementById('userPanel');
  userProfileBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    userPanel?.classList.toggle('show');
  });

  document.addEventListener('click', () => {
    userPanel?.classList.remove('show');
  });

  // Synchronize User & Role
  try {
    const rawUser = localStorage.getItem('blendify_auth_user');
    const savedRole = localStorage.getItem('blendify_role');

    if (!rawUser || !savedRole) {
      window.location.replace('login.html');
      return;
    }

    // If account role is student, redirect to student portal
    if (savedRole === 'student') {
      window.location.replace('index.html');
      return;
    }

    if (rawUser) {
      const user = JSON.parse(rawUser);
      if (user.name) {
        const userNameEl = document.querySelector('#userProfileBtn .user-name');
        const userAvatarEl = document.querySelector('#userProfileBtn .user-avatar span');
        const panelNameEl = document.querySelector('.user-panel-name');
        const panelRoleEl = document.querySelector('.user-panel-role');

        if (userNameEl) userNameEl.textContent = user.name.split(' ')[0];
        if (userAvatarEl) userAvatarEl.textContent = (user.name || 'U').charAt(0).toUpperCase();
        if (panelNameEl) panelNameEl.textContent = user.name;
        if (panelRoleEl) panelRoleEl.textContent = 'Instructor · Teacher & Admin Studio';
      }
    }
  } catch (e) {}

  function handleSignOutOrSwitch() {
    localStorage.removeItem('blendify_auth_user');
    localStorage.removeItem('blendify_role');
    window.location.href = 'login.html';
  }

  document.getElementById('btnSignOutAccount')?.addEventListener('click', handleSignOutOrSwitch);
  document.getElementById('btnSwitchAccountDropdown')?.addEventListener('click', handleSignOutOrSwitch);

  console.log('Blendify Teacher & Administrator Studio initialized.');
});
