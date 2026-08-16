"""Detached static file server for 今日你的牛.

Double-fork + setsid so the server becomes a child of init (PID 1) and is NOT
killed when the spawning shell / bash-tool process tree is torn down.

Usage:
    python3 scripts/serve.py
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

PROJECT_DIR = Path(__file__).resolve().parent.parent
LOG_PATH = PROJECT_DIR / "runtime" / "server.log"
PORT = 8088


def daemonize() -> None:
    if os.fork() > 0:
        os._exit(0)
    os.setsid()
    if os.fork() > 0:
        os._exit(0)
    os.umask(0)
    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    fd = os.open(str(LOG_PATH), os.O_RDWR | os.O_CREAT | os.O_TRUNC, 0o644)
    os.dup2(fd, sys.stdin.fileno())
    os.dup2(fd, sys.stdout.fileno())
    os.dup2(fd, sys.stderr.fileno())
    if fd > 2:
        os.close(fd)


def main() -> None:
    daemonize()
    os.chdir(str(PROJECT_DIR))
    import http.server
    import socketserver

    handler = http.server.SimpleHTTPRequestHandler
    with socketserver.TCPServer(("127.0.0.1", PORT), handler) as httpd:
        httpd.serve_forever()


if __name__ == "__main__":
    main()
