import { useState, useEffect, useCallback, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, RotateCcw, Trophy, Target, Zap, TrendingUp, Play, Sun, Moon, Settings } from "lucide-react";
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

const difficultyTexts = {
  simple: {
    60: [
      "The cat sat on the mat. It was a big cat with soft fur. The cat likes to play with a ball. The ball is red and round. The cat runs fast. It jumps high. The cat is happy. The sun is bright today. Birds sing in the trees. The grass is green and fresh.",
      "I like to read books. Books have many stories. Some stories are fun. Some stories are sad. I read every day. Reading helps me learn new things. I have many books at home. My favorite book is about a dog. The dog is very smart and kind.",
      "We go to the park to play. The park has swings and slides. Children laugh and run around. Parents sit on benches and watch. The sky is blue with white clouds. Flowers grow in the garden. It is a beautiful day to be outside and have fun.",
    ],
    180: [
      "The cat sat on the mat. It was a big cat with soft fur. The cat likes to play with a ball. The ball is red and round. The cat runs fast. It jumps high. The cat is happy. The sun is bright today. Birds sing in the trees. The grass is green and fresh. I like to read books. Books have many stories. Some stories are fun. Some stories are sad. I read every day. Reading helps me learn new things. I have many books at home. My favorite book is about a dog. The dog is very smart and kind. We go to the park to play. The park has swings and slides. Children laugh and run around. Parents sit on benches and watch. The sky is blue with white clouds. Flowers grow in the garden. It is a beautiful day to be outside and have fun. The old man walks his dog every morning. The dog wags its tail when it sees friends. They walk down the same path each day. The path goes through a quiet neighborhood. Houses line both sides of the street. Some houses have red doors. Others have blue or green doors. Each house has a small garden in front. People plant flowers and trees in their gardens. The flowers are many colors like pink, yellow, and purple.",
      "My family likes to cook together. We make simple meals that taste good. Mom cuts the vegetables while Dad cooks the meat. I help by setting the table and washing the dishes. We always eat dinner together and talk about our day. After dinner, we sometimes play games or watch a movie. On weekends, we visit our grandparents who live nearby. They have a big house with a nice yard where we can play. Grandma makes the best cookies in the world. Grandpa tells us funny stories about when he was young. We love spending time with our family because they make us feel happy and loved. Family is the most important thing in life because they are always there to help you when you need them most.",
      "School is a place where children go to learn new things every day. Teachers help students understand math, reading, writing, and science. Students sit at desks and listen to lessons. They raise their hands when they have questions. At lunch time, everyone eats together in the cafeteria. Some children bring lunch from home while others buy food at school. After lunch, students play outside during recess. They run, jump, and play games with their friends. The playground has swings, slides, and monkey bars. When school ends, children go home to their families. Some take the bus while others walk or get picked up by their parents.",
    ],
    300: [
      "The cat sat on the mat. It was a big cat with soft fur. The cat likes to play with a ball. The ball is red and round. The cat runs fast. It jumps high. The cat is happy. The sun is bright today. Birds sing in the trees. The grass is green and fresh. I like to read books. Books have many stories. Some stories are fun. Some stories are sad. I read every day. Reading helps me learn new things. I have many books at home. My favorite book is about a dog. The dog is very smart and kind. We go to the park to play. The park has swings and slides. Children laugh and run around. Parents sit on benches and watch. The sky is blue with white clouds. Flowers grow in the garden. It is a beautiful day to be outside and have fun. The old man walks his dog every morning. The dog wags its tail when it sees friends. They walk down the same path each day. The path goes through a quiet neighborhood. Houses line both sides of the street. Some houses have red doors. Others have blue or green doors. Each house has a small garden in front. People plant flowers and trees in their gardens. The flowers are many colors like pink, yellow, and purple. My family likes to cook together. We make simple meals that taste good. Mom cuts the vegetables while Dad cooks the meat. I help by setting the table and washing the dishes. We always eat dinner together and talk about our day. After dinner, we sometimes play games or watch a movie. On weekends, we visit our grandparents who live nearby. They have a big house with a nice yard where we can play. Grandma makes the best cookies in the world. Grandpa tells us funny stories about when he was young. We love spending time with our family because they make us feel happy and loved. Family is the most important thing in life because they are always there to help you when you need them most. School is a place where children go to learn new things every day. Teachers help students understand math, reading, writing, and science. Students sit at desks and listen to lessons. They raise their hands when they have questions. At lunch time, everyone eats together in the cafeteria.",
    ],
  },
  medium: {
    60: [
      "Technology has fundamentally transformed our daily experiences and professional interactions. Modern communication platforms enable instantaneous global connectivity, while sophisticated algorithms personalize our digital encounters. Artificial intelligence continues to revolutionize industries, creating unprecedented opportunities for innovation and growth.",
      "Environmental sustainability requires comprehensive strategies addressing climate change, resource conservation, and ecosystem preservation. Renewable energy technologies, including solar and wind power, offer promising alternatives to traditional fossil fuel dependencies. Global cooperation remains essential for implementing effective environmental policies.",
      "Educational methodologies have evolved significantly through digital integration and pedagogical research. Interactive learning platforms enhance student engagement while personalized instruction accommodates diverse learning styles. Critical thinking and problem-solving skills remain fundamental objectives in contemporary academic curricula.",
    ],
    180: [
      "Technology has fundamentally transformed our daily experiences and professional interactions. Modern communication platforms enable instantaneous global connectivity, while sophisticated algorithms personalize our digital encounters. Artificial intelligence continues to revolutionize industries, creating unprecedented opportunities for innovation and growth. Machine learning algorithms analyze vast datasets to identify patterns and generate insights that were previously impossible to discover. Cloud computing infrastructure provides scalable solutions for businesses of all sizes, enabling rapid deployment and efficient resource management. Cybersecurity concerns have become increasingly important as our reliance on digital systems grows. Organizations must implement comprehensive security measures to protect sensitive information and maintain user trust. The Internet of Things connects everyday objects to the network, creating smart homes and cities that can optimize energy usage and improve quality of life. Blockchain technology offers new possibilities for secure transactions and decentralized systems. Virtual and augmented reality applications are transforming entertainment, education, and professional training. As technology continues to advance, society must address ethical considerations and ensure that progress benefits everyone.",
      "Environmental sustainability requires comprehensive strategies addressing climate change, resource conservation, and ecosystem preservation. Renewable energy technologies, including solar and wind power, offer promising alternatives to traditional fossil fuel dependencies. Global cooperation remains essential for implementing effective environmental policies. Sustainable agriculture practices help maintain food security while reducing environmental impact through crop rotation, organic farming, and precision agriculture techniques. Urban planning initiatives focus on creating green spaces, improving public transportation, and reducing carbon emissions. Waste management systems emphasize recycling, composting, and circular economy principles to minimize landfill waste. Water conservation efforts include rainwater harvesting, efficient irrigation systems, and wastewater treatment technologies. Conservation biology works to protect endangered species and preserve biodiversity through habitat restoration and wildlife corridors. International agreements and environmental treaties provide frameworks for coordinated global action on climate change.",
      "Educational methodologies have evolved significantly through digital integration and pedagogical research. Interactive learning platforms enhance student engagement while personalized instruction accommodates diverse learning styles. Critical thinking and problem-solving skills remain fundamental objectives in contemporary academic curricula. Online learning environments provide flexible access to education for students worldwide, breaking down geographical and economic barriers. Collaborative learning approaches encourage peer interaction and knowledge sharing through group projects and discussion forums. Assessment strategies have diversified to include portfolios, presentations, and project-based evaluations alongside traditional examinations. Teacher professional development programs ensure educators stay current with best practices and emerging technologies. Interdisciplinary studies connect different fields of knowledge to provide comprehensive understanding of complex topics. Special education services support students with diverse needs through individualized instruction and assistive technologies.",
    ],
    300: [
      "Technology has fundamentally transformed our daily experiences and professional interactions. Modern communication platforms enable instantaneous global connectivity, while sophisticated algorithms personalize our digital encounters. Artificial intelligence continues to revolutionize industries, creating unprecedented opportunities for innovation and growth. Machine learning algorithms analyze vast datasets to identify patterns and generate insights that were previously impossible to discover. Cloud computing infrastructure provides scalable solutions for businesses of all sizes, enabling rapid deployment and efficient resource management. Cybersecurity concerns have become increasingly important as our reliance on digital systems grows. Organizations must implement comprehensive security measures to protect sensitive information and maintain user trust. The Internet of Things connects everyday objects to the network, creating smart homes and cities that can optimize energy usage and improve quality of life. Blockchain technology offers new possibilities for secure transactions and decentralized systems. Virtual and augmented reality applications are transforming entertainment, education, and professional training. As technology continues to advance, society must address ethical considerations and ensure that progress benefits everyone. Data privacy regulations like GDPR and CCPA establish guidelines for responsible data collection and usage. Quantum computing promises to solve complex problems that are currently beyond the capabilities of classical computers. Biotechnology and genetic engineering offer potential solutions for medical treatments and agricultural improvements. Automation and robotics are changing manufacturing processes and labor markets worldwide.",
    ],
  },
  hard: {
    60: [
      "Epistemological paradigms necessitate comprehensive hermeneutical frameworks for analyzing phenomenological manifestations within poststructuralist theoretical constructs. Deconstructionist methodologies challenge hegemonic narratives through dialectical interrogation of ontological assumptions and axiological presuppositions inherent in contemporary discursive formations.",
      "Quantum mechanical superposition phenomena demonstrate non-deterministic probabilistic behavior in subatomic particle interactions, challenging classical Newtonian mechanics through uncertainty principles and wave-particle duality observations. Schrödinger's mathematical formulations elucidate complex eigenvalue problems in multidimensional Hilbert spaces.",
      "Neuroplasticity research reveals synaptic reorganization mechanisms facilitating cognitive adaptation through dendritic arborization and myelination processes. Neurotransmitter modulation affects hippocampal long-term potentiation, influencing memory consolidation pathways and executive function optimization strategies in cortical neural networks.",
    ],
    180: [
      "Epistemological paradigms necessitate comprehensive hermeneutical frameworks for analyzing phenomenological manifestations within poststructuralist theoretical constructs. Deconstructionist methodologies challenge hegemonic narratives through dialectical interrogation of ontological assumptions and axiological presuppositions inherent in contemporary discursive formations. Intersectionality theory examines multidimensional identity categories and their overlapping systems of oppression, privilege, and marginalization. Critical race theory investigates institutionalized racism through legal scholarship and sociological analysis of power structures. Feminist epistemology questions androcentric knowledge production and advocates for inclusive research methodologies that center marginalized voices. Postcolonial studies deconstruct imperial narratives and examine the ongoing effects of colonialism on cultural identity and knowledge systems. Psychoanalytic theory explores unconscious motivations and repressed desires through dream analysis and free association techniques. Structuralism identifies underlying patterns and binary oppositions in cultural phenomena, while poststructuralism questions the stability of these systems. Semiotics examines sign systems and meaning-making processes in communication and cultural representation.",
      "Quantum mechanical superposition phenomena demonstrate non-deterministic probabilistic behavior in subatomic particle interactions, challenging classical Newtonian mechanics through uncertainty principles and wave-particle duality observations. Schrödinger's mathematical formulations elucidate complex eigenvalue problems in multidimensional Hilbert spaces. Quantum entanglement exhibits non-local correlations that violate Bell's inequality theorem, suggesting fundamental interconnectedness in quantum systems. String theory proposes vibrating one-dimensional objects as fundamental constituents of matter and energy, requiring eleven-dimensional spacetime geometries. Quantum field theory describes particle creation and annihilation through vacuum fluctuations and virtual particle exchanges. The Standard Model categorizes elementary particles into fermions and bosons with specific gauge symmetries. Dark matter and dark energy comprise approximately ninety-five percent of the universe's total mass-energy content. Cosmic inflation theory explains the universe's large-scale homogeneity and isotropy through exponential expansion. General relativity describes spacetime curvature caused by mass-energy distributions, predicting gravitational time dilation and length contraction effects.",
      "Neuroplasticity research reveals synaptic reorganization mechanisms facilitating cognitive adaptation through dendritic arborization and myelination processes. Neurotransmitter modulation affects hippocampal long-term potentiation, influencing memory consolidation pathways and executive function optimization strategies in cortical neural networks. Epigenetic modifications regulate gene expression without altering DNA sequences, affecting neuronal development and behavioral phenotypes. Optogenetics enables precise neural circuit manipulation through light-activated ion channels, advancing understanding of brain function and dysfunction. Connectome mapping projects aim to chart complete neural wiring diagrams using advanced microscopy and computational analysis techniques. Glial cells, including astrocytes and oligodendrocytes, provide metabolic support and maintain blood-brain barrier integrity. Neurodegenerative diseases involve protein misfolding, aggregation, and cellular toxicity mechanisms. Brain-computer interfaces translate neural signals into digital commands, offering therapeutic applications for paralyzed patients. Computational neuroscience models neural networks using mathematical algorithms and machine learning approaches.",
    ],
    300: [
      "Epistemological paradigms necessitate comprehensive hermeneutical frameworks for analyzing phenomenological manifestations within poststructuralist theoretical constructs. Deconstructionist methodologies challenge hegemonic narratives through dialectical interrogation of ontological assumptions and axiological presuppositions inherent in contemporary discursive formations. Intersectionality theory examines multidimensional identity categories and their overlapping systems of oppression, privilege, and marginalization. Critical race theory investigates institutionalized racism through legal scholarship and sociological analysis of power structures. Feminist epistemology questions androcentric knowledge production and advocates for inclusive research methodologies that center marginalized voices. Postcolonial studies deconstruct imperial narratives and examine the ongoing effects of colonialism on cultural identity and knowledge systems. Psychoanalytic theory explores unconscious motivations and repressed desires through dream analysis and free association techniques. Structuralism identifies underlying patterns and binary oppositions in cultural phenomena, while poststructuralism questions the stability of these systems. Semiotics examines sign systems and meaning-making processes in communication and cultural representation. Hermeneutics involves interpretive understanding of texts and cultural artifacts within their historical and social contexts. Phenomenology investigates consciousness and subjective experience through descriptive analysis of lived phenomena. Existentialism emphasizes individual freedom, responsibility, and authentic self-creation in the face of absurdity and uncertainty. Pragmatism evaluates truth claims based on practical consequences and utility rather than correspondence to objective reality. Logical positivism sought to establish scientific knowledge through empirical verification and logical analysis of language.",
    ],
  },
};

