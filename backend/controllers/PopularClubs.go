package controllers

import (
	"final-project/cems/entity"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"fmt"
)

type ClubHandler struct {
	DB *gorm.DB
}

type ClubResponse struct {
	ID           uint                 `json:"id"`
	Name         string               `json:"name"`
	Description  string               `json:"description"`
	LogoImage    string               `json:"logo_image"`
	MemberCount  int64                `json:"member_count"`
	ActivityCount    int64            `json:"activity_count"`
	Status       entity.ClubStatus    `json:"status"`
	Category     entity.ClubCategory  `json:"category"`
	Activities   []entity.Activity    `json:"activities,omitempty"`
	Members      []entity.ClubMember  `json:"members,omitempty"`
}

// GetPopularClubs - ดึงข้อมูลชมรมยอดนิยม (เรียงตามจำนวนสมาชิก)
func (h *ClubHandler) GetPopularClubs(c *gin.Context) {
	var clubs []entity.Club
	var clubResponses []ClubResponse

	// Debug: log the request
	// fmt.Println("GetPopularClubs called")

	// ดึงข้อมูลชมรมพร้อมความสัมพันธ์ และเรียงตามจำนวนสมาชิก
	if err := h.DB.
		Preload("Status").
		Preload("Category").
		Preload("Members").
		Preload("Activities", func(db *gorm.DB) *gorm.DB {
			return db.Select("id, title, date_start, date_end, club_id").Limit(3)
		}).
		Where("club_statuses.is_active = ?", true).
		Joins("JOIN club_statuses ON clubs.status_id = club_statuses.id").
		Find(&clubs).Error; err != nil {
		
		// Debug: log the database error
		fmt.Printf("Database error: %v\n", err)
		
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to fetch clubs",
			"message": err.Error(),
		})
		return
	}

	// Debug: log the number of clubs found
	fmt.Printf("Found %d clubs\n", len(clubs))

	// แปลงข้อมูลและคำนวณจำนวนสมาชิก
	for _, club := range clubs {
		// Debug: log each club being processed
		// fmt.Printf("Processing club: %d - %s\n", club.ID, club.Name)
		var activityCount int64
        h.DB.Model(&entity.Activity{}).Where("club_id = ?", club.ID).Count(&activityCount)
		clubResponse := ClubResponse{
			ID:          club.ID,
			Name:        club.Name,
			Description: club.Description,
			LogoImage:   club.LogoImage,
			MemberCount: int64(len(club.Members)),
			Status:      club.Status,
			Category:    club.Category,
			ActivityCount: activityCount,
			Activities:  club.Activities,
		}
		clubResponses = append(clubResponses, clubResponse)
	}

	// เรียงลำดับตามจำนวนสมาชิก (มากไปน้อย)
	for i := 0; i < len(clubResponses)-1; i++ {
		for j := 0; j < len(clubResponses)-i-1; j++ {
			if clubResponses[j].MemberCount < clubResponses[j+1].MemberCount {
				clubResponses[j], clubResponses[j+1] = clubResponses[j+1], clubResponses[j]
			}
		}
	}

	// จำกัดผลลัพธ์เป็น 4 ชมรมยอดนิยม
	if len(clubResponses) > 4 {
		clubResponses = clubResponses[:4]
	}

	// ตรวจสอบให้แน่ใจว่า response format ถูกต้อง
	response := gin.H{
		"success": true,
		"data":    clubResponses,
		"total":   len(clubResponses),
	}

	// Debug: log the response structure
	// fmt.Printf("Response structure: %+v\n", response)

	c.JSON(http.StatusOK, response)
}

