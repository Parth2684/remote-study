"use client"

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@repo/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import { RadioGroup, RadioGroupItem } from '@repo/ui/radio-group';
import { Label } from '@repo/ui/label';
import { toast } from 'sonner';

interface Question {
  id: string;
  question: string;
  options: string[];
}

export default function QuizAttemptPage() {
  const router = useRouter();
  const params = useParams();
  const classroomId = params.classroomId as string;
  const quizId = params.quizId as string;
  
  const [quiz, setQuiz] = useState<{
    id: string;
    title: string;
    description: string;
    questions: Question[];
  } | null>(null);
  
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour in seconds
  const [error, setError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Check student authentication and fetch quiz data
  useEffect(() => {
    const checkAuthAndFetchQuiz = async () => {
      try {
        // First check authentication
        const authResponse = await fetch('/api/auth/student');
        if (!authResponse.ok) {
          throw new Error('Not authenticated as a student');
        }
        
        // Then fetch quiz data
        const quizResponse = await fetch(`/api/student/classroom/${classroomId}/quiz/${quizId}`);
        if (!quizResponse.ok) {
          throw new Error('Failed to fetch quiz');
        }
        
        const data = await quizResponse.json();
        setQuiz(data);
        
        // Check if student is enrolled in the classroom
        const enrollmentCheck = await fetch(`/api/student/classroom/${classroomId}/enrollment`);
        if (!enrollmentCheck.ok) {
          throw new Error('You are not enrolled in this classroom');
        }
        
        // Initialize answers object with empty strings
        const initialAnswers: Record<string, string> = {};
        data.questions.forEach((q: Question) => {
          initialAnswers[q.id] = '';
        });
        setAnswers(initialAnswers);
        setIsAuthorized(true);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        if (errorMessage.includes('authenticated')) {
          router.push(`/signin?redirect=/student/classroom/${classroomId}/quiz/${quizId}`);
        }
        console.error('Error:', errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndFetchQuiz();
  }, [classroomId, quizId, router]);

  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  const handleAnswerChange = (questionId: string, option: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    const unansweredQuestions = Object.entries(answers).filter(([_, value]) => !value.trim());
    
    if (unansweredQuestions.length > 0) {
      const confirmSubmit = window.confirm(
        `You have ${unansweredQuestions.length} unanswered questions. Are you sure you want to submit?`
      );
      
      if (!confirmSubmit) {
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/student/classroom/${classroomId}/submit-quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizId,
          questionAnswers: Object.entries(answers).map(([questionId, optionId]) => ({
            questionId,
            optionId: optionId || null
          }))
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Quiz submitted successfully!');
        router.push(`/student/classroom/${classroomId}/quiz/${quizId}/results`);
      } else {
        throw new Error(data.message || 'Failed to submit quiz');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Failed to submit quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <Button 
                onClick={() => router.back()} 
                variant="outline" 
                className="mt-2"
              >
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Prevent flash of unauthorized content
  }

  if (!quiz) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Quiz not found</h2>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{quiz.title}</h1>
          {quiz.description && <p className="text-muted-foreground">{quiz.description}</p>}
        </div>
        <div className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-mono">
          Time Remaining: {formatTime(timeLeft)}
        </div>
      </div>

      <div className="space-y-6">
        {quiz.questions.map((question, index) => (
          <Card key={question.id}>
            <CardHeader>
              <CardTitle className="text-lg">
                Question {index + 1} <span className="text-muted-foreground text-sm">(1 point)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{question.question}</p>
              
              <RadioGroup 
                value={answers[question.id] || ''} 
                onValueChange={(value) => handleAnswerChange(question.id, value)}
                className="space-y-2"
              >
                {question.options.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center space-x-2">
                    <RadioGroupItem 
                      value={option} 
                      id={`${question.id}-${optionIndex}`} 
                    />
                    <Label htmlFor={`${question.id}-${optionIndex}`} className="cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex justify-end space-x-4">
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
        </Button>
      </div>
    </div>
  );
}
