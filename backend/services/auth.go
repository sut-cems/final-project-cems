package services

import (
    "errors"
    "time"

    jwt "github.com/golang-jwt/jwt/v4"
)

type JwtWrapper struct {
    SecretKey       string
    Issuer          string
    ExpirationHours int64
}

type JwtClaim struct {
    Email string
    jwt.RegisteredClaims
}

func (j *JwtWrapper) GenerateToken(email string) (signedToken string, err error) {
    claims := &JwtClaim{
        Email: email,
        RegisteredClaims: jwt.RegisteredClaims{
            ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour * time.Duration(j.ExpirationHours))),
            Issuer:    j.Issuer,
            IssuedAt:  jwt.NewNumericDate(time.Now()),
        },
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

    signedToken, err = token.SignedString([]byte(j.SecretKey))
    if err != nil {
        return "", err
    }
    return signedToken, nil
}

func (j *JwtWrapper) ValidateToken(signedToken string) (claims *JwtClaim, err error) {
    token, err := jwt.ParseWithClaims(
        signedToken,
        &JwtClaim{},
        func(token *jwt.Token) (interface{}, error) {
            if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
                return nil, errors.New("unexpected signing method")
            }
            return []byte(j.SecretKey), nil
        },
    )

    if err != nil {
        return nil, err
    }

    claims, ok := token.Claims.(*JwtClaim)
    if !ok || !token.Valid {
        return nil, errors.New("invalid token claims")
    }

    return claims, nil
}
