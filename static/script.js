// Global state
let currentUser = null;
let currentTheme = 'light';
let notes = [];
let currentNote = null;
let pageHistory = [];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    loadNotes();
    setupAutoSave();
    setupEditorStats();
    showPage('home');
    bindNavigation();
    setupBackButtonHandler();
});

// --- Back Button Handler ---
function setupBackButtonHandler() {
    // Push initial state
    history.pushState({page: 'home'}, '', '#home');
    
    // Handle back/forward navigation
    window.addEventListener('popstate', (event) => {
        if (event.state && event.state.page) {
            showPage(event.state.page, false);
        }
    });
}

// --- Theme Toggle ---
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    const toggleIcon = document.querySelector('.theme-toggle');
    if (toggleIcon) toggleIcon.textContent = currentTheme === 'light' ? '🌙' : '☀️';
    try { localStorage.setItem('theme', currentTheme); } catch {}
}

function loadTheme() {
    try {
        const saved = localStorage.getItem('theme');
        if (saved) {
            currentTheme = saved;
            document.documentElement.setAttribute('data-theme', currentTheme);
            const toggleIcon = document.querySelector('.theme-toggle');
            if (toggleIcon) toggleIcon.textContent = currentTheme === 'light' ? '🌙' : '☀️';
        }
    } catch {}
}

// --- Page Display with History Management ---
function showPage(id, addToHistory = true) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) {
        target.classList.add('active');
        
        // Add to browser history
        if (addToHistory) {
            history.pushState({page: id}, '', `#${id}`);
        }
    }
    const header = document.querySelector('header');
    if (header) header.style.display = id === 'dashboard' ? 'none' : 'block';
}

// --- Navigation binding ---
function bindNavigation() {
    document.querySelectorAll('[data-page]').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            showPage(link.getAttribute('data-page'));
        });
    });
}

// --- Mobile Menu ---
function toggleMobileMenu() {
    const nav = document.querySelector('.nav-links');
    if (nav) nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
}

// --- Text Formatting ---
function formatText(fmt) {
    const area = document.getElementById('noteEditor');
    const start = area.selectionStart;
    const end = area.selectionEnd;
    const text = area.value;
    const sel = text.substring(start, end);

    const fmtMap = {
        bold: `**${sel}**`,
        italic: `*${sel}*`,
        h1: `# ${sel}`,
        h2: `## ${sel}`
    };

    area.value = text.slice(0, start) + (fmtMap[fmt] || sel) + text.slice(end);
    area.focus();
}

function clearEditor() {
    if (confirm('Are you sure you want to clear the editor?')) {
        document.getElementById('noteEditor').value = '';
        updateEditorStats();
    }
}

