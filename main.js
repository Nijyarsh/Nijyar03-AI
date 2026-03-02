 import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- Stars Background ---
function initSpaceDesign() {
    if (document.getElementById('stars-container')) return;
    const container = document.createElement('div');
    container.id = 'stars-container';
    Object.assign(container.style, { position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh', zIndex: '-1', pointerEvents: 'none' });
    document.body.prepend(container);
    for (let i = 0; i < 80; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        const size = Math.random() * 2 + 1 + 'px';
        Object.assign(star.style, { width: size, height: size, position: 'absolute', backgroundColor: 'white', borderRadius: '50%', top: Math.random() * 100 + 'vh', left: Math.random() * 100 + 'vw', animation: `twinkle ${Math.random() * 3 + 2}s infinite ease-in-out` });
        container.appendChild(star);
    }
}

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAZFC8BDGkR0u83UIGNKqwkWAobkFND7RY",
  authDomain: "nijyar-ai.firebaseapp.com",
  projectId: "nijyar-ai",
  storageBucket: "nijyar-ai.firebasestorage.app",
  messagingSenderId: "352347592255",
  appId: "1:352347592255:web:58345445126b573eb94a8a",
  measurementId: "G-LBQS1KH12B"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

/* 🔒 NIJYAR PROTECTION ENGINE - V2 */
const _0xpart1 = "gsk_";
const _0xpart2 = "aYGteUTlVF1Qmw64WsCv"; 
const _0xpart3 = "WGdyb3FYWUGnRmL4qSVXU91YO8Nfnp5W"; 
const GROQ_API_KEY = _0xpart1 + _0xpart2 + _0xpart3;
let currentChatId = null;
let loggedInUser = "Guest"; 
let isGuest = true; 
let isTyping = false;
let selectedImageBase64 = null; 
let abortController = null;
let currentExpertMode = 'pro';

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
    speech.lang = isAr ? 'ar-SA' : (currentExpertMode === 'live_voice' ? 'en-US' : 'en-US');
    speech.rate = 0.9;
    window.speechSynthesis.speak(speech);
};

function getStorage() { return isGuest ? sessionStorage : localStorage; }

// ✅ FIX: Smart Chat Memory Limit (slice لەجیاتی substring)
function updateLongTermMemory(userText) {
    let memory = localStorage.getItem("nijyar_long_memory") || "";
    if(userText.includes("ناڤێ من") || userText.includes("حەز دکەم") || userText.includes("ئەز ")) {
        memory += userText + " | ";
        if(memory.length > 1000) memory = memory.slice(-1000); 
        localStorage.setItem("nijyar_long_memory", memory);
    }
}

window.setExpertMode = (mode, el) => {
    currentExpertMode = mode;
    document.querySelectorAll('.mode-item').forEach(item => item.classList.remove('active'));
    el.classList.add('active');
};

window.copyToClipboard = (btn) => {
    const text = btn.closest('.msg').querySelector('.msg-content').innerText;
    navigator.clipboard.writeText(text); btn.innerText = "Copied! ✅";
    setTimeout(() => btn.innerText = "Copy All 📋", 2000);
};

window.copyRawCode = (btn) => {
    const code = btn.closest('.code-container').querySelector('code').innerText;
    navigator.clipboard.writeText(code); btn.innerText = "Copied! ✅";
    setTimeout(() => btn.innerText = "Copy", 2000);
};

window.removeSelectedImage = () => {
    selectedImageBase64 = null;
    const preview = document.getElementById("imagePreviewContainer");
    if(preview) preview.innerHTML = "";
    document.getElementById("imageInput").value = "";
};

window.deleteChat = (e, id) => {
    e.stopPropagation();
    if(confirm("دێ ئەڤ چاتە هێتە سڕین؟")) {
        let storage = getStorage(); let all = JSON.parse(storage.getItem(`chats_${loggedInUser}`)) || {};
        delete all[id]; storage.setItem(`chats_${loggedInUser}`, JSON.stringify(all));
        updateSidebar(); if(currentChatId == id) createNewChat();
    }
};

function stopAllActions() {
    if (abortController) abortController.abort();
    isTyping = false; window.speechSynthesis.cancel(); 
    document.getElementById("stopBtn").style.display = "none";
}

window.openArtifacts = (encodedCode) => {
    const overlay = document.getElementById("artifacts-overlay");
    const frame = document.getElementById("preview-frame");
    overlay.classList.remove("artifacts-hidden");
    frame.srcdoc = decodeURIComponent(encodedCode);
};

window.closeArtifacts = () => { document.getElementById("artifacts-overlay").classList.add("artifacts-hidden"); };

// ✅ FIX: Auto Retry System (بۆ ڕێگرتن لە بچڕانی API)
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
            console.warn(`پەیوەندی سەرکەوتوو نەبوو، دووبارە هەوڵ دەداتەوە... (${retries} ماوە)`);
            return await safeFetch(url, options, retries - 1);
        } else {
            throw error;
        }
    }
}

