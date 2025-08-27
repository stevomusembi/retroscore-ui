// hooks/useGuestUser.ts
import { useState } from 'react';
import { useAuth } from '../contexts/authContext';

export const useGuestUser = () => {
  const { isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const checkGuestAndPrompt = (
    action: () => void,
    modalTitle: string = 'Login Required',
    modalMessage: string = 'You need to be logged in to access this feature.'
  ) => {
    if (isAuthenticated) {
      action();
    } else {
      // Store modal content for display
      setModalContent({ title: modalTitle, message: modalMessage });
      setShowLoginModal(true);
    }
  };

  const [modalContent, setModalContent] = useState({
    title: 'Login Required',
    message: 'You need to be logged in to access this feature.'
  });

  const hideLoginModal = () => setShowLoginModal(false);

  return {
    isGuest: !isAuthenticated,
    showLoginModal,
    modalContent,
    checkGuestAndPrompt,
    hideLoginModal,
  };
};