import { useState, useEffect, useCallback, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, RotateCcw, Trophy, Target, Zap, TrendingUp, Play, Sun, Moon, Settings, Gamepad2, Hash, Code, Type } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";

interface TypingTestProps {}

interface TestStats {
  wpm: number;
  accuracy: number;
  errors: number;
  charactersTyped: number;
  timeElapsed: number;
}

// Word pools for generating dynamic content
const WORD_POOLS = {
  simple: {
    common: ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use'],
    nouns: ['cat', 'dog', 'car', 'house', 'tree', 'book', 'water', 'food', 'time', 'person', 'year', 'hand', 'eye', 'work', 'life', 'day', 'night', 'world', 'home', 'school', 'family', 'friend', 'place', 'door', 'room', 'city', 'country', 'story', 'word', 'music', 'game', 'paper', 'money', 'business'],
    verbs: ['run', 'walk', 'talk', 'eat', 'sleep', 'work', 'play', 'read', 'write', 'think', 'look', 'feel', 'know', 'want', 'give', 'take', 'come', 'make', 'help', 'learn', 'teach', 'build', 'create', 'love', 'live', 'move', 'grow', 'change', 'start', 'stop', 'open', 'close'],
    adjectives: ['good', 'bad', 'big', 'small', 'new', 'old', 'hot', 'cold', 'fast', 'slow', 'happy', 'sad', 'easy', 'hard', 'light', 'dark', 'clean', 'dirty', 'safe', 'dangerous', 'beautiful', 'ugly', 'smart', 'funny', 'quiet', 'loud', 'soft', 'strong', 'weak', 'kind', 'mean', 'brave']
  },
  medium: {
    common: ['however', 'therefore', 'although', 'because', 'through', 'between', 'against', 'without', 'within', 'beneath', 'beyond', 'during', 'before', 'after', 'while', 'until', 'unless', 'though', 'since', 'where', 'whether', 'either', 'neither', 'both', 'each', 'every', 'many', 'several', 'various', 'different', 'similar', 'particular', 'specific', 'general'],
    nouns: ['algorithm', 'technology', 'development', 'programming', 'software', 'computer', 'internet', 'database', 'security', 'network', 'system', 'application', 'framework', 'architecture', 'platform', 'interface', 'solution', 'analysis', 'research', 'innovation', 'strategy', 'implementation', 'optimization', 'performance', 'efficiency', 'complexity', 'functionality', 'reliability', 'scalability', 'integration', 'automation', 'infrastructure'],
    verbs: ['implement', 'develop', 'analyze', 'optimize', 'configure', 'integrate', 'deploy', 'maintain', 'troubleshoot', 'upgrade', 'enhance', 'evaluate', 'investigate', 'document', 'collaborate', 'communicate', 'coordinate', 'facilitate', 'demonstrate', 'validate', 'verify', 'execute', 'process', 'transform', 'establish', 'determine', 'identify', 'customize', 'synchronize', 'authenticate', 'authorize', 'encrypt'],
    adjectives: ['sophisticated', 'comprehensive', 'efficient', 'reliable', 'scalable', 'robust', 'flexible', 'innovative', 'advanced', 'complex', 'dynamic', 'interactive', 'responsive', 'intelligent', 'automated', 'integrated', 'optimized', 'secure', 'compatible', 'professional', 'enterprise', 'strategic', 'systematic', 'methodical', 'analytical', 'technical', 'practical', 'theoretical', 'experimental', 'collaborative', 'productive', 'effective']
  },
  hard: {
    common: ['consequently', 'furthermore', 'nevertheless', 'notwithstanding', 'simultaneously', 'predominantly', 'significantly', 'substantially', 'approximately', 'specifically', 'particularly', 'especially', 'generally', 'typically', 'frequently', 'occasionally', 'ultimately', 'eventually', 'immediately', 'subsequently', 'previously', 'currently', 'recently', 'historically', 'theoretically', 'practically', 'potentially', 'presumably', 'apparently', 'obviously', 'certainly', 'definitely', 'absolutely', 'relatively'],
    nouns: ['architecture', 'infrastructure', 'implementation', 'optimization', 'configuration', 'authentication', 'authorization', 'cryptography', 'vulnerability', 'methodology', 'abstraction', 'encapsulation', 'polymorphism', 'inheritance', 'algorithm', 'complexity', 'efficiency', 'scalability', 'reliability', 'maintainability', 'extensibility', 'interoperability', 'compatibility', 'performance', 'throughput', 'latency', 'bandwidth', 'protocol', 'interface', 'specification', 'documentation', 'deployment'],
    verbs: ['synthesize', 'orchestrate', 'architect', 'conceptualize', 'substantiate', 'corroborate', 'extrapolate', 'interpolate', 'amalgamate', 'consolidate', 'differentiate', 'aggregate', 'enumerate', 'iterate', 'instantiate', 'serialize', 'deserialize', 'authenticate', 'authorize', 'validate', 'optimize', 'parallelize', 'synchronize', 'asynchronize', 'encapsulate', 'abstract', 'modularize', 'refactor', 'decompose', 'synthesize', 'collaborate', 'facilitate'],
    adjectives: ['sophisticated', 'intricate', 'comprehensive', 'multifaceted', 'heterogeneous', 'homogeneous', 'hierarchical', 'distributed', 'centralized', 'decentralized', 'asynchronous', 'synchronous', 'concurrent', 'parallel', 'sequential', 'iterative', 'recursive', 'algorithmic', 'heuristic', 'deterministic', 'stochastic', 'probabilistic', 'statistical', 'empirical', 'analytical', 'systematic', 'methodical', 'strategic', 'tactical', 'operational', 'fundamental', 'essential']
  }
};

