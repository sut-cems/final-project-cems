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
    
    // Get current month data
    now := time.Now()
    startOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
    endOfMonth := startOfMonth.AddDate(0, 1, 0).Add(-time.Second)
    startOfLastMonth := startOfMonth.AddDate(0, -1, 0)
    endOfLastMonth := startOfMonth.Add(-time.Second)
    
    // Set period info
    stats.PeriodInfo.CurrentMonth = startOfMonth.Format("January 2006")
    stats.PeriodInfo.LastMonth = startOfLastMonth.Format("January 2006")
    
    // Total Activities with error handling
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
    
    // Total Registrations (all registrations)
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
    
    // Total Participants (Unique users who actually attended - checked in)
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
    
    // Total Hours (only verified hours)
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
    
    // Average Rating
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

// createReportDirectories สร้างโฟลเดอร์ที่จำเป็นสำหรับเก็บ reports
func createReportDirectories() error {
    baseDir := "reports"
    reportTypes := []string{"participation", "hours", "evaluation", "summary"}
    
    // สร้าง base directory
    if err := os.MkdirAll(baseDir, 0755); err != nil {
        return fmt.Errorf("failed to create base reports directory: %v", err)
    }
    
    // สร้าง subdirectories สำหรับแต่ละประเภท report
    for _, reportType := range reportTypes {
        dir := filepath.Join(baseDir, reportType)
        if err := os.MkdirAll(dir, 0755); err != nil {
            return fmt.Errorf("failed to create %s directory: %v", reportType, err)
        }
    }
    
    return nil
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

    sanitizedName := strings.ReplaceAll(report.Name, " ", "_")
    sanitizedName = strings.ReplaceAll(sanitizedName, "/", "_")
    if !strings.HasSuffix(sanitizedName, ".pdf") {
        sanitizedName += ".pdf"
    }

    c.Header("Content-Type", "application/pdf")
    c.Header("Content-Disposition", "inline; filename=" + sanitizedName)
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
    Type        string `json:"type" binding:"required"` // "participation", "hours", "evaluation", "summary"
    Period      string `json:"period"`                  // "this_month", "this_quarter", "this_year", "custom"
    StartDate   string `json:"start_date,omitempty"`
    EndDate     string `json:"end_date,omitempty"`
    ClubID      *uint  `json:"club_id,omitempty"`
    Format      string `json:"format"`                  // "pdf"
    UserID      uint   `json:"user_id"`
}

type ReportResponse struct {
    ReportID  uint   `json:"report_id"`
    Status    string `json:"status"`    // "processing", "completed", "failed"
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
        end := start.AddDate(0, 0, 6)
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
		end := time.Date(now.Year(), 12, 31, 0, 0, 0, 0, now.Location())
		return start, end, nil

	case "custom":
		if req.StartDate == "" || req.EndDate == "" {
			return time.Time{}, time.Time{}, fmt.Errorf("start_date and end_date required for custom period")
		}

		start, err := time.Parse(layout, req.StartDate)
		if err != nil {
			return time.Time{}, time.Time{}, fmt.Errorf("invalid start_date format: use YYYY-MM-DD")
		}

		end, err := time.Parse(layout, req.EndDate)
		if err != nil {
			return time.Time{}, time.Time{}, fmt.Errorf("invalid end_date format: use YYYY-MM-DD")
		}

		if end.Before(start) {
			return time.Time{}, time.Time{}, fmt.Errorf("end_date must be after start_date")
		}

		return start, end, nil

	default:
		return time.Time{}, time.Time{}, fmt.Errorf("invalid period: must be the week, this_month, this_quarter, this_year, or custom")
	}
}

