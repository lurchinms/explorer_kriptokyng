import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "API Documentation -  Kriptokyng Explorer",
  description: "Developer API documentation for  Kriptokyng Explorer"
};

export default function APIPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-2"> Kriptokyng Developer API's</h1>
        <p className="text-xl text-muted-foreground">Tools for developers to get data about the blockchains</p>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mb-8">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              <strong>Note:</strong> Services provided by cryptoid.info are free of charge. Please do not abuse them.
            </p>
          </div>
        </div>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Summary API</h2>
        <p className="text-muted-foreground mb-4">
          You can obtain summary information about all our explorers at the following URL:
        </p>
        <div className="bg-muted/50 p-4 rounded-lg mb-4 overflow-x-auto">
          <code className="text-sm font-mono break-all">https://kriptokyng.info/explorer/api.dws?q=summary</code>
        </div>
        <p className="text-muted-foreground">
          It returns a short summary of all our explorers. You can also use '24summary' which includes min/max/median for various blocks and transactions for the last 24 hours.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-foreground mb-4">API Calls Root URL for explorers</h2>
        <p className="text-muted-foreground mb-4">
          API shares a normalized root URL which is:
        </p>
        <div className="bg-muted/50 p-4 rounded-lg mb-4 overflow-x-auto">
          <code className="text-sm font-mono break-all">https://kriptokyng.info/explorer/api.dws</code>
        </div>
        <p className="text-muted-foreground">
          So for instance the url root for Bitcoin (btc) will be "https://kriptokyng.info/btc/api.dws".
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Query API</h2>
        
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                <strong>Note:</strong> Please limit your calls to the Query API to 1 every 10 seconds.
              </p>
            </div>
          </div>
        </div>

        <p className="text-muted-foreground mb-4">
          The API function to call is specified through the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">q</code> parameter.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">Real-Time Simple Queries</h3>
        <div className="bg-muted/30 rounded-lg overflow-hidden border border-border">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Query</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</th>
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-border">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <code className="bg-muted px-2 py-1 rounded text-sm font-mono">addresses</code>
                  </td>
                  <td className="px-6 py-4">Returns a JSON object with the number of known and non-zero addresses (with funds)</td>
                </tr>
                <tr className="bg-muted/10">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <code className="bg-muted px-2 py-1 rounded text-sm font-mono">circulating</code>
                  </td>
                  <td className="px-6 py-4">Returns the number of circulating coins (minus reserve, Prime holdings... see <Link href="#noncirculating" className="text-primary hover:underline">noncirculating</Link>)</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <code className="bg-muted px-2 py-1 rounded text-sm font-mono">getblockcount</code>
                  </td>
                  <td className="px-6 py-4">Returns the current block height as a plain text string</td>
                </tr>
                <tr className="bg-muted/10">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <code className="bg-muted px-2 py-1 rounded text-sm font-mono">getdifficulty</code>
                  </td>
                  <td className="px-6 py-4">Returns the difficulty as a plain text string</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <div className="mt-12 pt-8 border-t border-border">
        <h2 className="text-2xl font-semibold text-foreground mb-6">Need Help?</h2>
        <p className="text-muted-foreground mb-6">
          If you have any questions about using our API, please refer to our <Link href="/faq" className="text-primary hover:underline">FAQ</Link> or contact our support team.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a 
            href="https://bitcointalk.org" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-6 py-3 border border-border rounded-lg hover:bg-muted/30 transition-colors"
          >
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.99 0C5.47 0 0 4.8 0 10.32c0 4.55 3.06 8.43 7.34 9.65-.12.98-.8 4.23 1.11 5.03 1.92 1.01 3.56.6 4.55.35.29-.55.8-1.75.8-1.75s-1.9.35-3.23-.35c-1.34-.7-2.54-2.11-2.54-2.11s.2-.15.55-.35c.35-.2.8-.4 1.2-.35 1.9.2 3.38.8 4.15 1.35.8.55 1.6 1.2 1.6 1.2s.8-1.35 1.6-2.54c.8-1.2 1.6-2.54 1.6-2.54s1.6 1.2 1.6 2.54c0 1.35-1.2 2.54-1.2 2.54s.8-.55 1.6-1.2c.8-.55 2.14-1.15 4.15-1.35.4-.05.85.15 1.2.35.35.2.55.35.55.35s-1.2 1.4-2.54 2.11c-1.34.7-3.23.35-3.23.35s.51 1.2.8 1.75c.99.25 2.63.66 4.55-.35 1.91-.8 1.23-4.05 1.11-5.03 4.28-1.22 7.34-5.1 7.34-9.65C24 4.8 18.52 0 11.99 0z"/>
            </svg>
            BitcoinTalk
          </a>
          <a 
            href="https://twitter.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-6 py-3 border border-border rounded-lg hover:bg-muted/30 transition-colors"
          >
            <svg className="h-5 w-5 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
            Twitter
          </a>
          <a 
            href="mailto:contact@cryptoid.info" 
            className="inline-flex items-center justify-center px-6 py-3 border border-border rounded-lg hover:bg-muted/30 transition-colors"
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Email Us
          </a>
        </div>
      </div>
    </div>
  );
}
