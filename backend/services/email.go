package services

import (
	"bytes"
	"fmt"
	"html/template"
	"net/smtp"
	"os"
	"path/filepath"
)

func RenderTemplate(templateName string, data interface{}) (string, error) {
	tmplPath := filepath.Join("services", "email_template", templateName)
	tmpl, err := template.ParseFiles(tmplPath)

	if err != nil {
		return "", fmt.Errorf("ไม่สามารถโหลด template: %v", err)
	}

	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, data); err != nil {
		return "", fmt.Errorf("render template ผิดพลาด: %v", err)
	}
	return buf.String(), nil
}

func SendEmailHTML(to string, subject string, htmlBody string) error {
	from := os.Getenv("EMAIL_SENDER")
	password := os.Getenv("EMAIL_PASSWORD")

	if from == "" || password == "" {
		return fmt.Errorf("email credentials not set")
	}

	headers := "MIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\n"
	msg := "From: " + from + "\r\n" +
		"To: " + to + "\r\n" +
		"Subject: " + subject + "\r\n" +
		headers + "\r\n" + htmlBody

	err := smtp.SendMail("smtp.gmail.com:587",
		smtp.PlainAuth("", from, password, "smtp.gmail.com"),
		from, []string{to}, []byte(msg))

	return err
}
