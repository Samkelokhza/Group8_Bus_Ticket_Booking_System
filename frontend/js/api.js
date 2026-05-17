const API_BASE = 'http://localhost:8000/api';

const api = {
    async request(method, endpoint, data = null, auth = true) {
        const headers = { 'Content-Type': 'application/json' };
        
        if (auth) {
            const token = localStorage.getItem('access_token');
            if (token) headers['Authorization'] = Bearer ;
        }

        const config = { method, headers };
        if (data) config.body = JSON.stringify(data);

        const response = await fetch(${API_BASE}, config);
        const result = await response.json();

        if (!response.ok) {
            throw { status: response.status, data: result };
        }

        return result;
    },

    get(endpoint, auth = true) { return this.request('GET', endpoint, null, auth); },
    post(endpoint, data, auth = true) { return this.request('POST', endpoint, data, auth); },
    put(endpoint, data, auth = true) { return this.request('PUT', endpoint, data, auth); },
    delete(endpoint, auth = true) { return this.request('DELETE', endpoint, null, auth); },

    login(username, password) { return this.post('/auth/login/', { username, password }, false); },
    register(data) { return this.post('/auth/register/', data, false); },
    getMe() { return this.get('/auth/me/'); },
    getBuses() { return this.get('/buses/'); },
    createBus(data) { return this.post('/buses/', data); },
    updateBus(id, data) { return this.put(/buses//, data); },
    deleteBus(id) { return this.delete(/buses//); },
    getRoutes() { return this.get('/routes/'); },
    createRoute(data) { return this.post('/routes/', data); },
    getSchedules() { return this.get('/schedules/'); },
    getBookings() { return this.get('/bookings/'); },
    createBooking(data) { return this.post('/bookings/', data); },
    mockPay(bookingId) { return this.post(/bookings//mock-pay/); },
    getPayments() { return this.get('/payments/'); },
    getComplaints() { return this.get('/complaints/'); },
    createComplaint(data) { return this.post('/complaints/', data); },
    resolveComplaint(id) { return this.request('PATCH', /complaints//resolve/); },
    getAnalytics() { return this.get('/analytics/'); },
};
