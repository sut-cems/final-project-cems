package entity 
import ("time"
 "gorm.io/gorm"
)
// การลงทะเบียนเข้าร่วมกิจกรรม
type ActivityRegistration struct {
	gorm.Model
	ActivityID   uint
	Activity	Activity
	UserID       uint
	User		User
	StatusID     uint
	Status		ActivityRegistrationStatus
	
	RegisteredAt time.Time
}
