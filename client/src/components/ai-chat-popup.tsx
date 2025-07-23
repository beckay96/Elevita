import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";
import { Bot, Send, Sparkles, Heart, Stethoscope, Pill, Calendar, FileText, TrendingUp, AlertCircle } from "lucide-react";

interface AIChatPopupProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentView: 'patient' | 'professional';
}

interface QuickPrompt {
  icon: React.ReactNode;
  title: string;
  description: string;
  prompt: string;
  category: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIChatPopup({ isOpen, onOpenChange, currentView }: AIChatPopupProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const patientPrompts: QuickPrompt[] = [
    {
      icon: <Heart className="h-4 w-4" />,
      title: "Symptom Analysis",
      description: "Describe symptoms for insights",
      prompt: "I'm experiencing some symptoms and would like help understanding what they might indicate. Can you help me analyze my symptoms?",
      category: "Health"
    },
    {
      icon: <Pill className="h-4 w-4" />,
      title: "Medication Questions",
      description: "Ask about medications",
      prompt: "I have questions about my medications, including side effects, interactions, or adherence tips. Can you provide guidance?",
      category: "Medication"
    },
    {
      icon: <Calendar className="h-4 w-4" />,
      title: "Appointment Prep",
      description: "Prepare for doctor visits",
      prompt: "I have an upcoming appointment and want to prepare. What questions should I ask my doctor and what information should I bring?",
      category: "Appointments"
    },
    {
      icon: <TrendingUp className="h-4 w-4" />,
      title: "Health Tracking",
      description: "Improve tracking habits",
      prompt: "I want to improve how I track my health data. What metrics should I monitor and how can I be more consistent?",
      category: "Tracking"
    },
    {
      icon: <AlertCircle className="h-4 w-4" />,
      title: "Emergency Guidance",
      description: "When to seek urgent care",
      prompt: "I'm unsure if my symptoms require immediate medical attention. Can you help me understand when to seek emergency care?",
      category: "Emergency"
    },
    {
      icon: <FileText className="h-4 w-4" />,
      title: "Health Reports",
      description: "Understand test results",
      prompt: "I received some health reports or test results and need help understanding what they mean. Can you explain them in simple terms?",
      category: "Reports"
    }
  ];

  const professionalPrompts: QuickPrompt[] = [
    {
      icon: <Stethoscope className="h-4 w-4" />,
      title: "Clinical Decision Support",
      description: "Differential diagnosis assistance",
      prompt: "I need assistance with differential diagnosis for a patient case. Can you help me consider various diagnostic possibilities?",
      category: "Clinical"
    },
    {
      icon: <FileText className="h-4 w-4" />,
      title: "Documentation Assistant",
      description: "Clinical note templates",
      prompt: "I need help structuring clinical documentation. Can you provide templates for SOAP notes or discharge summaries?",
      category: "Documentation"
    },
    {
      icon: <Pill className="h-4 w-4" />,
      title: "Drug Interactions",
      description: "Medication safety checks",
      prompt: "I need to check for potential drug interactions and contraindications for a patient's medication regimen. Can you assist?",
      category: "Pharmacy"
    },
    {
      icon: <TrendingUp className="h-4 w-4" />,
      title: "Evidence-Based Medicine",
      description: "Latest research insights",
      prompt: "I'm looking for current evidence-based guidelines or recent research on a specific condition. Can you help me find relevant information?",
      category: "Research"
    },
    {
      icon: <Calendar className="h-4 w-4" />,
      title: "Care Planning",
      description: "Treatment protocols",
      prompt: "I need assistance developing a comprehensive care plan for a patient with multiple comorbidities. Can you help with treatment protocols?",
      category: "Care Planning"
    },
    {
      icon: <Bot className="h-4 w-4" />,
      title: "Clinical Guidelines",
      description: "Protocol recommendations",
      prompt: "I need quick access to clinical guidelines or best practice recommendations for a specific condition or procedure. Can you assist?",
      category: "Guidelines"
    }
  ];

  const quickPrompts = currentView === 'professional' ? professionalPrompts : patientPrompts;

  const handleQuickPrompt = (prompt: string) => {
    setInputValue(prompt);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Simulate AI response (replace with actual AI service)
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateAIResponse(userMessage.content, currentView),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string, view: string): string => {
    if (view === 'professional') {
      return `As a healthcare professional, I understand you're looking for clinical guidance. Based on your query about "${userInput.substring(0, 50)}...", I recommend following evidence-based protocols and consulting with colleagues when needed. 

For clinical decision support, always consider:
- Patient history and comorbidities
- Current medication regimen
- Latest clinical guidelines
- Risk-benefit analysis

Would you like me to help you explore specific aspects of this case or provide more detailed clinical information?`;
    } else {
      return `I'm here to help you understand your health better. Regarding your question about "${userInput.substring(0, 50)}...", it's important to remember that while I can provide general health information, I cannot replace professional medical advice.

Here are some general considerations:
- Monitor your symptoms and note any changes
- Keep track of relevant health data
- Prepare questions for your healthcare provider
- Follow your doctor's recommendations

Is there anything specific about your health tracking or symptoms you'd like to discuss further? Remember to always consult with your healthcare provider for personalized medical advice.`;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            AI Health Assistant
            <Badge variant={currentView === 'professional' ? 'default' : 'secondary'}>
              {currentView === 'professional' ? 'Professional Mode' : 'Patient Mode'}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
          
          {/* Quick Prompts Sidebar */}
          <div className="lg:w-1/3 space-y-4">
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-3">Quick Assistance</h3>
              <ScrollArea className="h-64 lg:h-full">
                <div className="space-y-2 pr-2">
                  {quickPrompts.map((prompt, index) => (
                    <Card 
                      key={index} 
                      className="cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => handleQuickPrompt(prompt.prompt)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          <div className="p-1.5 bg-primary/10 rounded">
                            {prompt.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium">{prompt.title}</h4>
                            <p className="text-xs text-muted-foreground">{prompt.description}</p>
                            <Badge variant="outline" className="text-xs mt-1">
                              {prompt.category}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:w-2/3 flex flex-col min-h-0">
            
            {/* Messages */}
            <ScrollArea className="flex-1 min-h-0 p-4 border rounded-lg">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a quick prompt or start typing to begin your conversation</p>
                  <p className="text-sm mt-2">
                    {currentView === 'professional' 
                      ? 'Professional clinical guidance and decision support'
                      : 'Personal health insights and wellness guidance'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Bot className="h-4 w-4 animate-pulse" />
                          <span className="text-sm">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div ref={messagesEndRef} />
            </ScrollArea>

            {/* Input Area */}
            <div className="flex gap-2 mt-4">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  currentView === 'professional'
                    ? 'Ask about clinical guidelines, diagnosis, or patient care...'
                    : 'Ask about your health, symptoms, or wellness...'
                }
                className="flex-1 min-h-[60px] resize-none"
                disabled={isLoading}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!inputValue.trim() || isLoading}
                size="lg"
                className="px-4"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}