package controllers

import (
	"final-project/cems/config"
	"final-project/cems/entity"
	"net/http"

	"github.com/gin-gonic/gin"

)

func GetActivityCategory(c *gin.Context) {
	var categories []entity.EventCategory
	db := config.DB()

	db.Find(&categories)

	c.JSON(http.StatusOK, gin.H{
		"categories": categories,
	})
}