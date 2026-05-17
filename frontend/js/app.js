var API = 'http://127.0.0.1:8000/api';
var TOKEN = localStorage.getItem('access_token');

function authHeaders() {
    return { 'Authorization': 'Bearer ' + TOKEN, 'Content-Type': 'application/json' };
}

function requireAuth() {
    if (!TOKEN) {
        window.location.hash = '/login';
        return false;
    }
    return true;
}

// ===================== ROUTER =====================
function route() {
    var hash = window.location.hash.slice(1) || '/';
    var content = document.getElementById('content');
    var navbar = document.getElementById('navbar');

    if (TOKEN) {
        navbar.innerHTML = '<div style="background:white;padding:15px 30px;display:flex;justify-content:space-between;box-shadow:0 1px 3px rgba(0,0,0,0.1);">' +
            '<a href="#" onclick="goHome()" style="font-size:22px;font-weight:800;color:#073B5A;text-decoration:none;">🚌 BusTicket</a>' +
            '<div style="display:flex;gap:15px;align-items:center;">' +
            '<a href="#" onclick="goToDash()" style="color:#073B5A;text-decoration:none;">Dashboard</a>' +
            '<button onclick="logout()" style="padding:8px 16px;background:#dc2626;color:white;border:none;border-radius:6px;cursor:pointer;">Logout</button>' +
            '</div></div>';
    } else {
        navbar.innerHTML = '<div style="background:white;padding:15px 30px;display:flex;justify-content:space-between;box-shadow:0 1px 3px rgba(0,0,0,0.1);">' +
            '<a href="#" onclick="goHome()" style="font-size:22px;font-weight:800;color:#073B5A;text-decoration:none;">🚌 BusTicket</a>' +
            '<div style="display:flex;gap:15px;">' +
            '<a href="#/login" style="color:#073B5A;text-decoration:none;padding:8px 16px;">Sign In</a>' +
            '<a href="#/register" style="background:#11B5C9;color:white;padding:8px 16px;border-radius:6px;text-decoration:none;">Register</a>' +
            '</div></div>';
    }

    if (hash === '/' || hash === '') showLanding();
    else if (hash === '/login') showLogin();
    else if (hash === '/register') showRegister();
    else if (hash === '/passenger') { if (requireAuth()) showPassengerDash(); }
    else if (hash === '/admin') { if (requireAuth()) showAdminDash(); }
    else if (hash === '/booking') { if (requireAuth()) showBooking(); }
    else if (hash === '/complaints') { if (requireAuth()) showComplaints(); }
    else if (hash === '/admin/buses') { if (requireAuth()) showAdminBuses(); }
    else if (hash === '/admin/routes') { if (requireAuth()) showAdminRoutes(); }
    else if (hash === '/admin/schedules') { if (requireAuth()) showAdminSchedules(); }
    else if (hash === '/admin/complaints') { if (requireAuth()) showAdminComplaints(); }
    else if (hash === '/admin/reports') { if (requireAuth()) showAdminReports(); }
    else showLanding();
}

window.addEventListener('hashchange', route);
window.addEventListener('load', route);

function goHome() { window.location.hash = '/'; }
function goToDash() {
    if (!requireAuth()) return;
    fetch(API + '/auth/me/', { headers: authHeaders() })
        .then(r => r.json())
        .then(u => window.location.hash = (u.roles||[]).indexOf('Admin')>=0 ? '/admin' : '/passenger');
}
function logout() { localStorage.removeItem('access_token'); TOKEN = null; window.location.hash = '/'; }

// ===================== LANDING =====================
function showLanding() {
    document.getElementById('content').innerHTML =
        '<section style="background:linear-gradient(135deg,#073B5A,#11B5C9);color:white;padding:80px 20px;text-align:center;">' +
        '<h1 style="font-size:48px;">Travel South Africa by bus</h1>' +
        '<p style="font-size:20px;margin:20px 0;">From Joburg to Cape Town, Durban to Pretoria.</p>' +
        '<a href="#/register" style="background:white;color:#073B5A;padding:14px 30px;border-radius:8px;text-decoration:none;font-weight:700;font-size:18px;">Get Started</a></section>' +
        '<section style="padding:60px;max-width:1000px;margin:auto;"><h2 style="text-align:center;">Why BusTicket?</h2>' +
        '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:30px;">' +
        '<div style="background:white;padding:30px;border-radius:12px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.1);"><h3>🚌 Nationwide</h3><p>All SA routes</p></div>' +
        '<div style="background:white;padding:30px;border-radius:12px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.1);"><h3>⚡ Instant QR</h3><p>Book in seconds</p></div>' +
        '<div style="background:white;padding:30px;border-radius:12px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.1);"><h3>🔒 Secure</h3><p>Bank-grade security</p></div></div></section>';
}

