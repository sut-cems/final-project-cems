package controllers

import (
    "final-project/cems/entity"
    "net/http"
    "strconv"
    "time"
    "fmt"
    "path/filepath"
    "os"
    "strings"
    "log"

    "github.com/gin-gonic/gin"
    "gorm.io/gorm"
    "github.com/jung-kurt/gofpdf"
    "math"
)

// 1. Dashboard Statistics 
type DashboardStats struct {
    TotalActivities    int     `json:"total_activities"`
    TotalParticipants  int     `json:"total_participants"`
    TotalHours         float64 `json:"total_hours"`
    AverageRating      float64 `json:"average_rating"`
    TotalRegistrations int     `json:"total_registrations"`
    GrowthPercentage   struct {
        Activities    float64 `json:"activities"`
        Participants  float64 `json:"participants"`
        Hours         float64 `json:"hours"`
        Rating        float64 `json:"rating"`
        Registrations float64 `json:"registrations"`
    } `json:"growth_percentage"`
    PeriodInfo struct {
        CurrentMonth string `json:"current_month"`
        LastMonth    string `json:"last_month"`
    } `json:"period_info"`
}

// Dashboard Statistics
func (h *ReportHandler) GetDashboardStats(c *gin.Context) {
    var stats DashboardStats
    
    now := time.Now()
    startOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
    endOfMonth := startOfMonth.AddDate(0, 1, 0).Add(-time.Second)
    startOfLastMonth := startOfMonth.AddDate(0, -1, 0)
    endOfLastMonth := startOfMonth.Add(-time.Second)
    
    stats.PeriodInfo.CurrentMonth = startOfMonth.Format("January 2006")
    stats.PeriodInfo.LastMonth = startOfLastMonth.Format("January 2006")
    
    var currentActivities, lastMonthActivities int64
    if err := h.DB.Model(&entity.Activity{}).
        Where("created_at >= ? AND created_at <= ?", startOfMonth, endOfMonth).
        Count(&currentActivities).Error; err != nil {
        log.Printf("Error counting current activities: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch activity stats"})
        return
    }
    
    if err := h.DB.Model(&entity.Activity{}).
        Where("created_at >= ? AND created_at <= ?", startOfLastMonth, endOfLastMonth).
        Count(&lastMonthActivities).Error; err != nil {
        log.Printf("Error counting last month activities: %v", err)
    }
    
    stats.TotalActivities = int(currentActivities)
    if lastMonthActivities > 0 {
        stats.GrowthPercentage.Activities = float64(currentActivities-lastMonthActivities) / float64(lastMonthActivities) * 100
    }
    
    var currentRegistrations, lastMonthRegistrations int64
    h.DB.Table("activity_registrations ar").
        Joins("JOIN activities a ON ar.activity_id = a.id").
        Where("a.created_at >= ? AND a.created_at <= ?", startOfMonth, endOfMonth).
        Count(&currentRegistrations)
    
    h.DB.Table("activity_registrations ar").
        Joins("JOIN activities a ON ar.activity_id = a.id").
        Where("a.created_at >= ? AND a.created_at <= ?", startOfLastMonth, endOfLastMonth).
        Count(&lastMonthRegistrations)
    
    stats.TotalRegistrations = int(currentRegistrations)
    if lastMonthRegistrations > 0 {
        stats.GrowthPercentage.Registrations = float64(currentRegistrations-lastMonthRegistrations) / float64(lastMonthRegistrations) * 100
    }
    
    var currentParticipants, lastMonthParticipants int64
    h.DB.Table("activity_registrations ar").
        Joins("JOIN attendance_logs al ON ar.id = al.registration_id").
        Joins("JOIN activities a ON ar.activity_id = a.id").
        Where("a.created_at >= ? AND a.created_at <= ? AND al.checkin_time IS NOT NULL", startOfMonth, endOfMonth).
        Distinct("ar.user_id").Count(&currentParticipants)
    
    h.DB.Table("activity_registrations ar").
        Joins("JOIN attendance_logs al ON ar.id = al.registration_id").
        Joins("JOIN activities a ON ar.activity_id = a.id").
        Where("a.created_at >= ? AND a.created_at <= ? AND al.checkin_time IS NOT NULL", startOfLastMonth, endOfLastMonth).
        Distinct("ar.user_id").Count(&lastMonthParticipants)
    
    stats.TotalParticipants = int(currentParticipants)
    if lastMonthParticipants > 0 {
        stats.GrowthPercentage.Participants = float64(currentParticipants-lastMonthParticipants) / float64(lastMonthParticipants) * 100
    }
    
    var currentHours, lastMonthHours float64
    h.DB.Table("activity_hours ah").
        Joins("JOIN activities a ON ah.activity_id = a.id").
        Where("a.created_at >= ? AND a.created_at <= ? AND ah.verified_by IS NOT NULL", startOfMonth, endOfMonth).
        Select("COALESCE(SUM(ah.hours), 0)").Scan(&currentHours)
    
    h.DB.Table("activity_hours ah").
        Joins("JOIN activities a ON ah.activity_id = a.id").
        Where("a.created_at >= ? AND a.created_at <= ? AND ah.verified_by IS NOT NULL", startOfLastMonth, endOfLastMonth).
        Select("COALESCE(SUM(ah.hours), 0)").Scan(&lastMonthHours)
    
    stats.TotalHours = currentHours
    if lastMonthHours > 0 {
        stats.GrowthPercentage.Hours = (currentHours - lastMonthHours) / lastMonthHours * 100
    }
    
    var currentRating, lastMonthRating float64
    h.DB.Table("activity_reviews ar").
        Joins("JOIN activities a ON ar.activity_id = a.id").
        Where("a.created_at >= ? AND a.created_at <= ?", startOfMonth, endOfMonth).
        Select("COALESCE(AVG(ar.rating), 0)").Scan(&currentRating)
    
    h.DB.Table("activity_reviews ar").
        Joins("JOIN activities a ON ar.activity_id = a.id").
        Where("a.created_at >= ? AND a.created_at <= ?", startOfLastMonth, endOfLastMonth).
        Select("COALESCE(AVG(ar.rating), 0)").Scan(&lastMonthRating)
    
    stats.AverageRating = currentRating
    if lastMonthRating > 0 {
        stats.GrowthPercentage.Rating = (currentRating - lastMonthRating) / lastMonthRating * 100
    }
    
    c.JSON(http.StatusOK, stats)
}

// Participation Chart Data
func (h *ReportHandler) GetParticipationChart(c *gin.Context) {
    
    var months []string
    var data []int
    
    now := time.Now()
    for i := 5; i >= 0; i-- {
        monthStart := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location()).AddDate(0, -i, 0)
        monthEnd := monthStart.AddDate(0, 1, 0)
        
        var count int64
        h.DB.Table("activity_registrations ar").
            Joins("JOIN attendance_logs al ON ar.id = al.registration_id").
            Joins("JOIN activities a ON ar.activity_id = a.id").
            Where("a.date_start >= ? AND a.date_start < ? AND al.checkin_time IS NOT NULL", monthStart, monthEnd).
            Count(&count)
        
        months = append(months, monthStart.Format("Jan"))
        data = append(data, int(count))
    }
    
    chart := ParticipationChart{
        Labels: months,
        Data:   data,
    }
    
    c.JSON(http.StatusOK, chart)
}

