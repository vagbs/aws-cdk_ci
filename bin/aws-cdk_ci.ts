#!/usr/bin/env node
import cdk = require('@aws-cdk/core');
import { AwsCdkCiStack } from '../lib/aws-cdk_ci-stack';

const app = new cdk.App();
new AwsCdkCiStack(app, 'AwsCdkCiStack');