// ===================== LOGIN =====================
function showLogin() {
    document.getElementById('content').innerHTML =
        '<div style="display:flex;justify-content:center;align-items:center;min-height:80vh;background:#f5f5f5;">' +
        '<div style="background:white;padding:40px;border-radius:12px;width:400px;box-shadow:0 4px 12px rgba(0,0,0,0.1);">' +
        '<h2 style="text-align:center;color:#073B5A;">Sign In</h2>' +
        '<div id="login-error" style="display:none;background:#fee;color:red;padding:10px;border-radius:6px;margin:15px 0;"></div>' +
        '<input id="login-user" placeholder="Username" style="width:100%;padding:12px;margin-bottom:12px;border:1px solid #ddd;border-radius:6px;box-sizing:border-box;">' +
        '<input id="login-pass" type="password" placeholder="Password" style="width:100%;padding:12px;margin-bottom:20px;border:1px solid #ddd;border-radius:6px;box-sizing:border-box;">' +
        '<button onclick="login()" style="width:100%;padding:14px;background:#11B5C9;color:white;border:none;border-radius:6px;font-size:16px;cursor:pointer;font-weight:700;">Sign In</button>' +
        '<p style="text-align:center;margin-top:15px;"><a href="#/register">Create account</a></p></div></div>';
}
function login() {
    var u = document.getElementById('login-user').value;
    var p = document.getElementById('login-pass').value;
    var err = document.getElementById('login-error');
    fetch(API+'/auth/login/',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:u,password:p})})
    .then(r=>r.json().then(d=>({ok:r.ok,data:d})))
    .then(res=>{
        if(!res.ok) throw new Error(res.data.detail||'Invalid credentials');
        TOKEN = res.data.access;
        localStorage.setItem('access_token', TOKEN);
        return fetch(API+'/auth/me/',{headers:authHeaders()});
    })
    .then(r=>r.json())
    .then(u=>{
        window.location.hash = (u.roles||[]).indexOf('Admin')>=0 ? '/admin' : '/passenger';
    })
    .catch(e=>{err.style.display='block';err.textContent=e.message});
}

