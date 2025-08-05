package controllers

import (
	"errors"
	"final-project/cems/config"
	"final-project/cems/entity"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetActivitiesWithPhotos(c *gin.Context) {
	var activities []entity.Activity

	db := config.DB()
	// Preload the photos relationship and order by date_start descending (newest first)
	db.Preload("ActivityPhotos").Order("date_start DESC").Find(&activities)

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
				"id":         activity.ID,
				"title":      activity.Title,
				"date_start": activity.DateStart,
				"date_end":   activity.DateEnd,
				"images":     images,
			})
		}
	}

	c.JSON(200, response)
}

func GetPhotosByActivityId(c *gin.Context) {
	// Get activity ID from URL parameter
	activityId := c.Param("id")

	// Convert string to uint (assuming ID is uint)
	var activityID uint
	if id, err := strconv.ParseUint(activityId, 10, 32); err != nil {
		c.JSON(400, gin.H{"error": "Invalid activity ID"})
		return
	} else {
		activityID = uint(id)
	}

	var activity entity.Activity
	db := config.DB()

	// Find the activity and preload its photos
	result := db.Preload("ActivityPhotos").First(&activity, activityID)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(404, gin.H{"error": "Activity not found"})
		} else {
			c.JSON(500, gin.H{"error": "Database error"})
		}
		return
	}

	// Transform photos to match frontend expectations
	var images []map[string]interface{}
	for _, photo := range activity.ActivityPhotos {
		images = append(images, map[string]interface{}{
			"url":          photo.Url,
			"uploadedBy":   photo.UploadedBy,
			"uploadedDate": photo.CreatedAt,
		})
	}

	// Return response with activity info and its photos
	response := map[string]interface{}{
		"id":     activity.ID,
		"title":  activity.Title,
		"images": images,
	}

	c.JSON(200, response)
}

func AddPhotoToActivity(c *gin.Context) {
	// Get activity ID from URL parameter
	activityId := c.Param("id")

	// Convert string to uint (assuming ID is uint)
	var activityID uint
	if id, err := strconv.ParseUint(activityId, 10, 32); err != nil {
		c.JSON(400, gin.H{"error": "Invalid activity ID"})
		return
	} else {
		activityID = uint(id)
	}

	db := config.DB()

	// Check if activity exists
	var activity entity.Activity
	if err := db.First(&activity, activityID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(404, gin.H{"error": "Activity not found"})
		} else {
			c.JSON(500, gin.H{"error": "Database error"})
		}
		return
	}

	// Parse JSON request body
	var req struct {
		Url        string `json:"url" binding:"required"`
		UploadedBy string `json:"uploadedBy" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request body", "details": err.Error()})
		return
	}

	// Create new photo record
	photo := entity.ActivityPhoto{
		ActivityID: activityID,
		Url:        req.Url,
		UploadedBy: req.UploadedBy,
	}

	// Save photo to database
	if err := db.Create(&photo).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to save photo", "details": err.Error()})
		return
	}

	// Return success response with the created photo
	response := map[string]interface{}{
		"id":           photo.ID,
		"activityId":   photo.ActivityID,
		"url":          photo.Url,
		"uploadedBy":   photo.UploadedBy,
		"uploadedDate": photo.CreatedAt,
		"message":      "Photo added successfully",
	}

	c.JSON(201, response)
}

// Response structure for activities without images
type ActivityWithoutImagesResponse struct {
	ID        uint      `json:"id"`
	Title     string    `json:"title"`
	DateStart time.Time `json:"date_start"`
	DateEnd   time.Time `json:"date_end"`
}

func GetActivitiesWithoutPhotos(c *gin.Context) {
	var activities []entity.Activity
	db := config.DB()

	err := db.
		Select("id, title, date_start, date_end").
		Where("id NOT IN (?)",
			db.Table("activity_photos").
				Select("DISTINCT activity_id").
				Where("activity_id IS NOT NULL")).
		Order("date_start DESC").
		Find(&activities).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to fetch activities",
			"message": err.Error(),
		})
		return
	}

	// Transform to response format
	var response []ActivityWithoutImagesResponse
	for _, activity := range activities {
		response = append(response, ActivityWithoutImagesResponse{
			ID:        activity.ID,
			Title:     activity.Title,
			DateStart: activity.DateStart,
			DateEnd:   activity.DateEnd,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"data": response,
	})
}
