package entity

import "gorm.io/gorm"

type Faculty struct {
	gorm.Model
	Name string

	Program []Program `gorm:"foreignKey:FacultyID;constraint:OnDelete:CASCADE"`
	Users   []User    `gorm:"foreignKey:FacultyID"`
}