const timeOptions = [
  { label: "1 min", value: 60 },
  { label: "3 min", value: 180 },
  { label: "5 min", value: 300 },
];

const difficultyOptions = [
  { label: "Simple", value: "simple", description: "Basic words and simple sentences" },
  { label: "Medium", value: "medium", description: "Standard vocabulary and structure" },
  { label: "Hard", value: "hard", description: "Complex words and technical terms" },
];

export const TypingTest = () => {
  const { theme, toggleTheme } = useTheme();
  const [text, setText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [selectedTime, setSelectedTime] = useState(60);
  const [selectedDifficulty, setSelectedDifficulty] = useState<"simple" | "medium" | "hard">("medium");
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
    const textsForDifficulty = difficultyTexts[selectedDifficulty];
    const textsForDuration = textsForDifficulty[selectedTime as keyof typeof textsForDifficulty] || textsForDifficulty[60];
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
        {/* Header with Theme Toggle */}
        <div className="text-center space-y-2 relative">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="absolute right-0 top-0 p-2"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            TypeSpeed Guru
          </h1>
          <p className="text-muted-foreground text-lg">
            Test and improve your typing speed
          </p>
        </div>

        {/* Difficulty Selection */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Difficulty Level
            </h2>
            <div className="flex gap-2">
              {difficultyOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={selectedDifficulty === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedDifficulty(option.value as "simple" | "medium" | "hard");
                    resetTest();
                  }}
                  disabled={isActive}
                  className="flex flex-col items-center gap-1 h-auto py-2"
                >
                  <span className="text-xs font-medium">{option.label}</span>
                  <span className="text-xs text-muted-foreground">{option.description}</span>
                </Button>
              ))}
            </div>
          </div>
        </Card>

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