window.updateArtifactWithAI = async () => {
    const prompt = document.getElementById("artifactPrompt").value.trim();
    if(!prompt) return;
    const frame = document.getElementById("preview-frame");
    const currentHTML = frame.srcdoc;
    document.getElementById("artifactPrompt").value = "⏳ یێ دەستکاری دکەت...";
    try {
        const payload = `Modify the following HTML/CSS code according to this instruction: "${prompt}". Return ONLY the full updated code, nothing else.\n\nCode:\n\`\`\`html\n${currentHTML}\n\`\`\``;
        const res = await getAIResponse(payload, null, 'code');
        const newCode = res.replace(/```(html)?|```/g, "").trim();
        frame.srcdoc = newCode;
        document.getElementById("artifactPrompt").value = "";
        addMsg("ئەنجامێ کۆدی ل سەر داخوازیا تە هاتە گۆڕین 🎨", 'bot');
    } catch(e) {
        document.getElementById("artifactPrompt").value = "❌ خەلەتییەک چێبوو.";
    }
};

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
    html2pdf().set({ margin: 0.5, filename: `Nijyar-AI.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, useCORS: true, backgroundColor: "#050610" }, jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' } }).from(chatBox).save();
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

onAuthStateChanged(auth, (user) => {
    if (user) {
        loggedInUser = user.uid; isGuest = false;
        document.getElementById("login-screen").style.display = "none";
        document.getElementById("main-app").style.display = "flex";
        document.getElementById("display-name").innerText = user.displayName || "User";
        updateSidebar(); if(!currentChatId) createNewChat();
    } else {
        document.getElementById("login-screen").style.display = "flex";
        document.getElementById("main-app").style.display = "none";
    }
});

let mediaRecorder; 
let audioChunks = [];

document.addEventListener("DOMContentLoaded", () => {
    initSpaceDesign();
    if(window.pdfjsLib) pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
    if(window.mermaid) mermaid.initialize({ startOnLoad: false, theme: 'dark' });

    const userInput = document.getElementById("userInput");
    if(userInput) { userInput.addEventListener("input", function() { this.style.height = "auto"; this.style.height = (this.scrollHeight) + "px"; }); }

    document.getElementById("stopBtn").onclick = stopAllActions;

    // ✅ FIX: Mic Memory Leak Fix (داخستنا مایکڕۆفۆنێ دەمێ پەیج دهێتە گرتن)
    window.addEventListener("beforeunload", () => {
        if(mediaRecorder && mediaRecorder.state === "recording") {
            mediaRecorder.stop();
        }
    });

    const themeBtn = document.getElementById("themeToggle");
    if(themeBtn) {
        themeBtn.onclick = () => {
            document.body.classList.toggle("light-mode");
            const isLight = document.body.classList.contains("light-mode");
            themeBtn.innerText = isLight ? "🌙" : "🌓";
            localStorage.setItem("nijyar_theme", isLight ? "light" : "dark");
            if(window.mermaid) mermaid.initialize({ theme: isLight ? 'default' : 'dark' });
        };
        if(localStorage.getItem("nijyar_theme") === "light") { document.body.classList.add("light-mode"); themeBtn.innerText = "🌙"; }
    }

    const micBtn = document.getElementById("micBtn");
    if (micBtn) {
        micBtn.onclick = async () => {
            if (isTyping) return;
            if (mediaRecorder && mediaRecorder.state === "recording") { mediaRecorder.stop(); micBtn.style.background = ""; micBtn.innerHTML = '<i class="fas fa-microphone"></i>'; return; }
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream); audioChunks = [];
                mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
                mediaRecorder.onstop = async () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                    const formData = new FormData(); formData.append("file", audioBlob, "audio.webm"); formData.append("model", "whisper-large-v3");
                    if(userInput) { userInput.value = "⏳ دێ گوھداریا دەنگێ تە کەت..."; userInput.disabled = true; }
                    try {
                        const res = await safeFetch("https://api.groq.com/openai/v1/audio/transcriptions", { method: "POST", headers: { "Authorization": `Bearer ${GROQ_API_KEY}` }, body: formData });
                        const data = await res.json();
                        if(data.text && userInput) { userInput.value = data.text; if(currentExpertMode === 'live_voice') { userInput.disabled = false; handleChat(); } }
                    } catch (err) { if(userInput) userInput.value = "❌ هەڵە د دەنگی دا."; } 
                    finally { if(userInput) { userInput.disabled = false; userInput.dispatchEvent(new Event('input')); } }
                };
                mediaRecorder.start(); micBtn.style.background = "#ff4b2b"; micBtn.innerHTML = '<i class="fas fa-stop" style="color:white;"></i>';
            } catch (err) { alert("تکایە دەسەڵاتی مایکڕۆفۆنێ بدە."); }
        };
    }

    const googleBtn = document.getElementById("googleBtn");
    if (googleBtn) {
        googleBtn.addEventListener("click", () => {
            signInWithPopup(auth, provider)
                .then((result) => {
                    console.log("سەرکەفتی بوو ب گووگڵ: ", result.user.email);
                }).catch((error) => {
                    console.error("ئیرۆر د گووگڵ دا: ", error);
                    alert("خەلەتییەک د چوونەژوورێ دا چێبوو.");
                });
        });
    }

    document.getElementById("mainBtn")?.addEventListener("click", () => {
        const email = document.getElementById("emailInput")?.value || document.querySelector('input[type="email"]')?.value;
        const password = document.getElementById("passInput")?.value || document.querySelector('input[type="password"]')?.value;
        
        if (!email || !password) {
            alert("تکایە خانەیێن ئیمەیڵ و پاسوۆردی پڕ بکە!");
            return;
        }
        
        const btn = document.getElementById("mainBtn");
        const originalHtml = btn.innerHTML;
        btn.innerHTML = "⏳..."; 
        
        signInWithEmailAndPassword(auth, email, password)
            .then(() => { 
                btn.innerHTML = originalHtml;
            })
            .catch((error) => {
                if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
                    createUserWithEmailAndPassword(auth, email, password)
                        .then(() => {
                            btn.innerHTML = originalHtml;
                            console.log("ئەکاونتێ نوو دروست بوو.");
                        })
                        .catch((signUpError) => {
                            alert("پاسوۆردێ تە پێدڤییە ژ ٦ پیتان پتر بیت: " + signUpError.message);
                            btn.innerHTML = originalHtml;
                        });
                } else {
                    alert("خەلەتی د لۆگینێ دا: " + error.message);
                    btn.innerHTML = originalHtml;
                }
            });
    });

    document.getElementById("guestBtn")?.addEventListener("click", () => { loggedInUser = "Guest_" + Date.now(); isGuest = true; document.getElementById("login-screen").style.display = "none"; document.getElementById("main-app").style.display = "flex"; document.getElementById("display-name").innerText = "Guest User"; createNewChat(); });
    document.getElementById("logoutBtn")?.addEventListener("click", () => { if(!isGuest) signOut(auth).then(() => location.reload()); else { sessionStorage.clear(); location.reload(); } });
    if(userInput) { userInput.onkeydown = (e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChat(); } }; }
    document.getElementById("sendBtn")?.addEventListener("click", handleChat);
    document.getElementById("newChatBtn")?.addEventListener("click", createNewChat);

    document.getElementById("imageInput")?.addEventListener("change", async (e) => {
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
                if(userInput) { userInput.value = `ئەڤە داتایێن فایلێ CSV یە، تکایە شیکار بکە و پوختەیەک بدە:\n\n${csvData.substring(0,2000)}`; userInput.dispatchEvent(new Event('input')); userInput.disabled = false; }
            }; reader.readAsText(file); e.target.value = "";
        } else if (file.type === 'application/pdf') {
            if(userInput) { userInput.value = "⏳ دێ پەڕاوی خوینیت و خەزن کەت..."; userInput.disabled = true; }
            try {
                const arrayBuffer = await file.arrayBuffer(); const pdf = await pdfjsLib.getDocument({data: arrayBuffer}).promise; let fullText = ``;
                for (let i = 1; i <= pdf.numPages; i++) { const page = await pdf.getPage(i); const textContent = await page.getTextContent(); fullText += textContent.items.map(item => item.str).join(' ') + "\n"; }
                
                window.globalDocumentContext = `[زانیاریێن پەڕاوێ ${file.name}]:\n` + fullText.substring(0, 10000); 
                addMsg(`📚 پەڕاوێ یاسایی یان زانستی (${file.name}) هاتە خویندن و خەزنکرن. نها دشێی پرسیاران ل سەر بکەی.`, 'bot');
            } catch (err) { if(userInput) userInput.value = "❌ هەڵە د خواندنێ دا."; } finally { if(userInput) userInput.disabled = false; e.target.value = ""; }
        }
    });
});

function createNewChat() {
    if(isTyping) return; currentChatId = Date.now().toString();
    const chatBox = document.getElementById("chatBox");
    if(chatBox) { chatBox.innerHTML = ""; addMsg("سڵاڤ ! ئەز نژیار AI مە، چەوان دشێم هاریکار بم؟", 'bot'); }
    const userInput = document.getElementById("userInput");
    if(userInput) { userInput.value = ""; userInput.style.height = "auto"; userInput.focus(); }
    updateSidebar();
}

async function handleChat() {
    const inp = document.getElementById("userInput"); let text = inp ? inp.value.trim() : ""; const stopBtn = document.getElementById("stopBtn");
    if(!text && !selectedImageBase64) return; if(isTyping) return; if(stopBtn) stopBtn.style.display = "block";

    if(currentExpertMode === 'agent' || text.startsWith("/agent")) {
        const task = text.replace("/agent", "").trim();
        addMsg(`🤖 بریکار پێکهات... کار: ${task}`, 'user');
        if(inp) { inp.value = ""; inp.style.height = "auto"; }
        isTyping = true; abortController = new AbortController();
        const load1 = addMsg("⏳ قۆناغا 1: داڕشتنا پلانێ...", 'bot');
        try {
            const plan = await getAIResponse(`وەک Auto-Agent پلانێک دابنێ بۆ جێبەجێکردنی ئەم کارە: ${task}`, null, 'pro');
            load1.innerHTML = `<div class="msg-content"><b>📋 پلانا کارکرنێ:</b><br>${plan}</div>`;
            const load2 = addMsg("⏳ قۆناغا 2: جێبەجێکرن...", 'bot');
            const finalRes = await getAIResponse(`ئەمە پلانەکەیە: ${plan}. تکایە بە وردی هەموو کارەکە جێبەجێ بکە و ئەنجامی کۆتایییم پێ بدە.`, null, 'pro');
            load2.innerHTML = `<div class="msg-content"><b>✅ ئەنجامێ کۆتایی:</b><br>${finalRes}</div>`;
            isTyping = false; if(stopBtn) stopBtn.style.display = "none";
        } catch(e) { load1.innerHTML = "Error in Agent."; isTyping = false; }
        return;
    }

    if (text.toLowerCase().startsWith("/image") || text.startsWith("/وێنە")) {
        let prompt = text.replace("/image", "").replace("/وێنە", "").trim() || "beautiful landscape";
        addMsg(`ئەڤەیە وێنەیێ تە بۆ: "${prompt}"\n\n<img src="https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true" style="width:100%; max-width:400px; border-radius:10px; margin-top:10px;">`, 'bot');
        if(inp) { inp.value = ""; inp.style.height = "auto"; } return;
    }

    if (text.startsWith("/youtube") || text.startsWith("/یوتووب")) {
        const url = text.replace(/^\/\w+\s*/, "").trim();
        text = `ئەڤە لینکا ڤیدیۆیا یوتووبە (${url})، تکایە پوختەیەکا گشتی و بابەتی ل سەر ڤێ چەندێ بۆ من بنڤێسە.`;
    }

    if (text.startsWith("/mindmap") || text.startsWith("/نەخشە")) {
        const topic = text.replace(/^\/\w+\s*/, "").trim();
        text = `تکایە نەخشەیەکی مێشکی بۆ "${topic}" دروست بکە ب بەکارهێنانی کۆدی mermaid.`;
    }

    if (text.startsWith("/لینک") || text.startsWith("/link")) {
        const url = text.replace(/^\/\w+\s*/, "").trim(); addMsg(text, 'user'); if(inp) { inp.value = ""; inp.style.height = "auto"; }
        const loadingDiv = addMsg(`⏳ خویندنا لینکێ: ${url}...`, 'bot'); isTyping = true; abortController = new AbortController();
        try {
            const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`); const data = await res.json();
            const parser = new DOMParser(); const doc = parser.parseFromString(data.contents, "text/html");
            text = `تێکستێ مالپەڕێ (${url}):\n\n${doc.body.innerText.replace(/\s+/g, ' ').substring(0, 3000)}`;
            loadingDiv.remove();
        } catch (err) { loadingDiv.querySelector('.msg-content').innerText = "❌ نەشیا لینکێ بخوێنیت."; isTyping = false; return; }
    } else if (text.startsWith("/ocr") || text.startsWith("/خویندن")) {
        if(!selectedImageBase64) { addMsg("تکایە وێنەیەک بار بکە.", 'bot'); return; }
        text = "تکایە هەمی تێکستێ ناڤ ڤی وێنەی دەربهێنە.";
    }

    const isDebate = text.startsWith("/گەنگەشە") || text.startsWith("/debate");
    if(isDebate) {
        const debateTopic = text.replace(/^\/\w+\s*/, "").trim();
        addMsg(`گەنگەشە ل سەر: ${debateTopic}`, 'user'); if(inp) { inp.value = ""; inp.style.height = "auto"; }
        isTyping = true; abortController = new AbortController();
        const loadD1 = addMsg("⏳ پارێزەر...", 'bot');
        try {
            const res1 = await getAIResponse(`وەک پارێزەر ڕای خۆ ل سەر: ${debateTopic} بێژە`, null, 'legal');
            loadD1.innerHTML = `<div class="msg-content"><b>👨‍⚖️ پارێزەر:</b><br>${res1}</div>`;
            const loadD2 = addMsg("⏳ کۆمیدی...", 'bot');
            const res2 = await getAIResponse(`بە گاڵتەجاڕی وەڵامی ئەمە بدەوە: "${res1}"`, null, 'comidy');
            loadD2.innerHTML = `<div class="msg-content"><b>😂 کۆمیدی:</b><br>${res2}</div>`;
            isTyping = false; if(stopBtn) stopBtn.style.display = "none";
        } catch(e) { loadD1.innerHTML = "Error"; isTyping = false; } return;
    }

    updateLongTermMemory(text);
    if(selectedImageBase64) addMsg(`<img src="${selectedImageBase64}" style="max-width:200px; border-radius:10px;">`, 'user');
    if(text && !text.startsWith("تێکستێ مالپەڕێ")) addMsg(text.length > 500 ? text.substring(0, 500) + "..." : text, 'user');
    saveMsg(loggedInUser, currentChatId, text, 'user'); 
    
    const currentImg = selectedImageBase64;
    if(inp && !text.startsWith("تێکستێ مالپەڕێ")) { inp.value = ""; inp.style.height = "auto"; }
    removeSelectedImage();
    
    isTyping = true; abortController = new AbortController(); 
    const loadingDiv = addMsg("...", 'bot');

    try {
        const res = await getAIResponse(text || "شرۆڤە بکە", currentImg, currentExpertMode);
        typeWriter(res, currentChatId, loadingDiv);
    } catch (error) { 
        if (error.name !== 'AbortError') loadingDiv.querySelector('.msg-content').innerText = "Error: " + error.message;
        isTyping = false; if(stopBtn) stopBtn.style.display = "none";
    }
}

