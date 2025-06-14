package controllers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"
	"fmt"

	"final-project/cems/config"
	"final-project/cems/entity"
	"final-project/cems/services"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type NotificationHandler struct {
	DB                *gorm.DB
	NotificationService *services.NotificationService
}

// NotificationResponse struct สำหรับ response ที่มี format ถูกต้อง
type NotificationResponse struct {
	ID        uint      `json:"ID"`
	UserID    uint      `json:"UserID"`
	Message   string    `json:"Message"`
	Type      string    `json:"Type"`
	IsRead    bool      `json:"IsRead"`
	CreatedAt string    `json:"CreatedAt"` // ใช้ string แทน time.Time เพื่อให้ JSON format ถูกต้อง
}

func NewNotificationHandler(db *gorm.DB) *NotificationHandler {
	return &NotificationHandler{
		DB:                db,
		NotificationService: services.NewNotificationService(db),
	}
}

// GetNotifications ดึงการแจ้งเตือนทั้งหมดของ user
func (h *NotificationHandler) GetNotifications(c *gin.Context) {
	userIDStr := c.Param("userId")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var notifications []entity.Notification
	if err := h.DB.Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&notifications).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch notifications"})
		return
	}

	// สร้าง response slice - เริ่มต้นเป็น empty array แทน nil
	response := make([]NotificationResponse, 0)
	
	// แปลง entity เป็น response format
	for _, notification := range notifications {
		response = append(response, NotificationResponse{
			ID:        notification.ID,
			UserID:    notification.UserID,
			Message:   notification.Message,
			Type:      notification.Type,
			IsRead:    notification.IsRead,
			CreatedAt: notification.CreatedAt.Format(time.RFC3339), // ใช้ RFC3339 format
		})
	}

	c.JSON(http.StatusOK, response)
}

// MarkAsRead อัพเดตสถานะอ่านแล้ว
func (h *NotificationHandler) MarkAsRead(c *gin.Context) {
	notificationIDStr := c.Param("notificationId")
	notificationID, err := strconv.ParseUint(notificationIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid notification ID"})
		return
	}

	var notification entity.Notification
	if err := h.DB.First(&notification, notificationID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Notification not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find notification"})
		return
	}

	if err := h.DB.Model(&entity.Notification{}).
		Where("id = ?", notificationID).
		Update("is_read", true).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update notification"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Notification marked as read", "success": true})
}

// MarkAllAsRead อัพเดตอ่านทั้งหมด
func (h *NotificationHandler) MarkAllAsRead(c *gin.Context) {
	userIDStr := c.Param("userId")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var user entity.User
	if err := h.DB.First(&user, userID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find user"})
		return
	}

	if err := h.DB.Model(&entity.Notification{}).
		Where("user_id = ? AND is_read = ?", userID, false).
		Update("is_read", true).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update notifications"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "All notifications marked as read", "success": true})
}

// StreamNotifications สำหรับ Server-Sent Events
func (h *NotificationHandler) StreamNotifications(c *gin.Context) {
	userIDStr := c.Param("userId")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	// Set SSE headers
	w := c.Writer
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Cache-Control")

	// สร้าง channel สำหรับรับ notifications
	notificationChan := make(chan entity.Notification, 10)
	
	// Register client กับ notification service
	clientID := h.NotificationService.RegisterClient(uint(userID), notificationChan)
	defer h.NotificationService.UnregisterClient(clientID)

	// Keep connection alive
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case notification := <-notificationChan:
			// สร้าง response object
			notificationResponse := NotificationResponse{
				ID:        notification.ID,
				UserID:    notification.UserID,
				Message:   notification.Message,
				Type:      notification.Type,
				IsRead:    notification.IsRead,
				CreatedAt: notification.CreatedAt.Format(time.RFC3339),
			}

			// แปลงเป็น JSON
			jsonData, err := json.Marshal(notificationResponse)
			if err != nil {
				fmt.Printf("Error marshaling notification: %v\n", err)
				continue
			}

			// ส่งข้อมูล JSON ไปยัง client
			data := fmt.Sprintf("data: %s\n\n", string(jsonData))
			w.Write([]byte(data))
			w.Flush()

		case <-ticker.C:
			heartbeat := map[string]string{"type": "heartbeat"}
			heartbeatJSON, _ := json.Marshal(heartbeat)
			w.Write([]byte(fmt.Sprintf("data: %s\n\n", string(heartbeatJSON))))
			w.Flush()

		case <-c.Request.Context().Done():
			return
		}
	}
}

func GetALLNotifications(c *gin.Context) {
	db := config.DB()
	var notifications []entity.Notification
	if err := db.Find(&notifications).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// สร้าง response slice - เริ่มต้นเป็น empty array แทน nil
	response := make([]NotificationResponse, 0)
	
	// แปลงเป็น response format
	for _, notification := range notifications {
		response = append(response, NotificationResponse{
			ID:        notification.ID,
			UserID:    notification.UserID,
			Message:   notification.Message,
			Type:      notification.Type,
			IsRead:    notification.IsRead,
			CreatedAt: notification.CreatedAt.Format(time.RFC3339),
		})
	}

	c.JSON(http.StatusOK, gin.H{"message": "Notifications fetched", "data": response})
}

func CreateNotification(c *gin.Context) {
	db := config.DB()
	var input entity.Notification
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	// ตรวจสอบว่า UserID ถูกต้องหรือไม่
	if input.UserID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "UserID is required"})
		return
	}

	// ตั้งค่า CreatedAt ถ้าไม่มี
	if input.CreatedAt.IsZero() {
		input.CreatedAt = time.Now()
	}

	// ตรวจสอบว่า user มีอยู่หรือไม่
	var user entity.User
	if err := db.First(&user, input.UserID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify user"})
		return
	}

	if err := db.Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// แปลงเป็น response format
	response := NotificationResponse{
		ID:        input.ID,
		UserID:    input.UserID,
		Message:   input.Message,
		Type:      input.Type,
		IsRead:    input.IsRead,
		CreatedAt: input.CreatedAt.Format(time.RFC3339),
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Notification created", "data": response})
}