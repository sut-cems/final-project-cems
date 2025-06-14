package entity
import (
	"gorm.io/gorm"
	"time"
)
// สมาชิกของชมรม
type ClubMember struct {
	gorm.Model
	UserID   uint
	ClubID   uint
	Role     string
	JoinedAt time.Time
}