function exportNote() {
    const content = document.getElementById('noteEditor').value;
    if (!content.trim()) {
        alert('Nothing to export! Please write something first.');
        return;
    }
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `note_${new Date().toISOString().slice(0,10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

// --- Editor Stats ---
function setupEditorStats() {
    const editor = document.getElementById('noteEditor');
    if (editor) {
        editor.addEventListener('input', updateEditorStats);
        updateEditorStats();
    }
}

function updateEditorStats() {
    const editor = document.getElementById('noteEditor');
    if (!editor) return;
    
    const text = editor.value;
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\\s+/).length : 0;
    const lines = text.split('\\n').length;
    
    const charCount = document.getElementById('charCount');
    const wordCount = document.getElementById('wordCount');
    const lineCount = document.getElementById('lineCount');
    
    if (charCount) charCount.textContent = `${chars} characters`;
    if (wordCount) wordCount.textContent = `${words} words`;
    if (lineCount) lineCount.textContent = `${lines} lines`;
}

// --- Copy to Clipboard ---
function copyToClipboard() {
    const editor = document.getElementById('noteEditor');
    if (!editor || !editor.value.trim()) {
        alert('Nothing to copy!');
        return;
    }
    
    navigator.clipboard.writeText(editor.value).then(() => {
        alert('✅ Copied to clipboard!');
    }).catch(() => {
        // Fallback for older browsers
        editor.select();
        document.execCommand('copy');
        alert('✅ Copied to clipboard!');
    });
}

// --- Share Note Functionality ---
async function shareNote() {
    const noteContent = document.getElementById('noteEditor').value;
    
    if (!noteContent.trim()) {
        alert('⚠️ Please write something before sharing!');
        return;
    }
    
    // Get expiry minutes (handle both preset and custom)
    const expiryMinutes = getExpiryMinutes();
    if (expiryMinutes === null) {
        alert('⚠️ Please enter a valid custom time.');
        return;
    }
    
    const oneTimeView = document.getElementById('oneTimeView').checked ? 1 : 0;
    
    const shareBtn = document.getElementById('shareBtn');
    shareBtn.classList.add('loading');
    shareBtn.disabled = true;
    
    try {
        const formData = new FormData();
        formData.append('note', noteContent);
        formData.append('expiry', expiryMinutes);
        formData.append('one_time', oneTimeView);
        
        const response = await fetch('/create_note', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
            },
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Failed to create note');
        }
        
        const data = await response.json();
        
        if (data.success && data.link) {
            displayShareResult(data.link, expiryMinutes, oneTimeView);
        } else {
            throw new Error('Invalid response from server');
        }
        
    } catch (error) {
        console.error('Error sharing note:', error);
        alert('❌ Failed to create shareable link. Please try again.');
    } finally {
        shareBtn.classList.remove('loading');
        shareBtn.disabled = false;
    }
}

// Get expiry minutes from either preset or custom input
function getExpiryMinutes() {
    const expirySelect = document.getElementById('expiryTime');
    const selectedValue = expirySelect.value;
    
    if (selectedValue === 'custom') {
        const customValue = parseInt(document.getElementById('customTimeValue').value);
        const customUnit = document.getElementById('customTimeUnit').value;
        
        if (!customValue || customValue < 1) {
            return null;
        }
        
        // Convert to minutes
        let minutes = customValue;
        if (customUnit === 'hours') {
            minutes = customValue * 60;
        } else if (customUnit === 'days') {
            minutes = customValue * 1440;
        }
        
        return minutes;
    }
    
    return parseInt(selectedValue);
}

// Handle expiry time change
function handleExpiryChange() {
    const expirySelect = document.getElementById('expiryTime');
    const customTimeInput = document.getElementById('customTimeInput');
    
    if (expirySelect.value === 'custom') {
        customTimeInput.style.display = 'block';
        // Animate in
        customTimeInput.style.animation = 'slideDown 0.3s ease-out';
    } else {
        customTimeInput.style.display = 'none';
    }
}

// Handle one-time view checkbox change
function handleOneTimeViewChange() {
    const checkbox = document.getElementById('oneTimeView');
    const optionGroup = checkbox.closest('.option-group');
    
    if (checkbox.checked) {
        optionGroup.style.borderColor = 'var(--primary-color)';
        optionGroup.style.background = 'rgba(99, 102, 241, 0.05)';
    } else {
        optionGroup.style.borderColor = 'var(--border-color)';
        optionGroup.style.background = 'var(--bg-card)';
    }
}

function displayShareResult(link, expiryMinutes, oneTimeView) {
    const resultDiv = document.getElementById('shareLinkResult');
    const shareLinkInput = document.getElementById('shareLink');
    const expiryInfo = document.getElementById('expiryInfo');
    const oneTimeInfo = document.getElementById('oneTimeInfo');
    
    shareLinkInput.value = link;
    
    // Calculate expiry time
    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + expiryMinutes);
    expiryInfo.textContent = formatExpiryTime(expiryMinutes, expiryDate);
    
    // Show/hide one-time view info
    if (oneTimeView) {
        oneTimeInfo.style.display = 'block';
    } else {
        oneTimeInfo.style.display = 'none';
    }
    
    resultDiv.style.display = 'block';
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function formatExpiryTime(minutes, date) {
    const options = { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
    };
    
    let timeText = '';
    if (minutes < 60) {
        timeText = `in ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else if (minutes < 1440) {
        const hours = Math.floor(minutes / 60);
        const remainingMins = minutes % 60;
        if (remainingMins > 0) {
            timeText = `in ${hours} hour${hours !== 1 ? 's' : ''} and ${remainingMins} minute${remainingMins !== 1 ? 's' : ''}`;
        } else {
            timeText = `in ${hours} hour${hours !== 1 ? 's' : ''}`;
        }
    } else {
        const days = Math.floor(minutes / 1440);
        const remainingHours = Math.floor((minutes % 1440) / 60);
        if (remainingHours > 0) {
            timeText = `in ${days} day${days !== 1 ? 's' : ''} and ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`;
        } else {
            timeText = `in ${days} day${days !== 1 ? 's' : ''}`;
        }
    }
    
    return `${timeText} (${date.toLocaleString('en-US', options)})`;
}

