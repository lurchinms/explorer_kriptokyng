
import React from 'react';
import { Endpoint } from '../types';
import { ApiEndpoint } from './ApiEndpoint';
import { siteConfig } from '@/config/Site';

interface MainContentProps {
  endpoints: Endpoint[];
  t: any;
  lang: string;
}

export const MainContent: React.FC<MainContentProps> = ({ endpoints, t, lang }) => {
  return (
    <div className="space-y-32">
      {/* Introduction */}
      <section id="description" className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">{t('api.title')}</h1>
        </div>
        
       

        <p className="text-xl leading-relaxed text-slate-600 max-w-4xl">
          {t('api.description_main')}
        </p>
      </section>

      {/* API Endpoints Info */}
      <section id="api_endpoint" className="space-y-8">
        <h2 className="text-3xl font-bold text-slate-900">{t('api.api_endpoint')}</h2>
        <div className="bg-white border border-slate-200 p-8 sm:p-10 rounded-2xl shadow-sm space-y-6">
          <p className="text-slate-600 leading-relaxed text-lg">
            {t('api.endpoint_note')}
          </p>
          <div className="space-y-3 font-mono text-sm bg-slate-900 text-slate-300 p-6 rounded-xl overflow-x-auto">
            <p><span className="text-slate-500">Mainnet URL:</span> <span className="text-emerald-400">{siteConfig.api.baseUrl}</span></p>
            <p><span className="text-slate-500">WebSocket:</span> <span className="text-emerald-400">{siteConfig.api.websocket?.notificationsUrl || 'N/A'}</span></p>
            <p><span className="text-slate-500">Explorer:</span> <span className="text-emerald-400">{siteConfig.url}</span></p>
          </div>
          <p className="text-slate-500 text-sm font-medium">{t('api.available_currency')}</p>
        </div>
      </section>

      {/* Request Limits */}
      <section id="request_limits" className="space-y-8">
        <h2 className="text-3xl font-bold text-slate-900">{t('api.request_limits')}</h2>
        <div className="space-y-6 max-w-4xl">
          <div className="flex items-start gap-4 p-6 bg-amber-50 rounded-xl border border-amber-100">
            <div className="mt-1">
                <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <div className="space-y-2">
                <p className="text-slate-700 leading-relaxed font-medium">
                  {t('api.limit_note')}
                </p>
                <p className="text-slate-600 leading-relaxed">
                  {t('api.rate_limit_429')}
                </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Header Example</p>
                <code className="text-sm text-slate-700">Ratelimit-Remaining: 14</code>
            </div>
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Reset Example</p>
                <code className="text-sm text-slate-700">Ratelimit-Reset: 5</code>
            </div>
          </div>
        </div>
      </section>

      {/* Resource Sections */}
      <div className="space-y-40">
        {/* Blocks Section */}
        <div id="blocks_group">
          <div className="flex items-center gap-4 mb-16">
            <h2 className="text-4xl font-extrabold text-slate-900">{t('api.blocks')}</h2>
            <div className="h-1 flex-1 bg-slate-100"></div>
          </div>
          <div className="space-y-32">
              {endpoints.slice(0, 3).map(ep => (
                  <ApiEndpoint key={ep.id} endpoint={ep} t={t} lang={lang} />
              ))}
          </div>
        </div>

        {/* Transactions Section */}
        <div id="tx_group">
          <div className="flex items-center gap-4 mb-16">
            <h2 className="text-4xl font-extrabold text-slate-900">{t('api.transactions')}</h2>
            <div className="h-1 flex-1 bg-slate-100"></div>
          </div>
          <div className="space-y-32">
              {endpoints.slice(3, 4).map(ep => (
                  <ApiEndpoint key={ep.id} endpoint={ep} t={t} lang={lang} />
              ))}
          </div>
        </div>

        {/* Addresses Section */}
        <div id="addr_group">
          <div className="flex items-center gap-4 mb-16">
            <h2 className="text-4xl font-extrabold text-slate-900">{t('api.addresses')}</h2>
            <div className="h-1 flex-1 bg-slate-100"></div>
          </div>
          <div className="space-y-32">
              {endpoints.slice(4).map(ep => (
                  <ApiEndpoint key={ep.id} endpoint={ep} t={t} lang={lang} />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
