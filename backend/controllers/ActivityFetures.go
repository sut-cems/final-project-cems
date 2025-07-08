package controllers

import (
	"final-project/cems/config"
	"final-project/cems/entity"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ActivityHandler struct {
	DB *gorm.DB
}

// Response structures
type ActivityResponse struct {
	ID                    uint                          `json:"ID"`
	Title                 string                        `json:"Title"`
	Description           string                        `json:"Description"`
	Location              string                        `json:"Location"`
	DateStart             string                        `json:"DateStart"`
	DateEnd               string                        `json:"DateEnd"`
	Capacity              int                           `json:"Capacity"`
	PosterImage           string                        `json:"PosterImage"`
	StatusID              uint                          `json:"StatusID"`
	ClubID                uint                          `json:"ClubID"`
	CategoryID            uint                          `json:"CategoryID"`
	RegisteredCount       int                           `json:"RegisteredCount"`
	Status                entity.ActivityStatus         `json:"Status"`
	Club                  entity.Club                   `json:"Club"`
	Category              entity.EventCategory          `json:"Category"`
	ActivityRegistrations []entity.ActivityRegistration `json:"ActivityRegistrations"`
}

type FeaturedActivitiesResponse struct {
	Activities []ActivityResponse `json:"activities"`
	Total      int64              `json:"total"`
	Message    string             `json:"message"`
}

type ActivitiesListResponse struct {
	Activities []ActivityResponse `json:"activities"`
	Total      int64              `json:"total"`
	Page       int                `json:"page"`
	Limit      int                `json:"limit"`
	Message    string             `json:"message"`
}

// NewActivityHandler - สร้าง handler instance ใหม่
func NewActivityHandler(db *gorm.DB) *ActivityHandler {
	return &ActivityHandler{
		DB: db,
	}
}

// GetFeaturedActivities - ดึงกิจกรรมแนะนำ /activities/featured
func (h *ActivityHandler) GetFeaturedActivities(c *gin.Context) {
	var activities []entity.Activity
	var totalCount int64

	// Query กิจกรรมแนะนำ - เรียงตามความนิยม (จำนวนผู้สมัคร) และวันที่เริ่ม
	query := h.DB.Preload("Status").Preload("ActivityRegistrations").Preload("Club").Preload("Club.Status").
		Preload("Club.Category").Preload("Category").
		Joins("JOIN activity_statuses ON activity_statuses.id = activities.status_id").
		Where("activity_statuses.is_active = ? AND activities.date_start > ?", true, time.Now()).
		Order("(SELECT COUNT(*) FROM activity_registrations WHERE activity_id = activities.id) DESC, activities.date_start ASC").
		Limit(3)

	if err := query.Find(&activities).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to fetch featured activities",
			"message": err.Error(),
		})
		return
	}

	// นับจำนวนกิจกรรมทั้งหมดที่ active
	h.DB.Model(&entity.Activity{}).
		Joins("JOIN activity_statuses ON activity_statuses.id = activities.status_id").
		Where("activity_statuses.is_active = ? AND activities.date_start > ?", true, time.Now()).
		Count(&totalCount)

	// แปลงข้อมูลเป็น response format และเพิ่ม RegisteredCount
	var responseActivities []ActivityResponse
	for _, activity := range activities {
		var registeredCount int64
		h.DB.Model(&entity.ActivityRegistration{}).Where("activity_id = ?", activity.ID).Count(&registeredCount)

		responseActivity := ActivityResponse{
			ID:                    activity.ID,
			Title:                 activity.Title,
			Description:           activity.Description,
			Location:              activity.Location,
			DateStart:             activity.DateStart.Format(time.RFC3339),
			DateEnd:               activity.DateEnd.Format(time.RFC3339),
			Capacity:              activity.Capacity,
			PosterImage:           activity.PosterImage,
			StatusID:              activity.StatusID,
			ClubID:                activity.ClubID,
			CategoryID:            activity.CategoryID,
			RegisteredCount:       int(registeredCount),
			Status:                activity.Status,
			Club:                  activity.Club,
			Category:              activity.Category,
			ActivityRegistrations: activity.ActivityRegistrations,
		}
		responseActivities = append(responseActivities, responseActivity)
	}

	response := FeaturedActivitiesResponse{
		Activities: responseActivities,
		Total:      totalCount,
		Message:    "Featured activities retrieved successfully",
	}

	c.JSON(http.StatusOK, response)
}

