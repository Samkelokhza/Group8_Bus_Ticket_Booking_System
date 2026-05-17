const Router = {
    routes: {},

    add(path, handler, authRequired = false, adminOnly = false) {
        this.routes[path] = { handler, authRequired, adminOnly };
    },

    async navigate() {
        const hash = window.location.hash.slice(1) || '/';
        const route = this.routes[hash] || this.routes['/'];

        if (!route) return;

        // Check auth
        if (route.authRequired && !Auth.isLoggedIn()) {
            window.location.hash = '#/login';
            return;
        }

        if (route.adminOnly) {
            const isAdmin = await Auth.isAdmin();
            if (!isAdmin) {
                window.location.hash = '#/passenger/dashboard';
                return;
            }
        }

        // Load navbar
        await this.loadNavbar();

        // Render page
        const main = document.getElementById('main-content');
        main.innerHTML = await route.handler();
    },

    async loadNavbar() {
        const container = document.getElementById('navbar-container');
        
        if (Auth.isLoggedIn()) {
            const user = await Auth.getUser();
            const isAdmin = user?.roles?.includes('Admin');
            
            container.innerHTML = `
                <nav class="navbar">
                    <a href="#/" class="navbar-brand">🚌 Bus<span>Ticket</span></a>
                    <div class="navbar-links">
                        ${isAdmin ? '<a href="#/admin/dashboard">Admin Panel</a>' : ''}
                        <a href="#/passenger/dashboard">Dashboard</a>
                        <a href="#/passenger/booking">Book Ticket</a>
                        <a href="#/passenger/complaints">Complaints</a>
                        <span style="color:var(--gray-500);font-size:14px;">${user?.username}</span>
                        <button class="btn btn-outline btn-sm" onclick="Auth.logout()">Logout</button>
                    </div>
                </nav>
            `;
        } else {
            container.innerHTML = `
                <nav class="navbar">
                    <a href="#/" class="navbar-brand">🚌 Bus<span>Ticket</span></a>
                    <div class="navbar-links">
                        <a href="#/login" class="btn btn-outline btn-sm">Sign In</a>
                        <a href="#/register" class="btn btn-teal btn-sm">Get Started</a>
                    </div>
                </nav>
            `;
        }
    },

    start() {
        window.addEventListener('hashchange', () => this.navigate());
        window.addEventListener('load', () => this.navigate());
    }
};