package controllers

import (
	"net/http"
	"strconv"

	"final-project/cems/config"
	"final-project/cems/entity"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ClubAnnouncement struct {
    gorm.Model
    ClubID    uint      `json:"club_id"`
    Title     string    `json:"title"`
    Content   string    `json:"content"`
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

func GetClubAnnouncementByID(c *gin.Context) {
    db := config.DB()
    clubID := c.Param("id")
    annID  := c.Param("annId")

    var ann entity.ClubAnnouncement
    if err := db.Where("id = ? AND club_id = ?", annID, clubID).First(&ann).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบประกาศ"})
        return
    }
    c.JSON(http.StatusOK, gin.H{"success": true, "data": ann})
}

func CreateClubAnnouncement(c *gin.Context) {
    db := config.DB()
    clubIDParam := c.Param("id")

    // ตรวจสิทธิ์ต้องเป็นหัวหน้า
    clubID, err := strconv.ParseUint(clubIDParam, 10, 64)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "club id ไม่ถูกต้อง"})
        return
    }

    _, err = requirePresident(c, uint(clubID))
    if err != nil {
        return // requirePresident จะส่ง error response เอง
    }

    var input struct {
        Title   string `json:"title"`
        Content string `json:"content"`
    }
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ถูกต้อง"})
        return
    }

    announcement := entity.ClubAnnouncement{
        ClubID:    uint(clubID),
        Title:     input.Title,
        Content:   input.Content,
    }

    if err := db.Create(&announcement).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถสร้างประกาศได้"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "success": true,
        "message": "สร้างประกาศสำเร็จ",
        "data":    announcement,
    })
}

func UpdateClubAnnouncement(c *gin.Context) {
    db := config.DB()
    clubIDStr := c.Param("id")
    annIDStr  := c.Param("annId")

    clubID, err := strconv.ParseUint(clubIDStr, 10, 64)
    if err != nil { c.JSON(400, gin.H{"error":"club id ไม่ถูกต้อง"}); return }
    _, err = requirePresident(c, uint(clubID))
    if err != nil { return }

    var body struct {
        Title   string `json:"title"`
        Content string `json:"content"`
    }
    if err := c.ShouldBindJSON(&body); err != nil {
        c.JSON(400, gin.H{"error":"ข้อมูลไม่ถูกต้อง"}); return
    }

    var ann entity.ClubAnnouncement
    if err := db.First(&ann, annIDStr).Error; err != nil {
        c.JSON(404, gin.H{"error":"ไม่พบประกาศ"}); return
    }
    if ann.ClubID != uint(clubID) {
        c.JSON(404, gin.H{"error":"ไม่พบประกาศในชมรมนี้"}); return
    }

    if err := db.Model(&ann).Updates(map[string]interface{}{
        "title": body.Title, "content": body.Content,
    }).Error; err != nil {
        c.JSON(500, gin.H{"error":"อัปเดตประกาศไม่สำเร็จ"}); return
    }
    c.JSON(200, gin.H{"success": true, "message":"อัปเดตประกาศสำเร็จ", "data": ann})
}

func DeleteClubAnnouncement(c *gin.Context) {
    db := config.DB()
    clubIDStr := c.Param("id")
    annIDStr  := c.Param("annId")

    clubIDu64, err := strconv.ParseUint(clubIDStr, 10, 64)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "club id ไม่ถูกต้อง"})
        return
    }
    clubID := uint(clubIDu64)

    if _, err := requirePresident(c, clubID); err != nil { return }

    var ann entity.ClubAnnouncement
    if err := db.Where("id = ? AND club_id = ?", annIDStr, clubID).
        First(&ann).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบประกาศ"})
        return
    }

    if err := db.Delete(&ann).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "ลบประกาศไม่สำเร็จ"})
        return
    }
    c.JSON(http.StatusOK, gin.H{"success": true, "message": "ลบประกาศสำเร็จ"})
}

