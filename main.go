package main

import (
	"encoding/json"
	"fmt"
	"log"
	"log/slog"
	"net/http"
	"os"
	"time"
)

// Implement the init() function to ensure that setup for the application is
// well-defined before main() is called
func init() {
	// Set up the logger
	initLogger()
}

// Explicitly defined function to initialize slog to use in place of the default
// log package. This is a matter of preference
func initLogger() {

	// Set the default log level to Info
	logLevel := slog.LevelInfo

	// Check whether the LOG_LEVEL environment variable is set and use it to
	// update the slog level
	logLevelString, isSet := os.LookupEnv("LOG_LEVEL")

	if isSet {
		err := logLevel.UnmarshalText([]byte(logLevelString))

		if err != nil {
			slog.Error("Error unmarshaling log level value", "error", err)
		}
	}

	// Configure the options to create the new slog handler
	opts := &slog.HandlerOptions{
		Level: logLevel,
	}

	// Configure slog to output in JSON with the specified options
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, opts)))
}

// The main function is the entry point of the application. It creates an HTTP
// server using the net/http package and listens for incoming requests on port 8080
// TODO: make the port configurable
func main() {

	http.HandleFunc("/api/v1/epoch", getEpochTime)
	slog.Debug("Listening on port 8080")
	log.Fatal(http.ListenAndServe(":8080", nil))

}

// getEpochTime is an HTTP handler function that responds to requests to the
// /api/v1/epoch endpoint. It uses the time package to get the current system time
// TODO: Add some error handling
func getEpochTime(w http.ResponseWriter, r *http.Request) {

	// initialize the response struct and status code
	response := EpochResponse{}
	statusCode := http.StatusNoContent

	// verify that the request method is GET
	if r.Method == http.MethodGet {
		// create a new EpochResponse struct to hold the current epoch time
		response.CurrentEpochTime = uint(time.Now().Unix())
		slog.Debug("Received request for epoch", "epoch_time", response.CurrentEpochTime)
		statusCode = http.StatusOK
	} else {
		slog.Debug("Received non-GET request", "method", r.Method)
		statusCode = http.StatusMethodNotAllowed
		response.Message = fmt.Sprintf("Unsupported method %s", r.Method)
	}

	// set response headers and send the response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(response)

}

type EpochResponse struct {
	CurrentEpochTime uint   `json:"current_epoch_time"`
	Message          string `json:"msg"`
}
