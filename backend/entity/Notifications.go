package entity

import (
	"gorm.io/gorm"
	"time"
)
type Notification struct {
	gorm.Model
	UserID   uint
	Message  string
	Type     string
	IsRead   bool
	CreatedAt time.Time
}