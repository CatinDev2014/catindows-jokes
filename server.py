import http.server
import socketserver
import webbrowser
import threading
import os
import sys

# Порт, на котором будет работать сервер
PORT = 8000

class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        # Переопределяем логирование, чтобы не засорять консоль
        pass

def open_browser():
    # Открываем браузер после небольшой задержки, чтобы сервер успел стартовать
    threading.Timer(1.0, lambda: webbrowser.open(f"http://localhost:{PORT}/index.html")).start()

def run_server():
    # Меняем рабочую директорию на ту, где лежит скрипт
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    print(f"==========================================")
    print(f"  Old-DOS IT Jokes Server")
    print(f"==========================================")
    print(f"Сервер запущен на http://localhost:{PORT}")
    print(f"Для остановки нажмите Ctrl+C")
    print(f"==========================================")

    open_browser()

    # Включаем переиспользование адреса, чтобы не было ошибки "Address already in use"
    socketserver.TCPServer.allow_reuse_address = True
    
    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nСервер остановлен. Пока!")
        sys.exit(0)
    except Exception as e:
        print(f"Ошибка: {e}")

if __name__ == "__main__":
    run_server()