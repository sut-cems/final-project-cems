package entity
import "gorm.io/gorm"

// Role ของผู้ใช้
type Role struct {
	gorm.Model
	RoleName    string
	Description string
	Users       []User `gorm:"foreignKey:RoleID"`
}