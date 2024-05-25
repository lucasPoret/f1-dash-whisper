#!/bin/bash

start_server() {
    if [ -f /app/server.pid ]; then
        echo "Server is already running with PID $(cat /app/server.pid)"
    else
        nohup python /app/server-whisper.py > /app/server.log 2>&1 &
        echo $! > /app/server.pid
        echo "Server started with PID $(cat /app/server.pid)"
    fi
}

stop_server() {
    if [ -f /app/server.pid ]; then
        kill $(cat /app/server.pid)
        rm /app/server.pid
        echo "Server stopped"
    else
        echo "No server running"
    fi
}

change_model() {
    local new_model=$1
    sed -i "s|model_name = \".*\"|model_name = \"$new_model\"|" /app/server-whisper.py
    echo "Model changed to $new_model"
    stop_server
}

server_status() {
    if [ -f /app/server.pid ]; then
        echo "Server is running with PID $(cat /app/server.pid)"
    else
        echo "Server is not running"
    fi
}

server_debug() {
    # show the console output of the server(pid)
    if [ -f /app/server.pid ]; then
        tail -f /app/server.log
    else
        echo "Server is not running"
    fi
}

case "$1" in
    start)
        start_server
        ;;
    stop)
        stop_server
        ;;
    model)
        if [ -z "$2" ]; then
            current_model=$(grep model_name /app/server-whisper.py | cut -d '"' -f 2 | head -n 1)
            echo -e "Current model is \033[1m$current_model\033[0m"
            echo
            echo "Usage: /usr/local/bin/start.sh {start|stop|model <new_model>}"
        else
            change_model "$2"
        fi
        ;;
    status)
        server_status
        ;;
    debug)
        server_debug
        ;;
    *)
        echo "Usage: /usr/local/bin/start.sh {start|stop|model <new_model>}"
        ;;
esac
