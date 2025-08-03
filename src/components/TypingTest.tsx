import { useState, useEffect, useCallback, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, RotateCcw, Trophy, Target, Zap, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface TypingTestProps {}

interface TestStats {
  wpm: number;
  accuracy: number;
  errors: number;
  charactersTyped: number;
  timeElapsed: number;
}

const sampleTexts = [
  "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet at least once. It is commonly used for testing typewriters and computer keyboards.",
  "In the midst of winter, I found there was, within me, an invincible summer. And that makes me happy. For it says that no matter how hard the world pushes against me, within me, there's something stronger.",
  "Technology is best when it brings people together. The future belongs to those who believe in the beauty of their dreams. Innovation distinguishes between a leader and a follower.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts. The only way to do great work is to love what you do. Stay hungry, stay foolish.",
];

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
    const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    setText(randomText);
    setUserInput("");
    setCurrentIndex(0);
    setTimeLeft(selectedTime);
    setIsActive(false);
    setIsFinished(false);
    setStartTime(null);
    setStats({
      wpm: 0,
      accuracy: 100,
      errors: 0,
      charactersTyped: 0,
      timeElapsed: 0,
    });
    
    // Focus input after reset
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFinished) return;

    const value = e.target.value;
    
    // Start test on first character
    if (!isActive && !startTime) {
      setIsActive(true);
      setStartTime(Date.now());
    }

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
                disabled={isFinished}
                autoFocus
              />
            </div>
            
            <div className="flex gap-4 justify-center">
              <Button
                onClick={resetTest}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Test
              </Button>
              
              {!isActive && !isFinished && userInput.length === 0 && (
                <Badge variant="secondary" className="px-4 py-2">
                  Click here and start typing to begin
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