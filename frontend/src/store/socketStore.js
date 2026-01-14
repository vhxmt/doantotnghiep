import { create } from 'zustand'
import { io } from 'socket.io-client'
import toast from 'react-hot-toast'

const useSocketStore = create((set, get) => ({
  // State
  socket: null,
  isConnected: false,
  notifications: [],
  unreadCount: 0,

  // Actions
  connect: () => {
    const { socket } = get()
    
    // Don't create multiple connections
    if (socket?.connected) {
      return
    }

    const newSocket = io(import.meta.env.VITE_SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
    })

    // Connection events
    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id)
      set({ isConnected: true })
    })

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason)
      set({ isConnected: false })
    })

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      set({ isConnected: false })
    })

    // Order events
    newSocket.on('order-status-updated', (data) => {
      const { addNotification } = get()
      
      addNotification({
        id: Date.now(),
        type: 'order',
        title: 'Cập nhật đơn hàng',
        message: `Đơn hàng ${data.orderNumber} đã ${getStatusText(data.status)}`,
        data,
        timestamp: new Date().toISOString(),
        read: false
      })

      // Show toast notification
      toast.success(`Đơn hàng ${data.orderNumber} đã ${getStatusText(data.status)}`)
    })

    newSocket.on('new-order', (data) => {
      const { addNotification } = get()
      
      addNotification({
        id: Date.now(),
        type: 'order',
        title: 'Đơn hàng mới',
        message: `Đơn hàng ${data.orderNumber} vừa được tạo`,
        data,
        timestamp: new Date().toISOString(),
        read: false
      })

      // Show toast for staff
      toast.success(`Đơn hàng mới: ${data.orderNumber}`)
    })

    // Inventory events
    newSocket.on('inventory-updated', (data) => {
      const { addNotification } = get()
      
      if (data.isLowStock) {
        addNotification({
          id: Date.now(),
          type: 'inventory',
          title: 'Cảnh báo tồn kho',
          message: `${data.productName} sắp hết hàng (còn ${data.newQuantity})`,
          data,
          timestamp: new Date().toISOString(),
          read: false
        })
      }
    })

    newSocket.on('product-out-of-stock', (data) => {
      const { addNotification } = get()
      
      addNotification({
        id: Date.now(),
        type: 'inventory',
        title: 'Hết hàng',
        message: `${data.productName} đã hết hàng`,
        data,
        timestamp: new Date().toISOString(),
        read: false
      })

      toast.error(`${data.productName} đã hết hàng`)
    })

    newSocket.on('low-stock-alert', (data) => {
      const { addNotification } = get()
      
      addNotification({
        id: Date.now(),
        type: 'inventory',
        title: 'Cảnh báo tồn kho thấp',
        message: data.message,
        data,
        timestamp: new Date().toISOString(),
        read: false
      })
    })

    // System events
    newSocket.on('system-notification', (data) => {
      const { addNotification } = get()
      
      addNotification({
        id: Date.now(),
        type: 'system',
        title: 'Thông báo hệ thống',
        message: data.message,
        data,
        timestamp: new Date().toISOString(),
        read: false
      })

      // Show toast based on type
      if (data.type === 'error') {
        toast.error(data.message)
      } else if (data.type === 'warning') {
        toast.error(data.message, { icon: '⚠️' })
      } else {
        toast.success(data.message)
      }
    })

    newSocket.on('announcement', (data) => {
      const { addNotification } = get()
      
      addNotification({
        id: Date.now(),
        type: 'announcement',
        title: data.title,
        message: data.message,
        data,
        timestamp: new Date().toISOString(),
        read: false
      })

      // Show toast announcement
      toast.success(`📢 ${data.title}: ${data.message}`, {
        duration: 6000
      })
    })

    newSocket.on('private-message', (data) => {
      const { addNotification } = get()
      
      addNotification({
        id: Date.now(),
        type: 'message',
        title: 'Tin nhắn riêng',
        message: data.message,
        data,
        timestamp: new Date().toISOString(),
        read: false
      })

      toast.success(`💬 ${data.message}`)
    })

    set({ socket: newSocket })
  },

  disconnect: () => {
    const { socket } = get()
    
    if (socket) {
      socket.disconnect()
      set({ socket: null, isConnected: false })
      console.log('🔌 Socket disconnected')
    }
  },

  // Join user room for personal notifications
  joinUserRoom: (userId) => {
    const { socket } = get()
    
    if (socket && userId) {
      socket.emit('join-user-room', userId)
      console.log(`👤 Joined user room: ${userId}`)
    }
  },

  // Join staff room for staff notifications
  joinStaffRoom: () => {
    const { socket } = get()
    
    if (socket) {
      socket.emit('join-staff-room')
      console.log('👥 Joined staff room')
    }
  },

  // Notification management
  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications].slice(0, 50), // Keep only last 50
      unreadCount: state.unreadCount + 1
    }))
  },

  markAsRead: (notificationId) => {
    set((state) => ({
      notifications: state.notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1)
    }))
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0
    }))
  },

  removeNotification: (notificationId) => {
    set((state) => {
      const notification = state.notifications.find(n => n.id === notificationId)
      const wasUnread = notification && !notification.read
      
      return {
        notifications: state.notifications.filter(n => n.id !== notificationId),
        unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount
      }
    })
  },

  clearNotifications: () => {
    set({ notifications: [], unreadCount: 0 })
  },

  // Get notifications by type
  getNotificationsByType: (type) => {
    const { notifications } = get()
    return notifications.filter(n => n.type === type)
  },

  // Get unread notifications
  getUnreadNotifications: () => {
    const { notifications } = get()
    return notifications.filter(n => !n.read)
  }
}))

// Helper function to get status text in Vietnamese
function getStatusText(status) {
  const statusMap = {
    pending: 'đang chờ xử lý',
    confirmed: 'đã xác nhận',
    packing: 'đang đóng gói',
    shipping: 'đang giao hàng',
    delivered: 'đã giao thành công',
    cancelled: 'đã hủy',
    returned: 'đã trả hàng'
  }
  
  return statusMap[status] || 'được cập nhật'
}

export { useSocketStore }