// Get Report List
func (h *ReportHandler) GetReportList(c *gin.Context) {
    page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
    limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
    offset := (page - 1) * limit
    
    // Get filters from query parameters
    search := c.Query("search")
    reportType := c.Query("type")
    status := c.Query("status")
    period := c.Query("period")
    
    var reports []ReportListItem
    var total int64

    // Build base query
    query := h.DB.Model(&entity.ActivityReport{})
    
    // Apply filters
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
        switch period {
        case "today":
            query = query.Where("DATE(generated_at) = CURRENT_DATE")
        case "week":
            query = query.Where("generated_at >= DATE_TRUNC('week', CURRENT_DATE)")
        case "month":
            query = query.Where("generated_at >= DATE_TRUNC('month', CURRENT_DATE)")
        case "quarter":
            query = query.Where("generated_at >= DATE_TRUNC('quarter', CURRENT_DATE)")
        }
    }

    // Get total count first (before applying limit/offset)
    err := query.Count(&total)
    if err.Error != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": "Failed to count reports",
            "details": err.Error.Error(),
        })
        return
    }

    // Get paginated results
    err = query.
        Select("id, name, type, file_url, generated_at, user_id, status").
        Order("generated_at DESC").
        Limit(limit).
        Offset(offset).
        Scan(&reports)
    if err.Error != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": "Failed to fetch reports",
            "details": err.Error.Error(),
        })
        return
    }
    
    response := ReportListResponse{
        Reports: reports,
        Total:   int(total), 
        Page:    page,
        Limit:   limit,
    }
    
    c.JSON(http.StatusOK, response)
}


// Generate Report
func (h *ReportHandler) GenerateReportsBatch(c *gin.Context) {
	var reqs []ReportRequest

	if err := c.ShouldBindJSON(&reqs); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// สร้างโฟลเดอร์ reports และ subdirectories
	if err := createReportDirectories(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create report directories: " + err.Error()})
		return
	}

	type ReportResult struct {
		Report entity.ActivityReport `json:"report,omitempty"`
		Error  string                `json:"error,omitempty"`
	}

	results := make([]ReportResult, 0, len(reqs))

	for _, req := range reqs {
		startDate, endDate, err := getReportPeriod(req)
		if err != nil {
			results = append(results, ReportResult{Error: fmt.Sprintf("UserID %d: %s", req.UserID, err.Error())})
			continue
		}

		timestamp := time.Now().Format("20060102150405")
		filename := fmt.Sprintf("%s_%d_%s.pdf", req.Type, req.UserID, timestamp)
		
		// ใช้ directory ที่เฉพาะเจาะจงสำหรับแต่ละประเภท report
		reportDir := getReportDirectory(req.Type)
		savePath := filepath.Join(reportDir, filename)
		
		reportName := fmt.Sprintf("%s Report - User %d", strings.Title(strings.ReplaceAll(req.Type, "_", " ")), req.UserID)

		pdf := gofpdf.New("P", "mm", "A4", "")
		pdf.SetTitle(reportName, false)
		pdf.AddPage()
		pdf.SetFont("Arial", "B", 16)
		pdf.Cell(40, 10, "Activity Report")
		pdf.Ln(12)
		pdf.SetFont("Arial", "", 12)
		pdf.Cell(40, 10, fmt.Sprintf("User ID: %d", req.UserID))
		pdf.Ln(10)
		pdf.Cell(40, 10, fmt.Sprintf("Report Type: %s", req.Type))
		pdf.Ln(10)
		pdf.Cell(40, 10, fmt.Sprintf("Period: %s to %s", startDate.Format("Jan 2, 2006"), endDate.Format("Jan 2, 2006")))
		if req.ClubID != nil {
			pdf.Ln(10)
			pdf.Cell(40, 10, fmt.Sprintf("Club ID: %d", *req.ClubID))
		}
		pdf.Ln(10)
		pdf.Cell(40, 10, "Generated At: "+time.Now().Format(time.RFC1123))

		if err := pdf.OutputFileAndClose(savePath); err != nil {
			results = append(results, ReportResult{Error: fmt.Sprintf("UserID %d: failed to generate PDF: %v", req.UserID, err)})
			continue
		}

		report := entity.ActivityReport{
			Name:        reportName,
			UserID:      req.UserID,
			Type:        req.Type,
			FileURL:     filename, // เก็บเฉพาะชื่อไฟล์ เพราะ directory จะถูกกำหนดจาก type
			GeneratedAt: time.Now(),
			Status:      "completed",
		}

		if err := h.DB.Create(&report).Error; err != nil {
			results = append(results, ReportResult{Error: fmt.Sprintf("UserID %d: failed to save report to DB: %v", req.UserID, err)})
			continue
		}

		results = append(results, ReportResult{Report: report})
	}

	c.JSON(http.StatusOK, gin.H{
		"results": results,
		"message": "Batch report generation completed",
	})
}

