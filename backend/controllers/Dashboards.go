package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)
type DashboardHandler struct {
    DB *gorm.DB
}
type TopActivity struct {
    Title      string `json:"title"`
    ClubName   string `json:"club_name"`
    JoinCount  int    `json:"join_count"`
}

func (h *DashboardHandler) GetTopActivities(c *gin.Context) {
    var topActivities []TopActivity

    h.DB.Table("activities a").
        Select("a.title, c.name as club_name, COUNT(ar.id) as join_count").
        Joins("JOIN clubs c ON a.club_id = c.id").
        Joins("LEFT JOIN activity_registrations ar ON a.id = ar.activity_id AND ar.status_id = 1").
        Group("a.id, a.title, c.name").
        Order("join_count DESC").
        Limit(3).
        Scan(&topActivities)

    c.JSON(http.StatusOK, topActivities)
}

type AttendanceRate struct {
    AverageRate float64 `json:"average_rate"` 
}

func (h *DashboardHandler) GetAverageAttendanceRate(c *gin.Context) {
    type Result struct {
        Capacity   int
        TotalJoin  int
    }

    var rows []Result
    h.DB.Table("activities a").
        Select(`a.capacity,
            (SELECT COUNT(*) FROM activity_registrations ar 
             WHERE ar.activity_id = a.id AND ar.status_id = 1) as total_join`).
        Scan(&rows)

    var sum float64
    var count int
    for _, r := range rows {
        if r.Capacity > 0 {
            sum += (float64(r.TotalJoin) / float64(r.Capacity)) * 100
            count++
        }
    }

    rate := 0.0
    if count > 0 {
        rate = sum / float64(count)
    }

    c.JSON(http.StatusOK, AttendanceRate{AverageRate: rate})
}

type ClubStat struct {
    ClubName     string `json:"club_name"`
    Activities   int    `json:"activities"`
    Participants int    `json:"participants"`
}

func (h *DashboardHandler) GetClubStatistics(c *gin.Context) {
    var stats []ClubStat
    h.DB.Table("activities a").
        Select(`
            c.name as club_name,
            COUNT(a.id) as activities,
            COUNT(DISTINCT ar.user_id) as participants`).
        Joins("JOIN clubs c ON a.club_id = c.id").
        Joins("LEFT JOIN activity_registrations ar ON a.id = ar.activity_id AND ar.status_id = 1").
        Group("c.id, c.name").
        Order("activities DESC").
        Scan(&stats)

    c.JSON(http.StatusOK, stats)
}

type StatusDistribution struct {
    Status string `json:"status"`
    Count  int    `json:"count"`
}

func (h *DashboardHandler) GetActivityStatusDistribution(c *gin.Context) {
    var results []StatusDistribution
    h.DB.Table("activities a").
        Select("s.name as status, COUNT(a.id) as count").
        Joins("JOIN activity_statuses s ON a.status_id = s.id").
        Group("s.name").
        Scan(&results)

    c.JSON(http.StatusOK, results)
}

type HomePageStats struct {
    TotalClubs         int `json:"total_clubs"`
    TotalEvents        int `json:"total_events"`
    TotalStudents      int `json:"total_students"`        // นับ student + club_admin
    ParticipatedCount  int `json:"participated_count"`    // จำนวนคนที่เช็คชื่อแล้ว (student + club_admin)
}

func (h *DashboardHandler) GetHomePageStats(c *gin.Context) {
    var stats HomePageStats

    // 1. นับจำนวนชมรม
    var totalClubs int64
    h.DB.Table("clubs").Count(&totalClubs)
    stats.TotalClubs = int(totalClubs)

    // 2. นับจำนวนกิจกรรม
    var totalEvents int64
    h.DB.Table("activities").Count(&totalEvents)
    stats.TotalEvents = int(totalEvents)

    // 3. นับนักศึกษา (รวมทั้ง student และ club_admin)
    var totalStudents int64
    h.DB.
        Table("users u").
        Joins("JOIN roles r ON u.role_id = r.id").
        Where("r.role_name IN ?", []string{"student", "club_admin"}).
        Count(&totalStudents)
    stats.TotalStudents = int(totalStudents)

    // 4. นับนักศึกษาที่เคยเช็คชื่อเข้าร่วมกิจกรรม
    var participatedCount int64
    h.DB.
        Table("activity_registrations ar").
        Joins("JOIN attendance_logs al ON ar.id = al.registration_id").
        Joins("JOIN users u ON ar.user_id = u.id").
        Joins("JOIN roles r ON u.role_id = r.id").
        Where("al.checkin_time IS NOT NULL AND r.role_name IN ?", []string{"student", "club_admin"}).
        Distinct("ar.user_id").
        Count(&participatedCount)
    stats.ParticipatedCount = int(participatedCount)

    // ส่งผลลัพธ์ออกไป
    c.JSON(http.StatusOK, stats)
}


type ReviewStats struct {
	AverageRating float64 `json:"average_rating"`
	TotalReviews  int64   `json:"total_reviews"`
}


func (h *DashboardHandler) GetReviewStats(c *gin.Context) {
	var stats ReviewStats

	// คำนวณค่าเฉลี่ย
	h.DB.
		Table("activity_reviews").
		Select("COALESCE(AVG(rating), 0)").
		Row().
		Scan(&stats.AverageRating)

	// นับจำนวนรีวิวทั้งหมด
	h.DB.
		Table("activity_reviews").
		Count(&stats.TotalReviews)

	c.JSON(http.StatusOK, stats)
}
