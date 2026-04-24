const SERVICE_ID = "service_v7h7fxr";
const TEMPLATE_ID = "template_67ot81e";
const PUBLIC_KEY = "9lV46HsICwMAusTUu";
const DB_URL = "https://oqdoqwfjiqdds-default-rtdb.firebaseio.com";
const DB_SECRET = "EdJL2UmQIxDt8WaeJwgW5XVPWh2CIo5US3BNs2Nz";
const HF_SRV = "https://markliytyh-server.hf.space";

// Инициализация EmailJS
emailjs.init(PUBLIC_KEY);
let gOTP, tUser, isRegMode = false;

// Делаем функции глобальными, чтобы onclick в HTML их видел
window.openT = function(e, id) {
    document.querySelectorAll('.container').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(x => x.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    if(e) e.currentTarget.classList.add('active');
}

window.switchAuth = function(id) {
    document.querySelectorAll('.container').forEach(x => x.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

async function getIP() {
    try {
        const r = await fetch('https://api.ipify.org?format=json');
        const d = await r.json(); return d.ip;
    } catch(e) { return "unknown"; }
}

window.register = async function() {
    const email = document.getElementById('r-email').value.trim(), 
          pass = document.getElementById('r-pass').value, 
          conf = document.getElementById('r-conf').value, 
          msg = document.getElementById('r-msg');

    if(pass !== conf) { msg.innerText = "Passwords don't match"; msg.style.display="block"; return; }
    if(!email.includes('@')) { msg.innerText = "Invalid Email"; msg.style.display="block"; return; }

    try {
        const ip = await getIP(), res = await fetch(`${DB_URL}/users.json?auth=${DB_SECRET}`), all = await res.json() || {};
        for(let k in all) if(all[k].ip === ip) { msg.innerText = "IP Limit reached"; msg.style.display = "block"; return; }
        const folder = email.replace(/\./g, ',');
        if(all[folder]) { msg.innerText = "Email taken"; msg.style.display = "block"; return; }

        gOTP = Math.floor(100000 + Math.random() * 900000).toString();
        tUser = { email, password: pass, ip, role: "user" };
        isRegMode = true;

        emailjs.send(SERVICE_ID, TEMPLATE_ID, { to_email: email, code: gOTP }).then(() => {
            document.getElementById('otp-title').innerText = "Verify Register";
            window.switchAuth('t-otp');
        }, () => { msg.innerText="Email Service Error"; msg.style.display="block"; });
    } catch(e) { msg.innerText="Firebase Error"; msg.style.display="block"; }
}

window.login = async function() {
    const email = document.getElementById('l-email').value.trim(), 
          pass = document.getElementById('l-pass').value, 
          msg = document.getElementById('l-msg');
    try {
        const r = await fetch(`${DB_URL}/users/${email.replace(/\./g, ',')}.json?auth=${DB_SECRET}`), u = await r.json();
        if(!u || u.password !== pass) { msg.innerText="Invalid credentials"; msg.style.display="block"; return; }

        gOTP = Math.floor(100000 + Math.random() * 900000).toString();
        tUser = u;
        isRegMode = false;

        emailjs.send(SERVICE_ID, TEMPLATE_ID, { to_email: email, code: gOTP }).then(() => {
            document.getElementById('otp-title').innerText = "Verify Login";
            window.switchAuth('t-otp');
        }, () => { msg.innerText="Email Send Error"; msg.style.display="block"; });
    } catch(e) { msg.innerText="Error"; msg.style.display="block"; }
}

window.verify = async function() {
    if(document.getElementById('otp-code').value === gOTP) {
        if(isRegMode) {
            const folder = tUser.email.replace(/\./g, ',');
            await fetch(`${DB_URL}/users/${folder}.json?auth=${DB_SECRET}`, { 
                method: 'PUT', body: JSON.stringify(tUser) 
            });
        }
        localStorage.setItem('session', JSON.stringify(tUser));
        window.location.reload();
    } else {
        alert("Wrong code!");
    }
}

window.loadU = function(u) {
    document.getElementById('b-auth').style.display='none';
    document.getElementById('b-user').style.display='flex';
    document.getElementById('u-name').innerText = u.email;
    document.getElementById('u-role').innerText = (u.role || "user").toUpperCase();
    if(u.role && u.role.toLowerCase() === 'wandbuyer') {
        document.getElementById('b-special').style.display = 'flex';
    }
}

window.logout = function() { localStorage.removeItem('session'); window.location.reload(); }
window.downloadAndExit = function() {
    window.open('https://www.dropbox.com/scl/fi/t6mkqc3q7mrthfrmr44vw/WandProjectSN.zip?dl=1', '_blank');
}

// Статус через твой сервер Hugging Face
async function checkSt() {
    const el = document.getElementById('st-val');
    try {
        const r = await fetch(`${HF_SRV}/check-status`);
        const d = await r.json();
        const up = (d.status === "working");
        el.innerText = up ? "ONLINE" : "OFFLINE";
        el.style.color = up ? "#00ff96" : "#ff4444";
    } catch(e) { el.innerText = "OFFLINE"; el.style.color = "#ff4444"; }
}

window.onload = () => {
    const s = localStorage.getItem('session');
    if(s) window.loadU(JSON.parse(s));

    document.getElementById('b-main').onclick = (e) => window.openT(e, 't-main');
    document.getElementById('b-info').onclick = (e) => window.openT(e, 't-info');
    document.getElementById('b-auth').onclick = (e) => window.openT(e, 't-auth');
    document.getElementById('b-user').onclick = (e) => window.openT(e, 't-user');
    document.getElementById('b-special').onclick = (e) => window.openT(e, 't-special');
    document.getElementById('b-dsc').onclick = () => window.open('https://discord.gg/VPGsJDFhKZ', '_blank');

    checkSt();
};