package entity
import (
	"gorm.io/gorm"
	"time"
)
// การอัปโหลดสื่อ
type MediaUpload struct {
	gorm.Model
	ActivityID uint
	MediaType  string
	URL        string
	UploadedAt time.Time
}