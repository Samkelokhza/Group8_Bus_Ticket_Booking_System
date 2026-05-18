var API = 'http://127.0.0.1:8000/api';
var TOKEN = localStorage.getItem('access_token');

function authHeaders() {
    return { 'Authorization': 'Bearer ' + TOKEN, 'Content-Type': 'application/json' };
}

function requireAuth() {
    if (!TOKEN) { window.location.hash = '/login'; return false; }
    return true;
}

// ===================== ROUTER =====================
function route() {
    var hash = window.location.hash.slice(1) || '/';
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
    else if (hash === '/admin/cancellations') { if (requireAuth()) showAdminCancellations(); }
    else showLanding();
}

window.addEventListener('hashchange', route);
window.addEventListener('load', route);

function goHome() { window.location.hash = '/'; }
function goToDash() {
    if (!requireAuth()) return;
    fetch(API + '/auth/me/', { headers: authHeaders() }).then(r => r.json())
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
        '<div id="login-error" style="display:none;background:#fee2e2;color:#dc2626;padding:12px;border-radius:8px;margin-bottom:15px;font-size:14px;"></div>' +
        '<input id="login-user" placeholder="Username" style="width:100%;padding:12px;margin-bottom:12px;border:2px solid #e0e0e0;border-radius:8px;box-sizing:border-box;">' +
        '<input id="login-pass" type="password" placeholder="Password" style="width:100%;padding:12px;margin-bottom:20px;border:2px solid #e0e0e0;border-radius:8px;box-sizing:border-box;">' +
        '<button onclick="login()" style="width:100%;padding:14px;background:linear-gradient(135deg,#11B5C9,#073B5A);color:white;border:none;border-radius:8px;font-size:16px;cursor:pointer;font-weight:700;">Sign In</button>' +
        '<p style="text-align:center;margin-top:15px;"><a href="#/register">Create account</a></p></div></div>';
}
function login() {
    var u = document.getElementById('login-user').value.trim();
    var p = document.getElementById('login-pass').value;
    var err = document.getElementById('login-error');
    if (!u || !p) { err.style.display = 'block'; err.textContent = 'Please enter username and password.'; return; }
    fetch(API+'/auth/login/',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:u,password:p})})
    .then(function(r){return r.json().then(function(d){return{ok:r.ok,status:r.status,data:d};});})
    .then(function(res){
        if(!res.ok){err.style.display='block';err.innerHTML=res.status===401?'🔒 <strong>Incorrect username or password.</strong>':(res.data.detail||'Login failed');return;}
        TOKEN=res.data.access;localStorage.setItem('access_token',TOKEN);
        return fetch(API+'/auth/me/',{headers:authHeaders()});
    })
    .then(function(r){if(r)return r.json();})
    .then(function(u){if(u)window.location.hash=(u.roles||[]).indexOf('Admin')>=0?'/admin':'/passenger';})
    .catch(function(e){err.style.display='block';err.textContent='Network error.';});
}

