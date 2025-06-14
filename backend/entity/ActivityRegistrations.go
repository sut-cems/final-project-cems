package entity 
import ("time"
 "gorm.io/gorm"
)
// การลงทะเบียนเข้าร่วมกิจกรรม
type ActivityRegistration struct {
	gorm.Model
	ActivityID   uint
	UserID       uint
	StatusID     uint
	RegisteredAt time.Time
}
