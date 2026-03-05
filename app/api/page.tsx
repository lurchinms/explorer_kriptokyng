"use client"
import React, { useMemo } from 'react';
import { Endpoint } from './types';
import { useLanguage } from '@/contexts/language-context';

import { MainContent } from './components/MainContent';

const APIPage: React.FC = () => {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';

  const endpoints: Endpoint[] = useMemo(() => [
    {
      id: 'block_id',
      method: 'GET',
      path: '/block/{block_id}',
      title: t('api.nav.block_id'),
      description: t('api.description_main'),
      pathParameters: [
        { name: 'block_id', type: 'string', description: t('api.description_main'), required: true }
      ],
      getParameters: [
        { name: 'transactions', type: 'string', description: t('api.description_main'), required: false },
        { name: 'block_statistic', type: 'string', description: t('api.description_main'), required: false },
        { name: 'blockchain_state', type: 'string', description: t('api.description_main'), required: false }
      ],
      response: {
        status: 200,
        contentType: 'application/json',
        data: {
          data: {
            block: t('api.blocks'),
            transactions: t('api.transactions'),
            block_statistic: t('api.blocks'),
            blockchain_state: t('api.blocks')
          },
          time: 1625000000
        }
      }
    },
    {
      id: 'last_block',
      method: 'GET',
      path: '/block/last',
      title: t('api.nav.last_block'),
      description: t('api.description_main'),
      getParameters: [
        { name: 'transactions', type: 'string', description: t('api.description_main'), required: false },
        { name: 'block_statistic', type: 'string', description: t('api.description_main'), required: false }
      ],
      response: {
        status: 200,
        contentType: 'application/json',
        data: {
          data: { block: t('api.blocks') },
          time: 1625000001
        }
      }
    },
    {
        id: 'last_n_blocks',
        method: 'GET',
        path: '/blocks/blocks/last/{n}',
        title: t('api.nav.last_n_blocks'),
        description: t('api.description_main'),
        pathParameters: [
            { name: 'n', type: 'string', description: t('api.description_main'), required: true }
        ],
        response: {
            status: 200,
            contentType: 'application/json',
            data: {
                data: [t('api.blocks')],
                time: 1625000002
            }
        }
    },
    {
        id: 'transaction',
        method: 'GET',
        path: '/transaction/{hash}',
        title: t('api.nav.transaction'),
        description: t('api.description_main'),
        pathParameters: [
            { name: 'hash', type: 'string', description: t('api.description_main'), required: true }
        ],
        response: {
            status: 200,
            contentType: 'application/json',
            data: {
                data: t('api.transactions'),
                time: 1625000003
            }
        }
    },
    {
        id: 'address_state',
        method: 'GET',
        path: '/address/state/{address}',
        title: t('api.nav.address_state'),
        description: t('api.description_main'),
        pathParameters: [
            { name: 'address', type: 'string', description: t('api.description_main'), required: true }
        ],
        response: {
            status: 200,
            contentType: 'application/json',
            data: {
                data: t('api.addresses'),
                time: 1625000004
            }
        }
    }
  ], [t]);

  if (!t) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`min-h-screen bg-white ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
         
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-6 py-16 sm:py-24">
        <MainContent endpoints={endpoints} t={t} lang={language} />
        
        {/* Footer info */}
        <footer className="mt-24 pt-12 border-t border-slate-100 text-center">
            <p className="text-slate-400 text-xs uppercase tracking-widest font-bold mb-4">Blockchain Ledger API Documentation</p>
            <div className="flex justify-center gap-6 text-sm text-slate-500">
                <a href="#" className="hover:text-orange-500 transition-colors">Github</a>
                <a href="#" className="hover:text-orange-500 transition-colors">Support</a>
                <a href="#" className="hover:text-orange-500 transition-colors">Twitter</a>
            </div>
        </footer>
      </main>
    </div>
  );
};

export default APIPage;