// ===================== REGISTER (WITH FULL ADDRESS) =====================
function showRegister() {
    document.getElementById('content').innerHTML =
        '<div style="display:flex;justify-content:center;align-items:center;min-height:80vh;background:#f5f5f5;padding:20px;">' +
        '<div style="background:white;padding:30px;border-radius:12px;width:550px;max-width:100%;box-shadow:0 4px 12px rgba(0,0,0,0.1);">' +
        '<h2 style="text-align:center;color:#073B5A;margin-bottom:5px;">Create Account</h2>' +
        '<p style="text-align:center;color:#666;margin-bottom:15px;">Join BusTicket today</p>' +
        '<div id="reg-error" style="display:none;background:#fee2e2;color:#dc2626;padding:12px;border-radius:8px;margin-bottom:15px;font-size:13px;"></div>' +
        
        // Personal Information
        '<h4 style="color:#073B5A;margin:10px 0;border-bottom:2px solid #11B5C9;padding-bottom:5px;"> Personal Information</h4>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">' +
        '<div><input id="reg-fn" placeholder="First Name *" style="width:100%;padding:10px;border:2px solid #e0e0e0;border-radius:6px;box-sizing:border-box;"></div>' +
        '<div><input id="reg-ln" placeholder="Last Name *" style="width:100%;padding:10px;border:2px solid #e0e0e0;border-radius:6px;box-sizing:border-box;"></div>' +
        '</div>' +
        '<input id="reg-un" placeholder="Username *" style="width:100%;padding:10px;margin-top:10px;border:2px solid #e0e0e0;border-radius:6px;box-sizing:border-box;">' +
        '<input id="reg-em" type="email" placeholder="Email *" style="width:100%;padding:10px;margin-top:10px;border:2px solid #e0e0e0;border-radius:6px;box-sizing:border-box;">' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px;">' +
        '<input id="reg-id" placeholder="ID Number" style="width:100%;padding:10px;border:2px solid #e0e0e0;border-radius:6px;box-sizing:border-box;">' +
        '<input id="reg-phone" placeholder="Phone Number" style="width:100%;padding:10px;border:2px solid #e0e0e0;border-radius:6px;box-sizing:border-box;">' +
        '</div>' +
        '<input id="reg-pw" type="password" placeholder="Password (min 8 chars) *" style="width:100%;padding:10px;margin-top:10px;border:2px solid #e0e0e0;border-radius:6px;box-sizing:border-box;">' +
        '<input id="reg-pw-confirm" type="password" placeholder="Confirm Password *" style="width:100%;padding:10px;margin-top:10px;border:2px solid #e0e0e0;border-radius:6px;box-sizing:border-box;">' +
        
        // Address Section
        '<h4 style="color:#073B5A;margin:15px 0 10px 0;border-bottom:2px solid #11B5C9;padding-bottom:5px;"> Address</h4>' +
        '<input id="reg-street" placeholder="Street Address (e.g. 123 Main Street)" style="width:100%;padding:10px;margin-top:5px;border:2px solid #e0e0e0;border-radius:6px;box-sizing:border-box;">' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px;">' +
        '<input id="reg-suburb" placeholder="Suburb (e.g. Sandton)" style="width:100%;padding:10px;border:2px solid #e0e0e0;border-radius:6px;box-sizing:border-box;">' +
        '<input id="reg-city" placeholder="City/Town (e.g. Johannesburg)" style="width:100%;padding:10px;border:2px solid #e0e0e0;border-radius:6px;box-sizing:border-box;">' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px;">' +
        '<input id="reg-province" placeholder="Province (e.g. Gauteng)" style="width:100%;padding:10px;border:2px solid #e0e0e0;border-radius:6px;box-sizing:border-box;">' +
        '<input id="reg-postal" placeholder="Postal Code (e.g. 2196)" style="width:100%;padding:10px;border:2px solid #e0e0e0;border-radius:6px;box-sizing:border-box;">' +
        '</div>' +
        '<input id="reg-country" placeholder="Country" value="South Africa" style="width:100%;padding:10px;margin-top:10px;border:2px solid #e0e0e0;border-radius:6px;box-sizing:border-box;">' +
        
        // Role
        '<select id="reg-role" style="width:100%;padding:10px;margin-top:15px;border:2px solid #e0e0e0;border-radius:6px;box-sizing:border-box;"><option>Passenger</option><option>Admin</option></select>' +
        
        '<button onclick="register()" style="width:100%;padding:14px;background:linear-gradient(135deg,#11B5C9,#073B5A);color:white;border:none;border-radius:8px;font-size:16px;cursor:pointer;font-weight:700;margin-top:15px;">Create Account</button>' +
        '<p style="text-align:center;margin-top:15px;font-size:13px;">Already have an account? <a href="#/login" style="color:#11B5C9;font-weight:600;">Sign In</a></p></div></div>';
}

function register() {
    var err = document.getElementById('reg-error');
    var pw = document.getElementById('reg-pw').value;
    var pwConfirm = document.getElementById('reg-pw-confirm').value;
    
    if (pw.length < 8) { err.style.display = 'block'; err.textContent = '🔒 Password must be at least 8 characters.'; return; }
    if (pw !== pwConfirm) { err.style.display = 'block'; err.textContent = '🔒 Passwords do not match.'; return; }
    
    var data = {
        first_name: document.getElementById('reg-fn').value,
        last_name: document.getElementById('reg-ln').value,
        username: document.getElementById('reg-un').value,
        email: document.getElementById('reg-em').value,
        password: pw,
        role: document.getElementById('reg-role').value,
        id_number: document.getElementById('reg-id').value,
        phone_number: document.getElementById('reg-phone').value,
        street_address: document.getElementById('reg-street').value,
        suburb: document.getElementById('reg-suburb').value,
        city: document.getElementById('reg-city').value,
        province: document.getElementById('reg-province').value,
        postal_code: document.getElementById('reg-postal').value,
        country: document.getElementById('reg-country').value || 'South Africa'
    };
    
    // Build full address from components
    var addrParts = [data.street_address, data.suburb, data.city, data.province, data.postal_code, data.country];
    data.address = addrParts.filter(function(p) { return p && p.trim() !== ''; }).join(', ');
    
    if (!data.first_name || !data.last_name || !data.username || !data.email || !data.password) {
        err.style.display = 'block'; err.textContent = '❌ Please fill in all required fields (*)'; return;
    }
    
    fetch(API+'/auth/register/',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})
    .then(function(r){return r.json().then(function(d){return{ok:r.ok,data:d};});})
    .then(function(res){if(!res.ok)throw new Error(res.data.error||'Failed');alert('✅ Registered successfully! Please login.');window.location.hash='/login';})
    .catch(function(e){err.style.display='block';err.textContent=e.message;});
}

