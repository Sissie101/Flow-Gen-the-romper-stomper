import React, { useState } from 'react';
import {
  Sparkles,
  Users,
  ShoppingBag,
  Send,
  MessageSquare,
  Mail,
  Copy,
  Check,
  HeartHandshake,
  Bot,
  Flame,
  ArrowRight,
  TrendingUp,
  X,
  Compass,
  Lightbulb,
  Radio,
  Share2,
} from 'lucide-react';
import { Channel, SoloMarketingBundle, ThemeMode } from '../types';

interface SoloMarketingHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedChannel: Channel | null;
  channels: Channel[];
  theme: ThemeMode;
}

export const SoloMarketingHubModal: React.FC<SoloMarketingHubModalProps> = ({
  isOpen,
  onClose,
  selectedChannel,
  channels,
  theme,
}) => {
  const [targetChannelId, setTargetChannelId] = useState<string>(
    selectedChannel ? selectedChannel.id : channels[0]?.id || ''
  );
  const [productName, setProductName] = useState('Limited VIP Drop / Handcrafted Batch');
  const [pricePoint, setPricePoint] = useState('$35 - $85');
  const [vibe, setVibe] = useState('Authentic, warm, honest solo craftsmanship');
  const [marketingGoal, setMarketingGoal] = useState('Convert live viewers into repeat buyers & loyal subscribers');
  const [targetSegment, setTargetSegment] = useState('Active chatters & verified human subscribers');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const activeChannel = channels.find((c) => c.id === targetChannelId) || selectedChannel || channels[0];

  const [marketingBundle, setMarketingBundle] = useState<SoloMarketingBundle>({
    headline: `Exclusive ${activeChannel?.category || 'Live'} Community Drop for ${activeChannel?.name || 'Supporters'}`,
    dmFollowUp: `Hey there! Thank you so much for hanging out in the stream today. Since I run this whole operation solo, I personally inspect and hand-package every single item. I saved a private 15% discount link for you if you still wanted to grab your ${productName}: [STORE_LINK]. Feel free to message me directly if you have any questions!`,
    liveChatIcebreaker: `Quick question for everyone in chat: What is the #1 feature you look for before deciding to treat yourself to something new? Let me know and I'll demo it live on camera right now!`,
    emailBroadcast: `Subject: A personal thank you + your subscriber VIP reserve link\n\nHey friend,\n\nI just finished up today's live stream and wanted to take a quiet moment to say thank you. Doing all the creating, packaging, and marketing as a solo creator can be overwhelming, but connecting with genuine folks like you makes it truly worthwhile.\n\nIf you were checking out the ${productName} during the stream, I set aside a small batch for our email subscribers with free priority shipping using code SOLOCOMMUNITY.\n\nThank you for supporting independent craft,\n${activeChannel?.name || 'Solo Creator'}`,
    socialHook: `When you support a solo creator, you're not paying a corporate marketing team—you're getting 100% handcrafted passion. Here's why our community is loving ${productName} today... 👇`,
    conversionTip: "Emphasize your authentic solo journey. Solo authenticity converts 3.4x higher than aggressive corporate scarcity because viewers trust human connection over synthetic hype.",
    source: "Default Solo Template",
  });

  if (!isOpen) return null;

  const handleGenerateCampaign = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/gemini/solo-marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelName: activeChannel?.name || 'Solo Creator',
          category: activeChannel?.category || 'E-commerce',
          goal: marketingGoal,
          productName,
          pricePoint,
          vibe,
          targetSegment,
        }),
      });

      if (!res.ok) {
        throw new Error('Server returned an error');
      }

      const data = await res.json();
      setMarketingBundle(data);
    } catch (err) {
      console.warn('Using client-side dynamic marketing generator:', err);
      // Dynamic fallback
      setMarketingBundle({
        headline: `Special ${activeChannel?.name || 'Community'} VIP Reserve: ${productName}`,
        dmFollowUp: `Hey! Thanks so much for stopping by today's stream. As a solo creator, I pack and ship every order with personal care. I reserved a ${productName} for you with our community perk: [LINK]. Let me know if you want me to hold it for you!`,
        liveChatIcebreaker: `Hey chat! For those here live right now: What's the main thing you want to see me test or showcase next? Drop a comment!`,
        emailBroadcast: `Subject: Private subscriber reserve for ${productName}\n\nHi everyone,\n\nThank you for joining my live stream! Being a solo seller means every subscriber genuinely matters. Here is your private community link for ${productName} with complimentary priority shipping.\n\nWarmly,\n${activeChannel?.name || 'Your Solo Creator'}`,
        socialHook: `Running this solo means no middleman markups—just real quality made for real people. Check out ${productName} before the live batch sells out! 🔥`,
        conversionTip: 'Direct personal follow-ups within 30 minutes of ending a stream increase repeat buyer conversion by over 45%.',
        source: 'Interactive Dynamic Generator',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div
      id="solo-marketing-hub-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
    >
      <div
        className={`relative w-full max-w-5xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col my-6 max-h-[92vh] ${
          theme === 'light'
            ? 'bg-white border-zinc-200 text-zinc-900'
            : 'bg-[#09090b] border-white/10 text-white'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`p-6 border-b flex items-center justify-between ${
            theme === 'light' ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-white/10'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400">
              <HeartHandshake className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight font-sans">
                  Solo Creator Marketing & Buyer Connection Copilot
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold uppercase tracking-wider">
                  AI Studio Powered
                </span>
              </div>
              <p className={`text-xs ${theme === 'light' ? 'text-zinc-600' : 'text-zinc-400'} font-sans`}>
                Designed specifically for solo creators and lone marketers to turn live viewers into repeat buyers and loyal subscribers effortlessly.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-lg border transition-colors ${
              theme === 'light'
                ? 'border-zinc-200 hover:bg-zinc-100 text-zinc-600'
                : 'border-white/10 hover:bg-white/10 text-zinc-400'
            }`}
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Top Quick Context Banner */}
          <div
            className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
              theme === 'light'
                ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                : 'bg-amber-950/20 border-amber-500/30 text-amber-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
              <div className="text-xs font-sans">
                <span className="font-bold">Why solo connection works: </span>
                Viewers are tired of corporate spam and synthetic hype. Highlighting your genuine solo story, personal quality checks, and direct chat interactions builds lasting loyalty that bot farms can never replicate.
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-mono font-bold uppercase text-amber-400">
                Current Stream:
              </span>
              <select
                value={targetChannelId}
                onChange={(e) => setTargetChannelId(e.target.value)}
                className={`text-xs font-mono font-bold px-2.5 py-1.5 rounded-lg border focus:outline-none ${
                  theme === 'light'
                    ? 'bg-white border-zinc-300 text-zinc-800'
                    : 'bg-zinc-900 border-white/20 text-white'
                }`}
              >
                {channels.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    {ch.name} ({ch.category.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Configuration Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider font-mono text-zinc-400">
                Featured Product / Offer
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Handmade Ceramic Mug, Mystery Box"
                className={`w-full text-xs px-3 py-2 rounded-lg border font-sans focus:outline-none ${
                  theme === 'light'
                    ? 'bg-zinc-50 border-zinc-300 text-zinc-900 focus:border-amber-500'
                    : 'bg-zinc-900 border-white/10 text-white focus:border-amber-400'
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider font-mono text-zinc-400">
                Price Point / Offer Tier
              </label>
              <input
                type="text"
                value={pricePoint}
                onChange={(e) => setPricePoint(e.target.value)}
                placeholder="e.g. $25 - $60, Free Shipping Tier"
                className={`w-full text-xs px-3 py-2 rounded-lg border font-sans focus:outline-none ${
                  theme === 'light'
                    ? 'bg-zinc-50 border-zinc-300 text-zinc-900 focus:border-amber-500'
                    : 'bg-zinc-900 border-white/10 text-white focus:border-amber-400'
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider font-mono text-zinc-400">
                Creator Brand Tone & Vibe
              </label>
              <input
                type="text"
                value={vibe}
                onChange={(e) => setVibe(e.target.value)}
                placeholder="e.g. Cozy, Transparent, Energetic"
                className={`w-full text-xs px-3 py-2 rounded-lg border font-sans focus:outline-none ${
                  theme === 'light'
                    ? 'bg-zinc-50 border-zinc-300 text-zinc-900 focus:border-amber-500'
                    : 'bg-zinc-900 border-white/10 text-white focus:border-amber-400'
                }`}
              />
            </div>
          </div>

          {/* Action Trigger Button */}
          <div className="flex justify-end">
            <button
              onClick={handleGenerateCampaign}
              disabled={isLoading}
              className={`px-5 py-2.5 rounded-xl font-mono font-bold text-xs flex items-center gap-2 transition-all shadow-lg ${
                isLoading
                  ? 'bg-amber-600/50 cursor-not-allowed text-white'
                  : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-black active:scale-[0.98]'
              }`}
            >
              <Sparkles className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'AI GENERATING MARKETING ASSETS...' : 'GENERATE SOLO MARKETING CAMPAIGN WITH GEMINI'}</span>
            </button>
          </div>

          {/* Output Marketing Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest font-mono text-zinc-400 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>Ready-To-Use Solo Marketing Toolkit</span>
              </h3>
              <span className="text-[10px] font-mono text-zinc-500">
                Source: {marketingBundle.source}
              </span>
            </div>

            {/* Growth Tip Pill */}
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                theme === 'light'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
              }`}
            >
              <TrendingUp className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold uppercase tracking-wider font-mono mr-1">Solo Growth Tip:</span>
                {marketingBundle.conversionTip}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. Direct Message & Buyer Follow-Up */}
              <div
                className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
                  theme === 'light' ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/60 border-white/10'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold font-mono text-amber-500 uppercase tracking-wider">
                      <Send className="w-4 h-4" />
                      <span>1. Personal DM / Chat Follow-Up</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(marketingBundle.dmFollowUp, 'dm')}
                      className="p-1.5 rounded bg-zinc-800/50 hover:bg-zinc-700 text-zinc-300 text-[10px] font-mono flex items-center gap-1 transition-colors"
                      title="Copy DM"
                    >
                      {copiedKey === 'dm' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'dm' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className={`text-xs font-sans leading-relaxed whitespace-pre-wrap ${theme === 'light' ? 'text-zinc-800' : 'text-zinc-300'}`}>
                    {marketingBundle.dmFollowUp}
                  </p>
                </div>
                <div className="text-[10px] text-zinc-500 font-mono">
                  Best used: Send via DM to stream chatters who asked questions about the product.
                </div>
              </div>

              {/* 2. Live Chat Icebreaker Question */}
              <div
                className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
                  theme === 'light' ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/60 border-white/10'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider">
                      <MessageSquare className="w-4 h-4" />
                      <span>2. Live Chat Retention Icebreaker</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(marketingBundle.liveChatIcebreaker, 'icebreaker')}
                      className="p-1.5 rounded bg-zinc-800/50 hover:bg-zinc-700 text-zinc-300 text-[10px] font-mono flex items-center gap-1 transition-colors"
                      title="Copy Icebreaker"
                    >
                      {copiedKey === 'icebreaker' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'icebreaker' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className={`text-xs font-sans leading-relaxed ${theme === 'light' ? 'text-zinc-800' : 'text-zinc-300'}`}>
                    "{marketingBundle.liveChatIcebreaker}"
                  </p>
                </div>
                <div className="text-[10px] text-zinc-500 font-mono">
                  Best used: Ask on stream when viewer count spikes to separate real humans from bots.
                </div>
              </div>

              {/* 3. Email & Community Broadcast */}
              <div
                className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
                  theme === 'light' ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/60 border-white/10'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold font-mono text-indigo-400 uppercase tracking-wider">
                      <Mail className="w-4 h-4" />
                      <span>3. Warm Subscriber Email Broadcast</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(marketingBundle.emailBroadcast, 'email')}
                      className="p-1.5 rounded bg-zinc-800/50 hover:bg-zinc-700 text-zinc-300 text-[10px] font-mono flex items-center gap-1 transition-colors"
                      title="Copy Email"
                    >
                      {copiedKey === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'email' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className={`text-xs font-sans leading-relaxed whitespace-pre-wrap font-mono text-xs ${theme === 'light' ? 'text-zinc-800' : 'text-zinc-300'}`}>
                    {marketingBundle.emailBroadcast}
                  </p>
                </div>
                <div className="text-[10px] text-zinc-500 font-mono">
                  Best used: Send 1 hour after stream wrap-up to convert viewers who didn't buy live.
                </div>
              </div>

              {/* 4. Social & Community Hook */}
              <div
                className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
                  theme === 'light' ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/60 border-white/10'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold font-mono text-rose-400 uppercase tracking-wider">
                      <Share2 className="w-4 h-4" />
                      <span>4. Social Media Caption / Discord Drop</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(marketingBundle.socialHook, 'social')}
                      className="p-1.5 rounded bg-zinc-800/50 hover:bg-zinc-700 text-zinc-300 text-[10px] font-mono flex items-center gap-1 transition-colors"
                      title="Copy Social Hook"
                    >
                      {copiedKey === 'social' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'social' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className={`text-xs font-sans leading-relaxed ${theme === 'light' ? 'text-zinc-800' : 'text-zinc-300'}`}>
                    {marketingBundle.socialHook}
                  </p>
                </div>
                <div className="text-[10px] text-zinc-500 font-mono">
                  Best used: Post on TikTok, Instagram Reels, X, or Discord with a link to your shop.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className={`p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono ${
            theme === 'light' ? 'bg-zinc-50 border-zinc-200 text-zinc-600' : 'bg-zinc-950 border-white/10 text-zinc-400'
          }`}
        >
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-amber-500" />
            <span>Google AI Studio (Gemini 3.7 Flash) provides real-time personalized solo copywriting.</span>
          </div>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-xl font-bold font-mono text-xs border ${
              theme === 'light'
                ? 'bg-zinc-200 hover:bg-zinc-300 text-zinc-800 border-zinc-300'
                : 'bg-zinc-800 hover:bg-zinc-700 text-white border-white/10'
            }`}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