const PUNCTUATION = ['.', ',', '!', '?', ';', ':', '"', "'", '-', '(', ')', '[', ']', '{', '}'];
const NUMBERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const SPECIAL_CHARS = ['@', '#', '$', '%', '&', '*', '+', '=', '<', '>', '/', '\\', '|', '~', '`'];

// Generate dynamic paragraph based on difficulty and duration
const generateDynamicParagraph = (difficulty: string, duration: number): string => {
  const wordPool = WORD_POOLS[difficulty as keyof typeof WORD_POOLS];
  const targetWords = duration === 60 ? 50 : duration === 180 ? 150 : 250;
  
  let words: string[] = [];
  let sentenceLength = 0;
  const maxSentenceLength = difficulty === 'simple' ? 8 : difficulty === 'medium' ? 12 : 16;
  
  for (let i = 0; i < targetWords; i++) {
    const categories = Object.keys(wordPool);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const categoryWords = wordPool[randomCategory as keyof typeof wordPool];
    const randomWord = categoryWords[Math.floor(Math.random() * categoryWords.length)];
    
    words.push(randomWord);
    sentenceLength++;
    
    // Add punctuation and tricky characters
    if (sentenceLength >= maxSentenceLength || Math.random() < 0.15) {
      const punctuation = PUNCTUATION[Math.floor(Math.random() * 4)]; // Favor common punctuation
      words[words.length - 1] += punctuation;
      sentenceLength = 0;
      
      // Capitalize next word
      if (i < targetWords - 1) {
        i++;
        const nextCategory = categories[Math.floor(Math.random() * categories.length)];
        const nextCategoryWords = wordPool[nextCategory as keyof typeof wordPool];
        const nextWord = nextCategoryWords[Math.floor(Math.random() * nextCategoryWords.length)];
        words.push(nextWord.charAt(0).toUpperCase() + nextWord.slice(1));
      }
    }
    
    // Add numbers and special characters for medium/hard difficulties
    if (difficulty !== 'simple' && Math.random() < 0.05) {
      if (Math.random() < 0.7) {
        words.push(NUMBERS[Math.floor(Math.random() * NUMBERS.length)]);
      } else {
        words.push(SPECIAL_CHARS[Math.floor(Math.random() * SPECIAL_CHARS.length)]);
      }
    }
  }
  
  // Ensure first word is capitalized
  if (words.length > 0) {
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  }
  
  return words.join(' ');
};

