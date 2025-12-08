import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Disclaimer & Terms of Service -  Kriptokyng Explorer",
  description: "Terms of service and disclaimer for  Kriptokyng Explorer",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 dark:to-muted/10">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header with Logo */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-block mb-6">
            <div className="flex items-center justify-center">
              <Image
                src="/images/logo.png"
                alt=" Kriptokyng Explorer"
                width={200}
                height={60}
                className="h-12 w-auto"
                priority
              />
            </div>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Disclaimer & Terms of Service
          </h1>
          <div className="w-24 h-1 bg-primary mx-auto my-4"></div>
        </div>

        {/* Content */}
        <div className="bg-background/80 dark:bg-background/90 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-lg">
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-muted-foreground mb-6">
              This site provides blockchain explorers for several crypto-currencies.
              We do not provide any currency exchange, wallet or money services. We only present public blockchain data.
            </p>
            
            <p className="text-muted-foreground mb-6">
              If you do not find your answer here, feel free to contact us on <a href="https://bitcointalk.org" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">bitcointalk</a>, <a href="https://twitter.com" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">twitter</a> or just fire a mail to <a href="mailto:contact@cryptoid.info" className="text-primary hover:underline">contact@cryptoid.info</a>
            </p>

            <p className="text-muted-foreground mb-6">
              If you do not agree with our <Link href="/terms" className="text-primary hover:underline">Terms</Link>, promptly exit this page without accessing or using any of the services.
            </p>

            <div className="mt-12 pt-6 border-t border-border/30">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Terms of Service</h2>
              <p className="text-muted-foreground mb-4">
                By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. 
                In addition, when using this website's particular services, you shall be subject to any posted guidelines or rules applicable to such services.
              </p>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">1. Use of Service</h3>
              <p className="text-muted-foreground mb-4">
                The service is provided for informational purposes only. We do not store, sell, or share any personal information.
                All blockchain data is publicly available and we only present it in a user-friendly format.
              </p>

              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">2. No Investment Advice</h3>
              <p className="text-muted-foreground mb-4">
                The content provided on this website does not constitute investment advice, financial advice, trading advice, or any other sort of advice.
                You should not treat any of the website's content as such.
              </p>

              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">3. Limitation of Liability</h3>
              <p className="text-muted-foreground mb-4">
                In no event shall  Kriptokyng Explorer, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, 
                incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
              </p>

              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">4. Changes to Terms</h3>
              <p className="text-muted-foreground">
                We reserve the right to modify these terms at any time. We will provide notice of any changes by updating the "Last Updated" date at the bottom of this page.
              </p>

              <p className="text-sm text-muted-foreground mt-8 pt-4 border-t border-border/20">
                Last Updated: December 7, 2025
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
