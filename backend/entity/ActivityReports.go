package entity 
import (
	"gorm.io/gorm"
	"time"
)
// รายงานกิจกรรม
type ActivityReport struct {
	gorm.Model
	UserID     uint
	Type       string
	FileURL    string
	GeneratedAt time.Time
}