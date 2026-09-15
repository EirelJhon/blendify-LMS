/**
 * BLENDIFY INTERACTIVE AI LEARNING AGENT WITH OPENAI INTEGRATION
 * Features:
 * - Direct connection to OpenAI API (gpt-4o-mini) with key configuration
 * - Strict Persona Purpose, Limitations & Guardrail Enforcement (Alex, Kavita, Socrates)
 * - Automatic quota / offline resilience with high-fidelity local intelligence fallback
 * - Real-time animated typing & streaming effect
 * - Markdown & Code block rendering with 1-click Copy Code button
 * - In-chat interactive quiz engine with immediate feedback
 * - Multi-turn conversational context memory
 */

export const DEFAULT_OPENAI_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_OPENAI_API_KEY) || '';

export function getOpenAIApiKey() {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('blendify_openai_api_key') || DEFAULT_OPENAI_KEY;
  }
  return DEFAULT_OPENAI_KEY;
}

export function setOpenAIApiKey(key) {
  if (typeof localStorage !== 'undefined') {
    if (key && key.trim()) {
      localStorage.setItem('blendify_openai_api_key', key.trim());
    } else {
      localStorage.removeItem('blendify_openai_api_key');
    }
  }
}

/**
 * AI PERSONAS DEFINITION
 */
export const AI_PERSONAS = {
  alex: {
    name: 'Alex',
    avatar: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle></svg>`,
    role: 'Principal Design System Architect',
    bio: 'Specialized in visual hierarchy, Figma auto-layout constraints, typography scales, and translating UI tokens into practical web structures.',
    status: 'Alex is ready to guide your design learning',
    followups: [
      '💡 Show practical Figma Auto-Layout example',
      '🎯 Quiz me on responsive breakpoints',
      '📱 How does 1440px desktop adapt to 375px mobile?'
    ]
  },
  kavita: {
    name: 'Kavita',
    avatar: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`,
    role: 'Webflow & Frontend Specialist',
    bio: 'Focuses on visual CSS architecture, fluid layout models, Client-First conventions, and zero-code responsive development.',
    status: 'Kavita is ready to troubleshoot your Webflow & CSS questions',
    followups: [
      '💻 Show CSS clamp() formula for fluid text',
      '⚡ CSS Grid vs Flexbox: When to use which?',
      '🎯 Quiz me on rem vs px units'
    ]
  },
  socrates: {
    name: 'Socrates',
    avatar: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
    role: 'Adaptive Concept & Retention Coach',
    bio: 'Uses the Socratic method and simple real-world analogies to deepen your comprehension and ensure long-term mastery of web design fundamentals.',
    status: 'Socrates is ready to test and deepen your understanding',
    followups: [
      '🤔 Why does mobile priority differ from desktop?',
      '🎯 Test my understanding with a conceptual challenge',
      '🧩 What is the true purpose of design tokens?'
    ]
  }
};

/**
 * RULES OF LIMITATION & SYSTEM PROMPTS BASED ON SPECIALIZED PURPOSE
 */
