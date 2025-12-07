// script.js - نسخة مبسطة (دخول مباشر)

// 1. دالة تسجيل الدخول (تقبل أي شيء)
function handleLogin(event) {
    event.preventDefault();
    const u = document.getElementById('username').value;
    
    // إنشاء مستخدم "مدير" دائماً بغض النظر عن المدخلات
    const user = {
        name: u || "المدير", // استخدام الاسم المدخل أو كلمة "المدير"
        role: 'admin'       // إعطاء صلاحية المدير دائماً لإظهار كل الأزرار
    };

    // حفظ المستخدم والدخول
    localStorage.setItem('currentUser', JSON.stringify(user));
    window.location.href = 'dashboard.html';
}

// 2. دالة تسجيل الخروج
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// 3. تهيئة الداشبورد
function initDashboard() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    // إذا لم يكن هناك مستخدم، أعده لصفحة الدخول
    if (!user) { window.location.href = 'index.html'; return; }
    
    document.getElementById('welcomeMsg').innerText = `أهلاً بك، ${user.name}`;
    renderTickets();
}

// 4. إدارة التذاكر
let tickets = JSON.parse(localStorage.getItem('ticketsData')) || [];

function addTicket(e) {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('currentUser'));
    
    const newTicket = {
        id: Math.floor(Math.random() * 9000) + 1000,
        title: document.getElementById('tTitle').value,
        desc: document.getElementById('tDesc').value,
        priority: document.getElementById('tPriority').value,
        category: document.getElementById('tCategory').value,
        status: 'جديد',
        reporter: user.name,
        date: new Date().toLocaleDateString('ar-SA')
    };

    tickets.unshift(newTicket);
    saveAndRender();
    e.target.reset();
    alert("تم إرسال التذكرة");
}

function updateStatus(id, newStatus) {
    // رسالة تأكيد عند الإلغاء فقط
    if (newStatus === 'ملغاة' && !confirm('هل أنت متأكد من الإلغاء؟')) return;

    const ticket = tickets.find(t => t.id === id);
    if (ticket) {
        ticket.status = newStatus;
        saveAndRender();
    }
}

function saveAndRender() {
    localStorage.setItem('ticketsData', JSON.stringify(tickets));
    renderTickets();
}

function renderTickets() {
    const tbody = document.getElementById('ticketBody');
    if(!tbody) return;
    
    tbody.innerHTML = '';

    tickets.forEach(t => {
        // تحديد لون الحالة
        let statusClass = 'status-new';
        if (t.status === 'تم الحل') statusClass = 'status-solved';
        else if (t.status === 'تم التصعيد') statusClass = 'status-escalated';
        else if (t.status === 'معلقة') statusClass = 'status-suspended';
        else if (t.status === 'ملغاة') statusClass = 'status-cancelled';

        // عرض الأزرار دائماً لأنك الآن "مدير" دائماً
        let actions = '';
        if (t.status !== 'تم الحل' && t.status !== 'ملغاة') {
            actions = `
                <div style="display:flex; gap:5px; flex-wrap:wrap;">
                    <button onclick="updateStatus(${t.id}, 'تم الحل')" class="btn btn-solve">✅ حل</button>
                    <button onclick="updateStatus(${t.id}, 'تم التصعيد')" class="btn btn-escalate">⚠️ تصعيد</button>
                    <button onclick="updateStatus(${t.id}, 'معلقة')" class="btn btn-suspend">⏸️ تعليق</button>
                    <button onclick="updateStatus(${t.id}, 'ملغاة')" class="btn btn-cancel">❌ إلغاء</button>
                </div>
            `;
        } else {
            actions = '<span style="color:#888;">مؤرشفة</span>';
        }

        const row = `
            <tr>
                <td>#${t.id}</td>
                <td>${t.date}</td>
                <td><strong>${t.title}</strong><br><small>${t.category}</small></td>
                <td>${t.priority}</td>
                <td><span class="badge ${statusClass}">${t.status}</span></td>
                <td>${actions}</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}