// Activity Hours Chart Data
func (h *ReportHandler) GetActivityHoursChart(c *gin.Context) {
    type CategoryHours struct {
        CategoryName string  `json:"category_name"`
        TotalHours   float64 `json:"total_hours"`
    }
    
    var results []CategoryHours
    h.DB.Table("activity_hours ah").
        Joins("JOIN activities a ON ah.activity_id = a.id").
        Joins("JOIN event_categories ec ON a.category_id = ec.id").
        Where("ah.verified_by IS NOT NULL").
        Select("ec.name as category_name, SUM(ah.hours) as total_hours").
        Group("ec.id, ec.name").
        Scan(&results)
    
    var labels []string
    var data []float64
    colors := []string{"#640D5F", "#D91656", "#EB5B00", "#FFB200", "#8B5CF6"}
    
    for _, result := range results {
        labels = append(labels, result.CategoryName)
        data = append(data, result.TotalHours)
    }
    
    chart := ActivityHoursChart{
        Labels: labels,
        Data:   data,
        Colors: colors[:len(results)],
    }
    
    c.JSON(http.StatusOK, chart)
}

// getReportDirectory ส่งคืน directory path สำหรับประเภท report ที่ระบุ
func getReportDirectory(reportType string) string {
    return filepath.Join("reports", reportType)
}

func (h *ReportHandler) DeleteReport(c *gin.Context) {
    id := c.Param("id")
    var report entity.ActivityReport
    if err := h.DB.First(&report, id).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Report not found"})
        return
    }
    
    // สร้าง full path ของไฟล์โดยใช้ getReportDirectory
    filePath := filepath.Join(getReportDirectory(report.Type), report.FileURL)
    
    // ตรวจสอบว่าไฟล์มีอยู่จริงหรือไม่
    if _, err := os.Stat(filePath); err == nil {
        // ลบไฟล์
        if err := os.Remove(filePath); err != nil {
            log.Printf("Failed to delete report file at %s: %v", filePath, err)
            c.JSON(http.StatusInternalServerError, gin.H{
                "error": "Failed to delete report file",
                "details": err.Error(),
            })
            return
        }
        log.Printf("Successfully deleted report file: %s", filePath)
    } else if os.IsNotExist(err) {
        // ไฟล์ไม่พบ - log แล้วดำเนินการต่อ
        log.Printf("Report file not found at %s, continuing with database deletion", filePath)
    } else {
        // Error อื่นๆ ในการเช็คไฟล์
        log.Printf("Error checking file existence at %s: %v", filePath, err)
    }
    
    // ลบ record ใน database
    if err := h.DB.Delete(&report).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": "Failed to delete report from database",
            "details": err.Error(),
        })
        return
    }
    
    log.Printf("Successfully deleted report ID %s from database", id)
    c.JSON(http.StatusOK, gin.H{
        "message": "Report deleted successfully",
        "report_id": id,
        "file_path": filePath,
    })
}

// DownloadReport handles downloading a report file by ID.
func (h *ReportHandler) DownloadReport(c *gin.Context) {
	id := c.Param("id")
	var report entity.ActivityReport
	if err := h.DB.First(&report, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Report not found"})
		return
	}

	filePath := filepath.Join(getReportDirectory(report.Type), report.FileURL)
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		c.JSON(http.StatusNotFound, gin.H{"error": "file not found"})
		return
	}

	// ให้ชื่อไฟล์สวย ๆ ไม่โชว์ UUID
	displayFilename := strings.ReplaceAll(report.Name, " ", "_") + ".pdf"

	c.Header("Content-Type", "application/pdf")
	c.Header("Content-Disposition", "inline; filename=" + displayFilename)
	c.File(filePath)
}


// 2. Chart Data APIs
// GET /reports/charts/participation?period=6months
type ParticipationChart struct {
    Labels []string `json:"labels"`
    Data   []int    `json:"data"`
}

// GET /reports/charts/activity-hours
type ActivityHoursChart struct {
    Labels []string  `json:"labels"`
    Data   []float64 `json:"data"`
    Colors []string  `json:"colors"`
}

// 3. Report Generation APIs
// POST /reports/generate
type ReportRequest struct {
    Type        string `json:"type" binding:"required"` 
    Period      string `json:"period"`                  
    StartDate   string `json:"start_date,omitempty"`
    EndDate     string `json:"end_date,omitempty"`
    ClubID      *uint  `json:"club_id,omitempty"`
    Format      string `json:"format"`                 
    UserID      uint   `json:"user_id"`
    UserName  string `json:"user_name"`   
    StudentID string `json:"student_id"`  
    ClubName  string `json:"club_name"`  
}

type ReportResponse struct {
    ReportID  uint   `json:"report_id"`
    Status    string `json:"status"`    
    Message   string `json:"message"`
    FileURL   string `json:"file_url,omitempty"`
}

// 4. Report List API
// GET /reports/list?page=1&limit=10
type ReportListItem struct {
    ID          uint      `json:"id"`
    Name        string    `json:"name"`
    Type        string    `json:"type"`
    Status      string    `json:"status"`
    FileURL     string    `json:"file_url"`
    GeneratedAt time.Time `json:"generated_at"`
    UserID      uint      `json:"user_id"`
}

type ReportListResponse struct {
    Reports []ReportListItem `json:"reports"`
    Total   int              `json:"total"`
    Page    int              `json:"page"`
    Limit   int              `json:"limit"`
}

type ReportHandler struct {
    DB *gorm.DB
}

// Get Report List// GetReportList - รายงานแบบมี filter period
func (h *ReportHandler) GetReportList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	offset := (page - 1) * limit

	search := c.Query("search")
	reportType := c.Query("type")
	status := c.Query("status")
	period := c.Query("period")
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")

	var reports []ReportListItem
	var total int64

	query := h.DB.Model(&entity.ActivityReport{})

	if search != "" {
		query = query.Where("LOWER(name) LIKE ?", "%"+strings.ToLower(search)+"%")
	}

	if reportType != "" {
		query = query.Where("type = ?", reportType)
	}

	if status != "" {
		query = query.Where("status = ?", status)
	}

	if period != "" {
		now := time.Now()
		switch period {
		case "week":
			weekday := int(now.Weekday())
			if weekday == 0 {
				weekday = 7
			}
			start := now.AddDate(0, 0, -weekday+1)
			end := start.AddDate(0, 0, 6)
			query = query.Where("generated_at BETWEEN ? AND ?", start, end)

		case "this_month":
			start := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
			end := start.AddDate(0, 1, -1)
			query = query.Where("generated_at BETWEEN ? AND ?", start, end)

		case "this_quarter":
			month := (int(now.Month())-1)/3*3 + 1
			start := time.Date(now.Year(), time.Month(month), 1, 0, 0, 0, 0, now.Location())
			end := start.AddDate(0, 3, -1)
			query = query.Where("generated_at BETWEEN ? AND ?", start, end)

		case "this_year":
			start := time.Date(now.Year(), 1, 1, 0, 0, 0, 0, now.Location())
			end := time.Date(now.Year(), 12, 31, 23, 59, 59, 0, now.Location())
			query = query.Where("generated_at BETWEEN ? AND ?", start, end)

		case "custom":
			layout := "2006-01-02"
			if startDate != "" && endDate != "" {
				start, err1 := time.Parse(layout, startDate)
				end, err2 := time.Parse(layout, endDate)
				if err1 == nil && err2 == nil && !end.Before(start) {
					query = query.Where("generated_at BETWEEN ? AND ?", start, end)
				}
			}
		}
	}

	if err := query.Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to count reports",
			"details": err.Error(),
		})
		return
	}

	if err := query.
		Select("id, name, type, file_url, generated_at, user_id, status").
		Order("generated_at DESC").
		Limit(limit).
		Offset(offset).
		Scan(&reports).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to fetch reports",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, ReportListResponse{
		Reports: reports,
		Total:   int(total),
		Page:    page,
		Limit:   limit,
	})
}

