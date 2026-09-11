/**
 * BLENDIFY LMS - Main Application Logic
 * Streamlined around 3 Core Student Pillars:
 * 1. Access Educational Learning Materials
 * 2. Participate in Classroom Workplaces via Links & Generated Tags
 * 3. Personalized AI Learning Agents
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // STATE MANAGEMENT
  // =========================================================================
  const state = {
    activeView: 'materials',
    activeTag: '#PORTAL-FIGMA-101',
    activePortalName: 'UI/UX Cohort 4 — Webflow Breakpoints Lab',
    completedMaterials: 9,
    totalMaterials: 20,
    isMaterialCompleted: false,
    activePersona: 'alex',
    chatHistory: {
      alex: [
        { sender: 'agent', text: "Hello Harsh! I'm Alex, your personalized AI design system mentor. I specialize in visual hierarchy, auto-layout constraints, and token architecture. What design challenge are we tackling today?" }
      ],
      kavita: [
        { sender: 'agent', text: "Hi Harsh! I'm Kavita, your Webflow & CSS code specialist. Whether you need help converting Figma frames to CSS Grid or debugging 100vw horizontal overflow, let's solve it together." }
      ],
      socrates: [
        { sender: 'agent', text: "Greetings Harsh. I am Socrates, your conceptual thinking coach. Tell me: when you shrink a screen from desktop to mobile, why does layout priority change?" }
      ]
    }
  };

  // Toast System
  const CHECK_SVG = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  const toastContainer = document.getElementById('toastContainer');
  function showToast(message, icon = CHECK_SVG) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span class="toast-icon-box">${icon}</span><span>${message}</span>`;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // =========================================================================
  // NAVIGATION & VIEW ROUTING (3 CORE PILLARS)
  // =========================================================================
  const navMaterials = document.getElementById('nav-materials');
  const navWorkplaces = document.getElementById('nav-workplaces');
  const navAIAgent = document.getElementById('nav-ai-agent');

  const viewMaterials = document.getElementById('viewMaterials');
  const viewWorkplaces = document.getElementById('viewWorkplaces');
  const viewAIAgent = document.getElementById('viewAIAgent');

  const views = {
    materials: { link: navMaterials, section: viewMaterials },
    workplaces: { link: navWorkplaces, section: viewWorkplaces },
    'ai-agent': { link: navAIAgent, section: viewAIAgent }
  };

  function switchView(viewName) {
    Object.keys(views).forEach(key => {
      const isTarget = key === viewName;
      views[key].link?.classList.toggle('active', isTarget);
      views[key].section?.classList.toggle('view-hidden', !isTarget);
    });

    state.activeView = viewName;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById('sidebar')?.classList.remove('open');
  }

  navMaterials?.addEventListener('click', () => switchView('materials'));
  navWorkplaces?.addEventListener('click', () => switchView('workplaces'));
  navAIAgent?.addEventListener('click', () => switchView('ai-agent'));

  document.getElementById('brandLogo')?.addEventListener('click', (e) => {
    e.preventDefault();
    switchView('materials');
  });

  document.getElementById('btnOpenClassroomAction')?.addEventListener('click', () => switchView('workplaces'));
  document.getElementById('btnSidebarSwitchPortal')?.addEventListener('click', () => switchView('workplaces'));
  document.getElementById('btnViewMyPortals')?.addEventListener('click', () => {
    switchView('workplaces');
    document.getElementById('userPanel')?.classList.remove('show');
  });
  document.getElementById('btnOpenAIFromProfile')?.addEventListener('click', () => {
    switchView('ai-agent');
    document.getElementById('userPanel')?.classList.remove('show');
  });

  // =========================================================================
  // PILLAR 1: LEARNING MATERIALS INTERACTIONS
  // =========================================================================
  // Tabs within materials
  const matTabButtons = document.querySelectorAll('#viewMaterials .tab-btn');
  const matTabPanels = document.querySelectorAll('#viewMaterials .tab-panel');

  matTabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;
      matTabButtons.forEach(b => b.classList.toggle('active', b === btn));
      matTabPanels.forEach(p => p.classList.toggle('active', p.id === `panel-${targetTab}`));
    });
  });

  // Accordion Expand/Collapse
  const accordionItems = document.querySelectorAll('#syllabusAccordion .accordion-item');
  accordionItems.forEach(item => {
    item.querySelector('.accordion-trigger')?.addEventListener('click', () => {
      item.classList.toggle('open');
    });
  });

  const btnExpandAll = document.getElementById('btnExpandAllModules');
  if (btnExpandAll) {
    let allOpen = false;
    btnExpandAll.addEventListener('click', () => {
      allOpen = !allOpen;
      accordionItems.forEach(item => item.classList.toggle('open', allOpen));
      btnExpandAll.textContent = allOpen ? 'Collapse All' : 'Expand All';
    });
  }

  // Progress Tracker Toggle
  const btnMarkComplete = document.getElementById('btnMarkComplete');
  const markCompleteText = document.getElementById('markCompleteText');
  const progressBarFill = document.getElementById('progressBarFill');
  const progressPercentage = document.getElementById('progressPercentage');

  function updateMaterialsProgressUI() {
    const percent = Math.round((state.completedMaterials / state.totalMaterials) * 100);
    if (progressBarFill) progressBarFill.style.width = `${percent}%`;
    if (progressPercentage) {
      progressPercentage.textContent = `${percent}% Completed (${state.completedMaterials} of ${state.totalMaterials} Studied)`;
    }
  }

  if (btnMarkComplete) {
    btnMarkComplete.addEventListener('click', () => {
      state.isMaterialCompleted = !state.isMaterialCompleted;
      if (state.isMaterialCompleted) {
        state.completedMaterials = Math.min(state.totalMaterials, state.completedMaterials + 1);
        btnMarkComplete.classList.add('completed-state');
        markCompleteText.textContent = 'Material Studied';
        showToast('Module 2.2 marked as completed! (+5% progress)');
      } else {
        state.completedMaterials = Math.max(0, state.completedMaterials - 1);
        btnMarkComplete.classList.remove('completed-state');
        markCompleteText.textContent = 'Mark Completed';
        showToast('Material status reverted.');
      }
      updateMaterialsProgressUI();
    });
  }

  // Device Simulator in Materials
  const viewportButtons = document.querySelectorAll('.viewport-btn');
  const deviceFrame = document.getElementById('deviceFrame');
  const viewportSizeLabel = document.getElementById('viewportSizeLabel');

  const viewportSizes = {
    desktop: '1440 × 900 (Desktop Canvas)',
    tablet: '768 × 1024 (iPad Portrait)',
    mobile: '375 × 812 (iPhone 13)'
  };

  viewportButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      viewportButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const device = btn.dataset.device;
      deviceFrame.className = `simulated-device-frame ${device}`;
      viewportSizeLabel.textContent = viewportSizes[device] || '';
    });
  });

  // Download Action Triggers
  document.querySelectorAll('.download-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const name = trigger.dataset.name || 'Learning Asset';
      showToast(`Downloading educational resource: ${name}...`);
    });
  });

  document.getElementById('btnDownloadAssets')?.addEventListener('click', () => {
    showToast('Downloading Figma Starter Pack & Webflow Tokens (34.2 MB)...');
  });

  document.getElementById('btnReadMaterial')?.addEventListener('click', () => {
    showToast('Opening interactive study guide in reading mode...');
    document.querySelector('#viewMaterials .tabs-container')?.scrollIntoView({ behavior: 'smooth' });
  });

  document.getElementById('btnResumeLearningAction')?.addEventListener('click', () => {
    showToast('Resuming active curriculum from Module 2...');
    document.getElementById('learningWorkspace')?.scrollIntoView({ behavior: 'smooth' });
  });

  // =========================================================================
  // RECENTLY VISITED MATERIALS & FILES HANDLERS
  // =========================================================================
  const recentItems = document.querySelectorAll('.recent-file-item');
  recentItems.forEach(item => {
    item.addEventListener('click', () => {
      const fileName = item.dataset.file || 'Educational Resource';
      const action = item.dataset.action;
      const targetTab = item.dataset.tab;
      const targetElementId = item.dataset.target;

      // Switch to relevant tab if specified
      if (targetTab) {
        const tabBtn = document.querySelector(`#viewMaterials .tab-btn[data-tab="${targetTab}"]`);
        if (tabBtn) tabBtn.click();
      }

      // Action-specific feedback and scrolling
      if (action === 'download-figma') {
        showToast(`Accessing recently visited file: ${fileName} (.fig)...`);
      } else if (action === 'inspect-tokens') {
        showToast(`Opening recently visited stylesheet: ${fileName}...`);
        document.querySelector('#viewMaterials .tabs-container')?.scrollIntoView({ behavior: 'smooth' });
      } else if (action === 'open-notes') {
        showToast(`Opening recently visited study notes: ${fileName}...`);
        document.querySelector('#viewMaterials .tabs-container')?.scrollIntoView({ behavior: 'smooth' });
      } else {
        showToast(`Opening recently visited material: ${fileName}...`);
        if (targetElementId) {
          const targetEl = document.getElementById(targetElementId);
          if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // Browse all files link
  document.getElementById('btnBrowseAllFiles')?.addEventListener('click', () => {
    const tabCurriculum = document.querySelector('#viewMaterials .tab-btn[data-tab="materials-curriculum"]');
    if (tabCurriculum) tabCurriculum.click();
    document.querySelector('#viewMaterials .tabs-container')?.scrollIntoView({ behavior: 'smooth' });
    showToast('Browsing full curriculum modules and downloadable assets');
  });

  // Lesson list buttons update recent materials feedback
  document.querySelectorAll('.lesson-action-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const lessonItem = btn.closest('.lesson-item');
      const lessonName = lessonItem?.querySelector('.lesson-name')?.textContent?.trim() || 'Lesson Material';
      showToast(`Opened: ${lessonName}`);
      // Update top item in recent files visually
      const firstRecentName = document.querySelector('.recent-file-item .file-name');
      if (firstRecentName) {
        firstRecentName.textContent = lessonName.length > 32 ? lessonName.substring(0, 32) + '...' : lessonName;
        const firstRecentTime = document.querySelector('.recent-file-item .file-time');
        if (firstRecentTime) firstRecentTime.textContent = 'Just now';
      }
    });
  });

  // =========================================================================
  // NEW CLASS? WORKSPACE ACTION BUTTON (JOIN ONLY)
  // Directs student to the Student Classroom Workplace to join with a tag
  // =========================================================================
  const btnNewClassWorkspace = document.getElementById('btnNewClassWorkspace');
  if (btnNewClassWorkspace) {
    btnNewClassWorkspace.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('Opening Classroom Workplace to enter portal tag...');
      switchView('workplaces');

      setTimeout(() => {
        const portalInput = document.getElementById('portalTagInput');
        if (portalInput) {
          portalInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
          portalInput.focus();
          portalInput.classList.add('highlight-focus');
          setTimeout(() => portalInput.classList.remove('highlight-focus'), 1600);
        }
      }, 300);
    });
  }

  document.getElementById('btnAskAIAboutLesson')?.addEventListener('click', () => {
    switchView('ai-agent');
    sendAIMessage("Can you explain how Auto-Layout in Module 2 converts to Webflow flexbox?");
  });

  document.getElementById('btnShareToClassroom')?.addEventListener('click', () => {
    switchView('workplaces');
    showToast('Shared Module 2 learning material to your active classroom feed!');
  });

  // =========================================================================
  // PILLAR 2: CLASSROOM WORKPLACES (TAGS & SHAREABLE LINKS)
  // =========================================================================
  const currentPortalName = document.getElementById('currentPortalName');
  const activePortalTagLabel = document.getElementById('activePortalTagLabel');
  const activeTagBadge = document.getElementById('activeTagBadge');
  const sidebarActiveTag = document.getElementById('sidebarActiveTag');
  const currentShareLink = document.getElementById('currentShareLink');
  const portalTagInput = document.getElementById('portalTagInput');
  const btnJoinPortalByTag = document.getElementById('btnJoinPortalByTag');
  const btnCopyPortalLink = document.getElementById('btnCopyPortalLink');
  const btnCopyTagOnly = document.getElementById('btnCopyTagOnly');
  const portalMessages = document.getElementById('portalMessages');
  const portalMsgInput = document.getElementById('portalMsgInput');
  const btnSendPortalMsg = document.getElementById('btnSendPortalMsg');

  const portalDirectory = {
    '#PORTAL-FIGMA-101': {
      name: 'UI/UX Cohort 4 — Webflow Breakpoints Lab',
      instructor: 'Vativa Hub'
    },
    '#WEBFLOW-LAB-44': {
      name: 'Interactive Webflow CMS & Animations Workshop',
      instructor: 'Elena Rostova'
    },
    '#STUDY-ROOM-B': {
      name: 'Peer Design Review & Token Architecture Room',
      instructor: 'Harsh Vardhan (Host)'
    }
  };

  function setClassroomPortal(tag, name = null) {
    const formattedTag = tag.startsWith('#') ? tag.toUpperCase() : `#${tag.toUpperCase()}`;
    state.activeTag = formattedTag;
    state.activePortalName = name || (portalDirectory[formattedTag] ? portalDirectory[formattedTag].name : `Classroom Portal (${formattedTag})`);

    // Update UI elements
    if (currentPortalName) currentPortalName.textContent = state.activePortalName;
    if (activePortalTagLabel) activePortalTagLabel.textContent = formattedTag;
    if (activeTagBadge) activeTagBadge.textContent = formattedTag;
    if (sidebarActiveTag) sidebarActiveTag.textContent = formattedTag;
    if (currentShareLink) {
      currentShareLink.value = `https://blendify.edu/portal/join?tag=${formattedTag.replace('#', '')}`;
    }

    showToast(`Joined classroom portal: ${formattedTag}!`);
  }

  // Join by Tag button
  btnJoinPortalByTag?.addEventListener('click', () => {
    const entered = portalTagInput.value.trim();
    if (!entered) {
      showToast('Please enter a valid portal tag (e.g. #PORTAL-FIGMA-101)');
      return;
    }
    setClassroomPortal(entered);
    portalTagInput.value = '';
  });

  // Preset tag buttons
  document.querySelectorAll('.tag-pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setClassroomPortal(btn.dataset.tag);
    });
  });


  // Copy shareable link
  btnCopyPortalLink?.addEventListener('click', () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentShareLink.value);
    }
    showToast('Classroom portal invite link copied to clipboard!');
  });

  btnCopyTagOnly?.addEventListener('click', () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(state.activeTag);
    }
    showToast(`Portal tag ${state.activeTag} copied!`);
  });

  // Send message in active classroom portal
  function sendPortalMessage() {
    const text = portalMsgInput.value.trim();
    if (!text) return;

    const msgBox = document.createElement('div');
    msgBox.className = 'msg-bubble';
    msgBox.innerHTML = `
      <div class="msg-author">
        <strong>Harsh (You)</strong>
        <span>Just now</span>
      </div>
      <p>${text}</p>
    `;
    portalMessages.appendChild(msgBox);
    portalMsgInput.value = '';
    portalMessages.scrollTop = portalMessages.scrollHeight;
    showToast('Posted message to active classroom stream');
  }

  btnSendPortalMsg?.addEventListener('click', sendPortalMessage);
  portalMsgInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendPortalMessage();
    }
  });

  // Modal: Generate New Workplace Tag
  const createPortalModal = document.getElementById('createPortalModal');
  const btnOpenCreatePortalModal = document.getElementById('btnOpenCreatePortalModal');
  const modalCloseCreatePortal = document.getElementById('modalCloseCreatePortal');
  const btnCancelCreatePortal = document.getElementById('btnCancelCreatePortal');
  const btnConfirmCreatePortal = document.getElementById('btnConfirmCreatePortal');
  const btnRegenerateTag = document.getElementById('btnRegenerateTag');
  const newGeneratedTag = document.getElementById('newGeneratedTag');
  const newWorkplaceNameInput = document.getElementById('newWorkplaceNameInput');

  function generateRandomTag() {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `#PORTAL-BLEND-${randomNum}`;
  }

  btnOpenCreatePortalModal?.addEventListener('click', () => {
    newGeneratedTag.textContent = generateRandomTag();
    createPortalModal?.classList.add('open');
  });

  function closeCreatePortalModal() {
    createPortalModal?.classList.remove('open');
    if (newWorkplaceNameInput) newWorkplaceNameInput.value = '';
  }

  modalCloseCreatePortal?.addEventListener('click', closeCreatePortalModal);
  btnCancelCreatePortal?.addEventListener('click', closeCreatePortalModal);
  btnRegenerateTag?.addEventListener('click', () => {
    newGeneratedTag.textContent = generateRandomTag();
  });

  btnConfirmCreatePortal?.addEventListener('click', () => {
    const tag = newGeneratedTag.textContent;
    const name = newWorkplaceNameInput.value.trim() || `Classroom Study Group (${tag})`;
    setClassroomPortal(tag, name);
    closeCreatePortalModal();
  });

  // =========================================================================
  // PILLAR 3: PERSONALIZED AI LEARNING AGENT
  // =========================================================================
  const personaChips = document.querySelectorAll('.persona-chip');
  const personaAvatar = document.getElementById('personaAvatar');
  const personaName = document.getElementById('personaName');
  const personaRole = document.getElementById('personaRole');
  const personaBio = document.getElementById('personaBio');
  const aiStatusText = document.getElementById('aiStatusText');
  const aiChatHistory = document.getElementById('aiChatHistory');
  const aiMessageInput = document.getElementById('aiMessageInput');
  const btnSendAIMessage = document.getElementById('btnSendAIMessage');
  const btnClearAIChat = document.getElementById('btnClearAIChat');

  const personas = {
    alex: {
      name: 'Alex',
      avatar: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle></svg>`,
      role: 'Principal Design System Architect',
      bio: 'Specialized in visual hierarchy, Figma auto-layout constraints, typography scales, and translating UI tokens into practical web structures.',
      status: 'Alex is ready to guide your design learning'
    },
    kavita: {
      name: 'Kavita',
      avatar: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`,
      role: 'Webflow & Frontend Specialist',
      bio: 'Focuses on visual CSS architecture, fluid layout models, Client-First conventions, and zero-code responsive development.',
      status: 'Kavita is ready to troubleshoot your Webflow & CSS questions'
    },
    socrates: {
      name: 'Socrates',
      avatar: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
      role: 'Adaptive Concept & Retention Coach',
      bio: 'Uses the Socratic method and simple real-world analogies to deepen your comprehension and ensure long-term mastery of web design fundamentals.',
      status: 'Socrates is ready to test and deepen your understanding'
    }
  };

  function switchPersona(personaKey) {
    state.activePersona = personaKey;
    const p = personas[personaKey];

    personaChips.forEach(chip => {
      chip.classList.toggle('active', chip.dataset.persona === personaKey);
    });

    if (personaAvatar) personaAvatar.innerHTML = p.avatar;
    if (personaName) personaName.textContent = p.name;
    if (personaRole) personaRole.textContent = p.role;
    if (personaBio) personaBio.textContent = p.bio;
    if (aiStatusText) aiStatusText.textContent = p.status;

    // Render persona's chat history
    renderChatHistory();
    showToast(`Switched AI learning agent to ${p.name}!`);
  }

  personaChips.forEach(chip => {
    chip.addEventListener('click', () => switchPersona(chip.dataset.persona));
  });

  function renderChatHistory() {
    if (!aiChatHistory) return;
    aiChatHistory.innerHTML = '';
    const messages = state.chatHistory[state.activePersona] || [];

    messages.forEach(msg => {
      const row = document.createElement('div');
      row.className = `ai-msg-row ${msg.sender === 'user' ? 'user' : 'ai-agent'}`;
      row.innerHTML = `
        ${msg.sender === 'agent' ? `<div class="agent-avatar-sm">${personas[state.activePersona].avatar}</div>` : ''}
        <div class="ai-bubble"><p>${msg.text}</p></div>
      `;
      aiChatHistory.appendChild(row);
    });

    aiChatHistory.scrollTop = aiChatHistory.scrollHeight;
  }

  function generateAIResponse(userText, personaKey) {
    const lower = userText.toLowerCase();

    if (personaKey === 'alex') {
      if (lower.includes('hug') || lower.includes('fill') || lower.includes('auto-layout')) {
        return "In Figma Auto-Layout, think of 'Hug' and 'Fill' like this: **Hug contents** tells a frame to shrink-wrap tightly around its children (great for buttons and tags). **Fill container** tells an element to stretch to 100% of its parent's width (essential for responsive body text and fluid cards). When transitioning to Webflow, 'Fill' behaves like `width: 100%` inside a flex container!";
      }
      if (lower.includes('breakpoint') || lower.includes('mobile') || lower.includes('tablet')) {
        return "When adapting from 1440px to 768px and 375px: 1) Switch multi-column cards (`flex-direction: row`) into single columns (`flex-direction: column`). 2) Tighten side padding from 40px down to 16px. 3) Reduce primary header font sizes by ~25% using fluid clamp or rem units.";
      }
      return `Great design question! In modern UI architecture, structuring your visual tokens first makes responsive scaling effortless. In our Module 2 learning material, focus on nesting auto-layout frames before applying individual element styles.`;
    }

    if (personaKey === 'kavita') {
      if (lower.includes('rem') || lower.includes('px') || lower.includes('token')) {
        return "Always prefer `rem` over `px` in Webflow! `1rem` equals the root font size (usually 16px). When users adjust their browser accessibility settings, rem units scale proportionally, whereas hardcoded pixels break readability and accessibility standards.";
      }
      if (lower.includes('grid') || lower.includes('flexbox')) {
        return "Use **CSS Flexbox** for 1-dimensional layouts (navbars, button rows, tag lists). Use **CSS Grid** for 2-dimensional layouts (product grids, dashboard cards, image galleries). In Webflow, Grid offers native gap controls without needing negative margins!";
      }
      return `From a Webflow development perspective: keep your class names clean using Client-First naming conventions (e.g. \`card_component\`, \`section_hero\`). This makes sharing projects with teammates in your classroom portal much cleaner!`;
    }

    if (personaKey === 'socrates') {
      return `Consider this: If a website is designed only for the desktop user, whose perspective are you excluding? When we examine responsive breakpoints, are we merely resizing boxes, or are we adapting the conversation to someone holding a phone on a crowded train? What information does that mobile user need to see first?`;
    }

    return "I'm here to support your learning! Ask me about any topic in the Blendify curriculum.";
  }

  function sendAIMessage(overrideText = null) {
    const text = overrideText || aiMessageInput.value.trim();
    if (!text) return;

    // Add user message
    state.chatHistory[state.activePersona].push({ sender: 'user', text });
    if (!overrideText && aiMessageInput) aiMessageInput.value = '';
    renderChatHistory();

    // Show simulated typing status
    const currentP = personas[state.activePersona];
    if (aiStatusText) aiStatusText.textContent = `${currentP.name} is thinking...`;

    setTimeout(() => {
      const reply = generateAIResponse(text, state.activePersona);
      state.chatHistory[state.activePersona].push({ sender: 'agent', text: reply });
      renderChatHistory();
      if (aiStatusText) aiStatusText.textContent = currentP.status;
    }, 600);
  }

  btnSendAIMessage?.addEventListener('click', () => sendAIMessage());
  aiMessageInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendAIMessage();
    }
  });

  btnClearAIChat?.addEventListener('click', () => {
    state.chatHistory[state.activePersona] = [
      { sender: 'agent', text: `Chat cleared. How can I help you with your learning goals today?` }
    ];
    renderChatHistory();
    showToast('Conversation cleared.');
  });

  // Prompt chips click
  document.querySelectorAll('.prompt-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const prompt = chip.dataset.prompt;
      sendAIMessage(prompt);
    });
  });

  // =========================================================================
  // GLOBAL SEARCH & SHORTCUTS (CMD + F)
  // =========================================================================
  const searchModal = document.getElementById('searchModal');
  const globalSearchTrigger = document.getElementById('globalSearchTrigger');
  const modalSearchClose = document.getElementById('modalSearchClose');
  const modalSearchInput = document.getElementById('modalSearchInput');
  const searchResults = document.getElementById('searchResults');

  function openSearch() {
    searchModal?.classList.add('open');
    setTimeout(() => modalSearchInput?.focus(), 60);
  }

  function closeSearch() {
    searchModal?.classList.remove('open');
    if (modalSearchInput) modalSearchInput.value = '';
  }

  globalSearchTrigger?.addEventListener('click', openSearch);
  modalSearchClose?.addEventListener('click', closeSearch);

  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') {
      e.preventDefault();
      openSearch();
    }
    if (e.key === 'Escape') {
      closeSearch();
      closeCreatePortalModal();
    }
  });

  searchResults?.querySelectorAll('.search-result-item').forEach(item => {
    item.addEventListener('click', () => {
      const action = item.dataset.action;
      closeSearch();
      if (action === 'view-materials') switchView('materials');
      if (action === 'view-workplaces') switchView('workplaces');
      if (action === 'view-ai-agent') switchView('ai-agent');
    });
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

  // Synchronize Google Account User & Permanent Role
  try {
    const rawUser = localStorage.getItem('blendify_auth_user');
    const savedRole = localStorage.getItem('blendify_role');

    // If account role is locked to teacher, redirect to teacher studio
    if (savedRole === 'teacher') {
      window.location.replace('create-course.html');
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
        if (userAvatarEl) userAvatarEl.textContent = user.name.charAt(0).toUpperCase();
        if (panelNameEl) panelNameEl.textContent = user.name;
        if (panelRoleEl) panelRoleEl.textContent = 'Student · Blendify Pro';
      }
    }
  } catch (e) {}

  document.getElementById('btnSignOutAccount')?.addEventListener('click', () => {
    localStorage.removeItem('blendify_auth_user');
    localStorage.removeItem('blendify_role');
    window.location.href = 'login.html';
  });

  // Mobile sidebar toggle
  const sidebar = document.getElementById('sidebar');
  document.getElementById('sidebarToggle')?.addEventListener('click', () => {
    sidebar?.classList.toggle('open');
  });

  console.log('Blendify LMS active: Learning Materials, Classroom Workplaces & AI Agent ready.');
});