// Typing games data
const TYPING_GAMES = {
  wordRace: {
    name: 'Word Race',
    description: 'Type words as fast as possible!',
    icon: Zap,
    generateContent: (difficulty: string) => {
      const pools = WORD_POOLS[difficulty as keyof typeof WORD_POOLS];
      const allWords = Object.values(pools).flat();
      return allWords.sort(() => Math.random() - 0.5).slice(0, 20).join(' ');
    }
  },
  codeChallenge: {
    name: 'Code Challenge',
    description: 'Type code snippets accurately',
    icon: Code,
    generateContent: (difficulty: string) => {
      const simpleCode = [
        'const name = "John";',
        'function add(a, b) { return a + b; }',
        'let array = [1, 2, 3, 4, 5];',
        'if (x > 0) { console.log("positive"); }'
      ];
      const mediumCode = [
        'const handleClick = () => { console.log("Hello!"); };',
        'import React, { useState } from "react";',
        'const users = data.filter(user => user.active);',
        'fetch("/api/users").then(res => res.json());'
      ];
      const hardCode = [
        'const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);',
        'function fibonacci(n) { return n < 2 ? n : fibonacci(n-1) + fibonacci(n-2); }',
        'const result = await Promise.allSettled(promises.map(p => p.catch(e => e)));',
        'class Component extends React.PureComponent<Props, State> { render() { } }'
      ];
      
      const codeSnippets = difficulty === 'simple' ? simpleCode : 
                          difficulty === 'medium' ? mediumCode : hardCode;
      return codeSnippets.sort(() => Math.random() - 0.5).slice(0, 3).join(' ');
    }
  },
  symbolPractice: {
    name: 'Symbol Practice',
    description: 'Master special characters and symbols',
    icon: Hash,
    generateContent: (difficulty: string) => {
      const symbols = ['@#$%', '{}[]', '()+=', '<>/\\', '|~`&', '*^!?', '.,;:', '"-\'_'];
      return symbols.sort(() => Math.random() - 0.5).slice(0, 6).join(' ');
    }
  }
};

