# Miningcore WebSocket Notifications API

Miningcore provides real-time WebSocket notifications for pool events, block updates, payments, and hashrate changes. This document covers all available WebSocket data and connection details.

## Overview

The WebSocket notification system broadcasts real-time pool events to connected clients, providing immediate updates on:
- Block discoveries and confirmations
- Payment processing
- Hashrate updates
- Blockchain height changes
- Block unlock progress

## Connection Details

### WebSocket Endpoint
```
ws://your-pool-domain:port/notifications
wss://your-pool-domain:port/notifications (SSL)
```

### Connection Flow
1. Connect to the WebSocket endpoint
2. Receive a greeting message confirming connection
3. Subscribe to real-time notifications automatically
4. Handle incoming notification messages

## Message Format

All WebSocket messages follow a consistent JSON format:

```json
{
  "type": "notification_type",
  "poolId": "string",
  // ...additional notification-specific fields
}
```

## Notification Types

### 1. Greeting (`greeting`)

Sent immediately upon connection to confirm successful connection.

```json
{
  "type": "greeting",
  "message": "Connected to Miningcore notification relay"
}
```

### 2. Block Found (`blockfound`)

Triggered when a pool finds a new block candidate.

```json
{
  "type": "blockfound",
  "poolId": "btc",
  "blockHeight": 750000,
  "symbol": "BTC",
  "name": "Bitcoin",
  "miner": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
  "minerExplorerLink": "https://blockstream.info/address/1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
  "source": "stratum"
}
```

**Fields:**
- `poolId`: Pool identifier
- `blockHeight`: Block height number
- `symbol`: Cryptocurrency symbol
- `name`: Cryptocurrency full name
- `miner`: Miner wallet address who found the block
- `minerExplorerLink`: Blockchain explorer link for the miner address
- `source`: Source of the block submission

### 3. Block Unlocked (`blockunlocked`)

Triggered when a block is confirmed and unlocked (or orphaned).

```json
{
  "type": "blockunlocked",
  "poolId": "btc",
  "blockHeight": 750000,
  "symbol": "BTC",
  "name": "Bitcoin",
  "status": "Confirmed",
  "blockType": "block",
  "blockHash": "000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f",
  "reward": 6.25,
  "effort": 0.85,
  "miner": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
  "explorerLink": "https://blockstream.info/block/000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f",
  "minerExplorerLink": "https://blockstream.info/address/1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
}
```

**Fields:**
- `poolId`: Pool identifier
- `blockHeight`: Block height number
- `symbol`: Cryptocurrency symbol
- `name`: Cryptocurrency full name
- `status`: Block status (`Confirmed`, `Orphaned`, `Pending`)
- `blockType`: Type of block (usually "block")
- `blockHash`: Block hash
- `reward`: Block reward amount
- `effort`: Mining effort (as decimal, e.g., 0.85 = 85%)
- `miner`: Miner wallet address
- `explorerLink`: Blockchain explorer link for the block
- `minerExplorerLink`: Blockchain explorer link for the miner address

### 4. Block Unlock Progress (`blockunlockprogress`)

Triggered during block confirmation process to show progress.

```json
{
  "type": "blockunlockprogress", 
  "poolId": "btc",
  "blockHeight": 750000,
  "symbol": "BTC",
  "name": "Bitcoin",
  "progress": 0.75,
  "effort": 0.85
}
```

**Fields:**
- `poolId`: Pool identifier
- `blockHeight`: Block height number
- `symbol`: Cryptocurrency symbol
- `name`: Cryptocurrency full name
- `progress`: Confirmation progress (0.0 to 1.0)
- `effort`: Mining effort (as decimal)

### 5. New Chain Height (`newchainheight`)

Triggered when the blockchain reaches a new height.

```json
{
  "type": "newchainheight",
  "poolId": "btc",
  "blockHeight": 750001,
  "symbol": "BTC",
  "name": "Bitcoin"
}
```

**Fields:**
- `poolId`: Pool identifier
- `blockHeight`: New blockchain height
- `symbol`: Cryptocurrency symbol
- `name`: Cryptocurrency full name

### 6. Payment (`payment`)

Triggered when payments are processed (both successful and failed).

```json
{
  "type": "payment",
  "poolId": "btc",
  "amount": 0.05,
  "symbol": "BTC",
  "recipientsCount": 25,
  "txIds": [
    "a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890"
  ],
  "txExplorerLinks": [
    "https://blockstream.info/tx/a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890"
  ],
  "txFee": 0.0001,
  "error": null
}
```

**Fields:**
- `poolId`: Pool identifier
- `amount`: Total payment amount
- `symbol`: Cryptocurrency symbol
- `recipientsCount`: Number of miners paid
- `txIds`: Array of transaction IDs
- `txExplorerLinks`: Array of transaction explorer links
- `txFee`: Transaction fee (optional)
- `error`: Error message if payment failed (null for successful payments)

**Failed Payment Example:**
```json
{
  "type": "payment",
  "poolId": "btc",
  "amount": 0.05,
  "symbol": "BTC",
  "error": "Insufficient funds in wallet",
  "recipientsCount": 0,
  "txIds": null,
  "txExplorerLinks": null,
  "txFee": null
}
```

### 7. Hashrate Updated (`hashrateupdated`)

Triggered when pool or miner hashrate is updated.

```json
{
  "type": "hashrateupdated",
  "poolId": "btc",
  "hashrate": 150000000000,
  "miner": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
  "worker": "worker1"
}
```