// ===================== PASSENGER DASHBOARD =====================
function showPassengerDash() {
    if(!requireAuth()) return;
    document.getElementById('content').innerHTML = '<div style="display:flex;min-height:90vh;">' +
        '<div style="width:250px;background:white;padding:20px;border-right:1px solid #eee;"><h3>Passenger</h3>' +
        '<a href="#/passenger" style="display:block;padding:10px;color:#073B5A;font-weight:700;">📊 Dashboard</a>' +
        '<a href="#/booking" style="display:block;padding:10px;color:#073B5A;">🎫 Book Ticket</a>' +
        '<a href="#/complaints" style="display:block;padding:10px;color:#073B5A;">📝 My Complaints</a></div>' +
        '<div style="flex:1;padding:30px;background:#f5f5f5;" id="dash-content">Loading...</div></div>';
    fetch(API+'/auth/me/',{headers:authHeaders()}).then(r=>r.json()).then(u=>{
        fetch(API+'/bookings/',{headers:authHeaders()}).then(r=>r.json()).then(b=>{
            var active = b.filter(function(bk){return bk.booking_status==='BOOKED'||bk.booking_status==='PENDING';});
            var cancelled = b.filter(function(bk){return bk.booking_status==='CANCELLED';});
            var aRows = active.map(bk=>'<tr><td>#'+bk.id+'</td><td>'+(bk.departure_location||'N/A')+'</td><td>'+(bk.destination||'N/A')+'</td><td>'+bk.booking_status+'</td><td>R'+(bk.total_fare||0)+'</td><td><button onclick="cancelBooking('+bk.id+')" style="background:#dc2626;color:white;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;">❌ Cancel</button>'+(bk.booking_status==='BOOKED'?' <button onclick="payBooking('+bk.id+')" style="background:#16a34a;color:white;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;">💳 Pay</button>':'')+'</td></tr>').join('');
            var cRows = cancelled.map(bk=>'<tr><td>#'+bk.id+'</td><td>'+(bk.departure_location||'N/A')+'</td><td>'+(bk.destination||'N/A')+'</td><td>CANCELLED</td><td>R'+(bk.total_fare||0)+'</td><td>—</td></tr>').join('');
            document.getElementById('dash-content').innerHTML = '<h1>Welcome, '+(u.first_name||u.username)+'!</h1>' +
                '<div style="background:white;padding:20px;border-radius:10px;margin:20px 0;"><h2>📋 Active Bookings ('+active.length+')</h2>'+(active.length===0?'<p>No bookings. <a href="#/booking">Book now!</a></p>':'<table style="width:100%;border-collapse:collapse;"><thead><tr><th>ID</th><th>From</th><th>To</th><th>Status</th><th>Fare</th><th>Actions</th></tr></thead><tbody>'+aRows+'</tbody></table>')+'</div>' +
                (cancelled.length>0?'<div style="background:white;padding:20px;border-radius:10px;"><h2>🗑️ Cancelled ('+cancelled.length+')</h2><table style="width:100%;border-collapse:collapse;"><thead><tr><th>ID</th><th>From</th><th>To</th><th>Status</th><th>Fare</th><th></th></tr></thead><tbody>'+cRows+'</tbody></table></div>':'');
        });
    });
}

