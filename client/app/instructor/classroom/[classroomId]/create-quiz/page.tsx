"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

type Question = {
  id: string;
  question: string;
  options: string[];
  correctOption: string;
};

export default function CreateQuizPage({ params }: { params: Promise<{ classroomId: string }> }) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([
    { id: Date.now().toString(), question: '', options: ['', ''], correctOption: '' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check instructor authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/instructor');
        if (!response.ok) {
          throw new Error('Not authenticated');
        }
        setIsLoading(false);
      } catch (err) {
        setError('You must be logged in as an instructor to create a quiz');
        router.push('/signin?redirect=/instructor');
      }
    };

    checkAuth();
  }, [router]);

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
            </div>
          </div>
        </div>
      </div>
    );
  }

  const addQuestion = () => {
    setQuestions([...questions, { id: Date.now().toString(), question: '', options: ['', ''], correctOption: '' }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      const newQuestions = [...questions];
      newQuestions.splice(index, 1);
      setQuestions(newQuestions);
    }
  };

  const updateQuestion = (index: number, field: string, value: string) => {
    const newQuestions = [...questions];
    if (field === 'question') {
      newQuestions[index].question = value;
    } else if (field.startsWith('option')) {
      const optionIndex = parseInt(field.split('-')[1]);
      newQuestions[index].options[optionIndex] = value;
    } else if (field === 'correctOption') {
      newQuestions[index].correctOption = value;
    }
    setQuestions(newQuestions);
  };

  const addOption = (questionIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options.push('');
    setQuestions(newQuestions);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...questions];
    if (newQuestions[questionIndex].options.length > 2) {
      newQuestions[questionIndex].options.splice(optionIndex, 1);
      setQuestions(newQuestions);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate form
    if (!title.trim()) {
      toast.error('Please enter a title for the quiz');
      setIsSubmitting(false);
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        toast.error(`Question ${i + 1} is missing text`);
        setIsSubmitting(false);
        return;
      }
      
      if (q.options.some(opt => !opt.trim())) {
        toast.error(`Question ${i + 1} has empty options`);
        setIsSubmitting(false);
        return;
      }
      
      if (!q.correctOption) {
        toast.error(`Please select a correct option for question ${i + 1}`);
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const response = await fetch(`/api/instructor/classroom/${(await params).classroomId}/create-quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          questionAnswer: questions.map(q => ({
            question: q.question,
            options: q.options,
            correctOption: q.correctOption
          }))
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Quiz created successfully!');
        router.push(`/instructor/classroom/${(await params).classroomId}`);
      } else {
        throw new Error(data.message || 'Failed to create quiz');
      }
    } catch (error) {
      console.error('Error creating quiz:', error);
      toast.error('Failed to create quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Create New Quiz</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Quiz Details</CardTitle>
            <CardDescription>Enter the basic information for your quiz</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                Quiz Title <span className="text-red-500">*</span>
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter quiz title"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">
                Description
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter quiz description (optional)"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {questions.map((question, qIndex) => (
          <Card key={question.id} className="mb-6 relative">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Question {qIndex + 1}</CardTitle>
                {questions.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeQuestion(qIndex)}
                    className="text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor={`question-${qIndex}`} className="block text-sm font-medium mb-1">
                  Question <span className="text-red-500">*</span>
                </label>
                <Input
                  id={`question-${qIndex}`}
                  value={question.question}
                  onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                  placeholder="Enter your question"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium">
                    Options <span className="text-red-500">*</span>
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => addOption(qIndex)}
                    className="text-sm"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Option
                  </Button>
                </div>

                {question.options.map((option, oIndex) => (
                  <div key={oIndex} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={`correct-${qIndex}-${oIndex}`}
                      name={`correct-${qIndex}`}
                      checked={question.correctOption === option}
                      onChange={() => updateQuestion(qIndex, 'correctOption', option)}
                      className="h-4 w-4"
                      required={oIndex === 0}
                    />
                    <Input
                      value={option}
                      onChange={(e) => updateQuestion(qIndex, `option-${oIndex}`, e.target.value)}
                      placeholder={`Option ${oIndex + 1}`}
                      required
                    />
                    {question.options.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOption(qIndex, oIndex)}
                        className="text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={addQuestion}
            className="mb-6"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Question
          </Button>
          
          <Button type="submit" disabled={isSubmitting} className="mb-6">
            {isSubmitting ? 'Creating Quiz...' : 'Create Quiz'}
          </Button>
        </div>
      </form>
    </div>
  );
}
