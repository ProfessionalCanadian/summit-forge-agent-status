#!/usr/bin/env python3
import argparse
import json
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

DEFAULT_PORT = 8743
FALLBACK_PORT = 8744
STATUS_FILE = Path("/data/.openclaw/workspace/projects/status-page/agent-status.json")


class StatusHandler(BaseHTTPRequestHandler):
    server_version = "SummitForgeStatus/1.0"

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        if self.path.rstrip("/") != "/api/status":
            self.send_json(404, {"error": "Not found"})
            return

        try:
            raw = STATUS_FILE.read_text(encoding="utf-8")
            payload = json.loads(raw)
        except FileNotFoundError:
            self.send_json(500, {"error": f"Status file not found: {STATUS_FILE}"})
            return
        except json.JSONDecodeError as exc:
            self.send_json(500, {"error": f"Invalid JSON in status file: {exc}"})
            return
        except OSError as exc:
            self.send_json(500, {"error": f"Failed to read status file: {exc}"})
            return

        self.send_json(200, payload)

    def log_message(self, format, *args):
        return

    def send_json(self, status_code, payload):
        body = json.dumps(payload, indent=2).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def parse_args():
    parser = argparse.ArgumentParser(description="Summit Forge Labs telemetry API")
    parser.add_argument("--host", default=os.environ.get("STATUS_API_HOST", "0.0.0.0"))
    parser.add_argument(
        "--port",
        type=int,
        default=int(os.environ.get("STATUS_API_PORT", DEFAULT_PORT)),
        help=f"Preferred port, default {DEFAULT_PORT}",
    )
    parser.add_argument(
        "--fallback-port",
        type=int,
        default=int(os.environ.get("STATUS_API_FALLBACK_PORT", FALLBACK_PORT)),
        help=f"Fallback port if preferred port is busy, default {FALLBACK_PORT}",
    )
    return parser.parse_args()


def bind_server(host: str, port: int, fallback_port: int):
    try:
        return ThreadingHTTPServer((host, port), StatusHandler), port
    except OSError:
        if fallback_port == port:
            raise
        return ThreadingHTTPServer((host, fallback_port), StatusHandler), fallback_port


def main():
    args = parse_args()
    server, actual_port = bind_server(args.host, args.port, args.fallback_port)
    print(f"Serving Summit Forge telemetry on http://{args.host}:{actual_port}/api/status")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
