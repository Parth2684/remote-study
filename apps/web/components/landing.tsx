import Link from "next/link"
import { Button } from "@repo/ui/button"
import { Card, CardContent } from "@repo/ui/card"
import { Badge } from "@repo/ui/badge"
import { BookOpen, Users, Video, ArrowRight, CheckCircle, Globe } from "lucide-react"

export default function Landing() {
  return (
    <div className="min-h-screen bg-background dark:bg-neutral-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 text-balance">
                Simple learning for everyone
              </h1>
              <p className="text-xl text-muted-foreground mb-8 text-pretty">
                EduLite brings quality education to low-bandwidth regions with an easy-to-use virtual classroom. No complex setup,
                no confusion - just simple, effective learning.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  asChild
                  size="lg"
                  className="gradient-purple text-white border-0 hover:opacity-90 animate-pulse-glow"
                >
                  <Link href="/signup">
                    Start Learning Free <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="dark:bg-neutral-800 dark:border-neutral-700 dark:hover:bg-neutral-900 dark:hover:text-white">
                  <Link href="/signin">I'm an Instructor</Link>
                </Button>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="animate-slide-up">
              <Card className="p-8 gradient-purple text-white border-0 animate-float">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">My Classes</h3>
                    <Badge className="bg-white/20 text-white border-0">3 Active</Badge>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">Basic Computer Skills</p>
                        <p className="text-sm text-white/70">Next class: Today 2:00 PM</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">English Speaking</p>
                        <p className="text-sm text-white/70">12 students joined</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Built for Low-Bandwidth regions</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We understand the challenges of limited internet and tech experience. EduLite is designed to work smoothly
              even with basic connections.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 animate-bounce-in border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-0">
                <div className="w-12 h-12 gradient-purple rounded-lg flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Works Anywhere</h3>
                <p className="text-muted-foreground">
                  Optimized for slow internet connections. Works on any device - phone, tablet, or computer.
                </p>
              </CardContent>
            </Card>

            <Card
              className="p-6 animate-bounce-in border-0 shadow-lg hover:shadow-xl transition-shadow"
              style={{ animationDelay: "0.2s" }}
            >
              <CardContent className="p-0">
                <div className="w-12 h-12 gradient-purple rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Easy to Use</h3>
                <p className="text-muted-foreground">
                  Simple interface designed for all ages. No technical knowledge required - just click and learn.
                </p>
              </CardContent>
            </Card>

            <Card
              className="p-6 animate-bounce-in border-0 shadow-lg hover:shadow-xl transition-shadow"
              style={{ animationDelay: "0.4s" }}
            >
              <CardContent className="p-0">
                <div className="w-12 h-12 gradient-purple rounded-lg flex items-center justify-center mb-4">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Interactive Classes</h3>
                <p className="text-muted-foreground">
                  Live video sessions, discussions, and recordings. Learn at your own pace with quality content.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">Education that reaches everyone</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">No expensive equipment needed</h3>
                    <p className="text-muted-foreground">Works on basic smartphones and computers</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Learn in your local language</h3>
                    <p className="text-muted-foreground">Instructors can teach in the language you understand best</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Flexible timing</h3>
                    <p className="text-muted-foreground">Join live classes or watch recordings when convenient</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="animate-slide-up">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-6 text-center border-0 shadow-lg">
                  <div className="text-2xl font-bold text-primary mb-2">10,000+</div>
                  <div className="text-sm text-muted-foreground">Students Learning</div>
                </Card>
                <Card className="p-6 text-center border-0 shadow-lg">
                  <div className="text-2xl font-bold text-primary mb-2">500+</div>
                  <div className="text-sm text-muted-foreground">Expert Instructors</div>
                </Card>
                <Card className="p-6 text-center border-0 shadow-lg">
                  <div className="text-2xl font-bold text-primary mb-2">50+</div>
                  <div className="text-sm text-muted-foreground">Rural Areas Served</div>
                </Card>
                <Card className="p-6 text-center border-0 shadow-lg">
                  <div className="text-2xl font-bold text-primary mb-2">95%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-purple">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 animate-fade-in">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">Ready to start your learning journey?</h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of students and instructors already using EduLite to transform education in rural
            communities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
              <Link href="/signup">
                Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white/10 bg-transparent"
            >
              <Link href="/signin">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 gradient-purple rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">EduLite</span>
            </div>
            <p className="text-muted-foreground text-center">
              © 2025 EduLite. Making education accessible for everyone.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