// GetActivities - ดึงกิจกรรมทั้งหมดพร้อม filter และ pagination /activities
func (h *ActivityHandler) GetActivities(c *gin.Context) {
	// Query parameters
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	status := c.Query("status")
	category := c.Query("category")
	club := c.Query("club")
	search := c.Query("search")
	sortBy := c.DefaultQuery("sort", "date_start")

	// Validate pagination
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	offset := (page - 1) * limit

	var activities []entity.Activity
	var totalCount int64

	// Build query
	query := h.DB.Preload("Status").Preload("ActivityRegistrations").Preload("Club").Preload("Club.Status").
		Preload("Club.Category").Preload("Category")

	// Apply filters
	switch status {
	case "active":
		query = query.Where("activities.status_id = ? AND activities.date_start > ?", 1, time.Now())
	case "past":
		query = query.Where("activities.date_end < ?", time.Now())
	case "upcoming":
		query = query.Where("activities.date_start > ?", time.Now())
	}

	if category != "" {
		query = query.Joins("JOIN event_categories ON activities.category_id = event_categories.id").
			Where("event_categories.name LIKE ?", "%"+category+"%")
	}

	if club != "" {
		query = query.Joins("JOIN clubs ON activities.club_id = clubs.id").
			Where("clubs.name LIKE ?", "%"+club+"%")
	}

	if search != "" {
		query = query.Where("activities.title LIKE ? OR activities.description LIKE ?",
			"%"+search+"%", "%"+search+"%")
	}

	// Apply sorting
	switch sortBy {
	case "popular":
		query = query.Order("(SELECT COUNT(*) FROM activity_registrations WHERE activity_id = activities.id) DESC")
	case "date_start":
		query = query.Order("activities.date_start ASC")
	case "date_end":
		query = query.Order("activities.date_end ASC")
	case "capacity":
		query = query.Order("activities.capacity DESC")
	case "title":
		query = query.Order("activities.title ASC")
	default:
		query = query.Order("activities.date_start ASC")
	}

	// Get total count
	countQuery := query
	if err := countQuery.Model(&entity.Activity{}).Count(&totalCount).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to count activities",
			"message": err.Error(),
		})
		return
	}

	// Get activities with pagination
	if err := query.Offset(offset).Limit(limit).Find(&activities).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to fetch activities",
			"message": err.Error(),
		})
		return
	}

	// แปลงข้อมูลเป็น response format และเพิ่ม RegisteredCount
	var responseActivities []ActivityResponse
	for _, activity := range activities {
		var registeredCount int64
		h.DB.Model(&entity.ActivityRegistration{}).Where("activity_id = ?", activity.ID).Count(&registeredCount)

		responseActivity := ActivityResponse{
			ID:                    activity.ID,
			Title:                 activity.Title,
			Description:           activity.Description,
			Location:              activity.Location,
			DateStart:             activity.DateStart.Format(time.RFC3339),
			DateEnd:               activity.DateEnd.Format(time.RFC3339),
			Capacity:              activity.Capacity,
			PosterImage:           activity.PosterImage,
			StatusID:              activity.StatusID,
			ClubID:                activity.ClubID,
			CategoryID:            activity.CategoryID,
			RegisteredCount:       int(registeredCount),
			Status:                activity.Status,
			Club:                  activity.Club,
			Category:              activity.Category,
			ActivityRegistrations: activity.ActivityRegistrations,
		}
		responseActivities = append(responseActivities, responseActivity)
	}

	response := ActivitiesListResponse{
		Activities: responseActivities,
		Total:      totalCount,
		Page:       page,
		Limit:      limit,
		Message:    "Activities retrieved successfully",
	}

	c.JSON(http.StatusOK, response)
}

