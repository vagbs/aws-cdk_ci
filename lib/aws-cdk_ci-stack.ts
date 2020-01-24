#!/usr/bin/env node
import cdk = require('@aws-cdk/core');
import iam = require('@aws-cdk/aws-iam');
import codebuild = require('@aws-cdk/aws-codebuild');
import codepipeline = require('@aws-cdk/aws-codepipeline');
import codepipeline_actions = require('@aws-cdk/aws-codepipeline-actions');
import ecr = require('@aws-cdk/aws-ecr');

declare global {
  namespace NodeJS {
    export interface ProcessEnv
    {
        AWS_REGION: string
        AWS_ACCOUNT_ID: string
        STAGE: string
        ECR_IMAGE_REPO_NAME: string
        GITHUB_OWNER: string
        GITHUB_REPO: string
        GITHUB_BRANCH: string
        GITHUB_AUTH_TOKEN: string
    }
  }
}

export class AwsCdkCiStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

      const stage = this.node.tryGetContext("stage");
      const app_name = this.node.tryGetContext("app_name");

      // Generate project
      const project = new codebuild.PipelineProject(this, 'project', {
        projectName: app_name + "-" + "project" + "-" + stage,
        environment: {
          privileged: true,
          // Environment variables passed to buildspec.yml
          environmentVariables: {
            AWS_ACCOUNT_ID: {
              type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
              value: process.env.AWS_ACCOUNT_ID,
            },
            AWS_REGION: {
              type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
              value: process.env.AWS_REGION,
            },
            ECR_IMAGE_REPO_NAME: {
              type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
              value: process.env.ECR_IMAGE_REPO_NAME,
            },
          },
        }
      });

      project.addToRolePolicy(new iam.PolicyStatement({
        resources: ['*'],
        actions: ['ecr:GetAuthorizationToken'],
        effect: iam.Effect.ALLOW
      }));
      const ecrRepo =  ecr.Repository.fromRepositoryName(this, 'ExistingEcrRepository', process.env.ECR_IMAGE_REPO_NAME);
      project.addToRolePolicy(new iam.PolicyStatement({
        resources: [ecrRepo.repositoryArn],
        actions: ['ecr:*'],
        effect: iam.Effect.ALLOW
      }));

      const sourceOutput = new codepipeline.Artifact();
  
      // Generate Source Action
      const sourceAction = new codepipeline_actions.GitHubSourceAction ({
          actionName: 'GitHub_Source',
          owner: process.env.GITHUB_OWNER,
          repo: process.env.GITHUB_REPO,
          oauthToken: cdk.SecretValue.plainText(process.env.GITHUB_AUTH_TOKEN),
          output: sourceOutput,
          branch: process.env.GITHUB_BRANCH,
          trigger: codepipeline_actions.GitHubTrigger.POLL
      });

      // Generate Build Action
      const buildAction = new codepipeline_actions.CodeBuildAction({
        actionName: 'CodeBuild',
        project: project,
        input: sourceOutput,
        outputs: [new codepipeline.Artifact()]
      });

      // Generate pipeline
      new codepipeline.Pipeline(this, 'pipeline', {
        pipelineName: app_name + "-" + "pipeline" + "-" + stage,
        stages: [
            {
                stageName: 'Source',
                actions: [
                    sourceAction
                ],
            },
            {
                stageName: 'Build',
                actions: [
                    buildAction
                ],
            }
        ]
    })
  }
}

const app = new cdk.App();
new AwsCdkCiStack(app, 'AwsCdkCiStack');