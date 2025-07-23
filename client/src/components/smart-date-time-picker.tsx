import { useState, useEffect } from "react";
import { format, addDays, startOfWeek, isSameDay, isToday, isTomorrow } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react";

interface SmartDateTimePickerProps {
  selectedDate: Date;
  selectedTime: string;
  onDateChange: (date: Date) => void;
  onTimeChange: (time: string) => void;
  className?: string;
}

// Quick date options
const getQuickDateOptions = () => {
  const today = new Date();
  return [
    { label: "Today", date: today, badge: "Today" },
    { label: "Tomorrow", date: addDays(today, 1), badge: "Tomorrow" },
    { label: format(addDays(today, 2), "EEE"), date: addDays(today, 2), badge: null },
    { label: format(addDays(today, 3), "EEE"), date: addDays(today, 3), badge: null },
    { label: format(addDays(today, 4), "EEE"), date: addDays(today, 4), badge: null },
  ];
};

// Smart time suggestions based on current time and context
const getSmartTimeSlots = () => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // Generate time slots starting from next available slot
  const slots = [];
  let startHour = Math.max(9, currentHour); // Start from 9 AM or current hour
  
  // If it's past 5 PM, suggest next day morning slots
  if (currentHour >= 17) {
    startHour = 9;
  }
  
  // If current time is within a slot, start from next slot
  if (currentMinute > 30) {
    startHour++;
  }
  
  // Generate slots from start hour to 6 PM
  for (let hour = startHour; hour <= 18; hour++) {
    if (hour === startHour && currentMinute <= 30) {
      // Add both :00 and :30 for current hour if we're before :30
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    } else if (hour === startHour) {
      // Only add :30 for current hour if we're past :30
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    } else {
      // Add both slots for future hours
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }
  
  return slots.slice(0, 8); // Limit to 8 most relevant slots
};

export function SmartDateTimePicker({ 
  selectedDate, 
  selectedTime, 
  onDateChange, 
  onTimeChange,
  className = ""
}: SmartDateTimePickerProps) {
  const [quickDates] = useState(getQuickDateOptions());
  const [smartTimeSlots] = useState(getSmartTimeSlots());
  const [showAllTimes, setShowAllTimes] = useState(false);
  
  // Extended time slots for "show more" functionality
  const allTimeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"
  ];
  
  const timeSlots = showAllTimes ? allTimeSlots : smartTimeSlots;
  
  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "EEE, MMM d");
  };
  
  const getTimeLabel = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 > 12 ? hour24 - 12 : hour24 === 0 ? 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Quick Date Selection */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <span className="font-medium">Select Date</span>
        </div>
        
        <div className="grid grid-cols-5 gap-2">
          {quickDates.map((option, index) => {
            const isSelected = isSameDay(selectedDate, option.date);
            return (
              <Button
                key={index}
                variant={isSelected ? "default" : "outline"}
                className="flex flex-col items-center p-3 h-16 relative"
                onClick={() => onDateChange(option.date)}
              >
                <span className="text-sm font-medium">{option.label}</span>
                <span className="text-xs text-muted-foreground">
                  {format(option.date, "MMM d")}
                </span>
                {option.badge && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-2 -right-2 text-xs px-1 py-0"
                  >
                    {option.badge}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>
        
        {/* Selected Date Display */}
        <Card className="bg-muted/50">
          <CardContent className="p-3">
            <div className="flex items-center justify-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="font-medium">
                {getDateLabel(selectedDate)} - {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Smart Time Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span className="font-medium">Select Time</span>
          </div>
          {!showAllTimes && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowAllTimes(true)}
              className="text-xs"
            >
              More times
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-4 gap-2">
          {timeSlots.map((time) => {
            const isSelected = selectedTime === time;
            return (
              <Button
                key={time}
                variant={isSelected ? "default" : "outline"}
                className="flex flex-col items-center p-3 h-14"
                onClick={() => onTimeChange(time)}
              >
                <span className="text-sm font-medium">{getTimeLabel(time)}</span>
                <span className="text-xs text-muted-foreground">{time}</span>
              </Button>
            );
          })}
        </div>
        
        {showAllTimes && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowAllTimes(false)}
            className="w-full text-xs"
          >
            Show fewer times
          </Button>
        )}
        
        {/* Selected Time Display */}
        {selectedTime && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-3">
              <div className="flex items-center justify-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-medium text-primary">
                  Appointment scheduled for {getTimeLabel(selectedTime)}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}