package controllers

import (
	"final-project/cems/config"
	"final-project/cems/entity"
	"net/http"

	"github.com/gin-gonic/gin"
)

type Faculty struct {
	ID   uint
	Name string
}

func GetAllFacultiesWithPrograms(c *gin.Context) {
	db := config.DB()
	var faculties []entity.Faculty
	if err := db.Preload("Program").Find(&faculties).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"faculties": faculties})
}
