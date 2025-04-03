# Usage: make [target]
# Targets:
#   build-local: Build the Docker image for local development.
#   test-epoch-time: Run tests for the epoch-time package.


# Use the local docker to build the image
.PHONY: build-local
build-local:
	@echo "Building for Linux..."
	@docker build --platform linux/amd64 -t epoch-time:latest .

# Run the golang tests
.PHONY: test-epoch-time
test-epoch-time:
	@echo "Running tests..."
	@go test -v ./...