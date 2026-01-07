"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import LoginModal from "@/components/LoginModal";
import RegisterModal from "@/components/RegisterModal";

interface AuthModalContextType {
  openLoginModal: () => void;
  openRegisterModal: () => void;
  closeModals: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error("useAuthModal must be used within an AuthModalProvider");
  }
  return context;
};

interface AuthModalProviderProps {
  children: React.ReactNode;
}

export const AuthModalProvider: React.FC<AuthModalProviderProps> = ({ children }) => {
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  const openLoginModal = useCallback(() => {
    setRegisterOpen(false);
    setLoginOpen(true);
  }, []);

  const openRegisterModal = useCallback(() => {
    setLoginOpen(false);
    setRegisterOpen(true);
  }, []);

  const closeModals = useCallback(() => {
    setLoginOpen(false);
    setRegisterOpen(false);
  }, []);

  const switchToRegister = useCallback(() => {
    setLoginOpen(false);
    setRegisterOpen(true);
  }, []);

  const switchToLogin = useCallback(() => {
    setRegisterOpen(false);
    setLoginOpen(true);
  }, []);

  return (
    <AuthModalContext.Provider value={{ openLoginModal, openRegisterModal, closeModals }}>
      {children}
      
      {/* Global Login Modal */}
      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSwitchToRegister={switchToRegister}
      />

      {/* Global Register Modal */}
      <RegisterModal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSwitchToLogin={switchToLogin}
      />
    </AuthModalContext.Provider>
  );
};

export default AuthModalProvider;