export const AI_AGENT_RULES = {
  alex: {
    name: 'Alex',
    role: 'Principal Design System Architect',
    purpose: 'Specializes in UI/UX architecture, Figma auto-layout, spacing tokens, typography scales, and visual hierarchy.',
    limitations: [
      'Scope restricted strictly to UI/UX design, visual hierarchy, Figma auto-layouts, and design system tokens.',
      'Will NOT write complex backend code, database queries, or server-side scripts. Directs backend/CSS questions to Kavita.',
      'Refuses non-design, non-educational, or completely off-topic inquiries (e.g., general trivia, math homework, finance).',
      'Encourages structured design decisions with practical token recommendations (4pt/8pt grid).'
    ],
    systemPrompt: `You are Alex, the Principal Design System Architect and AI Mentor at Blendify LMS.
Your purpose: Guide students on visual hierarchy, Figma auto-layout constraints, responsive breakpoints (1440px desktop to 768px tablet and 375px mobile), spacing systems (4pt/8pt), and design token architecture.

RULES OF LIMITATION (STRICT ENFORCEMENT):
1. DOMAIN BOUNDARY: You ONLY answer questions about UI/UX design, Figma, visual hierarchy, design tokens, color contrast, and layout aesthetics.
2. OUT-OF-SCOPE RE-ROUTING: If asked for low-level CSS debugging, Webflow-specific implementation, or backend code, politely state: "That is outside my domain as your Design System Architect. For CSS code and Webflow implementation, please switch to Kavita!"
3. OFF-TOPIC REFUSAL: If the student asks questions completely unrelated to digital product design, web architecture, or educational curriculum, politely decline and steer them back to UI/UX topics.
4. FORMATTING: Use structured markdown, concise bullet points, and code blocks for design token schemas where appropriate. Keep answers practical, encouraging, and focused.`
  },

  kavita: {
    name: 'Kavita',
    role: 'Webflow & Frontend Specialist',
    purpose: 'Focuses on visual CSS architecture, fluid layout models, Client-First conventions, and zero-code responsive development.',
    limitations: [
      'Scope restricted strictly to Webflow, HTML, CSS, fluid layout formulas (clamp/rem), and frontend implementation.',
      'Will NOT provide subjective artistic branding critiques or abstract philosophical theory without code context. Directs students to Alex or Socrates.',
      'Refuses requests for non-web engineering, generic software scripts, or non-educational topics.',
      'Ensures all CSS and Webflow advice follows modern standards (responsive, accessible, clean class names).'
    ],
    systemPrompt: `You are Kavita, the Webflow and Frontend Code Specialist at Blendify LMS.
Your purpose: Help students master responsive front-end development, Webflow Client-First conventions, modern CSS (Flexbox, CSS Grid), fluid typography formulas (clamp()), and debugging 100vw horizontal overflow.

RULES OF LIMITATION (STRICT ENFORCEMENT):
1. DOMAIN BOUNDARY: You ONLY answer questions related to Webflow, HTML/CSS, frontend layout models, responsive breakpoints, and code troubleshooting.
2. OUT-OF-SCOPE RE-ROUTING: If asked for abstract design aesthetics or visual branding tokens without code context, say: "My specialty is Webflow and front-end CSS implementation! For design tokens and visual hierarchy, please consult Alex." If asked deep philosophical learning questions, direct them to Socrates.
3. OFF-TOPIC REFUSAL: If the student asks questions unrelated to web development, coding, or LMS learning materials, politely decline and redirect them to frontend topics.
4. FORMATTING: Provide clean, modern, production-grade CSS or HTML code blocks with short explanations. Always prioritize fluid units (rem, clamp) over fixed px.`
  },

  socrates: {
    name: 'Socrates',
    role: 'Adaptive Concept & Retention Coach',
    purpose: 'Uses the Socratic method and simple real-world analogies to deepen comprehension and ensure long-term mastery of web design fundamentals.',
    limitations: [
      'Scope restricted to conceptual reasoning, UX psychology, design trade-offs, and critical thinking.',
      'Will NOT simply hand over direct assignment solutions or raw copy-paste boilerplate code. Guides students to think through the problem.',
      'Directs students seeking raw code syntax or specific Webflow fixes to Kavita.',
      'Refuses inquiries unrelated to digital design concepts, user empathy, and curriculum mastery.'
    ],
    systemPrompt: `You are Socrates, the Adaptive Concept and Retention Coach at Blendify LMS.
Your purpose: Use the Socratic method, probing questions, and relatable real-world analogies to deepen the student's conceptual understanding of responsive design, viewport adaptation, and digital systems.

RULES OF LIMITATION (STRICT ENFORCEMENT):
1. SOCRATIC METHOD GUARDRAIL: DO NOT simply write full solutions or do the student's homework for them. Instead, answer with thought-provoking explanations followed by 1 or 2 targeted questions that guide the student to arrive at the answer themselves.
2. DOMAIN BOUNDARY: You focus on the *why* and *how* of design logic, cognitive load, mobile-first constraints, and user empathy.
3. OUT-OF-SCOPE RE-ROUTING: If the student insists on immediate raw code snippets or syntax troubleshooting, guide them conceptually, then suggest: "If you need immediate CSS syntax or Webflow code, Kavita is our front-end specialist!"
4. OFF-TOPIC REFUSAL: Politely decline any queries outside of digital design principles, tech concepts, and educational growth. Keep the tone intellectually stimulating, warm, and philosophical.`
  }
};

