aws-cdk_cd
====

Overview

AWS CDKによるCI。
Githubのコードをソースとして、ECRにDockerイメージをpushする。

## Description

AWS CDKで生成されるCIのフローは下記。

1. 対象のGithubリポジトリ/ブランチに `buildspec.yml` を配置。
1. 対象のGithubリポジトリ/ブランチが更新。
1. CodePipelinのPipelineが生成。
1. CodeBuildが対象の `buildspec.yml` を実行。
1. CodeBuildにてECRにDockerイメージがbuild/pushされる。

## Usage

下記環境変数が必要。
[direnv](https://github.com/direnv/direnv)等でAWS CDKに渡す。

```shell
# aws
export AWS_REGION="ap-northeast-1" # 対象ECRのリージョン
export AWS_ACCOUNT_ID="xxxxxxxxxxxx" # 対象ECRのAWSアカウントのID
export ECR_IMAGE_REPO_NAME="xxxxxx" # 対象ECRのリポジトリ名
# github
export GITHUB_OWNER="xxxxxx" # 対象Githubのオーナー
export GITHUB_REPO="xxxxxx" # 対象Githubのリポジトリ
export GITHUB_BRANCH="master" # 対象Githubのブランチ
export GITHUB_AUTH_TOKEN="xxxxxxxxxxxx" # Githubのアクセストークン
```

AWS CDKの実行

```shell
$ git clone https://github.com/vagbs/aws-cdk_cd.git
$ cd aws-cdk_cd
$ npm install @aws-cdk/aws-iam
$ npm install @aws-cdk/aws-codebuild
$ npm install @aws-cdk/aws-codepipeline
$ npm install @aws-cdk/aws-codepipeline-actions
$ npm install @aws-cdk/aws-ecr
$ npm run build
$ cdk deploy
```

CodeBuildのビルドプロジェクト名に使われる `stage` / `app_name`はコンテキストから取得している為、
変更したい場合はデプロイ時にコンテキストを上書きする。

```shell
cdk deploy -c stage=dev -c app_name=foobar
```

## Author

[vagbs](https://github.com/vagbs)