// ===================== BOOKING PAGE =====================
function showBooking() {
    if(!requireAuth()) return;
    document.getElementById('content').innerHTML = '<div style="display:flex;min-height:90vh;">' +
        '<div style="width:250px;background:white;padding:20px;border-right:1px solid #eee;"><h3>Passenger</h3>' +
        '<a href="#/passenger">📊 Dashboard</a><a href="#/booking" style="font-weight:700;color:#073B5A;">🎫 Book Ticket</a><a href="#/complaints">📝 Complaints</a></div>' +
        '<div style="flex:1;padding:30px;background:#f5f5f5;"><h1>🚌 Available Buses</h1>' +
        '<div style="background:white;padding:20px;border-radius:12px;margin-bottom:20px;"><div style="display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:12px;">' +
        '<input id="search-dep" placeholder="From" style="padding:12px;border:2px solid #e0e0e0;border-radius:8px;" list="cities">' +
        '<input id="search-dest" placeholder="To" style="padding:12px;border:2px solid #e0e0e0;border-radius:8px;" list="cities">' +
        '<input id="search-date" type="date" style="padding:12px;border:2px solid #e0e0e0;border-radius:8px;">' +
        '<button onclick="searchBuses()" style="padding:12px;background:#11B5C9;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:700;">🔍 Search</button></div>' +
        '<datalist id="cities"><option>Johannesburg</option><option>Cape Town</option><option>Durban</option><option>Pretoria</option><option>Bloemfontein</option><option>Port Elizabeth</option></datalist></div>' +
        '<div id="search-results"></div><div id="seat-modal" style="display:none;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:white;padding:30px;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,0.3);z-index:1000;max-width:450px;width:90%;"></div>' +
        '<div id="modal-overlay" style="display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:999;" onclick="closeModal()"></div></div></div>';
    loadAllSchedules();
}
function loadAllSchedules(){fetch(API+'/schedules/',{headers:authHeaders()}).then(r=>r.json()).then(showScheduleResults);}
function searchBuses(){var dep=document.getElementById('search-dep').value,dest=document.getElementById('search-dest').value,date=document.getElementById('search-date').value,url=API+'/schedules/?';if(dep)url+='departure='+encodeURIComponent(dep)+'&';if(dest)url+='destination='+encodeURIComponent(dest)+'&';if(date)url+='date='+date;fetch(url,{headers:authHeaders()}).then(r=>r.json()).then(showScheduleResults);}
function calculatePrice(dep,dest){var r={'Johannesburg-Cape Town':450,'Johannesburg-Durban':200,'Pretoria-Bloemfontein':180,'Cape Town-Port Elizabeth':280,'Durban-Johannesburg':200,'Johannesburg-Polokwane':150,'Cape Town-Kimberley':350};return r[dep+'-'+dest]||200;}
function showScheduleResults(s){
    if(s.length===0){document.getElementById('search-results').innerHTML='<div style="background:white;padding:40px;border-radius:12px;text-align:center;"><p>🚫 No schedules found.</p></div>';return;}
    var c=s.map(function(sch){var p=calculatePrice(sch.departure_location,sch.destination),sl=(sch.capacity||50)-(sch.booked_seats||0);
        return '<div style="background:white;padding:20px;border-radius:12px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:15px;">' +
        '<div><div style="font-size:20px;font-weight:700;color:#073B5A;">'+sch.departure_location+' → '+sch.destination+'</div>' +
        '<div style="color:#666;">📅 '+new Date(sch.departure_time).toLocaleDateString('en-ZA',{weekday:'long',day:'numeric',month:'long'})+'</div>' +
        '<div style="color:#666;">🕐 '+new Date(sch.departure_time).toLocaleTimeString('en-ZA',{hour:'2-digit',minute:'2-digit'})+'</div></div>' +
        '<div style="text-align:center;"><div>🚌 '+(sch.bus_type||'Standard')+'</div><div>📋 '+(sch.registration_number||'N/A')+'</div><div style="color:#666;font-size:12px;">🪑 '+sl+' seats left</div><div style="font-size:24px;font-weight:800;color:#11B5C9;">R'+p+'</div></div>' +
        '<div><button onclick="selectSeat('+sch.id+','+p+')" style="padding:12px 24px;background:#11B5C9;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:700;">Select Seat</button></div></div>';}).join('');
    document.getElementById('search-results').innerHTML='<h3>'+s.length+' Schedule(s)</h3>'+c;
}
function selectSeat(id,p){document.getElementById('modal-overlay').style.display='block';document.getElementById('seat-modal').style.display='block';document.getElementById('seat-modal').innerHTML='<p>Loading...</p>';fetch(API+'/schedules/'+id+'/seats/',{headers:authHeaders()}).then(r=>r.json()).then(function(seats){var h='<h3>Select Seat - R'+(p||200)+'</h3><div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;">';seats.forEach(function(s){h+='<button onclick="bookSeat('+id+',\''+s.number+'\','+(p||200)+')" '+(s.available?'style="padding:12px;background:#e0f7fa;border:2px solid #11B5C9;border-radius:8px;cursor:pointer;font-weight:600;"':'style="padding:12px;background:#ffebee;border:2px solid #ef9a9a;border-radius:8px;color:#c62828;" disabled')+'>'+s.number+'</button>';});h+='</div><button onclick="closeModal()" style="margin-top:15px;width:100%;padding:12px;background:#e0e0e0;border:none;border-radius:8px;cursor:pointer;">Cancel</button>';document.getElementById('seat-modal').innerHTML=h;});}
function bookSeat(id,sn,p){var f=p||200;if(!confirm('Confirm booking for seat '+sn+'? R'+f))return;fetch(API+'/bookings/',{method:'POST',headers:authHeaders(),body:JSON.stringify({schedule:id,seat_number:sn,total_fare:f,base_price:f})}).then(r=>r.json()).then(function(d){if(d.booking_id){alert('✅ Booked! #'+d.booking_id);closeModal();window.location.hash='/passenger'}else{alert('❌ '+d.error)}});}
function closeModal(){document.getElementById('seat-modal').style.display='none';document.getElementById('modal-overlay').style.display='none';}
function payBooking(id){fetch(API+'/payments/',{method:'POST',headers:authHeaders(),body:JSON.stringify({booking_id:id,amount:200})}).then(r=>r.json()).then(d=>{if(d.status==='paid'){alert('✅ Paid!');window.location.reload()}else{alert('❌ '+d.error)}});}
function cancelBooking(id){if(confirm('Cancel #'+id+'?')){fetch(API+'/bookings/'+id+'/cancel/',{method:'POST',headers:authHeaders()}).then(r=>r.json()).then(d=>{alert('Cancelled!');window.location.reload();});}}

