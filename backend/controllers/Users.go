package controllers

import (
	"net/http"

	"final-project/cems/config"
	"final-project/cems/entity"

	"github.com/gin-gonic/gin"
)

// GET /users - ดึงข้อมูลผู้ใช้ทั้งหมด
func GetUsers(c *gin.Context) {
	db := config.DB()
	var users []entity.User
	if err := db.Preload("Role").Preload("CreatedClubs").Preload("ClubMembers").Preload("Registrations").Preload("VerifiedHours").Preload("GeneratedReports").Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "All users fetched successfully",
		"count": len(users),
		"data": users,
	})
}

// GET /users/:id - ดึงข้อมูลผู้ใช้ตาม ID
func GetUserByID(c *gin.Context) {
	db := config.DB()
	id := c.Param("id")
	var user entity.User
	if err := db.Preload("Role").Preload("CreatedClubs").Preload("ClubMembers").Preload("Registrations").Preload("VerifiedHours").Preload("GeneratedReports").First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "User fetched successfully",
		"data": user,
	})
}

// POST /users - สร้างผู้ใช้ใหม่
func CreateUser(c *gin.Context) {
	db := config.DB()
	var input entity.User
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := db.Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{
		"message": "User created successfully",
		"data": input,
	})
}

// PATCH /users/:id - แก้ไขข้อมูลผู้ใช้
func UpdateUser(c *gin.Context) {
	// ใช้สำหรับ PATCH แทน PUT
	db := config.DB()
	id := c.Param("id")
	var user entity.User
	if err := db.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	var input entity.User
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db.Model(&user).Updates(input)
	c.JSON(http.StatusOK, gin.H{
		"message": "User updated successfully",
		"data": user,
	})
}

// DELETE /users/:id - ลบผู้ใช้
func DeleteUser(c *gin.Context) {
	db := config.DB()
	id := c.Param("id")
	if err := db.Delete(&entity.User{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "User deleted"})
}
