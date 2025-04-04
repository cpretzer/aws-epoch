# Overview

`aws-epoch` is a sample application that confiugures and deploys AWS infrastructure 
to demonstrate the infrastructure engineering concepts listed below. For the
purposes of this repository, you can use `infrastructure engineering` interchangeably
with `DevOps`, `SRE`, and `Platform Engineering`.
- Automation
- Repeatability
- Preserving the integrity of existing infrastructure created when running this code multiple times
- Security (protecting API tokens and secrets)

The code in `main.go` runs a an HTTP server provided by [net/http](https://pkg.go.dev/net/http) 
that responds to `GET` requests and outputs the current epoch time at which the
request was handled

## Prerequisites

- AWS account and IAM user with the permissions described below 
- docker
- golang version 1.24
- [pulumi](https://www.pulumi.com/registry/packages/aws/installation-configuration/#set-credentials-as-environment-variables)
-- required for executing pulumi scripts locally
-- optional if you are using devcontainers in VSCode (see below)

## Building

### Makefile

The Makefile includes the following commands:

- build-local
  - Uses docker to the epoch-time image using the Dockerfile
- lint (not implemented)
  - ensures all the YAML, TypeScript, and Go files in the repository are
    formatted properly
- run
  - runs the main.go class with debug output enabled
- test-epoch-time
  - Runs go tests in the repository

### Docker

The Dockerfile is a multi-stage build that compiles the Go code in the repository
and copies the compiled executable to a container with reduced privileges.

This code was originally built with a multi-arch docker builder definition. You
may need to adapt the command to run for your particular environment.

Once the image has been built, the container can be run with this command:

`docker run --name epoch-time --rm -p 8080:8080 ghcr.io/cpretzer/epoch-time:<tag>`

### Devcontainers

There is a [devcontainer](https://containers.dev/) definition in this
repository, and this is the easiest way to build and run the code, as well as
deploy the resources to AWS. This requires using VSCode.

See `bin/devcontainer-postcreate.sh` for the tools that are available within
the container.

## Tests

At the time of writing there is one test in `main_test.go` which verifies
the functionality of the `getEpochTime` function in the main.go class.

## Git Actions

Git actions are in the design plan for this repository, but not implemented
today. The design for actions includes:

- running `pulumi preview` for all merge requests and preventing merging if
there are any failures
- an approval pipeline for the main branch that executes `pulumi up`

## Deploying

This repository uses the Pulumi AWS TypeScript template to deploy resources in
AWS to run the code. The resources are:

- An IAM user
- ECS resources to run the image in fargate
  - An ECS cluster
  - TaskDefinition
  - Service
- The networking components required to route traffic to the container
  - ElasticIP
  - VPC
  - Subnet
  - RoutingTable
  - InternetGateway
  - IngressRule

To deploy the resources to AWS, create credentials for an AWS
user. This repository uses [enviroment variables](https://www.pulumi.com/registry/packages/aws/installation-configuration/#set-credentials-as-environment-variables) to store the credentials, and
you can find a template in `infra/.env.sh.tpl`. Copy this template and
populate the placeholders with your credentials, then source the file:

`cp infra/.env.sh.tpl infra/.env.sh`
`source infra/.env.sh`

From within the devcontainer or on a local environment with the pulumi
CLI installed, you can run these commands to preview, deploy, and destroy
the infrastructure

- pulumi preview --diff
- pulumi up
- pulumi down

You may need to run `pulumi init` once to initialize the pulumi configuration.

## Appendix A: AWS Permissions

- Built-In Policies
  - AmazonECS_FullAccess
  - AmazonECSTaskExecutionRolePolicy
  - AmazonS3FullAccess
  - ElasticLoadBalancingFullAccess

- Custom Policy
  - ec2:CreateTags
  - ec2:AllocateAddress 
  - ec2:RevokeSecurityGroupIngress
  - ec2:DeleteInternetGateway
  - ec2:ReleaseAddress
  - ec2:DeleteRouteTable
  - iam:ListPolicies
  - iam:GetPolicy
  - iam:UpdateUser
  - iam:AttachUserPolicy
  - iam:ListEntitiesForPolicy
  - iam:DeleteUserPolicy
  - iam:DeleteUser
  - iam:ListUserPolicies
  - iam:CreateUser
  - iam:RemoveUserFromGroup
  - iam:AddUserToGroup
  - iam:GetUserPolicy
  - iam:ListGroupsForUser
  - iam:PutUserPolicy
  - iam:ListAttachedUserPolicies
  - iam:ListUsers
  - iam:GetUser
  - iam:DetachUserPolicy
  - iam:TagUser
  - iam:GetGroup
  - iam:GetAccount*
  - iam:ListAccount*
  - kms:Decrypt
  - secretsmanager:GetSecretValue