// ===================== COMPLAINTS =====================
function showComplaints() {
    if(!requireAuth()) return;
    document.getElementById('content').innerHTML = '<div style="display:flex;min-height:90vh;">' +
        '<div style="width:250px;background:white;padding:20px;border-right:1px solid #eee;"><h3>Passenger</h3>' +
        '<a href="#/passenger">📊 Dashboard</a><a href="#/booking">🎫 Book Ticket</a><a href="#/complaints" style="font-weight:700;color:#073B5A;">📝 My Complaints</a></div>' +
        '<div style="flex:1;padding:30px;background:#f5f5f5;"><h1>My Complaints</h1>' +
        '<div style="background:white;padding:20px;border-radius:10px;margin-bottom:20px;"><textarea id="complaint-desc" placeholder="Describe issue..." style="width:100%;padding:12px;border:1px solid #ddd;border-radius:6px;min-height:100px;"></textarea>' +
        '<button onclick="submitComplaint()" style="margin-top:10px;padding:12px 24px;background:#11B5C9;color:white;border:none;border-radius:6px;cursor:pointer;">Submit</button></div><div id="my-complaints">Loading...</div></div></div>';
    fetch(API+'/complaints/',{headers:authHeaders()}).then(r=>r.json()).then(function(c){var h='';if(c.length===0)h='<p>No complaints.</p>';else c.forEach(function(co){h+='<div style="background:white;padding:15px;border-radius:8px;margin-bottom:10px;"><p>'+co.description+'</p><span style="background:'+(co.resolution_status==='resolved'?'#dcfce7':'#fef9c3')+';padding:4px 10px;border-radius:20px;font-size:12px;">'+co.resolution_status+'</span></div>';});document.getElementById('my-complaints').innerHTML='<h2>My Complaints ('+c.length+')</h2>'+h;});
}
function submitComplaint(){var d=document.getElementById('complaint-desc').value;if(!d){alert('Enter description');return;}fetch(API+'/complaints/',{method:'POST',headers:authHeaders(),body:JSON.stringify({description:d})}).then(r=>r.json()).then(function(x){alert('✅ Submitted!');window.location.reload();});}

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
        '<a href="#/admin/cancellations" style="display:block;padding:10px;">🗑️ Cancellations</a>' +
        '<a href="#/admin/reports" style="display:block;padding:10px;">📊 Reports</a></div>' +
        '<div style="flex:1;padding:30px;background:#f5f5f5;" id="admin-content">Loading...</div></div>';
    fetch(API+'/analytics/',{headers:authHeaders()}).then(r=>r.json()).then(a=>{
        document.getElementById('admin-content').innerHTML = '<h1>Admin Dashboard</h1>' +
            '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:20px;">' +
            '<div style="background:white;padding:20px;border-radius:10px;"><h3>Revenue</h3><p style="font-size:32px;">R'+(a.total_revenue||0)+'</p></div>' +
            '<div style="background:white;padding:20px;border-radius:10px;"><h3>Popular Routes</h3>'+(a.popular_routes||[]).map(r=>'<p>'+r.departure_location+'→'+r.destination+': '+r.booking_count+'</p>').join('')+'</div>' +
            '<div style="background:white;padding:20px;border-radius:10px;"><h3>Bus Occupancy</h3>'+(a.busy_buses||[]).map(b=>'<p>'+b.registration_number+': '+b.occupancy_pct+'%</p>').join('')+'</div></div>';
    });
}