func getReportPeriod(req ReportRequest) (time.Time, time.Time, error) {
	now := time.Now()
	layout := "2006-01-02"

	switch req.Period {
	case "week":
        weekday := int(now.Weekday())
        if weekday == 0 {
            weekday = 7
        }
        start := now.AddDate(0, 0, -weekday+1)
        start = time.Date(start.Year(), start.Month(), start.Day(), 0, 0, 0, 0, start.Location())
        end := start.AddDate(0, 0, 6)
        end = time.Date(end.Year(), end.Month(), end.Day(), 23, 59, 59, 999999999, end.Location())
		return start, end, nil

	case "this_month":
		start := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
		end := start.AddDate(0, 1, -1)
		return start, end, nil

	case "this_quarter":
		month := (int(now.Month())-1)/3*3 + 1
		start := time.Date(now.Year(), time.Month(month), 1, 0, 0, 0, 0, now.Location())
		end := start.AddDate(0, 3, -1)
		return start, end, nil

	case "this_year":
		start := time.Date(now.Year(), 1, 1, 0, 0, 0, 0, now.Location())
		end := time.Date(now.Year(), 12, 31, 23, 59, 59, 0, now.Location())
		return start, end, nil

	case "custom":
		if req.StartDate == "" || req.EndDate == "" {
			return time.Time{}, time.Time{}, fmt.Errorf("start_date and end_date required for custom period")
		}
		start, err1 := time.Parse(layout, req.StartDate)
		end, err2 := time.Parse(layout, req.EndDate)
		if err1 != nil || err2 != nil {
			return time.Time{}, time.Time{}, fmt.Errorf("invalid custom dates")
		}
		return start, end, nil

	default:
		return time.Time{}, time.Time{}, fmt.Errorf("invalid period")
	}
}

func FormatThaiDate(t time.Time) string {
    thaiMonths := [...]string{
        "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
        "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
    }
    return fmt.Sprintf("%d %s %d", t.Day(), thaiMonths[int(t.Month())-1], t.Year()+543)
}

// ===========================================
// Utility for standardized Header/Footer
// ===========================================
func applyHeaderFooter(pdf *gofpdf.Fpdf, title string) {
	// Header แสดงเฉพาะหน้าแรก (page 1) เท่านั้น
	pdf.SetHeaderFuncMode(func() {
		if pdf.PageNo() == 1 {
			pdf.SetFont("THSarabunNew", "B", 18)
			pdf.SetY(10)
			pdf.CellFormat(0, 12, title, "0", 1, "C", false, 0, "")
			pdf.Ln(2)
			// เส้นใต้หัวข้อ
			pdf.SetLineWidth(0.5)
			pdf.Line(15, 25, 195, 25)
			pdf.Ln(3)
		}
	}, true)

	// Footer แสดงทุกหน้า
	pdf.SetFooterFunc(func() {
		pdf.SetY(-15)
		pdf.SetLineWidth(0.3)
		pdf.Line(15, pdf.GetY(), 195, pdf.GetY())
		pdf.SetY(-12)
		pdf.SetFont("THSarabunNew", "I", 12)
		pdf.CellFormat(0, 8, fmt.Sprintf("หน้าที่ %d", pdf.PageNo()), "0", 0, "C", false, 0, "")
	})
}

