pipeline {
    agent any

    tools { nodejs 'NodeJS-22' }

    triggers { githubPush() }
    options  { disableConcurrentBuilds() }

    environment {
        PROJECT_NAME            = 'devops-test'
        BRANCH                  = 'main'
        SITE_HOST               = 'devops-test-doan-xuan-nam-blond.vercel.app'
        NEXT_TELEMETRY_DISABLED = '1'
        VERCEL_TOKEN            = credentials('vercel-token')
        VERCEL_ORG_ID           = credentials('vercel-org-id')
        VERCEL_PROJECT_ID       = credentials('vercel-project-id')
    }

    stages {
        stage('Checkout') {
            steps { checkout scm }
        }
        stage('Install Dependencies') {
            steps {
                sh 'node -v && npm -v'
                sh 'npm ci'
            }
        }
        stage('Build') {
            steps { sh 'npm run build' }
        }
        stage('Deploy') {
            steps { sh 'npx --yes vercel deploy --prod --yes --token "$VERCEL_TOKEN"' }
        }
    }

    post {
        success { echo "BUILD SUCCESS - ${env.PROJECT_NAME} (${env.BRANCH}) - [https://${env.SITE_HOST}](https://${env.SITE_HOST})" }
        failure { echo "BUILD FAILED - ${env.PROJECT_NAME} (${env.BRANCH}) - please check log" }
    }
}