// ===================== REGISTER WITH FULL ADDRESS =====================
function showRegister() {
    document.getElementById('content').innerHTML =
        '<div style="display:flex;justify-content:center;align-items:center;min-height:80vh;background:#f5f5f5;padding:20px;">' +
        '<div style="background:white;padding:40px;border-radius:12px;width:500px;max-width:100%;box-shadow:0 4px 12px rgba(0,0,0,0.1);">' +
        '<h2 style="text-align:center;color:#073B5A;margin-bottom:5px;">Create Account</h2>' +
        '<p style="text-align:center;color:#666;margin-bottom:20px;">Join BusTicket today</p>' +
        '<div id="reg-error" style="display:none;background:#fee;color:red;padding:10px;border-radius:6px;margin-bottom:15px;font-size:13px;"></div>' +
        '<h4 style="color:#073B5A;margin:15px 0 10px 0;">Personal Information</h4>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">' +
        '<div><label style="font-weight:600;font-size:12px;">First Name *</label><input id="reg-fn" placeholder="John" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;"></div>' +
        '<div><label style="font-weight:600;font-size:12px;">Last Name *</label><input id="reg-ln" placeholder="Doe" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;"></div>' +
        '</div>' +
        '<div style="margin-top:10px;"><label style="font-weight:600;font-size:12px;">Username *</label><input id="reg-un" placeholder="Choose username" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;"></div>' +
        '<div style="margin-top:10px;"><label style="font-weight:600;font-size:12px;">Email *</label><input id="reg-em" type="email" placeholder="you@example.com" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;"></div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px;">' +
        '<div><label style="font-weight:600;font-size:12px;">ID Number *</label><input id="reg-id" placeholder="9001015009081" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;"></div>' +
        '<div><label style="font-weight:600;font-size:12px;">Phone Number *</label><input id="reg-phone" placeholder="0712345678" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;"></div>' +
        '</div>' +
        '<div style="margin-top:10px;"><label style="font-weight:600;font-size:12px;">Password *</label><input id="reg-pw" type="password" placeholder="Min 6 characters" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;"></div>' +
        '<h4 style="color:#073B5A;margin:20px 0 10px 0;">Address</h4>' +
        '<div style="margin-top:10px;"><label style="font-weight:600;font-size:12px;">Street Address</label><input id="reg-street" placeholder="123 Main Street" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;"></div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px;">' +
        '<div><label style="font-weight:600;font-size:12px;">Suburb</label><input id="reg-suburb" placeholder="Mmabatho" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;"></div>' +
        '<div><label style="font-weight:600;font-size:12px;">City / Town</label><input id="reg-city" placeholder="Mahikeng" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;"></div>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px;">' +
        '<div><label style="font-weight:600;font-size:12px;">Province</label><input id="reg-province" placeholder="North West" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;"></div>' +
        '<div><label style="font-weight:600;font-size:12px;">Postal Code</label><input id="reg-postal" placeholder="2745" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;"></div>' +
        '</div>' +
        '<div style="margin-top:10px;"><label style="font-weight:600;font-size:12px;">Country</label><input id="reg-country" placeholder="South Africa" value="South Africa" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;"></div>' +
        '<div style="margin-top:15px;"><label style="font-weight:600;font-size:12px;">Role</label><select id="reg-role" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;"><option>Passenger</option><option>Admin</option></select></div>' +
        '<button onclick="register()" style="width:100%;padding:14px;background:linear-gradient(135deg,#11B5C9,#073B5A);color:white;border:none;border-radius:8px;font-size:16px;cursor:pointer;font-weight:700;margin-top:20px;">Create Account</button>' +
        '<p style="text-align:center;margin-top:15px;font-size:13px;">Already have an account? <a href="#/login" style="color:#11B5C9;">Sign In</a></p></div></div>';
}
function register() {
    var data = {
        first_name: document.getElementById('reg-fn').value,
        last_name: document.getElementById('reg-ln').value,
        username: document.getElementById('reg-un').value,
        email: document.getElementById('reg-em').value,
        password: document.getElementById('reg-pw').value,
        role: document.getElementById('reg-role').value,
        id_number: document.getElementById('reg-id').value,
        phone_number: document.getElementById('reg-phone').value,
        street_address: document.getElementById('reg-street').value,
        suburb: document.getElementById('reg-suburb').value,
        city: document.getElementById('reg-city').value,
        province: document.getElementById('reg-province').value,
        postal_code: document.getElementById('reg-postal').value,
        country: document.getElementById('reg-country').value
    };
    var err = document.getElementById('reg-error');
    if (!data.first_name || !data.last_name || !data.username || !data.email || !data.password || !data.id_number || !data.phone_number) {
        err.style.display = 'block';
        err.textContent = '❌ Please fill in all required fields (*)';
        return;
    }
    fetch(API+'/auth/register/',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})
    .then(r=>r.json().then(d=>({ok:r.ok,data:d})))
    .then(res=>{if(!res.ok)throw new Error(res.data.error||JSON.stringify(res.data));alert('✅ Registered! Please login.');window.location.hash='/login';})
    .catch(e=>{err.style.display='block';err.textContent=e.message});
}

