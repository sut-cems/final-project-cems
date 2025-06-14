package controllers

import (
    "context"
    "encoding/json"
    "final-project/cems/config"
    "final-project/cems/entity"
    "net/http"
    "os"
    "fmt"
    "crypto/rand"
    "encoding/base64"
    "strconv"

    "github.com/gin-gonic/gin"
    "golang.org/x/oauth2"
    "golang.org/x/oauth2/google"
    "gorm.io/gorm"
)

var googleOauthConfig *oauth2.Config

func SetupGoogleOAuthConfig() {
    googleOauthConfig = &oauth2.Config{
        RedirectURL:  "http://localhost:8000/auth/google/callback",
        ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
        ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
        Scopes: []string{
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
        },
        Endpoint: google.Endpoint,
    }
}

// generateStateOauthCookie สร้าง state string แบบสุ่มและเซ็ต cookie เพื่อป้องกัน CSRF
func generateStateOauthCookie(c *gin.Context) string {
    b := make([]byte, 16)
    _, err := rand.Read(b)
    if err != nil {
        return "state" // fallback
    }
    state := base64.URLEncoding.EncodeToString(b)
    c.SetCookie("oauthstate", state, 3600, "/", "localhost", false, true)
    return state
}

func generateSequentialStudentID(db *gorm.DB) (string, error) {
	const prefix = "B"
	const min = 6600000
	const max = 7000000

	var lastUser entity.User
	err := db.
		Where("student_id LIKE ?", "B%").
		Order("student_id DESC").
		First(&lastUser).Error

	var lastID int
	if err == nil {
		// ตัด prefix "B" ออกแล้วแปลงเป็น int
		lastID, _ = strconv.Atoi(lastUser.StudentID[1:])
	} else {
		lastID = min - 1
	}

	newID := lastID + 1
	if newID > max {
		return "", fmt.Errorf("student ID overflow")
	}

	return fmt.Sprintf("%s%d", prefix, newID), nil
}


// GoogleLogin เริ่ม flow OAuth2: สร้าง state และ redirect ไป Google OAuth consent screen
func GoogleLogin(c *gin.Context) {
    state := generateStateOauthCookie(c)
    url := googleOauthConfig.AuthCodeURL(state)
    c.Redirect(http.StatusTemporaryRedirect, url)
}

// GoogleCallback รับ callback จาก Google OAuth2 server
func GoogleCallback(c *gin.Context) {
    // ตรวจสอบ state กับ cookie เพื่อป้องกัน CSRF attack
    stateCookie, err := c.Cookie("oauthstate")
    if err != nil || c.Query("state") != stateCookie {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid OAuth state"})
        return
    }

    code := c.Query("code")
    token, err := googleOauthConfig.Exchange(context.Background(), code)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Code exchange failed"})
        return
    }

    client := oauth2.NewClient(context.Background(), oauth2.StaticTokenSource(token))
    resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user info"})
        return
    }
    defer resp.Body.Close()

    var userInfo struct {
        Email      string `json:"email"`
        GivenName  string `json:"given_name"`
        FamilyName string `json:"family_name"`
    }
    if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode user info"})
        return
    }

    db := config.DB()

	var studentRole entity.Role
	if err := db.Where("role_name = ?", "student").First(&studentRole).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Default role not found"})
		return
	}

    var user entity.User
    if err := db.Preload("Role").Where("email = ?", userInfo.Email).First(&user).Error; err != nil {
        studentID, err := generateSequentialStudentID(db)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Cannot generate student ID"})
            return
        }

        // ---------- สร้าง User ใหม่ ----------
        user = entity.User{
            Email:     userInfo.Email,
            FirstName: userInfo.GivenName,
            LastName:  userInfo.FamilyName,
            StudentID: studentID,
            IsActive:  true,
            RoleID:    studentRole.ID, 
        }
        if err := db.Create(&user).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
            return
        }

        if err := db.Preload("Role").First(&user, user.ID).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to preload role"})
            return
        }
    }
	// fmt.Printf(">>> Created User ID: %d, Email: %s, RoleID: %d\n", user.ID, user.Email, user.RoleID)
	// fmt.Printf(">>> Student Role: %+v\n", studentRole)

    // สร้าง JWT token
    tokenStr, err := jwtService.GenerateToken(user.Email)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate JWT"})
        return
    }

    // redirect กลับ frontend พร้อมส่ง token, id, role
    redirectURL := fmt.Sprintf("http://localhost:5173/auth/google/callback?token=%s&id=%d&role=%s", tokenStr, user.ID, user.Role.RoleName)
    c.Redirect(http.StatusTemporaryRedirect, redirectURL)
    // สำหรับ debug
    // fmt.Println(">>> Redirecting to:", redirectURL)

}