// ===================== ADMIN BUSES =====================
function showAdminBuses() {
    if(!requireAuth()) return;
    fetch(API+'/buses/',{headers:authHeaders()}).then(r=>r.json()).then(buses=>{
        var rows = buses.map(b=>'<tr><td>'+b.id+'</td><td>'+b.bus_type+'</td><td>'+b.capacity+'</td><td>'+b.registration_number+'</td></tr>').join('');
        document.getElementById('admin-content').innerHTML = '<h1>🚌 Manage Buses</h1>' +
            '<div style="background:white;padding:25px;border-radius:12px;margin-bottom:25px;"><h2>Add New Bus</h2>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:15px;">' +
            '<div><label style="font-weight:600;">Bus Type</label><input id="bus-type" placeholder="e.g. Luxury Coach" style="width:100%;padding:12px;border:2px solid #e0e0e0;border-radius:8px;box-sizing:border-box;"></div>' +
            '<div><label style="font-weight:600;">Capacity</label><input id="bus-cap" type="number" placeholder="e.g. 50" style="width:100%;padding:12px;border:2px solid #e0e0e0;border-radius:8px;box-sizing:border-box;"></div>' +
            '<div><label style="font-weight:600;">Registration Number</label><input id="bus-reg" placeholder="e.g. BUS-001-GP" style="width:100%;padding:12px;border:2px solid #e0e0e0;border-radius:8px;box-sizing:border-box;"></div>' +
            '</div><button onclick="addBus()" style="margin-top:15px;padding:12px 30px;background:#11B5C9;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:700;">➕ Add Bus</button></div>' +
            '<div style="background:white;padding:20px;border-radius:10px;"><table style="width:100%;border-collapse:collapse;"><thead><tr><th>ID</th><th>Type</th><th>Capacity</th><th>Registration</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
    });
}
function addBus() {
    var d = {bus_type:document.getElementById('bus-type').value,capacity:document.getElementById('bus-cap').value,registration_number:document.getElementById('bus-reg').value};
    if(!d.bus_type||!d.capacity||!d.registration_number){alert('Fill all fields');return;}
    fetch(API+'/buses/',{method:'POST',headers:authHeaders(),body:JSON.stringify(d)}).then(r=>r.json()).then(x=>{alert('Bus added!');showAdminBuses()});
}

// ===================== ADMIN ROUTES (WITH ADD & ESTIMATED TRAVEL TIME) =====================
function showAdminRoutes() {
    if(!requireAuth()) return;
    fetch(API+'/routes/',{headers:authHeaders()}).then(r=>r.json()).then(routes=>{
        var rows = routes.map(function(r){
            var speed = r.average_speed_kmh || 80;
            var distance = parseFloat(r.route_distance) || 0;
            var hours = distance / speed;
            var travelTime = r.estimated_travel_time || (Math.round(hours * 10) / 10 + ' hours');
            return '<tr><td>'+r.id+'</td><td>'+r.departure_location+'</td><td>'+r.destination+'</td><td>'+r.route_distance+' km</td><td>'+travelTime+'</td></tr>';
        }).join('');
        document.getElementById('admin-content').innerHTML = 
            '<h1>🛣️ Manage Routes</h1>' +
            '<div style="background:white;padding:25px;border-radius:12px;margin-bottom:25px;"><h2>Add New Route</h2>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:15px;">' +
            '<div><label style="font-weight:600;">From (Departure)</label><input id="route-from" placeholder="e.g. Johannesburg" style="width:100%;padding:12px;border:2px solid #e0e0e0;border-radius:8px;box-sizing:border-box;"></div>' +
            '<div><label style="font-weight:600;">To (Destination)</label><input id="route-to" placeholder="e.g. Cape Town" style="width:100%;padding:12px;border:2px solid #e0e0e0;border-radius:8px;box-sizing:border-box;"></div>' +
            '<div><label style="font-weight:600;">Distance (km)</label><input id="route-distance" type="number" placeholder="e.g. 1400" style="width:100%;padding:12px;border:2px solid #e0e0e0;border-radius:8px;box-sizing:border-box;"></div>' +
            '<div><label style="font-weight:600;">Avg Speed (km/h)</label><input id="route-speed" type="number" placeholder="e.g. 100" value="80" style="width:100%;padding:12px;border:2px solid #e0e0e0;border-radius:8px;box-sizing:border-box;"></div>' +
            '<div><label style="font-weight:600;">Est. Travel Time</label><input id="route-time" placeholder="e.g. 14 hours" style="width:100%;padding:12px;border:2px solid #e0e0e0;border-radius:8px;box-sizing:border-box;"></div>' +
            '<div style="display:flex;align-items:end;"><button onclick="addRoute()" style="width:100%;padding:12px;background:#11B5C9;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:700;">➕ Add Route</button></div>' +
            '</div></div>' +
            '<div style="background:white;padding:20px;border-radius:10px;"><h2>All Routes ('+routes.length+')</h2>' +
            '<p style="color:#666;margin-bottom:15px;">ⓘ Estimated travel time is Distance ÷ Average Speed</p>' +
            '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;"><thead><tr style="background:#f5f5f5;"><th>ID</th><th>From</th><th>To</th><th>Distance</th><th>Est. Travel Time</th></tr></thead><tbody>'+rows+'</tbody></table></div></div>';
    });
}
function addRoute() {
    var from = document.getElementById('route-from').value;
    var to = document.getElementById('route-to').value;
    var distance = document.getElementById('route-distance').value;
    var speed = document.getElementById('route-speed').value || 80;
    var time = document.getElementById('route-time').value;
    if (!from || !to) { alert('Please enter departure and destination.'); return; }
    if (!distance || distance <= 0) { alert('Please enter a valid distance.'); return; }
    if (!time) { var hours = parseFloat(distance) / parseFloat(speed); time = Math.round(hours * 10) / 10 + ' hours'; }
    var data = {departure_location:from,destination:to,route_distance:distance,average_speed_kmh:speed,estimated_travel_time:time};
    fetch(API+'/routes/',{method:'POST',headers:authHeaders(),body:JSON.stringify(data)})
    .then(function(r){return r.json();})
    .then(function(res){if(res.status==='created'){alert('✅ Route added: '+from+' → '+to+' ('+time+')');showAdminRoutes();}else{alert('❌ Failed');}})
    .catch(function(){alert('Network error');});
}

