package main

import (
	"final-project/cems/config"
	"final-project/cems/controllers"

	"log"
	"net/http"
	"net/url"
	"strings"

	"fmt"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"os"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	// ตั้งค่า Google OAuth
	controllers.SetupGoogleOAuthConfig()

	// ตรวจสอบว่าตัวแปร .env ถูกตั้งค่าแล้วหรือไม่
	// fmt.Println("CLIENT ID:", os.Getenv("GOOGLE_CLIENT_ID"))
	// fmt.Println("CLIENT SECRET:", os.Getenv("GOOGLE_CLIENT_SECRET"))

	config.ConnectDB()
	config.SetupDatabase()

	r := gin.Default()

	r.Use(CORSMiddleware())

	r.POST("/signup", controllers.Signup)
	r.POST("/login", controllers.Login)

	r.Static("/images", "./images")

	r.GET("/auth/google", controllers.GoogleLogin)
	r.GET("/auth/google/callback", controllers.GoogleCallback)

	r.Use(func(c *gin.Context) {
		c.Header("Cache-Control", "no-cache, no-store, must-revalidate")
		c.Header("Pragma", "no-cache")
		c.Header("Expires", "0")
		c.Next()
	})

	// สร้าง ClubHandler instance
	db := config.DB() // รับ *gorm.DB จาก config
	clubHandler := &controllers.ClubHandler{
		DB: db, // ใช้ db ที่ได้มา
	}
	activityHandler := controllers.NewActivityHandler(db)

	notificationHandler := controllers.NewNotificationHandler(db)
	
	reportHandler := &controllers.ReportHandler{
		DB: db,
	}
	router := r.Group("/")
	{
		// ตั้งค่า CORS
		router.Use(cors.New(cors.Config{
			AllowOrigins:     []string{"http://localhost:5173"},
			AllowMethods:     []string{"POST", "GET", "OPTIONS", "PATCH", "PUT"},
			AllowHeaders:     []string{"Content-Type", "Authorization", "X-Authorization"},
			ExposeHeaders:    []string{"Content-Length", "X-Authorization"},
			AllowCredentials: true,
		}))

		// Routes for Users
		router.GET("/users", controllers.GetUsers)
		router.GET("/users/:id", controllers.GetUserByID)
		router.POST("/users", controllers.CreateUser)
		router.PATCH("/users/:id", controllers.UpdateUser)
		router.DELETE("/users/:id", controllers.DeleteUser)

		// Routes for Roles
		router.GET("/roles", controllers.GetRoles)
		router.POST("/roles", controllers.CreateRole)

		router.GET("/facultyWithProgram", controllers.GetAllFacultiesWithPrograms)

		// Routes for Clubs
		router.GET("/clubs/popular", clubHandler.GetPopularClubs)
		router.GET("/clubs/statistics", clubHandler.GetClubStatistics)
		router.GET("/clubs", clubHandler.GetAllClubs)
		router.GET("/clubs/:id", clubHandler.GetClubByID)
		router.GET("/clubmembers/user/:id", controllers.GetClubMembersByUserID)
		router.GET("/categories/clubs", controllers.GetCategoriesWithClubs)
		router.GET("/clubs/:id/members", controllers.GetMembersByClubID)
		router.DELETE("/clubs/:id/remove-member", controllers.RemoveClubMember)
		router.DELETE("/clubs/:id/remove-member/:userId", controllers.RemoveClubMember)
		router.POST("/clubs/:id/change-president", controllers.ChangeClubPresident)
		router.POST("/clubs/:id/request", controllers.RequestJoinClub)
		router.GET("/clubs/:id/announcements", controllers.GetClubAnnouncements)
		router.POST("/clubs/:id/approve-member/:userId", controllers.ApproveClubMember)
		router.POST("/clubs/create", controllers.CreateClub)

		// Fetured Activities
		router.GET("/activities/featured", activityHandler.GetFeaturedActivities)
		router.GET("/activities", activityHandler.GetActivities)
		router.GET("/all/activities", activityHandler.GetAllActivities)
		router.GET("/activities/:id", activityHandler.GetActivityByID)
		router.GET("/activities/club/:id", activityHandler.GetActivityByClubID)
		router.GET("/activities/statistics", activityHandler.GetActivityStatistics)
		router.GET("/activities/photo",controllers.GetActivitiesWithPhotos)
		router.GET("/activities/photo/:id",controllers.GetPhotosByActivityId)
		router.POST("/activities/photo/:id", controllers.AddPhotoToActivity)

		// Routes for Notifications
		router.GET("/notifications", controllers.GetALLNotifications)
		router.GET("/notifications/:userId", notificationHandler.GetNotifications)
		router.PUT("/notifications/read/:notificationId", notificationHandler.MarkAsRead)
		router.PUT("/notifications/read-all/:userId", notificationHandler.MarkAllAsRead)
		router.GET("/notifications/:userId/stream", notificationHandler.StreamNotifications)

		// Routes for Reports
		router.GET("/dashboard/stats", reportHandler.GetDashboardStats)
		router.GET("/charts/participation", reportHandler.GetParticipationChart)
		router.GET("/charts/activity-hours", reportHandler.GetActivityHoursChart)

		router.GET("/reports", reportHandler.GetReportList)
		router.POST("/generate-report", reportHandler.GenerateReportsBatch)
		router.GET("/download-report/:id", reportHandler.DownloadReport)
		router.DELETE("/reports/:id", reportHandler.DeleteReport)

	}

	r.GET("/", func(c *gin.Context) {
		c.String(http.StatusOK, "API RUNNING... PORT: %s")
	})

	// อ่านค่า API_BASE_URL
	apiBaseUrl := os.Getenv("API_BASE_URL")
	if apiBaseUrl == "" {
		log.Fatal("API_BASE_URL is not set")
	}

	// แยกพอร์ตจาก URL
	parsedUrl, err := url.Parse(apiBaseUrl)
	if err != nil {
		log.Fatalf("Invalid API_BASE_URL: %v", err)
	}

	hostPort := parsedUrl.Host

	// แยกพอร์ต
	parts := strings.Split(hostPort, ":")
	port := ""
	if len(parts) == 2 {
		port = parts[1]
	} else {
		log.Fatal("API_BASE_URL does not contain port")
	}

	// รัน server โดยใช้ port จาก .env
	addr := "localhost:" + port
	fmt.Println("Starting server on", addr)
	r.Run(addr)

}

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		if origin == "http://localhost:5173" {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
			c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
			c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
			c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")
		}

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}