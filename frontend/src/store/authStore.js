import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authAPI } from "../services/api";
import toast from "react-hot-toast";

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      tokens: null,
      isLoading: false,
      isAuthenticated: false,

      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),

      setTokens: (tokens) => set({ tokens }),

      setLoading: (isLoading) => set({ isLoading }),

      // Initialize auth from stored tokens
      initializeAuth: async () => {
        const { tokens } = get();

        if (!tokens?.accessToken) {
          set({ isLoading: false });
          return;
        }

        try {
          set({ isLoading: true });

          // Verify token and get user profile
          const response = await authAPI.getProfile();

          set({
            user: response.data.data.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          console.error("Auth initialization failed:", error);

          // Try to refresh token
          if (tokens?.refreshToken) {
            try {
              const refreshResponse = await authAPI.refreshToken(
                tokens.refreshToken
              );

              set({
                tokens: refreshResponse.data.tokens,
              });

              // Retry getting profile
              const profileResponse = await authAPI.getProfile();

              set({
                user: profileResponse.data.data.user,
                isAuthenticated: true,
                isLoading: false,
              });
            } catch (refreshError) {
              console.error("Token refresh failed:", refreshError);
              get().logout();
            }
          } else {
            get().logout();
          }
        }
      },

      // Login
      login: async (credentials) => {
        try {
          set({ isLoading: true });

          const response = await authAPI.login(credentials);
          const { user, tokens } = response.data.data;

          set({
            user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
          });

          toast.success("Đăng nhập thành công!");
          return { success: true, user };
        } catch (error) {
          set({ isLoading: false });

          const message = error.response?.data?.message || "Đăng nhập thất bại";
          toast.error(message);

          return { success: false, error: message };
        }
      },

      // Register
      register: async (userData) => {
        try {
          set({ isLoading: true });

          const response = await authAPI.register(userData);
          const { user, tokens } = response.data.data;

          set({
            user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
          });

          toast.success("Đăng ký thành công!");
          return { success: true, user };
        } catch (error) {
          set({ isLoading: false });

          const message = error.response?.data?.message || "Đăng ký thất bại";
          toast.error(message);

          return { success: false, error: message };
        }
      },

      // Logout
      logout: async () => {
        // Prevent multiple logout calls
        const currentState = get();
        if (!currentState.isAuthenticated) {
          return; // Already logged out
        }

        try {
          await authAPI.logout();
        } catch (error) {
          console.error("Logout API call failed:", error);
        } finally {
          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
            isLoading: false,
          });

          // Only show toast once
          toast.success("Đăng xuất thành công!");
        }
      },

      // Update profile
      updateProfile: async (profileData) => {
        try {
          set({ isLoading: true });

          const response = await authAPI.updateProfile(profileData);
          const updatedUser = response.data.data.user;

          set({
            user: updatedUser,
            isLoading: false,
          });

          toast.success("Cập nhật thông tin thành công!");
          return { success: true, user: updatedUser };
        } catch (error) {
          set({ isLoading: false });

          const message = error.response?.data?.message || "Cập nhật thất bại";
          toast.error(message);

          return { success: false, error: message };
        }
      },

      // Change password
      changePassword: async (passwordData) => {
        try {
          set({ isLoading: true });

          await authAPI.changePassword(passwordData);

          set({ isLoading: false });

          toast.success("Đổi mật khẩu thành công!");
          return { success: true };
        } catch (error) {
          set({ isLoading: false });

          const message =
            error.response?.data?.message || "Đổi mật khẩu thất bại";
          toast.error(message);

          return { success: false, error: message };
        }
      },

      // Forgot password
      forgotPassword: async (email) => {
        try {
          set({ isLoading: true });

          await authAPI.forgotPassword(email);

          set({ isLoading: false });

          toast.success("Email khôi phục mật khẩu đã được gửi!");
          return { success: true };
        } catch (error) {
          set({ isLoading: false });

          const message = error.response?.data?.message || "Gửi email thất bại";
          toast.error(message);

          return { success: false, error: message };
        }
      },

      // Reset password
      resetPassword: async (token, password) => {
        try {
          set({ isLoading: true });

          await authAPI.resetPassword({ token, password });

          set({ isLoading: false });

          toast.success("Đặt lại mật khẩu thành công!");
          return { success: true };
        } catch (error) {
          set({ isLoading: false });

          const message =
            error.response?.data?.message || "Đặt lại mật khẩu thất bại";
          toast.error(message);

          return { success: false, error: message };
        }
      },

      // Verify email
      verifyEmail: async (token) => {
        try {
          set({ isLoading: true });

          await authAPI.verifyEmail(token);

          // Update user's email verification status
          const { user } = get();
          if (user) {
            set({
              user: { ...user, emailVerified: true },
              isLoading: false,
            });
          } else {
            set({ isLoading: false });
          }

          toast.success("Xác thực email thành công!");
          return { success: true };
        } catch (error) {
          set({ isLoading: false });

          const message =
            error.response?.data?.message || "Xác thực email thất bại";
          toast.error(message);

          return { success: false, error: message };
        }
      },

      // Check if user has role
      hasRole: (role) => {
        const { user } = get();
        return user?.roles?.some((r) => r.name === role) || false;
      },

      // Check if user has any of the roles
      hasAnyRole: (roles) => {
        const { user } = get();
        if (!user?.roles) return false;

        return roles.some((role) => user.roles.some((r) => r.name === role));
      },

      // Get user's role names
      getUserRoles: () => {
        const { user } = get();
        return user?.roles?.map((r) => r.name) || [];
      },

      // Check if user is admin
      isAdmin: () => {
        return get().hasRole("admin");
      },

      // Check if user is staff
      isStaff: () => {
        return get().hasAnyRole(["staff", "admin"]);
      },

      // Check if user is customer
      isCustomer: () => {
        return get().hasRole("customer");
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export { useAuthStore };
