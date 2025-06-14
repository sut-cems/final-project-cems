package entity
import "gorm.io/gorm"
// หมวดหมู่ของชมรม
type ClubCategory struct {
	gorm.Model
	Name        string
	Description string
	Clubs       []Club `gorm:"foreignKey:CategoryID"`
}