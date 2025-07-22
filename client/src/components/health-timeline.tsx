import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, PillBottle, Calendar, TrendingUp } from "lucide-react";

interface TimelineEvent {
  id: number;
  type: 'symptom' | 'medication' | 'appointment' | 'metric';
  title: string;
  description: string;
  date: Date;
  severity?: number;
  tags: string[];
}

interface HealthTimelineProps {
  showFullTimeline?: boolean;
}

export default function HealthTimeline({ showFullTimeline = false }: HealthTimelineProps) {
  const { data: timelineEvents, isLoading } = useQuery({
    queryKey: ["/api/dashboard/timeline"],
    retry: false,
  });

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'symptom':
        return <Activity className="h-4 w-4" />;
      case 'medication':
        return <PillBottle className="h-4 w-4" />;
      case 'appointment':
        return <Calendar className="h-4 w-4" />;
      case 'metric':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'symptom':
        return 'bg-elevita-bright-teal';
      case 'medication':
        return 'bg-elevita-light-purple';
      case 'appointment':
        return 'bg-elevita-bright-teal';
      case 'metric':
        return 'bg-elevita-teal';
      default:
        return 'bg-elevita-bright-teal';
    }
  };

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'symptom':
        return 'bg-elevita-bright-teal/20 text-elevita-bright-teal';
      case 'medication':
        return 'bg-elevita-purple/20 text-elevita-light-purple';
      case 'appointment':
        return 'bg-elevita-teal/20 text-elevita-bright-teal';
      case 'missed':
        return 'bg-red-500/20 text-red-400';
      case 'taken':
        return 'bg-green-500/20 text-green-400';
      default:
        return 'bg-elevita-medium-gray/20 text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="mb-8">
      <div className="bg-elevita-dark-gray/50 backdrop-blur-md rounded-2xl p-6 border border-elevita-medium-gray/20">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-white">Health Timeline</h3>
          {!showFullTimeline && (
            <div className="flex space-x-2">
              <Button size="sm" className="bg-elevita-teal text-white">7 Days</Button>
              <Button size="sm" variant="ghost" className="bg-elevita-medium-gray/30 text-gray-300 hover:bg-elevita-medium-gray/50">30 Days</Button>
              <Button size="sm" variant="ghost" className="bg-elevita-medium-gray/30 text-gray-300 hover:bg-elevita-medium-gray/50">3 Months</Button>
            </div>
          )}
        </div>

        <div className="relative">
          {isLoading ? (
            <div className="text-center py-8 text-gray-400">
              <p>Loading timeline...</p>
            </div>
          ) : !timelineEvents || timelineEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Activity className="h-8 w-8 mx-auto mb-2" />
              <p>No health events recorded yet</p>
              <p className="text-sm mt-1">Start logging symptoms, medications, or appointments to see your timeline</p>
            </div>
          ) : (
            <div className="space-y-6">
              {timelineEvents.map((event: TimelineEvent, index: number) => (
                <div key={event.id} className="relative pl-8">
                  <div className={`absolute left-0 top-1 w-3 h-3 ${getEventColor(event.type)} rounded-full`}></div>
                  {index < timelineEvents.length - 1 && (
                    <div className="absolute left-1.5 top-4 w-0.5 h-16 bg-elevita-medium-gray/30"></div>
                  )}
                  
                  <Card className="bg-elevita-medium-gray/20 border-elevita-medium-gray/20">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-white font-medium flex items-center">
                          {getEventIcon(event.type)}
                          <span className="ml-2">{event.title}</span>
                        </h4>
                        <span className="text-elevita-bright-teal text-sm">
                          {formatDate(event.date.toString())}
                        </span>
                      </div>
                      
                      <p className="text-gray-300 text-sm mb-3">
                        {event.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        {event.tags.map((tag, tagIndex) => (
                          <Badge 
                            key={tagIndex} 
                            className={`text-xs ${getTagColor(tag)}`}
                            variant="outline"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
