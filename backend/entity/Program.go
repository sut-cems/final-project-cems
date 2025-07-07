package entity

import "gorm.io/gorm"

type Program struct {
	gorm.Model
	Name      string
	FacultyID uint

	Users []User `gorm:"foreignKey:ProgramID"`
}
