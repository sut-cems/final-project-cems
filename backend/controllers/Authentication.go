package controllers

import (
	"net/http"
	"os"
	"fmt"

	"final-project/cems/config"
	"final-project/cems/entity"
	"final-project/cems/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

var jwtService = services.JwtWrapper{
	SecretKey:       os.Getenv("JWT_SECRET"),
	Issuer:          "cems-auth",
	ExpirationHours: 24,
}

// POST /signup
func Signup(c *gin.Context) {
	db := config.DB()
	var input entity.User

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input: " + err.Error()})
		return
	}

	// เริ่ม Transaction
	err := db.Transaction(func(tx *gorm.DB) error {
		// เช็ค Email ซ้ำ
		var existing entity.User
		if err := tx.Where("email = ?", input.Email).First(&existing).Error; err == nil {
			c.JSON(http.StatusConflict, gin.H{"error": "Email is already registered"})
			return fmt.Errorf("duplicate email")
		}

		// เช็ค Student ID ซ้ำ
		var existingSID entity.User
		if err := tx.Where("student_id = ?", input.StudentID).First(&existingSID).Error; err == nil {
			c.JSON(http.StatusConflict, gin.H{"error": "Student ID is already registered"})
			return fmt.Errorf("duplicate student ID")
		}

		// Hash password
		hashed, err := config.HashPassword(input.Password)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to hash password"})
			return err
		}

		input.Password = hashed
		input.IsActive = true
		input.RoleID = 1 // student

		// สร้างผู้ใช้
		if err := tx.Create(&input).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Signup failed: " + err.Error()})
			return err
		}

		// สำเร็จ
		return nil
	})

	if err != nil {
		// หากมี error ใน transaction จะไม่ส่ง response ใน transaction block ซ้ำ
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Signup successful"})
}


// POST /login
func Login(c *gin.Context) {
	db := config.DB()

	// รับข้อมูลจากผู้ใช้
	var input struct {
		Identifier string `json:"identifier"` // รองรับ email หรือ student_id
		Password   string `json:"password"`
	}

	// ตรวจสอบรูปแบบ JSON
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input: " + err.Error()})
		return
	}

	// ค้นหาผู้ใช้ด้วย email หรือ student_id
	var user entity.User
	if err := db.Preload("Role").
		Where("email = ? OR student_id = ?", input.Identifier, input.Identifier).
		First(&user).Error; err != nil {
		// ไม่พบผู้ใช้
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email/studentID or password"})
		return
	}

	// ตรวจสอบรหัสผ่าน
	if !config.CheckPasswordHash(input.Password, user.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email/studentID or password"})
		return
	}

	// สร้าง JWT token
	token, err := jwtService.GenerateToken(user.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Token generation failed"})
		return
	}

	// ตอบกลับพร้อม token และข้อมูลผู้ใช้
	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"token":   token,
		"user": gin.H{
			"id":         user.ID,
			"email":      user.Email,
			"first_name": user.FirstName,
			"last_name":  user.LastName,
			"role":       user.Role.RoleName,
		},
	})
}

