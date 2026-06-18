// --- Error Handling ---
window.onerror = function(message, source, lineno, colno, error) {
    const errBox = document.getElementById('error-box');
    errBox.style.display = 'block';
    errBox.innerText = `Error: ${message}\nLine: ${lineno}`;
    console.error(error);
    return false;
};

const SUPABASE_URL = 'https://youtgmxqayuthobxpbxb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXRnbXhxYXl1dGhvYnhwYnhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4MTEyNTQsImV4cCI6MjA5NzM4NzI1NH0.8SZu9KsLEae6XWfxMeH8ZOvWnfkrKZ9qjtS8fI7xFxo';
let supabaseClient;
try {
    if (!window.supabase || typeof window.supabase.createClient !== 'function') {
        throw new Error('Supabase library not loaded');
    }
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} catch (e) {
    console.error(e);
}

const STATE = {
    lang: localStorage.getItem('pv_lang') || 'en',
    poll: null,
    phase: 'pre',
    screen: 'home'
};

const I18N = {
    en: {
        create: "Create New Poll", vote: "Vote", results: "Results", thanks: "Thank You",
        q: "Question", type: "Type", yesno: "Yes/No", choice: "Choice", emoji: "Emoji", star: "Stars",
        add: "Add Option", submit: "Submit Vote", createBtn: "Create Poll",
        copy: "Copy Link", copied: "Copied!", voteAgain: "Vote Phase 2", before: "Before", after: "After",
        home: "Home", viewRes: "View Results", votes: "votes",
        linkPlaceholder: "Paste poll link or ID...", go: "Go",
        tagline: "Fast opinions. Live results.",
        haveCode: "Open an existing poll",
        desc: "Description (optional)",
        expiresDays: "Expires in (days)",
        expiresHint: "0 = never",
        expired: "Expired",
        pollExpired: "This poll has expired",
        questionRequired: "Question is required",
        addAtLeast2: "Add at least 2 options",
        storageError: "Storage Error",
        pollNotFound: "Poll not found",
        copyFailed: "Failed to copy",
        share: "Share",
        shareThisLink: "Share this link:",
        sharePoll: "Share Poll",
        close: "Close",
        shareVia: "Share via",
        copyLink: "Copy link",
        export: "Export Results",
        exportCSV: "Download as CSV",
        exportSuccess: "Results exported successfully!",
        ready: "Ready!",
        optionPlaceholder: "Option",
        yes: "Yes",
        no: "No",
        about: "About",
        pulsevote: "PulseVote App",
        viewProject: "View PulseVote",
        skills: "Skills",
        projects: "Projects",
        aboutMe: "About Me",
        heroSub: "Web Developer | Building interactive web applications",
        viewOnGitHub: "View on GitHub"
    },
    ar: {
        create: "إنشاء استبيان", vote: "تصويت", results: "النتائج", thanks: "شكراً لك",
        q: "السؤال", type: "النوع", yesno: "نعم/لا", choice: "خيارات", emoji: "رموز", star: "نجوم",
        add: "إضافة خيار", submit: "إرسال", createBtn: "إنشاء",
        copy: "نسخ الرابط", copied: "تم النسخ!", voteAgain: "تصويت المرحلة 2", before: "قبل", after: "بعد",
        home: "الرئيسية", viewRes: "عرض النتائج", votes: "أصوات",
        linkPlaceholder: "ألصق رابط الاستبيان أو المعرّف...", go: "اذهب",
        tagline: "رأي سريع. نتائج مباشرة.",
        haveCode: "فتح استبيان موجود",
        desc: "وصف (اختياري)",
        expiresDays: "ينتهي خلال (أيام)",
        expiresHint: "0 = بدون انتهاء",
        expired: "منتهي",
        pollExpired: "انتهت مدة هذا الاستبيان",
        questionRequired: "السؤال مطلوب",
        addAtLeast2: "أضف خيارين على الأقل",
        storageError: "خطأ في التخزين",
        pollNotFound: "الاستبيان غير موجود",
        copyFailed: "فشل النسخ",
        share: "مشاركة",
        shareThisLink: "شارك هذا الرابط:",
        sharePoll: "مشاركة الاستبيان",
        close: "إغلاق",
        shareVia: "مشاركة عبر",
        copyLink: "نسخ الرابط",
        export: "تصدير النتائج",
        exportCSV: "تحميل كـ CSV",
        exportSuccess: "تم تصدير النتائج بنجاح!",
        ready: "جاهز!",
        optionPlaceholder: "خيار",
        yes: "نعم",
        no: "لا",
        about: "عن المطور",
        pulsevote: "تطبيق PulseVote",
        viewProject: "عرض PulseVote",
        skills: "المهارات",
        projects: "المشاريع",
        aboutMe: "عني",
        heroSub: "مطور ويب | بناء تطبيقات ويب تفاعلية",
        viewOnGitHub: "عرض على GitHub"
    }
};

