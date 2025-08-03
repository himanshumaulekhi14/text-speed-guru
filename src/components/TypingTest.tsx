import { useState, useEffect, useCallback, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, RotateCcw, Trophy, Target, Zap, TrendingUp, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface TypingTestProps {}

interface TestStats {
  wpm: number;
  accuracy: number;
  errors: number;
  charactersTyped: number;
  timeElapsed: number;
}

const textSamples = {
  60: [ // 1 minute texts
    "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet at least once. It is commonly used for testing typewriters and computer keyboards. Practice makes perfect when it comes to typing speed and accuracy.",
    "In the midst of winter, I found there was, within me, an invincible summer. And that makes me happy. For it says that no matter how hard the world pushes against me, within me, there's something stronger. The human spirit is resilient.",
    "Technology is best when it brings people together. The future belongs to those who believe in the beauty of their dreams. Innovation distinguishes between a leader and a follower. Success comes to those who dare to begin.",
  ],
  180: [ // 3 minute texts
    "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet at least once. It is commonly used for testing typewriters and computer keyboards. Practice makes perfect when it comes to typing speed and accuracy. Technology has revolutionized the way we communicate and work. From the invention of the printing press to the development of the internet, each advancement has brought new opportunities and challenges. In today's digital age, typing skills have become more important than ever before. Whether you're writing emails, creating documents, or coding software, the ability to type quickly and accurately can significantly improve your productivity. The key to developing excellent typing skills lies in consistent practice and proper technique. Start by learning the correct finger placement on the keyboard and gradually increase your speed while maintaining accuracy. Remember, it's better to type slowly and correctly than to type quickly with many errors. As you continue to practice, you'll find that your muscle memory develops, allowing you to type without looking at the keyboard. This skill, known as touch typing, is essential for anyone who spends significant time working on a computer.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts. The only way to do great work is to love what you do. Stay hungry, stay foolish. These words of wisdom have inspired countless individuals to pursue their dreams and overcome obstacles. In life, we face numerous challenges that test our resolve and determination. How we respond to these challenges often determines our path forward. Resilience is not about avoiding failure, but about learning from it and using those lessons to grow stronger. Every successful person has faced setbacks and disappointments along the way. What sets them apart is their ability to persevere and maintain their focus on their goals. The journey to success is rarely linear. It's filled with ups and downs, victories and defeats. But each experience, whether positive or negative, contributes to our growth and development. The most important thing is to never give up on your dreams, no matter how difficult the path may seem. With dedication, hard work, and persistence, anything is possible.",
    "Innovation is the lifeblood of progress. Throughout history, human beings have demonstrated an remarkable ability to adapt, create, and solve complex problems. From the wheel to the smartphone, each innovation has built upon previous discoveries, creating a foundation for future advancements. In today's rapidly changing world, the pace of innovation has accelerated dramatically. New technologies emerge daily, transforming industries and reshaping the way we live and work. Artificial intelligence, renewable energy, biotechnology, and quantum computing are just a few examples of fields experiencing revolutionary breakthroughs. However, innovation is not limited to technology alone. It encompasses new ways of thinking, organizing, and approaching challenges in every aspect of human endeavor. Social innovations, such as new educational methods or community organizing strategies, can be just as transformative as technological breakthroughs. The key to fostering innovation lies in creating environments that encourage creativity, experimentation, and risk-taking. This requires open-minded leadership, diverse perspectives, and a willingness to learn from both successes and failures.",
  ],
  300: [ // 5 minute texts
    "The art of communication has evolved dramatically throughout human history. From ancient cave paintings to modern digital messaging, humans have always sought ways to share ideas, emotions, and information with one another. Language itself is perhaps humanity's greatest innovation, allowing us to transmit complex thoughts and preserve knowledge across generations. In today's interconnected world, effective communication skills are more important than ever before. Whether in personal relationships, professional settings, or global interactions, the ability to express oneself clearly and understand others is crucial for success and harmony. Written communication, in particular, has taken on new significance in the digital age. Emails, text messages, social media posts, and online documents have become primary means of sharing information and maintaining relationships. This shift has made typing skills increasingly valuable, as our ability to communicate effectively often depends on how quickly and accurately we can input text into various digital platforms. The development of strong typing skills requires patience, practice, and proper technique. Touch typing, the ability to type without looking at the keyboard, represents the pinnacle of typing proficiency. This skill allows for faster input speeds, reduced errors, and the ability to focus on content rather than the mechanical process of typing. Learning touch typing involves understanding proper finger placement, developing muscle memory, and gradually increasing speed while maintaining accuracy. The standard QWERTY keyboard layout, while not the most efficient possible design, has become the global standard and remains the foundation for most typing instruction. Regular practice sessions, combined with proper posture and ergonomic considerations, can help anyone develop excellent typing skills over time.",
    "The concept of education has undergone significant transformation over the centuries. Traditional classroom-based learning, while still important, is no longer the only pathway to knowledge acquisition. The rise of online learning platforms, educational technology, and alternative credentialing systems has democratized access to education and created new opportunities for lifelong learning. This shift has been accelerated by global events that have forced educational institutions to adapt quickly to remote learning environments. Students and educators alike have had to develop new skills and approaches to teaching and learning. The integration of technology into education has revealed both opportunities and challenges. On one hand, digital tools can enhance learning experiences, provide personalized instruction, and connect learners with resources and experts from around the world. On the other hand, issues such as digital divide, screen fatigue, and the need for self-directed learning skills have become more apparent. The future of education will likely involve a hybrid approach that combines the best aspects of traditional and digital learning methods. Critical thinking, creativity, and adaptability will become even more important as students prepare for careers in an rapidly changing job market. Educators must evolve their roles from information deliverers to learning facilitators, helping students develop the skills they need to navigate an increasingly complex world. The goal is not just to transfer knowledge, but to foster curiosity, creativity, and the ability to learn continuously throughout life.",
    "Environmental sustainability has emerged as one of the defining challenges of our time. As the global population continues to grow and consumption patterns evolve, the pressure on natural resources and ecosystems has intensified. Climate change, biodiversity loss, pollution, and resource depletion are interconnected issues that require comprehensive and coordinated responses. The transition to sustainable practices affects every aspect of human activity, from energy production and transportation to agriculture and manufacturing. Renewable energy technologies such as solar, wind, and hydroelectric power are becoming increasingly cost-effective and efficient, offering viable alternatives to fossil fuels. Electric vehicles are gaining market share, supported by improving battery technology and expanding charging infrastructure. In agriculture, sustainable farming practices aim to maintain productivity while reducing environmental impact through techniques such as crop rotation, integrated pest management, and precision agriculture. The circular economy concept, which emphasizes reuse, recycling, and waste reduction, is gaining traction in various industries. This approach seeks to minimize waste and maximize resource efficiency by designing products and systems that can be continuously cycled rather than disposed of after single use. Individual actions, while important, must be complemented by systemic changes in policies, business practices, and social norms. Governments, corporations, and communities all have roles to play in creating a more sustainable future. Education and awareness are crucial for building support for necessary changes and empowering people to make informed decisions about their environmental impact.",
  ]
};

const timeOptions = [
  { label: "1 min", value: 60 },
  { label: "3 min", value: 180 },
  { label: "5 min", value: 300 },
];

export const TypingTest = () => {
  const [text, setText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [selectedTime, setSelectedTime] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [stats, setStats] = useState<TestStats>({
    wpm: 0,
    accuracy: 100,
    errors: 0,
    charactersTyped: 0,
    timeElapsed: 0,
  });
  const [startTime, setStartTime] = useState<number | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize test with random text
  useEffect(() => {
    resetTest();
  }, []);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            setIsFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // Calculate stats in real-time
  useEffect(() => {
    if (startTime && userInput.length > 0) {
      const timeElapsed = (Date.now() - startTime) / 1000 / 60; // in minutes
      const charactersTyped = userInput.length;
      const wordsTyped = charactersTyped / 5; // Standard: 5 characters = 1 word
      const wpm = timeElapsed > 0 ? Math.round(wordsTyped / timeElapsed) : 0;
      
      let errors = 0;
      for (let i = 0; i < userInput.length; i++) {
        if (userInput[i] !== text[i]) {
          errors++;
        }
      }
      
      const accuracy = charactersTyped > 0 ? Math.round(((charactersTyped - errors) / charactersTyped) * 100) : 100;

      setStats({
        wpm,
        accuracy,
        errors,
        charactersTyped,
        timeElapsed: (Date.now() - startTime) / 1000,
      });
    }
  }, [userInput, startTime, text]);

  const resetTest = () => {
    const textsForDuration = textSamples[selectedTime as keyof typeof textSamples] || textSamples[60];
    const randomText = textsForDuration[Math.floor(Math.random() * textsForDuration.length)];
    setText(randomText);
    setUserInput("");
    setCurrentIndex(0);
    setTimeLeft(selectedTime);
    setIsActive(false);
    setIsFinished(false);
    setIsStarted(false);
    setStartTime(null);
    setStats({
      wpm: 0,
      accuracy: 100,
      errors: 0,
      charactersTyped: 0,
      timeElapsed: 0,
    });
  };

  const startTest = () => {
    setIsStarted(true);
    setIsActive(true);
    setStartTime(Date.now());
    // Focus input after start
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFinished || !isStarted) return;

    const value = e.target.value;

    // Prevent typing beyond text length
    if (value.length <= text.length) {
      setUserInput(value);
      setCurrentIndex(value.length);
    }

    // Check if test is complete
    if (value.length === text.length) {
      setIsActive(false);
      setIsFinished(true);
    }
  };

  const handleTimeChange = (time: number) => {
    setSelectedTime(time);
    setTimeLeft(time);
    resetTest();
  };

  const getCharacterClass = (index: number) => {
    if (index < userInput.length) {
      return userInput[index] === text[index] 
        ? "text-correct-char bg-correct-char/10" 
        : "text-incorrect-char bg-incorrect-char/20";
    } else if (index === currentIndex) {
      return "text-current-char bg-current-char/20 animate-pulse";
    }
    return "text-untyped-char";
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((selectedTime - timeLeft) / selectedTime) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            TypeSpeed Guru
          </h1>
          <p className="text-muted-foreground text-lg">
            Test and improve your typing speed
          </p>
        </div>

        {/* Time Selection */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Test Duration
            </h2>
            <div className="flex gap-2">
              {timeOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={selectedTime === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTimeChange(option.value)}
                  disabled={isActive}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>{formatTime(timeLeft)} remaining</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </Card>

        {/* Real-time Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">WPM</span>
            </div>
            <div className="text-2xl font-bold text-primary">{stats.wpm}</div>
          </Card>
          
          <Card className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Target className="w-4 h-4 text-success" />
              <span className="text-sm font-medium text-muted-foreground">Accuracy</span>
            </div>
            <div className="text-2xl font-bold text-success">{stats.accuracy}%</div>
          </Card>
          
          <Card className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-warning" />
              <span className="text-sm font-medium text-muted-foreground">Errors</span>
            </div>
            <div className="text-2xl font-bold text-warning">{stats.errors}</div>
          </Card>
          
          <Card className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-muted-foreground">Characters</span>
            </div>
            <div className="text-2xl font-bold text-accent">{stats.charactersTyped}</div>
          </Card>
        </div>

        {/* Typing Area */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="relative">
              <div 
                className="text-lg leading-relaxed p-4 bg-muted/50 rounded-lg font-mono min-h-[120px] cursor-text"
                onClick={() => inputRef.current?.focus()}
              >
                {text.split('').map((char, index) => (
                  <span
                    key={index}
                    className={cn(
                      "transition-all duration-75",
                      getCharacterClass(index)
                    )}
                  >
                    {char}
                  </span>
                ))}
              </div>
              
              {/* Hidden input */}
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={handleInputChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={isFinished || !isStarted}
                autoFocus={isStarted}
              />
            </div>
            
            <div className="flex gap-4 justify-center items-center">
              {!isStarted && !isFinished && (
                <Button
                  onClick={startTest}
                  size="lg"
                  className="flex items-center gap-2 px-8"
                >
                  <Play className="w-5 h-5" />
                  Start Test
                </Button>
              )}
              
              <Button
                onClick={resetTest}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Test
              </Button>
              
              {isStarted && !isFinished && (
                <Badge variant="secondary" className="px-4 py-2">
                  Keep typing...
                </Badge>
              )}
            </div>
          </div>
        </Card>

        {/* Results */}
        {isFinished && (
          <Card className="p-6 border-primary/20 bg-primary/5">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
                <Trophy className="w-6 h-6" />
                Test Complete!
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{stats.wpm}</div>
                  <div className="text-sm text-muted-foreground">Words per minute</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-success">{stats.accuracy}%</div>
                  <div className="text-sm text-muted-foreground">Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-warning">{stats.errors}</div>
                  <div className="text-sm text-muted-foreground">Errors</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent">{Math.round(stats.timeElapsed)}s</div>
                  <div className="text-sm text-muted-foreground">Time taken</div>
                </div>
              </div>
              
              <Button onClick={resetTest} className="mt-4">
                Try Again
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};