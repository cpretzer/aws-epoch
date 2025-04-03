package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

// Test the getEpochTime and ensure that it returns a valid date
func TestGetEpochTime(t *testing.T) {
	testStartTime := time.Now().Unix()
	fmt.Printf("Testing getEpochTime function with start time: %d", testStartTime)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/epoch-time", nil)
	w := httptest.NewRecorder()
	getEpochTime(w, req)
	res := w.Result()
	defer res.Body.Close()

	var epochResponse EpochResponse
	err := json.NewDecoder(res.Body).Decode(&epochResponse)
	if err != nil {
		t.Errorf("expected error to be nil got %v", err)
	}

	fmt.Printf("Response: %d", epochResponse.CurrentEpochTime)

	responseEpoch := time.Unix(int64(epochResponse.CurrentEpochTime), 0)

	t.Logf("Test Time: %d, Current time: %d", testStartTime, responseEpoch.Unix())

	if responseEpoch.Unix()-testStartTime > 3 {
		t.Errorf("expected response under three seconds")
	} else {
		t.Logf("Test call time: %d", responseEpoch.Unix()-testStartTime)
	}

}
