package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
	"github.com/gorilla/mux"
)

type TimeseriesData struct {
	Country string    `json:"country"`
	Date    time.Time `json:"date"`
	Value   int64     `json:"value"`
}

// represents the structure for JSON responses
type CoviScopeRes struct {
	Data  []TimeseriesData `json:"data,omitempty"`
	Error string           `json:"error,omitempty"`
}

// represents the structure for JSON request
type CoviScopeReq struct {
	StartDate string   `json:"startDate"`
	EndDate   string   `json:"endDate"`
	Matrix    string   `json:"matrix"`
	Countries []string `json:"countries"`
}

// connecting to clickHouse datasource
func connect() (driver.Conn, error) {
	ctx := context.Background()

	conn, err := clickhouse.Open(&clickhouse.Options{
		Addr: []string{"127.0.0.1:9000"},
		Auth: clickhouse.Auth{
			Database: "default",
			Username: "default",
			Password: "",
		},
		ClientInfo: clickhouse.ClientInfo{
			Products: []struct {
				Name    string
				Version string
			}{
				{
					Name:    "an-example-go-client",
					Version: "0.1",
				},
			},
		},
		Debugf: func(format string, v ...interface{}) {
			fmt.Printf(format, v...)
		},
	})

	if err != nil {
		return nil, fmt.Errorf("failed to connect to ClickHouse: %w", err)
	}

	if err := conn.Ping(ctx); err != nil {
		if exception, ok := err.(*clickhouse.Exception); ok {
			fmt.Printf("exception [%d] %s \n%s\n", exception.Code, exception.Message, exception.StackTrace)
		}
		return nil, fmt.Errorf("ping error: %w", err)
	}

	return conn, nil
}

func handleTimeseriesData(w http.ResponseWriter, r *http.Request) {
	var req CoviScopeReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sendErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}
	if err := validateParams(req.StartDate, req.EndDate, req.Matrix); err != nil {
		sendErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	conn, err := connect()
	if err != nil {
		sendErrorResponse(w, http.StatusInternalServerError, "Database connection error")
		log.Println("database connection error:", err)
		return
	}
	defer conn.Close()

	data, err := getTimeseriesData(conn, req.StartDate, req.EndDate, req.Matrix, req.Countries)
	if err != nil {
		sendErrorResponse(w, http.StatusInternalServerError, "Error fetching data")
		log.Println("Failed to fetch data:", err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(CoviScopeRes{Data: data}); err != nil {
		log.Println("Failed to encode data:", err)
	}
}

// checks if required parameters are provided and valid or not
func validateParams(startDate, endDate, matrix string) error {
	if startDate == "" || endDate == "" || matrix == "" {
		return errors.New("missing required parameters: start_date, end_date, matrix")
	}

	if _, err := time.Parse("2006-01-02", startDate); err != nil {
		return errors.New("invalid start_date format (expected YYYY-MM-DD)")
	}

	if _, err := time.Parse("2006-01-02", endDate); err != nil {
		return errors.New("invalid end_date format (expected YYYY-MM-DD)")
	}

	validColumns := map[string]bool{
		"new_confirmed":        true,
		"new_deceased":         true,
		"cumulative_confirmed": true,
	}
	if !validColumns[matrix] {
		return errors.New("invalid matrix name: (expected one of: new_confirmed, new_deceased, cumulative_confirmed)")
	}

	return nil
}

func getTimeseriesQuery(startDate, endDate string, countries []string, matrix string) (string, []interface{}) {

	args := []interface{}{startDate, endDate}

	query := fmt.Sprintf(`
		SELECT
			location_key AS country,
			toDate(date) AS date,
			sum(%s) AS value
		FROM covid19
		WHERE date BETWEEN ? AND ?
	`, matrix)

	if len(countries) > 0 {
		// filtering by provided countries
		placeholders := make([]string, len(countries))
		for i, country := range countries {
			placeholders[i] = "?"
			args = append(args, country)
		}
		query += fmt.Sprintf(" AND location_key IN (%s)", strings.Join(placeholders, ","))
	} else {
		top10CountriesSubquery := fmt.Sprintf(`
		SELECT location_key
		FROM covid19
		WHERE date BETWEEN ? AND ?
		GROUP BY location_key
		ORDER BY sum(%s) DESC
		LIMIT 10
	`, matrix)
		query += fmt.Sprintf(" AND location_key IN (%s)", top10CountriesSubquery)
		args = append(args, startDate, endDate) // Add startDate and endDate again for the subquery
	}

	// group and order by date and country
	query += " GROUP BY date, country ORDER BY date, country"

	return query, args
}

func getTimeseriesData(conn driver.Conn, startDate, endDate, matrix string, countries []string) ([]TimeseriesData, error) {
	query, args := getTimeseriesQuery(startDate, endDate, countries, matrix)
	rows, err := conn.Query(context.Background(), query, args...)
	if err != nil {
		return nil, fmt.Errorf("query execution error: %w", err)
	}
	defer rows.Close()

	var results []TimeseriesData
	for rows.Next() {
		var data TimeseriesData
		if err := rows.Scan(&data.Country, &data.Date, &data.Value); err != nil {
			return nil, fmt.Errorf("row scan error: %w", err)
		}
		results = append(results, data)
	}

	return results, nil
}

// writes error message with status code
func sendErrorResponse(w http.ResponseWriter, statusCode int, errMessage string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)

	if err := json.NewEncoder(w).Encode(CoviScopeRes{Error: errMessage}); err != nil {
		log.Println("failed to encode err msg:", err)
	}
}

func handleRoutes() http.Handler {
	r := mux.NewRouter()

	r.HandleFunc("/chart", handleTimeseriesData).Methods("POST")
	return r
}

func main() {
	r := handleRoutes()

	log.Println("server started on :8080")

	if err := http.ListenAndServe(":8080", r); err != nil {
		log.Fatal("server exit with error:", err)
	}
}
