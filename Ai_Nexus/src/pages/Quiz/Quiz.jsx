import { useState } from 'react';
import { HelpCircle, Clock, Award, CheckCircle, XCircle } from 'lucide-react';
import '../../styles/Quiz.css';

const quizData = [
  {
    id: 1,
    title: 'AI Fundamentals Quiz',
    description: 'Test your knowledge of basic AI concepts and terminology',
    questions: [
      {
        id: 1,
        question: 'What does AI stand for?',
        options: ['Artificial Intelligence', 'Automated Intelligence', 'Advanced Integration', 'Algorithmic Innovation'],
        correct: 0,
        explanation: 'AI stands for Artificial Intelligence, which refers to the simulation of human intelligence in machines.'
      },
      {
        id: 2,
        question: 'Which of these is NOT a type of machine learning?',
        options: ['Supervised Learning', 'Unsupervised Learning', 'Reinforcement Learning', 'Random Learning'],
        correct: 3,
        explanation: 'Random Learning is not a recognized type of machine learning. The main types are supervised, unsupervised, and reinforcement learning.'
      },
      {
        id: 3,
        question: 'What is deep learning?',
        options: ['Learning that happens very quickly', 'A subset of machine learning using neural networks', 'A type of computer hardware', 'A programming language'],
        correct: 1,
        explanation: 'Deep learning is a subset of machine learning that uses neural networks with multiple layers to model and understand complex patterns.'
      }
    ]
  },
  {
    id: 2,
    title: 'Computer Vision Basics',
    description: 'Explore image recognition and processing concepts',
    questions: [
      {
        id: 1,
        question: 'What is computer vision?',
        options: ['How computers see images', 'A camera type', 'A programming language', 'A type of database'],
        correct: 0,
        explanation: 'Computer vision is the field of study that enables computers to derive meaningful information from digital images, videos, and other visual inputs.'
      }
    ]
  }
];

export function Quiz() {
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const handleQuizSelect = (quiz) => {
    setSelectedQuiz(quiz);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowResults(false);
  };

  const handleAnswerSelect = (questionId, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleNext = () => {
    if (selectedQuiz && currentQuestionIndex < selectedQuiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleFinish = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    if (!selectedQuiz) return 0;
    const correctAnswers = selectedQuiz.questions.filter(q => 
      answers[q.id] === q.correct
    ).length;
    return Math.round((correctAnswers / selectedQuiz.questions.length) * 100);
  };

  if (selectedQuiz && !showResults) {
    const currentQuestion = selectedQuiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / selectedQuiz.questions.length) * 100;

    return (
      <div className="quiz-container">
        <div className="quiz-header">
          <h1>{selectedQuiz.title}</h1>
          <div className="quiz-progress">
            <div className="quiz-progress-bar" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="quiz-question-count">
            Question {currentQuestionIndex + 1} of {selectedQuiz.questions.length}
          </p>
        </div>

        <div className="quiz-question">
          <h2 className="quiz-question-text">{currentQuestion.question}</h2>
          <div className="quiz-options">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(currentQuestion.id, index)}
                className={`quiz-option ${answers[currentQuestion.id] === index ? 'selected' : ''}`}
              >
                <span className="quiz-option-letter">{String.fromCharCode(65 + index)}</span>
                <span className="quiz-option-text">{option}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="quiz-navigation">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="quiz-nav-btn quiz-prev"
          >
            Previous
          </button>
          {currentQuestionIndex === selectedQuiz.questions.length - 1 ? (
            <button
              onClick={handleFinish}
              className="quiz-nav-btn quiz-finish"
              disabled={!answers[currentQuestion.id]}
            >
              Finish Quiz
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!answers[currentQuestion.id]}
              className="quiz-nav-btn quiz-next"
            >
              Next
            </button>
          )}
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    const passed = score >= 70;

    return (
      <div className="quiz-results">
        <div className="quiz-results-header">
          <div className="quiz-results-icon">
            {passed ? <CheckCircle className="w-16 h-16 text-green-500" /> : <XCircle className="w-16 h-16 text-red-500" />}
          </div>
          <h1>{passed ? 'Congratulations!' : 'Keep Learning!'}</h1>
          <p>You scored {score}% on {selectedQuiz.title}</p>
        </div>

        <div className="quiz-score-circle">
          <div className="quiz-score-number">{score}%</div>
        </div>

        <div className="quiz-results-actions">
          <button
            onClick={() => setSelectedQuiz(null)}
            className="quiz-action-btn quiz-back-btn"
          >
            Back to Quizzes
          </button>
          <button className="quiz-action-btn quiz-retake-btn">
            Retake Quiz
          </button>
        </div>

        <div className="quiz-review">
          <h3>Review Your Answers</h3>
          {selectedQuiz.questions.map((question, index) => {
            const userAnswer = answers[question.id];
            const isCorrect = userAnswer === question.correct;
            
            return (
              <div key={question.id} className="quiz-review-question">
                <div className="quiz-review-header">
                  <span className="quiz-review-number">Q{index + 1}</span>
                  <span className={`quiz-review-result ${isCorrect ? 'correct' : 'incorrect'}`}>
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>
                <p className="quiz-review-text">{question.question}</p>
                <div className="quiz-review-answers">
                  <p className={`quiz-review-user ${isCorrect ? 'correct' : 'incorrect'}`}>
                    Your answer: {question.options[userAnswer]}
                  </p>
                  {!isCorrect && (
                    <p className="quiz-review-correct">
                      Correct answer: {question.options[question.correct]}
                    </p>
                  )}
                </div>
                <p className="quiz-review-explanation">{question.explanation}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-page">
      <div className="quiz-header">
        <div className="quiz-icon">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h1>AI Knowledge Quiz</h1>
        <p>Test your understanding of AI concepts and stay sharp!</p>
      </div>

      <div className="quiz-stats">
        <div className="quiz-stat">
          <Clock className="w-6 h-6" />
          <div>
            <div className="quiz-stat-number">2-5 min</div>
            <div className="quiz-stat-label">Duration</div>
          </div>
        </div>
        <div className="quiz-stat">
          <Award className="w-6 h-6" />
          <div>
            <div className="quiz-stat-number">70%</div>
            <div className="quiz-stat-label">Pass Score</div>
          </div>
        </div>
      </div>

      <div className="quiz-list">
        <h2>Available Quizzes</h2>
        {quizData.map((quiz) => (
          <div key={quiz.id} className="quiz-card">
            <div className="quiz-card-header">
              <h3>{quiz.title}</h3>
              <span className="quiz-question-count">
                {quiz.questions.length} questions
              </span>
            </div>
            <p className="quiz-card-description">{quiz.description}</p>
            <div className="quiz-card-footer">
              <div className="quiz-card-meta">
                <span className="quiz-difficulty">Beginner</span>
                <span className="quiz-estimated-time">3-5 min</span>
              </div>
              <button
                onClick={() => handleQuizSelect(quiz)}
                className="quiz-start-btn"
              >
                Start Quiz
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
