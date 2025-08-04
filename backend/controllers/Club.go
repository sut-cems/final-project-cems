package controllers

import (
	"errors"
	"fmt"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"

	"final-project/cems/config"
	"final-project/cems/entity"
	"final-project/cems/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ClubMemberInfo struct {
	ID        uint      `json:"id"`
	FirstName string    `json:"first_name"`
	LastName  string    `json:"last_name"`
	Email     string    `json:"email"`
	ClubRole  string    `json:"club_role"`
	JoinedAt  time.Time `json:"joined_at"`
}

type EnhancedClubCategory struct {
	ID          uint           `json:"id"`
	Name        string         `json:"name"`
	Description string         `json:"description"`
	ClubCount   int64          `json:"club_count"`
	Clubs       []EnhancedClub `json:"clubs"`
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

type CreateClubInput struct {
	Name        string `json:"Name" binding:"required"`
	Description string `json:"Description" binding:"required"`
	CategoryID  uint   `json:"CategoryID" binding:"required"`
	CreatedBy   uint   `json:"CreatedBy"`
}

func slugify(s string) string {
	// แทนที่อักขระที่ไม่ใช่ตัวอักษรหรือตัวเลขด้วย "-"
	re := regexp.MustCompile(`[^a-zA-Z0-9ก-๙]+`)
	slug := re.ReplaceAllString(s, "-")
	// ลบ - ซ้ำ ๆ
	slug = strings.Trim(slug, "-")
	return slug
}

func GetCategoriesWithClubs(c *gin.Context) {
	db := config.DB()
	var categories []entity.ClubCategory
	var enhancedCategories []EnhancedClubCategory

	// Preload all related data
	if err := db.Preload("Clubs").
		Preload("Clubs.Status").
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

func RemoveClubMember(c *gin.Context) {
	db := config.DB()
	clubID := c.Param("id")
	userIDParam := c.Param("userId")

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
		c.JSON(http.StatusUnauthorized, gin.H{"error": "ไม่พบผู้ใช้ในระบบ"})
		return
	}

	clubIDInt, err := strconv.Atoi(clubID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "club ID ไม่ถูกต้อง"})
		return
	}

	var targetUserID uint

	// ถ้าไม่มี userId param แสดงว่าเป็นการออกเอง
	if userIDParam == "" {
		targetUserID = user.ID
	} else {
		uid, err := strconv.Atoi(userIDParam)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "user ID ไม่ถูกต้อง"})
			return
		}
		targetUserID = uint(uid)
	}

	// ตรวจสอบว่าสมาชิกนี้อยู่ในชมรม
	var member entity.ClubMember
	if err := db.Where("club_id = ? AND user_id = ?", clubIDInt, targetUserID).First(&member).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบสมาชิกในชมรม"})
		return
	}

	if user.ID != targetUserID {
		var adminMember entity.ClubMember
		if err := db.Where("club_id = ? AND user_id = ?", clubIDInt, user.ID).First(&adminMember).Error; err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "ไม่มีสิทธิ์ลบสมาชิกคนอื่น"})
			return
		}
		if adminMember.Role != "president" && adminMember.Role != "vice_president" {
			c.JSON(http.StatusForbidden, gin.H{"error": "เฉพาะหัวหน้าหรือรองหัวหน้าชมรมเท่านั้นที่ลบสมาชิกได้"})
			return
		}
	}

	// ลบ
	if err := db.Delete(&member).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถลบสมาชิกได้"})
		return
	}

	action := "remove"
	if user.ID == targetUserID {
		if member.Role == "pending" {
			action = "cancel"
		} else {
			action = "leave"
		}
	}

	var club entity.Club
	if err := db.First(&club, clubIDInt).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบข้อมูลชมรม"})
		return
	}

	if member.Role == "pending" && user.ID != targetUserID {
		var student entity.User
		if err := db.First(&student, member.UserID).Error; err == nil {
			subject := "❌ คำขอเข้าร่วมชมรมของคุณถูกปฏิเสธ"
			htmlBody, _ := services.RenderTemplate("reject_member.html", map[string]string{
				"ClubName": club.Name,
			})
			go services.SendEmailHTML(student.Email, subject, htmlBody)

		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "ลบสมาชิกเรียบร้อยแล้ว",
		"action":  action,
	})
}

