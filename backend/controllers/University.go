package controllers

import (
	"final-project/cems/config"
	"final-project/cems/entity"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// CreateUniversity creates a new university
func CreateUniversity(c *gin.Context) {
	var university entity.University
	
	// Bind JSON request to university struct
	if err := c.ShouldBindJSON(&university); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request data",
			"message": err.Error(),
		})
		return
	}

	// Validate required fields
	if university.Name == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "University name is required",
		})
		return
	}

	db := config.DB()
	
	// Create university in database
	if err := db.Create(&university).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to create university",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    university,
		"message": "University created successfully",
	})
}

// GetAllUniversities retrieves all universities
func GetAllUniversities(c *gin.Context) {
	var universities []entity.University
	
	db := config.DB()
	
	// Get all universities ordered by name
	if err := db.Order("name ASC").Find(&universities).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to fetch universities",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":    universities,
	})
}

// GetUniversityByID retrieves a university by ID
func GetUniversityByID(c *gin.Context) {
	id := c.Param("id")
	
	// Convert string ID to uint
	universityID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid university ID",
		})
		return
	}

	var university entity.University
	db := config.DB()
	
	// Find university by ID
	if err := db.First(&university, uint(universityID)).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "University not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    university,
	})
}

// UpdateUniversity updates an existing university
func UpdateUniversity(c *gin.Context) {
	id := c.Param("id")
	
	// Convert string ID to uint
	universityID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid university ID",
		})
		return
	}

	db := config.DB()
	
	// Check if university exists
	var existingUniversity entity.University
	if err := db.First(&existingUniversity, uint(universityID)).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "University not found",
		})
		return
	}

	// Bind update data
	var updateData entity.University
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request data",
			"message": err.Error(),
		})
		return
	}

	// Validate required fields
	if updateData.Name == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "University name is required",
		})
		return
	}

	// Update university
	if err := db.Model(&existingUniversity).Updates(updateData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to update university",
			"message": err.Error(),
		})
		return
	}

	// Get updated university
	if err := db.First(&existingUniversity, uint(universityID)).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch updated university",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    existingUniversity,
		"message": "University updated successfully",
	})
}
