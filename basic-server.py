from http.server import HTTPServer, BaseHTTPRequestHandler

HTML = "<html><body><h1>HYPERVISOR</h1></body></html>"

class SimpleHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/portal":
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(HTML.encode("utf-8"))
        else:
            self.send_response(302)
            self.send_header("Location", "http://172.16.100.3/portal")
            self.end_headers()

    def do_POST(self):
        self.send_response(200)
        self.end_headers()

if __name__ == "__main__":
    server = HTTPServer(("0.0.0.0", 80), SimpleHandler)
    print("Server running...")
    server.serve_forever()
