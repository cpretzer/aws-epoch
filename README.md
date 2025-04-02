# Overview

`aws-epoch` is a sample application that confiugures and deploys AWS infrastructure 
to demonstrate the infrastructure engineering concepts listed below. For the
purposes of this repository, you can use `infrastructure engineering` interchangeably
with `DevOps`, `SRE`, and `Platform Engineering`.
- Automation
- Repeatability
- Preserving the integrity of existing infrastructure created by running this code
- Security (protecting API tokens and secrets)

The code in `main.go` runs a simple http server provided by `net/http` (TODO: LINK) that 
that responds to `GET` requests and outputs the current epoch time at which the
reqeust was handled

## Prerequisites
- AWS account and user
- 

## Building

### MAKEFILE
- describe the makefile and its subcommands
-- build
-- test
-- lint

### Docker
-- describe how to build a docker image with the Dockerfile

## Tests
-- describe how to run tests on the golang code as well as the infrastructure code

## git actions