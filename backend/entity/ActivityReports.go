package entity

import (
	"gorm.io/gorm"
	"time"
)

type ActivityReport struct {
	gorm.Model
	Name        string
	UserID      uint
	ActivityID  uint 
	Type        string
	FileURL     string
	GeneratedAt time.Time
	Status      string

	User     User     `gorm:"foreignKey:UserID"`
	Activity Activity `gorm:"foreignKey:ActivityID"`
}
