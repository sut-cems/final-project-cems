package controllers

import (
	"errors"
	"net/http"
	"path/filepath"
	"strconv"
	"time"

	"final-project/cems/config"
	"final-project/cems/entity"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func UpdateActivityByID(c *gin.Context) {
	id := c.Param("id")

	db := config.DB()

	var activity entity.Activity
	if err := db.First(&activity, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "activity not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		}
		return
	}

	// รับข้อมูลฟิลด์จาก Form-data
	title := c.PostForm("title")
	description := c.PostForm("description")
	location := c.PostForm("location")
	dateStartStr := c.PostForm("date_start")
	dateEndStr := c.PostForm("date_end")
	capacityStr := c.PostForm("capacity")
	categoryIDStr := c.PostForm("category_id")
	statusIDStr := c.PostForm("status_id")

	// แปลงข้อมูล
	dateStart, err := time.Parse(time.RFC3339, dateStartStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date_start"})
		return
	}
	dateEnd, err := time.Parse(time.RFC3339, dateEndStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date_end"})
		return
	}
	capacity, err := strconv.Atoi(capacityStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid capacity"})
		return
	}
	categoryID, err := strconv.ParseUint(categoryIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid category_id"})
		return
	}
	statusID, err := strconv.ParseUint(statusIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid status_id"})
		return
	}

	// รับไฟล์โปสเตอร์ถ้ามี
	file, err := c.FormFile("poster_image")
	if err == nil {
		// บันทึกไฟล์ไปที่เซิร์ฟเวอร์ (เช่น โฟลเดอร์ uploads/)
		filename := filepath.Base(file.Filename)
		dst := "./images/activities/posterImages/" + filename
		if err := c.SaveUploadedFile(file, dst); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
			return
		}
		// เก็บเป็น URL หรือ path ที่ใช้เรียกดูได้
		activity.PosterImage = "/images/activities/posterImages/" + filename
	}

	// อัปเดตฟิลด์อื่น ๆ
	activity.Title = title
	activity.Description = description
	activity.Location = location
	activity.DateStart = dateStart
	activity.DateEnd = dateEnd
	activity.Capacity = capacity
	activity.CategoryID = uint(categoryID)
	activity.StatusID = uint(statusID)

	if err := db.Save(&activity).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update activity"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Activity updated successfully", "data": activity})
}

func CreateActivity(c *gin.Context) {
	db := config.DB()

	// รับค่าจากฟอร์ม
	title := c.PostForm("title")
	description := c.PostForm("description")
	location := c.PostForm("location")
	dateStartStr := c.PostForm("date_start")
	dateEndStr := c.PostForm("date_end")
	capacityStr := c.PostForm("capacity")
	statusIDStr := c.PostForm("status_id")
	clubIDStr := c.PostForm("club_id")
	categoryIDStr := c.PostForm("category_id")

	// แปลงข้อมูลเป็นชนิดที่ถูกต้อง
	dateStart, err := time.Parse(time.RFC3339, dateStartStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date_start"})
		return
	}
	dateEnd, err := time.Parse(time.RFC3339, dateEndStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date_end"})
		return
	}
	capacity, err := strconv.Atoi(capacityStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid capacity"})
		return
	}
	statusID, err := strconv.ParseUint(statusIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid status_id"})
		return
	}
	clubID, err := strconv.ParseUint(clubIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid club_id"})
		return
	}
	categoryID, err := strconv.ParseUint(categoryIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid category_id"})
		return
	}

	// รับรูปภาพ
	var posterImagePath string
	file, err := c.FormFile("poster_image")
	if err == nil {
		filename := filepath.Base(file.Filename)
		dst := "./images/activities/posterImages/" + filename

		if err := c.SaveUploadedFile(file, dst); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save image"})
			return
		}
		posterImagePath = "/images/activities/posterImages/" + filename
	}

	// สร้าง Activity ใหม่
	activity := entity.Activity{
		Title:       title,
		Description: description,
		Location:    location,
		DateStart:   dateStart,
		DateEnd:     dateEnd,
		Capacity:    capacity,
		PosterImage: posterImagePath,
		StatusID:    uint(statusID),
		ClubID:      uint(clubID),
		CategoryID:  uint(categoryID),
	}

	// บันทึกลงฐานข้อมูล
	if err := db.Create(&activity).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create activity"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Activity created successfully", "data": activity})
}