// GetActivityByID - ดึงกิจกรรมตาม ID /activities/:id
func (h *ActivityHandler) GetActivityByID(c *gin.Context) {
	id := c.Param("id")
	activityID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid activity ID",
			"message": "Activity ID must be a valid number",
		})
		return
	}

	var activity entity.Activity
	if err := h.DB.Preload("ActivityRegistrations").Preload("Status").Preload("Club").Preload("Club.Status").
		Preload("Club.Category").Preload("Category").
		First(&activity, uint(activityID)).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"error":   "Activity not found",
				"message": "Activity with the specified ID does not exist",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to fetch activity",
			"message": err.Error(),
		})
		return
	}

	// นับจำนวนผู้สมัคร
	var registeredCount int64
	h.DB.Model(&entity.ActivityRegistration{}).Where("activity_id = ?", activity.ID).Count(&registeredCount)

	responseActivity := ActivityResponse{
		ID:                    activity.ID,
		Title:                 activity.Title,
		Description:           activity.Description,
		Location:              activity.Location,
		DateStart:             activity.DateStart.Format(time.RFC3339),
		DateEnd:               activity.DateEnd.Format(time.RFC3339),
		Capacity:              activity.Capacity,
		PosterImage:           activity.PosterImage,
		StatusID:              activity.StatusID,
		ClubID:                activity.ClubID,
		CategoryID:            activity.CategoryID,
		RegisteredCount:       int(registeredCount),
		Status:                activity.Status,
		Club:                  activity.Club,
		Category:              activity.Category,
		ActivityRegistrations: activity.ActivityRegistrations,
	}

	c.JSON(http.StatusOK, gin.H{
		"activity": responseActivity,
		"message":  "Activity retrieved successfully",
	})
}

// GetActivityStatistics - ดึงสถิติกิจกรรม /activities/statistics
func (h *ActivityHandler) GetActivityStatistics(c *gin.Context) {
	var stats struct {
		TotalActivities     int64   `json:"total_activities"`
		ActiveActivities    int64   `json:"active_activities"`
		TotalRegistrations  int64   `json:"total_registrations"`
		AverageRating       float64 `json:"average_rating"`
		UpcomingActivities  int64   `json:"upcoming_activities"`
		CompletedActivities int64   `json:"completed_activities"`
		ActivitiesThisMonth int64   `json:"activities_this_month"`
		TotalSeatsAvailable int64   `json:"total_seats_available"`
	}

	now := time.Now()

	// หา วันแรกของเดือนนี้
	firstOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())

	// หาวันแรกของเดือนถัดไป แล้วลบ 1 วินาที
	firstOfNextMonth := firstOfMonth.AddDate(0, 1, 0)
	lastOfMonth := firstOfNextMonth.Add(-time.Second)

	// นับกิจกรรมทั้งหมดที่เกิดขึ้นในเดือนนี้ (date_start หรือ date_end อยู่ในช่วงนี้)
	h.DB.Model(&entity.Activity{}).
		Where("(date_start BETWEEN ? AND ?) OR (date_end BETWEEN ? AND ?)", firstOfMonth, lastOfMonth, firstOfMonth, lastOfMonth).
		Count(&stats.ActivitiesThisMonth)

	// Total activities
	h.DB.Model(&entity.Activity{}).Count(&stats.TotalActivities)

	// Active activities
	h.DB.
		Model(&entity.Activity{}).
		Joins("JOIN activity_statuses ON activity_statuses.id = activities.status_id").
		Where("activity_statuses.is_active = ?", true).
		Count(&stats.ActiveActivities)

	// Total registrations
	h.DB.Model(&entity.ActivityRegistration{}).Count(&stats.TotalRegistrations)

	// Upcoming activities
	h.DB.Model(&entity.Activity{}).Where("date_start > ?", time.Now()).Count(&stats.UpcomingActivities)

	// Completed activities
	h.DB.Model(&entity.Activity{}).Where("date_end < ?", time.Now()).Count(&stats.CompletedActivities)

	h.DB.
		Model(&entity.ActivityReview{}).
		Select("AVG(rating)").
		Scan(&stats.AverageRating)

	c.JSON(http.StatusOK, gin.H{
		"statistics": stats,
		"message":    "Statistics retrieved successfully",
	})
}

