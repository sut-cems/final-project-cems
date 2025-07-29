package controllers

import (
	"final-project/cems/config"
	"final-project/cems/entity"
	"net/http"

	"github.com/gin-gonic/gin"

)

func GetActivityStatus(c *gin.Context) {
	var status []entity.ActivityStatus
	db := config.DB()

	db.Find(&status)

	c.JSON(http.StatusOK, gin.H{
		"status": status,
	})
}