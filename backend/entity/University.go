package entity

import "gorm.io/gorm"

type University struct {
	gorm.Model
	Name    string
	Address string
	Phone   string
	Logo    string
}