// ===========================================
// Generate Activity Summary Report
// ===========================================
func generateActivitySummaryReport(db *gorm.DB,start, end time.Time, savePath string) error {
    type ActivityWithStats struct {
	ID         uint
	Title      string
	Capacity   int
	DateStart  time.Time
	DateEnd    time.Time
	ClubName   string
	Category   string
	TotalJoin  int
    }

    var activities []ActivityWithStats
    db.Table("activities").
        Select(`activities.id, activities.title, activities.capacity, activities.date_start, activities.date_end,
                clubs.name AS club_name, event_categories.name AS category, 
                (SELECT COUNT(*) FROM activity_registrations 
                    WHERE activity_registrations.activity_id = activities.id AND activity_registrations.status_id = 1
                ) AS total_join`).
        Joins("LEFT JOIN clubs ON activities.club_id = clubs.id").
        Joins("LEFT JOIN event_categories ON activities.category_id = event_categories.id").
        Where("activities.date_start BETWEEN ? AND ?", start, end).
        Order("date_start").
        Scan(&activities)

    pdf := gofpdf.New("P", "mm", "A4", "")
    pdf.AddUTF8Font("THSarabunNew", "", "./fonts/THSarabunNew.ttf")
    pdf.AddUTF8Font("THSarabunNew", "B", "./fonts/THSarabunNew-Bold.ttf")
    pdf.AddUTF8Font("THSarabunNew", "I", "./fonts/THSarabunNew-Italic.ttf")
    pdf.SetMargins(15, 25, 15)
    applyHeaderFooter(pdf, "รายงานสรุปกิจกรรม")

    pdf.AddPage()
    pdf.SetY(35)

    // ข้อมูลรายงาน
    pdf.SetFont("THSarabunNew", "", 14)
    pdf.CellFormat(0, 8, "รายงานสรุปกิจกรรมทั้งหมดของสถาบัน", "0", 1, "L", false, 0, "")
    pdf.CellFormat(0, 8, fmt.Sprintf("จำนวนกิจกรรมทั้งหมด: %d กิจกรรม", len(activities)), "0", 1, "L", false, 0, "")
    pdf.CellFormat(0, 8, "วันที่ออกรายงาน: "+FormatThaiDate(time.Now()), "0", 1, "L", false, 0, "")
    pdf.Ln(6)

    // Table header
    pdf.SetFont("THSarabunNew", "B", 12)
    pdf.SetFillColor(240, 240, 240)
    colAct := []float64{10, 45, 35, 25, 28, 15, 18} // รวม ~176mm
    headAct := []string{"ลำดับ", "ชื่อกิจกรรม", "ชมรม", "หมวดหมู่", "ระยะเวลา", "รับ", "เข้าร่วม"}

    
    for i, h := range headAct {
        pdf.CellFormat(colAct[i], 6, h, "1", 0, "C", true, 0, "")
    }
    pdf.Ln(-1)

    // ฟังก์ชันสำหรับแบ่งข้อความหลายบรรทัด
    wrapText := func(text string, maxWidth float64) []string {
        // จัดการกับคำที่ยาวมากโดยเฉพาะชื่อชมรม
        text = strings.ReplaceAll(text, "อิเล็กทรอนิกส์และนวัตกรรมระบบสมองกลฝังตัว", "อิเล็กทรอนิกส์และ\nนวัตกรรมระบบสมองกลฝังตัว")
        text = strings.ReplaceAll(text, "ดนตรีและนาฎศิลป์ไทยมทส.", "ดนตรีและ\nนาฎศิลป์ไทยมทส.")
        text = strings.ReplaceAll(text, "ดาราศาสตร์และอวกาศมทส.", "ดาราศาสตร์และ\nอวกาศมทส.")
        text = strings.ReplaceAll(text, "ค่ายอาสาพัฒนาชนบท", "ค่ายอาสา\nพัฒนาชนบท")
        
        // แบ่งข้อความที่มี \n ก่อน
        paragraphs := strings.Split(text, "\n")
        var allLines []string
        
        for _, paragraph := range paragraphs {
            words := strings.Fields(paragraph)
            if len(words) == 0 {
                if paragraph == "" && len(paragraphs) > 1 {
                    continue // ข้าม empty line ระหว่างย่อหน้า
                }
                allLines = append(allLines, paragraph)
                continue
            }
            
            var lines []string
            var currentLine strings.Builder
            
            for _, word := range words {
                testLine := currentLine.String()
                if testLine != "" {
                    testLine += " "
                }
                testLine += word
                
                if pdf.GetStringWidth(testLine) <= maxWidth-2 {
                    if currentLine.Len() > 0 {
                        currentLine.WriteString(" ")
                    }
                    currentLine.WriteString(word)
                } else {
                    if currentLine.Len() > 0 {
                        lines = append(lines, currentLine.String())
                        currentLine.Reset()
                    }
                    currentLine.WriteString(word)
                }
            }
            
            if currentLine.Len() > 0 {
                lines = append(lines, currentLine.String())
            }
            
            allLines = append(allLines, lines...)
        }
        
        return allLines
    }

    // ฟังก์ชันสำหรับวาดหัวตาราง
    drawTableHeader := func() {
        pdf.SetFont("THSarabunNew", "B", 12)
        pdf.SetFillColor(240, 240, 240)
        for j, h := range headAct {
            pdf.CellFormat(colAct[j], 6, h, "1", 0, "C", true, 0, "")
        }
        pdf.Ln(-1)
    }

    // ฟังก์ชันสำหรับวาด multiline cell
    drawMultilineCell := func(x, y, width, height float64, lines []string, align string, border bool) {
        pdf.SetXY(x, y)
        
        // วาดเส้นขอบ
        if border {
            pdf.Rect(x, y, width, height, "D")
        }
        
        // คำนวณความสูงบรรทัดและเริ่มต้น
        lineHeight := 6.0 // ความสูงบรรทัดคงที่
        startY := y + (height - float64(len(lines))*lineHeight) / 2 // จัดกึ่งกลางในแนวตั้ง
        
        for i, line := range lines {
            pdf.SetXY(x+1, startY + float64(i)*lineHeight) // เพิ่ม padding ด้านซ้าย
            pdf.CellFormat(width-2, lineHeight, line, "0", 0, align, false, 0, "")
        }
    }

    // Rows
    pdf.SetFont("THSarabunNew", "", 12)
    for i, a := range activities {
        // แบ่งข้อความหลายบรรทัด
        titleLines := wrapText(a.Title, colAct[1])
        clubLines := wrapText(a.ClubName, colAct[2])
        categoryLines := wrapText(a.Category, colAct[3])
        
        // คำนวณความสูงของแถว (ขั้นต่ำ 12mm)
        maxLines := len(titleLines)
        if len(clubLines) > maxLines {
            maxLines = len(clubLines)
        }
        if len(categoryLines) > maxLines {
            maxLines = len(categoryLines)
        }
        
        rowHeight := math.Max(12.0, float64(maxLines) * 6.0) // ความสูงขั้นต่ำ 12mm
        
        // ตรวจสอบว่าแถวจะพอดีในหน้าหรือไม่
        if pdf.GetY() + rowHeight > 265 {
            pdf.AddPage()
            pdf.SetY(20)
            drawTableHeader()
            pdf.SetFont("THSarabunNew", "", 12)
        }

        currentY := pdf.GetY()
        currentX := pdf.GetX()
        
        // จัดรูปแบบวันที่ให้เป็น dd/mm/yy
        dateRange := fmt.Sprintf("%s - %s",
            a.DateStart.Format("02/01/06"), a.DateEnd.Format("02/01/06"))

        // วาดเซลล์ลำดับ
        pdf.SetXY(currentX, currentY)
        pdf.CellFormat(colAct[0], rowHeight, fmt.Sprintf("%d", i+1), "1", 0, "C", false, 0, "")
        
        // วาดเซลล์ชื่อกิจกรรม (multiline)
        drawMultilineCell(currentX+colAct[0], currentY, colAct[1], rowHeight, titleLines, "L", true)
        
        // วาดเซลล์ชมรม (multiline)
        drawMultilineCell(currentX+colAct[0]+colAct[1], currentY, colAct[2], rowHeight, clubLines, "L", true)
        
        // วาดเซลล์หมวดหมู่ (multiline)
        drawMultilineCell(currentX+colAct[0]+colAct[1]+colAct[2], currentY, colAct[3], rowHeight, categoryLines, "L", true)
        
        // วาดเซลล์ระยะเวลา
        pdf.SetXY(currentX+colAct[0]+colAct[1]+colAct[2]+colAct[3], currentY)
        pdf.CellFormat(colAct[4], rowHeight, dateRange, "1", 0, "C", false, 0, "")
        
        // วาดเซลล์จำนวนรับ
        pdf.SetXY(currentX+colAct[0]+colAct[1]+colAct[2]+colAct[3]+colAct[4], currentY)
        pdf.CellFormat(colAct[5], rowHeight, fmt.Sprintf("%d", a.Capacity), "1", 0, "C", false, 0, "")

        // วาดเซลล์จำนวนเข้าร่วม
        pdf.SetXY(currentX+colAct[0]+colAct[1]+colAct[2]+colAct[3]+colAct[4]+colAct[5], currentY)
        pdf.CellFormat(colAct[6], rowHeight, fmt.Sprintf("%d", a.TotalJoin), "1", 0, "C", false, 0, "")

        // ขยับตำแหน่ง Y สำหรับแถวถัดไป
        pdf.SetY(currentY + rowHeight)
    }

    // ส่วนสรุป
    pdf.Ln(8)
    pdf.SetFont("THSarabunNew", "B", 14)
    pdf.CellFormat(0, 8, "สรุป", "0", 1, "L", false, 0, "")
    pdf.SetFont("THSarabunNew", "", 12)
    pdf.CellFormat(0, 6, fmt.Sprintf("• กิจกรรมทั้งหมด: %d กิจกรรม", len(activities)), "0", 1, "L", false, 0, "")

    totalCapacity := 0
    totalParticipants := 0
    for _, a := range activities {
        totalCapacity += a.Capacity
        totalParticipants += a.TotalJoin
    }
    pdf.CellFormat(0, 6, fmt.Sprintf("• รับผู้เข้าร่วมรวม: %d คน", totalCapacity), "0", 1, "L", false, 0, "")
    pdf.CellFormat(0, 6, fmt.Sprintf("• จำนวนผู้เข้าร่วมจริง: %d คน", totalParticipants), "0", 1, "L", false, 0, "")

    // ลายเซ็นอย่างเป็นทางการ - ชิดขวาตามรูปแบบเอกสารทางการไทย
    pdf.Ln(20)
    pdf.SetFont("THSarabunNew", "", 12)
    
    // คำนวณตำแหน่งที่ชิดขวาโดยคำนวณจากขอบขวา
    pageWidth := 210.0 // ความกว้าง A4
    rightMargin := 15.0 // margin ขวา
    signatureWidth := 75.0 // ความกว้างส่วนลายเซ็น
    signatureX := pageWidth - rightMargin - signatureWidth
    
    pdf.SetX(signatureX)
    pdf.CellFormat(signatureWidth, 6, "ลงชื่อ ................................................", "0", 1, "C", false, 0, "")
    pdf.SetX(signatureX)
    pdf.CellFormat(signatureWidth, 6, "(.................................................)", "0", 1, "C", false, 0, "")
    pdf.SetX(signatureX)
    pdf.CellFormat(signatureWidth, 6, "วันที่ ......./......./..........", "0", 1, "C", false, 0, "")

    if err := pdf.OutputFileAndClose(savePath); err != nil {
        return fmt.Errorf("failed to save PDF file: %w", err)
    }
    return nil
}

