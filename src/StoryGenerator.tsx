import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Edit3, Download, Copy, RefreshCw, Loader2, MessageSquare, List, Zap, FileText, PanelRight, Sun, Moon, Slider, Volume2, Share2, Award, Users, Hash, Sparkles } from 'lucide-react';

interface StoryOptions {
  genre: 'Fantasy' | 'Horror' | 'Romance' | 'Sci-Fi' | '';
  length: 'Short' | 'Medium' | 'Long' | '';
  tone: 'Funny' | 'Emotional' | 'Dark' | '';
  audience: 'Kids' | 'Teens' | 'Adults' | '';
}

interface StoryPart {
  title: string;
  content: string;
}

const StoryGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [options, setOptions] = useState<StoryOptions>({
    genre: '',
    length: '',
    tone: '',
    audience: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [story, setStory] = useState('');
  const [storyParts, setStoryParts] = useState<StoryPart[]>([]);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [settings, setSettings] = useState({ creativity: 70, depth: 60 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const genres = ['Fantasy', 'Horror', 'Romance', 'Sci-Fi'] as const;
  const lengths = ['Short', 'Medium', 'Long'] as const;
  const tones = ['Funny', 'Emotional', 'Dark'] as const;
  const audiences = ['Kids', 'Teens', 'Adults'] as const;

  const generateStory = async () => {
    if (!topic.trim()) return;
    setIsLoading(true);
    setStory('');
    setStoryParts([]);

    try {
      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          genre: options.genre,
          length: options.length,
          tone: options.tone,
          audience: options.audience,
          creativity: settings.creativity,
          depth: settings.depth
        })
      });
      const data = await response.json();
      if (data.success) {
        const fullStory = data.story;
        setStory(fullStory);
        setStoryParts(data.parts?.map((part: string, i: number) => ({
          title: ['Introduction', 'Middle', 'Ending'][i] || `Part ${i+1}`,
          content: part
        })) || []);
      } else {
        setStory('Error generating story. Please try again.');
      }
    } catch (error) {
      setStory('Network error. Check dev server.');
    }
    setIsLoading(false);
  };

  const copyStory = () => {
    navigator.clipboard.writeText(story);
    // Toast feedback
    alert('Story copied!');
  };

  const downloadStory = () => {
    const blob = new Blob([story], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `story-${topic.slice(0,20)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const regenerate = () => {
    setStory('');
    setStoryParts([]);
    generateStory();
  };

  const toggleEdit = () => {
    if (editing) {
      setStory(editContent);
      setStoryParts([]); // Re-split if needed
    }
    setEditing(!editing);
  };

  const updateCreativity = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({...settings, creativity: Number(e.target.value)});
  };

  const updateDepth = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({...settings, depth: Number(e.target.value)});
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gradient-to-br from-[#0a0a0c] to-[#111116]">
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <BookOpen className="w-12 h-12 text-indigo-400 drop-shadow-lg" />
              <div>
                <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-white via-indigo-100 to-purple-200 bg-clip-text text-transparent tracking-tight">
                  AI Story Generator
                </h1>
                <p className="text-slate-400 text-lg mt-2 font-medium">किसी भी topic पर amazing story बनाओ</p>
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Input & Options */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-[#1a1a22]/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
                <label className="block mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <MessageSquare className="w-6 h-6 text-indigo-400" />
                    <span className="text-xl font-bold text-white">Story Topic</span>
                  </div>
                  <textarea
                    ref={textareaRef}
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter your story topic here... e.g., A dragon who wants to be a chef"
                    className="w-full p-6 bg-slate-900/50 border border-slate-600 rounded-2xl text-white placeholder-slate-500 text-lg resize-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all h-32"
                    disabled={isLoading}
                  />
                </label>

                {/* Options Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Genre', options: genres, key: 'genre' as keyof StoryOptions },
                    { label: 'Length', options: lengths, key: 'length' as keyof StoryOptions },
                    { label: 'Tone', options: tones, key: 'tone' as keyof StoryOptions },
                    { label: 'Audience', options: audiences, key: 'audience' as keyof StoryOptions }
                  ].map(({ label, options: opts, key }) => (
                    <div key={label} className="space-y-2">
                      <label className="text-sm font-semibold text-slate-400 flex items-center gap-2">
                        <List className="w-4 h-4" /> {label}
                      </label>
                      <select
                        value={options[key as keyof StoryOptions] as string}
                        onChange={(e) => setOptions({ ...options, [key]: e.target.value as any })}
                        className="w-full p-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:border-indigo-500 transition-all"
                        disabled={isLoading}
                      >
                        <option value="">Any</option>
                        {opts.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                  ))}
                </div>

                {/* Generate Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={generateStory}
                  disabled={!topic.trim() || isLoading}
                  className="w-full mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed p-8 rounded-3xl text-2xl font-black text-white shadow-2xl hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-4 h-20"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-8 h-8 animate-spin" />
                      Generating your story...
                    </>
                  ) : (
                    <>
                      <Zap className="w-8 h-8" />
                      Generate Story
                    </>
                  )}
                </motion.button>
              </motion.div>

              {/* Story Output */}
              <AnimatePresence>
                {story && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-6"
                  >
                    {editing ? (
                      <div className="bg-[#1a1a22]/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
                        <textarea
                          value={editContent || story}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full h-96 p-6 bg-slate-900/50 border border-slate-600 rounded-2xl text-white focus:border-indigo-500"
                        />
                      </div>
                    ) : (
                      <div className="bg-[#1a1a22]/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
                        <div className="prose prose-invert max-w-none">
                          <div dangerouslySetInnerHTML={{ __html: story.replace(/\n/g, '<br>') }} />
                        </div>
                        {/* Parts */}
                        {storyParts.length > 0 && (
                          <div className="grid md:grid-cols-3 gap-4 mt-8 pt-8 border-t border-slate-700">
                            {storyParts.map((part, i) => (
                              <div key={i} className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700">
                                <h3 className="font-bold text-indigo-400 mb-3 flex items-center gap-2">
                                  <FileText className="w-5 h-5" /> {part.title}
                                </h3>
                                <p className="text-slate-200 leading-relaxed">{part.content}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-4 justify-center">
                      <motion.button whileHover={{ scale: 1.05 }} onClick={copyStory} className="flex items-center gap-2 bg-green-600/80 hover:bg-green-500 px-8 py-4 rounded-2xl font-bold text-white border border-green-500/50 shadow-lg">
                        <Copy className="w-5 h-5" /> Copy Story
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.05 }} onClick={downloadStory} className="flex items-center gap-2 bg-blue-600/80 hover:bg-blue-500 px-8 py-4 rounded-2xl font-bold text-white border border-blue-500/50 shadow-lg">
                        <Download className="w-5 h-5" /> Download
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.05 }} onClick={toggleEdit} className="flex items-center gap-2 bg-orange-600/80 hover:bg-orange-500 px-8 py-4 rounded-2xl font-bold text-white border border-orange-500/50 shadow-lg">
                        <Edit3 className="w-5 h-5" /> {editing ? 'Save' : 'Edit'}
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.05 }} onClick={regenerate} className="flex items-center gap-2 bg-purple-600/80 hover:bg-purple-500 px-8 py-4 rounded-2xl font-bold text-white border border-purple-500/50 shadow-lg" disabled={isLoading}>
                        <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} /> Regenerate
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Settings Panel */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1 space-y-6">
              <div className="bg-[#1a1a22]/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-2xl sticky top-6 h-fit">
                <div className="flex items-center gap-3 mb-6">
                  <PanelRight className="w-6 h-6 text-indigo-400" />
                  <h3 className="text-xl font-bold text-white">AI Settings</h3>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="flex items-center gap-3 text-sm font-semibold text-slate-300 mb-3">
                      <Sparkles className="w-5 h-5" /> Creativity
                      <span className="ml-auto text-indigo-400 font-bold">{settings.creativity}%</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.creativity}
                      onChange={updateCreativity}
                      className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:shadow-lg"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-3 text-sm font-semibold text-slate-300 mb-3">
                      <Hash className="w-5 h-5" /> Story Depth
                      <span className="ml-auto text-indigo-400 font-bold">{settings.depth}%</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.depth}
                      onChange={updateDepth}
                      className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500 [&::-webkit-slider-thumb]:shadow-lg"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryGenerator;

