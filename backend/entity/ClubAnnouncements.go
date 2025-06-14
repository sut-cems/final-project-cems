package entity
import (
	"gorm.io/gorm"
	"time"
)
// ข่าวสารของชมรม
type ClubAnnouncement struct {
	gorm.Model
	ClubID    uint
	Title     string
	Content   string
	CreatedAt time.Time
}
