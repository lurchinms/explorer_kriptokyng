
import React from 'react';
import { Endpoint, Parameter } from '../types';

interface ApiEndpointProps {
  endpoint: Endpoint;
  t: any;
  lang: string;
}

export const ApiEndpoint: React.FC<ApiEndpointProps> = ({ endpoint, t, lang }) => {
  const isRTL = lang === 'ar';

  return (
    <section id={endpoint.id} className="scroll-mt-24 transition-all group">
      <div className="mb-10">
        <div className={`flex items-center gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
           <span className="h-6 w-1 bg-orange-500 rounded-full"></span>
           <h3 className="text-2xl font-bold text-slate-900">{endpoint.title}</h3>
        </div>
        
        <div className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-xl mb-6 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
          <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-bold uppercase tracking-widest ${endpoint.method === 'GET' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
            {endpoint.method}
          </span>
          <span className="text-lg font-mono text-slate-800 break-all">{endpoint.path}</span>
        </div>
        
        <p className="text-slate-600 text-lg leading-relaxed max-w-3xl">{endpoint.description}</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-1 gap-12">
          {/* Parameters Column */}
          <div className="space-y-10">
              {/* Path Parameters */}
              {endpoint.pathParameters && (
                <div>
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-50 pb-2">{t.path_parameters}</h4>
                  <ParameterTable params={endpoint.pathParameters} t={t} lang={lang} />
                </div>
              )}

              {/* GET Parameters */}
              {endpoint.getParameters && (
                <div>
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-50 pb-2">{t.get_parameters}</h4>
                  <ParameterTable params={endpoint.getParameters} t={t} lang={lang} />
                </div>
              )}
          </div>

          {/* Response Box */}
          <div className="mt-4">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-50 pb-2">{t.responses}</h4>
            <div className={`bg-slate-900 rounded-2xl overflow-hidden shadow-xl ${isRTL ? 'text-right' : ''}`}>
              <div className="bg-slate-800/50 px-6 py-3 border-b border-slate-700/50 flex justify-between items-center">
                <div className="flex gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">{endpoint.response.contentType}</span>
              </div>
              <div className="p-8 overflow-x-auto custom-scrollbar">
                <div className="flex items-center gap-3 mb-6">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">STATUS {endpoint.response.status}</span>
                </div>
                <pre className="text-sm text-slate-300 leading-relaxed font-mono">
                  {JSON.stringify(endpoint.response.data, null, 2)}
                </pre>
              </div>
            </div>
          </div>
      </div>
    </section>
  );
};

const ParameterTable: React.FC<{ params: Parameter[]; t: any; lang: string }> = ({ params, t, lang }) => {
  const isRTL = lang === 'ar';
  return (
    <div className="overflow-x-auto border border-slate-100 rounded-xl bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-100">
        <thead className="bg-slate-50/50">
            <tr>
                <th className={`px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest ${isRTL ? 'text-right' : 'text-left'}`}>Name</th>
                <th className={`px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest ${isRTL ? 'text-right' : 'text-left'}`}>Type</th>
                <th className={`px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest ${isRTL ? 'text-right' : 'text-left'}`}>Description</th>
                <th className={`px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest ${isRTL ? 'text-left' : 'text-right'}`}>Presence</th>
            </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-50">
          {params.map((param) => (
            <tr key={param.name} className="hover:bg-slate-50/30 transition-colors">
              <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800 font-mono ${isRTL ? 'text-right' : 'text-left'}`}>
                {param.name}
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-xs font-semibold text-orange-600 ${isRTL ? 'text-right' : 'text-left'}`}>
                {param.type}
              </td>
              <td className={`px-6 py-4 text-sm text-slate-600 leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>
                {param.description}
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-right text-[10px] font-bold uppercase tracking-widest ${isRTL ? 'text-left' : 'text-right'}`}>
                <span className={param.required ? 'text-rose-500 bg-rose-50 px-2 py-0.5 rounded' : 'text-slate-400 bg-slate-50 px-2 py-0.5 rounded'}>
                  {param.required ? t.required : t.optional}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
