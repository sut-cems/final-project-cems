package entity
import (
	"gorm.io/gorm"
	"time"
)
// รีวิวกิจกรรม
type ActivityReview struct {
	gorm.Model
	ActivityID uint
	UserID     uint
	Rating     int
	Comment    string
	CreatedAt  time.Time
}
