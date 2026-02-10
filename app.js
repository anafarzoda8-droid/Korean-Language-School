// =====================
// DEMO SECURITY NOTE:
// admin login/parol frontenda turibdi (demo). Real loyihada backend shart.
// =====================

const ADMIN_USER = "Madina";
const ADMIN_PASS = "Madina1905!";

const KEY = {
  user: "kr_user",
  admin: "kr_admin_logged",
  classConfig: "kr_class_config",
};

const state = {
  user: null,
  adminLogged: false,
  classConfig: {
    videoUrl: "",
    startAt: "", // ISO string (datetime-local)
  },
  joined: false,
};

const el = (id) => document.getElementById(id);

// UI
const registerCard = el("registerCard");
const joinCard = el("joinCard");
const playerCard = el("playerCard");

const regName = el("regName");
const regPhone = el("regPhone");
const regHint = el("regHint");

const studentName = el("studentName");
const joinHint = el("joinHint");

const classTimeText = el("classTimeText");
const classVideoText = el("classVideoText");

const playerHint = el("playerHint");
const playerEmpty = el("playerEmpty");
const videoFrame = el("videoFrame");

// Admin
const adminFab = el("adminFab");
const adminModal = el("adminModal");
const adminLoginWrap = el("adminLogin");
const adminPanelWrap = el("adminPanel");

const adminUser = el("adminUser");
const adminPass = el("adminPass");
const adminLoginHint = el("adminLoginHint");

const videoLink = el("videoLink");
const classDatetime = el("classDatetime");
const adminPreviewText = el("adminPreviewText");

const btnRegister = el("btnRegister");
const btnJoin = el("btnJoin");
const btnLogout = el("btnLogout");
const btnTestShake = el("btnTestShake");

const btnAdminLogin = el("btnAdminLogin");
const btnSaveClass = el("btnSaveClass");
const btnAdminLogout = el("btnAdminLogout");

// ============ INIT ============
loadState();
renderAll();
startAutoWatcher();

// ============ EVENTS ============
btnRegister.addEventListener("click", () => {
  if (!regName.value.trim()) return shakeAndMsg(regName, "Ismni kiriting.");
  if (!validUzPhone(regPhone.value.trim())) return shakeAndMsg(regPhone, "Telefonni +998... formatda kiriting.");

  state.user = { name: regName.value.trim(), phone: regPhone.value.trim() };
  saveState();
  toast("Ro‘yxatdan o‘tildi!");
  renderAll();
  scrollTo(joinCard);
});

btnJoin.addEventListener("click", () => {
  if (!state.user) {
    toast("Avval ro‘yxatdan o‘ting.");
    shake(registerCard);
    scrollTo(registerCard);
    return;
  }
  if (!studentName.value.trim()) return shakeAndMsg(studentName, "Darsdagi ismingizni kiriting.");

  state.joined = true;
  saveState();
  toast("Join qilindi! Dars vaqti kelganda avtomatik ochiladi.");
  renderAll();

  // Agar dars vaqtini allaqachon belgilagan bo‘lsa, player’ga tayyor turamiz
  scrollTo(playerCard);
});

btnLogout.addEventListener("click", () => {
  state.user = null;
  state.joined = false;
  saveState();
  toast("Chiqildi.");
  renderAll();
  scrollTo(registerCard);
});

btnTestShake.addEventListener("click", () => {
  document.querySelectorAll(".btn, .card, .admin-fab").forEach(shake);
});

adminFab.addEventListener("click", () => openModal(adminModal));

document.querySelectorAll("[data-close]").forEach(btn => {
  btn.addEventListener("click", () => closeModal(document.querySelector(btn.dataset.close)));
});

btnAdminLogin.addEventListener("click", () => {
  const u = adminUser.value.trim();
  const p = adminPass.value;

  if (u !== ADMIN_USER || p !== ADMIN_PASS) {
    adminLoginHint.textContent = "Login yoki parol noto‘g‘ri!";
    shake(adminLoginWrap);
    return;
  }

  state.adminLogged = true;
  localStorage.setItem(KEY.admin, "1");
  adminLoginHint.textContent = "";
  toast("Admin kirdi.");
  renderAdmin();
});

