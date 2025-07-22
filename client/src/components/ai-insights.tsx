import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, RefreshCw, Shield, Lightbulb, TrendingUp, FileText } from "lucide-react";

interface AiInsight {
  id: number;
  type: 'pattern' | 'observation' | 'recommendation';
  title: string;
  content: string;
  confidence: number;
  isRead: boolean;
  createdAt: Date;
}

export default function AiInsights() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: insights, isLoading } = useQuery({
    queryKey: ["/api/ai-insights"],
    retry: false,
  });

  const generateInsights = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/ai-insights/generate", {});
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-insights"] });
      toast({
        title: "Success",
        description: "New AI insights generated successfully",
      });
      setIsGenerating(false);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to generate AI insights",
        variant: "destructive",
      });
      setIsGenerating(false);
    },
  });

  const handleGenerateInsights = () => {
    setIsGenerating(true);
    generateInsights.mutate();
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'pattern':
        return <TrendingUp className="h-5 w-5" />;
      case 'observation':
        return <Lightbulb className="h-5 w-5" />;
      case 'recommendation':
        return <FileText className="h-5 w-5" />;
      default:
        return <Brain className="h-5 w-5" />;
    }
  };

  const getInsightEmoji = (type: string) => {
    switch (type) {
      case 'pattern':
        return '🌟';
      case 'observation':
        return '💡';
      case 'recommendation':
        return '📝';
      default:
        return '🧠';
    }
  };

  return (
    <div className="mb-8">
      <div className="bg-gradient-teal rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-glass-dark"></div>
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-lg bg-black/30 flex items-center justify-center">
                <Brain className="text-elevita-bright-teal h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2">AI Health Insights</h3>
                <p className="text-gray-200 text-sm mb-4">
                  Based on your recent health data, here are some patterns and observations:
                </p>
              </div>
            </div>
            
            <Button
              onClick={handleGenerateInsights}
              disabled={isGenerating || generateInsights.isPending}
              size="sm"
              className="bg-black/20 hover:bg-black/30 text-white border border-elevita-bright-teal/30"
              variant="outline"
            >
              {isGenerating || generateInsights.isPending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh Insights
            </Button>
          </div>
          
          {isLoading ? (
            <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4">
              <p className="text-gray-200 text-sm">Loading insights...</p>
            </div>
          ) : !insights || insights.length === 0 ? (
            <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 text-center">
              <Brain className="h-8 w-8 text-elevita-bright-teal mx-auto mb-2" />
              <h4 className="text-white font-medium mb-2">No insights available yet</h4>
              <p className="text-gray-200 text-sm mb-4">
                Generate AI insights based on your health data to discover patterns and get gentle observations.
              </p>
              <Button
                onClick={handleGenerateInsights}
                disabled={isGenerating || generateInsights.isPending}
                className="bg-elevita-bright-teal hover:bg-elevita-teal text-black"
              >
                {isGenerating || generateInsights.isPending ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Brain className="h-4 w-4 mr-2" />
                )}
                Generate Insights
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {insights.slice(0, 3).map((insight: AiInsight) => (
                <div key={insight.id} className="bg-black/20 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-start space-x-2 mb-2">
                    <span className="text-lg">{getInsightEmoji(insight.type)}</span>
                    <div className="flex-1">
                      <h4 className="text-white font-medium mb-1">
                        {insight.title}
                      </h4>
                      <p className="text-gray-200 text-sm leading-relaxed">
                        {insight.content}
                      </p>
                      {insight.confidence && (
                        <div className="mt-2 text-xs text-elevita-bright-teal">
                          Confidence: {insight.confidence}%
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 p-3 rounded-lg bg-black/40 border border-elevita-bright-teal/30">
            <p className="text-elevita-bright-teal text-xs flex items-center">
              <Shield className="h-3 w-3 mr-2" />
              <strong>Medical Disclaimer:</strong>
              <span className="ml-1">
                These insights are for informational purposes only and do not constitute medical advice, diagnosis, or treatment recommendations. Always consult with qualified healthcare professionals for medical decisions.
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
