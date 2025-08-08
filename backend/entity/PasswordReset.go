package entity

import (
	"time"
	"gorm.io/gorm"
)

type PasswordReset struct {
	gorm.Model
	Email     string
	Token     string `gorm:"uniqueIndex"`
	ExpiredAt time.Time
	Used      bool
}

