package controllers

import (
	"net/http"

	"final-project/cems/config"
	"final-project/cems/entity"
	"github.com/gin-gonic/gin"
)

func GetRoles(c *gin.Context) {
	db := config.DB()
	var roles []entity.Role
	if err := db.Find(&roles).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Roles fetched successfully", "data": roles})
}

func CreateRole(c *gin.Context) {
	db := config.DB()
	var input entity.Role
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := db.Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Role created", "data": input})
}

