import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Shield, Users, TrendingUp, Brain, FileText } from "lucide-react";
import elevitaLightModeLogo from "@assets/elevitaLightModeLogo.png";
import elevitaDarkModeLogo from "@assets/elevitaDarkModeLogo.png";
import { useTheme } from "@/contexts/theme-context";



export default function Landing() {
  const { actualTheme, theme, setTheme } = useTheme();
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex">
                <div className="flex items-center space-x-4 cursor-pointer hover:opacity-80 transition-opacity">
                  <img 
                    src={actualTheme === 'dark' ? elevitaDarkModeLogo : elevitaLightModeLogo} 
                    alt="Elevita Logo" 
                    className="h-20 w-auto"
                  />
                </div>
              </div>
            </div>
            
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-gradient-light dark:bg-gradient-teal hover:opacity-90 text-black dark:text-white hover:font-bold px-6 border border-teal-500 hover:border-purple-600/50"
            >
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="bg-gradient-light dark:bg-gradient-teal">
          <div className="">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
              <div className="text-center">
                <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
                  Your Healthcare Journey,
                  <span className="block bg-gradient-to-r from-teal-500 to-purple-500 bg-clip-text text-transparent pb-2">Beautifully Organised</span>
                </h1>
                <p className="text-xl text-foreground mb-8 max-w-3xl">
                  Elevita empowers you to take control of your health with AI-powered insights, 
                  medication tracking, and seamless provider communication - all in one beautiful platform.
                </p>
                <Button 
                  onClick={() => window.location.href = '/api/login'}
                  size="lg"
                  className="bg-gradient-light dark:bg-gradient-teal hover:opacity-90 text-black dark:text-white hover:font-bold border border-teal-500 hover:border-purple-600/50"
                >
                  Start Your Health Journey
                </Button>
                <div className="flex items-center justify-center">
                  <div className="flex justify-center cursor-pointer hover:opacity-80 transition-opacity">
                    <img 
                      src={actualTheme === 'dark' ? elevitaDarkModeLogo : elevitaLightModeLogo} 
                      alt="Elevita Logo" 
                      className=" h-[180px] w-auto"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-8 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Healthcare Technology That Understands You
            </h2>
            <p className="text-xl text-foreground max-w-2xl mx-auto">
              Built with empathy, designed for clarity, powered by AI—everything you need to 
              communicate effectively with your healthcare team.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-gradient-light dark:bg-gradient-teal border-elevita-bright-teal backdrop-blur-md shadow-lg hover:shadow-xl">:
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-elevita-teal/20 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-black dark:text-elevita-bright-teal" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Smart Health Timeline</h3>
                <p className="text-black dark:text-gray-900">
                  Visualise your health journey with an intelligent timeline that connects symptoms, 
                  medications, and appointments for better insights.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-light dark:bg-gradient-teal border-elevita-bright-teal backdrop-blur-md shadow-lg hover:shadow-xl">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-elevita-purple/20 flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-black dark:text-elevita-light-purple" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">AI Health Insights</h3>
                <p className="text-black dark:text-gray-900">
                  Get personalised, non-diagnostic insights that help you understand patterns 
                  and communicate more effectively with your providers.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-light dark:bg-gradient-teal border-elevita-bright-teal backdrop-blur-md shadow-lg hover:shadow-xl">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-elevita-teal/20 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-black dark:text-elevita-bright-teal" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Medication Management</h3>
                <p className="text-black dark:text-gray-900">
                  Track medications, set reminders, and monitor adherence with our 
                  compassionate, user-friendly medication tracking system.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-light dark:bg-gradient-teal border-elevita-bright-teal backdrop-blur-md shadow-lg hover:shadow-xl">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-elevita-purple/20 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-black dark:text-elevita-light-purple" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Clinical Translation</h3>
                <p className="text-black dark:text-gray-900">
                  Understand medical terminology with our AI-powered clinical term translator 
                  that explains complex medical language in plain English.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-light dark:bg-gradient-teal border-elevita-bright-teal backdrop-blur-md shadow-lg hover:shadow-xl">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-elevita-teal/20 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-black dark:text-elevita-bright-teal" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Provider Communication</h3>
                <p className="text-black dark:text-gray-900">
                  Generate professional health summaries for your healthcare providers, 
                  ensuring continuity of care and better communication.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-light dark:bg-gradient-teal border-elevita-bright-teal backdrop-blur-md shadow-lg hover:shadow-xl">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-elevita-purple/20 flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-black dark:text-elevita-light-purple" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Trauma-Informed Design</h3>
                <p className="text-black dark:text-gray-300">
                  Built with empathy and accessibility in mind, our platform provides a safe, 
                  supportive space for all users regardless of their health journey.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-8">
        <div className="bg-gradient-light dark:bg-gradient-teal">
          <div className="">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
              <h2 className="text-4xl font-bold text-foreground mb-6">
                Ready to Transform Your Healthcare Experience?
              </h2>
              <p className="text-xl text-gray-800 dark:text-gray-200 mb-8">
                Take control of your health journey with Elevita.
              </p>
              <Button 
                onClick={() => window.location.href = '/api/login'}
                size="lg"
                className="bg-gradient-light dark:bg-gradient-teal hover:opacity-90 text-black dark:text-white hover:font-bold px-2 border border-teal-500 hover:border-purple-600/50"
              >
                Get Started Today
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-4">
          <div className="text-center">
            <p className="text-elevita-dark-teal dark:text-elevita-bright-teal text-sm mb-4">
              <Shield className="inline h-4 w-4 mr-2" />
              <strong>Important Medical Disclaimer</strong>
            </p>
            <p className="text-gray-400 text-xs max-w-4xl mx-auto mb-6">
              Elevita is designed to help you organise and communicate your health information. 
              This platform does not provide medical advice, diagnosis, or treatment recommendations. 
              The AI insights are for informational purposes only and should never replace professional 
              medical consultation. Always consult with qualified healthcare professionals for medical decisions. 
              In case of medical emergency, contact your local emergency services immediately.
            </p>
            <div className="flex justify-center space-x-6 text-xs text-gray-500">
              <a href="#" className="hover:text-elevita-bright-teal transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-elevita-bright-teal transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-elevita-bright-teal transition-colors">HIPAA Compliance</a>
              <a href="#" className="hover:text-elevita-bright-teal transition-colors">Contact Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