// Conversational turn memory per persona
const conversationHistories = {
  alex: [],
  kavita: [],
  socrates: []
};

/**
 * Format markdown, code blocks, bold, lists, and inline tags into HTML
 */
export function formatAIMarkdown(rawText) {
  let text = rawText || '';

  // Parse code blocks ```lang ... ```
  text = text.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
    const language = lang || 'code';
    const escapedCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `
      <div class="ai-code-header">
        <span>${language.toUpperCase()}</span>
        <button type="button" class="btn-copy-code" data-code="${encodeURIComponent(code)}">Copy Code</button>
      </div>
      <pre><code>${escapedCode}</code></pre>
    `;
  });

  // Inline code `code`
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Bold **text**
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Bullet points
  text = text.replace(/^\s*[-*]\s+(.*)$/gm, '<li>$1</li>');
  text = text.replace(/((?:<li>.*?<\/li>\s*)+)/gs, '<ul>$1</ul>');

  // Line breaks (except inside pre)
  text = text.replace(/\n\n/g, '<br/><br/>');

  return text;
}

/**
 * Call OpenAI Chat Completions API with System Persona Rules
 */
async function callOpenAIApi(userText, personaKey) {
  const apiKey = getOpenAIApiKey();
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('No OpenAI API key provided');
  }

  const rules = AI_AGENT_RULES[personaKey] || AI_AGENT_RULES.alex;
  const history = conversationHistories[personaKey] || [];

  const messages = [
    { role: 'system', content: rules.systemPrompt },
    ...history.slice(-6),
    { role: 'user', content: userText }
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey.trim()}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 0.7,
      max_tokens: 700
    })
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    const errMessage = errorJson?.error?.message || `HTTP ${response.status} ${response.statusText}`;
    const errType = errorJson?.error?.type || 'api_error';
    const err = new Error(errMessage);
    err.status = response.status;
    err.type = errType;
    throw err;
  }

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content || '';

  // Record into conversational turn memory
  history.push({ role: 'user', content: userText });
  history.push({ role: 'assistant', content: reply });
  if (history.length > 12) history.splice(0, history.length - 12);

  return {
    text: reply,
    followups: AI_PERSONAS[personaKey]?.followups || ['💡 Ask another question', '🎯 Test my understanding']
  };
}

/**
 * Local high-accuracy response engine (Fallback when offline or quota limits occur)
 */