**Fields:**
- `poolId`: Pool identifier
- `hashrate`: Hashrate in hashes per second
- `miner`: Miner address (optional, null for pool-wide updates)
- `worker`: Worker name (optional, null for miner-wide updates)

## Client Implementation Examples

### JavaScript/Node.js

```javascript
const WebSocket = require('ws');

const ws = new WebSocket('ws://your-pool:4000/notifications');

ws.on('open', function open() {
  console.log('Connected to Miningcore notifications');
});

ws.on('message', function message(data) {
  const notification = JSON.parse(data);
  
  switch(notification.type) {
    case 'greeting':
      console.log('Connection confirmed:', notification.message);
      break;
      
    case 'blockfound':
      console.log(`New block found! Pool: ${notification.poolId}, Height: ${notification.blockHeight}`);
      break;
      
    case 'blockunlocked':
      console.log(`Block unlocked! Status: ${notification.status}, Reward: ${notification.reward} ${notification.symbol}`);
      break;
      
    case 'payment':
      if (notification.error) {
        console.log(`Payment failed: ${notification.error}`);
      } else {
        console.log(`Payment sent: ${notification.amount} ${notification.symbol} to ${notification.recipientsCount} miners`);
      }
      break;
      
    case 'hashrateupdated':
      if (notification.miner) {
        console.log(`Hashrate update - Miner: ${notification.miner}, Worker: ${notification.worker || 'all'}, Rate: ${notification.hashrate}`);
      } else {
        console.log(`Pool hashrate update: ${notification.hashrate}`);
      }
      break;
      
    case 'newchainheight':
      console.log(`New blockchain height: ${notification.blockHeight} for ${notification.symbol}`);
      break;
      
    case 'blockunlockprogress':
      console.log(`Block unlock progress: ${Math.round(notification.progress * 100)}%`);
      break;
      
    default:
      console.log('Unknown notification:', notification);
  }
});

ws.on('error', function error(err) {
  console.error('WebSocket error:', err);
});

ws.on('close', function close() {
  console.log('Disconnected from Miningcore notifications');
});
```

### Python

```python
import websocket
import json

def on_message(ws, message):
    notification = json.loads(message)
    
    if notification['type'] == 'greeting':
        print(f"Connected: {notification['message']}")
    elif notification['type'] == 'blockfound':
        print(f"Block found! Pool: {notification['poolId']}, Height: {notification['blockHeight']}")
    elif notification['type'] == 'blockunlocked':
        print(f"Block unlocked! Status: {notification['status']}, Reward: {notification['reward']} {notification['symbol']}")
    elif notification['type'] == 'payment':
        if notification.get('error'):
            print(f"Payment failed: {notification['error']}")
        else:
            print(f"Payment: {notification['amount']} {notification['symbol']} to {notification['recipientsCount']} miners")
    elif notification['type'] == 'hashrateupdated':
        if notification.get('miner'):
            print(f"Hashrate - Miner: {notification['miner']}, Rate: {notification['hashrate']}")
        else:
            print(f"Pool hashrate: {notification['hashrate']}")

def on_error(ws, error):
    print(f"Error: {error}")

def on_close(ws, close_status_code, close_msg):
    print("Connection closed")

def on_open(ws):
    print("Connected to Miningcore notifications")

if __name__ == "__main__":
    ws = websocket.WebSocketApp("ws://your-pool:4000/notifications",
                              on_open=on_open,
                              on_message=on_message,
                              on_error=on_error,
                              on_close=on_close)
    
    ws.run_forever()
```

## Configuration

WebSocket notifications are enabled by default in Miningcore. The notification system automatically broadcasts all supported event types to connected clients.

### Pool Configuration
The WebSocket endpoint is typically available on the same port as the API, usually at `/notifications` path.

### Reconnection Handling
Clients should implement reconnection logic for production use:
- Handle connection drops gracefully
- Implement exponential backoff for reconnection attempts
- Store and replay any missed critical notifications if needed

## Technical Implementation Details

### Message Broadcasting
- All notifications are broadcast to all connected clients
- No filtering by pool or miner (clients must filter client-side)
- Messages are sent in real-time as events occur
- JSON serialization uses standard formatting (no pretty printing)

### Performance Considerations
- WebSocket connections are lightweight
- No message queuing for offline clients
- Connection limit depends on server configuration
- Consider message rate limits for high-frequency notifications

### Security
- WebSocket connections inherit the same security as the HTTP server
- SSL/TLS encryption available via `wss://` protocol
- No authentication required for notifications (read-only)
- Consider implementing rate limiting in production

## Event Frequency

### High Frequency Events
- `hashrateupdated`: Every few minutes per miner/worker
- `newchainheight`: Every time a new block is mined on the network

### Medium Frequency Events  
- `blockunlockprogress`: During block confirmation periods
- `blockfound`: When pool finds blocks (varies by pool hashrate and luck)

### Low Frequency Events
- `blockunlocked`: After block confirmation/orphaning
- `payment`: During scheduled payment runs
- `greeting`: Only on initial connection

## Troubleshooting

### Common Issues
1. **Connection refused**: Check if WebSocket endpoint is enabled and accessible
2. **No messages received**: Verify the pool is active and generating events
3. **JSON parse errors**: Ensure proper message handling and UTF-8 encoding
4. **Frequent disconnections**: Implement proper reconnection logic and check network stability

### Debugging
Enable WebSocket logging in your client to monitor:
- Connection establishment
- Message reception rates
- Disconnection events
- Error conditions

This WebSocket API provides real-time visibility into all pool operations, making it ideal for monitoring dashboards, mobile apps, and automated trading systems.