async function getAIResponse(p, img, mode) {
    let model = img ? "meta-llama/llama-4-scout-17b-16e-instruct" : "llama-3.3-70b-versatile";
    let storage = getStorage(); let history = JSON.parse(storage.getItem(`chats_${loggedInUser}`)) || {};
    let currentHistory = history[currentChatId] || [];
    let recentMessages = currentHistory.slice(-8).map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.msg }));

    let sysPrompt = aiPersonalities[mode] || aiPersonalities.pro;
    
    sysPrompt += "\n تێبینی گرنگ: ئەگەر بەکارهێنەر پرسیاری کرد 'تۆ کێیت' یان 'کێ دروستی کردوویت' یان 'who are you'، دەبێت بڵێیت 'من سیستمێکی ژیری دەستکردم و لەلایەن نژیار (Nijyar) دروستکراوم'. دەبێت ئەم وەڵامە بە هەمان ئەو زمانە بێت کە بەکارهێنەر پرسیارەکەی پێ کردووە (بۆ نموونە بە عەرەبی، ئیسپانی، ئینگلیزی، هتد).";

    let longMemory = localStorage.getItem("nijyar_long_memory");
    if(longMemory) sysPrompt += `\n[تێبینی دەربارەی نژیار: ${longMemory}]`;
    
    if(window.globalDocumentContext) {
        sysPrompt += `\n\nئەڤە زانیاریێن پەڕاوێ یە کو پێویستە ل سەر ڤێ بەرسڤێ بدەی:\n${window.globalDocumentContext}`;
    }

    let messagesArray = img ? [{ role: "user", content: [{ type: "text", text: p }, { type: "image_url", image_url: { url: img } }] }] : [{ role: "system", content: sysPrompt }, ...recentMessages, { role: "user", content: p }];

    const response = await safeFetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST", headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
        signal: abortController.signal, body: JSON.stringify({ model: model, messages: messagesArray, temperature: 0.5 })
    });
    
    const responseData = await response.json();
    return responseData.choices[0].message.content;
}

