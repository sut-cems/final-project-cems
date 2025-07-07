package entity

import "gorm.io/gorm"

type ActivityHour struct {
	gorm.Model
	UserID     uint
	ActivityID uint
	Hours      float64
	VerifiedBy uint

	User         User     `gorm:"foreignKey:UserID"`
	Activity     Activity `gorm:"foreignKey:ActivityID"`
	VerifiedUser User     `gorm:"foreignKey:VerifiedBy"`
}
