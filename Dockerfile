ARG BUILDPLATFORM=linux/amd64

FROM --platform=$BUILDPLATFORM golang:1.24-alpine AS builder

## compile the epoch service
WORKDIR /build
COPY go.mod go.mod
COPY main.go main.go

RUN CGO_ENABLED=0 GOOS=linux GOARCH=$TARGETARCH go build -o /out/epoch-time -tags prod -mod=readonly -ldflags "-s -w" 

## package runtime
FROM scratch
COPY --from=builder /out/epoch-time /epoch-time

COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

ENTRYPOINT ["/epoch-time"]
EXPOSE 8080