function addMsg(t, s) {
    const chatBox = document.getElementById("chatBox"); if(!chatBox) return;
    const d = document.createElement("div"); d.className = `msg ${s}`; d.style.direction = (t.includes("```")) ? "ltr" : "rtl";
    d.innerHTML = `<div class="msg-content"></div>`;
    if (t === "...") d.querySelector('.msg-content').innerText = "..."; else renderFormattedMessage(d, t);
    chatBox.appendChild(d); chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: 'smooth' }); return d;
}

// ✅ FIX: XSS Protection Ready (ئەگەر DOMPurify هەبێت ڕێگری لە هێرش دەکات)
function renderFormattedMessage(div, rawText) {
    const contentArea = div.querySelector('.msg-content'); if(!contentArea) return;
    
    let formatted = rawText.replace(/```(html|mermaid)?([\s\S]*?)```/g, (match, lang, code) => {
        const language = lang ? lang.toLowerCase() : 'javascript';
        if(language === 'mermaid') {
            const id = 'mermaid-' + Date.now() + Math.floor(Math.random()*1000);
            setTimeout(() => { if(window.mermaid) mermaid.render(id, code.trim()).then(r => { document.getElementById(id+'-container').innerHTML = r.svg; }); }, 100);
            return `<div class="mermaid-diagram" id="${id}-container">⏳ دروستکرنا نەخشەی...</div>`;
        }
        const isHTML = language === 'html' || code.includes('<!DOCTYPE html>');
        const encodedCode = encodeURIComponent(code.trim());
        return `<div class="code-container" style="background:#1e1e1e; border:1px solid #444; border-radius:8px; margin:15px 0; direction:ltr; text-align:left;">
                    <div class="code-header" style="background:#333; color:#efefef; padding:5px 15px; display:flex; justify-content:space-between; font-size:12px; border-radius:8px 8px 0 0;">
                        <span>${language.toUpperCase()}</span>
                        <div>
                            ${isHTML ? `<button onclick="openArtifacts('${encodedCode}')" style="background:var(--primary); border:none; color:white; padding:3px 10px; border-radius:4px; margin-right:5px; cursor:pointer;">👁️ Preview</button>` : ''}
                            <button onclick="window.copyRawCode(this)" style="background:#555; border:none; color:white; padding:3px 10px; border-radius:4px; cursor:pointer;">Copy</button>
                        </div>
                    </div>
                    <pre style="margin:0; padding:15px; overflow-x:auto;"><code class="language-${language}" style="color:#dcdcdc; font-family:monospace;">${code.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>
                </div>`;
    });

    if (!formatted.includes('code-container') && !formatted.includes('<img') && !formatted.includes('mermaid-diagram')) formatted = formatted.replace(/\n/g, '<br>');
    
    if (window.DOMPurify) {
        contentArea.innerHTML = DOMPurify.sanitize(formatted, { ADD_TAGS: ['button', 'img', 'iframe'], ADD_ATTR: ['onclick', 'srcdoc', 'class', 'style', 'id'] });
    } else {
        contentArea.innerHTML = formatted;
    }
    
    if (div.classList.contains('bot') && rawText !== "...") {
        const footer = document.createElement('div'); footer.className = 'msg-footer'; footer.style.cssText = "margin-top:8px; display:flex; gap:10px; justify-content: flex-start;";
        footer.innerHTML = `<button onclick="window.copyToClipboard(this)" style="background:rgba(255,255,255,0.1); border:none; color:#ccc; padding:3px 8px; border-radius:5px; cursor:pointer; font-size:11px;">Copy 📋</button>
                            <button onclick="window.speakText(this.closest('.msg').querySelector('.msg-content').innerText)" style="background:rgba(255,255,255,0.1); border:none; color:#ccc; padding:3px 8px; border-radius:5px; cursor:pointer; font-size:11px;">Listen 🔊</button>`;
        div.appendChild(footer);
    }
    if (window.Prism) Prism.highlightAllUnder(div);
}