// ===========================================
// Student Activity-Hour Report 
// ===========================================
func generateStudentActivityHourReport(db *gorm.DB, userID uint,start, end time.Time, savePath string) error {
	var user entity.User
	if err := db.First(&user, userID).Error; err != nil {
		return fmt.Errorf("user not found: %w", err)
	}

    var hours []entity.ActivityHour
    err := db.Preload("Activity.Club").
        Joins("JOIN activities ON activities.id = activity_hours.activity_id").
        Where("activity_hours.user_id = ? AND activity_hours.verified_by IS NOT NULL", userID).
        Where("activities.date_start BETWEEN ? AND ?", start, end).
        Order("activity_hours.activity_id").
        Find(&hours).Error

    if err != nil {
        return fmt.Errorf("failed to fetch hours: %w", err)
    }

	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddUTF8Font("THSarabunNew", "", "./fonts/THSarabunNew.ttf")
	pdf.AddUTF8Font("THSarabunNew", "B", "./fonts/THSarabunNew-Bold.ttf")
	pdf.AddUTF8Font("THSarabunNew", "I", "./fonts/THSarabunNew-Italic.ttf")
	pdf.SetMargins(15, 25, 15)
	applyHeaderFooter(pdf, "รายงานชั่วโมงกิจกรรมนักศึกษา")

	pdf.AddPage()
	pdf.SetY(35)

	// ข้อมูลส่วนบุคคล
	pdf.SetFont("THSarabunNew", "B", 16)
	pdf.CellFormat(0, 8, "ข้อมูลส่วนบุคคล", "0", 1, "L", false, 0, "")
	pdf.SetFont("THSarabunNew", "", 14)
	pdf.CellFormat(0, 8, fmt.Sprintf("ชื่อ-นามสกุล: %s %s", user.FirstName, user.LastName), "0", 1, "L", false, 0, "")
	pdf.CellFormat(0, 8, fmt.Sprintf("รหัสนักศึกษา: %s", user.StudentID), "0", 1, "L", false, 0, "")
	pdf.CellFormat(0, 8, fmt.Sprintf("อีเมล: %s", user.Email), "0", 1, "L", false, 0, "")
    pdf.CellFormat(0, 8, "วันที่ออกรายงาน: "+FormatThaiDate(time.Now()), "0", 1, "L", false, 0, "")
	pdf.Ln(8)

	// ตารางกิจกรรม - ปรับขนาดคอลัมน์ให้เหมาะสม
	colWidths := []float64{12, 65, 35, 25, 20, 23} // รวม 180mm
	headers := []string{"ลำดับ", "ชื่อกิจกรรม", "ชมรม", "วันที่", "ชั่วโมง", "ผู้ตรวจสอบ"}

	// ฟังก์ชันสำหรับแบ่งข้อความหลายบรรทัด
	wrapText := func(text string, maxWidth float64) []string {
		// จัดการกับคำที่ยาวมากโดยเฉพาะชื่อชมรม
		text = strings.ReplaceAll(text, "อิเล็กทรอนิกส์และนวัตกรรมระบบสมองกลฝังตัว", "อิเล็กทรอนิกส์และ\nนวัตกรรมระบบสมองกลฝังตัว")
		text = strings.ReplaceAll(text, "ดนตรีและนาฎศิลป์ไทยมทส.", "ดนตรีและ\nนาฎศิลป์ไทยมทส.")
		text = strings.ReplaceAll(text, "ดาราศาสตร์และอวกาศมทส.", "ดาราศาสตร์และ\nอวกาศมทส.")
		text = strings.ReplaceAll(text, "ค่ายอาสาพัฒนาชนบท", "ค่ายอาสา\nพัฒนาชนบท")
		
		// แบ่งข้อความที่มี \n ก่อน
		paragraphs := strings.Split(text, "\n")
		var allLines []string
		
		for _, paragraph := range paragraphs {
			words := strings.Fields(paragraph)
			if len(words) == 0 {
				if paragraph == "" && len(paragraphs) > 1 {
					continue // ข้าม empty line ระหว่างย่อหน้า
				}
				allLines = append(allLines, paragraph)
				continue
			}
			
			var lines []string
			var currentLine strings.Builder
			
			for _, word := range words {
				testLine := currentLine.String()
				if testLine != "" {
					testLine += " "
				}
				testLine += word
				
				if pdf.GetStringWidth(testLine) <= maxWidth-2 {
					if currentLine.Len() > 0 {
						currentLine.WriteString(" ")
					}
					currentLine.WriteString(word)
				} else {
					if currentLine.Len() > 0 {
						lines = append(lines, currentLine.String())
						currentLine.Reset()
					}
					currentLine.WriteString(word)
				}
			}
			
			if currentLine.Len() > 0 {
				lines = append(lines, currentLine.String())
			}
			
			allLines = append(allLines, lines...)
		}
		
		return allLines
	}

	// ฟังก์ชันสำหรับวาดหัวตาราง
	drawTableHeader := func() {
		pdf.SetFont("THSarabunNew", "B", 14)
		pdf.SetFillColor(240, 240, 240)
		for i, h := range headers {
			align := "C"
			if i == 1 || i == 2 { // ชื่อกิจกรรม และ ชมรม
				align = "L"
			}
			pdf.CellFormat(colWidths[i], 10, h, "1", 0, align, true, 0, "")
		}
		pdf.Ln(-1)
	}

	// ฟังก์ชันสำหรับวาด multiline cell
	drawMultilineCell := func(x, y, width, height float64, lines []string, align string, border bool) {
		pdf.SetXY(x, y)
		
		// วาดเส้นขอบ
		if border {
			pdf.Rect(x, y, width, height, "D")
		}
		
		// คำนวณความสูงบรรทัดและเริ่มต้น
		lineHeight := 6.0 // ความสูงบรรทัดคงที่
		startY := y + (height - float64(len(lines))*lineHeight) / 2 // จัดกึ่งกลางในแนวตั้ง
		
		for i, line := range lines {
			pdf.SetXY(x+1, startY + float64(i)*lineHeight) // เพิ่ม padding ด้านซ้าย
			pdf.CellFormat(width-2, lineHeight, line, "0", 0, align, false, 0, "")
		}
	}

	// วาดหัวตาราง
	drawTableHeader()

	pdf.SetFont("THSarabunNew", "", 12)
	total := 0.0

	for i, h := range hours {
		// แบ่งข้อความหลายบรรทัด
		titleLines := wrapText(h.Activity.Title, colWidths[1])
		clubLines := wrapText(h.Activity.Club.Name, colWidths[2])
		
		// คำนวณความสูงของแถว (ขั้นต่ำ 10mm)
		maxLines := len(titleLines)
		if len(clubLines) > maxLines {
			maxLines = len(clubLines)
		}
		
		rowHeight := math.Max(10.0, float64(maxLines) * 6.0) // ความสูงขั้นต่ำ 10mm
		
		// ตรวจสอบว่าแถวจะพอดีในหน้าหรือไม่
		if pdf.GetY() + rowHeight > 260 {
			pdf.AddPage()
			pdf.SetY(20)
			drawTableHeader()
			pdf.SetFont("THSarabunNew", "", 12)
		}

		currentY := pdf.GetY()
		currentX := pdf.GetX()

		// ดึงข้อมูลผู้ตรวจสอบ
		var verifier entity.User
		db.Select("first_name, last_name").First(&verifier, h.VerifiedBy)

		// วาดเซลล์ลำดับ
		pdf.SetXY(currentX, currentY)
		pdf.CellFormat(colWidths[0], rowHeight, fmt.Sprintf("%d", i+1), "1", 0, "C", false, 0, "")
		
		// วาดเซลล์ชื่อกิจกรรม (multiline)
		drawMultilineCell(currentX+colWidths[0], currentY, colWidths[1], rowHeight, titleLines, "L", true)
		
		// วาดเซลล์ชมรม (multiline)
		drawMultilineCell(currentX+colWidths[0]+colWidths[1], currentY, colWidths[2], rowHeight, clubLines, "L", true)
		
		// วาดเซลล์วันที่
		pdf.SetXY(currentX+colWidths[0]+colWidths[1]+colWidths[2], currentY)
		pdf.CellFormat(colWidths[3], rowHeight, h.Activity.DateStart.Format("02/01/06"), "1", 0, "C", false, 0, "")
		
		// วาดเซลล์ชั่วโมง
		pdf.SetXY(currentX+colWidths[0]+colWidths[1]+colWidths[2]+colWidths[3], currentY)
		pdf.CellFormat(colWidths[4], rowHeight, fmt.Sprintf("%.1f", h.Hours), "1", 0, "C", false, 0, "")
		
		// วาดเซลล์ผู้ตรวจสอบ
		pdf.SetXY(currentX+colWidths[0]+colWidths[1]+colWidths[2]+colWidths[3]+colWidths[4], currentY)
		pdf.CellFormat(colWidths[5], rowHeight, verifier.FirstName, "1", 0, "C", false, 0, "")
		
		// ขยับตำแหน่ง Y สำหรับแถวถัดไป
		pdf.SetY(currentY + rowHeight)

		total += h.Hours
	}

	// สรุปชั่วโมง
	pdf.Ln(8)
	pdf.SetFont("THSarabunNew", "B", 14)
	pdf.SetFillColor(250, 250, 250)
	pdf.CellFormat(0, 10, fmt.Sprintf("รวมชั่วโมงกิจกรรมที่ได้รับการตรวจสอบแล้ว: %.1f ชั่วโมง", total), "1", 1, "C", true, 0, "")

	// ลายเซ็นผู้ตรวจสอบ
	pdf.Ln(15)
	pdf.SetFont("THSarabunNew", "", 12)
	pdf.CellFormat(0, 6, "ลงชื่อ ........................................................", "0", 1, "R", false, 0, "")
	pdf.CellFormat(0, 6, "(.........................................................)", "0", 1, "R", false, 0, "")
	pdf.CellFormat(0, 6, fmt.Sprintf("วันที่ %s", time.Now().Format("......./......./.........")), "0", 1, "R", false, 0, "")

    if err := pdf.OutputFileAndClose(savePath); err != nil {
        return fmt.Errorf("failed to save PDF file: %w", err)
    }
    return nil
}

