package entity
import "gorm.io/gorm"
// ชั่วโมงกิจกรรมของผู้ใช้
type ActivityHour struct {
	gorm.Model
	UserID     uint
	ActivityID uint
	Hours      float64
	VerifiedBy uint
}