// ===================== PASSENGER DASHBOARD =====================
function showPassengerDash() {
    if(!requireAuth()) return;
    document.getElementById('content').innerHTML = '<div style="display:flex;min-height:90vh;">' +
        '<div style="width:250px;background:white;padding:20px;border-right:1px solid #eee;">' +
        '<h3>Passenger</h3>' +
        '<a href="#/passenger" style="display:block;padding:10px;color:#073B5A;font-weight:700;">📊 Dashboard</a>' +
        '<a href="#/booking" style="display:block;padding:10px;color:#073B5A;">🎫 Book Ticket</a>' +
        '<a href="#/complaints" style="display:block;padding:10px;color:#073B5A;">📝 Complaints</a></div>' +
        '<div style="flex:1;padding:30px;background:#f5f5f5;" id="dash-content">Loading...</div></div>';
    fetch(API+'/auth/me/',{headers:authHeaders()}).then(r=>r.json()).then(u=>{
        fetch(API+'/bookings/',{headers:authHeaders()}).then(r=>r.json()).then(b=>{
            var rows = b.map(bk=>'<tr><td>#'+bk.id+'</td><td>'+(bk.departure_location||'N/A')+'</td><td>'+(bk.destination||'N/A')+'</td><td>'+bk.booking_status+'</td><td>R'+(bk.total_fare||0)+'</td><td>'+(bk.booking_status==='BOOKED'?'<button onclick="payBooking('+bk.id+')" style="background:green;color:white;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;">Pay</button> <button onclick="cancelBooking('+bk.id+')" style="background:red;color:white;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;">Cancel</button>':'')+'</td></tr>').join('');
            document.getElementById('dash-content').innerHTML = '<h1>Welcome, '+(u.first_name||u.username)+'!</h1>' +
                '<div style="background:white;padding:20px;border-radius:10px;margin-top:20px;"><h2>My Bookings ('+b.length+')</h2>'+
                (b.length===0?'<p>No bookings. <a href="#/booking">Book now!</a></p>':'<table style="width:100%;border-collapse:collapse;"><thead><tr><th>ID</th><th>From</th><th>To</th><th>Status</th><th>Fare</th><th>Actions</th></tr></thead><tbody>'+rows+'</tbody></table>')+'</div>';
        });
    });
}

