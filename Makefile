

build-local:
	@echo "Building for Linux..."
	@docker build --platform linux/amd64 -t epoch-time:latest .

test-epoch-time:
	@echo "Running tests..."
	@go test -v ./...