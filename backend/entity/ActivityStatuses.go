package entity
import "gorm.io/gorm"
// สถานะกิจกรรม
type ActivityStatus struct {
	gorm.Model
	Name        string
	Description string
	IsActive    bool
	Activities  []Activity `gorm:"foreignKey:StatusID"`
}
