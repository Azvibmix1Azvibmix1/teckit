// script.js - المنطق المطور

const usersDB = {
    'admin': { pass: '123', role: 'admin', name: 'ابو عمر' },
    'employee':  { pass: '123', role: 'employee', name: 'الموظف أحمد' }
};

function handleLogin(event) {
    event.preventDefault();
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;

    if (usersDB[u] && usersDB[u].pass === p) {
        localStorage.setItem('currentUser', JSON.stringify(usersDB[u]));
        window.location.href = 'dashboard.html';
    } else {
        alert('بيانات الدخول غير صحيحة!');
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

function initDashboard() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) { window.location.href = 'index.html'; return; }
    document.getElementById('welcomeMsg').innerText = `أهلاً، ${user.name}`;
    renderTickets();
}

// إدارة التذاكر
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
        status: 'جديد', // الحالة الافتراضية
        reporter: user.name,
        date: new Date().toLocaleDateString('ar-SA')
    };
    tickets.unshift(newTicket);
    saveAndRender();
    e.target.reset();
    alert("تم إرسال التذكرة");
}

function updateStatus(id, newStatus) {
    // رسالة تأكيد قبل الإلغاء
    if (newStatus === 'ملغاة' && !confirm('هل أنت متأكد من إلغاء هذه التذكرة؟')) return;

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
    const user = JSON.parse(localStorage.getItem('currentUser'));

    tickets.forEach(t => {
        // 1. تحديد لون شارة الحالة (Badge Color)
        let statusClass = 'status-new';
        if (t.status === 'تم الحل') statusClass = 'status-solved';
        else if (t.status === 'تم التصعيد') statusClass = 'status-escalated';
        else if (t.status === 'معلقة') statusClass = 'status-suspended';
        else if (t.status === 'ملغاة') statusClass = 'status-cancelled';

        // 2. أزرار الإجراءات (تظهر للمدير فقط)
        let actions = '';
        if (user.role === 'admin') {
            // إذا كانت التذكرة مغلقة أو ملغاة، لا تظهر الأزرار لعدم الازدحام (اختياري)
            if (t.status !== 'تم الحل' && t.status !== 'ملغاة') {
                actions = `
                    <div style="display:flex; gap:5px; flex-wrap:wrap;">
                        <button onclick="updateStatus(${t.id}, 'تم الحل')" class="btn btn-solve" title="حل المشكلة">✅ حل</button>
                        <button onclick="updateStatus(${t.id}, 'تم التصعيد')" class="btn btn-escalate" title="تحويل لمستوى أعلى">⚠️ تصعيد</button>
                        <button onclick="updateStatus(${t.id}, 'معلقة')" class="btn btn-suspend" title="إيقاف مؤقت">⏸️ تعليق</button>
                        <button onclick="updateStatus(${t.id}, 'ملغاة')" class="btn btn-cancel" title="إلغاء الطلب">❌ إلغاء</button>
                    </div>
                `;
            } else {
                actions = '<span style="color:#888; font-size:0.9rem;">تمت الأرشفة</span>';
            }
        } else {
            actions = '<span style="color:#888">انتظار المراجعة</span>';
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