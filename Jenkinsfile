pipeline {
    agent any

    tools { nodejs 'node22' }

    triggers { githubPush() }
    options  { disableConcurrentBuilds() }

    environment {
        PROJECT_NAME            = 'devops-test'
        BRANCH                  = 'main'
        SITE_URL                = '[https://YOUR-DOMAIN.vercel.app](https://YOUR-DOMAIN.vercel.app)'
        NEXT_TELEMETRY_DISABLED = '1'
        VERCEL_TOKEN            = credentials('vercel-token')
        VERCEL_ORG_ID           = credentials('vercel-org-id')
        VERCEL_PROJECT_ID       = credentials('vercel-project-id')
        TG_TOKEN                = credentials('telegram-bot-token')
        TG_CHAT_ID              = credentials('telegram-chat-id')
    }

    stages {
        stage('Notify Start') {
            steps { script { notify("🚀 DEPLOY STARTED\nProject: ${env.PROJECT_NAME}\nBranch: ${env.BRANCH}") } }
        }
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
        success { script { notify("✅ DEPLOY SUCCESS\nProject: ${env.PROJECT_NAME}\nBranch: ${env.BRANCH}\nURL: ${env.SITE_URL}") } }
        failure { script { notify("❌ DEPLOY FAILED\nProject: ${env.PROJECT_NAME}\nBranch: ${env.BRANCH}\nPlease check Jenkins.") } }
    }
}

def notify(String msg) {
    try {
        withEnv(["TG_MSG=${msg}"]) {
            sh '''
                curl -s -X POST "[https://api.telegram.org/bot${TG_TOKEN}/sendMessage](https://api.telegram.org/bot${TG_TOKEN}/sendMessage)" \
                  --data-urlencode "chat_id=${TG_CHAT_ID}" \
                  --data-urlencode "text=${TG_MSG}"
            '''
        }
    } catch (e) {
        echo "Telegram notify failed: ${e}"
    }
}
