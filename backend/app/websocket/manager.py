from fastapi import WebSocket
from typing import Dict, List
import json

class ConnectionManager:
    def __init__(self):
        # kitchen_id -> List[WebSocket]
        self.kitchen_connections: Dict[int, List[WebSocket]] = {}
        # global connections
        self.global_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket, kitchen_id: int = 0):
        await websocket.accept()
        if kitchen_id > 0:
            if kitchen_id not in self.kitchen_connections:
                self.kitchen_connections[kitchen_id] = []
            self.kitchen_connections[kitchen_id].append(websocket)
        else:
            self.global_connections.append(websocket)

    def disconnect(self, websocket: WebSocket, kitchen_id: int = 0):
        if kitchen_id > 0 and kitchen_id in self.kitchen_connections:
            if websocket in self.kitchen_connections[kitchen_id]:
                self.kitchen_connections[kitchen_id].remove(websocket)
        if websocket in self.global_connections:
            self.global_connections.remove(websocket)

    async def broadcast_to_kitchen(self, kitchen_id: int, message: dict):
        payload = json.dumps(message)
        if kitchen_id in self.kitchen_connections:
            for connection in self.kitchen_connections[kitchen_id]:
                try:
                    await connection.send_text(payload)
                except Exception:
                    pass
        for connection in self.global_connections:
            try:
                await connection.send_text(payload)
            except Exception:
                pass

    async def broadcast_global(self, message: dict):
        payload = json.dumps(message)
        all_connections = self.global_connections.copy()
        for k_conns in self.kitchen_connections.values():
            all_connections.extend(k_conns)
        for connection in set(all_connections):
            try:
                await connection.send_text(payload)
            except Exception:
                pass

ws_manager = ConnectionManager()