btnAdminLogout.addEventListener("click", () => {
  state.adminLogged = false;
  localStorage.removeItem(KEY.admin);
  toast("Admin chiqdi.");
  renderAdmin();
});

btnSaveClass.addEventListener("click", () => {
  if (!state.adminLogged) return;

  const url = videoLink.value.trim();
  const dt = classDatetime.value;

  if (!url) return shakeAndMsg(videoLink, "Video link kiriting.");
  if (!dt) return shakeAndMsg(classDatetime, "Dars vaqtini belgilang.");

  state.classConfig.videoUrl = url;
  state.classConfig.startAt = dt; // datetime-local string
  saveState();

  toast("Dars sozlamalari saqlandi.");
  renderAll();
});

// ============ STATE ============
function loadState(){
  const u = localStorage.getItem(KEY.user);
  const a = localStorage.getItem(KEY.admin);
  const c = localStorage.getItem(KEY.classConfig);

  state.user = u ? JSON.parse(u) : null;
  state.adminLogged = !!a;

  if (c) {
    try { state.classConfig = JSON.parse(c); } catch {}
  }
  // joined ni ham saqlab qo‘yamiz
  const joined = localStorage.getItem("kr_joined");
  state.joined = joined === "1";
}

function saveState(){
  localStorage.setItem(KEY.user, JSON.stringify(state.user || null));
  localStorage.setItem(KEY.classConfig, JSON.stringify(state.classConfig));
  localStorage.setItem("kr_joined", state.joined ? "1" : "0");
}

// ============ RENDER ============
function renderAll(){
  // 1) Join va player locked/unlocked
  const isRegistered = !!state.user;
  const canJoin = isRegistered;
  const canWatch = isRegistered && state.joined;

  // Lock join until registered
  toggleLocked(joinCard, !canJoin);
  toggleLocked(playerCard, !canWatch);

  // Fill saved user fields
  if (state.user){
    regName.value = state.user.name || "";
    regPhone.value = state.user.phone || "";
  }

  // Class info
  renderClassInfo();

  // Player
  renderPlayer();

  // Admin
  renderAdmin();

  // Hints
  regHint.textContent = isRegistered
    ? `Ro‘yxatdan o‘tdingiz: ${state.user.name} (${state.user.phone})`
    : "Avval ro‘yxatdan o‘ting, keyin darsga kirasiz.";

  joinHint.textContent = canWatch
    ? "Dars boshlanishini kutyapmiz…"
    : "Ro‘yxatdan o‘ting, so‘ng Join qiling.";
}

function renderClassInfo(){
  const { videoUrl, startAt } = state.classConfig;

  classTimeText.textContent = startAt ? formatLocalDT(startAt) : "Hali belgilanmagan";
  classVideoText.textContent = videoUrl ? shortUrl(videoUrl) : "Hali link yo‘q";

  // Admin preview
  const p1 = startAt ? `Dars: ${formatLocalDT(startAt)}` : "Dars: —";
  const p2 = videoUrl ? `Video: ${shortUrl(videoUrl)}` : "Video: —";
  adminPreviewText.textContent = `${p1} | ${p2}`;

  // Admin input fill
  if (state.adminLogged){
    videoLink.value = videoUrl || "";
    classDatetime.value = startAt || "";
  }
}

function renderPlayer(){
  const { videoUrl, startAt } = state.classConfig;
  const canWatch = !!state.user && state.joined;

  // default
  videoFrame.style.display = "none";
  playerEmpty.style.display = "grid";

  if (!canWatch){
    playerHint.textContent = "Join qilingandan keyin darsga kira olasiz.";
    return;
  }

  if (!videoUrl || !startAt){
    playerHint.textContent = "Admin dars linki va vaqtini qo‘ymagan.";
    return;
  }

  const now = new Date();
  const startTime = toDateFromDatetimeLocal(startAt);

  if (now < startTime){
    const diffMin = Math.ceil((startTime - now) / 60000);
    playerHint.textContent = `Dars boshlanishi: ${formatLocalDT(startAt)} (taxminan ${diffMin} daqiqa qoldi)`;
    return;
  }

  // Dars boshlandi
  const embed = toEmbedUrl(videoUrl);
  videoFrame.src = embed;
  videoFrame.style.display = "block";
  playerEmpty.style.display = "none";
  playerHint.textContent = "Dars boshlandi! 🎥";

  // avtomatik darsga “kirish”: playerga scroll
  scrollTo(playerCard);

  // autoplay har doim ishlamasligi mumkin (brauzer cheklaydi)
}

