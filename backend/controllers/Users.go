package controllers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"

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
	if err := db.Preload("Role").Preload("Faculty").Preload("Program").Preload("CreatedClubs").Preload("ClubMembers").Preload("Registrations").Preload("VerifiedHours").Preload("GeneratedReports").First(&user, id).Error; err != nil {
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

// GET /users/search?q=<search_term> - ค้นหาผู้ใช้ด้วยชื่อ, นามสกุล, รหัสนักศึกษา
func SearchUsers(c *gin.Context) {
	db := config.DB()
	query := c.Query("q")
	
	// ตรวจสอบว่ามี query parameter หรือไม่
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Search query is required"})
		return
	}
	
	// ทำความสะอาด query
	query = strings.TrimSpace(query)
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Search query cannot be empty"})
		return
	}
	
	var users []entity.User
	
	// สร้าง search pattern สำหรับ LIKE query
	searchPattern := "%" + query + "%"
	
	// ค้นหาใน FirstName, LastName, StudentID และ ID
	if err := db.Preload("Role").Preload("Faculty").Preload("Program").
		Where("first_name LIKE ? OR last_name LIKE ? OR student_id LIKE ? OR CONCAT(first_name, ' ', last_name) LIKE ? OR id = ?", 
			searchPattern, searchPattern, searchPattern, searchPattern, query).
		Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"message": "Search completed successfully",
		"query": query,
		"count": len(users),
		"data": users,
	})
}
// PATCH /users/:id/profile - อัปเดตโปรไฟล์ผู้ใช้ (รวมถึงรูปภาพ)
// PATCH /users/:id/profile - อัปเดตโปรไฟล์ผู้ใช้ (รวมถึงรูปภาพ)
func UpdateUserProfile(c *gin.Context) {
    userID := c.Param("id")
    db := config.DB()

    // 1. Find user in DB
    var user entity.User
    if err := db.First(&user, "id = ?", userID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
        return
    }

    // 2. Parse form fields (text)
    user.FirstName = c.PostForm("FirstName")
    user.LastName = c.PostForm("LastName")
    user.Email = c.PostForm("Email")
    user.StudentID = c.PostForm("StudentID")

    // 3. Parse multipart form (file)
    file, err := c.FormFile("profile_picture")
    if err == nil {
        // 3.1 Validate file type
        ext := strings.ToLower(filepath.Ext(file.Filename))
        if ext != ".jpg" && ext != ".jpeg" && ext != ".png" {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Only JPG, JPEG, and PNG are allowed"})
            return
        }

        // 3.2 Remove old profile image
        imageDir := filepath.Join("images", "profiles", "admins")
        pattern := fmt.Sprintf("admin%s.*", userID)
        matches, _ := filepath.Glob(filepath.Join(imageDir, pattern))
        for _, match := range matches {
            _ = os.Remove(match)
        }

        // 3.3 Set new file path
        filename := fmt.Sprintf("admin%s%s", userID, ext)
        path := filepath.Join(imageDir, filename)

        // 3.4 Save new file
        if err := c.SaveUploadedFile(file, path); err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to save file"})
            return
        }

        // 3.5 Update image path
        user.ProfileImage = "/" + path
    }

    // 4. Save updated user
    if err := db.Save(&user).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user profile"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "message":         "Profile updated successfully",
        "profile_picture": user.ProfileImage,
    })
}
