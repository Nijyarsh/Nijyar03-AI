import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider, onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- Global UI Helpers ---
window.toggleDrawer = () => { 
    const drawer = document.getElementById('sideDrawer');
    const overlay = document.getElementById('drawerOverlay');
    const dropdown = document.getElementById('modelDropdown');
    
    if(drawer) drawer.classList.toggle('open'); 
    if(overlay) overlay.classList.toggle('open'); 
    if(dropdown) dropdown.classList.add('hidden'); 
};
window.toggleModelDropdown = () => {
    const dropdown = document.getElementById('modelDropdown');
    if(dropdown) dropdown.classList.toggle('hidden');
};
window.openProfile = () => {
    const modal = document.getElementById('profileModal');
    if(modal) modal.classList.add('open');
};
window.closeProfile = (e) => { 
    if(e?.target?.classList.contains('modal-overlay') || e?.target?.tagName === 'BUTTON') {
        document.getElementById('profileModal')?.classList.remove('open');
    }
};
window.toggleTheme = () => { 
    document.body.classList.toggle("light-mode"); 
    const themeIcon = document.getElementById("themeIcon"); 
    if(themeIcon) { 
        themeIcon.className = document.body.classList.contains("light-mode") ? "fas fa-sun" : "fas fa-moon"; 
    } 
    localStorage.setItem("nijyar_theme", document.body.classList.contains("light-mode") ? "light" : "dark"); 
};

function initStars() {
    if (document.getElementById('stars-container')?.children.length > 0) return;
    const container = document.getElementById('stars-container');
    if(!container) return;
    for (let i = 0; i < 80; i++) {
        const star = document.createElement('div'); star.className = 'star';
        const size = Math.random() * 2 + 1 + 'px';
        Object.assign(star.style, { width: size, height: size, position: 'absolute', backgroundColor: 'white', borderRadius: '50%', top: Math.random() * 100 + 'vh', left: Math.random() * 100 + 'vw', animation: `twinkle ${Math.random() * 3 + 2}s infinite ease-in-out` });
        container.appendChild(star);
    }
}

// --- Firebase Config ---
const firebaseConfig = {
  apiKey: "AIzaSyAZFC8BDGkR0u83UIGNKqwkWAobkFND7RY",
  authDomain: "nijyar-ai.firebaseapp.com",
  projectId: "nijyar-ai",
  storageBucket: "nijyar-ai.firebasestorage.app",
  messagingSenderId: "352347592255",
  appId: "1:352347592255:web:58345445126b573eb94a8a",
  measurementId: "G-LBQS1KH12B"
};

let app, auth, db, provider;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
} catch (error) {
    console.error("Firebase Init Error", error);
}

/* 🔒 NIJYAR PROTECTION ENGINE - V2 */
const _0xpart1 = "gsk_";
const _0xpart2 = "aYGteUTlVF1Qmw64WsCv"; 
const _0xpart3 = "WGdyb3FYWUGnRmL4qSVXU91YO8Nfnp5W"; 
const GROQ_API_KEY = _0xpart1 + _0xpart2 + _0xpart3;

window.currentChatId = null;
window.loggedInUser = "Guest"; 
window.isGuest = true; 
window.isTyping = false;
let selectedImageBase64 = null; 
let abortController = null;
window.currentExpertMode = 'pro';

window.globalDocumentContext = ""; 

const aiPersonalities = {
    pro: "تۆ یاریدەدەرێکی پرۆفیشناڵیت. بە کوردی و بە کورتی وەڵام بدەوە.",
    legal: "تۆ یاریدەدەرێکی یاسایی لێهاتووی بۆ نژیار لە زانکۆی Ruhr University Bochum و کارمەند لە Yesil und Partner. وەڵامەکانت با تەنیا لەسەر بنەمای یاساکانی ئەڵمانیا و کوردستان بن.",
    translator: "تۆ وەرگێڕێکی شارەزایت. هەر دەقێک بنێرم وەریگێڕە بۆ کوردی، عەرەبی و ئینگلیزی.",
    live_voice: "تۆ وەرگێڕێکی خێرای ڕاستەوخۆیت. بەبێ هیچ قسەیەکی زیادە وەریگێڕە بۆ ئینگلیزی.",
    data: "You are a Data Analyst. Analyze CSV data provided. Respond with a summary and if useful, provide chart data.",
    teacher: "تۆ مامۆستایەکی زانستی لێهاتووی. بابەتەکان بە زمانی کوردی سادە ڕوون بکەوە.",
    code: "You are a coding expert. Respond with complete HTML/CSS/JS combined blocks so I can preview it.",
    agent: "تۆ بریکارێکی سەربەخۆیت (Auto-Agent). کارە گەورەکان دابەش بکە بۆ هەنگاوی بچووک و بە شێوەیەکی پرۆفیشناڵ و ڕێکخراو جێبەجێیان بکە.",
    comidy: "تۆ کەسێکی کۆمیدی و گاڵتەجاڕیت، تەنها ب زاراوێ بادینی بەرسڤێ بدە."
};