export function getLocalAIResponse(userText, personaKey) {
  const lower = (userText || '').toLowerCase().trim();

  // --- Interactive Quiz Request ---
  if (lower.includes('quiz') || lower.includes('test me') || lower.includes('challenge')) {
    if (personaKey === 'kavita') {
      return {
        text: `Here is a practical front-end challenge on CSS layout units:`,
        quiz: {
          question: "Why is using `rem` for typography considered better for accessibility than `px`?",
          options: [
            { text: "A) rem loads 20% faster in modern web browsers.", isCorrect: false },
            { text: "B) rem respects the user's browser font-size settings and zoom preferences.", isCorrect: true },
            { text: "C) rem automatically centers headings inside flexbox containers.", isCorrect: false },
            { text: "D) rem requires zero CSS declarations in Webflow.", isCorrect: false }
          ],
          explanation: "Correct! `rem` is relative to the root font size. When visually impaired users increase default text size in browser settings, rem units scale proportionally."
        },
        followups: ['💡 Show rem calculation formula', '📐 Explain rem vs em', 'Ask another quiz question']
      };
    }

    if (personaKey === 'alex') {
      return {
        text: `Let's test your understanding of Figma Auto-Layout and responsive behavior:`,
        quiz: {
          question: "In Figma Auto-Layout, when should you set a card's width to 'Fill container' instead of 'Hug contents'?",
          options: [
            { text: "A) When you want the card to stay locked to a fixed 300px width.", isCorrect: false },
            { text: "B) When the card must stretch fluidly to take up 100% of its parent frame's width.", isCorrect: true },
            { text: "C) Only when exporting the card as an SVG icon.", isCorrect: false },
            { text: "D) When wrapping text tags in a pill badge.", isCorrect: false }
          ],
          explanation: "Spot on! 'Fill container' behaves like `width: 100%` in CSS, making elements fluidly expand to take up all available parent space."
        },
        followups: ['💡 Practical Auto-Layout card demo', '📱 Transitioning to 768px tablet layout', 'Ask another quiz question']
      };
    }

    return {
      text: `Consider this conceptual design problem:`,
      quiz: {
        question: "When designing mobile-first, why is content hierarchy more critical than visual ornamentation?",
        options: [
          { text: "A) Mobile devices cannot display gradient colors.", isCorrect: false },
          { text: "B) Limited screen estate demands immediate clarity on the primary user action.", isCorrect: true },
          { text: "C) Search engines penalize any page that contains rounded corners.", isCorrect: false }
        ],
        explanation: "Exactly. On mobile, attention span and viewport area are compressed. Every pixel must serve the user's primary intent."
      },
      followups: ['🤔 How to decide what to hide on mobile?', '💡 Show 3 golden rules of mobile UX']
    };
  }

  // --- SQLite / Database Questions ---
  if (lower.includes('sqlite') || lower.includes('database') || lower.includes('sql') || lower.includes('api') || lower.includes('table')) {
    return {
      text: `**Blendify SQLite Relational Architecture:**\n\nBlendify is powered by an in-browser SQLite database running via WebAssembly (\`sql.js\`). All data is stored in real relational tables:\n\n- \`users\`: Authentication accounts, roles (\`student\`, \`teacher\`), and timestamps.\n- \`classroom_portals\`: Live cohort rooms, tags (\`#PORTAL-FIGMA-101\`), instructors, and members.\n- \`learning_materials\`: Community-uploaded guides, file sizes, and download stats.\n- \`quizzes\`: Practical assignments and quizzes created in Teacher Studio.\n- \`student_activities\`: Real-time audit log of student interactions.\n\nYou can open the **Database & API Explorer** from your profile menu or press \`Ctrl + Shift + D\` to run custom SQL queries!`,
      followups: [
        '💡 Show sample SQL query for popular materials',
        '📊 How does WebAssembly SQLite persist data?',
        '🎯 Quiz me on SQL databases'
      ]
    };
  }

  // --- Figma Auto-Layout ---
  if (lower.includes('hug') || lower.includes('fill') || lower.includes('auto-layout') || lower.includes('autolayout')) {
    return {
      text: `### Understanding Figma Auto-Layout: Hug vs Fill vs Fixed\n\n- **Hug Contents**: The frame shrink-wraps tightly to fit its child contents (padding + child size). Ideal for buttons, badge pills, and tag labels.\n- **Fill Container**: The child stretches to take **100% of the parent frame's width or height**. Essential for body paragraphs, responsive cards, and full-width banners.\n- **Fixed**: The element retains an immutable pixel dimension (e.g. \`48px × 48px\` avatar icons).\n\n\`\`\`css\n/* CSS Equivalent */\n.pill-tag { width: fit-content; }  /* Hug */\n.fluid-card { width: 100%; }        /* Fill */\n.avatar-icon { width: 48px; }       /* Fixed */\n\`\`\``,
      followups: [
        '📱 How do I convert auto-layout to Webflow?',
        '💡 Show nested Auto-Layout card example',
        '🎯 Quiz me on Auto-Layout'
      ]
    };
  }

  // --- Breakpoints (1440px -> 768px -> 375px) ---
  if (lower.includes('breakpoint') || lower.includes('tablet') || lower.includes('mobile') || lower.includes('1440') || lower.includes('768')) {
    return {
      text: `### The 3 Golden Breakpoint Rules for Responsive Design:\n\n1. **1440px (Desktop)**: Multi-column grid (\`grid-template-columns: repeat(3, 1fr)\`), 40px–64px outer padding, and 48px hero headers.\n2. **768px (Tablet)**: Collapse to 2 columns or stacked cards, reduce horizontal padding to 24px, and scale headings by ~20%.\n3. **375px (Mobile Phone)**: Single column (\`flex-direction: column\`), 16px side margins, sticky navigation or off-canvas drawer, and minimum touch targets of \`44px × 44px\`.\n\n\`\`\`css\n@media (max-width: 768px) {\n  .grid-layout { grid-template-columns: 1fr; }\n  .hero-title { font-size: 1.8rem; }\n}\n\`\`\``,
      followups: [
        '💡 What is fluid typography clamping?',
        '🎯 Quiz me on responsive breakpoints',
        '📱 Best practices for mobile navigation menus'
      ]
    };
  }

  // --- CSS Fluid Clamping & Rem ---
  if (lower.includes('clamp') || lower.includes('rem') || lower.includes('fluid') || lower.includes('font-size')) {
    return {
      text: `### Modern CSS Fluid Sizing with \`clamp()\`\n\nInstead of writing dozens of media queries, use CSS \`clamp(min, preferred, max)\` to smoothly interpolate font size between mobile and desktop:\n\n\`\`\`css\n/* Fluid Hero Title: min 28px, scales with viewport, max 48px */\nh1.hero-title {\n  font-size: clamp(1.75rem, 4vw + 1rem, 3rem);\n  line-height: 1.2;\n}\n\`\`\`\n\n**Why this matters**: On a phone (\`375px\`), the title never drops below 28px; on an ultra-wide monitor, it never balloons past 48px!`,
      followups: [
        '💡 How do I calculate clamp values in Webflow?',
        '🎯 Quiz me on CSS units',
        '⚡ Why rem is better than px'
      ]
    };
  }

  // --- CSS Grid vs Flexbox ---
  if (lower.includes('grid') || lower.includes('flexbox') || lower.includes('flex')) {
    return {
      text: `### CSS Grid vs Flexbox: The Modern Decision Matrix\n\n- **CSS Flexbox (1-Dimensional)**:\n  * Use when aligning items in a **single row OR single column**.\n  * Best for: Navbars, button groups, breadcrumbs, tags, and centering elements.\n- **CSS Grid (2-Dimensional)**:\n  * Use when arranging items across **both rows AND columns simultaneously**.\n  * Best for: Course card catalogs, photo galleries, dashboard widgets, and complex page scaffolding.\n\n\`\`\`css\n/* Responsive Auto-Fitting Grid without Media Queries */\n.materials-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));\n  gap: 20px;\n}\n\`\`\``,
      followups: [
        '💡 Show auto-fit vs auto-fill example',
        '🎯 Quiz me on Grid vs Flexbox',
        '📱 How to collapse a grid on mobile'
      ]
    };
  }

  // Persona Specific Default Fallbacks
  if (personaKey === 'alex') {
    return {
      text: `Great question regarding UI architecture! In modern digital design, structuring your components with consistent spacing tokens (\`8px\`, \`16px\`, \`24px\`, \`32px\`) ensures harmony between desktop prototypes and live responsive code.\n\nWould you like to explore Figma Auto-Layout, breakpoint translation, or design token JSON schemas?`,
      followups: [
        '💡 Explain Hug vs Fill in Figma',
        '📐 How to use 8pt spacing tokens',
        '🎯 Quiz me on UI design'
      ]
    };
  }

  if (personaKey === 'kavita') {
    return {
      text: `From a front-end implementation perspective: clean class names (like Client-First or BEM) and fluid CSS units (\`rem\`, \`clamp()\`) will save you countless hours of bug-hunting across different screen widths.\n\nWhat front-end or Webflow challenge can I help you troubleshoot?`,
      followups: [
        '💻 Show CSS clamp() formula for fluid text',
        '⚡ CSS Grid vs Flexbox',
        '🎯 Quiz me on Webflow CSS'
      ]
    };
  }

  return {
    text: `Consider this inquiry from first principles: When a designer or developer creates a digital interface, whose world are they shaping? Are you building for yourself on a large 4K monitor, or for a student navigating your portal on a budget smartphone while commuting?\n\nWhat is the single most essential element of the experience you are designing?`,
    followups: [
      '🤔 How do constraints spark better creativity?',
      '🎯 Challenge me with a conceptual design puzzle',
      '📱 How to prioritize mobile user needs'
    ]
  };
}