export const TypingTest = ({}: TypingTestProps) => {
  const { theme, toggleTheme } = useTheme();
  
  // Test state
  const [testText, setTestText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [selectedTime, setSelectedTime] = useState(60);
  const [difficulty, setDifficulty] = useState('simple');
  const [gameMode, setGameMode] = useState<string | null>(null);
  
  // Stats
  const [stats, setStats] = useState<TestStats>({
    wpm: 0,
    accuracy: 100,
    errors: 0,
    charactersTyped: 0,
    timeElapsed: 0,
  });
  
  const inputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Generate new text when difficulty or time changes
  useEffect(() => {
    if (gameMode) {
      const game = TYPING_GAMES[gameMode as keyof typeof TYPING_GAMES];
      setTestText(game.generateContent(difficulty));
    } else {
      setTestText(generateDynamicParagraph(difficulty, selectedTime));
    }
  }, [difficulty, selectedTime, gameMode]);
  
  // Timer logic
  useEffect(() => {
    if (isActive && timeLeft > 0 && !isCompleted) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            setIsCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLeft, isCompleted]);
  
  // Calculate stats
  const calculateStats = useCallback(() => {
    const timeElapsed = selectedTime - timeLeft;
    const charactersTyped = currentIndex;
    const wordsTyped = Math.floor(charactersTyped / 5);
    const minutes = timeElapsed / 60;
    const wpm = minutes > 0 ? Math.round(wordsTyped / minutes) : 0;
    
    let errors = 0;
    for (let i = 0; i < userInput.length; i++) {
      if (userInput[i] !== testText[i]) {
        errors++;
      }
    }
    
    const accuracy = userInput.length > 0 ? Math.round(((userInput.length - errors) / userInput.length) * 100) : 100;
    
    setStats({
      wpm,
      accuracy,
      errors,
      charactersTyped,
      timeElapsed,
    });
  }, [currentIndex, userInput, testText, timeLeft, selectedTime]);
  
  useEffect(() => {
    calculateStats();
  }, [calculateStats]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (!isActive && value.length === 1) {
      setIsActive(true);
    }
    
    if (value.length <= testText.length) {
      setUserInput(value);
      setCurrentIndex(value.length);
      
      if (value.length === testText.length) {
        setIsActive(false);
        setIsCompleted(true);
      }
    }
  };
  
  const startTest = () => {
    if (gameMode) {
      const game = TYPING_GAMES[gameMode as keyof typeof TYPING_GAMES];
      setTestText(game.generateContent(difficulty));
    } else {
      setTestText(generateDynamicParagraph(difficulty, selectedTime));
    }
    
    setUserInput('');
    setCurrentIndex(0);
    setIsActive(true);
    setIsCompleted(false);
    setTimeLeft(selectedTime);
    inputRef.current?.focus();
  };
  
  const resetTest = () => {
    setUserInput('');
    setCurrentIndex(0);
    setIsActive(false);
    setIsCompleted(false);
    setTimeLeft(selectedTime);
    setGameMode(null);
    setTestText(generateDynamicParagraph(difficulty, selectedTime));
    inputRef.current?.focus();
  };
  
  const renderText = () => {
    return testText.split('').map((char, index) => {
      let className = 'transition-all duration-150 ';
      
      if (index < userInput.length) {
        className += userInput[index] === char 
          ? 'text-success bg-success/10 rounded-sm' 
          : 'text-destructive bg-destructive/10 rounded-sm';
      } else if (index === currentIndex) {
        className += 'bg-primary/20 animate-pulse rounded-sm';
      } else {
        className += 'text-muted-foreground';
      }
      
      return (
        <span key={index} className={className}>
          {char}
        </span>
      );
    });
  };
  
  const progress = testText.length > 0 ? (currentIndex / testText.length) * 100 : 0;
  
  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Type Speed Test
          </h1>
          <p className="text-muted-foreground mt-2">
            {gameMode ? `Playing: ${TYPING_GAMES[gameMode as keyof typeof TYPING_GAMES].name}` : 'Test your typing speed and accuracy'}
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
      
      {/* Controls */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Game Mode Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Game Mode:</label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={gameMode === null ? "default" : "outline"}
                size="sm"
                onClick={() => setGameMode(null)}
                className="flex items-center gap-2"
              >
                <Type className="h-4 w-4" />
                Standard
              </Button>
              {Object.entries(TYPING_GAMES).map(([key, game]) => {
                const Icon = game.icon;
                return (
                  <Button
                    key={key}
                    variant={gameMode === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setGameMode(key)}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {game.name}
                  </Button>
                );
              })}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Time Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Duration:</label>
              <div className="flex gap-2">
                {[60, 180, 300].map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTime(time)}
                    disabled={isActive}
                  >
                    {time === 60 ? '1min' : time === 180 ? '3min' : '5min'}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Difficulty Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Difficulty:</label>
              <div className="flex gap-2">
                {['simple', 'medium', 'hard'].map((diff) => (
                  <Button
                    key={diff}
                    variant={difficulty === diff ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDifficulty(diff)}
                    disabled={isActive}
                    className="capitalize"
                  >
                    {diff}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={startTest} disabled={isActive} className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                {isCompleted ? 'Try Again' : 'Start Test'}
              </Button>
              <Button variant="outline" onClick={resetTest} className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Time</p>
              <p className="text-2xl font-bold">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            <div>
              <p className="text-sm text-muted-foreground">WPM</p>
              <p className="text-2xl font-bold">{stats.wpm}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Accuracy</p>
              <p className="text-2xl font-bold">{stats.accuracy}%</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-purple-500" />
            <div>
              <p className="text-sm text-muted-foreground">Errors</p>
              <p className="text-2xl font-bold">{stats.errors}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-orange-500" />
            <div>
              <p className="text-sm text-muted-foreground">Characters</p>
              <p className="text-2xl font-bold">{stats.charactersTyped}</p>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Progress */}
      <Card className="p-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </Card>
      
      {/* Typing Area */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="text-lg leading-relaxed font-mono min-h-[200px] p-4 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/20">
            {renderText()}
          </div>
          
          <div className="space-y-2">
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={handleInputChange}
              className="w-full p-3 text-lg font-mono bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              placeholder={isActive ? "Keep typing..." : "Click 'Start Test' to begin"}
              disabled={!isActive || isCompleted}
              autoComplete="off"
              spellCheck="false"
            />
            
            {!isActive && !isCompleted && (
              <Badge variant="secondary" className="w-fit">
                Press "Start Test" to begin
              </Badge>
            )}
            
            {isActive && (
              <Badge variant="default" className="w-fit animate-pulse">
                Keep typing...
              </Badge>
            )}
            
            {isCompleted && (
              <Badge variant="outline" className="w-fit">
                Test completed! WPM: {stats.wpm} | Accuracy: {stats.accuracy}%
              </Badge>
            )}
          </div>
        </div>
      </Card>
      
      {/* Game Descriptions */}
      {gameMode && (
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Gamepad2 className="h-4 w-4 text-primary" />
            <p className="text-sm text-muted-foreground">
              {TYPING_GAMES[gameMode as keyof typeof TYPING_GAMES].description}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};