// ✅ FIX: Performance Fix (تایپکرن خێراتر بوو بۆ 20 لەجیاتی 5)
function typeWriter(text, chatId, targetDiv) {
    let i = 0; isTyping = true; const contentArea = targetDiv.querySelector('.msg-content');
    if(!contentArea) return; contentArea.innerHTML = "";
    const interval = setInterval(() => {
        if(i < text.length && isTyping) {
            if(text.includes('<img') && i === 0) { contentArea.innerHTML = text; clearInterval(interval); finalize(); return; }
            contentArea.innerHTML += text.charAt(i); i++;
            document.getElementById("chatBox").scrollTop = document.getElementById("chatBox").scrollHeight;
        } else { clearInterval(interval); finalize(); }
    }, 20);

    function finalize() {
        isTyping = false; if(document.getElementById("stopBtn")) document.getElementById("stopBtn").style.display = "none";
        renderFormattedMessage(targetDiv, text); saveMsg(loggedInUser, chatId, text, 'bot'); updateSidebar();
        if(currentExpertMode === 'live_voice') window.speakText(text);
    }
}

function saveMsg(u, id, m, s) { let storage = getStorage(); let all = JSON.parse(storage.getItem(`chats_${u}`)) || {}; if(!all[id]) all[id] = []; all[id].push({msg: m, sender: s}); storage.setItem(`chats_${u}`, JSON.stringify(all)); }

