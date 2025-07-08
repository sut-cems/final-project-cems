package entity

import "gorm.io/gorm"

type ActivityPhoto struct {
	gorm.Model
	Url        string
	UploadedBy string

	ActivityID uint
	Activity   Activity  `gorm:"foreignKey:ActivityID"`
}
