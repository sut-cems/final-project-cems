package utils

import (
	"crypto/rand"
	"encoding/hex"
	"golang.org/x/crypto/bcrypt"
	"log"
)

// สร้าง Token ที่ปลอดภัย
func GenerateSecureToken(length int) (string, error) {
	bytes := make([]byte, length)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

// Hash password ด้วย bcrypt
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

// ตรวจสอบ password ว่าตรงกับ hash หรือไม่
func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// Log error แล้ว panic (ใช้สำหรับ util ทั่วไปถ้าต้องการ)
func Must(err error) {
	if err != nil {
		log.Fatal(err)
	}
}
