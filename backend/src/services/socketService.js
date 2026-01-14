/**
 * Socket.IO service for real-time communication
 */
class SocketService {
  constructor() {
    this.io = null;
  }

  /**
   * Initialize socket service with io instance
   * @param {Object} io - Socket.IO server instance
   */
  init(io) {
    this.io = io;
    console.log('✅ Socket service initialized');
  }

  /**
   * Emit event to specific user
   * @param {number} userId - User ID
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  emitToUser(userId, event, data) {
    if (!this.io) {
      console.warn('Socket service not initialized');
      return;
    }

    this.io.to(`user-${userId}`).emit(event, data);
    console.log(`📡 Emitted ${event} to user ${userId}`);
  }

  /**
   * Emit event to all staff members
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  emitToStaff(event, data) {
    if (!this.io) {
      console.warn('Socket service not initialized');
      return;
    }

    this.io.to('staff-room').emit(event, data);
    console.log(`📡 Emitted ${event} to staff room`);
  }

  /**
   * Emit event to all connected clients
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  emitToAll(event, data) {
    if (!this.io) {
      console.warn('Socket service not initialized');
      return;
    }

    this.io.emit(event, data);
    console.log(`📡 Emitted ${event} to all clients`);
  }

  /**
   * Emit order status update to user
   * @param {Object} order - Order object
   * @param {string} oldStatus - Previous status
   */
  emitOrderStatusUpdate(order, oldStatus) {
    const data = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      oldStatus,
      timestamp: new Date().toISOString(),
      message: this.getStatusMessage(order.status)
    };

    // Notify the customer
    this.emitToUser(order.userId, 'order-status-updated', data);

    // Notify staff if it's a new order or cancellation
    if (order.status === 'pending' || order.status === 'cancelled') {
      this.emitToStaff('order-status-changed', data);
    }
  }

  /**
   * Emit new order notification to staff
   * @param {Object} order - Order object
   */
  emitNewOrder(order) {
    const data = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      totalAmount: order.totalAmount,
      itemCount: order.items?.length || 0,
      timestamp: new Date().toISOString(),
      message: `New order ${order.orderNumber} received`
    };

    this.emitToStaff('new-order', data);
  }

  /**
   * Emit inventory update
   * @param {Object} product - Product object
   * @param {number} oldQuantity - Previous quantity
   * @param {number} newQuantity - New quantity
   */
  emitInventoryUpdate(product, oldQuantity, newQuantity) {
    const data = {
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      oldQuantity,
      newQuantity,
      isLowStock: newQuantity <= (product.inventory?.lowStockThreshold || 10),
      timestamp: new Date().toISOString()
    };

    // Notify staff about inventory changes
    this.emitToStaff('inventory-updated', data);

    // Notify all clients if product goes out of stock
    if (newQuantity === 0 && oldQuantity > 0) {
      this.emitToAll('product-out-of-stock', {
        productId: product.id,
        productName: product.name,
        sku: product.sku
      });
    }
  }

  /**
   * Emit low stock alert
   * @param {Object} product - Product object
   * @param {number} currentQuantity - Current quantity
   */
  emitLowStockAlert(product, currentQuantity) {
    const data = {
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      currentQuantity,
      threshold: product.inventory?.lowStockThreshold || 10,
      timestamp: new Date().toISOString(),
      message: `Low stock alert: ${product.name} (${currentQuantity} remaining)`
    };

    this.emitToStaff('low-stock-alert', data);
  }

  /**
   * Emit user activity notification
   * @param {number} userId - User ID
   * @param {string} activity - Activity type
   * @param {Object} data - Activity data
   */
  emitUserActivity(userId, activity, data) {
    const activityData = {
      userId,
      activity,
      data,
      timestamp: new Date().toISOString()
    };

    // Notify staff about important user activities
    if (['registration', 'large-order', 'complaint'].includes(activity)) {
      this.emitToStaff('user-activity', activityData);
    }
  }

  /**
   * Emit system notification
   * @param {string} type - Notification type (info, warning, error)
   * @param {string} message - Notification message
   * @param {Object} data - Additional data
   */
  emitSystemNotification(type, message, data = {}) {
    const notification = {
      type,
      message,
      data,
      timestamp: new Date().toISOString()
    };

    // Send to staff for system notifications
    this.emitToStaff('system-notification', notification);
  }

  /**
   * Get status message for order status
   * @param {string} status - Order status
   * @returns {string} Status message
   */
  getStatusMessage(status) {
    const messages = {
      pending: 'Your order is pending confirmation',
      confirmed: 'Your order has been confirmed',
      packing: 'Your order is being packed',
      shipping: 'Your order is on its way',
      delivered: 'Your order has been delivered',
      cancelled: 'Your order has been cancelled',
      returned: 'Your order return has been processed'
    };

    return messages[status] || 'Order status updated';
  }

  /**
   * Get connected clients count
   * @returns {number} Number of connected clients
   */
  getConnectedClientsCount() {
    if (!this.io) return 0;
    return this.io.engine.clientsCount;
  }

  /**
   * Get clients in specific room
   * @param {string} room - Room name
   * @returns {Promise<Array>} Array of socket IDs
   */
  async getClientsInRoom(room) {
    if (!this.io) return [];
    
    try {
      const sockets = await this.io.in(room).fetchSockets();
      return sockets.map(socket => socket.id);
    } catch (error) {
      console.error('Error fetching clients in room:', error);
      return [];
    }
  }

  /**
   * Disconnect user from all rooms
   * @param {string} socketId - Socket ID
   */
  disconnectUser(socketId) {
    if (!this.io) return;
    
    const socket = this.io.sockets.sockets.get(socketId);
    if (socket) {
      socket.disconnect(true);
    }
  }

  /**
   * Send private message to user
   * @param {number} userId - User ID
   * @param {string} message - Message content
   * @param {Object} metadata - Additional metadata
   */
  sendPrivateMessage(userId, message, metadata = {}) {
    const data = {
      message,
      metadata,
      timestamp: new Date().toISOString(),
      type: 'private'
    };

    this.emitToUser(userId, 'private-message', data);
  }

  /**
   * Broadcast announcement to all users
   * @param {string} title - Announcement title
   * @param {string} message - Announcement message
   * @param {string} type - Announcement type (info, warning, success)
   */
  broadcastAnnouncement(title, message, type = 'info') {
    const data = {
      title,
      message,
      type,
      timestamp: new Date().toISOString()
    };

    this.emitToAll('announcement', data);
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
