package services

import (
	"final-project/cems/entity"
	"fmt"
	"sync"
	"log"

	"gorm.io/gorm"
	"time"
)

type Client struct {
	ID     string
	UserID uint
	Chan   chan entity.Notification
}

type NotificationService struct {
	DB      *gorm.DB
	clients map[string]*Client
	mutex   sync.RWMutex
}

func NewNotificationService(db *gorm.DB) *NotificationService {
	return &NotificationService{
		DB:      db,
		clients: make(map[string]*Client),
	}
}

// RegisterClient ลงทะเบียน client สำหรับ SSE
func (s *NotificationService) RegisterClient(userID uint, notificationChan chan entity.Notification) string {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	clientID := fmt.Sprintf("%d_%d", userID, time.Now().UnixNano())
	client := &Client{
		ID:     clientID,
		UserID: userID,
		Chan:   notificationChan,
	}
	
	s.clients[clientID] = client
	log.Printf("Client registered: %s for user: %d", clientID, userID)
	return clientID
}

// UnregisterClient ยกเลิกการลงทะเบียน client
func (s *NotificationService) UnregisterClient(clientID string) {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	if client, exists := s.clients[clientID]; exists {
		close(client.Chan) // ปิด channel เพื่อป้องกัน memory leak
		delete(s.clients, clientID)
		log.Printf("Client unregistered: %s", clientID)
	}
}

// BroadcastToUser ส่งการแจ้งเตือนไปยัง user ที่ระบุ
func (s *NotificationService) BroadcastToUser(userID uint, notification entity.Notification) {
	s.mutex.RLock()
	defer s.mutex.RUnlock()

	clientCount := 0
	for _, client := range s.clients {
		if client.UserID == userID {
			clientCount++
			select {
			case client.Chan <- notification:
				log.Printf("Notification sent to client %s for user %d", client.ID, userID)
			default:
				// Channel is full, skip this client
				log.Printf("Channel is full for client %s, skipping notification", client.ID)
			}
		}
	}
	
	if clientCount == 0 {
		log.Printf("No active clients found for user %d", userID)
	}
}

// CreateNotification สร้างการแจ้งเตือนใหม่
func (s *NotificationService) CreateNotification(userID uint, message, notificationType string) error {
	// ตรวจสอบว่า user มีอยู่หรือไม่
	var user entity.User
	if err := s.DB.First(&user, userID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return fmt.Errorf("user with ID %d not found", userID)
		}
		return fmt.Errorf("failed to verify user: %w", err)
	}

	// ตรวจสอบ input validation
	if message == "" {
		return fmt.Errorf("message cannot be empty")
	}
	if notificationType == "" {
		notificationType = "general" // default type
	}

	notification := entity.Notification{
		UserID:    userID,
		Message:   message,
		Type:      notificationType,
		IsRead:    false,
		CreatedAt: time.Now(),
	}

	if err := s.DB.Create(&notification).Error; err != nil {
		return fmt.Errorf("failed to create notification: %w", err)
	}

	// ส่งการแจ้งเตือนแบบ real-time
	s.BroadcastToUser(userID, notification)
	log.Printf("Notification created for user %d: %s", userID, message)
	return nil
}

// BroadcastToAllUsers ส่งการแจ้งเตือนไปยัง user ทั้งหมด
func (s *NotificationService) BroadcastToAllUsers(message, notificationType string) error {
	if message == "" {
		return fmt.Errorf("message cannot be empty")
	}
	if notificationType == "" {
		notificationType = "general" // default type
	}

	var users []entity.User
	if err := s.DB.Find(&users).Error; err != nil {
		return fmt.Errorf("failed to fetch users: %w", err)
	}

	successCount := 0
	errorCount := 0

	for _, user := range users {
		if err := s.CreateNotification(user.ID, message, notificationType); err != nil {
			log.Printf("Failed to create notification for user %d: %v", user.ID, err)
			errorCount++
			continue
		}
		successCount++
	}

	log.Printf("Broadcast notification completed: %d success, %d errors", successCount, errorCount)
	
	if errorCount > 0 && successCount == 0 {
		return fmt.Errorf("failed to send notifications to all users")
	}

	return nil
}

// GetNotificationsByUser ดึงการแจ้งเตือนของ user 
func (s *NotificationService) GetNotificationsByUser(userID uint, limit int, offset int) ([]entity.Notification, error) {
	var notifications []entity.Notification
	
	query := s.DB.Where("user_id = ?", userID).Order("created_at DESC")
	
	if limit > 0 {
		query = query.Limit(limit)
	}
	if offset > 0 {
		query = query.Offset(offset)
	}

	if err := query.Find(&notifications).Error; err != nil {
		return nil, fmt.Errorf("failed to fetch notifications: %w", err)
	}

	return notifications, nil
}

// MarkNotificationAsRead อัพเดตสถานะอ่านแล้ว 
func (s *NotificationService) MarkNotificationAsRead(notificationID uint) error {
	result := s.DB.Model(&entity.Notification{}).
		Where("id = ?", notificationID).
		Update("is_read", true)
	
	if result.Error != nil {
		return fmt.Errorf("failed to update notification: %w", result.Error)
	}
	
	if result.RowsAffected == 0 {
		return fmt.Errorf("notification with ID %d not found", notificationID)
	}

	return nil
}

// MarkAllNotificationsAsRead อัพเดตอ่านทั้งหมด 
func (s *NotificationService) MarkAllNotificationsAsRead(userID uint) error {
	result := s.DB.Model(&entity.Notification{}).
		Where("user_id = ? AND is_read = ?", userID, false).
		Update("is_read", true)
	
	if result.Error != nil {
		return fmt.Errorf("failed to update notifications: %w", result.Error)
	}

	log.Printf("Marked %d notifications as read for user %d", result.RowsAffected, userID)
	return nil
}

// GetUnreadCount นับจำนวนการแจ้งเตือนที่ยังไม่อ่าน 
func (s *NotificationService) GetUnreadCount(userID uint) (int64, error) {
	var count int64
	if err := s.DB.Model(&entity.Notification{}).
		Where("user_id = ? AND is_read = ?", userID, false).
		Count(&count).Error; err != nil {
		return 0, fmt.Errorf("failed to count unread notifications: %w", err)
	}
	return count, nil
}

// Cleanup ทำความสะอาด clients ที่ไม่ active 
func (s *NotificationService) Cleanup() {
	s.mutex.Lock()
	defer s.mutex.Unlock()
	
	for clientID := range s.clients {
		delete(s.clients, clientID)
	}
	log.Println("Notification service cleaned up")
}