function renderAdmin(){
  if (state.adminLogged){
    adminLoginWrap.classList.add("hidden");
    adminPanelWrap.classList.remove("hidden");
  } else {
    adminLoginWrap.classList.remove("hidden");
    adminPanelWrap.classList.add("hidden");
  }
}

// ============ AUTO WATCHER ============
function startAutoWatcher(){
  // Har 5 sekund tekshiradi: dars boshlanganmi
  setInterval(() => {
    // faqat join bo‘lsa
    if (!state.user || !state.joined) return;
    // player holatini yangilab turamiz
    renderPlayer();
  }, 5000);
}

// ============ HELPERS ============
function openModal(m){
  m.classList.add("show");
  m.setAttribute("aria-hidden","false");
}
function closeModal(m){
  m.classList.remove("show");
  m.setAttribute("aria-hidden","true");
}

function toggleLocked(node, locked){
  node.classList.toggle("locked", locked);
}

function scrollTo(node){
  node.scrollIntoView({behavior:"smooth", block:"start"});
}

function shake(node){
  node.classList.remove("shake");
  void node.offsetWidth;
  node.classList.add("shake");
}

function toast(msg){
  const t = document.createElement("div");
  t.textContent = msg;
  t.style.position="fixed";
  t.style.bottom="16px";
  t.style.left="16px";
  t.style.padding="12px 14px";
  t.style.borderRadius="14px";
  t.style.background="rgba(255,255,255,.88)";
  t.style.border="1px solid rgba(0,0,0,.10)";
  t.style.boxShadow="0 18px 40px rgba(0,0,0,.20)";
  t.style.zIndex="999";
  document.body.appendChild(t);
  setTimeout(()=>{ t.style.opacity="0"; t.style.transition="opacity .25s"; }, 1400);
  setTimeout(()=>{ t.remove(); }, 1800);
}

function shakeAndMsg(input, msg){
  shake(input);
  toast(msg);
}

function validUzPhone(p){
  // oddiy tekshiruv: +998 va kamida 13 ta belgidan iborat
  return p.startsWith("+998") && p.length >= 13;
}

function shortUrl(u){
  try{
    const url = new URL(u);
    return url.hostname + url.pathname;
  } catch {
    return u.length > 28 ? u.slice(0,28) + "…" : u;
  }
}

function formatLocalDT(dtLocal){
  // dtLocal: "YYYY-MM-DDTHH:mm"
  const d = toDateFromDatetimeLocal(dtLocal);
  return d.toLocaleString();
}

function toDateFromDatetimeLocal(dtLocal){
  // Local time sifatida parse qilamiz
  // "2026-02-10T21:30" -> new Date(2026,1,10,21,30)
  const [datePart, timePart] = dtLocal.split("T");
  const [y,m,day] = datePart.split("-").map(Number);
  const [hh,mm] = timePart.split(":").map(Number);
  return new Date(y, m-1, day, hh, mm, 0, 0);
}

