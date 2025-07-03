package controllers

import (
	"errors"
	"net/http"
	"strconv"
	"strings"
	"time"

	"final-project/cems/config"
	"final-project/cems/entity"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ClubMemberInfo struct {
	ID        uint   `json:"id"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Email     string `json:"email"`
	ClubRole  string `json:"club_role"`
	JoinedAt  time.Time `json:"joined_at"`
}

type EnhancedClubCategory struct {
	ID          uint                `json:"id"`
	Name        string              `json:"name"`
	Description string              `json:"description"`
	ClubCount   int64               `json:"club_count"`
	Clubs       []EnhancedClub      `json:"clubs"`
}

type EnhancedClub struct {
	ID            uint                `json:"id"`
	Name          string              `json:"name"`
	Description   string              `json:"description"`
	LogoImage     string              `json:"logo_image"`
	CreatedBy     uint                `json:"created_by"`
	StatusID      uint                `json:"status_id"`
	CategoryID    uint                `json:"category_id"`
	MemberCount   int64               `json:"member_count"`
	ActivityCount int64               `json:"activity_count"`
	Status        entity.ClubStatus   `json:"status"`
	Members       []entity.ClubMember `json:"members"`
	Activities    []entity.Activity   `json:"activities"`
}

type CategoryStats struct {
	TotalCategories int64 `json:"total_categories"`
	TotalClubs      int64 `json:"total_clubs"`
	TotalMembers    int64 `json:"total_members"`
	TotalActivities int64 `json:"total_activities"`
}

func GetCategoriesWithClubs(c *gin.Context) {
	db := config.DB()
	var categories []entity.ClubCategory
	var enhancedCategories []EnhancedClubCategory

	// Preload all related data
	if err := db.Preload("Clubs.Status").
		Preload("Clubs.Members").
		Preload("Clubs.Activities").
		Find(&categories).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var stats CategoryStats
	stats.TotalCategories = int64(len(categories))

	for _, category := range categories {
		enhancedCategory := EnhancedClubCategory{
			ID:          category.ID,
			Name:        category.Name,
			Description: category.Description,
			ClubCount:   int64(len(category.Clubs)),
			Clubs:       make([]EnhancedClub, 0),
		}

		stats.TotalClubs += int64(len(category.Clubs))

		for _, club := range category.Clubs {
			enhancedClub := EnhancedClub{
				ID:            club.ID,
				Name:          club.Name,
				Description:   club.Description,
				LogoImage:     club.LogoImage,
				CreatedBy:     club.CreatedBy,
				StatusID:      club.StatusID,
				CategoryID:    club.CategoryID,
				MemberCount:   int64(len(club.Members)),
				ActivityCount: int64(len(club.Activities)),
				Status:        club.Status,
				Members:       club.Members,
				Activities:    club.Activities,
			}

			stats.TotalMembers += int64(len(club.Members))
			stats.TotalActivities += int64(len(club.Activities))

			enhancedCategory.Clubs = append(enhancedCategory.Clubs, enhancedClub)
		}

		enhancedCategories = append(enhancedCategories, enhancedCategory)
	}

	c.JSON(http.StatusOK, gin.H{
		"message":    "Categories with clubs and statistics fetched successfully",
		"data":       enhancedCategories,
		"statistics": stats,
	})
}

func LeaveClub(c *gin.Context) {
	db := config.DB()
	clubID := c.Param("id")

	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "No Authorization header"})
		return
	}

	tokenString := strings.TrimPrefix(authHeader, "Bearer ")
	claims, err := jwtService.ValidateToken(tokenString)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		return
	}

	var user entity.User
	if err := db.Where("email = ?", claims.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	clubIDInt, err := strconv.Atoi(clubID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid club ID"})
		return
	}

	// ตรวจสอบว่าผู้ใช้เป็นสมาชิกก่อน
	var member entity.ClubMember
	if err := db.Where("club_id = ? AND user_id = ?", clubIDInt, user.ID).First(&member).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบสถานะสมาชิกในชมรมนี้"})
		return
	}

	// ลบสมาชิก
	if err := db.Delete(&member).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถออกจากชมรมได้"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "ออกจากชมรมเรียบร้อยแล้ว",
		"action":  "leave",
	})
}


func RequestJoinClub(c *gin.Context) {
	db := config.DB()
	clubID := c.Param("id")

	//อ่าน user จาก token
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "ไม่มี Authorization header"})
		return
	}
	tokenString := strings.TrimPrefix(authHeader, "Bearer ")
	claims, err := jwtService.ValidateToken(tokenString)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token ไม่ถูกต้อง"})
		return
	}

	var user entity.User
	if err := db.Where("email = ?", claims.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "ไม่พบผู้ใช้"})
		return
	}

	// ตรวจสอบ club ID
	clubIDInt, err := strconv.Atoi(clubID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "รหัสชมรมไม่ถูกต้อง"})
		return
	}

	// ตรวจสอบสมาชิกซ้ำ
	var existing entity.ClubMember
	if err := db.Where("club_id = ? AND user_id = ?", clubIDInt, user.ID).First(&existing).Error; err == nil {
		if existing.Role == "pending" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "คุณได้ส่งคำขอแล้ว โปรดรอการอนุมัติ"})
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": "คุณเป็นสมาชิกชมรมนี้อยู่แล้ว"})
		}
		return
	}

	// เพิ่มสถานะรออนุมัติ
	newMember := entity.ClubMember{
		UserID:   user.ID,
		ClubID:   uint(clubIDInt),
		Role:     "pending",
		JoinedAt: time.Now(),
	}
	if err := db.Create(&newMember).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถส่งคำขอเข้าร่วมได้"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "ส่งคำขอเข้าร่วมชมรมเรียบร้อยแล้ว โปรดรอการอนุมัติ",
	})
}


func ApproveClubMember(c *gin.Context) {
	db := config.DB()
	clubID := c.Param("id")
	userID := c.Param("userId")

	clubIDInt, err1 := strconv.Atoi(clubID)
	userIDInt, err2 := strconv.Atoi(userID)
	if err1 != nil || err2 != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid club or user id"})
		return
	}

	if err := db.Model(&entity.ClubMember{}).
		Where("club_id = ? AND user_id = ?", clubIDInt, userIDInt).
		Update("role", "member").Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถอนุมัติสมาชิกได้"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "อนุมัติสมาชิกเรียบร้อยแล้ว"})
}

func GetMembersByClubID(c *gin.Context) {
	db := config.DB()
	clubID := c.Param("id")

	// Validate token
    authHeader := c.GetHeader("Authorization")
    if authHeader == "" {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "No Authorization header"})
        return
    }

    tokenString := strings.TrimPrefix(authHeader, "Bearer ")
    if tokenString == authHeader {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid Bearer token format"})
        return
    }

    claims, err := jwtService.ValidateToken(tokenString)
    if err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token: " + err.Error()})
        return
    }
	
	// หา user ด้วย email
    var user entity.User
    if err := db.Where("email = ?", claims.Email).First(&user).Error; err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
        return
    }

	// ตรวจสอบว่า user นี้เป็นหัวหน้าชมรมหรือ vice_president หรือ club_admin หรือไม่
	var clubMember entity.ClubMember
	
	// ตรวจสอบสิทธิ์
	// 1. ตรวจสอบว่าเป็น club_admin หรือไม่
	err = db.Preload("Role").First(&user, user.ID).Error
	if err == nil && user.Role.RoleName == "club_admin" {
		
	} else {
		// 2. ตรวจสอบว่าเป็นหัวหน้าชมรมหรือรองหัวหน้าชมรมหรือไม่
		err = db.Where("club_id = ? AND user_id = ? AND role IN (?)", 
			clubID, user.ID, []string{"president", "vice_president"}).
			First(&clubMember).Error
		
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusForbidden, gin.H{"error": "คุณไม่มีสิทธิ์ดูรายชื่อสมาชิกของชมรมนี้"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์"})
			return
		}
	}

	var members []ClubMemberInfo

	err = db.
		Table("users").
		Select("users.id, users.first_name, users.last_name, users.email, club_members.role as club_role, club_members.joined_at").
		Joins("JOIN club_members ON club_members.user_id = users.id").
		Where("club_members.club_id = ?", clubID).
		Where("club_members.deleted_at IS NULL").
		Scan(&members).Error


	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลสมาชิกได้"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": members})

}

func RemoveMember(c *gin.Context) {
    db := config.DB()
    clubID := c.Param("id")
    userID := c.Param("userId")

    if err := db.Where("club_id = ? AND user_id = ?", clubID, userID).Delete(&entity.ClubMember{}).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถลบสมาชิกได้"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"success": true, "message": "ลบสมาชิกเรียบร้อยแล้ว"})
}

func ChangeClubPresident(c *gin.Context) {
	db := config.DB()
	clubID := c.Param("id")

	var req struct {
		NewPresidentID uint `json:"new_president_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ถูกต้อง"})
		return
	}

	// เปลี่ยนหัวหน้าเก่าเป็น member
	if err := db.Model(&entity.ClubMember{}).
		Where("club_id = ? AND role = ?", clubID, "president").
		Update("role", "member").Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "เปลี่ยนหัวหน้าเก่าไม่สำเร็จ"})
		return
	}

	// เปลี่ยนหัวหน้าใหม่เป็น president
	if err := db.Model(&entity.ClubMember{}).
		Where("club_id = ? AND user_id = ?", clubID, req.NewPresidentID).
		Update("role", "president").Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "เปลี่ยนหัวหน้าใหม่ไม่สำเร็จ"})
		return
	}

	// ตั้ง role ของ user คนนี้เป็น club_admin 
	if err := db.Model(&entity.User{}).
		Where("id = ?", req.NewPresidentID).
		Update("role_id", 2).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "อัปเดตสิทธิ์ผู้ใช้ไม่สำเร็จ"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "เปลี่ยนหัวหน้าชมรมเรียบร้อยแล้ว"})
}


func GetClubAnnouncements(c *gin.Context) {
	db := config.DB()
	clubID := c.Param("id")

	var announcements []entity.ClubAnnouncement
	if err := db.Where("club_id = ?", clubID).Order("created_at DESC").Find(&announcements).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลประกาศได้"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": announcements})
}
