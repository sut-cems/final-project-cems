package entity
import (
	"gorm.io/gorm"
	"time"
)
// การบันทึกเวลาเช็กชื่อ
type AttendanceLog struct {
	gorm.Model
	RegistrationID uint
	CheckinTime    time.Time
	CheckoutTime   time.Time
}