function toEmbedUrl(url){
  // YouTube link bo‘lsa embedga aylantiradi
  // autoplay qo‘shib ko‘ramiz (hamma brauzer ruxsat bermaydi)
  try{
    const u = new URL(url);

    // youtu.be/ID
    if (u.hostname.includes("youtu.be")){
      const id = u.pathname.replace("/","");
      return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1`;
    }

    // youtube.com/watch?v=ID
    if (u.hostname.includes("youtube.com")){
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}?autoplay=1&mute=1`;

      // allaqachon embed bo‘lsa
      if (u.pathname.includes("/embed/")) {
        const base = url.split("?")[0];
        return `${base}?autoplay=1&mute=1`;
      }
    }
// =====================
// DEMO SECURITY NOTE:
// admin login/parol frontenda turibdi (demo). Real loyihada backend shart.
// =====================

const ADMIN_USER = "Madina";
const ADMIN_PASS = "Madina1905!";

const KEY = {
  user: "kr_user",
  admin: "kr_admin_logged",
  classConfig: "kr_class_config",
};

const state = {
  user: null,
  adminLogged: false,
  classConfig: {
    roomName: "",     // Jitsi room
    startAt: "",      // datetime-local
  },
  joined: false,
};

// Jitsi instance
let jitsiApi = null;

const el = (id) => document.getElementById(id);

// UI
const registerCard = el("registerCard");
const joinCard = el("joinCard");
const playerCard = el("playerCard");

const regName = el("regName");
const regPhone = el("regPhone");
const regHint = el("regHint");

const studentName = el("studentName");
const joinHint = el("joinHint");

const classTimeText = el("classTimeText");
const classVideoText = el("classVideoText");

const playerHint = el("playerHint");
const playerEmpty = el("playerEmpty");

// Jitsi container uses the same player box
const playerBox = el("playerBox");

// Admin
const adminFab = el("adminFab");
const adminModal = el("adminModal");
const adminLoginWrap = el("adminLogin");
const adminPanelWrap = el("adminPanel");

const adminUser = el("adminUser");
const adminPass = el("adminPass");
const adminLoginHint = el("adminLoginHint");

// NEW: room name input
const roomName = el("roomName");
const classDatetime = el("classDatetime");
const adminPreviewText = el("adminPreviewText");

// Buttons
const btnRegister = el("btnRegister");
const btnJoin = el("btnJoin");
const btnLogout = el("btnLogout");
const btnTestShake = el("btnTestShake");

const btnAdminLogin = el("btnAdminLogin");
const btnSaveClass = el("btnSaveClass");
const btnAdminLogout = el("btnAdminLogout");

// ============ INIT ============
loadState();
renderAll();
startAutoWatcher();

// ============ EVENTS ============
btnRegister.addEventListener("click", () => {
  if (!regName.value.trim()) return shakeAndMsg(regName, "Ismni kiriting.");
  if (!validUzPhone(regPhone.value.trim())) return shakeAndMsg(regPhone, "Telefonni +998... formatda kiriting.");

  state.user = { name: regName.value.trim(), phone: regPhone.value.trim() };
  saveState();
  toast("Ro‘yxatdan o‘tildi!");
  renderAll();
  scrollTo(joinCard);
});

btnJoin.addEventListener("click", () => {
  if (!state.user) {
    toast("Avval ro‘yxatdan o‘ting.");
    shake(registerCard);
    scrollTo(registerCard);
    return;
  }
  if (!studentName.value.trim()) return shakeAndMsg(studentName, "Darsdagi ismingizni kiriting.");

  state.joined = true;
  saveState();
  toast("Join qilindi! Dars vaqti kelganda avtomatik ochiladi.");
  renderAll();
  scrollTo(playerCard);
});

btnLogout.addEventListener("click", () => {
  state.user = null;
  state.joined = false;
  saveState();
  destroyJitsi();
  toast("Chiqildi.");
  renderAll();
  scrollTo(registerCard);
});

btnTestShake.addEventListener("click", () => {
  document.querySelectorAll(".btn, .card, .admin-fab").forEach(shake);
});

adminFab.addEventListener("click", () => openModal(adminModal));

document.querySelectorAll("[data-close]").forEach(btn => {
  btn.addEventListener("click", () => closeModal(document.querySelector(btn.dataset.close)));
});

btnAdminLogin.addEventListener("click", () => {
  const u = adminUser.value.trim();
  const p = adminPass.value;

  if (u !== ADMIN_USER || p !== ADMIN_PASS) {
    adminLoginHint.textContent = "Login yoki parol noto‘g‘ri!";
    shake(adminLoginWrap);
    return;
  }

  state.adminLogged = true;
  localStorage.setItem(KEY.admin, "1");
  adminLoginHint.textContent = "";
  toast("Admin kirdi.");
  renderAdmin();
});

btnAdminLogout.addEventListener("click", () => {
  state.adminLogged = false;
  localStorage.removeItem(KEY.admin);
  toast("Admin chiqdi.");
  renderAdmin();
});

btnSaveClass.addEventListener("click", () => {
  if (!state.adminLogged) return;

  const rn = (roomName.value || "").trim();
  const dt = classDatetime.value;

  if (!rn) return shakeAndMsg(roomName, "Jitsi xona nomini kiriting.");
  if (!dt) return shakeAndMsg(classDatetime, "Dars vaqtini belgilang.");

  state.classConfig.roomName = rn;
  state.classConfig.startAt = dt;
  saveState();

  toast("Dars sozlamalari saqlandi.");
  renderAll();
});

// ============ STATE ============
function loadState(){
  const u = localStorage.getItem(KEY.user);
  const a = localStorage.getItem(KEY.admin);
  const c = localStorage.getItem(KEY.classConfig);

  state.user = u ? JSON.parse(u) : null;
  state.adminLogged = !!a;

  if (c) {
    try { state.classConfig = JSON.parse(c); } catch {}
  }

  const joined = localStorage.getItem("kr_joined");
  state.joined = joined === "1";
}

function saveState(){
  localStorage.setItem(KEY.user, JSON.stringify(state.user || null));
  localStorage.setItem(KEY.classConfig, JSON.stringify(state.classConfig));
  localStorage.setItem("kr_joined", state.joined ? "1" : "0");
}

// ============ RENDER ============
function renderAll(){
  const isRegistered = !!state.user;
  const canJoin = isRegistered;
  const canWatch = isRegistered && state.joined;

  toggleLocked(joinCard, !canJoin);
  toggleLocked(playerCard, !canWatch);

  if (state.user){
    regName.value = state.user.name || "";
    regPhone.value = state.user.phone || "";
  }

  renderClassInfo();
  renderPlayer();
  renderAdmin();

  regHint.textContent = isRegistered
    ? `Ro‘yxatdan o‘tdingiz: ${state.user.name} (${state.user.phone})`
    : "Avval ro‘yxatdan o‘ting, keyin darsga kirasiz.";

  joinHint.textContent = canWatch
    ? "Dars boshlanishini kutyapmiz…"
    : "Ro‘yxatdan o‘ting, so‘ng Join qiling.";
}

function renderClassInfo(){
  const { roomName: rn, startAt } = state.classConfig;

  classTimeText.textContent = startAt ? formatLocalDT(startAt) : "Hali belgilanmagan";
  classVideoText.textContent = rn ? `meet.jit.si/${rn}` : "Hali xona yo‘q";

  const p1 = startAt ? `Dars: ${formatLocalDT(startAt)}` : "Dars: —";
  const p2 = rn ? `Xona: ${rn}` : "Xona: —";
  adminPreviewText.textContent = `${p1} | ${p2}`;

  if (state.adminLogged){
    roomName.value = rn || "";
    classDatetime.value = startAt || "";
  }
}

function renderPlayer(){
  const { roomName: rn, startAt } = state.classConfig;
  const canWatch = !!state.user && state.joined;

  // default UI
  playerEmpty.style.display = "grid";

  if (!canWatch){
    playerHint.textContent = "Join qilingandan keyin darsga kira olasiz.";
    destroyJitsi();
    return;
  }

  if (!rn || !startAt){
    playerHint.textContent = "Admin dars xonasi va vaqtini qo‘ymagan.";
    destroyJitsi();
    return;
  }

  const now = new Date();
  const startTime = toDateFromDatetimeLocal(startAt);

  if (now < startTime){
    const diffMin = Math.ceil((startTime - now) / 60000);
    playerHint.textContent = `Dars boshlanishi: ${formatLocalDT(startAt)} (taxminan ${diffMin} daqiqa qoldi)`;
    destroyJitsi();
    return;
  }

  // Dars boshlandi
  playerHint.textContent = "Dars boshlandi! (Jitsi) 🎥";
  playerEmpty.style.display = "none";
  scrollTo(playerCard);

  // Jitsi embed
  startJitsi(rn, state.user?.name || "Student");
}

function renderAdmin(){
  if (state.adminLogged){
    adminLoginWrap.classList.add("hidden");
    adminPanelWrap.classList.remove("hidden");
  } else {
    adminLoginWrap.classList.remove("hidden");
    adminPanelWrap.classList.add("hidden");
  }
}

// ============ JITSI ============
function startJitsi(room, displayName){
  // already started
  if (jitsiApi) return;

  if (typeof JitsiMeetExternalAPI === "undefined") {
    toast("Jitsi API yuklanmadi. Internetni tekshiring.");
    return;
  }

  // Clean container
  destroyJitsi();

  // Jitsi UI size
  const domain = "meet.jit.si";
  const options = {
    roomName: room,
    parentNode: playerBox,
    width: "100%",
    height: 420,
    userInfo: { displayName },
    configOverwrite: {
      prejoinPageEnabled: false, // imkon qadar tez kirish
    },
    interfaceConfigOverwrite: {
      SHOW_JITSI_WATERMARK: false,
      SHOW_WATERMARK_FOR_GUESTS: false,
    }
  };

  jitsiApi = new JitsiMeetExternalAPI(domain, options);
}

function destroyJitsi(){
  if (jitsiApi){
    try { jitsiApi.dispose(); } catch {}
    jitsiApi = null;
  }

  // Remove leftover iframes created by Jitsi
  // (Jitsi creates iframe(s) inside parentNode)
  if (playerBox){
    // leave playerEmpty visible control by renderPlayer
    const iframes = playerBox.querySelectorAll("iframe");
    iframes.forEach(f => f.remove());
  }
}

// ============ AUTO WATCHER ============
function startAutoWatcher(){
  setInterval(() => {
    if (!state.user || !state.joined) return;
    renderPlayer();
  }, 5000);
}

// ============ HELPERS ============
function openModal(m){
  m.classList.add("show");
  m.setAttribute("aria-hidden","false");
}
function closeModal(m){
  m.classList.remove("show");
  m.setAttribute("aria-hidden","true");
}

function toggleLocked(node, locked){
  node.classList.toggle("locked", locked);
}

function scrollTo(node){
  node.scrollIntoView({behavior:"smooth", block:"start"});
}

function shake(node){
  node.classList.remove("shake");
  void node.offsetWidth;
  node.classList.add("shake");
}

function toast(msg){
  const t = document.createElement("div");
  t.textContent = msg;
  t.style.position="fixed";
  t.style.bottom="16px";
  t.style.left="16px";
  t.style.padding="12px 14px";
  t.style.borderRadius="14px";
  t.style.background="rgba(255,255,255,.88)";
  t.style.border="1px solid rgba(0,0,0,.10)";
  t.style.boxShadow="0 18px 40px rgba(0,0,0,.20)";
  t.style.zIndex="999";
  document.body.appendChild(t);
  setTimeout(()=>{ t.style.opacity="0"; t.style.transition="opacity .25s"; }, 1400);
  setTimeout(()=>{ t.remove(); }, 1800);
}

function shakeAndMsg(input, msg){
  shake(input);
  toast(msg);
}

function validUzPhone(p){
  return p.startsWith("+998") && p.length >= 13;
}

function formatLocalDT(dtLocal){
  const d = toDateFromDatetimeLocal(dtLocal);
  return d.toLocaleString();
}

function toDateFromDatetimeLocal(dtLocal){
  const [datePart, timePart] = dtLocal.split("T");
  const [y,m,day] = datePart.split("-").map(Number);
  const [hh,mm] = timePart.split(":").map(Number);
  return new Date(y, m-1, day, hh, mm, 0, 0);
}

    // Boshqa video host bo‘lsa — shunchaki url (iframe ichida ishlashi hostga bog‘liq)
    return url;
  } catch {
    return url;
  }
}
