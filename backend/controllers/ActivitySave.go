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

	if err := db.Save(&activity).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update activity"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Activity updated successfully", "data": activity})
}