func RequestJoinClub(c *gin.Context) {
	db := config.DB()
	clubID := c.Param("id")

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

	clubIDInt, err := strconv.Atoi(clubID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "รหัสชมรมไม่ถูกต้อง"})
		return
	}

	var existing entity.ClubMember
	if err := db.Where("club_id = ? AND user_id = ?", clubIDInt, user.ID).First(&existing).Error; err == nil {
		if existing.Role == "pending" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "คุณได้ส่งคำขอแล้ว โปรดรอการอนุมัติ"})
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": "คุณเป็นสมาชิกชมรมนี้อยู่แล้ว"})
		}
		return
	}

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

	var club entity.Club
	if err := db.First(&club, clubIDInt).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบชมรม"})
		return
	}

	var president entity.User
	if err := db.First(&president, club.CreatedBy).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบผู้สร้างชมรม"})
		return
	}

	subject := fmt.Sprintf("📬 คำขอเข้าร่วมชมรม %s", club.Name)
	htmlBody, _ := services.RenderTemplate("join_club.html", map[string]string{
		"ClubName":  club.Name,
		"FirstName": user.FirstName,
		"LastName":  user.LastName,
	})
	go services.SendEmailHTML(president.Email, subject, htmlBody)

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

	var club entity.Club
	if err := db.First(&club, clubIDInt).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบข้อมูลชมรม"})
		return
	}
	// หานักศึกษา
	var student entity.User
	if err := db.First(&student, userIDInt).Error; err == nil {
		subject := "🎉 คำขอเข้าร่วมชมรมของคุณได้รับการอนุมัติแล้ว"
		htmlBody, _ := services.RenderTemplate("approve_member.html", map[string]string{
			"ClubName": club.Name,
		})
		go services.SendEmailHTML(student.Email, subject, htmlBody)
	}

	c.JSON(http.StatusOK, gin.H{"message": "อนุมัติสมาชิกเรียบร้อยแล้ว"})
}

func GetMembersByClubID(c *gin.Context) {
	db := config.DB()
	clubID := c.Param("id")

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

	var user entity.User
	if err := db.Where("email = ?", claims.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	var clubMember entity.ClubMember

	err = db.Preload("Role").First(&user, user.ID).Error
	if err == nil && user.Role.RoleName == "club_admin" {

	} else {
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

	if err := db.Model(&entity.ClubMember{}).
		Where("club_id = ? AND role = ?", clubID, "president").
		Update("role", "member").Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "เปลี่ยนหัวหน้าเก่าไม่สำเร็จ"})
		return
	}

	if err := db.Model(&entity.ClubMember{}).
		Where("club_id = ? AND user_id = ?", clubID, req.NewPresidentID).
		Update("role", "president").Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "เปลี่ยนหัวหน้าใหม่ไม่สำเร็จ"})
		return
	}

	if err := db.Model(&entity.User{}).
		Where("id = ?", req.NewPresidentID).
		Update("role_id", 2).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "อัปเดตสิทธิ์ผู้ใช้ไม่สำเร็จ"})
		return
	}

	var newPresident entity.User
	if err := db.First(&newPresident, req.NewPresidentID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่พบผู้ใช้หัวหน้าใหม่"})
		return
	}

	token, err := jwtService.GenerateToken(newPresident.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถสร้าง token ใหม่ได้"})
		return
	}

	if err := db.Model(&entity.Club{}).
		Where("id = ?", clubID).
		Update("created_by", req.NewPresidentID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "อัปเดตผู้สร้างชมรมไม่สำเร็จ"})
		return
	}

	var club entity.Club
	if err := db.First(&club, clubID).Error; err == nil {
		subject := "📢 คุณได้รับสิทธิ์เป็นหัวหน้าชมรม"
		htmlBody, _ := services.RenderTemplate("new_president.html", map[string]string{
			"ClubName": club.Name,
		})
		go services.SendEmailHTML(newPresident.Email, subject, htmlBody)
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "เปลี่ยนหัวหน้าชมรมเรียบร้อยแล้ว",
		"token":   token,
	})
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