// ===================== BOOKING PAGE =====================
function showBooking() {
    if(!requireAuth()) return;
    document.getElementById('content').innerHTML = '<div style="display:flex;min-height:90vh;">' +
        '<div style="width:250px;background:white;padding:20px;border-right:1px solid #eee;"><h3>Passenger</h3>' +
        '<a href="#/passenger" style="display:block;padding:10px;">📊 Dashboard</a>' +
        '<a href="#/booking" style="display:block;padding:10px;font-weight:700;color:#073B5A;">🎫 Book Ticket</a>' +
        '<a href="#/complaints" style="display:block;padding:10px;">📝 Complaints</a></div>' +
        '<div style="flex:1;padding:30px;background:#f5f5f5;">' +
        '<h1>🚌 Available Buses & Schedules</h1>' +
        '<div style="background:white;padding:20px;border-radius:12px;margin-bottom:20px;">' +
        '<div style="display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:12px;">' +
        '<div><label>From</label><input id="search-dep" placeholder="e.g. Johannesburg" style="width:100%;padding:12px;border:2px solid #e0e0e0;border-radius:8px;" list="cities"></div>' +
        '<div><label>To</label><input id="search-dest" placeholder="e.g. Cape Town" style="width:100%;padding:12px;border:2px solid #e0e0e0;border-radius:8px;" list="cities"></div>' +
        '<div><label>Date</label><input id="search-date" type="date" style="width:100%;padding:12px;border:2px solid #e0e0e0;border-radius:8px;"></div>' +
        '<div><button onclick="searchBuses()" style="width:100%;padding:12px;background:#11B5C9;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:700;">🔍 Search</button></div>' +
        '</div><datalist id="cities"><option>Johannesburg</option><option>Cape Town</option><option>Durban</option><option>Pretoria</option><option>Bloemfontein</option><option>Port Elizabeth</option></datalist></div>' +
        '<div id="search-results"></div>' +
        '<div id="seat-modal" style="display:none;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:white;padding:30px;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,0.3);z-index:1000;max-width:450px;width:90%;"></div>' +
        '<div id="modal-overlay" style="display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:999;" onclick="closeModal()"></div></div></div>';
    loadAllSchedules();
}
function loadAllSchedules() { fetch(API + '/schedules/', { headers: authHeaders() }).then(r => r.json()).then(showScheduleResults); }
function searchBuses() {
    var dep = document.getElementById('search-dep').value;
    var dest = document.getElementById('search-dest').value;
    var date = document.getElementById('search-date').value;
    var url = API + '/schedules/?';
    if(dep) url += 'departure=' + encodeURIComponent(dep) + '&';
    if(dest) url += 'destination=' + encodeURIComponent(dest) + '&';
    if(date) url += 'date=' + date;
    fetch(url, { headers: authHeaders() }).then(r => r.json()).then(showScheduleResults);
}
function showScheduleResults(schedules) {
    if (schedules.length === 0) {
        document.getElementById('search-results').innerHTML = '<div style="background:white;padding:40px;border-radius:12px;text-align:center;"><p>🚫 No schedules found.</p></div>';
        return;
    }
    var cards = schedules.map(function(s) {
        return '<div style="background:white;padding:20px;border-radius:12px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:15px;">' +
            '<div><div style="font-size:20px;font-weight:700;color:#073B5A;">'+s.departure_location+' → '+s.destination+'</div>' +
            '<div style="color:#666;">📅 '+new Date(s.departure_time).toLocaleDateString('en-ZA',{weekday:'long',day:'numeric',month:'long'})+'</div>' +
            '<div style="color:#666;">🕐 '+new Date(s.departure_time).toLocaleTimeString('en-ZA',{hour:'2-digit',minute:'2-digit'})+'</div></div>' +
            '<div style="text-align:center;"><div>🚌 '+(s.bus_type||'Standard')+'</div><div>📋 '+(s.registration_number||'N/A')+'</div><div style="font-size:24px;font-weight:800;color:#11B5C9;">R200</div></div>' +
            '<div><button onclick="selectSeat('+s.id+')" style="padding:12px 24px;background:#11B5C9;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:700;">Select Seat</button></div></div>';
    }).join('');
    document.getElementById('search-results').innerHTML = '<h3>'+schedules.length+' Schedule(s)</h3>'+cards;
}
function selectSeat(scheduleId) {
    document.getElementById('modal-overlay').style.display = 'block';
    document.getElementById('seat-modal').style.display = 'block';
    document.getElementById('seat-modal').innerHTML = '<p>Loading seats...</p>';
    fetch(API+'/schedules/'+scheduleId+'/seats/',{headers:authHeaders()}).then(r=>r.json()).then(function(seats){
        var html = '<h3>Select Seat</h3><div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;">';
        seats.forEach(function(s){html+='<button onclick="bookSeat('+scheduleId+',\''+s.number+'\')" '+(s.available?'style="padding:12px;background:#e0f7fa;border:2px solid #11B5C9;border-radius:8px;cursor:pointer;font-weight:600;"':'style="padding:12px;background:#ffebee;border:2px solid #ef9a9a;border-radius:8px;color:#c62828;" disabled')+'>'+s.number+'</button>';});
        html+='</div><button onclick="closeModal()" style="margin-top:15px;width:100%;padding:12px;background:#e0e0e0;border:none;border-radius:8px;cursor:pointer;">Cancel</button>';
        document.getElementById('seat-modal').innerHTML = html;
    });
}
function bookSeat(scheduleId, seatNumber) {
    if(!confirm('Confirm booking for seat '+seatNumber+'? R200')) return;
    fetch(API+'/bookings/',{method:'POST',headers:authHeaders(),body:JSON.stringify({schedule:scheduleId,seat_number:seatNumber,total_fare:200,base_price:200})})
    .then(r=>r.json()).then(function(d){if(d.booking_id){alert('✅ Booked! #'+d.booking_id);closeModal();window.location.hash='/passenger'}else{alert('❌ '+d.error)}});
}
function closeModal() { document.getElementById('seat-modal').style.display='none'; document.getElementById('modal-overlay').style.display='none'; }
function payBooking(bookingId) {
    fetch(API+'/payments/',{method:'POST',headers:authHeaders(),body:JSON.stringify({booking_id:bookingId,amount:200})})
    .then(r=>r.json()).then(d=>{if(d.status==='paid'){alert('✅ Paid! Ref: '+d.reference);window.location.reload()}else{alert('❌ '+d.error)}});
}
function cancelBooking(bookingId) { if(confirm('Cancel #'+bookingId+'?')){fetch(API+'/bookings/'+bookingId+'/cancel/',{method:'POST',headers:authHeaders()}).then(r=>r.json()).then(d=>{alert('Cancelled!');window.location.reload()});} }

