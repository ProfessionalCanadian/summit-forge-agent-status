# Summit Forge Labs telemetry API

Small no-dependency Python service for the agent status page.

## Files

- `server.py` - serves `/api/status`
- `start.sh` - launch helper
- `summit-forge-status.service` - systemd unit template

## Run manually

```bash
cd /data/.openclaw/workspace/projects/status-page/api
chmod +x start.sh server.py
./start.sh
```

Default port is `8743`. If that port is already in use, the server falls back to `8744`.

## Test

```bash
curl http://localhost:8743/api/status
```

If `8743` is occupied, test `8744` instead.

## Install as systemd service

```bash
sudo cp /data/.openclaw/workspace/projects/status-page/api/summit-forge-status.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now summit-forge-status.service
sudo systemctl status summit-forge-status.service
```

## Frontend note

Set the `API_URL` constant in `index.html` to your VPS public endpoint, for example:

```js
const API_URL = 'http://YOUR_VPS_IP:8743/api/status';
```

The page will fall back to `./agent-status.json` if the live API is unreachable.
