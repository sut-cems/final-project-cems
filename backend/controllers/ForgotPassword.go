package controllers

import (
	"final-project/cems/entity"
	"final-project/cems/utils"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type AuthHandler struct {
	DB *gorm.DB
}

// 1. ลืมรหัสผ่าน
func (h *AuthHandler) ForgotPassword(c *gin.Context) {
	var req struct {
		Email string `json:"email"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid email"})
		return
	}

	var user entity.User
	if err := h.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Email not found"})
		return
	}

	token, err := utils.GenerateSecureToken(32)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถสร้าง token ได้"})
		return
	}

	expiredAt := time.Now().Add(30 * time.Minute)

	h.DB.Create(&entity.PasswordReset{
		Email:     req.Email,
		Token:     token,
		ExpiredAt: expiredAt,
		Used:      false,
	})

	resetLink := fmt.Sprintf("http://localhost:5173/reset-password?token=%s", token)
	// ใน production ให้ส่ง email จริง
	if err := utils.SendResetEmail(req.Email, resetLink); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send reset email"})
		return
	}


	c.JSON(http.StatusOK, gin.H{"message": "Reset link sent"})
}

// 2. ตรวจสอบ token
func (h *AuthHandler) VerifyResetToken(c *gin.Context) {
	token := c.Query("token")

	var pr entity.PasswordReset
	if err := h.DB.Where("token = ? AND used = false", token).First(&pr).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or used token"})
		return
	}

	if time.Now().After(pr.ExpiredAt) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Token expired"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"email": pr.Email})
}

// 3. เปลี่ยนรหัสผ่านใหม่
func (h *AuthHandler) ResetPassword(c *gin.Context) {
	var req struct {
		Token       string `json:"token"`
		NewPassword string `json:"new_password"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	var pr entity.PasswordReset
	if err := h.DB.Where("token = ? AND used = false", req.Token).First(&pr).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or used token"})
		return
	}

	if time.Now().After(pr.ExpiredAt) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Token expired"})
		return
	}

	var user entity.User
	if err := h.DB.Where("email = ?", pr.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User not found"})
		return
	}

	hashedPassword, err := utils.HashPassword(req.NewPassword)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	user.Password = hashedPassword
	if err := h.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update password"})
		return
	}

	pr.Used = true
	h.DB.Save(&pr)

	c.JSON(http.StatusOK, gin.H{"message": "Password has been reset successfully"})
}