// GetAllClubs - ดึงข้อมูลชมรมทั้งหมด พร้อมการค้นหาและการแบ่งหน้า
func (h *ClubHandler) GetAllClubs(c *gin.Context) {
	var clubs []entity.Club
	var clubResponses []ClubResponse

	// รับ query parameters อย่างปลอดภัย
	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "10")
	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		limit = 10
	}
	category := c.Query("category")
	search := c.Query("search")

	// Query สำหรับดึงข้อมูลจริง
	query := h.DB.
		Preload("Status").
		Preload("Category").
		Preload("Members").
		Joins("JOIN club_statuses ON clubs.status_id = club_statuses.id").
		Where("club_statuses.is_active = ?", true)

	if category != "" {
		query = query.Joins("JOIN club_categories ON clubs.category_id = club_categories.id").
			Where("club_categories.name = ?", category)
	}
	if search != "" {
		query = query.Where("clubs.name LIKE ? OR clubs.description LIKE ?", "%"+search+"%", "%"+search+"%")
	}

	// Apply pagination
	query = query.Offset((page - 1) * limit).Limit(limit)

	// ดึงข้อมูล
	if err := query.Find(&clubs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to fetch clubs",
			"message": err.Error(),
		})
		return
	}

	// Query สำหรับ count
	countQuery := h.DB.Model(&entity.Club{}).
		Joins("JOIN club_statuses ON clubs.status_id = club_statuses.id").
		Where("club_statuses.is_active = ?", true)

	if category != "" {
		countQuery = countQuery.Joins("JOIN club_categories ON clubs.category_id = club_categories.id").
			Where("club_categories.name = ?", category)
	}
	if search != "" {
		countQuery = countQuery.Where("clubs.name LIKE ? OR clubs.description LIKE ?", "%"+search+"%", "%"+search+"%")
	}

	var total int64
	countQuery.Count(&total)

	// แปลงข้อมูล
	for _, club := range clubs {
		clubResponses = append(clubResponses, ClubResponse{
			ID:          club.ID,
			Name:        club.Name,
			Description: club.Description,
			LogoImage:   club.LogoImage,
			MemberCount: int64(len(club.Members)),
			Status:      club.Status,
			Category:    club.Category,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    clubResponses,
		"total":   total,
		"page":    page,
		"limit":   limit,
	})
}


// GetClubByID - ดึงข้อมูลชมรมตาม ID
func (h *ClubHandler) GetClubByID(c *gin.Context) {
	id := c.Param("id")
	var club entity.Club

	if err := h.DB.
		Preload("Status").
		Preload("Category").
		Preload("Members").
		Preload("Activities").
		Preload("Announcements").
		First(&club, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Club not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch club",
		})
		return
	}

	clubResponse := ClubResponse{
		ID:          club.ID,
		Name:        club.Name,
		Description: club.Description,
		LogoImage:   club.LogoImage,
		MemberCount: int64(len(club.Members)),
		Status:      club.Status,
		Category:    club.Category,
		Activities:  club.Activities,
		Members:     club.Members,
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    clubResponse,
	})
}

// GetClubStatistics - ดึงสถิติของชมรม
func (h *ClubHandler) GetClubStatistics(c *gin.Context) {
	var stats struct {
		TotalClubs      int64 `json:"total_clubs"`
		TotalMembers    int64 `json:"total_members"`
		TotalActivities int64 `json:"total_activities"`
		ActiveClubs     int64 `json:"active_clubs"`
	}

	// นับจำนวนชมรมทั้งหมด
	h.DB.Model(&entity.Club{}).Count(&stats.TotalClubs)

	// นับจำนวนสมาชิกทั้งหมด
	h.DB.Model(&entity.ClubMember{}).Count(&stats.TotalMembers)

	// นับจำนวนกิจกรรมทั้งหมด
	h.DB.Model(&entity.Activity{}).Count(&stats.TotalActivities)

	// นับจำนวนชมรมที่ใช้งานได้
	h.DB.Model(&entity.Club{}).
		Joins("JOIN club_statuses ON clubs.status_id = club_statuses.id").
		Where("club_statuses.is_active = ?", true).
		Count(&stats.ActiveClubs)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    stats,
	})
}