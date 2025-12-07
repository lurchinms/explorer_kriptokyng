/**
 * Network diagnostics utility for troubleshooting API connectivity
 */

export interface NetworkDiagnostic {
  test: string;
  status: 'success' | 'failed' | 'timeout';
  message: string;
  timestamp: Date;
  responseTime?: number;
}

export class NetworkDiagnostics {
  static async testApiConnectivity(baseUrl: string): Promise<NetworkDiagnostic[]> {
    const results: NetworkDiagnostic[] = [];
    
    // Test 1: Basic connectivity test
    try {
      const startTime = Date.now();
      const response = await fetch(`${baseUrl}/health`, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      const responseTime = Date.now() - startTime;
      
      results.push({
        test: 'API Health Check',
        status: response.ok ? 'success' : 'failed',
        message: response.ok 
          ? `API is reachable (${response.status})` 
          : `API returned ${response.status}: ${response.statusText}`,
        timestamp: new Date(),
        responseTime
      });
    } catch (error) {
      results.push({
        test: 'API Health Check',
        status: error instanceof Error && error.name === 'TimeoutError' ? 'timeout' : 'failed',
        message: error instanceof Error 
          ? error.message 
          : 'Unknown network error',
        timestamp: new Date()
      });
    }

    // Test 2: DNS Resolution test (basic URL fetch)
    try {
      const url = new URL(baseUrl);
      const startTime = Date.now();
      
      // Try to connect to just the base domain
      const response = await fetch(`${url.protocol}//${url.host}`, {
        method: 'HEAD',
        signal: AbortSignal.timeout(3000)
      });
      const responseTime = Date.now() - startTime;
      
      results.push({
        test: 'DNS Resolution',
        status: 'success',
        message: `Domain ${url.host} resolved successfully`,
        timestamp: new Date(),
        responseTime
      });
    } catch (error) {
      results.push({
        test: 'DNS Resolution',
        status: 'failed',
        message: error instanceof Error 
          ? `DNS lookup failed: ${error.message}` 
          : 'DNS resolution failed',
        timestamp: new Date()
      });
    }

    return results;
  }

  static formatDiagnostics(diagnostics: NetworkDiagnostic[]): string {
    return diagnostics
      .map(d => `${d.test}: ${d.status.toUpperCase()} - ${d.message}${d.responseTime ? ` (${d.responseTime}ms)` : ''}`)
      .join('\n');
  }
}