// ===================== ADMIN SCHEDULES =====================
function showAdminSchedules() {
    if(!requireAuth()) return;
    Promise.all([fetch(API+'/schedules/',{headers:authHeaders()}).then(r=>r.json()),fetch(API+'/buses/',{headers:authHeaders()}).then(r=>r.json()),fetch(API+'/routes/',{headers:authHeaders()}).then(r=>r.json())]).then(function(_a){var s=_a[0],buses=_a[1],routes=_a[2];
        var rows = s.map(function(sch){var sl=(sch.capacity||50)-(sch.booked_seats||0);return '<tr><td>'+sch.departure_location+' → '+sch.destination+'</td><td>'+new Date(sch.departure_time).toLocaleString()+'</td><td>'+new Date(sch.arrival_time).toLocaleString()+'</td><td>'+sch.travel_date+'</td><td>'+(sch.registration_number||'N/A')+'</td><td>🪑 '+sl+' left</td><td><button onclick="viewPassengers('+sch.id+')" style="background:#073B5A;color:white;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;">👥 View</button></td></tr>';}).join('');
        document.getElementById('admin-content').innerHTML = '<h1>📅 Manage Schedules</h1>' +
            '<div style="background:white;padding:25px;border-radius:12px;margin-bottom:25px;"><h2>Add Schedule</h2>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:15px;">' +
            '<div><label>Bus</label><select id="sched-bus" style="width:100%;padding:12px;">'+buses.map(function(b){return '<option value="'+b.id+'">'+b.registration_number+' ('+b.bus_type+' - '+b.capacity+' seats)</option>';}).join('')+'</select></div>' +
            '<div><label>Route</label><select id="sched-route" style="width:100%;padding:12px;">'+routes.map(function(r){return '<option value="'+r.id+'">'+r.departure_location+' → '+r.destination+'</option>';}).join('')+'</select></div>' +
            '<div><label>Travel Date</label><input id="sched-date" type="date" style="width:100%;padding:12px;"></div>' +
            '<div><label>Departure</label><input id="sched-dep" type="datetime-local" style="width:100%;padding:12px;"></div>' +
            '<div><label>Arrival</label><input id="sched-arr" type="datetime-local" style="width:100%;padding:12px;"></div>' +
            '<div><button onclick="addSchedule()" style="width:100%;padding:12px;background:#11B5C9;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:700;">Add</button></div>' +
            '</div></div><div style="background:white;padding:20px;border-radius:10px;"><table style="width:100%;border-collapse:collapse;"><thead><tr><th>Route</th><th>Departure</th><th>Arrival</th><th>Date</th><th>Bus</th><th>Seats</th><th>Action</th></tr></thead><tbody>'+rows+'</tbody></table></div><div id="passenger-list" style="margin-top:20px;"></div>';
    });
}
function addSchedule() {
    var busId=document.getElementById('sched-bus').value,routeId=document.getElementById('sched-route').value,depTime=document.getElementById('sched-dep').value,arrTime=document.getElementById('sched-arr').value,travelDate=document.getElementById('sched-date').value;
    if(!busId||!routeId||!depTime||!arrTime||!travelDate){alert('Fill all fields');return;}
    fetch(API+'/schedules/',{method:'POST',headers:authHeaders(),body:JSON.stringify({bus_id:busId,route_id:routeId,departure_time:depTime,arrival_time:arrTime,travel_date:travelDate})}).then(r=>r.json()).then(function(res){if(res.status==='created'){alert('✅ Schedule added!');showAdminSchedules();}else{alert('❌ Failed');}});
}
function viewPassengers(scheduleId) {
    fetch(API+'/schedules/'+scheduleId+'/passengers/',{headers:authHeaders()}).then(r=>r.json()).then(function(data){
        var html = '<div style="background:white;padding:20px;border-radius:10px;"><h2>Passengers for '+data.schedule.departure_location+' → '+data.schedule.destination+'</h2><p>🚌 '+data.schedule.registration_number+' ('+data.schedule.bus_type+')</p><p>🪑 '+data.booked_seats+' booked / '+data.total_seats+' total ('+data.seats_left+' left)</p>';
        if(data.passengers.length===0)html+='<p>No passengers yet.</p>';
        else{html+='<table style="width:100%;border-collapse:collapse;"><thead><tr><th>User</th><th>Email</th><th>Phone</th><th>Seat</th><th>Status</th><th>Fare</th></tr></thead><tbody>';data.passengers.forEach(function(p){html+='<tr><td>'+p.first_name+' '+p.last_name+'</td><td>'+p.email+'</td><td>'+p.phone_number+'</td><td>'+p.seat_number+'</td><td>'+p.booking_status+'</td><td>R'+p.total_fare+'</td></tr>';});html+='</tbody></table>';}
        html+='</div>';document.getElementById('passenger-list').innerHTML=html;
    });
}