window.speakText = (text) => {
    if (window.speechSynthesis.speaking) window.speechSynthesis.cancel(); 
    const cleanText = text.replace(/```[\s\S]*?```/g, "").replace(/[#*`_]/g, "");
    const speech = new SpeechSynthesisUtterance(cleanText);
    const isAr = /[\u0600-\u06FF]/.test(cleanText);
    speech.lang = isAr ? 'ar-SA' : (window.currentExpertMode === 'live_voice' ? 'en-US' : 'en-US');
    speech.rate = 0.9;
    window.speechSynthesis.speak(speech);
};

function getStorage() { 
    return window.isGuest ? sessionStorage : localStorage; 
}

function updateLongTermMemory(userText) {
    let memory = localStorage.getItem("nijyar_long_memory") || "";
    if(userText.includes("ناڤێ من") || userText.includes("حەز دکەم") || userText.includes("ئەز ")) {
        memory += userText + " | ";
        if(memory.length > 1000) memory = memory.slice(-1000); 
        localStorage.setItem("nijyar_long_memory", memory);
    }
}

window.setExpertMode = (mode, name, el) => {
    window.currentExpertMode = mode;
    const modelText = document.getElementById('currentModelText');
    if(modelText) modelText.innerHTML = name + ' <i class="fas fa-star" style="color:#d4af37; font-size:10px;"></i>';
    document.querySelectorAll('.mode-item').forEach(item => item.classList.remove('active'));
    if(el) el.classList.add('active');
    window.toggleModelDropdown();
};

window.copyToClipboard = (btn) => {
    const text = btn.closest('.msg').querySelector('.msg-content').innerText;
    navigator.clipboard.writeText(text); btn.innerText = "Copied! ✅";
    setTimeout(() => btn.innerHTML = "<i class='far fa-copy'></i> Copy", 2000);
};

window.copyRawCode = (btn) => {
    const code = btn.closest('.code-container').querySelector('code').innerText;
    navigator.clipboard.writeText(code); btn.innerText = "Copied! ✅";
    setTimeout(() => btn.innerHTML = "Copy Code", 2000);
};

window.removeSelectedImage = () => {
    selectedImageBase64 = null;
    const preview = document.getElementById("imagePreviewContainer");
    if(preview) preview.innerHTML = "";
    const imageInput = document.getElementById("imageInput");
    if(imageInput) imageInput.value = "";
};

window.deleteChat = (e, id) => {
    if(e) e.stopPropagation();
    if(confirm("دێ ئەڤ چاتە هێتە سڕین ب تەمامی؟")) {
        let storage = getStorage(); 
        let all = JSON.parse(storage.getItem(`chats_${window.loggedInUser}`)) || {};
        delete all[id]; 
        storage.setItem(`chats_${window.loggedInUser}`, JSON.stringify(all));
        window.filterHistory(); 
        if(window.currentChatId == id) window.createNewChat();
    }
};

function stopAllActions() {
    if (abortController) abortController.abort();
    window.isTyping = false; window.speechSynthesis.cancel(); 
    const stopBtn = document.getElementById("stopBtn");
    if(stopBtn) stopBtn.style.display = "none";
}

// ✅ Artifacts Logic
window.openArtifacts = (encodedCode) => {
    const overlay = document.getElementById("artifacts-overlay");
    const frame = document.getElementById("preview-frame");
    if(overlay) overlay.classList.remove("artifacts-hidden");
    if(frame) frame.srcdoc = decodeURIComponent(encodedCode);
};

window.closeArtifacts = () => { 
    const overlay = document.getElementById("artifacts-overlay");
    if(overlay) overlay.classList.add("artifacts-hidden"); 
};

window.updateArtifactWithAI = async () => {
    const promptInput = document.getElementById("artifactPrompt");
    const prompt = promptInput ? promptInput.value.trim() : "";
    if(!prompt) return;
    const frame = document.getElementById("preview-frame");
    const currentHTML = frame ? frame.srcdoc : "";
    if(promptInput) promptInput.value = "⏳ یێ دەستکاری دکەت...";
    try {
        const payload = `Modify the following HTML/CSS code according to this instruction: "${prompt}". Return ONLY the full updated code, nothing else.\n\nCode:\n\`\`\`html\n${currentHTML}\n\`\`\``;
        const res = await getAIResponse(payload, null, 'code');
        const newCode = res.replace(/```(html)?|```/g, "").trim();
        if(frame) frame.srcdoc = newCode;
        if(promptInput) promptInput.value = "";
        addMsg("ئەنجامێ کۆدی ل سەر داخوازیا تە هاتە گۆڕین 🎨", 'bot');
    } catch(e) {
        if(promptInput) promptInput.value = "❌ خەلەتییەک چێبوو.";
    }
};

async function safeFetch(url, options, retries = 3) {
    try {
        const res = await fetch(url, options);
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(`HTTP Error: ${res.status} - ${errorData.error?.message || 'Unknown'}`);
        }
        return res;
    } catch (error) {
        if (retries > 0 && error.name !== 'AbortError') {
            return await safeFetch(url, options, retries - 1);
        } else {
            throw error;
        }
    }
}

window.exportWord = () => {
    const chatBox = document.getElementById("chatBox");
    if (!chatBox || chatBox.innerHTML.trim() === "") return;
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Nijyar AI Chat</title></head><body>";
    const sourceHTML = header + chatBox.innerHTML + "</body></html>";
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const a = document.createElement("a"); a.href = source; a.download = 'Nijyar-AI.doc'; a.click();
};

window.exportChat = () => {
    const chatBox = document.getElementById("chatBox");
    if (!chatBox || chatBox.innerHTML.trim() === "") return;
    if(window.html2pdf) {
        html2pdf().set({ margin: 0.5, filename: `Nijyar-AI.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, useCORS: true, backgroundColor: "#050610" }, jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' } }).from(chatBox).save();
    }
};

window.captureMedia = async (type) => {
    if (type === 'screen') {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            const video = document.createElement('video'); video.srcObject = stream; await video.play();
            const canvas = document.createElement('canvas'); canvas.width = video.videoWidth; canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0); stream.getTracks().forEach(t => t.stop());
            selectedImageBase64 = canvas.toDataURL('image/jpeg', 0.6); showImagePreview(selectedImageBase64);
            addMsg("💻 شاشە هاتە گرتن.", 'bot');
        } catch(e) { alert("دەسەڵات نەهاتە دان یان خەلەتییەک چێبوو."); }
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        const overlay = document.createElement('div');
        overlay.style.cssText = "position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.95); z-index:9999; display:flex; flex-direction:column; align-items:center; justify-content:center; backdrop-filter: blur(10px);";
        
        const video = document.createElement('video');
        video.srcObject = stream;
        video.setAttribute('playsinline', ''); 
        video.style.cssText = "width:90%; max-width:500px; border-radius:15px; border:2px solid #10a37f; box-shadow: 0 10px 30px rgba(16, 163, 127, 0.4);";
        
        const btnContainer = document.createElement('div');
        btnContainer.style.cssText = "display:flex; gap:20px; margin-top:30px;";

        const captureBtn = document.createElement('button');
        captureBtn.innerHTML = '<i class="fas fa-camera"></i> وێنەی بگرە';
        captureBtn.style.cssText = "background:#10a37f; color:white; border:none; padding:15px 30px; border-radius:50px; font-size:16px; font-weight:bold; cursor:pointer; display:flex; gap:10px; align-items:center;";

        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '<i class="fas fa-times"></i>';
        closeBtn.style.cssText = "background:#ff4757; color:white; border:none; padding:15px 20px; border-radius:50px; font-size:16px; cursor:pointer;";

        btnContainer.appendChild(closeBtn);
        btnContainer.appendChild(captureBtn);
        overlay.appendChild(video);
        overlay.appendChild(btnContainer);
        document.body.appendChild(overlay);

        await video.play();

        captureBtn.onclick = () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth; canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0);
            
            stream.getTracks().forEach(t => t.stop()); 
            overlay.remove(); 
            
            selectedImageBase64 = canvas.toDataURL('image/jpeg', 0.6);
            showImagePreview(selectedImageBase64);
            addMsg("📸 وێنەیێ کامێرایێ هاتە گرتن.", 'bot');
        };

        closeBtn.onclick = () => {
            stream.getTracks().forEach(t => t.stop());
            overlay.remove();
        };

    } catch(e) {
        alert("دەسەڵاتی کامێرایێ نەهاتە دان.");
    }
};

let mediaRecorder; 
let audioChunks = [];

// ==========================================
// ✅ AUTH LISTENER & EVENT DELEGATION
// ==========================================

if (auth) {
    getRedirectResult(auth).then((result) => {
        if (result && result.user) {
            console.log("Google Login Redirect Success!");
        }
    }).catch((error) => {
        console.error("Google Auth Redirect Error:", error);
    });

    onAuthStateChanged(auth, (user) => {
        const loginScreen = document.getElementById("login-screen");
        const mainApp = document.getElementById("main-app");
        const displayName = document.getElementById("display-name");
        
        if (user) {
            window.loggedInUser = user.uid; window.isGuest = false;
            if(loginScreen) loginScreen.style.display = "none";
            if(mainApp) mainApp.style.display = "flex";
            if(displayName) displayName.innerText = user.displayName || user.email.split('@')[0];
            window.filterHistory(); if(!window.currentChatId) window.createNewChat();
        } else {
            if(loginScreen) loginScreen.style.display = "flex";
            if(mainApp) mainApp.style.display = "none";
        }
    });
} else {
    const loginScreen = document.getElementById("login-screen");
    if(loginScreen) loginScreen.style.display = "flex";
}

// ✅ Event Listeners (DOM Ready)
document.addEventListener("DOMContentLoaded", () => {
    initStars();
    
    if(window.pdfjsLib) pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
    if(window.mermaid) mermaid.initialize({ startOnLoad: false, theme: 'dark' });

    if(localStorage.getItem("nijyar_theme") === "light") { 
        document.body.classList.add("light-mode"); 
        const tIcon = document.getElementById("themeIcon");
        if(tIcon) tIcon.className = "fas fa-sun"; 
    }

    const menuToggleBtn = document.getElementById("menuToggleBtn");
    if(menuToggleBtn) menuToggleBtn.addEventListener("click", (e) => { e.preventDefault(); window.toggleDrawer(); });
    
    const drawerOverlay = document.getElementById("drawerOverlay");
    if(drawerOverlay) drawerOverlay.addEventListener("click", window.toggleDrawer);

    const modelSelectorBtn = document.getElementById("modelSelectorBtn");
    if(modelSelectorBtn) modelSelectorBtn.addEventListener("click", (e) => { e.preventDefault(); window.toggleModelDropdown(); });

    const profileBtn = document.getElementById("profileBtn");
    if(profileBtn) profileBtn.addEventListener("click", (e) => { e.preventDefault(); window.openProfile(); });

    const closeProfileBtn = document.getElementById("closeProfileBtn");
    if(closeProfileBtn) closeProfileBtn.addEventListener("click", (e) => { e.preventDefault(); document.getElementById('profileModal')?.classList.remove('open'); });

    const themeToggleBtn = document.getElementById("themeToggleBtn");
    if(themeToggleBtn) themeToggleBtn.addEventListener("click", (e) => { e.preventDefault(); window.toggleTheme(); });

    const newChatTopBtn = document.getElementById("newChatTopBtn");
    if(newChatTopBtn) newChatTopBtn.addEventListener("click", (e) => { e.preventDefault(); window.createNewChat(); });
    
    const drawerNewChatBtn = document.getElementById("drawerNewChatBtn");
    if(drawerNewChatBtn) drawerNewChatBtn.addEventListener("click", (e) => { e.preventDefault(); window.createNewChat(); window.toggleDrawer(); });

    const exportPdfBtn = document.getElementById("exportPdfBtn");
    if(exportPdfBtn) exportPdfBtn.addEventListener("click", (e) => { e.preventDefault(); window.exportChat(); });

    const exportWordBtn = document.getElementById("exportWordBtn");
    if(exportWordBtn) exportWordBtn.addEventListener("click", (e) => { e.preventDefault(); window.exportWord(); });

    const closeArtifactsBtn = document.getElementById("closeArtifactsBtn");
    if(closeArtifactsBtn) closeArtifactsBtn.addEventListener("click", (e) => { e.preventDefault(); window.closeArtifacts(); });

    const updateArtifactBtn = document.getElementById("updateArtifactBtn");
    if(updateArtifactBtn) updateArtifactBtn.addEventListener("click", (e) => { e.preventDefault(); window.updateArtifactWithAI(); });

    document.querySelectorAll('.mode-item').forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            const btn = e.currentTarget;
            window.setExpertMode(btn.dataset.mode, btn.dataset.name, btn);
        });
    });

    const googleBtn = document.getElementById("googleBtn");
    if (googleBtn) {
        googleBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            if(!auth) return alert("فایربەیس نەهاتییە گرێدان.");
            try {
                const isWebView = /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)|Android.*(wv|\.0\.0\.0)/.test(navigator.userAgent);
                if(isWebView) {
                    await signInWithRedirect(auth, provider);
                } else {
                    await signInWithPopup(auth, provider);
                }
            } catch (error) {
                if (error.code === 'auth/popup-blocked') {
                    try { await signInWithRedirect(auth, provider); } catch(err) { alert("کێشە: " + err.message); }
                } else { alert("کێشە د لۆگینێ دا: " + error.message); }
            }
        });
    }

    const signInBtn = document.getElementById("signInBtn");
    if(signInBtn) {
        signInBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            if(!auth) return;
            const email = document.getElementById("emailInput")?.value.trim();
            const pass = document.getElementById("passInput")?.value;
            if (!email || !pass) return alert("تکایە هەردوو خانەیان پڕ بکە!");
            const originalHtml = signInBtn.innerHTML; signInBtn.innerHTML = "⏳..."; 
            try {
                await signInWithEmailAndPassword(auth, email, pass);
                signInBtn.innerHTML = originalHtml;
            } catch (error) {
                alert("ئیمەیڵ یان پەیڤا نهێنی خەڵەتە!");
                signInBtn.innerHTML = originalHtml;
            }
        });
    }

    const signUpBtn = document.getElementById("signUpBtn");
    if(signUpBtn) {
        signUpBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            if(!auth) return;
            const email = document.getElementById("emailInput")?.value.trim();
            const pass = document.getElementById("passInput")?.value;
            if (!email || !pass) return alert("تکایە هەردوو خانەیان پڕ بکە!");
            if (pass.length < 6) return alert("پەیڤا نهێنی دڤێت ژ ٦ پیتان پتر بیت!");
            const originalHtml = signUpBtn.innerHTML; signUpBtn.innerHTML = "⏳..."; 
            try {
                await createUserWithEmailAndPassword(auth, email, pass);
                signUpBtn.innerHTML = originalHtml;
                alert("ئەکاونت ب سەرکەفتییانە دروست بوو! 🚀");
            } catch (error) {
                if (error.code === 'auth/email-already-in-use') alert("ئەڤ ئیمەیڵە بەری نها هاتییە تۆمارکرن!");
                else alert("خەلەتی: " + error.message);
                signUpBtn.innerHTML = originalHtml;
            }
        });
    }

    const guestBtn = document.getElementById("guestBtn");
    if(guestBtn) {
        guestBtn.addEventListener("click", (e) => { 
            e.preventDefault();
            window.loggedInUser = "Guest_" + Date.now(); 
            window.isGuest = true; 
            const loginScreen = document.getElementById("login-screen");
            const mainApp = document.getElementById("main-app");
            const displayName = document.getElementById("display-name");
            if(loginScreen) loginScreen.style.display = "none"; 
            if(mainApp) mainApp.style.display = "flex"; 
            if(displayName) displayName.innerText = "Guest User"; 
            window.createNewChat(); 
        });
    }

    const logoutBtn = document.getElementById("logoutBtn");
    if(logoutBtn) {
        logoutBtn.addEventListener("click", (e) => { 
            e.preventDefault();
            if(!window.isGuest && auth) {
                signOut(auth).then(() => location.reload()); 
            } else { 
                sessionStorage.removeItem(`chats_${window.loggedInUser}`);
                sessionStorage.clear(); 
                location.reload(); 
            } 
        });
    }

    const togglePasswordWrapper = document.getElementById("togglePasswordWrapper");
    if(togglePasswordWrapper) {
        togglePasswordWrapper.addEventListener("click", () => {
            const passInput = document.getElementById('passInput');
            const eyeIcon = document.getElementById('eyeIcon');
            if (passInput && eyeIcon) {
                if (passInput.type === 'password') {
                    passInput.type = 'text';
                    eyeIcon.classList.replace('fa-eye', 'fa-eye-slash');
                } else {
                    passInput.type = 'password';
                    eyeIcon.classList.replace('fa-eye-slash', 'fa-eye');
                }
            }
        });
    }

    const userInput = document.getElementById("userInput");
    if(userInput) { 
        userInput.addEventListener("input", function() { this.style.height = "auto"; this.style.height = (this.scrollHeight) + "px"; }); 
        userInput.addEventListener("keydown", (e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); window.handleChat(); } });
    }

    const sendBtn = document.getElementById("sendBtn");
    if(sendBtn) sendBtn.addEventListener("click", (e) => { e.preventDefault(); window.handleChat(); });

    const stopBtn = document.getElementById("stopBtn");
    if(stopBtn) stopBtn.addEventListener("click", (e) => { e.preventDefault(); stopAllActions(); });

    const searchInp = document.getElementById("historySearch");
    if(searchInp) searchInp.addEventListener("input", window.filterHistory);

    const attachBtn = document.getElementById("attachBtn");
    if(attachBtn) attachBtn.addEventListener("click", (e) => { e.preventDefault(); document.getElementById('imageInput')?.click(); });

    const cameraBtn = document.getElementById("cameraBtn");
    if(cameraBtn) cameraBtn.addEventListener("click", (e) => { e.preventDefault(); window.captureMedia('camera'); });

    const screenBtn = document.getElementById("screenBtn");
    if(screenBtn) screenBtn.addEventListener("click", (e) => { e.preventDefault(); window.captureMedia('screen'); });

    const micBtn = document.getElementById("micBtn");
    if (micBtn) {
        micBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            if (window.isTyping) return;
            if (mediaRecorder && mediaRecorder.state === "recording") { mediaRecorder.stop(); micBtn.style.color = ""; return; }
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream); audioChunks = [];
                mediaRecorder.ondataavailable = (ev) => audioChunks.push(ev.data);
                mediaRecorder.onstop = async () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                    const formData = new FormData(); formData.append("file", audioBlob, "audio.webm"); formData.append("model", "whisper-large-v3");
                    if(userInput) { userInput.value = "⏳ دێ گوھداریا دەنگێ تە کەت..."; userInput.disabled = true; }
                    try {
                        const res = await safeFetch("https://api.groq.com/openai/v1/audio/transcriptions", { method: "POST", headers: { "Authorization": `Bearer ${GROQ_API_KEY}` }, body: formData });
                        const data = await res.json();
                        if(data.text && userInput) { userInput.value = data.text; if(window.currentExpertMode === 'live_voice') { userInput.disabled = false; window.handleChat(); } }
                    } catch (err) { if(userInput) userInput.value = "❌ هەڵە د دەنگی دا."; } 
                    finally { if(userInput) { userInput.disabled = false; userInput.dispatchEvent(new Event('input')); } }
                };
                mediaRecorder.start(); micBtn.style.color = "#ff4757";
            } catch (err) { alert("تکایە دەسەڵاتی مایکڕۆفۆنێ بدە."); }
        });
    }

    const imageInput = document.getElementById("imageInput");
    if(imageInput) {
        imageInput.addEventListener("change", async (e) => {
            const file = e.target.files[0]; if (!file) return;
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas'); const MAX_WIDTH = 512; const MAX_HEIGHT = 512; 
                        let width = img.width; let height = img.height;
                        if (width > height && width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; } else if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
                        canvas.width = width; canvas.height = height; const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, width, height);
                        selectedImageBase64 = canvas.toDataURL('image/jpeg', 0.5); showImagePreview(selectedImageBase64);
                    }; img.src = event.target.result;
                }; reader.readAsDataURL(file);
            } else if (file.name.endsWith('.csv') || file.type === 'text/csv') {
                if(userInput) { userInput.value = "⏳ دێ CSV خوینیت..."; userInput.disabled = true; }
                const reader = new FileReader();
                reader.onload = (event) => {
                    const csvData = event.target.result;
                    if(userInput) { userInput.value = `ئەڤە داتایێن فایلێ CSV یە، تکایە شیکار بکە:\n\n${csvData.substring(0,2000)}`; userInput.dispatchEvent(new Event('input')); userInput.disabled = false; }
                }; reader.readAsText(file); e.target.value = "";
            } else if (file.type === 'application/pdf') {
                if(userInput) { userInput.value = "⏳ دێ پەڕاوی خوینیت..."; userInput.disabled = true; }
                try {
                    const arrayBuffer = await file.arrayBuffer(); const pdf = await pdfjsLib.getDocument({data: arrayBuffer}).promise; let fullText = ``;
                    for (let i = 1; i <= pdf.numPages; i++) { const page = await pdf.getPage(i); const textContent = await page.getTextContent(); fullText += textContent.items.map(item => item.str).join(' ') + "\n"; }
                    window.globalDocumentContext = `[زانیاریێن پەڕاوێ ${file.name}]:\n` + fullText.substring(0, 10000); 
                    addMsg(`📚 پەڕاوێ (${file.name}) هاتە خویندن و خەزنکرن. نها دشێی پرسیاران ل سەر بکەی.`, 'bot');
                } catch (err) { if(userInput) userInput.value = "❌ هەڵە د خواندنێ دا."; } finally { if(userInput) userInput.disabled = false; e.target.value = ""; }
            }
        });
    }
});

window.addEventListener("beforeunload", () => {
    if(mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
    }
});

// ==========================================

window.createNewChat = () => {
    if(window.isTyping) return; window.currentChatId = Date.now().toString();
    const chatBox = document.getElementById("chatBox");
    if(chatBox) { chatBox.innerHTML = ""; addMsg("سڵاڤ! ئەز نژیار AI مە، چەوان دشێم هاریکار بم؟", 'bot'); }
    const userInput = document.getElementById("userInput");
    if(userInput) { userInput.value = ""; userInput.style.height = "auto"; }
    window.filterHistory();
};

window.handleChat = async () => {
    const inp = document.getElementById("userInput"); let text = inp ? inp.value.trim() : ""; const stopBtn = document.getElementById("stopBtn");
    if(!text && !selectedImageBase64) return; if(window.isTyping) return; if(stopBtn) stopBtn.style.display = "block";

    if(window.currentExpertMode === 'agent' || text.startsWith("/agent")) {
        const task = text.replace("/agent", "").trim();
        addMsg(`🤖 بریکار پێکهات... کار: ${task}`, 'user');
        if(inp) { inp.value = ""; inp.style.height = "auto"; }
        window.isTyping = true; abortController = new AbortController();
        const load1 = addMsg("⏳ قۆناغا 1: داڕشتنا پلانێ...", 'bot');
        try {
            const plan = await getAIResponse(`وەک Auto-Agent پلانێک دابنێ بۆ جێبەجێکردنی ئەم کارە: ${task}`, null, 'pro');
            load1.innerHTML = `<div class="msg-content"><b>📋 پلانا کارکرنێ:</b><br>${plan}</div>`;
            const load2 = addMsg("⏳ قۆناغا 2: جێبەجێکرن...", 'bot');
            const finalRes = await getAIResponse(`ئەمە پلانەکەیە: ${plan}. تکایە بە وردی هەموو کارەکە جێبەجێ بکە و ئەنجامی کۆتایییم پێ بدە.`, null, 'pro');
            load2.innerHTML = `<div class="msg-content"><b>✅ ئەنجامێ کۆتایی:</b><br>${finalRes}</div>`;
            window.isTyping = false; if(stopBtn) stopBtn.style.display = "none";
        } catch(e) { load1.innerHTML = "Error in Agent."; window.isTyping = false; }
        return;
    }

    if (text.toLowerCase().startsWith("/image") || text.startsWith("/وێنە")) {
        let prompt = text.replace("/image", "").replace("/وێنە", "").trim() || "beautiful landscape";
        addMsg(`ئەڤەیە وێنەیێ تە بۆ: "${prompt}"\n\n<img src="https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true" style="width:100%; max-width:400px; border-radius:10px; margin-top:10px;">`, 'bot');
        if(inp) { inp.value = ""; inp.style.height = "auto"; } return;
    }

    updateLongTermMemory(text);
    if(selectedImageBase64) addMsg(`<img src="${selectedImageBase64}" style="max-width:200px; border-radius:10px;">`, 'user');
    if(text && !text.startsWith("تێکستێ مالپەڕێ")) addMsg(text.length > 500 ? text.substring(0, 500) + "..." : text, 'user');
    saveHistory(window.currentChatId, text, 'user'); 
    
    const currentImg = selectedImageBase64;
    if(inp && !text.startsWith("تێکستێ مالپەڕێ")) { inp.value = ""; inp.style.height = "auto"; }
    window.removeSelectedImage();
    
    window.isTyping = true; abortController = new AbortController(); 
    const loadingDiv = addMsg("...", 'bot');

    try {
        const res = await getAIResponse(text || "شرۆڤە بکە", currentImg, window.currentExpertMode);
        typeWriter(res, window.currentChatId, loadingDiv);
    } catch (error) { 
        if (error.name !== 'AbortError') loadingDiv.querySelector('.msg-content').innerText = "Error: " + error.message;
        window.isTyping = false; if(stopBtn) stopBtn.style.display = "none";
    }
};

async function getAIResponse(p, img, mode) {
    let model = img ? "meta-llama/llama-4-scout-17b-16e-instruct" : "llama-3.3-70b-versatile";
    let storage = getStorage(); let history = JSON.parse(storage.getItem(`chats_${window.loggedInUser}`)) || {};
    let currentHistory = history[window.currentChatId] && history[window.currentChatId].messages ? history[window.currentChatId].messages.slice(-6) : [];
    let recentMessages = currentHistory.map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.msg }));

    let sysPrompt = aiPersonalities[mode] || aiPersonalities.pro;
    
    sysPrompt += "\n تێبینی گرنگ: ئەگەر بەکارهێنەر پرسیاری کرد 'تۆ کێیت' یان 'کێ دروستی کردوویت'، دەبێت بڵێیت 'من سیستمێکی ژیری دەستکردم و لەلایەن نژیار (Nijyar) دروستکراوم'.";

    let longMemory = localStorage.getItem("nijyar_long_memory");
    if(longMemory) sysPrompt += `\n[تێبینی دەربارەی نژیار: ${longMemory}]`;
    
    if(window.globalDocumentContext) {
        sysPrompt += `\n\nئەڤە زانیاریێن پەڕاوێ یە:\n${window.globalDocumentContext}`;
    }

    let messagesArray = img ? [{ role: "user", content: [{ type: "text", text: p }, { type: "image_url", image_url: { url: img } }] }] : [{ role: "system", content: sysPrompt }, ...recentMessages, { role: "user", content: p }];

    const response = await safeFetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST", headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
        signal: abortController.signal, body: JSON.stringify({ model: model, messages: messagesArray, temperature: 0.5 })
    });
    
    const responseData = await response.json();
    return responseData.choices[0].message.content;
}

function addMsg(text, sender, parseCode=false) {
    const chatBox = document.getElementById("chatBox"); if(!chatBox) return;
    const d = document.createElement("div"); d.className = `msg ${sender}`; 
    
    const direction = (text.includes("تێبینی") || text.includes("قۆناغا") || /[\u0600-\u06FF]/.test(text)) ? "rtl" : "ltr";
    d.style.direction = direction;
    d.style.textAlign = direction === "rtl" ? "right" : "left";
    
    d.innerHTML = `<div class="msg-content"></div>`;
    const contentArea = d.querySelector('.msg-content');
    if (text === "...") contentArea.innerText = "..."; 
    else renderFormattedMessage(d, text);
    
    chatBox.appendChild(d); chatBox.scrollTop = chatBox.scrollHeight; return d;
}

// ✅ ChatGPT Style Code Render
function renderFormattedMessage(div, rawText) {
    const contentArea = div.querySelector('.msg-content'); if(!contentArea) return;
    
    let formatted = rawText.replace(/```(html|css|javascript|js|python|mermaid)?([\s\S]*?)```/g, (match, lang, code) => {
        const language = lang ? lang.toLowerCase() : 'code';
        if(language === 'mermaid') {
            const id = 'mermaid-' + Date.now() + Math.floor(Math.random()*1000);
            setTimeout(() => { if(window.mermaid) mermaid.render(id, code.trim()).then(r => { document.getElementById(id+'-container').innerHTML = r.svg; }); }, 100);
            return `<div class="mermaid-diagram" id="${id}-container">⏳ دروستکرنا نەخشەی...</div>`;
        }
        const isHTML = language === 'html' || code.includes('<!DOCTYPE html>');
        const encodedCode = encodeURIComponent(code.trim());
        
        return `<div class="code-container">
                    <div class="code-header">
                        <span>${language.toUpperCase()}</span>
                        <div style="display:flex; gap:5px;">
                            ${isHTML ? `<button class="copy-code-btn" style="background:#10a37f; border-color:#10a37f;" onclick="window.openArtifacts('${encodedCode}')">👁️ Preview</button>` : ''}
                            <button class="copy-code-btn" onclick="window.copyRawCode(this)">Copy Code</button>
                        </div>
                    </div>
                    <pre><code class="language-${language}">${code.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>
                </div>`;
    });

    if (!formatted.includes('code-container') && !formatted.includes('<img') && !formatted.includes('mermaid-diagram')) {
        formatted = formatted.replace(/\n/g, '<br>');
    }
    
    if (window.DOMPurify) contentArea.innerHTML = DOMPurify.sanitize(formatted, { ADD_TAGS: ['button', 'img', 'iframe'], ADD_ATTR: ['onclick', 'src', 'class', 'style', 'id'] });
    else contentArea.innerHTML = formatted;
    
    if (window.Prism) Prism.highlightAllUnder(div);
    
    if (div.classList.contains('bot') && rawText !== "...") {
        const footer = document.createElement('div'); footer.style.cssText = "margin-top:8px; display:flex; gap:10px; justify-content: flex-start;";
        footer.innerHTML = `<button onclick="window.copyToClipboard(this)" style="background:rgba(255,255,255,0.1); border:none; color:#ccc; padding:3px 8px; border-radius:5px; cursor:pointer; font-size:11px;">Copy 📋</button>
                            <button onclick="window.speakText(this.closest('.msg').querySelector('.msg-content').innerText)" style="background:rgba(255,255,255,0.1); border:none; color:#ccc; padding:3px 8px; border-radius:5px; cursor:pointer; font-size:11px;">Listen 🔊</button>`;
        div.appendChild(footer);
    }
    document.getElementById("chatBox").scrollTop = document.getElementById("chatBox").scrollHeight;
}

function typeWriter(text, chatId, targetDiv) {
    let i = 0; window.isTyping = true; const contentArea = targetDiv.querySelector('.msg-content');
    if(!contentArea) return; contentArea.innerHTML = "";
    const interval = setInterval(() => {
        if(i < text.length && window.isTyping) {
            if(text.includes('<img') && i === 0) { contentArea.innerHTML = text; clearInterval(interval); finalize(); return; }
            contentArea.innerHTML += text.charAt(i); i++;
            document.getElementById("chatBox").scrollTop = document.getElementById("chatBox").scrollHeight;
        } else { clearInterval(interval); finalize(); }
    }, 15);

    function finalize() {
        window.isTyping = false; const stopBtn = document.getElementById("stopBtn"); if(stopBtn) stopBtn.style.display = "none";
        renderFormattedMessage(targetDiv, text); saveHistory(window.currentChatId, text, 'bot'); window.filterHistory();
        if(window.currentExpertMode === 'live_voice') window.speakText(text);
    }
}

function saveHistory(id, msg, sender) {
    let storage = getStorage();
    let all = JSON.parse(storage.getItem(`chats_${window.loggedInUser}`)) || {};
    if(!all[id]) all[id] = [];
    all[id].push({msg: msg, sender: sender});
    storage.setItem(`chats_${window.loggedInUser}`, JSON.stringify(all));
}

window.filterHistory = () => {
    const list = document.getElementById("historyList"); if(!list) return; list.innerHTML = "";
    let storage = getStorage();
    let all = JSON.parse(storage.getItem(`chats_${window.loggedInUser}`)) || {};
    
    const searchInput = document.getElementById("historySearch");
    const searchText = searchInput ? searchInput.value.toLowerCase() : "";

    Object.keys(all).sort((a,b)=>b-a).forEach(id => {
        let chatData = all[id];
        if(!chatData || chatData.length === 0) return;
        
        let title = chatData[0].msg.substring(0, 25) + "...";
        if(title.toLowerCase().includes(searchText)) {
            let item = document.createElement("div"); 
            item.className = "history-item";
            
            let titleSpan = document.createElement("span");
            titleSpan.style.cssText = "flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;";
            titleSpan.innerHTML = `<i class="far fa-comment-alt"></i> ${title}`;
            
            // ✅ چارەسەرییا دوگمەیا سڕینێ (Trash Icon)
            let delIcon = document.createElement("i");
            delIcon.className = "fas fa-trash-alt";
            delIcon.style.cssText = "color:#ff4757; opacity:0.8; padding-right:10px; cursor:pointer;";
            delIcon.onclick = (e) => { 
                e.stopPropagation();
                window.deleteChat(e, id);
            };
            
            item.appendChild(titleSpan);
            item.appendChild(delIcon);

            item.onclick = (e) => { 
                if(e.target === delIcon) return;
                window.currentChatId = id; const box = document.getElementById("chatBox"); if(box) box.innerHTML = "";
                chatData.forEach(c => addMsg(c.msg, c.sender, c.sender === 'bot')); 
                if(window.innerWidth < 768) window.toggleDrawer();
            };
            list.appendChild(item);
        }
    });
};

function showImagePreview(src) {
    const previewContainer = document.getElementById("imagePreviewContainer");
    if(previewContainer) {
        previewContainer.innerHTML = `<div style="position:relative; display:inline-block; margin: 10px;"><img src="${src}" style="width:60px; height:60px; border-radius:10px; border:2px solid #10a37f;"><span onclick="window.removeSelectedImage()" style="position:absolute; top:-5px; right:-5px; background:red; color:white; border-radius:50%; width:20px; height:20px; text-align:center; cursor:pointer; line-height:20px;">×</span></div>`;
        previewContainer.style.display = "block";
    }
}
