package entity

import "gorm.io/gorm"

type User struct {
	gorm.Model
	Email        string `gorm:"unique"`
	FirstName    string
	LastName     string
	StudentID    string `gorm:"unique"`
	Password     string
	ProfileImage string
	IsActive     bool
	RoleID       uint
	Role         Role
	FacultyID    uint
	Faculty      Faculty
	ProgramID    uint
	Program      Program
	ActivityHour int

	CreatedClubs     []Club                 `gorm:"foreignKey:CreatedBy"`
	ClubMembers      []ClubMember           `gorm:"foreignKey:UserID"`
	Registrations    []ActivityRegistration `gorm:"foreignKey:UserID"`
	VerifiedHours    []ActivityHour         `gorm:"foreignKey:VerifiedBy"`
	GeneratedReports []ActivityReport       `gorm:"foreignKey:UserID"`
	Notifications    []Notification         `gorm:"foreignKey:UserID"`
}
