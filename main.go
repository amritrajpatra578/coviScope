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

// TimeseriesData represents the structure for timeseries data
type TimeseriesData struct {
	Date  time.Time `json:"date"`
	Value int64     `json:"value"`
}

// CoviScopeRes represents the structure for JSON responses
type CoviScopeRes struct {
	Data  []TimeseriesData `json:"data,omitempty"`
	Error string           `json:"error,omitempty"`
}

type CoviScopeReq struct {
	StartDate       string   `json:"startDate"`
	EndDate         string   `json:"endDate"`
	AggregationFunc string   `json:"aggregationFunc"`
	Matrix          string   `json:"matrix"`
	Countries       []string `json:"countries"`
}

// Connect to ClickHouse datasource
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

// handleTimeseriesData handles the main timeseries endpoint
func handleTimeseriesData(w http.ResponseWriter, r *http.Request) {
	var req CoviScopeReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sendErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := validateParams(req.StartDate, req.EndDate, req.AggregationFunc, req.Matrix); err != nil {
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

	data, err := getTimeseriesData(conn, req.StartDate, req.EndDate, req.AggregationFunc, req.Matrix, req.Countries)
	if err != nil {
		sendErrorResponse(w, http.StatusInternalServerError, "Error fetching data")
		log.Println("failed to fetch data:", err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	if err := json.NewEncoder(w).Encode(CoviScopeRes{Data: data}); err != nil {
		log.Println("failed to encode data:", err)
	}
}

// validateParams checks if required parameters are provided and valid or not
func validateParams(startDate, endDate, aggregationFunc, matrix string) error {
	if startDate == "" || endDate == "" || aggregationFunc == "" || matrix == "" {
		return errors.New("missing required parameters: start_date, end_date, aggregation_func, matrix")
	}

	if _, err := time.Parse("2006-01-02", startDate); err != nil {
		return errors.New("invalid start_date format (expected YYYY-MM-DD)")
	}

	if _, err := time.Parse("2006-01-02", endDate); err != nil {
		return errors.New("invalid end_date format (expected YYYY-MM-DD)")
	}

	validAggregations := map[string]bool{
		"sum": true,
		"avg": true,
		"max": true,
		"min": true,
	}
	if !validAggregations[aggregationFunc] {
		return errors.New("invalid aggregation function name: (expected one of: sum, avg, max, min)")
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

// getTimeseriesQuery builds a SQL query based on the provided parameters.
func getTimeseriesQuery(startDate, endDate string, countries []string, aggregationFunc, matrix string) (string, []interface{}) {
	// Initialize the base query
	query := fmt.Sprintf(`
		SELECT
			toDate(date) AS date,
			%s(%s) AS value
		FROM covid19
		WHERE date BETWEEN ? AND ?
	`, aggregationFunc, matrix)

	// Prepare the arguments
	args := []interface{}{startDate, endDate}

	// If countries are provided, add them to the query
	if len(countries) > 0 {
		// Create placeholders for each country
		placeholders := make([]string, len(countries))
		for i, country := range countries {
			placeholders[i] = "?"        // Create a placeholder for each country
			args = append(args, country) // Add the country to the arguments
		}

		// Add the country filter to the query
		query += fmt.Sprintf(" AND location_key IN (%s)", strings.Join(placeholders, ","))
	}

	// Finish the query with grouping and ordering
	query += `
		GROUP BY date
		ORDER BY date
	`

	return query, args
}

// getTimeseriesData retrieves timeseries data with the specified aggregation and date range
func getTimeseriesData(conn driver.Conn, startDate, endDate, aggregationFunc, matrix string, countries []string) ([]TimeseriesData, error) {
	query, args := getTimeseriesQuery(startDate, endDate, countries, aggregationFunc, matrix)

	rows, err := conn.Query(context.Background(), query, args...)
	if err != nil {
		return nil, fmt.Errorf("query execution error: %w", err)
	}
	defer rows.Close()

	var results []TimeseriesData
	for rows.Next() {
		var data TimeseriesData
		if err := rows.Scan(&data.Date, &data.Value); err != nil {
			return nil, fmt.Errorf("row scan error: %w", err)
		}
		results = append(results, data)
	}

	return results, nil
}

// sendErrorResponse writes error message with status code
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
