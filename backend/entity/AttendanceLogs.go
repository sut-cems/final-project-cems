package entity

import (
	"gorm.io/gorm"
	"time"
)

type AttendanceLog struct {
	gorm.Model
	RegistrationID uint
	CheckinTime    time.Time
	CheckoutTime   time.Time

	Registration ActivityRegistration `gorm:"foreignKey:RegistrationID"`
}
