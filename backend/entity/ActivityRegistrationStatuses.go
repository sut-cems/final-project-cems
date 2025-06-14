package entity
import "gorm.io/gorm"
// สถานะของการลงทะเบียนกิจกรรม
type ActivityRegistrationStatus struct {
	gorm.Model
	Name        string
	Description string
	IsActive    bool
}