package entity
import "gorm.io/gorm"
// สถานะของชมรม
type ClubStatus struct {
	gorm.Model
	Name        string
	Description string
	IsActive    bool
	Clubs       []Club `gorm:"foreignKey:StatusID"`
}