function copyShareLink() {
    const shareLinkInput = document.getElementById('shareLink');
    const copyBtn = document.getElementById('copyBtnText');
    
    shareLinkInput.select();
    shareLinkInput.setSelectionRange(0, 99999); // For mobile devices
    
    navigator.clipboard.writeText(shareLinkInput.value).then(() => {
        copyBtn.textContent = '✅ Copied!';
        copyBtn.parentElement.classList.add('copied');
        
        setTimeout(() => {
            copyBtn.textContent = '📋 Copy';
            copyBtn.parentElement.classList.remove('copied');
        }, 2000);
    }).catch(() => {
        document.execCommand('copy');
        copyBtn.textContent = '✅ Copied!';
        setTimeout(() => {
            copyBtn.textContent = '📋 Copy';
        }, 2000);
    });
}

function openShareLink() {
    const link = document.getElementById('shareLink').value;
    window.open(link, '_blank');
}

function resetEditor() {
    if (confirm('Create a new note? Current content will be cleared.')) {
        document.getElementById('noteEditor').value = '';
        document.getElementById('shareLinkResult').style.display = 'none';
        document.getElementById('expiryTime').value = '30';
        document.getElementById('oneTimeView').checked = false;
        
        // Reset custom time inputs
        document.getElementById('customTimeValue').value = '1';
        document.getElementById('customTimeUnit').value = 'minutes';
        document.getElementById('customTimeInput').style.display = 'none';
        
        // Reset one-time view styling
        const optionGroup = document.getElementById('oneTimeView').closest('.option-group');
        if (optionGroup) {
            optionGroup.style.borderColor = 'var(--border-color)';
            optionGroup.style.background = 'var(--bg-card)';
        }
        
        updateEditorStats();
        document.getElementById('noteEditor').focus();
    }
}

function clearEditor() {
    document.getElementById('noteEditor').value = '';
}

// --- Auth ---
document.getElementById('loginForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const pwd = document.getElementById('password').value;

    if (!email || !pwd) return alert('Fill all fields');
    if (pwd.length < 6) return alert('Password must be at least 6 chars');

    currentUser = { email, name: email.split('@')[0] };
    showPage('dashboard');
    updateUserDisplay();
    loadUserNotes();
});

document.getElementById('registerForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const pwd = document.getElementById('regPassword').value;
    const confirm = document.getElementById('confirmPassword').value;

    if (!name || !email || !pwd || !confirm) return alert('Fill all fields');
    if (pwd !== confirm) return alert('Passwords do not match');
    if (pwd.length < 6) return alert('Password must be at least 6 chars');

    currentUser = { email, name };
    showPage('dashboard');
    updateUserDisplay();
    loadUserNotes();
});

function logout() {
    currentUser = null;
    notes = [];
    currentNote = null;
    showPage('home');
}

function updateUserDisplay() {
    document.querySelectorAll('.user-name').forEach(el => el.textContent = currentUser?.name || '');
}

// --- Notes Management ---
function loadNotes() {
    try {
        const saved = localStorage.getItem('notes');
        notes = saved ? JSON.parse(saved) : [];
    } catch {
        notes = [];
    }
}

function saveNotes() {
    try {
        localStorage.setItem('notes', JSON.stringify(notes));
    } catch {}
}

