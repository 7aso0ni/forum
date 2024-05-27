package database

import (
	"database/sql"
	"fmt"
)

func GetUserID(username string) (int, error) {
	var userID int
	err := DB.QueryRow("SELECT id FROM users WHERE username = ?", username).Scan(&userID)
	if err != nil {
		return 0, err
	}
	return userID, nil
}

func GetCategoryID(categoryName string) (int, error) {
	var categoryID int
	row := DB.QueryRow("SELECT id FROM categories WHERE name = ?", categoryName)
	err := row.Scan(&categoryID)
	if err != nil {
		if err == sql.ErrNoRows {
			return 0, fmt.Errorf("category not found: %s", categoryName)
		}
		return 0, fmt.Errorf("failed to retrieve category ID: %v", err)
	}
	return categoryID, nil
}