// ===================== COMPLAINTS =====================
function showComplaints() {
    if(!requireAuth()) return;
    document.getElementById('content').innerHTML = '<div style="display:flex;min-height:90vh;">' +
        '<div style="width:250px;background:white;padding:20px;border-right:1px solid #eee;"><h3>Passenger</h3>' +
        '<a href="#/passenger" style="display:block;padding:10px;">Dashboard</a><a href="#/complaints" style="display:block;padding:10px;font-weight:700;">Complaints</a></div>' +
        '<div style="flex:1;padding:30px;background:#f5f5f5;"><h1>Submit Complaint</h1>' +
        '<div style="background:white;padding:20px;border-radius:10px;margin-bottom:20px;"><textarea id="complaint-desc" placeholder="Describe issue..." style="width:100%;padding:12px;border:1px solid #ddd;border-radius:6px;min-height:100px;"></textarea>' +
        '<button onclick="submitComplaint()" style="margin-top:10px;padding:12px 24px;background:#11B5C9;color:white;border:none;border-radius:6px;cursor:pointer;">Submit</button></div>' +
        '<div id="my-complaints">Loading...</div></div></div>';
    fetch(API+'/complaints/',{headers:authHeaders()}).then(r=>r.json()).then(c=>{
        document.getElementById('my-complaints').innerHTML = '<h2>My Complaints ('+c.length+')</h2>'+c.map(co=>'<div style="background:white;padding:15px;border-radius:8px;margin-bottom:10px;"><p>'+co.description+'</p><span style="background:'+(co.resolution_status==='resolved'?'#dcfce7':'#fef9c3')+';padding:4px 10px;border-radius:20px;font-size:12px;">'+co.resolution_status+'</span></div>').join('');
    });
}
function submitComplaint() {
    var desc = document.getElementById('complaint-desc').value;
    if (!desc || desc.trim() === '') { alert('❌ Please enter a description.'); return; }
    fetch(API+'/complaints/',{method:'POST',headers:authHeaders(),body:JSON.stringify({description:desc})})
    .then(r=>r.json()).then(d=>{alert('✅ Submitted!');window.location.reload();}).catch(e=>alert('❌ Network error'));
}

// ===================== ADMIN DASHBOARD =====================
function showAdminDash() {
    if(!requireAuth()) return;
    document.getElementById('content').innerHTML = '<div style="display:flex;min-height:90vh;">' +
        '<div style="width:250px;background:white;padding:20px;border-right:1px solid #eee;"><h3>Admin</h3>' +
        '<a href="#/admin" style="display:block;padding:10px;font-weight:700;">📊 Dashboard</a>' +
        '<a href="#/admin/buses" style="display:block;padding:10px;">🚌 Buses</a>' +
        '<a href="#/admin/routes" style="display:block;padding:10px;">🛣️ Routes</a>' +
        '<a href="#/admin/schedules" style="display:block;padding:10px;">📅 Schedules</a>' +
        '<a href="#/admin/complaints" style="display:block;padding:10px;">📝 Complaints</a>' +
        '<a href="#/admin/reports" style="display:block;padding:10px;">📊 Reports</a></div>' +
        '<div style="flex:1;padding:30px;background:#f5f5f5;" id="admin-content">Loading...</div></div>';
    fetch(API+'/analytics/',{headers:authHeaders()}).then(r=>r.json()).then(a=>{
        var html = '<h1>Admin Dashboard</h1>' +
            '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:20px;">' +
            '<div style="background:white;padding:20px;border-radius:10px;"><h3>Revenue</h3><p style="font-size:32px;">R'+(a.total_revenue||0)+'</p></div>' +
            '<div style="background:white;padding:20px;border-radius:10px;"><h3>Popular Routes</h3>'+(a.popular_routes||[]).map(r=>'<p>'+r.departure_location+'→'+r.destination+': '+r.booking_count+'</p>').join('')+'</div>' +
            '<div style="background:white;padding:20px;border-radius:10px;"><h3>Bus Occupancy</h3>'+(a.busy_buses||[]).map(b=>'<p>'+b.registration_number+': '+b.occupancy_pct+'%</p>').join('')+'</div></div>';
        document.getElementById('admin-content').innerHTML = html;
        // Derived attributes - fails silently if view doesn't exist
        fetch(API+'/derived/',{headers:authHeaders()})
        .then(function(r) { return r.ok ? r.json() : []; })
        .then(function(attrs) {
            if (attrs && attrs.length > 0) {
                var html2 = '<h2 style="margin-top:30px;">📊 Derived Attributes</h2><div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;">';
                ['Bus','Route','User','Complaint'].forEach(function(entity){
                    var items = attrs.filter(function(a){return a.entity===entity;});
                    if (items.length > 0) {
                        html2 += '<div style="background:white;padding:15px;border-radius:10px;"><h4>'+entity+'</h4>'+items.map(function(i){return '<p style="margin:3px 0;font-size:13px;"><strong>'+i.name+':</strong> '+i.value+'</p>';}).join('')+'</div>';
                    }
                });
                html2 += '</div>';
                document.getElementById('admin-content').innerHTML += html2;
            }
        })
        .catch(function(){});
    });
}