// ===========================================
// Club Performance Report  
// ===========================================
func generateClubPerformanceReport(db *gorm.DB, clubID uint, start, end time.Time, savePath string) error {
	var club entity.Club
	if err := db.Preload("Category").
		Preload("Members").
		First(&club, clubID).Error; err != nil {
		return fmt.Errorf("club not found: %w", err)
	}

	var activities []entity.Activity
    db.Preload("Category").
        Where("club_id = ? AND date_start BETWEEN ? AND ?", clubID, start, end).
        Order("date_start").
        Find(&activities)

	type ActRow struct {
		Act               entity.Activity
		ParticipantCount  int64
		TotalHours        float64
		AvgRating         float64
	}
	rows := []ActRow{}

	var grandParticipants int64
	var grandHours float64
	var ratingSum float64
	var ratingCount int64

	for _, act := range activities {
		var pCount int64
		db.Model(&entity.ActivityRegistration{}).
			Where("activity_id = ? AND status_id IN (SELECT id FROM activity_registration_statuses WHERE name = 'registered')",
				act.ID).Count(&pCount)

		var hours float64
		db.Model(&entity.ActivityHour{}).
			Where("activity_id = ? AND verified_by IS NOT NULL", act.ID).
			Select("COALESCE(SUM(hours),0)").Scan(&hours)

		var avgRating float64
		db.Model(&entity.ActivityReview{}).
			Where("activity_id = ?", act.ID).
			Select("COALESCE(AVG(rating),0)").Scan(&avgRating)

		grandParticipants += pCount
		grandHours += hours
		if avgRating > 0 {
			ratingSum += avgRating
			ratingCount++
		}

		rows = append(rows, ActRow{
			Act:              act,
			ParticipantCount: pCount,
			TotalHours:       hours,
			AvgRating:        avgRating,
		})
	}
	
	overallRating := 0.0
	if ratingCount > 0 {
		overallRating = ratingSum / float64(ratingCount)
	}

	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddUTF8Font("THSarabunNew", "", "./fonts/THSarabunNew.ttf")
	pdf.AddUTF8Font("THSarabunNew", "B", "./fonts/THSarabunNew-Bold.ttf")
    pdf.AddUTF8Font("THSarabunNew", "I", "./fonts/THSarabunNew-Italic.ttf")
	pdf.SetMargins(15, 25, 15)
	applyHeaderFooter(pdf, fmt.Sprintf("รายงานผลการดำเนินงานชมรม%s", club.Name))

	pdf.AddPage()
	pdf.SetY(35)

	// ข้อมูลชมรม
	pdf.SetFont("THSarabunNew", "B", 16)
	pdf.CellFormat(0, 8, "ข้อมูลชมรม", "0", 1, "L", false, 0, "")
	pdf.SetFont("THSarabunNew", "", 14)
	pdf.CellFormat(0, 8, fmt.Sprintf("ชื่อชมรม: %s", club.Name), "0", 1, "L", false, 0, "")
	pdf.CellFormat(0, 8, fmt.Sprintf("ประเภทชมรม: %s", club.Category.Name), "0", 1, "L", false, 0, "")
	pdf.CellFormat(0, 8, fmt.Sprintf("จำนวนสมาชิก: %d คน", len(club.Members)), "0", 1, "L", false, 0, "")
    pdf.CellFormat(0, 8, "วันที่ออกรายงาน: "+FormatThaiDate(time.Now()), "0", 1, "L", false, 0, "")
	pdf.Ln(8)

	// สรุปผลการดำเนินงาน
	pdf.SetFont("THSarabunNew", "B", 16)
	pdf.CellFormat(0, 8, "สรุปผลการดำเนินงาน", "0", 1, "L", false, 0, "")
	pdf.SetFont("THSarabunNew", "", 14)
	pdf.CellFormat(0, 8, fmt.Sprintf("• จำนวนกิจกรรมที่จัด: %d กิจกรรม", len(activities)), "0", 1, "L", false, 0, "")
	pdf.CellFormat(0, 8, fmt.Sprintf("• ผู้เข้าร่วมทั้งหมด: %d คน", grandParticipants), "0", 1, "L", false, 0, "")
	pdf.CellFormat(0, 8, fmt.Sprintf("• ชั่วโมงกิจกรรมรวม: %.1f ชั่วโมง", grandHours), "0", 1, "L", false, 0, "")
	pdf.CellFormat(0, 8, fmt.Sprintf("• คะแนนเฉลี่ยกิจกรรม: %.2f จาก 5.00", overallRating), "0", 1, "L", false, 0, "")
	pdf.Ln(8)

	// ตารางกิจกรรม
	pdf.SetFont("THSarabunNew", "B", 14)
	pdf.SetFillColor(240, 240, 240)
	header := []struct {
		W float64
		T string
		A string
	}{
		{12, "ลำดับ", "C"},
		{60, "ชื่อกิจกรรม", "L"},
		{25, "วันที่จัด", "C"},
		{25, "ผู้เข้าร่วม", "C"},
		{25, "ชั่วโมง", "C"},
		{25, "คะแนน", "C"},
	}
	
	for _, h := range header {
		pdf.CellFormat(h.W, 10, h.T, "1", 0, h.A, true, 0, "")
	}
	pdf.Ln(-1)

	pdf.SetFont("THSarabunNew", "", 12)
	for i, r := range rows {
		if pdf.GetY() > 260 {
			pdf.AddPage()
			pdf.SetY(20)
			pdf.SetFont("THSarabunNew", "B", 14)
			pdf.SetFillColor(240, 240, 240)
			for _, h := range header {
				pdf.CellFormat(h.W, 10, h.T, "1", 0, h.A, true, 0, "")
			}
			pdf.Ln(-1)
			pdf.SetFont("THSarabunNew", "", 12)
		}

		pdf.CellFormat(12, 8, fmt.Sprintf("%d", i+1), "1", 0, "C", false, 0, "")
		pdf.CellFormat(60, 8, r.Act.Title, "1", 0, "L", false, 0, "")
		pdf.CellFormat(25, 8, r.Act.DateStart.Format("02/01/06"), "1", 0, "C", false, 0, "")
		pdf.CellFormat(25, 8, fmt.Sprintf("%d", r.ParticipantCount), "1", 0, "C", false, 0, "")
		pdf.CellFormat(25, 8, fmt.Sprintf("%.1f", r.TotalHours), "1", 0, "C", false, 0, "")
		pdf.CellFormat(25, 8, fmt.Sprintf("%.2f", r.AvgRating), "1", 1, "C", false, 0, "")
	}

	// ลายเซ็นผู้รับรอง
	pdf.Ln(15)
	pdf.SetFont("THSarabunNew", "", 12)
	pdf.CellFormat(0, 6, "ลงชื่อ ........................................................", "0", 1, "R", false, 0, "")
	pdf.CellFormat(0, 6, "(.........................................................)", "0", 1, "R", false, 0, "")
	pdf.CellFormat(0, 6, fmt.Sprintf("วันที่ %s", time.Now().Format("......./......./.........")), "0", 1, "R", false, 0, "")

	if err := pdf.OutputFileAndClose(savePath); err != nil {
    return fmt.Errorf("failed to save PDF file: %w", err)
    }
    return nil
}

