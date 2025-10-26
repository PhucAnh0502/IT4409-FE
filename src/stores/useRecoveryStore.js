import { create } from "zustand";

// Password recovery flow store
// page: 'login' | 'otp' | 'reset' | 'recovered'
export const useRecoveryStore = create((set) => ({
  page: "login",
  email: "",
  otp: "",

  // actions
  setPage: (page) => set({ page }),
  setEmail: (email) => set({ email }),
  setOTP: (otp) => set({ otp }),
  reset: () => set({ page: "login", email: "", otp: "" }),
}));
