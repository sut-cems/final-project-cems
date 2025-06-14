package entity
import "gorm.io/gorm"
// ชมรม
type Club struct {
	gorm.Model
	Name        string
	Description string
	LogoImage   string
	CreatedBy   uint
	StatusID    uint
	CategoryID  uint

	Status       ClubStatus
	Category     ClubCategory
	Members      []ClubMember       `gorm:"foreignKey:ClubID"`
	Activities   []Activity         `gorm:"foreignKey:ClubID"`
	Announcements []ClubAnnouncement `gorm:"foreignKey:ClubID"`
}