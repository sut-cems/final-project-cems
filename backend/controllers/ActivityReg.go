package controllers

import (
	"final-project/cems/config"
	"final-project/cems/entity"
	"net/http"
	"time"
	

	"github.com/gin-gonic/gin"

)

func GetActivityRegister(c *gin.Context) {
	var activityReg []entity.ActivityRegistration
	db := config.DB()

	// Preload ทั้ง User และ Activity
	if err := db.Preload("User").Preload("Activity").Find(&activityReg).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลได้"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"activityReg": activityReg,
	})
}

func GetActivityRegisterByID(c *gin.Context) {
	var activityReg []entity.ActivityRegistration
	db := config.DB()

	// ดึง id จาก path parameter
	id := c.Param("id")

	// Preload user และ activity โดยใช้ where filter
	if err := db.
		Preload("User").
		Preload("Activity").
		Preload("Status").
		Where("activity_id = ?", id).
		Find(&activityReg).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลได้"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"activityReg": activityReg,
	})
}

func GetActivityRegisterStatus(c *gin.Context) {
	var status []entity.ActivityRegistrationStatus
	db := config.DB()

	db.Find(&status)

	c.JSON(http.StatusOK, gin.H{
		"status": status,
	})
}

func UpdateRegisterStatus(c *gin.Context) {
    id := c.Param("id") // รับ id ของการสมัคร
    db := config.DB()

    // รับข้อมูล JSON จาก client เช่น {"status_id": 2}
    var input struct {
        StatusID uint `json:"status_id" binding:"required"`
    }

    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // ตรวจสอบว่ามีการสมัครนี้จริงไหม
    var reg entity.ActivityRegistration
    if err := db.First(&reg, id).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบข้อมูลการสมัคร"})
        return
    }

    // อัปเดตสถานะ
    reg.StatusID = input.StatusID
    if err := db.Save(&reg).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถอัปเดตสถานะได้"})
        return
    }

    // ดึงข้อมูลล่าสุดพร้อมรายละเอียดสถานะ
    if err := db.Preload("Status").First(&reg, id).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลล่าสุดได้"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "message": "อัปเดตสถานะสำเร็จ",
        "data":    reg,
    })
}

func CreateRegister(c *gin.Context) {
    db := config.DB()

    // โครงสร้างข้อมูลที่รับจาก client
    var input struct {
        UserID     uint `json:"user_id" binding:"required"`
        ActivityID uint `json:"activity_id" binding:"required"`
        StatusID   uint `json:"status_id"` // อาจจะกำหนด default ได้ เช่น ลงทะเบียนแล้ว = 1
    }

    // รับข้อมูล JSON จาก client
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // กำหนดสถานะ default ถ้าไม่ส่งมา เช่น 1 = "ลงทะเบียนแล้ว"
    if input.StatusID == 0 {
        input.StatusID = 1
    }

    // สร้าง record ใหม่
    reg := entity.ActivityRegistration{
        UserID:     input.UserID,
        ActivityID: input.ActivityID,
        StatusID:   input.StatusID,
        RegisteredAt: time.Now(), // ถ้ามีฟิลด์เวลาสมัคร
    }

    if err := db.Create(&reg).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถสร้างการสมัครได้"})
        return
    }

    // โหลดข้อมูลสถานะที่สัมพันธ์กัน (ถ้ามี)
    if err := db.Preload("Status").First(&reg, reg.ID).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถโหลดข้อมูลล่าสุดได้"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "message": "สมัครกิจกรรมสำเร็จ",
        "data":    reg,
    })
}

func DeleteActivityRegister(c *gin.Context) {
    var register entity.ActivityRegistration
    registerID := c.Param("id") // หรือจะรับ userId กับ activityId แล้วหา record ก็ได้

    db := config.DB()

	db.First(&register, registerID)
	if register.ID == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "suppliregisterer not found"})
		return
	}

    if err := db.Delete(&register).Error; err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "registration canceled successfully"})
}