// ===========================================
// Club Ranking Report
// ===========================================
func generateClubRankingReport(db *gorm.DB, start, end time.Time, savePath string) error {
	type ClubStat struct {
		Rank          int
		ClubName      string
		Activities    int
		Participants  int
		AvgRating     float64
	}

	var stats []ClubStat
    db.Table("activities AS a").
        Select(`
            c.name AS club_name,
            COUNT(a.id) AS activities,
            COUNT(DISTINCT ar.user_id) AS participants,
            COALESCE(AVG(rv.rating),0) AS avg_rating`).
        Joins("JOIN clubs c ON a.club_id = c.id").
        Joins("LEFT JOIN activity_registrations ar ON a.id = ar.activity_id").
        Joins("LEFT JOIN activity_reviews rv ON a.id = rv.activity_id").
        Where("a.date_start BETWEEN ? AND ?", start, end).  
        Group("c.id, c.name").
        Order("activities DESC").
        Scan(&stats)

	for i := range stats {
		stats[i].Rank = i + 1
	}

	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddUTF8Font("THSarabunNew", "", "./fonts/THSarabunNew.ttf")
	pdf.AddUTF8Font("THSarabunNew", "B", "./fonts/THSarabunNew-Bold.ttf")
    pdf.AddUTF8Font("THSarabunNew", "I", "./fonts/THSarabunNew-Italic.ttf")
	pdf.SetMargins(15, 25, 15)
	applyHeaderFooter(pdf, "รายงานอันดับชมรม")

	pdf.AddPage()
	pdf.SetY(35)

	// ข้อมูลรายงาน
	pdf.SetFont("THSarabunNew", "", 14)
	pdf.CellFormat(0, 8, "รายงานอันดับชมรมจากการจัดกิจกรรม", "0", 1, "L", false, 0, "")
	pdf.CellFormat(0, 8, fmt.Sprintf("จำนวนชมรมทั้งหมด: %d ชมรม", len(stats)), "0", 1, "L", false, 0, "")
    pdf.CellFormat(0, 8, "วันที่ออกรายงาน: "+FormatThaiDate(time.Now()), "0", 1, "L", false, 0, "")
	pdf.Ln(8)

	// ตารางอันดับ
	pdf.SetFont("THSarabunNew", "B", 14)
	pdf.SetFillColor(240, 240, 240)
	colW := []float64{15, 65, 30, 35, 30}
	headers := []string{"อันดับ", "ชื่อชมรม", "กิจกรรม", "ผู้เข้าร่วม", "คะแนนเฉลี่ย"}

	for i, h := range headers {
		pdf.CellFormat(colW[i], 10, h, "1", 0, "C", true, 0, "")
	}
	pdf.Ln(-1)

	pdf.SetFont("THSarabunNew", "", 12)
	for _, s := range stats {
		if pdf.GetY() > 265 {
			pdf.AddPage()
			pdf.SetY(20)
			pdf.SetFont("THSarabunNew", "B", 14)
			pdf.SetFillColor(240, 240, 240)
			for i, h := range headers {
				pdf.CellFormat(colW[i], 10, h, "1", 0, "C", true, 0, "")
			}
			pdf.Ln(-1)
			pdf.SetFont("THSarabunNew", "", 12)
		}

        // เน้นสีอันดับ 1-3 (โทนคลาสสิก)
        fillColor := false
        if s.Rank <= 3 {
            fillColor = true
            switch s.Rank {
            case 1:
                pdf.SetFillColor(255, 241, 118) // เหลืองอ่อน
            case 2:
                pdf.SetFillColor(207, 216, 220) // เทาอ่อน
            case 3:
                pdf.SetFillColor(255, 204, 153) // ส้มอ่อน
            }
        }

		pdf.CellFormat(colW[0], 8, fmt.Sprintf("%d", s.Rank), "1", 0, "C", fillColor, 0, "")
		pdf.CellFormat(colW[1], 8, s.ClubName, "1", 0, "L", fillColor, 0, "")
		pdf.CellFormat(colW[2], 8, fmt.Sprintf("%d", s.Activities), "1", 0, "C", fillColor, 0, "")
		pdf.CellFormat(colW[3], 8, fmt.Sprintf("%d", s.Participants), "1", 0, "C", fillColor, 0, "")
		pdf.CellFormat(colW[4], 8, fmt.Sprintf("%.2f", s.AvgRating), "1", 1, "C", fillColor, 0, "")
	}


	// ===== 6. ช่องตรวจสอบ / ลายเซ็น =====
	pdf.Ln(15)
	pdf.SetFont("THSarabunNew", "", 12)
	pdf.CellFormat(0, 6, "ลงชื่อ ........................................................", "0", 1, "R", false, 0, "")
	pdf.CellFormat(0, 6, "(.........................................................)", "0", 1, "R", false, 0, "")
	pdf.CellFormat(0, 6, fmt.Sprintf("วันที่ %s", time.Now().Format("......./......./.........")), "0", 1, "R", false, 0, "")

	// ===== 7. สรุป/บันทึกไฟล์ =====
    if err := pdf.OutputFileAndClose(savePath); err != nil {
        return fmt.Errorf("failed to save PDF file: %w", err)
    }
    return nil
}