func CreateClub(c *gin.Context) {
	name := strings.TrimSpace(c.PostForm("Name"))
	description := strings.TrimSpace(c.PostForm("Description"))
	categoryIDStr := c.PostForm("CategoryID")
	createdByStr := c.PostForm("CreatedBy")

	//Validate ชื่อชมรม
	if name == "" || len(name) < 3 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ชื่อชมรมต้องมีความยาวอย่างน้อย 3 ตัวอักษร"})
		return
	}

	//Validate คำอธิบาย
	if description == "" || len(description) < 10 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "คำอธิบายชมรมต้องมีความยาวอย่างน้อย 10 ตัวอักษร"})
		return
	}

	//Validate category
	categoryID, err := strconv.ParseUint(categoryIDStr, 10, 32)
	if err != nil || categoryID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "CategoryID ไม่ถูกต้อง"})
		return
	}

	//Validate CreatedBy
	createdBy, err := strconv.ParseUint(createdByStr, 10, 32)
	if err != nil || createdBy == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "CreatedBy ไม่ถูกต้อง"})
		return
	}

	//Validate ไฟล์รูปภาพ
	file, err := c.FormFile("Image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ต้องแนบโลโก้ชมรม (Image) มาด้วย"})
		return
	}
	if file.Size > 5*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ขนาดไฟล์ต้องไม่เกิน 5MB"})
		return
	}

	//ตรวจสอบ status pending
	var pendingStatus entity.ClubStatus
	if err := config.DB().Where("name = ?", "pending").First(&pendingStatus).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่พบสถานะ pending"})
		return
	}

	//อัปโหลดไฟล์
	uploadPath := fmt.Sprintf("images/clubs/%s/%s", slugify(name), file.Filename)
	if err := c.SaveUploadedFile(file, uploadPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "อัปโหลดโลโก้ไม่สำเร็จ"})
		return
	}

	club := entity.Club{
		Name:        name,
		Description: description,
		CategoryID:  uint(categoryID),
		CreatedBy:   uint(createdBy),
		StatusID:    pendingStatus.ID,
		LogoImage:   "/" + uploadPath,
	}
	if err := config.DB().Create(&club).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถสร้างชมรมได้"})
		return
	}

	member := entity.ClubMember{
		UserID: uint(createdBy),
		ClubID: club.ID,
		Role:   "president",
	}
	if err := config.DB().Create(&member).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "เพิ่มสมาชิกประธานชมรมไม่สำเร็จ"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "สร้างชมรมสำเร็จ",
		"club":    club,
	})
}

func ApproveClub(c *gin.Context) {
	id := c.Param("id")

	var approvedStatus entity.ClubStatus
	if err := config.DB().Where("name = ?", "approved").First(&approvedStatus).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่พบสถานะ approved"})
		return
	}

	var club entity.Club
	if err := config.DB().Where("id = ?", id).First(&club).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบชมรม"})
		return
	}

	if err := config.DB().Model(&club).
		Update("status_id", approvedStatus.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "อนุมัติชมรมไม่สำเร็จ"})
		return
	}

	var creator entity.User
	if err := config.DB().First(&creator, club.CreatedBy).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่พบข้อมูลผู้สร้างชมรม"})
		return
	}

	// ถ้า role เป็น student (1) → เปลี่ยนเป็น club_admin (2)
	if creator.RoleID == 1 {
		if err := config.DB().Model(&entity.User{}).Where("id = ?", creator.ID).Update("role_id", 2).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "อัปเดตบทบาทผู้ใช้ไม่สำเร็จ"})
			return
		}
	}

	subject := "✅ ชมรมของคุณได้รับการอนุมัติแล้ว"
	htmlBody, err := services.RenderTemplate("approve_club.html", map[string]string{
		"ClubName": club.Name,
	})
	if err != nil {
		fmt.Println("❌ Error rendering email template:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถสร้างเนื้อหาอีเมลได้"})
		return
	}

	go services.SendEmailHTML(creator.Email, subject, htmlBody)

	c.JSON(http.StatusOK, gin.H{"message": "อนุมัติชมรมเรียบร้อยแล้ว"})
}

func RejectClub(c *gin.Context) {
	id := c.Param("id")

	var club entity.Club
	if err := config.DB().First(&club, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบชมรม"})
		return
	}

	var suspendedStatus entity.ClubStatus
	if err := config.DB().Where("name = ?", "suspended").First(&suspendedStatus).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่พบสถานะ suspended"})
		return
	}

	if err := config.DB().Model(&club).Update("status_id", suspendedStatus.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ปฏิเสธชมรมไม่สำเร็จ"})
		return
	}

	var creator entity.User
	if err := config.DB().First(&creator, club.CreatedBy).Error; err == nil {
		subject := "❌ ชมรมของคุณถูกปฏิเสธ"
		htmlBody, _ := services.RenderTemplate("reject_club.html", map[string]string{
			"ClubName": club.Name,
		})
		go services.SendEmailHTML(creator.Email, subject, htmlBody)
	}

	c.JSON(http.StatusOK, gin.H{"message": "ปฏิเสธชมรมเรียบร้อยแล้ว", "club_id": club.ID})
}