func (h *ActivityHandler) GetActivityByClubID(c *gin.Context) {
	id := c.Param("id")
	clubID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid club ID",
			"message": "Club ID must be a valid number",
		})
		return
	}

	var activities []entity.Activity
	if err := h.DB.
		Preload("ActivityRegistrations").
		Preload("Status").
		Preload("Club").
		Preload("Club.Status").
		Preload("Club.Category").
		Preload("Category").
		Where("club_id = ?", uint(clubID)).
		Find(&activities).Error; err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to fetch activities by club ID",
			"message": err.Error(),
		})
		return
	}

	var responseActivities []ActivityResponse
	for _, activity := range activities {
		var registeredCount int64
		h.DB.Model(&entity.ActivityRegistration{}).Where("activity_id = ?", activity.ID).Count(&registeredCount)

		responseActivities = append(responseActivities, ActivityResponse{
			ID:                    activity.ID,
			Title:                 activity.Title,
			Description:           activity.Description,
			Location:              activity.Location,
			DateStart:             activity.DateStart.Format(time.RFC3339),
			DateEnd:               activity.DateEnd.Format(time.RFC3339),
			Capacity:              activity.Capacity,
			PosterImage:           activity.PosterImage,
			StatusID:              activity.StatusID,
			ClubID:                activity.ClubID,
			CategoryID:            activity.CategoryID,
			RegisteredCount:       int(registeredCount),
			Status:                activity.Status,
			Club:                  activity.Club,
			Category:              activity.Category,
			ActivityRegistrations: activity.ActivityRegistrations,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"activities": responseActivities,
		"message":    "Activities retrieved successfully",
	})
}

func (h *ActivityHandler) GetAllActivities(c *gin.Context) {
	var activities []entity.Activity

	query := h.DB.Preload("Status").Preload("Club").Preload("Category").Preload("ActivityRegistrations")

	if err := query.Find(&activities).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to fetch all activities",
			"message": err.Error(),
		})
		return
	}

	var responseActivities []ActivityResponse
	for _, activity := range activities {
		var registeredCount int64
		h.DB.Model(&entity.ActivityRegistration{}).Where("activity_id = ?", activity.ID).Count(&registeredCount)

		responseActivities = append(responseActivities, ActivityResponse{
			ID:                    activity.ID,
			Title:                 activity.Title,
			Description:           activity.Description,
			Location:              activity.Location,
			DateStart:             activity.DateStart.Format(time.RFC3339),
			DateEnd:               activity.DateEnd.Format(time.RFC3339),
			Capacity:              activity.Capacity,
			PosterImage:           activity.PosterImage,
			StatusID:              activity.StatusID,
			ClubID:                activity.ClubID,
			CategoryID:            activity.CategoryID,
			RegisteredCount:       int(registeredCount),
			Status:                activity.Status,
			Club:                  activity.Club,
			Category:              activity.Category,
			ActivityRegistrations: activity.ActivityRegistrations,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"activities": responseActivities,
		"message":    "All activities fetched successfully",
	})
}

// สำหรับดึงรูปกิจกรรม
func GetActivitiesWithPhotos(c *gin.Context) {
	var activities []entity.Activity

	db := config.DB()
	// Preload the photos relationship
	db.Preload("ActivityPhotos").Find(&activities)

	// Transform to match frontend expectations
	var response []map[string]interface{}
	for _, activity := range activities {
		var images []map[string]interface{}
		for _, photo := range activity.ActivityPhotos {
			images = append(images, map[string]interface{}{
				"url":          photo.Url,
				"uploadedBy":   photo.UploadedBy,
				"uploadedDate": photo.CreatedAt,
			})
		}

		// Only add activity to response if it has images
		if len(images) > 0 {
			response = append(response, map[string]interface{}{
				"id":     activity.ID,
				"title":  activity.Title,
				"images": images,
			})
		}
	}

	c.JSON(200, response)
}
