'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { TestTube, Wifi, WifiOff, AlertTriangle, CheckCircle } from 'lucide-react';
import { useWebSocket } from '@/contexts/websocket-context';
import { siteConfig } from '@/config/Site';

interface TestResult {
  url: string;
  success: boolean;
  error?: string;
  timestamp: string;
}

export function WebSocketDebugger() {
  const { testConnection, isConnected, connectionStatus, error } = useWebSocket();
  const [testUrl, setTestUrl] = useState(siteConfig.api.websocket?.notificationsUrl || '');
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  const commonUrls = [
    'wss://minorpool.com/notifications',
    'ws://minorpool.com/notifications',
    'wss://api.heroichashers.com/notifications',
    'ws://api.heroichashers.com/notifications',
    'wss://echo.websocket.org',
    'ws://echo.websocket.org'
  ];

  const runTest = async (url: string) => {
    setTesting(true);
    try {
      console.log(`🧪 Testing WebSocket URL: ${url}`);
      
      const testWs = new WebSocket(url);
      const result = await new Promise<TestResult>((resolve) => {
        const timeout = setTimeout(() => {
          testWs.close();
          resolve({
            url,
            success: false,
            error: 'Connection timeout (5s)',
            timestamp: new Date().toISOString()
          });
        }, 5000);

        testWs.onopen = () => {
          clearTimeout(timeout);
          testWs.close();
          resolve({
            url,
            success: true,
            timestamp: new Date().toISOString()
          });
        };

        testWs.onerror = (error) => {
          clearTimeout(timeout);
          resolve({
            url,
            success: false,
            error: 'Connection failed',
            timestamp: new Date().toISOString()
          });
        };

        testWs.onclose = (event) => {
          if (!timeout) return; // Already resolved
          clearTimeout(timeout);
          resolve({
            url,
            success: event.code === 1000,
            error: event.code !== 1000 ? `Closed with code: ${event.code}` : undefined,
            timestamp: new Date().toISOString()
          });
        };
      });

      setTestResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
    } catch (err) {
      setTestResults(prev => [{
        url,
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }, ...prev.slice(0, 9)]);
    } finally {
      setTesting(false);
    }
  };

  const testCurrentConnection = async () => {
    if (testConnection) {
      setTesting(true);
      const result = await testConnection();
      setTestResults(prev => [{
        url: siteConfig.api.websocket?.notificationsUrl || 'Current config',
        success: result,
        error: result ? undefined : 'Failed to connect',
        timestamp: new Date().toISOString()
      }, ...prev.slice(0, 9)]);
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TestTube className="w-5 h-5" />
            <span>WebSocket Connection Debugger</span>
          </CardTitle>
          <CardDescription>
            Test WebSocket connections and diagnose connectivity issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Connection Status */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Current Connection Status</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" />
                )}
                <span className="text-sm">{connectionStatus}</span>
              </div>
              <Button 
                onClick={testCurrentConnection} 
                disabled={testing}
                size="sm"
                variant="outline"
              >
                Test Current Config
              </Button>
            </div>
            {error && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <Separator />

          {/* Manual URL Testing */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Test Custom URL</h3>
            <div className="flex space-x-2">
              <Input
                placeholder="wss://your-websocket-url.com/notifications"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={() => runTest(testUrl)} 
                disabled={testing || !testUrl}
              >
                {testing ? 'Testing...' : 'Test'}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Common URL Testing */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Test Common URLs</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {commonUrls.map((url) => (
                <Button
                  key={url}
                  onClick={() => runTest(url)}
                  disabled={testing}
                  variant="outline"
                  size="sm"
                  className="justify-start text-xs"
                >
                  {url}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Test Results */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Test Results</h3>
            {testResults.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tests run yet</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {result.success ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <WifiOff className="w-4 h-4 text-red-500" />
                      )}
                      <div>
                        <p className="text-sm font-medium truncate max-w-xs">{result.url}</p>
                        {result.error && (
                          <p className="text-xs text-red-500">{result.error}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={result.success ? 'default' : 'destructive'}>
                        {result.success ? 'Success' : 'Failed'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Debugging Tips */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs space-y-2">
              <p><strong>Common Issues:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Try WSS (secure) instead of WS if HTTPS is used</li>
                <li>Check if the server supports WebSocket connections</li>
                <li>Verify the correct port and path</li>
                <li>Check for firewall or proxy blocking WebSocket connections</li>
                <li>Some servers may require specific headers or authentication</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}

export default WebSocketDebugger;