// --- Core Helpers ---
function t(key) { return I18N[STATE.lang][key] || key; }

function getEl(id) {
    const el = document.getElementById(id);
    if(!el) console.error(`Element #${id} not found`);
    return el;
}

function showToast(msg) {
    const container = getEl('toast-container');
    if(!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function showLoading(show) {
    const container = getEl('app-container');
    if (!container) return;
    if (show) {
        container.innerHTML = `<div class="loading-overlay"><div class="spinner"></div></div>`;
    }
}

function copyToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        document.execCommand('copy');
        showToast(t('copied'));
    } catch (err) {
        showToast(t('copyFailed'));
    }
    document.body.removeChild(textArea);
}

function csvEscape(value) {
    const s = value === null || value === undefined ? '' : String(value);
    return '"' + s.replace(/\"/g, '""') + '"';
}

window.exportToCSV = (poll) => {
    if (!poll) return showToast(t('pollNotFound'));
    const headers = ['Option', 'Phase 1 Votes', 'Phase 2 Votes', 'Total Votes', 'Percentage'];
    const totalPre = poll.votesPre.reduce((a, b) => a + b, 0);
    const totalPost = poll.votesPost.reduce((a, b) => a + b, 0);
    const grandTotal = totalPre + totalPost;
    const lines = [];
    lines.push([csvEscape('Poll ID'), csvEscape(poll.id)].join(','));
    lines.push([csvEscape('Poll Question'), csvEscape(poll.q)].join(','));
    lines.push([csvEscape('Poll Type'), csvEscape(poll.type)].join(','));
    if (poll.description) lines.push([csvEscape('Description'), csvEscape(poll.description)].join(','));
    lines.push([csvEscape('Export Date'), csvEscape(new Date().toLocaleString())].join(','));
    lines.push('');
    lines.push(headers.map(csvEscape).join(','));
    poll.opts.forEach((_, idx) => {
        const vPre = poll.votesPre[idx] || 0;
        const vPost = poll.votesPost[idx] || 0;
        const total = vPre + vPost;
        const pct = grandTotal > 0 ? ((total / grandTotal) * 100).toFixed(2) + '%' : '0%';
        lines.push([
            csvEscape(displayOption(poll, idx)),
            csvEscape(vPre),
            csvEscape(vPost),
            csvEscape(total),
            csvEscape(pct)
        ].join(','));
    });
    lines.push([
        csvEscape('TOTAL'),
        csvEscape(totalPre),
        csvEscape(totalPost),
        csvEscape(grandTotal),
        csvEscape('100%')
    ].join(','));
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `poll_${poll.id}_results.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(t('exportSuccess'));
};

window.closeShareModal = () => {
    const host = getEl('share-modal');
    if (!host) return;
    host.classList.add('hidden');
    host.innerHTML = '';
};

window.openShareModal = (url) => {
    const host = getEl('share-modal');
    if (!host) return;
    const shareUrl = (url || window.location.href || '').trim();
    const title = (STATE.poll && STATE.poll.q ? STATE.poll.q : 'PulseVote');
    const text = `${title}`;
    const encUrl = encodeURIComponent(shareUrl);
    const encText = encodeURIComponent(text);
    const links = {
        whatsapp: `https://wa.me/?text=${encodeURIComponent(text + "\n" + shareUrl)}`,
        telegram: `https://t.me/share/url?url=${encUrl}&text=${encText}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encUrl}`,
        x: `https://twitter.com/intent/tweet?url=${encUrl}&text=${encText}`,
        email: `mailto:?subject=${encText}&body=${encodeURIComponent(text + "\n\n" + shareUrl)}`
    };
    host.innerHTML = `
        <div class="modal-backdrop" onclick="if(event.target === this) window.closeShareModal()">
            <div class="modal-card" role="dialog" aria-modal="true">
                <div class="modal-head">
                    <div class="modal-title">${t('sharePoll')}</div>
                    <button class="btn btn-sm btn-outline" onclick="window.closeShareModal()">${t('close')}</button>
                </div>
                <div class="modal-body">
                    <div class="text-muted" style="font-size:0.9rem; margin-bottom:10px">${t('shareVia')}</div>
                    <div class="share-grid">
                        <a class="share-item" href="${links.whatsapp}" target="_blank" rel="noopener noreferrer">
                            <span class="share-ico" aria-hidden="true">
                                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2a10 10 0 0 0-8.7 14.9L2 22l5.3-1.3A10 10 0 1 0 12 2Z" fill="#25D366"/><path d="M16.9 13.7c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1-.1.2-.6.8-.7.9-.1.1-.3.2-.5.1-1.1-.5-2-1.2-2.7-2.2-.2-.3 0-.4.1-.5.1-.1.3-.3.4-.4.1-.1.1-.2.2-.3.1-.1.1-.3 0-.4-.1-.1-.5-1.2-.7-1.6-.2-.4-.3-.3-.5-.3h-.4c-.1 0-.3 0-.4.2-.2.2-.6.6-.6 1.4 0 .8.6 1.6.7 1.7.1.1 1.2 1.9 2.9 2.7 1.1.5 1.5.5 2 .4.3 0 1-.4 1.1-.8.1-.4.1-.7.1-.8 0-.1-.2-.2-.4-.3Z" fill="#fff"/></svg>
                            </span>
                            <span class="share-lbl">WhatsApp</span>
                        </a>
                        <a class="share-item" href="${links.telegram}" target="_blank" rel="noopener noreferrer">
                            <span class="share-ico" aria-hidden="true">
                                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z" fill="#2AABEE"/><path d="M17.7 7.3c.2-.1.4.1.3.4l-1.7 9.1c-.1.5-.5.6-.9.4l-2.6-1.9-1.2 1.2c-.1.1-.2.2-.4.2l.2-3 5.4-4.9c.2-.2 0-.3-.3-.2l-6.6 4.2-2.8-.9c-.5-.2-.5-.5.1-.7l10.5-3.9Z" fill="#fff"/></svg>
                            </span>
                            <span class="share-lbl">Telegram</span>
                        </a>
                        <a class="share-item" href="${links.facebook}" target="_blank" rel="noopener noreferrer">
                            <span class="share-ico" aria-hidden="true">
                                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z" fill="#1877F2"/><path d="M13.3 19v-6.1h2l.3-2.3h-2.3V9.1c0-.7.2-1.1 1.2-1.1h1.2V5.9c-.2 0-1-.1-2-.1-2 0-3.3 1.2-3.3 3.4v1.9H8.4v2.3h1.9V19h3Z" fill="#fff"/></svg>
                            </span>
                            <span class="share-lbl">Facebook</span>
                        </a>
                        <a class="share-item" href="${links.x}" target="_blank" rel="noopener noreferrer">
                            <span class="share-ico" aria-hidden="true">
                                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z" fill="#111827"/><path d="M15.9 7.2h-1.5l-2.1 2.4-1.6-2.4H8.1l3 4.4-3.1 3.6h1.5l2.3-2.7 1.8 2.7h2.6l-3.2-4.7 2.9-3.3Z" fill="#fff"/></svg>
                            </span>
                            <span class="share-lbl">X</span>
                        </a>
                        <a class="share-item" href="${links.email}" target="_blank" rel="noopener noreferrer">
                            <span class="share-ico" aria-hidden="true">
                                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z" fill="#6B7280"/><path d="M7.5 8.5h9c.6 0 1 .4 1 1v5c0 .6-.4 1-1 1h-9c-.6 0-1-.4-1-1v-5c0-.6.4-1 1-1Z" fill="#fff"/><path d="m8 9 4 3 4-3" stroke="#6B7280" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
                            </span>
                            <span class="share-lbl">Email</span>
                        </a>
                    </div>
                    <div class="share-link-box">
                        <input readonly value="${shareUrl}" class="form-input" onclick="this.select()">
                        <button class="btn btn-primary btn-sm" onclick="window.copyToClipboard('${shareUrl.replace(/'/g, "\\'")}')">${t('copyLink')}</button>
                    </div>
                    <div class="mt-4">
                        <button class="btn btn-outline" onclick="(navigator.share ? navigator.share({ title: 'PulseVote', text: '${text.replace(/'/g, "\\'")}', url: '${shareUrl.replace(/'/g, "\\'")}' }).catch(()=>{}) : window.open('${shareUrl.replace(/'/g, "\\'")}', '_blank'))">${t('share')}</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    host.classList.remove('hidden');
};

function displayOption(poll, idx) {
    if (!poll) return '';
    if (poll.type === 'yesno') return idx === 0 ? t('yes') : t('no');
    if (poll.type === 'star') return '\u2605'.repeat(idx + 1);
    return poll.opts?.[idx] ?? '';
}

function parseOptionsField(options) {
    if (Array.isArray(options)) {
        return { items: options, description: '', expiresAt: null };
    }
    if (options && typeof options === 'object') {
        const items = Array.isArray(options.items) ? options.items : (Array.isArray(options.options) ? options.options : []);
        const description = typeof options.description === 'string' ? options.description : '';
        const expiresAt = (typeof options.expires_at === 'string' && options.expires_at) ? options.expires_at : ((typeof options.expiresAt === 'string' && options.expiresAt) ? options.expiresAt : null);
        return { items, description, expiresAt };
    }
    return { items: [], description: '', expiresAt: null };
}

function isPollExpired(poll) {
    if (!poll || !poll.expiresAt) return false;
    const ts = new Date(poll.expiresAt).getTime();
    if (!Number.isFinite(ts)) return false;
    return Date.now() > ts;
}

function toDbPoll(poll) {
    return {
        question: poll.q,
        type: poll.type,
        options: {
            items: poll.opts,
            description: poll.description || '',
            expires_at: poll.expiresAt || null
        },
        votes_pre: poll.votesPre,
        votes_post: poll.votesPost
    };
}

function fromDbPoll(row) {
    const parsed = parseOptionsField(row.options);
    return {
        id: row.id,
        q: row.question,
        type: row.type,
        opts: parsed.items,
        description: parsed.description,
        expiresAt: parsed.expiresAt,
        votesPre: row.votes_pre,
        votesPost: row.votes_post
    };
}

function getShareBaseUrl() {
    return window.location.href.split('?')[0];
}

function parsePollId(input) {
    const raw = (input || '').trim();
    if (!raw) return '';
    try {
        if (raw.includes('://')) {
            const u = new URL(raw);
            return u.searchParams.get('id') || '';
        }
    } catch (_) {}
    try {
        if (raw.includes('?id=')) {
            const u = new URL(raw, window.location.origin);
            return u.searchParams.get('id') || '';
        }
    } catch (_) {}
    return raw;
}

// --- Language ---
window.setLang = (lang) => {
    STATE.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    getEl('lang-toggle').textContent = lang === 'en' ? 'عربي' : 'English';
    localStorage.setItem('pv_lang', lang);
    if (STATE.screen === 'home') window.renderHome();
    else if (STATE.screen === 'pulsevote') window.renderPulseVoteHome();
    else if (STATE.screen === 'create') window.renderCreate();
    else if (STATE.screen === 'vote' && STATE.poll) window.renderVote(STATE.poll);
    else if (STATE.screen === 'thanks' && STATE.poll) window.renderThanks(STATE.poll);
    else if (STATE.screen === 'results' && STATE.poll) window.renderResults(STATE.poll);
    else window.renderHome();
};

window.toggleLang = () => window.setLang(STATE.lang === 'en' ? 'ar' : 'en');

// --- Personal Home Page ---
window.renderHome = () => {
    STATE.screen = 'home';
    STATE.poll = null;
    const container = getEl('app-container');
    if (!container) return;
    const lang = STATE.lang;
    const isAr = lang === 'ar';
    container.innerHTML = `
        <div class="card hero">
            <div class="hero-avatar">A</div>
            <h1>${isAr ? 'عبداللطيف الغشيمي' : 'Abdulatef Al Ghushaimi'}</h1>
            <p class="title">${t('heroSub')}</p>
            <div class="hero-links">
                <a href="https://github.com/abdoalltuf77" target="_blank" rel="noopener">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>
                    GitHub
                </a>
                <a href="mailto:abdoalltuf77@gmail.com">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    Email
                </a>
            </div>
        </div>

        <div class="card">
            <h2 class="section-title">👤 ${t('aboutMe')}</h2>
            <p style="font-size:0.95rem; line-height:1.7; color:var(--text-muted)">
                ${isAr
                    ? 'مطور ويب مهتم ببناء تطبيقات تفاعلية باستخدام HTML، CSS، JavaScript، و Supabase. أسعى دائماً لتطوير مهاراتي وتقديم حلول تقنية مبتكرة.'
                    : 'Web Developer passionate about building interactive applications using HTML, CSS, JavaScript, and Supabase. Always striving to develop my skills and deliver innovative technical solutions.'
                }
            </p>
        </div>

        <div class="card">
            <h2 class="section-title">🛠️ ${t('skills')}</h2>
            <div class="skills-grid">
                <span class="skill-badge">HTML5</span>
                <span class="skill-badge">CSS3</span>
                <span class="skill-badge">JavaScript</span>
                <span class="skill-badge">Supabase</span>
                <span class="skill-badge">Git & GitHub</span>
                <span class="skill-badge">PWA</span>
                <span class="skill-badge">REST API</span>
                <span class="skill-badge">Responsive Design</span>
            </div>
        </div>

        <div class="card">
            <h2 class="section-title">🚀 ${t('projects')}</h2>
            <div class="project-card">
                <h3>PulseVote</h3>
                <p>${isAr ? 'تطبيق تصويت مباشر مع دعم مرحلتين، عربي/إنجليزي، وقاعدة بيانات Supabase.' : 'Real-time polling app with two-phase voting, Arabic/English support, and Supabase backend.'}</p>
                <div class="flex gap-2">
                    <button onclick="window.renderPulseVoteHome()" class="btn btn-primary btn-sm">${t('viewProject')}</button>
                    <a href="https://github.com/abdoalltuf77/PulseVote" target="_blank" rel="noopener" class="btn btn-outline btn-sm">${t('viewOnGitHub')}</a>
                </div>
            </div>
        </div>

        <div class="text-center text-muted" style="font-size:0.8rem; padding-bottom:20px">
            © ${new Date().getFullYear()} Abdulatef Al Ghushaimi
        </div>
    `;
};

// --- PulseVote Home (Old Home) ---
window.renderPulseVoteHome = () => {
    STATE.screen = 'pulsevote';
    const container = getEl('app-container');
    if(!container) return;
    container.innerHTML = `
        <div class="card text-center">
            <div class="flex justify-between mb-4">
                <button onclick="window.renderHome()" class="btn btn-sm btn-outline">← ${t('about')}</button>
                <div></div>
            </div>
            <h1 class="mb-4" dir="ltr">PulseVote</h1>
            <p class="mb-4 text-muted">${t('tagline')}</p>
            <button onclick="window.renderCreate()" class="btn btn-primary mb-4">${t('create')}</button>
            
            <div class="p-4" style="background:white; border-radius:8px; border:1px solid var(--border)">
                <button onclick="window.toggleJoin()" class="btn btn-outline btn-sm">${t('haveCode')}</button>
                <div id="join-box" class="hidden" style="margin-top:12px">
                    <div class="flex gap-2">
                        <input type="text" id="poll-id-input" class="form-input" placeholder="${t('linkPlaceholder')}">
                        <button onclick="window.joinPoll()" class="btn btn-primary btn-sm">${t('go')}</button>
                    </div>
                </div>
            </div>
        </div>
    `;
};

window.toggleJoin = () => {
    const box = getEl('join-box');
    if (!box) return;
    box.classList.toggle('hidden');
};

// --- Create / Vote / Thanks / Results ---
window.renderCreate = () => {
    STATE.screen = 'create';
    const container = getEl('app-container');
    container.innerHTML = `
        <div class="card">
            <button onclick="window.renderPulseVoteHome()" class="btn btn-outline btn-sm mb-4">← ${t('home')}</button>
            <h2 class="mb-4">${t('create')}</h2>
            
            <div class="form-group">
                <label class="form-label">${t('q')}</label>
                <input type="text" id="q-text" class="form-input" placeholder="...">
            </div>

            <div class="form-group">
                <label class="form-label">${t('desc')}</label>
                <textarea id="q-desc" class="form-input" rows="3" placeholder="..."></textarea>
            </div>

            <div class="form-group">
                <label class="form-label">${t('expiresDays')} <span class="text-muted" style="font-weight:400">(${t('expiresHint')})</span></label>
                <input type="number" id="q-exp-days" class="form-input" min="0" value="0">
            </div>

            <div class="form-group">
                <label class="form-label">${t('type')}</label>
                <select id="q-type" class="form-select" onchange="window.toggleOptInput()">
                    <option value="yesno">${t('yesno')}</option>
                    <option value="choice">${t('choice')}</option>
                    <option value="emoji">${t('emoji')}</option>
                    <option value="star">${t('star')}</option>
                </select>
            </div>

            <div id="opt-container" class="form-group hidden">
                <label class="form-label">${t('add')}</label>
                <div id="opt-list"></div>
                <button onclick="window.addOptField()" class="btn btn-outline btn-sm mt-2">+</button>
            </div>

            <button onclick="window.createPoll()" class="btn btn-primary mt-4" id="create-btn">${t('createBtn')}</button>
        </div>
    `;
};

window.toggleOptInput = () => {
    const type = getEl('q-type').value;
    const cont = getEl('opt-container');
    if (!cont) return;
    if (['choice', 'emoji'].includes(type)) {
        cont.classList.remove('hidden');
        if(getEl('opt-list').children.length === 0) {
            window.addOptField();
            window.addOptField();
        }
    } else {
        cont.classList.add('hidden');
    }
};

window.addOptField = () => {
    const list = getEl('opt-list');
    const div = document.createElement('div');
    div.className = 'flex gap-2 mb-2';
    div.innerHTML = `<input type="text" class="form-input opt-inp" placeholder="${t('optionPlaceholder')}"><button onclick="this.parentElement.remove()" class="btn btn-outline btn-sm text-danger">×</button>`;
    list.appendChild(div);
};

window.createPoll = async () => {
    if (!supabaseClient) return showToast('Supabase not ready');
    showLoading(true);
    const q = getEl('q-text').value;
    const description = (getEl('q-desc')?.value || '').trim();
    const expDaysRaw = (getEl('q-exp-days')?.value || '0').trim();
    const expiresDays = Number(expDaysRaw);
    const type = getEl('q-type').value;
    if(!q) { showLoading(false); return showToast(t('questionRequired')); }

    const expiresAt = (Number.isFinite(expiresDays) && expiresDays > 0)
        ? new Date(Date.now() + expiresDays * 86400000).toISOString()
        : null;

    let opts = [];
    if(type === 'yesno') opts = ['Yes', 'No'];
    else if(type === 'star') opts = ['1','2','3','4','5'];
    else {
        document.querySelectorAll('.opt-inp').forEach(i => { if(i.value) opts.push(i.value); });
        if(opts.length < 2) { showLoading(false); return showToast(t('addAtLeast2')); }
    }

    const poll = { q, type, opts, description, expiresAt, votesPre: opts.map(()=>0), votesPost: opts.map(()=>0) };

    const { data, error } = await supabaseClient
        .from('polls')
        .insert([toDbPoll(poll)])
        .select('*')
        .single();

    showLoading(false);
    if (error) return showToast(error.message);

    const created = fromDbPoll(data);
    STATE.poll = created;
    const url = getShareBaseUrl() + '?id=' + created.id;

    getEl('app-container').innerHTML = `
        <div class="card text-center">
            <button onclick="window.renderPulseVoteHome()" class="btn btn-outline btn-sm mb-4">← ${t('home')}</button>
            <h2 style="color:var(--success)">${t('ready')}</h2>
            <p class="mb-2">${t('shareThisLink')}</p>
            <input readonly value="${url}" class="form-input mb-4 text-center" onclick="this.select()">
            <button onclick="window.copyToClipboard('${url}')" class="btn btn-primary mb-4">${t('copy')}</button>
            <div class="flex gap-2">
                <button onclick="window.loadPoll('${created.id}')" class="btn btn-outline">${t('viewRes')}</button>
                <button onclick="window.renderHome()" class="btn btn-outline">${t('about')}</button>
            </div>
        </div>
    `;
};

window.joinPoll = () => {
    const raw = getEl('poll-id-input').value;
    const id = parsePollId(raw);
    if(id) window.history.replaceState(null, null, '?id=' + id);
    window.loadPoll(id);
};

window.loadPoll = async (id) => {
    if (!supabaseClient) return showToast('Supabase not ready');
    showLoading(true);
    const { data, error } = await supabaseClient
        .from('polls')
        .select('*')
        .eq('id', id)
        .single();

    showLoading(false);
    if (error || !data) return showToast(t('pollNotFound'));

    const poll = fromDbPoll(data);
    STATE.poll = poll;
    STATE.phase = new URLSearchParams(window.location.search).get('phase') || 'pre';
    const voted = localStorage.getItem(`pv_v_${poll.id}_${STATE.phase}`);

    if (isPollExpired(poll)) {
        showToast(t('pollExpired'));
        return window.renderResults(poll);
    }

    if(voted) window.renderResults(poll);
    else window.renderVote(poll);
};

window.renderVote = (poll) => {
    STATE.screen = 'vote';
    if (isPollExpired(poll)) {
        getEl('app-container').innerHTML = `
            <div class="card text-center">
                <button onclick="window.renderPulseVoteHome()" class="btn btn-outline btn-sm mb-4">← ${t('home')}</button>
                <h2 class="mb-2">${poll.q}</h2>
                ${poll.description ? `<p class="text-muted mb-4" style="white-space:pre-wrap">${poll.description}</p>` : `<div class="mb-4"></div>`}
                <div class="mb-4" style="font-weight:800; color: var(--danger)">${t('expired')}</div>
                <button onclick="window.renderResults(STATE.poll)" class="btn btn-primary">${t('viewRes')}</button>
            </div>
        `;
        return;
    }
    const phaseLabel = STATE.phase === 'pre' ? t('before') : t('after');
    const phaseClass = STATE.phase === 'pre' ? 'pre' : 'post';

    let html = '';
    if(poll.type === 'yesno') {
        html = `<div class="flex gap-2"><button onclick="window.submit('${poll.id}',0)" class="btn btn-outline">${t('yes')}</button><button onclick="window.submit('${poll.id}',1)" class="btn btn-outline">${t('no')}</button></div>`;
    } else if(poll.type === 'choice') {
        html = `<div class="poll-options">`;
        poll.opts.forEach((o,i) => html += `<button onclick="window.submit('${poll.id}',${i})" class="btn btn-outline">${o}</button>`);
        html += `</div>`;
    } else if(poll.type === 'emoji') {
        html = `<div class="emoji-grid">`;
        poll.opts.forEach((o,i) => html += `<button onclick="window.submit('${poll.id}',${i})" class="emoji-btn">${o}</button>`);
        html += `</div>`;
    } else if(poll.type === 'star') {
        html = `<div class="star-rating">`;
        for(let i=0; i<5; i++) html += `<label data-idx="${i}" onclick="window.submit('${poll.id}',${i})">&#9733;</label>`;
        html += `</div>`;
    }

    getEl('app-container').innerHTML = `
        <div class="card text-center">
            <button onclick="window.renderPulseVoteHome()" class="btn btn-outline btn-sm mb-4">← ${t('home')}</button>
            <div class="phase-badge ${phaseClass}">${phaseLabel}</div>
            <h2 class="mb-4">${poll.q}</h2>
            ${poll.description ? `<p class="text-muted mb-4" style="white-space:pre-wrap">${poll.description}</p>` : ''}
            <div class="mb-4">${html}</div>
        </div>
    `;
};

