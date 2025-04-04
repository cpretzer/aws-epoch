import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const createdBy = "pulumiAutomation";
const deploymentName = "epochService";
const imageVersion = "v0.0.1";
const defaultTags = {
    createdBy,
    deploymentName,
}

// Get cofniguration object and values
const buildConfig = new pulumi.Config();
const awsServiceCidr = buildConfig.require('serviceCidr')

// Create a unique user for this service
// const epochSA = new aws.iam.User("epochSA", {
//     name: "epochSA",
//     path: "/services/",
//     tags: {
//         ...defaultTags,
//     },
// });

// This is an existing IAM group that has permissions specifically for this user
// The definition is in the aws-rolers.json file included in the repo

// const devopsGroup = aws.iam.Group.get("devops", "devops"); 

// const epochSAGroupMembership = new aws.iam.UserGroupMembership("epochSAGroupMembership", {
//     user: epochSA.name,
//     groups: [
//          devopsGroup.name
//     ]
// });

// Create a VPC for the service using the CIDR block from the config
const epochVpc = new aws.ec2.Vpc("epochVpc", {
    cidrBlock: awsServiceCidr,
    tags: {
        ...defaultTags,
    }
});

// Create an ingress rule for the SecurityGroup that allows inbound traffic on 
// port 8080 and associate it with the VPC created above
const inboundIngressRule = new aws.vpc.SecurityGroupIngressRule("epochInboundIngressRule", {
    fromPort: 8080,
    toPort: 8080,
    ipProtocol: "tcp",
    securityGroupId: epochVpc.defaultSecurityGroupId,
    cidrIpv4: "0.0.0.0/0",
    tags: {
        ...defaultTags,
    }
});
    
// Create an internet gateway for the VPC
// Based on the details here: https://aws.amazon.com/ru/blogs/containers/authenticating-with-docker-hub-for-aws-container-services/
const epochInternetGateway = new aws.ec2.InternetGateway("epochInternetGateway", {
    vpcId: epochVpc.id,
    tags: {
        ...defaultTags,
    },
});

// Create a route table for the VPC that allows for public internet access
const routeTable = new aws.ec2.RouteTable("epochRouteTable", {
    vpcId: epochVpc.id,
    routes: [
        {
            cidrBlock: awsServiceCidr,
            gatewayId: "local"
        },
        {
            cidrBlock: "0.0.0.0/0",
            gatewayId: epochInternetGateway.id,
        }
    ],
    tags: {
        ...defaultTags,
    },
});


// Creaet a subnet for the vpcs
const epochSubnet = new aws.ec2.Subnet("epochSubnet", {
    vpcId: epochVpc.id,
    cidrBlock: awsServiceCidr,
    tags: {
        ...defaultTags,
    },
});

// Associate the route table with the subnet within the VPC
const epochSubnetRouteTableAssociation = new aws.ec2.RouteTableAssociation("epochSubnetRouteTableAssociation", {
    subnetId: epochSubnet.id,
    routeTableId: routeTable.id,
});

// Create an ECS cluster
const epochCluster = new aws.ecs.Cluster("epochCluster", {
    name: "epochCluster",
    tags: {
        ...defaultTags
    },
});

// Create the task definition for the service
const epochTaskDefinition = new aws.ecs.TaskDefinition("epochTaskDefinition", {
    family: "epochService",
    networkMode: "awsvpc",
    executionRoleArn: buildConfig.require('taskExecutionRoleArn'),
    requiresCompatibilities: ["FARGATE"],
    memory: "512",
    cpu: "256",
    containerDefinitions: JSON.stringify([{
        name: "epochService",
        image: `ghcr.io/cpretzer/epoch-time:${imageVersion}`,
        essential: true,
        portMappings: [{
            containerPort: 8080,
            hostPort: 8080,
            protocol: "tcp",
        }],
        repositoryCredentials: {
            credentialsParameter: buildConfig.require('ghcrCredentials'),
        },
        environment: [
            {
                name: "ENV",
                value: "production",
            },
            {
                name: "VERSION",
                value: imageVersion,
            },
            {
                name: "DEPLOYMENT_NAME",
                value: "epochService",
            },
            {
                name: "CREATED_BY",
                value: "pulumiAutomation",
            },
            {
                name: "AWS_ACCOUNT_ID",
                value: aws.config.accessKey,
            },
            {
                name: "AWS_DEFAULT_REGION",
                value: aws.config.region,
            }
        ],
    }]),
});

// Create the epoch service in the cluster
const epochService = new aws.ecs.Service("epochService", {
    name: "epochService",
    cluster: epochCluster.arn,
    desiredCount: 1, 
    // iamRole: epochSA.arn,
    launchType: "FARGATE",
    networkConfiguration: {
        assignPublicIp: true,
        securityGroups: [epochVpc.defaultSecurityGroupId],
        subnets: [epochSubnet.id],
    },
    taskDefinition: epochTaskDefinition.arn,
    tags: {
        ...defaultTags,
    },
});