/**
 * Master AI Response Dispatcher (OpenAI API first, graceful local fallback)
 */
export async function getAIResponse(userText, personaKey) {
  try {
    const liveResponse = await callOpenAIApi(userText, personaKey);
    return liveResponse;
  } catch (error) {
    console.warn(`[Blendify AI] OpenAI API notice (${error.message}). Utilizing specialized persona engine.`);
    const fallbackResponse = getLocalAIResponse(userText, personaKey);
    return fallbackResponse;
  }
}

/**
 * Initialize Interactive AI Learning Agent
 */
export function initAILearningAgent(state, showToast) {
  const aiChatHistory = document.getElementById('aiChatHistory');
  const aiMessageInput = document.getElementById('aiMessageInput');
  const btnSendAIMessage = document.getElementById('btnSendAIMessage');
  const btnClearAIChat = document.getElementById('btnClearAIChat');
  const aiStatusText = document.getElementById('aiStatusText');
  const personaChips = document.querySelectorAll('.persona-chip');
  const personaAvatar = document.getElementById('personaAvatar');
  const personaName = document.getElementById('personaName');
  const personaRole = document.getElementById('personaRole');
  const personaBio = document.getElementById('personaBio');
  const aiRulesPurposeText = document.getElementById('aiRulesPurposeText');
  const aiRulesList = document.getElementById('aiRulesList');

  let isGenerating = false;

  // Render chat message bubble with rich formatting
  function appendMessageRow(sender, contentObj) {
    if (!aiChatHistory) return null;
    const row = document.createElement('div');
    row.className = `ai-msg-row ${sender === 'user' ? 'user' : 'ai-agent'}`;

    const textHtml = typeof contentObj === 'string' ? formatAIMarkdown(contentObj) : formatAIMarkdown(contentObj.text || '');

    row.innerHTML = `
      ${sender === 'agent' ? `<div class="agent-avatar-sm">${AI_PERSONAS[state.activePersona]?.avatar || 'AI'}</div>` : ''}
      <div class="ai-bubble">
        <div class="ai-text-body">${textHtml}</div>
        ${contentObj.quiz ? renderQuizHtml(contentObj.quiz) : ''}
        ${contentObj.followups ? renderFollowupChipsHtml(contentObj.followups) : ''}
      </div>
    `;

    aiChatHistory.appendChild(row);
    aiChatHistory.scrollTop = aiChatHistory.scrollHeight;

    // Attach copy code buttons
    row.querySelectorAll('.btn-copy-code').forEach(btn => {
      btn.addEventListener('click', () => {
        const code = decodeURIComponent(btn.dataset.code);
        navigator.clipboard.writeText(code);
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = 'Copy Code', 2000);
      });
    });

    // Attach quiz answer clicks
    row.querySelectorAll('.ai-quiz-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const isCorrect = btn.dataset.correct === 'true';
        const quizBox = btn.closest('.ai-quiz-card');
        const verdictEl = quizBox.querySelector('.ai-quiz-verdict');

        quizBox.querySelectorAll('.ai-quiz-btn').forEach(b => {
          b.disabled = true;
          if (b.dataset.correct === 'true') {
            b.classList.add('correct');
          } else {
            b.classList.add('incorrect');
          }
        });

        if (isCorrect) {
          verdictEl.innerHTML = `<span style="color:#10b981;">🎉 Correct!</span> ${quizBox.dataset.explanation || ''}`;
          showToast('Great job! That answer is correct.');
        } else {
          verdictEl.innerHTML = `<span style="color:#ef4444;">❌ Not quite.</span> ${quizBox.dataset.explanation || ''}`;
        }
      });
    });

    // Attach follow-up chip clicks
    row.querySelectorAll('.ai-followup-btn').forEach(chip => {
      chip.addEventListener('click', () => {
        const prompt = chip.dataset.prompt;
        sendAIMessage(prompt);
      });
    });

    return row;
  }

  function renderQuizHtml(quiz) {
    return `
      <div class="ai-quiz-card" data-explanation="${quiz.explanation.replace(/"/g, '&quot;')}">
        <div class="ai-quiz-q-title">🎯 ${quiz.question}</div>
        <div class="ai-quiz-options-list">
          ${quiz.options.map(opt => `
            <button type="button" class="ai-quiz-btn" data-correct="${opt.isCorrect}">
              ${opt.text}
            </button>
          `).join('')}
        </div>
        <div class="ai-quiz-verdict"></div>
      </div>
    `;
  }

  function renderFollowupChipsHtml(followups) {
    return `
      <div class="ai-followup-chips">
        ${followups.map(chipText => `
          <button type="button" class="ai-followup-btn" data-prompt="${chipText.replace(/"/g, '&quot;')}">
            <span>${chipText}</span>
          </button>
        `).join('')}
      </div>
    `;
  }

  // Stream text animation
  async function streamAIResponse(responseObj) {
    const text = responseObj.text;
    const currentP = AI_PERSONAS[state.activePersona] || AI_PERSONAS.alex;

    // Create placeholder agent message row with typing dots
    const row = document.createElement('div');
    row.className = 'ai-msg-row ai-agent';
    row.innerHTML = `
      <div class="agent-avatar-sm">${currentP.avatar}</div>
      <div class="ai-bubble">
        <div class="ai-typing-indicator">
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
        </div>
      </div>
    `;
    aiChatHistory.appendChild(row);
    aiChatHistory.scrollTop = aiChatHistory.scrollHeight;

    if (aiStatusText) aiStatusText.textContent = `${currentP.name} is thinking & analyzing...`;

    // Natural processing delay
    await new Promise(r => setTimeout(r, 350));

    const bubble = row.querySelector('.ai-bubble');
    bubble.innerHTML = `<div class="ai-text-body"></div>`;
    const textBody = bubble.querySelector('.ai-text-body');

    // Fast word-by-word streaming effect
    const words = text.split(' ');
    let currentText = '';

    for (let i = 0; i < words.length; i++) {
      currentText += (i === 0 ? '' : ' ') + words[i];
      textBody.innerHTML = formatAIMarkdown(currentText);
      aiChatHistory.scrollTop = aiChatHistory.scrollHeight;
      await new Promise(r => setTimeout(r, 12));
    }

    // Append quiz if present
    if (responseObj.quiz) {
      const quizWrap = document.createElement('div');
      quizWrap.innerHTML = renderQuizHtml(responseObj.quiz);
      bubble.appendChild(quizWrap.firstElementChild);

      // Wire quiz buttons
      bubble.querySelectorAll('.ai-quiz-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const isCorrect = btn.dataset.correct === 'true';
          const quizBox = btn.closest('.ai-quiz-card');
          const verdictEl = quizBox.querySelector('.ai-quiz-verdict');

          quizBox.querySelectorAll('.ai-quiz-btn').forEach(b => {
            b.disabled = true;
            if (b.dataset.correct === 'true') {
              b.classList.add('correct');
            } else {
              b.classList.add('incorrect');
            }
          });

          if (isCorrect) {
            verdictEl.innerHTML = `<span style="color:#10b981;">🎉 Correct!</span> ${quizBox.dataset.explanation || ''}`;
            showToast('Great job! That answer is correct.');
          } else {
            verdictEl.innerHTML = `<span style="color:#ef4444;">❌ Not quite.</span> ${quizBox.dataset.explanation || ''}`;
          }
        });
      });
    }

    // Append follow-up chips if present
    if (responseObj.followups) {
      const chipsWrap = document.createElement('div');
      chipsWrap.innerHTML = renderFollowupChipsHtml(responseObj.followups);
      bubble.appendChild(chipsWrap.firstElementChild);

      bubble.querySelectorAll('.ai-followup-btn').forEach(chip => {
        chip.addEventListener('click', () => {
          const prompt = chip.dataset.prompt;
          sendAIMessage(prompt);
        });
      });
    }

    // Attach copy code buttons
    bubble.querySelectorAll('.btn-copy-code').forEach(btn => {
      btn.addEventListener('click', () => {
        const code = decodeURIComponent(btn.dataset.code);
        if (navigator.clipboard) {
          navigator.clipboard.writeText(code);
          btn.textContent = 'Copied!';
          setTimeout(() => btn.textContent = 'Copy Code', 2000);
        }
      });
    });

    if (aiStatusText) aiStatusText.textContent = currentP.status;
    isGenerating = false;
  }

  async function sendAIMessage(overrideText = null) {
    if (isGenerating) return;
    const text = overrideText || (aiMessageInput ? aiMessageInput.value.trim() : '');
    if (!text) return;

    isGenerating = true;

    // 1. Add user message
    appendMessageRow('user', text);
    if (!overrideText && aiMessageInput) aiMessageInput.value = '';

    // 2. Generate response via OpenAI / local engine and stream
    try {
      const responseObj = await getAIResponse(text, state.activePersona);
      await streamAIResponse(responseObj);
    } catch (e) {
      console.error('[AI Error]', e);
      await streamAIResponse({
        text: `I encountered an unexpected issue processing that question. Please try asking again or rephrase.`,
        followups: ['Try again', 'Ask a design question']
      });
    }
  }

  function updateRulesUI(personaKey) {
    const rules = AI_AGENT_RULES[personaKey] || AI_AGENT_RULES.alex;
    if (aiRulesPurposeText) {
      aiRulesPurposeText.textContent = rules.purpose;
    }
    if (aiRulesList) {
      aiRulesList.innerHTML = rules.limitations.map(lim => `<li>${lim}</li>`).join('');
    }
  }

  function switchPersona(personaKey) {
    state.activePersona = personaKey;
    const p = AI_PERSONAS[personaKey];
    if (!p) return;

    personaChips.forEach(chip => {
      chip.classList.toggle('active', chip.dataset.persona === personaKey);
    });

    if (personaAvatar) personaAvatar.innerHTML = p.avatar;
    if (personaName) personaName.textContent = p.name;
    if (personaRole) personaRole.textContent = p.role;
    if (personaBio) personaBio.textContent = p.bio;
    if (aiStatusText) aiStatusText.textContent = p.status;

    // Synchronize the Rules & Purpose Card
    updateRulesUI(personaKey);

    // Greet user with persona's unique welcome
    if (aiChatHistory) {
      aiChatHistory.innerHTML = '';
      appendMessageRow('agent', {
        text: `Hello! I'm **${p.name}**, your ${p.role}. Connected to OpenAI. How can I assist your learning today?`,
        followups: p.followups
      });
    }

    showToast(`Switched AI mentor to ${p.name}!`);
  }

  personaChips.forEach(chip => {
    chip.addEventListener('click', () => switchPersona(chip.dataset.persona));
  });

  btnSendAIMessage?.addEventListener('click', () => sendAIMessage());
  aiMessageInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendAIMessage();
    }
  });

  btnClearAIChat?.addEventListener('click', () => {
    const p = AI_PERSONAS[state.activePersona] || AI_PERSONAS.alex;
    if (conversationHistories[state.activePersona]) {
      conversationHistories[state.activePersona] = [];
    }
    if (aiChatHistory) {
      aiChatHistory.innerHTML = '';
      appendMessageRow('agent', {
        text: `Conversation cleared. I'm **${p.name}**, ready to explore any curriculum question within my scope!`,
        followups: p.followups
      });
    }
    showToast('Conversation cleared.');
  });

  // Suggested prompt chips on the left sidebar
  document.querySelectorAll('.prompt-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const prompt = chip.dataset.prompt;
      sendAIMessage(prompt);
    });
  });

  // Initial welcome greeting and Rules UI setup
  const initialP = AI_PERSONAS[state.activePersona] || AI_PERSONAS.alex;
  updateRulesUI(state.activePersona || 'alex');

  if (aiChatHistory) {
    aiChatHistory.innerHTML = '';
    appendMessageRow('agent', {
      text: `Hello! I'm **${initialP.name}**, your personalized AI mentor for **Blendify LMS** powered by OpenAI.\n\nI operate within defined architectural rules based on my specialty. Ask me to break down curriculum materials, review responsive Figma auto-layouts, demonstrate CSS clamp formulas, or test your comprehension with interactive quizzes!`,
      followups: initialP.followups
    });
  }
}