window.submit = async (pid, idx) => {
    if (!supabaseClient) return showToast('Supabase not ready');
    showLoading(true);
    const poll = STATE.poll && STATE.poll.id === pid ? STATE.poll : null;
    if (!poll) { showLoading(false); return showToast(t('pollNotFound')); }
    if (isPollExpired(poll)) { showLoading(false); return showToast(t('pollExpired')); }
    const key = `pv_v_${pid}_${STATE.phase}`;
    
    if(STATE.phase === 'pre') poll.votesPre[idx]++;
    else poll.votesPost[idx]++;

    const payload = toDbPoll(poll);
    const { error } = await supabaseClient
        .from('polls')
        .update({ votes_pre: payload.votes_pre, votes_post: payload.votes_post })
        .eq('id', pid);

    showLoading(false);
    if (error) return showToast(error.message);

    localStorage.setItem(key, '1');
    
    window.renderThanks(STATE.poll);
};

window.renderThanks = (poll) => {
    STATE.screen = 'thanks';
    const isPre = STATE.phase === 'pre';
    getEl('app-container').innerHTML = `
        <div class="card text-center">
            <h1 class="mb-2">🎉 ${t('thanks')}</h1>
            <p class="text-muted mb-4">${isPre
                ? (STATE.lang === 'ar' ? 'تم تسجيل تصويتك في المرحلة الأولى' : 'Your Phase 1 vote has been recorded')
                : (STATE.lang === 'ar' ? 'تم تسجيل تصويتك في المرحلة الثانية' : 'Your Phase 2 vote has been recorded')}
            </p>
            <div class="flex gap-2">
                <button onclick="window.renderResults(STATE.poll)" class="btn btn-primary btn-sm">${t('viewRes')}</button>
                ${isPre ? `<button onclick="window.votePhase2()" class="btn btn-success btn-sm">${t('voteAgain')}</button>` : ''}
            </div>
        </div>
    `;
};

