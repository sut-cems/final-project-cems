package controllers
import (
	"net/http"

	"final-project/cems/config"
	"final-project/cems/entity"
	"github.com/gin-gonic/gin"
)

func GetClubMembers(c *gin.Context) {
	db := config.DB()
	var members []entity.ClubMember
	if err := db.Find(&members).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Club members fetched", "data": members})
}

func CreateClubMember(c *gin.Context) {
	db := config.DB()
	var input entity.ClubMember
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := db.Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Club member added", "data": input})
}

//ดึง club id จาก user id
func GetClubMembersByUserID(c *gin.Context) {
    userID := c.Param("id") // ✅ เปลี่ยนชื่อให้ถูกต้อง
    var clubMember entity.ClubMember
    db := config.DB()

    if err := db.Where("user_id = ?", userID).First(&clubMember).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{
            "error": "User not found in club members",
        })
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "data": clubMember, // ✅ ห่อข้อมูลด้วย key "data" เพื่อ frontend ใช้ง่าย
    })
}



