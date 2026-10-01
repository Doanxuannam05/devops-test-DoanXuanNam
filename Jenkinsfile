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