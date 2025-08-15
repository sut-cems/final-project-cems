package controllers

import (
	"errors"
	"slices"
	"strings"

	"final-project/cems/config"
	"final-project/cems/entity"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// ดึง user_id จาก JWT (คุณมี jwtService อยู่แล้วใน controller อื่น)
func getUserFromJWT(c *gin.Context) (*entity.User, error) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		return nil, errors.New("missing Authorization header")
	}
	tokenString := strings.TrimPrefix(authHeader, "Bearer ")
	claims, err := jwtService.ValidateToken(tokenString)
	if err != nil {
		return nil, errors.New("invalid token")
	}
	var user entity.User
	if err := config.DB().Where("email = ?", claims.Email).First(&user).Error; err != nil {
		return nil, errors.New("user not found")
	}
	return &user, nil
}

// คืน true ถ้า user เป็นสมาชิกชมรมและอยู่ใน role ที่กำหนด
func hasClubRole(db *gorm.DB, userID uint, clubID uint, roles ...string) (bool, error) {
	var m entity.ClubMember
	if err := db.Where("club_id = ? AND user_id = ?", clubID, userID).First(&m).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return false, nil
		}
		return false, err
	}
	if len(roles) == 0 {
		return true, nil // แค่เป็นสมาชิก
	}
	return slices.Contains(roles, m.Role), nil
}

// บังคับสิทธิ์: ต้องเป็นหัวหน้า/รองหัวหน้า
func requireOfficer(c *gin.Context, clubID uint) (*entity.User, error) {
	db := config.DB()
	user, err := getUserFromJWT(c)
	if err != nil {
		c.JSON(401, gin.H{"error": err.Error()})
		return nil, err
	}
	ok, err := hasClubRole(db, user.ID, clubID, "president", "vice_president")
	if err != nil {
		c.JSON(500, gin.H{"error": "permission check failed"})
		return nil, err
	}
	if !ok {
		c.JSON(403, gin.H{"error": "forbidden: officer only"})
		return nil, errors.New("forbidden")
	}
	return user, nil
}

// บังคับสิทธิ์: ต้องเป็นหัวหน้าเท่านั้น
func requirePresident(c *gin.Context, clubID uint) (*entity.User, error) {
	db := config.DB()
	user, err := getUserFromJWT(c)
	if err != nil {
		c.JSON(401, gin.H{"error": err.Error()})
		return nil, err
	}
	ok, err := hasClubRole(db, user.ID, clubID, "president")
	if err != nil {
		c.JSON(500, gin.H{"error": "permission check failed"})
		return nil, err
	}
	if !ok {
		c.JSON(403, gin.H{"error": "forbidden: president only"})
		return nil, errors.New("forbidden")
	}
	return user, nil
}
