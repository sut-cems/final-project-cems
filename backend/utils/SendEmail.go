package utils

import (
	"gopkg.in/gomail.v2"
	"os"
	"fmt"
)

func SendResetEmail(to, link string) error {
	m := gomail.NewMessage()
	from := os.Getenv("SMTP_FROM")
	m.SetHeader("From", from)
	m.SetHeader("To", to)
	m.SetHeader("Subject", "Reset Your Password")
	m.SetBody("text/html", fmt.Sprintf(`
		<h3>คุณได้รับคำขอเปลี่ยนรหัสผ่าน</h3>
		<p>กรุณาคลิกลิงก์ด้านล่างเพื่อเปลี่ยนรหัสผ่าน:</p>
		<a href="%s">%s</a><br><br>
		หากคุณไม่ได้ทำรายการนี้ กรุณาละเว้นอีเมลนี้
	`, link, link))

	d := gomail.NewDialer(
		os.Getenv("SMTP_HOST"),
		587,
		os.Getenv("SMTP_USER"),
		os.Getenv("SMTP_PASSWORD"),
	)

	return d.DialAndSend(m)
}