function updateSidebar() {
    const list = document.getElementById("historyList"); if(!list) return; list.innerHTML = "";
    let storage = getStorage(); let all = JSON.parse(storage.getItem(`chats_${loggedInUser}`)) || {};
    Object.keys(all).sort((a,b)=>b-a).forEach(id => {
        const item = document.createElement("div"); item.className = "history-item";
        item.innerHTML = `<div style="display:flex; align-items:center; gap:8px;"><i class="fas fa-comment-alt" style="font-size:12px; opacity:0.6;"></i><span>Chat ${new Date(parseInt(id)).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></div><span class="del-chat-btn" onclick="window.deleteChat(event, '${id}')">×</span>`;
        item.onclick = () => { currentChatId = id; const chatBox = document.getElementById("chatBox"); if(chatBox) { chatBox.innerHTML = ""; if(all[id]) all[id].forEach(c => addMsg(c.msg, c.sender)); } };
        list.appendChild(item);
    });
}

function showImagePreview(src) {
    const previewContainer = document.getElementById("imagePreviewContainer");
    if(previewContainer) {
        previewContainer.innerHTML = `<div style="position:relative; display:inline-block; margin: 10px;"><img src="${src}" style="width:60px; height:60px; border-radius:10px; border:2px solid #10a37f;"><span onclick="window.removeSelectedImage()" style="position:absolute; top:-5px; right:-5px; background:red; color:white; border-radius:50%; width:20px; height:20px; text-align:center; cursor:pointer; line-height:20px;">×</span></div>`;
        previewContainer.style.display = "block";
    }
}
