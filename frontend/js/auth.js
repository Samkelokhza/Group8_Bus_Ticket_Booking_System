const Auth = {
    isLoggedIn() {
        return !!localStorage.getItem('access_token');
    },

    async getUser() {
        try {
            return await api.getMe();
        } catch {
            this.logout();
            return null;
        }
    },

    async isAdmin() {
        const user = await this.getUser();
        return user?.roles?.includes('Admin');
    },

    logout() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.hash = '#/login';
    },

    redirectBasedOnRole(roles) {
        if (roles.includes('Admin')) {
            window.location.hash = '#/admin/dashboard';
        } else {
            window.location.hash = '#/passenger/dashboard';
        }
    }
};