// ===================== ADMIN BUSES =====================
function showAdminBuses() {
    if(!requireAuth()) return;
    fetch(API+'/buses/',{headers:authHeaders()}).then(r=>r.json()).then(buses=>{
        var rows = buses.map(b=>'<tr><td>'+b.id+'</td><td>'+b.bus_type+'</td><td>'+b.capacity+'</td><td>'+b.registration_number+'</td></tr>').join('');
        document.getElementById('admin-content').innerHTML = '<h1>Manage Buses</h1>' +
            '<div style="background:white;padding:20px;border-radius:10px;margin-bottom:20px;"><h2>Add Bus</h2>' +
            '<input id="bus-type" placeholder="Type" style="padding:10px;margin:5px;">' +
            '<input id="bus-cap" type="number" placeholder="Capacity" style="padding:10px;margin:5px;">' +
            '<input id="bus-reg" placeholder="Registration" style="padding:10px;margin:5px;">' +
            '<button onclick="addBus()" style="padding:10px 20px;background:#11B5C9;color:white;border:none;border-radius:6px;cursor:pointer;">Add</button></div>' +
            '<div style="background:white;padding:20px;border-radius:10px;"><table style="width:100%;border-collapse:collapse;"><thead><tr><th>ID</th><th>Type</th><th>Capacity</th><th>Registration</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
    });
}
function addBus() {
    var d = {bus_type:document.getElementById('bus-type').value,capacity:document.getElementById('bus-cap').value,registration_number:document.getElementById('bus-reg').value};
    fetch(API+'/buses/',{method:'POST',headers:authHeaders(),body:JSON.stringify(d)}).then(r=>r.json()).then(x=>{alert('Added!');showAdminBuses()});
}

// ===================== ADMIN ROUTES =====================
function showAdminRoutes() {
    if(!requireAuth()) return;
    fetch(API+'/routes/',{headers:authHeaders()}).then(r=>r.json()).then(routes=>{
        var rows = routes.map(r=>'<tr><td>'+r.departure_location+'</td><td>'+r.destination+'</td><td>'+r.route_distance+' km</td></tr>').join('');
        document.getElementById('admin-content').innerHTML = '<h1>Manage Routes</h1><div style="background:white;padding:20px;border-radius:10px;"><table style="width:100%;border-collapse:collapse;"><thead><tr><th>From</th><th>To</th><th>Distance</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
    });
}

