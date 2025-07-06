// config/db.go
package config

import (
	"fmt"
	"log"
	"math/rand"
	"os"
	"path/filepath"
	"strings"
	"time"

	"final-project/cems/entity"

	"github.com/jung-kurt/gofpdf"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var db *gorm.DB

func DB() *gorm.DB {
	return db
}

func ConnectDB() {
	var err error
	db, err = gorm.Open(sqlite.Open("cems.db?cache=shared"), &gorm.Config{})
	if err != nil {
		log.Fatal("failed to connect to database: ", err)
	}
	fmt.Println("Connected to SQLite database successfully")
}

func SetupDatabase() {
    err := db.AutoMigrate(
        &entity.User{},
		&entity.Notification{},
        &entity.Role{},
        &entity.Club{},
        &entity.ClubStatus{},
        &entity.ClubCategory{},
        &entity.ClubMember{},
        &entity.Activity{},
        &entity.ActivityStatus{},
        &entity.EventCategory{},
        &entity.ActivityRegistration{},
        &entity.ActivityRegistrationStatus{},
        &entity.AttendanceLog{},
        &entity.ActivityHour{},
        &entity.ActivityReview{},
        &entity.ActivityReport{},
        &entity.MediaUpload{},
        &entity.ClubAnnouncement{},
    )
    if err != nil {
        log.Fatal("AutoMigrate error:", err)
    }

	// Initial roles
	roles := []entity.Role{
		{RoleName: "student", Description: "นักศึกษา"},
		{RoleName: "club_admin", Description: "ผู้ดูแลชมรม"},
		{RoleName: "admin", Description: "ผู้ดูแลระบบ"},
	}
	for _, r := range roles {
		db.FirstOrCreate(&r, entity.Role{RoleName: r.RoleName})
	}

	// Initial club statuses
	statuses := []entity.ClubStatus{
		{Name: "pending", Description: "รอการอนุมัติ", IsActive: true},
		{Name: "approved", Description: "อนุมัติแล้ว",IsActive: true},
		{Name: "suspended", Description: "ถูกระงับ", IsActive: false},
	}
	for _, s := range statuses {
		db.FirstOrCreate(&s, entity.ClubStatus{Name: s.Name})
	}

	// Initial activity statuses
	actStatuses := []entity.ActivityStatus{
		{Name: "draft", Description: "แบบร่าง", IsActive: true},
		{Name: "pending", Description: "รออนุมัติ", IsActive: true},
		{Name: "approved", Description: "อนุมัติแล้ว", IsActive: true},
		{Name: "cancelled", Description: "ยกเลิก", IsActive: false},
		{Name: "finished", Description: "สิ้นสุดกิจกรรม", IsActive: true},
	}
	for _, s := range actStatuses {
		db.FirstOrCreate(&s, entity.ActivityStatus{Name: s.Name})
	}

	// Initial activity registration statuses
	regStatuses := []entity.ActivityRegistrationStatus{
		{Name: "registered", Description: "ลงทะเบียนแล้ว", IsActive: true},
		{Name: "cancelled", Description: "ยกเลิกการลงทะเบียน", IsActive: true},
		{Name: "attended", Description: "เข้าร่วมกิจกรรม", IsActive: true},
		{Name: "absent", Description: "ไม่เข้าร่วมกิจกรรม", IsActive: true},
	}
	for _, s := range regStatuses {
		db.FirstOrCreate(&s, entity.ActivityRegistrationStatus{Name: s.Name})
	}

	// Initial event categories
	events := []entity.EventCategory{
		{Name: "วิชาการ", Description: "กิจกรรมด้านวิชาการ"},
		{Name: "บำเพ็ญประโยชน์", Description: "จิตอาสาและบริการสังคม"},
		{Name: "กีฬา", Description: "การแข่งขัน/ออกกำลังกาย"},
		{Name: "วัฒนธรรม", Description: "ด้านศิลปวัฒนธรรม"},
		{Name: "ทักษะชีวิต", Description: "พัฒนาทักษะการใช้ชีวิต"},
		{Name: "สังสรรค์", Description: "การพบปะสังสรรค์"},
        {Name: "อาสาสมัคร", Description: "กิจกรรมอาสาสมัคร"},
        {Name: "อื่นๆ", Description: "อื่นๆ"},
	}
	for _, e := range events {
		db.FirstOrCreate(&e, entity.EventCategory{Name: e.Name})
	}

	// Initial club categories
	clubCats := []entity.ClubCategory{
		{Name: "ชมรมกีฬา", Description: "กีฬาและการออกกำลังกาย"},
		{Name: "ชมรมวิชาการ", Description: "ส่งเสริมการเรียนรู้และพัฒนาทักษะวิชาการ"},
		{Name: "ชมรมศิลปะ", Description: "ศิลปะ ดนตรี และการแสดง"},
		{Name: "ชมรมอาสา", Description: "พัฒนาสังคมและบำเพ็ญประโยชน์"},
		{Name: "ชมรมอื่นๆ", Description: "นักศึกษาสัมพันธ์และกิจกรรมทั่วไป"},
	}
	for _, c := range clubCats {
		db.FirstOrCreate(&c, entity.ClubCategory{Name: c.Name})
	}

	setupInitialUsers()

	setupSampleClubs()

	setupSampleActivities()

	setupSampleActivityHours()

	setupClubMembers()

    setupActivityRegistrations()

    setupAttendanceLogs()

    setupActivityReviews()

    setupNotifications()

    setupMediaUploads()

    setupClubAnnouncements()

    setupActivityReports()

	fmt.Println("Database setup completed successfully")
}

func setupInitialUsers() {
	// Get admin role
	var adminRole entity.Role
	db.Where("role_name = ?", "admin").First(&adminRole)
	hashedPassword1, _ := HashPassword("admin123")

	// Create admin user
	adminUser := entity.User{
		Email:        "admin@sut.ac.th",
		FirstName:    "Martin",
		LastName:     "Panchiangsi",
		StudentID:    "ADMIN001",
		Password:     hashedPassword1,
		ProfileImage: "/images/profiles/admins/CutieShiba.jpg",
		IsActive:     true,
		RoleID:       adminRole.ID,
	}
	db.FirstOrCreate(&adminUser, entity.User{Email: adminUser.Email})

	// Create sample student users (expanded for better representation)
	var studentRole entity.Role
	db.Where("role_name = ?", "student").First(&studentRole)
	hashedPassword2, _ := HashPassword("student123")

	sampleStudents := []entity.User{
		// Year 4 students (B64xxxxx)
		{
			Email:        "student001@sut.ac.th",
			FirstName:    "สมชาย",
			LastName:     "ใจดี",
			StudentID:    "B6400001",
			Password:     hashedPassword2,
			ProfileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=somchai&backgroundColor=b6e3f4",
			IsActive:     true,
			RoleID:       studentRole.ID,
		},
		{
			Email:        "student002@sut.ac.th",
			FirstName:    "สมหญิง",
			LastName:     "ขยันดี",
			StudentID:    "B6400002",
			Password:     hashedPassword2,
			ProfileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=somying&backgroundColor=ffd5a3",
			IsActive:     true,
			RoleID:       studentRole.ID,
		},
		{
			Email:        "student003@sut.ac.th",
			FirstName:    "วิทยา",
			LastName:     "เรียนดี",
			StudentID:    "B6400003",
			Password:     hashedPassword2,
			ProfileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=wittaya&backgroundColor=c084fc",
			IsActive:     true,
			RoleID:       studentRole.ID,
		},
		// Year 3 students (B65xxxxx)
		{
			Email:        "student004@sut.ac.th",
			FirstName:    "อนันต์",
			LastName:     "รักเรียน",
			StudentID:    "B6500004",
			Password:     hashedPassword2,
			ProfileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=anan&backgroundColor=a7f3d0",
			IsActive:     true,
			RoleID:       studentRole.ID,
		},
		{
			Email:        "student005@sut.ac.th",
			FirstName:    "สุดา",
			LastName:     "กิจดี",
			StudentID:    "B6500005",
			Password:     hashedPassword2,
			ProfileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=suda&backgroundColor=f3e8ff",
			IsActive:     true,
			RoleID:       studentRole.ID,
		},
		{
			Email:        "student006@sut.ac.th",
			FirstName:    "กิตติ",
			LastName:     "เทคโน",
			StudentID:    "B6500006",
			Password:     hashedPassword2,
			ProfileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=kitti&backgroundColor=fef3c7",
			IsActive:     true,
			RoleID:       studentRole.ID,
		},
		// Year 2 students (B66xxxxx)
		{
			Email:        "student007@sut.ac.th",
			FirstName:    "พิชญา",
			LastName:     "สร้างสรรค์",
			StudentID:    "B6600007",
			Password:     hashedPassword2,
			ProfileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=pichaya&backgroundColor=fed7e2",
			IsActive:     true,
			RoleID:       studentRole.ID,
		},
		{
			Email:        "student008@sut.ac.th",
			FirstName:    "ธนวัต",
			LastName:     "นวัตกรรม",
			StudentID:    "B6600008",
			Password:     hashedPassword2,
			ProfileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=thanawat&backgroundColor=dbeafe",
			IsActive:     true,
			RoleID:       studentRole.ID,
		},
		{
			Email:        "student009@sut.ac.th",
			FirstName:    "รัชนี",
			LastName:     "อาร์ต",
			StudentID:    "B6600009",
			Password:     hashedPassword2,
			ProfileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=ratchanee&backgroundColor=fde68a",
			IsActive:     true,
			RoleID:       studentRole.ID,
		},
		// Year 1 students (B67xxxxx)
		{
			Email:        "student010@sut.ac.th",
			FirstName:    "ณัฐ",
			LastName:     "สปอร์ต",
			StudentID:    "B6700010",
			Password:     hashedPassword2,
			ProfileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=nat&backgroundColor=bbf7d0",
			IsActive:     true,
			RoleID:       studentRole.ID,
		},
		{
			Email:        "student011@sut.ac.th",
			FirstName:    "มิรา",
			LastName:     "อาสา",
			StudentID:    "B6700011",
			Password:     hashedPassword2,
			ProfileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=mira&backgroundColor=fecaca",
			IsActive:     true,
			RoleID:       studentRole.ID,
		},
		{
			Email:        "student012@sut.ac.th",
			FirstName:    "เอก",
			LastName:     "เกมเมอร์",
			StudentID:    "B6700012",
			Password:     hashedPassword2,
			ProfileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=ek&backgroundColor=e0e7ff",
			IsActive:     true,
			RoleID:       studentRole.ID,
		},
	}

	for _, student := range sampleStudents {
		db.FirstOrCreate(&student, entity.User{Email: student.Email})
	}

	// Create club admin users (expanded)
	var clubAdminRole entity.Role
	db.Where("role_name = ?", "club_admin").First(&clubAdminRole)
	hashedPassword3, _ := HashPassword("clubadmin123")

	clubAdmins := []entity.User{
		{
			Email:        "club.admin001@sut.ac.th",
			FirstName:    "ประธาน",
			LastName:     "ชมรมคอม",
			StudentID:    "B6300001",
			Password:     hashedPassword3,
			ProfileImage: "https://ui-avatars.com/api/?name=ประธาน+ชมรมคอม&background=2563eb&color=fff&size=150",
			IsActive:     true,
			RoleID:       clubAdminRole.ID,
		},
		{
			Email:        "club.admin002@sut.ac.th",
			FirstName:    "ประธาน",
			LastName:     "ชมรมฟุตบอล",
			StudentID:    "B6300002",
			Password:     hashedPassword3,
			ProfileImage: "https://ui-avatars.com/api/?name=ประธาน+ชมรมฟุตบอล&background=059669&color=fff&size=150",
			IsActive:     true,
			RoleID:       clubAdminRole.ID,
		},
		{
			Email:        "club.admin003@sut.ac.th",
			FirstName:    "ประธาน",
			LastName:     "ชมรมดนตรีสากล",
			StudentID:    "B6300003",
			Password:     hashedPassword3,
			ProfileImage: "https://ui-avatars.com/api/?name=ประธาน+ชมรมดนตรี&background=dc2626&color=fff&size=150",
			IsActive:     true,
			RoleID:       clubAdminRole.ID,
		},
		{
			Email:        "club.admin004@sut.ac.th",
			FirstName:    "ประธาน",
			LastName:     "ชมรมบาสเกตบอล",
			StudentID:    "B6300004",
			Password:     hashedPassword3,
			ProfileImage: "https://ui-avatars.com/api/?name=ประธาน+ชมรมบาส&background=ea580c&color=fff&size=150",
			IsActive:     true,
			RoleID:       clubAdminRole.ID,
		},
		{
			Email:        "club.admin005@sut.ac.th",
			FirstName:    "ประธาน",
			LastName:     "ชมรมถ่ายภาพ",
			StudentID:    "B6300005",
			Password:     hashedPassword3,
			ProfileImage: "https://ui-avatars.com/api/?name=ประธาน+ชมรมถ่ายภาพ&background=7c3aed&color=fff&size=150",
			IsActive:     true,
			RoleID:       clubAdminRole.ID,
		},
		{
			Email:        "club.admin006@sut.ac.th",
			FirstName:    "ประธาน",
			LastName:     "ชมรมจิตอาสา",
			StudentID:    "B6300006",
			Password:     hashedPassword3,
			ProfileImage: "https://ui-avatars.com/api/?name=ประธาน+ชมรมจิตอาสา&background=0891b2&color=fff&size=150",
			IsActive:     true,
			RoleID:       clubAdminRole.ID,
		},
	}

	for _, admin := range clubAdmins {
		db.FirstOrCreate(&admin, entity.User{Email: admin.Email})
	}

	// Create sample student user (Martin)
	studentUser := entity.User{
		Email:        "B6525279@sut.ac.th",
		FirstName:    "มาติน",
		LastName:     "พานเชียงศรี",
		StudentID:    "B6525279",
		RoleID:       studentRole.ID,
		ProfileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=martin&backgroundColor=a7f3d0",
		IsActive:     true,
		Password:     hashedPassword2,
	}
	db.FirstOrCreate(&studentUser, entity.User{Email: studentUser.Email})
}

func setupSampleClubs() {
	// Get status
	var approvedStatus, pendingStatus entity.ClubStatus
	db.Where("name = ?", "approved").First(&approvedStatus)
	db.Where("name = ?", "pending").First(&pendingStatus)

	// Get categories
	var sportsCategory, artsCategory, academicCategory, volunteerCategory, otherCategory entity.ClubCategory
	db.Where("name = ?", "ชมรมกีฬา").First(&sportsCategory)
	db.Where("name = ?", "ชมรมศิลปะ").First(&artsCategory)
	db.Where("name = ?", "ชมรมวิชาการ").First(&academicCategory)
	db.Where("name = ?", "ชมรมอาสา").First(&volunteerCategory)
	db.Where("name = ?", "ชมรมอื่นๆ").First(&otherCategory)

	// Get admin user to set as creator
	var adminUser entity.User
    if err := db.Where("email = ?", "admin@sut.ac.th").First(&adminUser).Error; err != nil {
        fmt.Println("Admin user not found, skipping sample clubs creation")
        return
    }

    var studentFootballClub entity.User
    if err := db.Where("email = ?", "club.admin002@sut.ac.th").First(&studentFootballClub).Error; err != nil {
        fmt.Println("Student user not found, skipping sample clubs creation")
        return
    }

    var studentComClub entity.User
    if err := db.Where("email = ?", "club.admin001@sut.ac.th").First(&studentComClub).Error; err != nil {
        fmt.Println("Student user not found, skipping sample clubs creation")
        return
    }

    var studentMusicClub entity.User
    if err := db.Where("email = ?", "club.admin003@sut.ac.th").First(&studentMusicClub).Error; err != nil {
        fmt.Println("Student user not found, skipping sample clubs creation")
        return
    }

    var studentBasketClub entity.User
    if err := db.Where("email = ?", "club.admin004@sut.ac.th").First(&studentBasketClub).Error; err != nil {
        fmt.Println("Student user not found, skipping sample clubs creation")
        return
    }

	// Create sample clubs from SUT
	sampleClubs := []entity.Club{
		// ชมรมกีฬา
		{
			Name:        "ชมรมฟุตบอล",
			Description: "ชมรมสำหรับผู้ที่รักการเล่นฟุตบอลและต้องการพัฒนาทักษะการเล่น",
			LogoImage:   "/images/clubs/football/FootballClub.png",
			CreatedBy:   studentFootballClub.ID,
			CategoryID:  sportsCategory.ID,
			StatusID:    approvedStatus.ID,
		},
		{
			Name:        "ชมรมบาสเกตบอล",
			Description: "ชมรมบาสเกตบอลเพื่อส่งเสริมการเล่นกีฬาและการแข่งขัน",
			LogoImage:   "/images/clubs/basketball/BasketballClub.png",
			CreatedBy:   studentBasketClub.ID,
			CategoryID:  sportsCategory.ID,
			StatusID:    approvedStatus.ID,
		},
		{
			Name:        "ชมรมแบดมินตัน",
			Description: "ชมรมแบดมินตันสำหรับผู้ที่สนใจการเล่นแบดมินตัน",
			LogoImage:   "",
			CreatedBy:   adminUser.ID,
			CategoryID:  sportsCategory.ID,
			StatusID:    approvedStatus.ID,
		},
		{
			Name:        "ชมรมกีฬาอิเล็คทรอนิคส",
			Description: "E-Sports Club สำหรับผู้ที่สนใจการแข่งขันเกมออนไลน์",
			LogoImage:   "",
			CreatedBy:   adminUser.ID,
			CategoryID:  sportsCategory.ID,
			StatusID:    approvedStatus.ID,
		},
		{
			Name:        "ชมรมฟุตซอล",
			Description: "ชมรมฟุตซอลเพื่อส่งเสริมการเล่นกีฬาในร่ม",
			LogoImage:   "",
			CreatedBy:   adminUser.ID,
			CategoryID:  sportsCategory.ID,
			StatusID:    approvedStatus.ID,
		},

		// ชมรมวิชาการ
		{
			Name:        "ชมรมคอมพิวเตอร์",
			Description: "ชมรมสำหรับผู้ที่สนใจด้านเทคโนโลยีคอมพิวเตอร์และการเขียนโปรแกรม",
			LogoImage:   "/images/clubs/computer/ComputerClub.png",
			CreatedBy:   studentComClub.ID,
			CategoryID:  academicCategory.ID,
			StatusID:    approvedStatus.ID,
		},
		{
			Name:        "ชมรมโรบอท",
			Description: "ชมรมโรบอทเพื่อศึกษาและพัฒนาเทคโนโลยีหุ่นยนต์",
			LogoImage:   "",
			CreatedBy:   adminUser.ID,
			CategoryID:  academicCategory.ID,
			StatusID:    approvedStatus.ID,
		},
		{
			Name:        "ชมรมอิเล็กทรอนิกส์และนวัตกรรมระบบสมองกลฝังตัว",
			Description: "ชมรมสำหรับศึกษาเทคโนโลยีอิเล็กทรอนิกส์และระบบฝังตัว",
			LogoImage:   "",
			CreatedBy:   adminUser.ID,
			CategoryID:  academicCategory.ID,
			StatusID:    approvedStatus.ID,
		},
		{
			Name:        "ชมรมดาราศาสตร์และอวกาศ มทส.",
			Description: "SUT Astronomy and Space Club เพื่อศึกษาดาราศาสตร์และวิทยาศาสตร์อวกาศ",
			LogoImage:   "",
			CreatedBy:   adminUser.ID,
			CategoryID:  academicCategory.ID,
			StatusID:    approvedStatus.ID,
		},
		{
			Name:        "ชมรมภาษาญี่ปุ่น",
			Description: "ชมรมสำหรับผู้ที่สนใจเรียนรู้ภาษาและวัฒนธรรมญี่ปุ่น",
			LogoImage:   "",
			CreatedBy:   adminUser.ID,
			CategoryID:  academicCategory.ID,
			StatusID:    approvedStatus.ID,
		},

		// ชมรมศิลปะ
		{
			Name:        "ชมรมดนตรีสากล",
			Description: "International Music Club สำหรับผู้ที่รักดนตรีสากลและการแสดง",
			LogoImage:   "/images/clubs/music/MusicClub.png",
			CreatedBy:   studentMusicClub.ID,
			CategoryID:  artsCategory.ID,
			StatusID:    approvedStatus.ID,
		},
		{
			Name:        "ชมรมดนตรีและนาฎศิลป์ไทย มทส.",
			Description: "Thai Music and Arts Club เพื่อส่งเสริมดนตรีและศิลปะไทย",
			LogoImage:   "",
			CreatedBy:   adminUser.ID,
			CategoryID:  artsCategory.ID,
			StatusID:    approvedStatus.ID,
		},
		{
			Name:        "ชมรมศิลปะการถ่ายภาพ",
			Description: "Photographic Club สำหรับผู้ที่สนใจการถ่ายภาพและศิลปะภาพ",
			LogoImage:   "",
			CreatedBy:   adminUser.ID,
			CategoryID:  artsCategory.ID,
			StatusID:    approvedStatus.ID,
		},
		{
			Name:        "ชมรมลีลาศ",
			Description: "Dance Club สำหรับผู้ที่รักการเต้นรำและการแสดง",
			LogoImage:   "",
			CreatedBy:   adminUser.ID,
			CategoryID:  artsCategory.ID,
			StatusID:    approvedStatus.ID,
		},

		// ชมรมอาสา/สังคม
		{
			Name:        "ชมรมค่ายอาสาพัฒนาชนบท",
			Description: "Countryside Development Club เพื่อพัฒนาชุมชนและชนบท",
			LogoImage:   "",
			CreatedBy:   adminUser.ID,
			CategoryID:  volunteerCategory.ID,
			StatusID:    approvedStatus.ID,
		},
		{
			Name:        "ชมรมจิตอาสาแสดทอง",
			Description: "SUT Volunteer Club สำหรับกิจกรรมจิตอาสาและบำเพ็ญประโยชน์",
			LogoImage:   "",
			CreatedBy:   adminUser.ID,
			CategoryID:  volunteerCategory.ID,
			StatusID:    approvedStatus.ID,
		},
		{
			Name:        "ชมรมอนุรักษ์สภาพแวดล้อม",
			Description: "Environment Club เพื่อส่งเสริมการอนุรักษ์สิ่งแวดล้อม",
			LogoImage:   "",
			CreatedBy:   adminUser.ID,
			CategoryID:  volunteerCategory.ID,
			StatusID:    approvedStatus.ID,
		},

		// ชมรมอื่นๆ
		{
			Name:        "ชมรมสมาธ",
			Description: "Meditation Club เพื่อฝึกสมาธิและจิตใจให้สงบ",
			LogoImage:   "",
			CreatedBy:   adminUser.ID,
			CategoryID:  otherCategory.ID,
			StatusID:    approvedStatus.ID,
		},
		{
			Name:        "ชมรมเชียร์ลีดเดอร์",
			Description: "Cheerleading Club สำหรับการเป็นเชียร์และการแสดง",
			LogoImage:   "",
			CreatedBy:   adminUser.ID,
			CategoryID:  otherCategory.ID,
			StatusID:    approvedStatus.ID,
		},
		{
			Name:        "ชมรม To Be Number One",
			Description: "To Be Number One Club เพื่อส่งเสริมการต่อต้านยาเสพติด",
			LogoImage:   "",
			CreatedBy:   adminUser.ID,
			CategoryID:  otherCategory.ID,
			StatusID:    approvedStatus.ID,
		},

		// ชมรมที่รออนุมัติ (ตัวอย่าง)
		{
			Name:        "ชมรมการบิน",
			Description: "Flight Club สำหรับผู้ที่สนใจด้านการบินและอากาศยาน",
			LogoImage:   "",
			CreatedBy:   adminUser.ID,
			CategoryID:  academicCategory.ID,
			StatusID:    pendingStatus.ID,
		},
	}

	for _, club := range sampleClubs {
		db.FirstOrCreate(&club, entity.Club{Name: club.Name})
	}
}

func setupSampleActivities() {
	// Get statuses
	var approvedStatus, finishedStatus, cancelledStatus entity.ActivityStatus
	db.Where("name = ?", "approved").First(&approvedStatus)
	db.Where("name = ?", "finished").First(&finishedStatus)
	db.Where("name = ?", "cancelled").First(&cancelledStatus)

	// Get categories
	var academicCategory, sportsCategory, artsCategory, volunteerCategory, otherCategory, lifeSkillsCategory, socializeCategory entity.EventCategory
	db.Where("name = ?", "วิชาการ").First(&academicCategory)
	db.Where("name = ?", "กีฬา").First(&sportsCategory)
	db.Where("name = ?", "ศิลปะ").First(&artsCategory)
	db.Where("name = ?", "บำเพ็ญประโยชน์").First(&volunteerCategory)
    db.Where("name = ?", "ทักษะชีวิต").First(&lifeSkillsCategory)
	db.Where("name = ?", "สังสรรค์").First(&socializeCategory)

	// Get sample clubs
	var clubs []entity.Club
	db.Find(&clubs)

	if len(clubs) == 0 {
		fmt.Println("No clubs found, skipping activities setup")
		return
	}

	// Map clubs by name for easier reference
	clubMap := make(map[string]entity.Club)
	for _, club := range clubs {
		clubMap[club.Name] = club
	}

	sampleActivities := []entity.Activity{
		// ========== กิจกรรมที่เสร็จสิ้นแล้ว (สำหรับ activity hours) ==========
		
		// กิจกรรมวิชาการ
		{
			Title:       "Workshop การเขียนโปรแกรม Python เบื้องต้น",
			Description: "อบรมการเขียนโปรแกรม Python เบื้องต้นสำหรับนักศึกษา เรียนรู้ syntax พื้นฐาน การจัดการข้อมูล และการสร้างโปรแกรมง่ายๆ",
			DateStart:   time.Now().AddDate(0, -3, -15),
			DateEnd:     time.Now().AddDate(0, -3, -14),
			Location:    "ห้องคอมพิวเตอร์ 101",
			Capacity:    30,
			PosterImage: "https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1632&q=80",
			ClubID:      getClubID(clubMap, "ชมรมคอมพิวเตอร์"),
			CategoryID:  academicCategory.ID,
			StatusID:    finishedStatus.ID,
		},
		{
			Title:       "สัมมนาเทคโนโลยี IoT และ Smart Home",
			Description: "การบรรยายและสาธิตเกี่ยวกับเทคโนโลยี Internet of Things และการประยุกต์ใช้ในบ้านอัจฉริยะ",
			DateStart:   time.Now().AddDate(0, -2, -20),
			DateEnd:     time.Now().AddDate(0, -2, -20),
			Location:    "หอประชุมใหญ่",
			Capacity:    100,
			PosterImage: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1625&q=80",
			ClubID:      getClubID(clubMap, "ชมรมอิเล็กทรอนิกส์และนวัตกรรมระบบสมองกลฝังตัว"),
			CategoryID:  academicCategory.ID,
			StatusID:    finishedStatus.ID,
		},
		{
			Title:       "การแข่งขันโปรแกรมมิ่ง Contest ประจำปี",
			Description: "การแข่งขันเขียนโปรแกรมแก้ไขปัญหาอัลกอริทึมระดับมหาวิทยาลัย",
			DateStart:   time.Now().AddDate(0, -1, -25),
			DateEnd:     time.Now().AddDate(0, -1, -25),
			Location:    "ห้องปฏิบัติการคอมพิวเตอร์ 201-203",
			Capacity:    60,
			PosterImage: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
			ClubID:      getClubID(clubMap, "ชมรมคอมพิวเตอร์"),
			CategoryID:  academicCategory.ID,
			StatusID:    finishedStatus.ID,
		},
		{
			Title:       "Workshop การสร้างหุ่นยนต์เบื้องต้น",
			Description: "อบรมการสร้างและโปรแกรมหุ่นยนต์ขั้นพื้นฐาน พร้อมการแข่งขันหุ่นยนต์ขนาดเล็ก",
			DateStart:   time.Now().AddDate(0, -2, -10),
			DateEnd:     time.Now().AddDate(0, -2, -8),
			Location:    "ห้องปฏิบัติการหุ่นยนต์",
			Capacity:    25,
			PosterImage: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
			ClubID:      getClubID(clubMap, "ชมรมโรบอท"),
			CategoryID:  academicCategory.ID,
			StatusID:    finishedStatus.ID,
		},
		{
			Title:       "Japanese Language and Culture Day",
			Description: "กิจกรรมแลกเปลี่ยนวัฒนธรรมญี่ปุ่น การสอนภาษาญี่ปุ่นเบื้องต้น และการแสดงศิลปะญี่ปุ่น",
			DateStart:   time.Now().AddDate(0, -1, -18),
			DateEnd:     time.Now().AddDate(0, -1, -18),
			Location:    "ลานกิจกรรมนักศึกษา",
			Capacity:    80,
			PosterImage: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
			ClubID:      getClubID(clubMap, "ชมรมภาษาญี่ปุ่น"),
			CategoryID:  academicCategory.ID,
			StatusID:    finishedStatus.ID,
		},

		// กิจกรรมกีฬา
		{
			Title:       "การแข่งขันฟุตบอลมิตรภาพ",
			Description: "การแข่งขันฟุตบอลมิตรภาพระหว่างชมรมต่างๆ เพื่อสร้างความสามัคคี",
			DateStart:   time.Now().AddDate(0, -2, -5),
			DateEnd:     time.Now().AddDate(0, -2, -4),
			Location:    "สนามฟุตบอลมหาวิทยาลัย",
			Capacity:    100,
			PosterImage: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1393&q=80",
			ClubID:      getClubID(clubMap, "ชมรมฟุตบอล"),
			CategoryID:  sportsCategory.ID,
			StatusID:    finishedStatus.ID,
		},
		{
			Title:       "ศึกบาสเกตบอลประจำภาค",
			Description: "การแข่งขันบาสเกตบอลระหว่างชั้นปี เพื่อหานักกีฬาเข้าร่วมทีมมหาวิทยาลัย",
			DateStart:   time.Now().AddDate(0, -1, -12),
			DateEnd:     time.Now().AddDate(0, -1, -10),
			Location:    "สนามบาสเกตบอลในร่ม",
			Capacity:    200,
			PosterImage: "https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1390&q=80",
			ClubID:      getClubID(clubMap, "ชมรมบาสเกตบอล"),
			CategoryID:  sportsCategory.ID,
			StatusID:    finishedStatus.ID,
		},
		{
			Title:       "E-Sports Tournament: DOTA 2 Championship",
			Description: "การแข่งขัน DOTA 2 ระดับมหาวิทยาลัย พร้อมรางวัลมูลค่ารวมกว่า 50,000 บาท",
			DateStart:   time.Now().AddDate(0, -1, -5),
			DateEnd:     time.Now().AddDate(0, -1, -3),
			Location:    "ห้องแล็บคอมพิวเตอร์ E-Sports",
			Capacity:    32,
			PosterImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
			ClubID:      getClubID(clubMap, "ชมรมกีฬาอิเล็คทรอนิคส"),
			CategoryID:  sportsCategory.ID,
			StatusID:    finishedStatus.ID,
		},
		{
			Title:       "การแข่งขันแบดมินตันเปิด",
			Description: "การแข่งขันแบดมินตันเปิดสำหรับนักศึกษาทุกคน ทั้งประเภทชายเดี่ยว หญิงเดี่ยว และคู่ผสม",
			DateStart:   time.Now().AddDate(0, -3, -8),
			DateEnd:     time.Now().AddDate(0, -3, -6),
			Location:    "ยิมเนเซียม",
			Capacity:    64,
			PosterImage: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
			ClubID:      getClubID(clubMap, "ชมรมแบดมินตัน"),
			CategoryID:  sportsCategory.ID,
			StatusID:    finishedStatus.ID,
		},

		// กิจกรรมศิลปะ
		{
			Title:       "คอนเสิร์ตดนตรีสากล \"Harmony Night\"",
			Description: "การแสดงดนตรีสากลจากสมาชิกชมรม ร่วมกับศิลปินรับเชิญ",
			DateStart:   time.Now().AddDate(0, -2, -15),
			DateEnd:     time.Now().AddDate(0, -2, -15),
			Location:    "หอประชุมกลาง",
			Capacity:    300,
			PosterImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
			ClubID:      getClubID(clubMap, "ชมรมดนตรีสากล"),
			CategoryID:  artsCategory.ID,
			StatusID:    finishedStatus.ID,
		},
		{
			Title:       "นิทรรศการการถ่ายภาพ \"มุมมองใหม่\"",
			Description: "การจัดแสดงผลงานการถ่ายภาพจากสมาชิกชมรม หัวข้อ \"ความงามรอบตัวเรา\"",
			DateStart:   time.Now().AddDate(0, -1, -20),
			DateEnd:     time.Now().AddDate(0, -1, -13),
			Location:    "แกลเลอรี่ศิลปะ",
			Capacity:    150,
			PosterImage: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1474&q=80",
			ClubID:      getClubID(clubMap, "ชมรมศิลปะการถ่ายภาพ"),
			CategoryID:  artsCategory.ID,
			StatusID:    finishedStatus.ID,
		},
		{
			Title:       "การแสดงดนตรีและนาฏศิลป์ไทย",
			Description: "การแสดงดนตรีไทยดั้งเดิมและการรำไทย เพื่อส่งเสริมศิลปวัฒนธรรมไทย",
			DateStart:   time.Now().AddDate(0, -2, -22),
			DateEnd:     time.Now().AddDate(0, -2, -22),
			Location:    "โรงละครกลางแจ้ง",
			Capacity:    200,
			PosterImage: "https://images.unsplash.com/photo-1595273670150-bd0c3c392e10?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1632&q=80",
			ClubID:      getClubID(clubMap, "ชมรมดนตรีและนาฎศิลป์ไทย มทส."),
			CategoryID:  artsCategory.ID,
			StatusID:    finishedStatus.ID,
		},

		// กิจกรรมอาสาสมัคร
		{
			Title:       "โครงการอาสาสร้างบ้านให้น้อง",
			Description: "กิจกรรมจิตอาสาสร้างบ้านให้เด็กกำพร้าในชุมชนห่างไกล",
			DateStart:   time.Now().AddDate(0, -2, -28),
			DateEnd:     time.Now().AddDate(0, -2, -26),
			Location:    "บ้านเด็กกำพร้า จ.นครราชสีมา",
			Capacity:    40,
			PosterImage: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1473&q=80",
			ClubID:      getClubID(clubMap, "ชมรมจิตอาสาแสดทอง"),
			CategoryID:  volunteerCategory.ID,
			StatusID:    finishedStatus.ID,
		},
		{
			Title:       "โครงการปลูกป่าเพื่อสิ่งแวดล้อม",
			Description: "กิจกรรมปลูกต้นไม้และทำความสะอาดแหล่งธรรมชาติ",
			DateStart:   time.Now().AddDate(0, -1, -15),
			DateEnd:     time.Now().AddDate(0, -1, -14),
			Location:    "อุทยานแห่งชาติเขาใหญ่",
			Capacity:    50,
			PosterImage: "https://images.unsplash.com/photo-1574263867128-66ad5b6e7c89?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1631&q=80",
			ClubID:      getClubID(clubMap, "ชมรมอนุรักษ์สภาพแวดล้อม"),
			CategoryID:  volunteerCategory.ID,
			StatusID:    finishedStatus.ID,
		},
		{
			Title:       "ค่ายพัฒนาเด็กและเยาวชนชนบท",
			Description: "กิจกรรมสอนพิเศษและพัฒนาทักษะให้เด็กๆ ในชุมชนชนบท",
			DateStart:   time.Now().AddDate(0, -3, -5),
			DateEnd:     time.Now().AddDate(0, -3, -2),
			Location:    "โรงเรียนบ้านหนองแสง",
			Capacity:    35,
			PosterImage: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
			ClubID:      getClubID(clubMap, "ชมรมค่ายอาสาพัฒนาชนบท"),
			CategoryID:  volunteerCategory.ID,
			StatusID:    finishedStatus.ID,
		},

		// ========== กิจกรรมที่กำลังจะมาถึง ==========
		
		// กิจกรรมวิชาการ
		{
			Title:       "Workshop AI และ Machine Learning",
			Description: "อบรมเบื้องต้นเกี่ยวกับ Artificial Intelligence และ Machine Learning พร้อมปฏิบัติจริง",
			DateStart:   time.Now().AddDate(0, 1, 5),
			DateEnd:     time.Now().AddDate(0, 1, 6),
			Location:    "ห้องคอมพิวเตอร์ 201",
			Capacity:    40,
			PosterImage: "https://images.unsplash.com/photo-1555255707-c07966088b7b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1632&q=80",
			ClubID:      getClubID(clubMap, "ชมรมคอมพิวเตอร์"),
			CategoryID:  academicCategory.ID,
			StatusID:    approvedStatus.ID,
		},
		{
			Title:       "การประกวดหุ่นยนต์ต่อสู้",
			Description: "การแข่งขันหุ่นยนต์ต่อสู้ประเภทต่างๆ เปิดให้ทุกคนเข้าร่วม",
			DateStart:   time.Now().AddDate(0, 1, 15),
			DateEnd:     time.Now().AddDate(0, 1, 16),
			Location:    "ลานกิจกรรมใหญ่",
			Capacity:    80,
			PosterImage: "https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1287&q=80",
			ClubID:      getClubID(clubMap, "ชมรมโรบอท"),
			CategoryID:  academicCategory.ID,
			StatusID:    approvedStatus.ID,
		},
		{
			Title:       "สัมมนาดาราศาสตร์: \"ความลับของจักรวาล\"",
			Description: "การบรรยายพิเศษโดยนักดาราศาสตร์ชื่อดัง พร้อมการสังเกตการณ์ดาวผ่านกล้องโทรทรรศน์",
			DateStart:   time.Now().AddDate(0, 0, 20),
			DateEnd:     time.Now().AddDate(0, 0, 20),
			Location:    "หอดูดาวมหาวิทยาลัย",
			Capacity:    60,
			PosterImage: "/images/activities/posterImages/poster2.png",
			ClubID:      getClubID(clubMap, "ชมรมดาราศาสตร์และอวกาศ มทส."),
			CategoryID:  academicCategory.ID,
			StatusID:    approvedStatus.ID,
		},

		// กิจกรรมกีฬา
		{
			Title:       "การแข่งขันฟุตบอลประจำปี",
			Description: "การแข่งขันฟุตบอลระหว่างคณะต่างๆ พร้อมรางวัลถ้วยรางวัลประจำปี",
			DateStart:   time.Now().AddDate(0, 2, 0),
			DateEnd:     time.Now().AddDate(0, 2, 7),
			Location:    "สนามฟุตบอลมหาวิทยาลัย",
			Capacity:    500,
			PosterImage: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
			ClubID:      getClubID(clubMap, "ชมรมฟุตบอล"),
			CategoryID:  sportsCategory.ID,
			StatusID:    approvedStatus.ID,
		},
		{
			Title:       "ศึกฟุตซอลคณะ",
			Description: "การแข่งขันฟุตซอลประจำปีระหว่างคณะ ชิงแชมป์มหาวิทยาลัย",
			DateStart:   time.Now().AddDate(0, 1, 25),
			DateEnd:     time.Now().AddDate(0, 1, 28),
			Location:    "สนามฟุตซอลในร่ม",
			Capacity:    150,
			PosterImage: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
			ClubID:      getClubID(clubMap, "ชมรมฟุตซอล"),
			CategoryID:  sportsCategory.ID,
			StatusID:    approvedStatus.ID,
		},
		{
			Title:       "Mobile Legends: Bang Bang Tournament",
			Description: "การแข่งขัน Mobile Legends ระดับมหาวิทยาลัย เปิดสมัครทีมละ 5 คน",
			DateStart:   time.Now().AddDate(0, 0, 15),
			DateEnd:     time.Now().AddDate(0, 0, 17),
			Location:    "ห้อง E-Sports Center",
			Capacity:    50,
			PosterImage: "/images/activities/posterImages/poster3.png",
			ClubID:      getClubID(clubMap, "ชมรมกีฬาอิเล็คทรอนิคส"),
			CategoryID:  sportsCategory.ID,
			StatusID:    approvedStatus.ID,
		},

		// กิจกรรมศิลปะ
		{
			Title:       "คอนเสิร์ตเปิดภาคเรียน \"Fresh Start\"",
			Description: "คอนเสิร์ตต้อนรับนักศึกษาใหม่ พร้อมการแสดงจากศิลปินนักศึกษา",
			DateStart:   time.Now().AddDate(0, 0, 25),
			DateEnd:     time.Now().AddDate(0, 0, 25),
			Location:    "หอประชุมใหญ่",
			Capacity:    400,
			PosterImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
			ClubID:      getClubID(clubMap, "ชมรมดนตรีสากล"),
			CategoryID:  artsCategory.ID,
			StatusID:    approvedStatus.ID,
		},
		{
			Title:       "Workshop การถ่ายภาพ Portrait",
			Description: "อบรมเทคนิคการถ่ายภาพ Portrait แบบมืออาชีพ โดยช่างภาพชื่อดัง",
			DateStart:   time.Now().AddDate(0, 1, 10),
			DateEnd:     time.Now().AddDate(0, 1, 10),
			Location:    "สตูดิโอถ่ายภาพ",
			Capacity:    20,
			PosterImage: "https://images.unsplash.com/photo-1554048612-b6a482b80ed2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
			ClubID:      getClubID(clubMap, "ชมรมศิลปะการถ่ายภาพ"),
			CategoryID:  artsCategory.ID,
			StatusID:    approvedStatus.ID,
		},
		{
			Title:       "การแสดงลีลาศสากล",
			Description: "การแสดงลีลาศสากลและการสอนเต้นรำเบื้องต้นสำหรับผู้สนใจ",
			DateStart:   time.Now().AddDate(0, 1, 20),
			DateEnd:     time.Now().AddDate(0, 1, 20),
			Location:    "ห้องเอนกประสงค์ใหญ่",
			Capacity:    100,
			PosterImage: "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
			ClubID:      getClubID(clubMap, "ชมรมลีลาศ"),
			CategoryID:  artsCategory.ID,
			StatusID:    approvedStatus.ID,
		},

		// กิจกรรมอาสาสมัคร
		{
			Title:       "โครงการรักษ์โลก รักษ์ธรรมชาติ",
			Description: "กิจกรรมรณรงค์รักษาสิ่งแวดล้อม ทำความสะอาดชุมชน และปลูกต้นไม้",
			DateStart:   time.Now().AddDate(0, 0, 30),
			DateEnd:     time.Now().AddDate(0, 1, 1),
			Location:    "ชุมชนรอบมหาวิทยาลัย",
			Capacity:    60,
			PosterImage: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
			ClubID:      getClubID(clubMap, "ชมรมอนุรักษ์สภาพแวดล้อม"),
			CategoryID:  volunteerCategory.ID,
			StatusID:    approvedStatus.ID,
		},
		{
			Title:       "ค่ายอาสาครูสอนพิเศษ",
			Description: "โครงการไปสอนพิเศษให้เด็กๆ ในชุมชนห่างไกล ช่วงปิดเทอม",
			DateStart:   time.Now().AddDate(0, 3, 0),
			DateEnd:     time.Now().AddDate(0, 3, 7),
			Location:    "โรงเรียนบ้านป่าไผ่",
			Capacity:    30,
			PosterImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9d1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
			ClubID:      getClubID(clubMap, "ชมรมค่ายอาสาพัฒนาชนบท"),
			CategoryID:  volunteerCategory.ID,
			StatusID:    approvedStatus.ID,
		},
		{
			Title:       "โครงการบริจาคโลหิตประจำปี",
			Description: "กิจกรรมบริจาคโลหิตเพื่อช่วยเหลือผู้ป่วยในโรงพยาบาล",
			DateStart:   time.Now().AddDate(0, 0, 12),
			DateEnd:     time.Now().AddDate(0, 0, 14),
			Location:    "อาคารเรียนรวม 1",
			Capacity:    200,
			PosterImage: "/images/activities/posterImages/poster1.png",
			ClubID:      getClubID(clubMap, "ชมรมจิตอาสาแสดทอง"),
			CategoryID:  volunteerCategory.ID,
			StatusID:    approvedStatus.ID,
		},

		// กิจกรรมอื่นๆ
		{
			Title:       "ค่ายสมาธิและจิตสำนึก",
			Description: "ค่ายฝึกสมาธิเพื่อความสงบจิตและการพัฒนาตนเอง",
			DateStart:   time.Now().AddDate(0, 2, 10),
			DateEnd:     time.Now().AddDate(0, 2, 12),
			Location:    "ศูนย์ธรรมาราม",
			Capacity:    40,
			PosterImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
			ClubID:      getClubID(clubMap, "ชมรมสมาธิ"),
			CategoryID:  otherCategory.ID,
			StatusID:    approvedStatus.ID,
		},
		{
			Title:       "การแข่งขันเชียร์ลีดเดอร์",
			Description: "การแข่งขันเชียร์ลีดเดอร์ระหว่างคณะ พร้อมการสอนท่าเชียร์พื้นฐาน",
			DateStart:   time.Now().AddDate(0, 1, 12),
			DateEnd:     time.Now().AddDate(0, 1, 12),
			Location:    "ยิมเนเซียมใหญ่",
			Capacity:    150,
			PosterImage: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
			ClubID:      getClubID(clubMap, "ชมรมเชียร์ลีดเดอร์"),
			CategoryID:  otherCategory.ID,
			StatusID:    approvedStatus.ID,
		},
		{
			Title:       "แคมเปญต่อต้านยาเสพติด",
			Description: "กิจกรรมรณรงค์ต่อต้านยาเสพติดและสารเสพติด พร้อมการแสดงละครเวที",
			DateStart:   time.Now().AddDate(0, 0, 28),
			DateEnd:     time.Now().AddDate(0, 0, 28),
			Location:    "หอประชุมกลาง",
			Capacity:    300,
			PosterImage: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
			ClubID:      getClubID(clubMap, "ชมรม To Be Number One"),
			CategoryID:  otherCategory.ID,
			StatusID:    approvedStatus.ID,
		},
	}

	// Create activities
	for _, activity := range sampleActivities {
		if activity.ClubID != 0 { // Only create if club exists
			var existing entity.Activity
			result := db.Where("title = ?", activity.Title).First(&existing)
			if result.Error != nil {
				err := db.Create(&activity).Error
				if err != nil {
					fmt.Printf("Error creating activity '%s': %v\n", activity.Title, err)
				} else {
					fmt.Printf("Successfully created activity: %s\n", activity.Title)
				}
			} else {
				fmt.Printf("Activity already exists: %s\n", activity.Title)
			}
		} else {
			fmt.Printf("Skipping activity '%s' - club not found\n", activity.Title)
		}
	}
	
	fmt.Println("Sample activities setup completed")
}

// Helper function to get club ID by name
func getClubID(clubMap map[string]entity.Club, clubName string) uint {
	if club, exists := clubMap[clubName]; exists {
		return club.ID
	}
	return 0
}

func setupSampleActivityHours() {
    // ดึงผู้ใช้ role student
    var students []entity.User
    db.Joins("JOIN roles ON users.role_id = roles.id").
        Where("roles.role_name = ?", "student").
        Find(&students)

    // ดึง ALL activities (ไม่จำกัดเฉพาะ finished เพราะอาจจะยังไม่มี)
    var activities []entity.Activity
    db.Find(&activities)

    // ดึงผู้ตรวจสอบ (admin)
    var admin entity.User
    db.Joins("JOIN roles ON users.role_id = roles.id").
        Where("roles.role_name = ?", "admin").
        First(&admin)

    // ตรวจสอบว่าข้อมูลพร้อม
    if len(students) == 0 {
        fmt.Println("No students found for activity hours setup")
        return
    }
    
    if len(activities) == 0 {
        fmt.Println("No activities found for activity hours setup") 
        return
    }
    
    if admin.ID == 0 {
        fmt.Println("No admin found for activity hours setup")
        return
    }

    fmt.Printf("Found %d students, %d activities, admin ID: %d\n", 
        len(students), len(activities), admin.ID)

    // สร้างข้อมูล activity hours
    var activityID2 uint
    if len(activities) > 1 {
        activityID2 = activities[1].ID
    } else {
        activityID2 = activities[0].ID
    }

    sampleHours := []entity.ActivityHour{
        {
            UserID:     students[0].ID,
            ActivityID: activities[0].ID,
            Hours:      3.0,
            VerifiedBy: admin.ID,
        },
    }
    
    // เพิ่ม record ที่ 2 ถ้ามี student และ activity เพียงพอ
    if len(students) > 1 {
        sampleHours = append(sampleHours, entity.ActivityHour{
            UserID:     students[1].ID,
            ActivityID: activityID2,
            Hours:      2.5,
            VerifiedBy: admin.ID,
        })
    }

    // สร้างข้อมูลใน database
    for i, hour := range sampleHours {
        var existing entity.ActivityHour
        result := db.Where("user_id = ? AND activity_id = ?",
            hour.UserID, hour.ActivityID).
            First(&existing)

        if result.Error != nil {
            err := db.Create(&hour).Error
            if err != nil {
                fmt.Printf("Error creating activity hour %d: %v\n", i+1, err)
            } else {
                fmt.Printf("Successfully created activity hour for user %d, activity %d\n", 
                    hour.UserID, hour.ActivityID)
            }
        } else {
            fmt.Printf("Activity hour already exists for user %d, activity %d\n", 
                hour.UserID, hour.ActivityID)
        }
    }

    fmt.Println("Sample activity hours setup completed")
}


// Setup สมาชิกชมรม
func setupClubMembers() {
	var students []entity.User
	db.Joins("JOIN roles ON users.role_id = roles.id").
		Where("roles.role_name = ?", "student").
		Find(&students)
		
	var clubAdmins []entity.User
	db.Joins("JOIN roles ON users.role_id = roles.id").
		Where("roles.role_name = ?", "club_admin").
		Find(&clubAdmins)
		
	var clubs []entity.Club
	db.Find(&clubs)

	if len(students) > 0 && len(clubs) > 0 {
		// Create comprehensive membership structure
		sampleMembers := []entity.ClubMember{
			// ชมรมฟุตบอล (index 0) - Popular sports club
			{UserID: students[0].ID, ClubID: clubs[0].ID, Role: "member", JoinedAt: time.Now().AddDate(0, -8, 0)},
			{UserID: students[2].ID, ClubID: clubs[0].ID, Role: "vice_president", JoinedAt: time.Now().AddDate(-1, 0, 0)},
			{UserID: students[9].ID, ClubID: clubs[0].ID, Role: "member", JoinedAt: time.Now().AddDate(0, -3, 0)},
			{UserID: students[7].ID, ClubID: clubs[0].ID, Role: "member", JoinedAt: time.Now().AddDate(0, -5, 0)},
			{UserID: students[11].ID, ClubID: clubs[0].ID, Role: "member", JoinedAt: time.Now().AddDate(0, -2, 0)},

			// ชมรมบาสเกตบอล (index 1)
			{UserID: students[1].ID, ClubID: clubs[1].ID, Role: "member", JoinedAt: time.Now().AddDate(0, -3, 0)},
			{UserID: students[4].ID, ClubID: clubs[1].ID, Role: "treasurer", JoinedAt: time.Now().AddDate(0, -6, 0)},
			{UserID: students[8].ID, ClubID: clubs[1].ID, Role: "member", JoinedAt: time.Now().AddDate(0, -4, 0)},
			{UserID: students[10].ID, ClubID: clubs[1].ID, Role: "member", JoinedAt: time.Now().AddDate(0, -1, 0)},

			// ชมรมแบดมินตัน (index 2)
			{UserID: students[3].ID, ClubID: clubs[2].ID, Role: "member", JoinedAt: time.Now().AddDate(0, -7, 0)},
			{UserID: students[6].ID, ClubID: clubs[2].ID, Role: "member", JoinedAt: time.Now().AddDate(0, -4, 0)},

			// ชมรมกีฬาอิเล็คทรอนิคส (index 3) - Popular among younger students
			{UserID: students[11].ID, ClubID: clubs[3].ID, Role: "vice_president", JoinedAt: time.Now().AddDate(0, -6, 0)},
			{UserID: students[7].ID, ClubID: clubs[3].ID, Role: "member", JoinedAt: time.Now().AddDate(0, -3, 0)},
			{UserID: students[5].ID, ClubID: clubs[3].ID, Role: "member", JoinedAt: time.Now().AddDate(0, -4, 0)},
			{UserID: students[8].ID, ClubID: clubs[3].ID, Role: "member", JoinedAt: time.Now().AddDate(0, -2, 0)},

			// ชมรมฟุตซอล (index 4)
			{UserID: students[2].ID, ClubID: clubs[4].ID, Role: "member", JoinedAt: time.Now().AddDate(0, -5, 0)},
			{UserID: students[9].ID, ClubID: clubs[4].ID, Role: "member", JoinedAt: time.Now().AddDate(0, -3, 0)},

			// ชมรมคอมพิวเตอร์ (index 5) - Academic club with good membership
			{UserID: students[0].ID, ClubID: clubs[5].ID, Role: "member", JoinedAt: time.Now().AddDate(0, -6, 0)},
			{UserID: students[1].ID, ClubID: clubs[5].ID, Role: "member", JoinedAt: time.Now().AddDate(0, -4, 0)},
			{UserID: students[5].ID, ClubID: clubs[5].ID, Role: "secretary", JoinedAt: time.Now().AddDate(0, -8, 0)},
			{UserID: students[7].ID, ClubID: clubs[5].ID, Role: "member", JoinedAt: time.Now().AddDate(0, -3, 0)},
			{UserID: students[11].ID, ClubID: clubs[5].ID, Role: "member", JoinedAt: time.Now().AddDate(0, -2, 0)},

			// ชมรมโรบอท (index 6)
			{UserID: students[3].ID, ClubID: clubs[6].ID, Role: "member", JoinedAt: time.Now().AddDate(0, -5, 0)},
			{UserID: students[5].ID, ClubID: clubs[6].ID, Role: "member", JoinedAt: time.Now().AddDate(0, -4, 0)},

			// ชมรมอิเล็กทรอนิกส์และนวัตกรรมระบบสมองกลฝังตัว (index 7)
			{UserID: students[4].ID, ClubID: clubs[7].ID, Role: "member", JoinedAt: time.Now().AddDate(0, -6, 0)},
			{UserID: students[7].ID, ClubID: clubs[7].ID, Role: "member", JoinedAt: time.Now().AddDate(0, -3, 0)},

			// ชมรมดาราศาสตร์และอวกาศ (index 8)
			{UserID: students[6].ID, ClubID: clubs[8].ID, Role: "member", JoinedAt: time.Now().AddDate(0, -4, 0)},
			{UserID: students[8].ID, ClubID: clubs[8].ID, Role: "member", JoinedAt: time.Now().AddDate(0, -2, 0)},

			// ชมรมภาษาญี่ปุ่น (index 9)
			{UserID: students[1].ID, ClubID: clubs[9].ID, Role: "member", JoinedAt: time.Now().AddDate(0, -7, 0)},
			{UserID: students[6].ID, ClubID: clubs[9].ID, Role: "member", JoinedAt: time.Now().AddDate(0, -5, 0)},
			{UserID: students[8].ID, ClubID: clubs[9].ID, Role: "member", JoinedAt: time.Now().AddDate(0, -3, 0)},

			// ชมรมดนตรีสากล (index 10) - Popular arts club
			{UserID: students[0].ID, ClubID: clubs[10].ID, Role: "treasurer", JoinedAt: time.Now().AddDate(0, -5, 0)},
			{UserID: students[2].ID, ClubID: clubs[10].ID, Role: "member", JoinedAt: time.Now().AddDate(0, -2, 0)},
			{UserID: students[6].ID, ClubID: clubs[10].ID, Role: "member", JoinedAt: time.Now().AddDate(0, -4, 0)},
			{UserID: students[8].ID, ClubID: clubs[10].ID, Role: "member", JoinedAt: time.Now().AddDate(0, -3, 0)},

			// ชมรมดนตรีและนาฎศิลป์ไทย (index 11)
			{UserID: students[4].ID, ClubID: clubs[11].ID, Role: "member", JoinedAt: time.Now().AddDate(0, -6, 0)},
			{UserID: students[9].ID, ClubID: clubs[11].ID, Role: "member", JoinedAt: time.Now().AddDate(0, -3, 0)},

			// ชมรมศิลปะการถ่ายภาพ (index 12)
			{UserID: students[3].ID, ClubID: clubs[12].ID, Role: "member", JoinedAt: time.Now().AddDate(0, -4, 0)},
			{UserID: students[6].ID, ClubID: clubs[12].ID, Role: "vice_president", JoinedAt: time.Now().AddDate(0, -8, 0)},
			{UserID: students[10].ID, ClubID: clubs[12].ID, Role: "member", JoinedAt: time.Now().AddDate(0, -2, 0)},

			// ชมรมลีลาศ (index 13)
			{UserID: students[1].ID, ClubID: clubs[13].ID, Role: "member", JoinedAt: time.Now().AddDate(0, -5, 0)},
			{UserID: students[8].ID, ClubID: clubs[13].ID, Role: "member", JoinedAt: time.Now().AddDate(0, -3, 0)},

			// ชมรมค่ายอาสาพัฒนาชนบท (index 14)
			{UserID: students[4].ID, ClubID: clubs[14].ID, Role: "member", JoinedAt: time.Now().AddDate(0, -7, 0)},
			{UserID: students[10].ID, ClubID: clubs[14].ID, Role: "member", JoinedAt: time.Now().AddDate(0, -4, 0)},

			// ชมรมจิตอาสาแสดทอง (index 15) - Popular volunteer club
			{UserID: students[2].ID, ClubID: clubs[15].ID, Role: "member", JoinedAt: time.Now().AddDate(0, -6, 0)},
			{UserID: students[5].ID, ClubID: clubs[15].ID, Role: "member", JoinedAt: time.Now().AddDate(0, -5, 0)},
			{UserID: students[10].ID, ClubID: clubs[15].ID, Role: "secretary", JoinedAt: time.Now().AddDate(0, -8, 0)},
			{UserID: students[11].ID, ClubID: clubs[15].ID, Role: "member", JoinedAt: time.Now().AddDate(0, -2, 0)},

			// ชมรมอนุรักษ์สภาพแวดล้อม (index 16)
			{UserID: students[3].ID, ClubID: clubs[16].ID, Role: "member", JoinedAt: time.Now().AddDate(0, -5, 0)},
			{UserID: students[7].ID, ClubID: clubs[16].ID, Role: "member", JoinedAt: time.Now().AddDate(0, -3, 0)},

			// ชมรมสมาธิ (index 17)
			{UserID: students[1].ID, ClubID: clubs[17].ID, Role: "member", JoinedAt: time.Now().AddDate(0, -4, 0)},
			{UserID: students[9].ID, ClubID: clubs[17].ID, Role: "member", JoinedAt: time.Now().AddDate(0, -2, 0)},

			// ชมรมเชียร์ลีดเดอร์ (index 18)
			{UserID: students[6].ID, ClubID: clubs[18].ID, Role: "member", JoinedAt: time.Now().AddDate(0, -6, 0)},
			{UserID: students[8].ID, ClubID: clubs[18].ID, Role: "member", JoinedAt: time.Now().AddDate(0, -3, 0)},

			// ชมรม To Be Number One (index 19)
			{UserID: students[4].ID, ClubID: clubs[19].ID, Role: "member", JoinedAt: time.Now().AddDate(0, -5, 0)},
			{UserID: students[11].ID, ClubID: clubs[19].ID, Role: "member", JoinedAt: time.Now().AddDate(0, -3, 0)},
		}

		// Add club admins as presidents (ensure we have enough club admins)
		if len(clubAdmins) >= 6 && len(clubs) >= 20 {
			adminMembers := []entity.ClubMember{
				{UserID: clubAdmins[1].ID, ClubID: clubs[0].ID, Role: "president", JoinedAt: time.Now().AddDate(-1, 0, 0)},  // Football
				{UserID: clubAdmins[3].ID, ClubID: clubs[1].ID, Role: "president", JoinedAt: time.Now().AddDate(-1, 0, 0)},  // Basketball
				{UserID: clubAdmins[0].ID, ClubID: clubs[5].ID, Role: "president", JoinedAt: time.Now().AddDate(-1, 0, 0)},  // Computer
				{UserID: clubAdmins[2].ID, ClubID: clubs[10].ID, Role: "president", JoinedAt: time.Now().AddDate(-1, 0, 0)}, // Music
				{UserID: clubAdmins[4].ID, ClubID: clubs[12].ID, Role: "president", JoinedAt: time.Now().AddDate(-1, 0, 0)}, // Photography
				{UserID: clubAdmins[5].ID, ClubID: clubs[15].ID, Role: "president", JoinedAt: time.Now().AddDate(-1, 0, 0)}, // Volunteer
			}
			sampleMembers = append(sampleMembers, adminMembers...)
		}

		for _, member := range sampleMembers {
			var existing entity.ClubMember
			result := db.Where("user_id = ? AND club_id = ?", member.UserID, member.ClubID).First(&existing)
			if result.Error != nil {
				db.Create(&member)
			}
		}
	}
	fmt.Println("Club members setup completed")
}

// Setup การลงทะเบียนกิจกรรม
func setupActivityRegistrations() {
    var students []entity.User
    db.Joins("JOIN roles ON users.role_id = roles.id").
        Where("roles.role_name = ?", "student").
        Find(&students)

    var activities []entity.Activity
    db.Find(&activities)

    var regStatuses []entity.ActivityRegistrationStatus
    db.Find(&regStatuses)

    if len(students) > 0 && len(activities) > 0 && len(regStatuses) > 0 {
        var registeredStatus, attendedStatus, absentStatus entity.ActivityRegistrationStatus
        db.Where("name = ?", "registered").First(&registeredStatus)
        db.Where("name = ?", "attended").First(&attendedStatus)
        db.Where("name = ?", "absent").First(&absentStatus)

        sampleRegistrations := []entity.ActivityRegistration{
            {
                ActivityID:   activities[0].ID,
                UserID:       students[0].ID,
                StatusID:     attendedStatus.ID,
                RegisteredAt: time.Now().AddDate(0, -1, -5),
            },
            {
                ActivityID:   activities[0].ID,
                UserID:       students[1].ID,
                StatusID:     attendedStatus.ID,
                RegisteredAt: time.Now().AddDate(0, -1, -3),
            },
            {
                ActivityID:   activities[0].ID,
                UserID:       students[2].ID,
                StatusID:     absentStatus.ID,
                RegisteredAt: time.Now().AddDate(0, -1, -2),
            },
        }

        if len(activities) > 1 {
            futureRegistrations := []entity.ActivityRegistration{
                {
                    ActivityID:   activities[26].ID,
                    UserID:       students[0].ID,
                    StatusID:     registeredStatus.ID,
                    RegisteredAt: time.Now().AddDate(0, 0, -2),
                },
                {
                    ActivityID:   activities[26].ID,
                    UserID:       students[1].ID,
                    StatusID:     registeredStatus.ID,
                    RegisteredAt: time.Now().AddDate(0, 0, -1),
                },
            }
            sampleRegistrations = append(sampleRegistrations, futureRegistrations...)
        }

        for _, registration := range sampleRegistrations {
            var existing entity.ActivityRegistration
            result := db.Where("activity_id = ? AND user_id = ?", 
                registration.ActivityID, registration.UserID).First(&existing)
            if result.Error != nil {
                db.Create(&registration)
            }
        }
    }

    fmt.Println("Activity registrations setup completed")
}

// Setup บันทึกการเช็คชื่อ
func setupAttendanceLogs() {
    var attendedRegistrations []entity.ActivityRegistration
    db.Joins("JOIN activity_registration_statuses ON activity_registrations.status_id = activity_registration_statuses.id").
        Where("activity_registration_statuses.name = ?", "attended").
        Find(&attendedRegistrations)

    if len(attendedRegistrations) > 0 {
        sampleLogs := []entity.AttendanceLog{
            {
                RegistrationID: attendedRegistrations[0].ID,
                CheckinTime:    time.Now().AddDate(0, -1, 0).Add(9 * time.Hour),
                CheckoutTime:   time.Now().AddDate(0, -1, 0).Add(12 * time.Hour),
            },
        }

        if len(attendedRegistrations) > 1 {
            moreLogs := []entity.AttendanceLog{
                {
                    RegistrationID: attendedRegistrations[1].ID,
                    CheckinTime:    time.Now().AddDate(0, -1, 0).Add(9 * time.Hour + 15*time.Minute),
                    CheckoutTime:   time.Now().AddDate(0, -1, 0).Add(12 * time.Hour + 30*time.Minute),
                },
            }
            sampleLogs = append(sampleLogs, moreLogs...)
        }

        for _, log := range sampleLogs {
            var existing entity.AttendanceLog
            result := db.Where("registration_id = ?", log.RegistrationID).First(&existing)
            if result.Error != nil {
                db.Create(&log)
            }
        }
    }

    fmt.Println("Attendance logs setup completed")
}

// Setup รีวิวกิจกรรม
func setupActivityReviews() {
	// Get all attended registrations for finished activities
	var attendedRegistrations []entity.ActivityRegistration
	db.Joins("JOIN activity_registration_statuses ON activity_registrations.status_id = activity_registration_statuses.id").
		Joins("JOIN activities ON activity_registrations.activity_id = activities.id").
		Joins("JOIN activity_statuses ON activities.status_id = activity_statuses.id").
		Where("activity_registration_statuses.name = ? AND activity_statuses.name = ?", "attended", "finished").
		Find(&attendedRegistrations)

	if len(attendedRegistrations) == 0 {
		fmt.Println("No attended registrations found for finished activities")
		return
	}

	// Sample reviews with variety of ratings and comments
	sampleReviews := []entity.ActivityReview{
		// Excellent reviews (5 stars)
		{
			Rating:  5,
			Comment: "กิจกรรมดีเยี่ยม! ได้ความรู้มากมาย วิทยากรมีประสบการณ์และสอนได้เข้าใจง่าย แนะนำให้เพื่อนๆ เข้าร่วม",
		},
		{
			Rating:  5,
			Comment: "ประทับใจมาก กิจกรรมจัดได้อย่างมีคุณภาพ เนื้อหาน่าสนใจและเป็นประโยชน์ต่อการเรียน",
		},
		{
			Rating:  5,
			Comment: "สุดยอด! เป็นกิจกรรมที่ให้ความรู้และความสนุกไปพร้อมกัน จัดการได้ดีมาก",
		},
		{
			Rating:  5,
			Comment: "เกินคาดหวัง! ทั้งความรู้และประสบการณ์ที่ได้รับ ขอบคุณทีมงานที่จัดกิจกรรมดีๆ แบบนี้",
		},
		{
			Rating:  5,
			Comment: "กิจกรรมที่ยอดเยี่ยม ได้ทั้งความรู้และมิตรภาพใหม่ๆ อยากให้มีกิจกรรมแบบนี้อีก",
		},

		// Very good reviews (4 stars)
		{
			Rating:  4,
			Comment: "กิจกรรมดี แต่เวลาค่อนข้างจำกัด อยากให้เพิ่มเวลาในการทำ workshop มากกว่านี้",
		},
		{
			Rating:  4,
			Comment: "โดยรวมดี เนื้อหาน่าสนใจ แต่สถานที่จัดกิจกรรมแคบไปหน่อย",
		},
		{
			Rating:  4,
			Comment: "ได้ความรู้เยอะ วิทยากรดี แต่อาหารและเครื่องดื่มน้อยไปหน่อย",
		},
		{
			Rating:  4,
			Comment: "กิจกรรมสนุกดี แต่การลงทะเบียนมีปัญหาเล็กน้อย หวังว่าครั้งหน้าจะดีขึ้น",
		},
		{
			Rating:  4,
			Comment: "ชอบมาก! เป็นประสบการณ์ที่ดี แต่อุปกรณ์บางอย่างยังไม่เพียงพอ",
		},
		{
			Rating:  4,
			Comment: "กิจกรรมมีประโยชน์ วิทยากรให้ความรู้ดี แต่เสียงไมค์มีปัญหาบ้าง",
		},
		{
			Rating:  4,
			Comment: "โอเค ได้ความรู้ใหม่ๆ แต่การจัดกิจกรรมยังไม่ smooth มากนัก",
		},

		// Good reviews (3 stars)
		{
			Rating:  3,
			Comment: "กิจกรรมโอเค แต่เนื้อหาบางส่วนยากเกินไป อยากให้อธิบายละเอียดกว่านี้",
		},
		{
			Rating:  3,
			Comment: "ได้ความรู้บ้าง แต่การจัดการเรื่องเวลายังไม่ดีพอ มาสายและจบช้า",
		},
		{
			Rating:  3,
			Comment: "ปกติ ไม่โดดเด่นมากนัก แต่ก็ไม่แย่ อาจจะปรับปรุงให้น่าสนใจกว่านี้",
		},
		{
			Rating:  3,
			Comment: "เนื้อหาดี แต่การนำเสนอค่อนข้างน่าเบื่อ อยากให้มี interactive มากกว่านี้",
		},
		{
			Rating:  3,
			Comment: "กิจกรรมโอเค แต่คิดว่าราคาค่าสมัครแพงเกินไปสำหรับสิ่งที่ได้รับ",
		},

		// Fair reviews (2 stars)
		{
			Rating:  2,
			Comment: "ไม่ค่อยประทับใจ เนื้อหาไม่ตรงกับที่โฆษณาไว้ และการจัดการไม่ดี",
		},
		{
			Rating:  2,
			Comment: "กิจกรรมไม่ค่อยเป็นระบบ วิทยากรมาสาย และเนื้อหาตื้นเกินไป",
		},
		{
			Rating:  2,
			Comment: "ผิดหวัง การเตรียมการไม่ดี อุปกรณ์ขัดข้อง และพื้นที่คับแคบ",
		},

		// Poor review (1 star)
		{
			Rating:  1,
			Comment: "แย่มาก! เสียเวลา วิทยากรไม่มีประสบการณ์ และการจัดการแย่ที่สุด",
		},
	}

	// Randomly assign reviews to attended registrations
	reviewIndex := 0
	createdCount := 0
	skippedCount := 0

	for _, registration := range attendedRegistrations {
		// Check if review already exists
		var existing entity.ActivityReview
		result := db.Where("activity_id = ? AND user_id = ?", 
			registration.ActivityID, registration.UserID).First(&existing)
		
		if result.Error != nil { // Review doesn't exist, create new one
			if reviewIndex < len(sampleReviews) {
				review := sampleReviews[reviewIndex]
				review.ActivityID = registration.ActivityID
				review.UserID = registration.UserID
				
				// Set random created date within the last 30 days after activity ended
				daysAgo := rand.Intn(30) + 1
				review.CreatedAt = time.Now().AddDate(0, 0, -daysAgo)
				
				err := db.Create(&review).Error
				if err != nil {
					fmt.Printf("Error creating review for Activity ID %d, User ID %d: %v\n", 
						registration.ActivityID, registration.UserID, err)
				} else {
					createdCount++
				}
				
				reviewIndex++
				// Reset index if we've used all sample reviews
				if reviewIndex >= len(sampleReviews) {
					reviewIndex = 0
				}
			}
		} else {
			skippedCount++
		}
	}

	fmt.Printf("Activity reviews setup completed: %d created, %d skipped (already exists)\n", 
		createdCount, skippedCount)
}

// Setup การแจ้งเตือนสำหรับ user ทั้งหมดในระบบ
func setupNotifications() {
	rand.Seed(time.Now().UnixNano())

	// ดึง user ทั้งหมดแยกตาม role
	var students []entity.User
	db.Joins("JOIN roles ON users.role_id = roles.id").
		Where("roles.role_name = ?", "student").
		Find(&students)

	var clubAdmins []entity.User
	db.Joins("JOIN roles ON users.role_id = roles.id").
		Where("roles.role_name = ?", "club_admin").
		Find(&clubAdmins)

	var adminUsers []entity.User
	db.Joins("JOIN roles ON users.role_id = roles.id").
		Where("roles.role_name = ?", "admin").
		Find(&adminUsers)

	// ดึงกิจกรรมทั้งหมด
	var activities []entity.Activity
	db.Find(&activities)

	if len(activities) == 0 {
		fmt.Println("ไม่มีกิจกรรมในระบบ กรุณาสร้างกิจกรรมก่อน")
		return
	}

	var notifications []entity.Notification

	// --- Notification Templates ---
	studentMessages := []struct {
		message string
		msgType string
		isRead  bool
		daysAgo int
	}{
		{"การลงทะเบียนกิจกรรมสำเร็จแล้ว", "registration", true, 5},
		{"กิจกรรมจะเริ่มในอีก 1 วัน", "reminder", false, 1},
		{"คุณได้รับการอนุมัติชั่วโมงกิจกรรม 3 ชั่วโมง", "hour_approved", false, 2},
		{"มีกิจกรรมใหม่ที่น่าสนใจ", "new_activity", false, 3},
		{"กรุณาเข้าร่วมกิจกรรมที่ลงทะเบียนไว้", "attendance_reminder", true, 7},
		{"การเข้าร่วมกิจกรรมของคุณได้รับการยืนยันแล้ว", "attendance_confirmed", true, 4},
		{"คุณได้รับชั่วโมงกิจกรรม 2 ชั่วโมง", "hour_awarded", false, 1},
		{"อย่าลืมนำเอกสารมาในวันกิจกรรม", "document_reminder", false, 2},
		{"กิจกรรมถูกเลื่อนเวลา กรุณาตรวจสอบรายละเอียด", "schedule_change", false, 1},
		{"ขอบคุณที่เข้าร่วมกิจกรรม", "thank_you", true, 3},
	}

	clubAdminMessages := []struct {
		message string
		msgType string
		isRead  bool
		daysAgo int
	}{
		{"คุณมีคำขอเข้าร่วมกิจกรรมใหม่ กรุณาตรวจสอบ", "approval_request", false, 1},
		{"กิจกรรมของคุณมีผู้สมัครเข้าร่วม 15 คน", "registration_update", false, 2},
		{"กรุณาอัปเดตรายละเอียดกิจกรรม", "activity_update_request", false, 3},
		{"การอนุมัติกิจกรรมของคุณสำเร็จแล้ว", "activity_approved", true, 5},
		{"มีนักเรียนยกเลิกการเข้าร่วมกิจกรรม", "cancellation_notice", false, 1},
		{"กรุณาส่งรายงานหลังกิจกรรม", "report_request", false, 4},
		{"กิจกรรมของคุณได้รับความนิยมสูง", "popular_activity", true, 6},
		{"อย่าลืมเตรียมอุปกรณ์สำหรับกิจกรรม", "equipment_reminder", false, 2},
		{"มีข้อเสนอแนะใหม่สำหรับกิจกรรม", "feedback_received", false, 3},
		{"กิจกรรมของคุณครบจำนวนผู้เข้าร่วมแล้ว", "full_capacity", true, 7},
	}

	adminMessages := []struct {
		message string
		msgType string
		isRead  bool
		daysAgo int
	}{
		{"ระบบมีผู้ใช้งานใหม่ 5 คน", "system_update", false, 1},
		{"มีกิจกรรมรอการอนุมัติ 3 รายการ", "pending_approval", false, 2},
		{"การใช้งานระบบเพิ่มขึ้น 25%", "usage_report", true, 3},
		{"กรุณาตรวจสอบกิจกรรมที่ผิดนโยบาย", "policy_violation", false, 1},
		{"สรุปรายงานประจำสัปดาห์พร้อมแล้ว", "weekly_report", true, 7},
		{"มีข้อร้องเรียนจากนักเรียน", "complaint_received", false, 2},
		{"ระบบได้รับการอัปเดตเรียบร้อยแล้ว", "system_maintenance", true, 5},
		{"กรุณาตรวจสอบการตั้งค่าความปลอดภัย", "security_check", false, 4},
		{"มีชมรมใหม่ขอการอนุมัติ", "new_club_request", false, 3},
		{"รายงานการใช้งานประจำเดือนพร้อมแล้ว", "monthly_report", true, 30},
	}

	// --- สร้าง Notification สำหรับนักเรียน ---
	for _, student := range students {
		// สุ่มจำนวน notification สำหรับแต่ละคน (2-4 รายการ)
		numNotifs := rand.Intn(3) + 2
		
		for j := 0; j < numNotifs; j++ {
			msgTemplate := studentMessages[rand.Intn(len(studentMessages))]
			activityIndex := rand.Intn(len(activities))
			
			var message string
			switch msgTemplate.msgType {
			case "registration", "reminder", "attendance_reminder":
				message = msgTemplate.message + " '" + activities[activityIndex].Title + "'"
			case "new_activity":
				message = msgTemplate.message + ": " + activities[activityIndex].Title
			default:
				message = msgTemplate.message
			}

			notifications = append(notifications, entity.Notification{
				UserID:    student.ID,
				Message:   message,
				Type:      msgTemplate.msgType,
				IsRead:    msgTemplate.isRead && rand.Float32() > 0.3, // 70% chance to keep original read status
				CreatedAt: time.Now().AddDate(0, 0, -msgTemplate.daysAgo-rand.Intn(3)),
			})
		}
	}

	// --- สร้าง Notification สำหรับ Club Admin ---
	for _, admin := range clubAdmins {
		// สุ่มจำนวน notification สำหรับแต่ละคน (3-5 รายการ)
		numNotifs := rand.Intn(3) + 3
		
		for j := 0; j < numNotifs; j++ {
			msgTemplate := clubAdminMessages[rand.Intn(len(clubAdminMessages))]
			activityIndex := rand.Intn(len(activities))
			
			var message string
			switch msgTemplate.msgType {
			case "approval_request", "registration_update", "cancellation_notice":
				message = msgTemplate.message + " '" + activities[activityIndex].Title + "'"
			case "activity_update_request":
				message = msgTemplate.message + " '" + activities[activityIndex].Title + "'"
			default:
				message = msgTemplate.message
			}

			notifications = append(notifications, entity.Notification{
				UserID:    admin.ID,
				Message:   message,
				Type:      msgTemplate.msgType,
				IsRead:    msgTemplate.isRead && rand.Float32() > 0.4, // 60% chance to keep original read status
				CreatedAt: time.Now().AddDate(0, 0, -msgTemplate.daysAgo-rand.Intn(2)),
			})
		}
	}

	// --- สร้าง Notification สำหรับ Admin ---
	for _, admin := range adminUsers {
		// สุ่มจำนวน notification สำหรับแต่ละคน (4-6 รายการ)
		numNotifs := rand.Intn(3) + 4
		
		for j := 0; j < numNotifs; j++ {
			msgTemplate := adminMessages[rand.Intn(len(adminMessages))]
			
			notifications = append(notifications, entity.Notification{
				UserID:    admin.ID,
				Message:   msgTemplate.message,
				Type:      msgTemplate.msgType,
				IsRead:    msgTemplate.isRead && rand.Float32() > 0.5, // 50% chance to keep original read status
				CreatedAt: time.Now().AddDate(0, 0, -msgTemplate.daysAgo-rand.Intn(3)),
			})
		}
	}

	// --- สร้าง Notification พิเศษสำหรับ Martin (B6525279) ---
	var martinUser entity.User
	db.Where("student_id = ?", "B6525279").First(&martinUser)
	
	if martinUser.ID != 0 {
		specialNotifications := []entity.Notification{
			{
				UserID:    martinUser.ID,
				Message:   "ยินดีต้อนรับสู่ระบบกิจกรรมนักศึกษา!",
				Type:      "welcome",
				IsRead:    true,
				CreatedAt: time.Now().AddDate(0, 0, -10),
			},
			{
				UserID:    martinUser.ID,
				Message:   "คุณได้รับการอนุมัติชั่วโมงกิจกรรม 5 ชั่วโมง",
				Type:      "hour_approved",
				IsRead:    false,
				CreatedAt: time.Now().AddDate(0, 0, -1),
			},
			{
				UserID:    martinUser.ID,
				Message:   "อย่าลืมเข้าร่วมกิจกรรม 'Workshop เทคโนโลยี AI' วันพรุ่งนี้",
				Type:      "reminder",
				IsRead:    false,
				CreatedAt: time.Now().Add(-12 * time.Hour),
			},
		}
		
		notifications = append(notifications, specialNotifications...)
	}

	// --- บันทึกลง Database ---
	for _, notification := range notifications {
		db.Create(&notification)
	}

	fmt.Printf("Notifications setup completed!\n")
	fmt.Printf("- Students: %d users, %d notifications\n", len(students), len(students)*3)
	fmt.Printf("- Club Admins: %d users, %d notifications\n", len(clubAdmins), len(clubAdmins)*4)
	fmt.Printf("- System Admins: %d users, %d notifications\n", len(adminUsers), len(adminUsers)*5)
	fmt.Printf("- Special notifications for Martin: 3\n")
	fmt.Printf("Total notifications created: %d\n", len(notifications))
}


// Setup การอัปโหลดสื่อ
func setupMediaUploads() {
    var activities []entity.Activity
    db.Find(&activities)

    if len(activities) > 0 {
        sampleUploads := []entity.MediaUpload{
            {
                ActivityID: activities[0].ID,
                MediaType:  "image",
                URL:        "/uploads/activities/workshop_photo_1.jpg",
                UploadedAt: time.Now().AddDate(0, 0, -1),
            },
            {
                ActivityID: activities[0].ID,
                MediaType:  "image",
                URL:        "/uploads/activities/workshop_photo_2.jpg",
                UploadedAt: time.Now().AddDate(0, 0, -1),
            },
            {
                ActivityID: activities[0].ID,
                MediaType:  "video",
                URL:        "/uploads/activities/workshop_video.mp4",
                UploadedAt: time.Now().AddDate(0, 0, -1),
            },
        }

        if len(activities) > 1 {
            moreUploads := []entity.MediaUpload{
                {
                    ActivityID: activities[1].ID,
                    MediaType:  "image",
                    URL:        "/uploads/activities/football_match_1.jpg",
                    UploadedAt: time.Now().AddDate(0, 0, -2),
                },
                {
                    ActivityID: activities[1].ID,
                    MediaType:  "image",
                    URL:        "/uploads/activities/football_match_2.jpg",
                    UploadedAt: time.Now().AddDate(0, 0, -2),
                },
            }
            sampleUploads = append(sampleUploads, moreUploads...)
        }

        for _, upload := range sampleUploads {
            var existing entity.MediaUpload
            result := db.Where("activity_id = ? AND url = ?", 
                upload.ActivityID, upload.URL).First(&existing)
            if result.Error != nil {
                db.Create(&upload)
            }
        }
    }

    fmt.Println("Media uploads setup completed")
}

// Setup ประกาศของชมรม
func setupClubAnnouncements() {
    var clubs []entity.Club
    db.Where("status_id IN (SELECT id FROM club_statuses WHERE name = 'approved')").
        Find(&clubs)

    if len(clubs) > 0 {
        sampleAnnouncements := []entity.ClubAnnouncement{
            {
                ClubID:    clubs[0].ID, // ชมรมฟุตบอล
                Title:     "เปิดรับสมัครสมาชิกใหม่",
                Content:   "ชมรมฟุตบอลเปิดรับสมัครสมาชิกใหม่ สำหรับนักศึกษาที่สนใจเล่นฟุตบอล มีการฝึกซ้อมทุกวันอังคาร-พฤหัสบดี เวลา 16:00-18:00 น. ติดต่อสอบถามได้ที่ประธานชมรม",
                CreatedAt: time.Now().AddDate(0, 0, -5),
            },
            {
                ClubID:    clubs[0].ID, // ชมรมฟุตบอล
                Title:     "การแข่งขันฟุตบอลระหว่างคณะ",
                Content:   "ขอเชิญชวนนักศึกษาทุกคนมาเชียร์การแข่งขันฟุตบอลระหว่างคณะ วันที่ 15-17 มีนาคม 2567 ณ สนามกีฬามหาวิทยาลัย",
                CreatedAt: time.Now().AddDate(0, 0, -10),
            },
        }

        if len(clubs) > 5 { // ชมรมคอมพิวเตอร์
            techAnnouncements := []entity.ClubAnnouncement{
                {
                    ClubID:    clubs[5].ID, // ชมรมคอมพิวเตอร์
                    Title:     "Workshop การเขียนโปรแกรม Python",
                    Content:   "ชมรมคอมพิวเตอร์จัดอบรม Python Programming เบื้องต้น วันที่ 20 มีนาคม 2567 เวลา 13:00-16:00 น. ห้อง Lab คอมพิวเตอร์ อาคาร 40 ชั้น 3 ฟรี! สำหรับสมาชิก 50 บาท สำหรับบุคคลทั่วไป",
                    CreatedAt: time.Now().AddDate(0, 0, -3),
                },
                {
                    ClubID:    clubs[5].ID, // ชมรมคอมพิวเตอร์
                    Title:     "ประชุมสมาชิกประจำเดือน",
                    Content:   "เชิญสมาชิกทุกคนเข้าร่วมประชุมประจำเดือน วันที่ 25 มีนาคม 2567 เวลา 18:00 น. ห้องประชุม 401 อาคาร 40 เพื่อวางแผนกิจกรรมในเดือนหน้า",
                    CreatedAt: time.Now().AddDate(0, 0, -1),
                },
            }
            sampleAnnouncements = append(sampleAnnouncements, techAnnouncements...)
        }

        if len(clubs) > 10 { // ชมรมดนตรีสากล
            musicAnnouncements := []entity.ClubAnnouncement{
                {
                    ClubID:    clubs[10].ID, // ชมรมดนตรีสากล
                    Title:     "คอนเสิร์ตประจำปี 2567",
                    Content:   "ขอเชิญชมการแสดงคอนเสิร์ตประจำปีของชมรมดนตรีสากล วันที่ 30 มีนาคม 2567 เวลา 19:00 น. ณ หอประชุมใหญ่ มทส. เข้าชมฟรี!",
                    CreatedAt: time.Now().AddDate(0, 0, -7),
                },
            }
            sampleAnnouncements = append(sampleAnnouncements, musicAnnouncements...)
        }

        for _, announcement := range sampleAnnouncements {
            var existing entity.ClubAnnouncement
            result := db.Where("club_id = ? AND title = ?", 
                announcement.ClubID, announcement.Title).First(&existing)
            if result.Error != nil {
                db.Create(&announcement)
            }
        }
    }

    fmt.Println("Club announcements setup completed")
}


// generatePDFReport creates a PDF report with the given parameters
func generatePDFReport(filePath, reportName, reportType string, userID uint) error {
    pdf := gofpdf.New("P", "mm", "A4", "")
    pdf.SetTitle(reportName, false)
    pdf.AddPage()
    
    // Header
    pdf.SetFont("Arial", "B", 20)
    pdf.Cell(0, 15, "CEMS Activity Report")
    pdf.Ln(20)
    
    // Report Info
    pdf.SetFont("Arial", "B", 14)
    pdf.Cell(0, 10, reportName)
    pdf.Ln(15)
    
    pdf.SetFont("Arial", "", 12)
    pdf.Cell(0, 8, fmt.Sprintf("Report Type: %s", strings.Title(strings.ReplaceAll(reportType, "_", " "))))
    pdf.Ln(8)
    pdf.Cell(0, 8, fmt.Sprintf("User ID: %d", userID))
    pdf.Ln(8)
    pdf.Cell(0, 8, fmt.Sprintf("Generated on: %s", time.Now().Format("January 2, 2006 at 15:04")))
    pdf.Ln(15)
    
    // Content based on report type
    pdf.SetFont("Arial", "B", 12)
    switch reportType {
    case "participation":
        pdf.Cell(0, 10, "Participation Summary")
        pdf.Ln(12)
        pdf.SetFont("Arial", "", 10)
        pdf.Cell(0, 6, "This report contains detailed participation statistics for activities.")
        pdf.Ln(6)
        pdf.Cell(0, 6, "• Total activities participated")
        pdf.Ln(6)
        pdf.Cell(0, 6, "• Hours of participation")
        pdf.Ln(6)
        pdf.Cell(0, 6, "• Participation trends over time")
        
    case "hours":
        pdf.Cell(0, 10, "Activity Hours Summary")
        pdf.Ln(12)
        pdf.SetFont("Arial", "", 10)
        pdf.Cell(0, 6, "This report contains detailed activity hours breakdown.")
        pdf.Ln(6)
        pdf.Cell(0, 6, "• Total verified hours")
        pdf.Ln(6)
        pdf.Cell(0, 6, "• Hours by category")
        pdf.Ln(6)
        pdf.Cell(0, 6, "• Monthly hours distribution")
        
    case "evaluation":
        pdf.Cell(0, 10, "Activity Evaluation Report")
        pdf.Ln(12)
        pdf.SetFont("Arial", "", 10)
        pdf.Cell(0, 6, "This report contains activity evaluation and feedback data.")
        pdf.Ln(6)
        pdf.Cell(0, 6, "• Average ratings")
        pdf.Ln(6)
        pdf.Cell(0, 6, "• Feedback analysis")
        pdf.Ln(6)
        pdf.Cell(0, 6, "• Improvement recommendations")
        
    case "summary":
        pdf.Cell(0, 10, "Comprehensive Activity Summary")
        pdf.Ln(12)
        pdf.SetFont("Arial", "", 10)
        pdf.Cell(0, 6, "This report contains a comprehensive overview of all activities.")
        pdf.Ln(6)
        pdf.Cell(0, 6, "• Overall statistics")
        pdf.Ln(6)
        pdf.Cell(0, 6, "• Key performance indicators")
        pdf.Ln(6)
        pdf.Cell(0, 6, "• Executive summary")
        
    default:
        pdf.Cell(0, 10, "General Report")
        pdf.Ln(12)
        pdf.SetFont("Arial", "", 10)
        pdf.Cell(0, 6, "This is a general activity report.")
    }
    
    // Footer
    pdf.Ln(20)
    pdf.SetFont("Arial", "I", 8)
    pdf.Cell(0, 5, "Generated by CEMS (Community Engagement Management System)")
    
    return pdf.OutputFileAndClose(filePath)
}

// createReportDirectories creates all necessary directories for reports
func createReportDirectories() error {
    baseDir := "reports"
    reportTypes := []string{"participation", "hours", "evaluation", "summary"}
    
    // Create base directory
    if err := os.MkdirAll(baseDir, 0755); err != nil {
        return fmt.Errorf("failed to create base reports directory: %v", err)
    }
    
    // Create subdirectories for each report type
    for _, reportType := range reportTypes {
        dir := filepath.Join(baseDir, reportType)
        if err := os.MkdirAll(dir, 0755); err != nil {
            return fmt.Errorf("failed to create %s directory: %v", reportType, err)
        }
        fmt.Printf("Created directory: %s\n", dir)
    }
    
    fmt.Println("All report directories created successfully!")
    return nil
}

// setupActivityReports creates demo reports for all types and statuses
func setupActivityReports() error {
    // First, create all necessary directories
    if err := createReportDirectories(); err != nil {
        return fmt.Errorf("failed to create report directories: %v", err)
    }
    
    // Get admin user
    var adminUser entity.User
    if err := db.Joins("JOIN roles ON users.role_id = roles.id").
        Where("roles.role_name = ?", "admin").
        First(&adminUser).Error; err != nil {
        return fmt.Errorf("failed to find admin user: %v", err)
    }
    
    now := time.Now()
    timestamp := now.Format("20060102150405")
    
    // Define report types and statuses
    reportTypes := []string{"participation", "hours", "evaluation", "summary"}
    statuses := []string{"completed", "processing", "error", "pending"}
    
    var reports []entity.ActivityReport
    
    // Create reports for each type and status combination
    for _, reportType := range reportTypes {
        for _, status := range statuses {
            reportName := fmt.Sprintf("%s Report [%s] - Admin %d", 
                strings.Title(strings.ReplaceAll(reportType, "_", " ")), 
                strings.Title(status), 
                adminUser.ID)
            
            filename := fmt.Sprintf("%s_report_%s_%d_%s.pdf", 
                reportType, status, adminUser.ID, timestamp)
            
            report := entity.ActivityReport{
                Name:        reportName,
                UserID:      adminUser.ID,
                Type:        reportType,
                FileURL:     filename,
                Status:      status,
                GeneratedAt: now,
            }
            
            reports = append(reports, report)
        }
    }
    
    // Create all reports in database and generate PDF files
    for _, report := range reports {
        // Determine the correct directory based on report type
        reportDir := filepath.Join("reports", report.Type)
        filePath := filepath.Join(reportDir, report.FileURL)
        
        if report.Status == "completed" {
            // Generate actual PDF for completed reports
            err := generatePDFReport(filePath, report.Name, report.Type, report.UserID)
            if err != nil {
                fmt.Printf("Error generating PDF for %s: %v\n", report.Name, err)
                // Create placeholder file instead
                placeholderContent := fmt.Sprintf("PDF generation failed for %s report", report.Type)
                os.WriteFile(filePath, []byte(placeholderContent), 0644)
            } else {
                fmt.Printf("Generated PDF: %s\n", filePath)
            }
        } else {
            // Create placeholder files for non-completed reports
            var placeholderContent string
            switch report.Status {
            case "processing":
                placeholderContent = fmt.Sprintf("Report is being processed... Please wait.\nReport Type: %s\nUser ID: %d", report.Type, report.UserID)
            case "error":
                placeholderContent = fmt.Sprintf("Error occurred while generating report.\nReport Type: %s\nUser ID: %d\nPlease contact administrator.", report.Type, report.UserID)
            case "pending":
                placeholderContent = fmt.Sprintf("Report is pending approval.\nReport Type: %s\nUser ID: %d", report.Type, report.UserID)
            default:
                placeholderContent = fmt.Sprintf("Report not available.\nReport Type: %s\nUser ID: %d", report.Type, report.UserID)
            }
            
            err := os.WriteFile(filePath, []byte(placeholderContent), 0644)
            if err != nil {
                fmt.Printf("Error creating placeholder file for %s: %v\n", report.Name, err)
            } else {
                fmt.Printf("Created placeholder: %s\n", filePath)
            }
        }
        
        // Save report to database
        if err := db.Create(&report).Error; err != nil {
            fmt.Printf("Error saving report to database: %v\n", err)
            continue
        }
        
        fmt.Printf("Created report: %s (Status: %s)\n", report.Name, report.Status)
    }
    
    fmt.Printf("\nSetup completed successfully!\n")
    fmt.Printf("Created %d demo reports across %d types with %d different statuses\n", 
        len(reports), len(reportTypes), len(statuses))
    
    // Print directory structure
    fmt.Println("\nReport directory structure:")
    fmt.Println("reports/")
    for _, reportType := range reportTypes {
        fmt.Printf("├── %s/\n", reportType)
        
        // List files in each directory
        dir := filepath.Join("reports", reportType)
        files, err := os.ReadDir(dir)
        if err == nil {
            for i, file := range files {
                if i == len(files)-1 {
                    fmt.Printf("│   └── %s\n", file.Name())
                } else {
                    fmt.Printf("│   ├── %s\n", file.Name())
                }
            }
        }
    }
    
    return nil
}

// CleanupReports removes all report files and directories (useful for testing)
func CleanupReports(db *gorm.DB) error {
    // Remove all reports from database
    if err := db.Where("1 = 1").Delete(&entity.ActivityReport{}).Error; err != nil {
        return fmt.Errorf("failed to delete reports from database: %v", err)
    }
    
    // Remove reports directory
    if err := os.RemoveAll("reports"); err != nil {
        return fmt.Errorf("failed to remove reports directory: %v", err)
    }
    
    fmt.Println("All reports cleaned up successfully!")
    return nil
}

// GetReportStats returns statistics about reports
func GetReportStats(db *gorm.DB) (map[string]interface{}, error) {
    stats := make(map[string]interface{})
    
    // Total reports
    var totalReports int64
    db.Model(&entity.ActivityReport{}).Count(&totalReports)
    stats["total_reports"] = totalReports
    
    // Reports by type
    var typeStats []struct {
        Type  string `json:"type"`
        Count int64  `json:"count"`
    }
    db.Model(&entity.ActivityReport{}).
        Select("type, count(*) as count").
        Group("type").
        Scan(&typeStats)
    stats["by_type"] = typeStats
    
    // Reports by status
    var statusStats []struct {
        Status string `json:"status"`
        Count  int64  `json:"count"`
    }
    db.Model(&entity.ActivityReport{}).
        Select("status, count(*) as count").
        Group("status").
        Scan(&statusStats)
    stats["by_status"] = statusStats
    
    // Recent reports (last 7 days)
    var recentReports int64
    sevenDaysAgo := time.Now().AddDate(0, 0, -7)
    db.Model(&entity.ActivityReport{}).
        Where("generated_at >= ?", sevenDaysAgo).
        Count(&recentReports)
    stats["recent_reports"] = recentReports
    
    return stats, nil
}