function loadUserNotes() {
    if (!currentUser) return;
    const filtered = notes.filter(n => n.userId === currentUser.email);
    displayNotes(filtered);
}

function displayNotes(list) {
    const container = document.getElementById('notesList');
    if (!container) return;

    container.innerHTML = list.length === 0
        ? '<p>No notes yet. Create your first note!</p>'
        : '';

    list.forEach(note => {
        const div = document.createElement('div');
        div.className = 'note-item';
        div.innerHTML = `
            <h3>${note.title}</h3>
            <p>${note.content.slice(0, 100)}${note.content.length > 100 ? '...' : ''}</p>
            <small>Created: ${new Date(note.createdAt).toLocaleDateString()}</small>
            <div class="note-actions">
                <button onclick="editNote('${note.id}')">Edit</button>
                <button onclick="deleteNote('${note.id}')" class="danger">Delete</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function createNote() {
    const title = prompt('Enter note title:');
    if (!title) return;

    const note = {
        id: generateId(),
        title,
        content: '',
        userId: currentUser.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    notes.push(note);
    saveNotes();
    loadUserNotes();
    editNote(note.id);
}

function editNote(id) {
    const note = notes.find(n => n.id === id);
    if (!note) return;

    currentNote = note;
    document.getElementById('noteEditor').value = note.content;
    document.getElementById('noteTitle').value = note.title;
    showPage('editor');
}

function saveNote() {
    if (!currentNote) return;
    const title = document.getElementById('noteTitle').value;
    const content = document.getElementById('noteEditor').value;

    if (!title.trim()) return alert('Title required');

    currentNote.title = title;
    currentNote.content = content;
    currentNote.updatedAt = new Date().toISOString();

    const idx = notes.findIndex(n => n.id === currentNote.id);
    if (idx >= 0) notes[idx] = currentNote;
    else notes.push(currentNote);

    saveNotes();
    alert('Saved!');
    showPage('dashboard');
    loadUserNotes();
}

function deleteNote(id) {
    if (!confirm('Delete this note?')) return;
    notes = notes.filter(n => n.id !== id);
    saveNotes();
    loadUserNotes();
}

function newNote() {
    currentNote = {
        id: generateId(),
        title: '',
        content: '',
        userId: currentUser.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    document.getElementById('noteEditor').value = '';
    document.getElementById('noteTitle').value = '';
    showPage('editor');
}

// --- Search ---
function searchNotes() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    if (!currentUser) return;

    const filtered = notes.filter(note =>
        note.userId === currentUser.email &&
        (note.title.toLowerCase().includes(searchTerm) ||
        note.content.toLowerCase().includes(searchTerm))
    );

    displayNotes(filtered);
}

// --- Auto-Save ---
let autoSaveTimer;
function setupAutoSave() {
    const editor = document.getElementById('noteEditor');
    const title = document.getElementById('noteTitle');
    if (!editor || !title) return;

    [editor, title].forEach(el => {
        el.addEventListener('input', () => {
            clearTimeout(autoSaveTimer);
            autoSaveTimer = setTimeout(autoSaveNote, 2000);
        });
    });
}

function autoSaveNote() {
    if (!currentNote) return;
    const title = document.getElementById('noteTitle').value;
    const content = document.getElementById('noteEditor').value;

    if (!title.trim()) return;

    const idx = notes.findIndex(n => n.id === currentNote.id);
    currentNote.title = title;
    currentNote.content = content;
    currentNote.updatedAt = new Date().toISOString();

    if (idx === -1) notes.push(currentNote);
    else notes[idx] = currentNote;

    saveNotes();

    const msg = document.getElementById('autoSaveIndicator');
    if (msg) {
        msg.textContent = 'Auto-saved';
        msg.style.opacity = '1';
        setTimeout(() => (msg.style.opacity = '0'), 2000);
    }
}

// --- Shortcuts ---
document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (currentNote) saveNote();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        if (currentUser) newNote();
    }
    if (e.key === 'Escape' && document.getElementById('editor')?.classList.contains('active')) {
        showPage('dashboard');
    }
});