// ===================== ADMIN SCHEDULES =====================
function showAdminSchedules() {
    if(!requireAuth()) return;
    Promise.all([
        fetch(API+'/schedules/',{headers:authHeaders()}).then(r=>r.json()),
        fetch(API+'/buses/',{headers:authHeaders()}).then(r=>r.json()),
        fetch(API+'/routes/',{headers:authHeaders()}).then(r=>r.json())
    ]).then(function(_a){var s=_a[0],buses=_a[1],routes=_a[2];
        var rows = s.map(function(sch){return '<tr><td>'+sch.departure_location+' → '+sch.destination+'</td><td>'+new Date(sch.departure_time).toLocaleString()+'</td><td>'+new Date(sch.arrival_time).toLocaleString()+'</td><td>'+sch.travel_date+'</td><td>'+(sch.registration_number||'N/A')+'</td></tr>';}).join('');
        document.getElementById('admin-content').innerHTML = '<h1>Manage Schedules</h1>' +
            '<div style="background:white;padding:25px;border-radius:12px;margin-bottom:25px;"><h2>Add Schedule</h2>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:15px;">' +
            '<div><label>Bus</label><select id="sched-bus" style="width:100%;padding:12px;">'+buses.map(function(b){return '<option value="'+b.id+'">'+b.registration_number+' ('+b.bus_type+')</option>';}).join('')+'</select></div>' +
            '<div><label>Route</label><select id="sched-route" style="width:100%;padding:12px;">'+routes.map(function(r){return '<option value="'+r.id+'">'+r.departure_location+' → '+r.destination+'</option>';}).join('')+'</select></div>' +
            '<div><label>Travel Date</label><input id="sched-date" type="date" style="width:100%;padding:12px;"></div>' +
            '<div><label>Departure</label><input id="sched-dep" type="datetime-local" style="width:100%;padding:12px;"></div>' +
            '<div><label>Arrival</label><input id="sched-arr" type="datetime-local" style="width:100%;padding:12px;"></div>' +
            '<div><button onclick="addSchedule()" style="width:100%;padding:12px;background:#11B5C9;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:700;">Add</button></div>' +
            '</div></div><div style="background:white;padding:20px;border-radius:10px;"><table style="width:100%;border-collapse:collapse;"><thead><tr><th>Route</th><th>Departure</th><th>Arrival</th><th>Date</th><th>Bus</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
    });
}
function addSchedule() {
    var busId = document.getElementById('sched-bus').value;
    var routeId = document.getElementById('sched-route').value;
    var depTime = document.getElementById('sched-dep').value;
    var arrTime = document.getElementById('sched-arr').value;
    var travelDate = document.getElementById('sched-date').value;
    if (!busId || !routeId || !depTime || !arrTime || !travelDate) { alert('❌ Fill all fields'); return; }
    var data = {bus_id:busId,route_id:routeId,departure_time:depTime,arrival_time:arrTime,travel_date:travelDate};
    fetch(API+'/schedules/',{method:'POST',headers:authHeaders(),body:JSON.stringify(data)})
    .then(r=>r.json()).then(res=>{alert('✅ Added!');showAdminSchedules();});
}

// ===================== ADMIN COMPLAINTS =====================
function showAdminComplaints() {
    if(!requireAuth()) return;
    fetch(API+'/complaints/',{headers:authHeaders()}).then(r=>r.json()).then(c=>{
        var rows = c.map(function(co){return '<tr><td>#'+co.id+'</td><td>'+co.username+'</td><td>'+co.description+'</td><td>'+co.resolution_status+'</td><td>'+(co.resolution_status!=='resolved'?'<button onclick="resolveComplaint('+co.id+')" style="background:green;color:white;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;">Resolve</button>':'Done')+'</td></tr>';}).join('');
        document.getElementById('admin-content').innerHTML = '<h1>Manage Complaints</h1><div style="background:white;padding:20px;border-radius:10px;"><table style="width:100%;border-collapse:collapse;"><thead><tr><th>ID</th><th>User</th><th>Description</th><th>Status</th><th>Action</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
    });
}
function resolveComplaint(id) { fetch(API+'/complaints/'+id+'/resolve/',{method:'PATCH',headers:authHeaders()}).then(r=>r.json()).then(d=>{alert('Resolved!');showAdminComplaints()}); }

// ===================== ADMIN REPORTS =====================
function showAdminReports() {
    if(!requireAuth()) return;
    fetch(API+'/reports/bookings/',{headers:authHeaders()}).then(r=>r.json()).then(b=>{
        var rows = b.map(function(bk){return '<tr><td>#'+bk.id+'</td><td>'+bk.username+'</td><td>'+bk.departure_location+'→'+bk.destination+'</td><td>'+bk.booking_status+'</td><td>R'+bk.total_fare+'</td><td>'+new Date(bk.booking_date).toLocaleDateString()+'</td></tr>';}).join('');
        document.getElementById('admin-content').innerHTML = '<h1>Booking Reports</h1><div style="background:white;padding:20px;border-radius:10px;"><table style="width:100%;border-collapse:collapse;"><thead><tr><th>ID</th><th>User</th><th>Route</th><th>Status</th><th>Fare</th><th>Date</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
    });
}