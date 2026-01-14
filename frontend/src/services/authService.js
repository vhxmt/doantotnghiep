import { authAPI } from "./api";

const authService = {
  async login(credentials) {
    const response = await authAPI.login(credentials);
    return response.data;
  },

  async register(userData) {
    const response = await authAPI.register(userData);
    return response.data;
  },

  async logout() {
    const response = await authAPI.logout();
    return response.data;
  },

  async refreshToken(refreshToken) {
    const response = await authAPI.refreshToken(refreshToken);
    return response.data;
  },

  async forgotPassword(email) {
    const response = await authAPI.forgotPassword(email);
    return response.data;
  },

  async resetPassword(data) {
    const response = await authAPI.resetPassword(data);
    return response.data;
  },

  async verifyEmail(token) {
    const response = await authAPI.verifyEmail(token);
    return response.data;
  },

  async resendVerification(email) {
    const response = await authAPI.resendVerification(email);
    return response.data;
  },

  async getProfile() {
    const response = await authAPI.getProfile();
    return response.data;
  },

  async updateProfile(data) {
    const response = await authAPI.updateProfile(data);
    return response.data;
  },

  async changePassword(data) {
    const response = await authAPI.changePassword(data);
    return response.data;
  },
};

export default authService;
