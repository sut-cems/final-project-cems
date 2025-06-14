package entity
import "gorm.io/gorm"
// หมวดหมู่กิจกรรม
type EventCategory struct {
	gorm.Model
	Name        string
	Description string
	Activities  []Activity `gorm:"foreignKey:CategoryID"`
}