// ===================== ADMIN COMPLAINTS =====================
function showAdminComplaints() {
    if(!requireAuth()) return;
    fetch(API+'/complaints/',{headers:authHeaders()}).then(r=>r.json()).then(c=>{
        var rows = c.map(function(co){return '<tr><td>#'+co.id+'</td><td>'+co.username+'</td><td>'+co.description+'</td><td>'+co.resolution_status+'</td><td>'+(co.resolution_status!=='resolved'?'<button onclick="resolveComplaint('+co.id+')" style="background:green;color:white;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;">Resolve</button>':'✅ Resolved')+'</td></tr>';}).join('');
        document.getElementById('admin-content').innerHTML = '<h1>📝 Manage Complaints</h1><div style="background:white;padding:20px;border-radius:10px;"><table style="width:100%;border-collapse:collapse;"><thead><tr><th>ID</th><th>User</th><th>Description</th><th>Status</th><th>Action</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
    });
}
function resolveComplaint(id) { fetch(API+'/complaints/'+id+'/resolve/',{method:'PATCH',headers:authHeaders()}).then(r=>r.json()).then(d=>{alert('Resolved!');showAdminComplaints()}); }

// ===================== ADMIN CANCELLATIONS =====================
function showAdminCancellations() {
    if(!requireAuth()) return;
    fetch(API+'/bookings/',{headers:authHeaders()}).then(r=>r.json()).then(function(all){
        var cancelled = all.filter(function(b){return b.booking_status==='CANCELLED';});
        var rows = cancelled.map(function(bk){return '<tr><td>#'+bk.id+'</td><td>'+(bk.username||'N/A')+'</td><td>'+(bk.departure_location||'N/A')+' → '+(bk.destination||'N/A')+'</td><td>'+new Date(bk.booking_date).toLocaleDateString()+'</td><td>R'+(bk.total_fare||0)+'</td><td><span style="background:#fee2e2;color:#dc2626;padding:4px 10px;border-radius:20px;font-size:12px;font-weight:600;">CANCELLED</span></td></tr>';}).join('');
        document.getElementById('admin-content').innerHTML = '<h1>🗑️ Cancelled Bookings</h1><div style="background:white;padding:20px;border-radius:10px;margin-top:20px;"><p><strong>Total Cancelled:</strong> '+cancelled.length+'</p>'+(cancelled.length===0?'<p>No cancellations.</p>':'<table style="width:100%;border-collapse:collapse;"><thead><tr><th>ID</th><th>Passenger</th><th>Route</th><th>Date</th><th>Fare</th><th>Status</th></tr></thead><tbody>'+rows+'</tbody></table>')+'</div>';
    });
}

// ===================== ADMIN REPORTS =====================
function showAdminReports() {
    if(!requireAuth()) return;
    fetch(API+'/reports/bookings/',{headers:authHeaders()}).then(r=>r.json()).then(b=>{
        var rows = b.map(function(bk){return '<tr><td>#'+bk.id+'</td><td>'+bk.username+'</td><td>'+bk.departure_location+'→'+bk.destination+'</td><td>'+bk.booking_status+'</td><td>R'+bk.total_fare+'</td><td>'+new Date(bk.booking_date).toLocaleDateString()+'</td></tr>';}).join('');
        document.getElementById('admin-content').innerHTML = '<h1>📊 Booking Reports</h1><div style="background:white;padding:20px;border-radius:10px;"><table style="width:100%;border-collapse:collapse;"><thead><tr><th>ID</th><th>User</th><th>Route</th><th>Status</th><th>Fare</th><th>Date</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
    });
}