window.votePhase2 = () => {
    STATE.phase = 'post';
    const poll = STATE.poll;
    const voted = localStorage.getItem(`pv_v_${poll.id}_post`);
    if (voted) {
        window.renderResults(poll);
    } else {
        window.history.replaceState(null, null, '?id=' + poll.id + '&phase=post');
        window.renderVote(poll);
    }
};

window.renderResults = (poll) => {
    STATE.screen = 'results';
    const expired = isPollExpired(poll);
    const totalPre = poll.votesPre.reduce((a,b)=>a+b,0);
    const totalPost = poll.votesPost.reduce((a,b)=>a+b,0);
    const max = Math.max(...poll.votesPre, ...poll.votesPost, 1);

    let bars = poll.opts.map((o, i) => {
        const label = displayOption(poll, i);
        const wPre = (poll.votesPre[i]/max)*100;
        const wPost = (poll.votesPost[i]/max)*100;
        return `
            <div class="result-bar-container">
                <div class="result-label"><span>${label}</span> <span>${poll.votesPre[i]} / ${poll.votesPost[i]}</span></div>
                <div class="result-track">
                    <div class="result-fill" style="width:${wPre}%"></div>
                    <div class="result-fill after" style="width:${wPost}%"></div>
                </div>
                <div class="flex gap-2 mt-2" style="font-size:0.75rem">
                    <span style="color:var(--primary)">● ${t('before')} (${poll.votesPre[i]})</span>
                    <span style="color:var(--success)">● ${t('after')} (${poll.votesPost[i]})</span>
                </div>
            </div>
        `;
    }).join('');

    getEl('app-container').innerHTML = `
        <div class="card">
            <div class="flex justify-between mb-4">
                <button onclick="window.renderPulseVoteHome()" class="btn btn-sm btn-outline">← ${t('home')}</button>
                <div class="flex gap-2">
                    <button onclick="window.exportToCSV(STATE.poll)" class="btn btn-sm btn-outline" title="${t('exportCSV')}">📊 ${t('export')}</button>
                    <button onclick="window.openShareModal(window.location.href)" class="btn btn-sm btn-outline">🔗 ${t('share')}</button>
                </div>
            </div>
            <h2 class="text-center mb-2">${poll.q}</h2>
            ${poll.description ? `<p class="text-center text-muted mb-4" style="white-space:pre-wrap">${poll.description}</p>` : ''}
            ${expired ? `<div class="text-center mb-4" style="font-weight:800; color: var(--danger)">${t('expired')}</div>` : ''}
            ${bars}
            <div class="flex gap-2 mt-4">
                <button onclick="window.votePhase2()" class="btn btn-success btn-sm">${t('voteAgain')}</button>
                <button onclick="window.renderHome()" class="btn btn-outline btn-sm">${t('about')}</button>
            </div>
        </div>
    `;
};

// --- Initialization ---
window.addEventListener('DOMContentLoaded', () => {
    try {
        window.setLang(STATE.lang);

        if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
            navigator.serviceWorker.register('./sw.js');
        }

        const params = new URLSearchParams(window.location.search);
        if(params.get('id')) window.loadPoll(params.get('id'));
        else window.renderHome();
    } catch(e) {
        console.error(e);
        getEl('error-box').style.display = 'block';
        getEl('error-box').innerText = "Init Error: " + e.message;
    }
});
