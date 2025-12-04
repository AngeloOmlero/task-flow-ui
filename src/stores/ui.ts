import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ModalType =
  | 'createBoard'
  | 'editBoard'
  | 'createTask'
  | 'editTask'
  | 'createComment'
  | 'taskDetails'
  | 'addMembers'
  | null

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timeout?: number; // Duration in ms, defaults to 3000
}

export const useUiStore = defineStore('ui', () => {
  const activeModal = ref<ModalType>(null)
  const sidebarOpen = ref(true)
  const selectedBoardId = ref<number | null>(null)
  const selectedTaskId = ref<number | null>(null)
  const searchQuery = ref('')
  const isLoading = ref(false)
  const toasts = ref<Toast[]>([]);
  let toastIdCounter = 0;

  function openModal(modalType: ModalType) {
    activeModal.value = modalType
  }

  function closeModal() {
    activeModal.value = null
  }

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  function setSelectedBoardId(boardId: number | null) {
    selectedBoardId.value = boardId
  }

  function setSelectedTaskId(taskId: number | null) {
    selectedTaskId.value = taskId
  }

  function setSearchQuery(query: string) {
    searchQuery.value = query
  }

  function setLoading(loading: boolean) {
    isLoading.value = loading
  }

  function showNotification(
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'info',
    timeout: number = 3000,
  ) {
    const id = `toast-${toastIdCounter++}`;
    const newToast: Toast = { id, message, type, timeout };
    toasts.value.push(newToast);

    setTimeout(() => {
      removeToast(id);
    }, timeout);
  }

  function removeToast(id: string) {
    toasts.value = toasts.value.filter(toast => toast.id !== id);
  }

  return {
    activeModal,
    sidebarOpen,
    selectedBoardId,
    selectedTaskId,
    searchQuery,
    isLoading,
    toasts,
    openModal,
    closeModal,
    toggleSidebar,
    setSelectedBoardId,
    setSelectedTaskId,
    setSearchQuery,
    setLoading,
    showNotification,
    removeToast,
  }
})