// ----------------------
// Generate Category Analytics Report
// ----------------------
func generateCategoryAnalyticsReport(db *gorm.DB, start, end time.Time, savePath string) error {
    type CategoryStat struct {
        Name  string
        Total int
    }
    var stats []CategoryStat
    db.Table("activities a").
        Select("ec.name, COUNT(a.id) as total").
        Joins("JOIN event_categories ec ON a.category_id = ec.id").
        Where("a.date_start BETWEEN ? AND ?", start, end).  
        Group("ec.name").
        Order("total DESC").
        Scan(&stats)

    // คำนวณรวมทั้งหมดและสัดส่วน
    var grandTotal int
    for _, s := range stats {
        grandTotal += s.Total
    }

    pdf := gofpdf.New("P", "mm", "A4", "")
    pdf.AddUTF8Font("THSarabunNew", "", "./fonts/THSarabunNew.ttf")
    pdf.AddUTF8Font("THSarabunNew", "B", "./fonts/THSarabunNew-Bold.ttf")
    pdf.AddUTF8Font("THSarabunNew", "I", "./fonts/THSarabunNew-Italic.ttf") 


    // Header / Footer
    applyHeaderFooter(pdf, "วิเคราะห์กิจกรรมตามหมวดหมู่ (Category Analytics Report)")

    pdf.AddPage()
    pdf.SetY(28)

    // สรุปจำนวนรวม
    pdf.SetFont("THSarabunNew", "", 16)
    pdf.CellFormat(0, 10, fmt.Sprintf("จำนวนกิจกรรมทั้งหมด: %d รายการ", grandTotal), "0", 1, "L", false, 0, "")
    pdf.Ln(4)

    // ตาราง
    pdf.SetFont("THSarabunNew", "B", 15)
    colW := []float64{10, 80, 40, 40} // index, name, total, percent
    heads := []string{"ลําดับ", "หมวดหมู่", "จำนวนกิจกรรม", "สัดส่วน (%)"}
    for i, h := range heads {
        pdf.CellFormat(colW[i], 9, h, "1", 0, "CM", false, 0, "")
    }
    pdf.Ln(-1)

    // Body
    pdf.SetFont("THSarabunNew", "", 14)
    for i, s := range stats {
        percent := float64(s.Total) / float64(grandTotal) * 100

        // ตรวจขึ้นหน้าใหม่
        if pdf.GetY() > 265 {
            pdf.AddPage()
            pdf.SetFont("THSarabunNew", "B", 15)
            for j, h := range heads {
                pdf.CellFormat(colW[j], 9, h, "1", 0, "CM", false, 0, "")
            }
            pdf.Ln(-1)
            pdf.SetFont("THSarabunNew", "", 14)
        }

        pdf.CellFormat(colW[0], 8, fmt.Sprintf("%d", i+1), "1", 0, "C", false, 0, "")
        pdf.CellFormat(colW[1], 8, s.Name, "1", 0, "L", false, 0, "")
        pdf.CellFormat(colW[2], 8, fmt.Sprintf("%d", s.Total), "1", 0, "C", false, 0, "")
        pdf.CellFormat(colW[3], 8, fmt.Sprintf("%.2f", percent), "1", 1, "C", false, 0, "")
    }

    // ช่องตรวจสอบ / ลายเซ็นอย่างเป็นทางการด้านขวา
	pdf.Ln(15)
	pdf.SetFont("THSarabunNew", "", 12)
	pdf.CellFormat(0, 6, "ลงชื่อ ........................................................", "0", 1, "R", false, 0, "")
	pdf.CellFormat(0, 6, "(.........................................................)", "0", 1, "R", false, 0, "")
	pdf.CellFormat(0, 6, fmt.Sprintf("วันที่ %s", time.Now().Format("......./......./.........")), "0", 1, "R", false, 0, "")

    if err := pdf.OutputFileAndClose(savePath); err != nil {
        return fmt.Errorf("failed to save PDF file: %w", err)
    }
    return nil
}

func (h *ReportHandler) GenerateReportByType(req ReportRequest, savePath string) error {
	start, end, err := getReportPeriod(req)
	if err != nil {
		return err
	}

	switch req.Type {
	case "activity_summary":
		return generateActivitySummaryReport(h.DB, start, end, savePath)
	case "student_hours":
		return generateStudentActivityHourReport(h.DB, req.UserID, start, end, savePath)
	case "club_performance":
		if req.ClubID != nil {
			return generateClubPerformanceReport(h.DB, *req.ClubID, start, end, savePath)
		}
		return fmt.Errorf("club_id is required")
	case "club_ranking":
		return generateClubRankingReport(h.DB, start, end, savePath)
	case "category_analytics":
		return generateCategoryAnalyticsReport(h.DB, start, end, savePath)
	default:
		return fmt.Errorf("invalid report type")
	}
}


// POST /reports/generate
func (h *ReportHandler) GenerateReport(c *gin.Context) {
	var req ReportRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ดึงชื่อผู้ใช้จาก DB ถ้ายังไม่มี
	if req.UserName == "" || req.StudentID == "" {
		var user entity.User
		if err := h.DB.First(&user, req.UserID).Error; err == nil {
			req.UserName = user.FirstName + " " + user.LastName
			req.StudentID = user.StudentID
		}
	}

	// ดึงชื่อชมรมจาก DB ถ้ายังไม่มีและต้องใช้
	if req.Type == "club_performance" && req.ClubID != nil && req.ClubName == "" {
		var club entity.Club
		if err := h.DB.First(&club, *req.ClubID).Error; err == nil {
			req.ClubName = club.Name
		}
	}

	// สร้างโฟลเดอร์รายงาน
	reportDir := getReportDirectory(req.Type)
	if err := os.MkdirAll(reportDir, 0o755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create report directory: " + err.Error()})
		return
	}

	// ตั้งชื่อไฟล์
	timestamp := time.Now().Format("20060102150405")
	filename := fmt.Sprintf("%s_%d_%s.pdf", req.Type, req.UserID, timestamp)
	savePath := filepath.Join(reportDir, filename)

	// สร้างไฟล์ PDF
	if err := h.GenerateReportByType(req, savePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// ตั้งชื่อรายงานและชื่อแสดงตอนดาวน์โหลด
	reportName := getReportName(req.Type, req)
	displayFilename := getDisplayFilename(req.Type, req)

	// บันทึกลง DB
	report := entity.ActivityReport{
		Name:        reportName,
		UserID:      req.UserID,
		Type:        req.Type,
		FileURL:     filename,
		GeneratedAt: time.Now(),
		Status:      "completed",
	}
	if err := h.DB.Create(&report).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to save report to DB: %v", err)})
		return
	}

	// ดาวน์โหลดไฟล์
	c.FileAttachment(savePath, displayFilename)
}


// ฟังก์ชันสำหรับสร้างชื่อรายงานตาม type
func getReportName(reportType string, req ReportRequest) string {
	switch reportType {
	case "activity_summary":
		return fmt.Sprintf("Activity Summary Report - %s", time.Now().Format("January 2006"))
	case "student_hours":
		return fmt.Sprintf("Activity Hours Report - %s (%s)", req.UserName, req.StudentID)
	case "club_performance":
		return fmt.Sprintf("Club Performance - ชมรม%s", req.ClubName)
	case "club_ranking":
		return fmt.Sprintf("Club Ranking Report - %s", time.Now().Format("January 2006"))
	case "category_analytics":
		return fmt.Sprintf("Category Analytics Report - %s", time.Now().Format("January 2006"))
	default:
		return fmt.Sprintf("CEMS Report - %s", time.Now().Format("2006-01-02"))
	}
}


// ฟังก์ชันสำหรับสร้างชื่อไฟล์ที่จะแสดงเมื่อดาวน์โหลด
func getDisplayFilename(reportType string, req ReportRequest) string {
	timestamp := time.Now().Format("20060102_150405")
	switch reportType {
	case "activity_summary":
		return fmt.Sprintf("activity_summary_%s.pdf", timestamp)
	case "student_hours":
		return fmt.Sprintf("student_hours_%s_%s.pdf", req.StudentID, strings.ReplaceAll(req.UserName, " ", "_"))
	case "club_performance":
		return fmt.Sprintf("club_performance_%s.pdf", strings.ReplaceAll(req.ClubName, " ", "_"))
	case "club_ranking":
		return fmt.Sprintf("club_ranking_%s.pdf", timestamp)
	case "category_analytics":
		return fmt.Sprintf("category_analytics_%s.pdf", timestamp)
	default:
		return fmt.Sprintf("report_%s.pdf", timestamp)
	}
}

