package entity
import (
	"time"
	"gorm.io/gorm")
// กิจกรรม
type Activity struct {
	gorm.Model
	Title       string
	Description string
	Location    string
	DateStart   time.Time
	DateEnd     time.Time
	Capacity    int
	PosterImage string
	StatusID    uint
	ClubID      uint
	CategoryID  uint

	Status   ActivityStatus
	Club     Club
	Category EventCategory
	ActivityRegistrations []ActivityRegistration `gorm:"foreignKey:ActivityID"`
}