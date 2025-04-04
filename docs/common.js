 // Quiz state variables
 let quizData = null;
 let currentQuestion = 0;
 let points = 0;
 let questionAnswered = false;

 // DOM Elements
 const questionEl = document.getElementById('question');
 const optionsEl = document.getElementById('options');
 const submitBtn = document.getElementById('submit-btn');
 const nextBtn = document.getElementById('next-btn');
 const feedbackEl = document.getElementById('feedback');
 const pointsDisplayEl = document.getElementById('points-display');
 const loadingEl = document.getElementById('loading');
 const questionContainerEl = document.getElementById('question-container');

 // Function to select random elements from an array
 function selectRandomElements(array, n = 20) {
     // Log what we received to help debug
     console.log("Selecting random elements from:", array);
     
     // Handle edge cases
     if (!Array.isArray(array)) {
         throw new TypeError('Input must be an array');
     }
     
     // If array is smaller than requested number, return a copy of the whole array
     if (array.length <= n) {
         return [...array];
     }
     
     // Create a copy of the original array to avoid modifying it
     const arrayCopy = [...array];
     const result = [];
     
     // Select n random elements using Fisher-Yates partial shuffle
     for (let i = 0; i < n; i++) {
         // Generate a random index between i and array length - 1
         const randomIndex = i + Math.floor(Math.random() * (arrayCopy.length - i));
         
         // Swap the elements at positions i and randomIndex
         [arrayCopy[i], arrayCopy[randomIndex]] = [arrayCopy[randomIndex], arrayCopy[i]];
         
         // Add the selected element to the result array
         result.push(arrayCopy[i]);
     }
     
     return result;
 }

 // Function to load quiz data from JSON file
 function loadQuizData(jsonFile, numQuestions = 20) {
     // Using the full URL
     fetch(jsonFile)
         .then(response => {
             if (!response.ok) {
                 throw new Error('Network response was not ok: ' + response.status);
             }
             return response.json();
         })
         .then(data => {
             // Log the data to check its structure
             console.log("Loaded data:", data);
             
             // Check if data.questions exists and is an array
             if (!data || !data.questions || !Array.isArray(data.questions)) {
                 // If data.questions isn't found or isn't an array, check if data itself is an array
                 if (Array.isArray(data)) {
                     // Use data directly if it's an array of questions
                     const randomQuestions = selectRandomElements(data, numQuestions);
                     quizData = { questions: randomQuestions };
                 } else {
                     throw new Error('Invalid data format: questions array not found');
                 }
             } else {
                 // Normal case - data.questions is an array
                 const randomQuestions = selectRandomElements(data.questions, numQuestions);
                 quizData = { questions: randomQuestions };
             }
             
             // Hide loading message and show quiz
             loadingEl.style.display = 'none';
             questionContainerEl.style.display = 'block';
             submitBtn.style.display = 'block';
             
             // Start the quiz
             loadQuestion();
         })
         .catch(error => {
             console.error('Error loading quiz data:', error);
             loadingEl.textContent = 'Error loading quiz: ' + error.message + '. Please refresh the page or try again later.';
         });
 }

 // Function to load a question
 function loadQuestion() {
     // Reset for new question
     questionAnswered = false;
     submitBtn.disabled = true;
     nextBtn.style.display = 'none';
     feedbackEl.textContent = '';

     // Get current question
     const question = quizData.questions[currentQuestion];
     
     // Display question text
     questionEl.textContent = question.question;

     // Clear previous options
     optionsEl.innerHTML = '';

     // Create option buttons
     question.options.forEach((option, index) => {
         const optionEl = document.createElement('div');
         optionEl.classList.add('option');
         optionEl.textContent = option;
         optionEl.addEventListener('click', () => selectOption(optionEl, index));
         optionsEl.appendChild(optionEl);
     });
 }

 // Function to handle option selection
 function selectOption(optionEl, optionIndex) {
     if (questionAnswered) return;

     // Remove previous selection
     const previousSelected = optionsEl.querySelector('.selected');
     if (previousSelected) {
         previousSelected.classList.remove('selected');
     }

     // Select current option
     optionEl.classList.add('selected');
     submitBtn.disabled = false;
 }

 // Function to submit and evaluate answer
 function submitAnswer() {
     if (questionAnswered) return;

     questionAnswered = true;
     submitBtn.disabled = true;

     const selectedOption = optionsEl.querySelector('.selected');
     const selectedIndex = Array.from(optionsEl.children).indexOf(selectedOption);
     const currentQuestionData = quizData.questions[currentQuestion];

     // Highlight correct and incorrect options
     optionsEl.children[currentQuestionData.correct].classList.add('correct');
     
     if (selectedIndex === currentQuestionData.correct) {
         // Correct answer
         points++;
         pointsDisplayEl.textContent = `Points: ${points}`;
         feedbackEl.textContent = 'Correct! ' + currentQuestionData.explanation;
     } else {
         // Incorrect answer
         if (selectedOption) {
             selectedOption.classList.add('incorrect');
         }
         feedbackEl.textContent = 'Oops! ' + currentQuestionData.explanation;
     }

     // Show next button
     nextBtn.style.display = 'block';
 }

 // Function to move to next question
 function nextQuestion() {
     currentQuestion++;

     if (currentQuestion < quizData.questions.length) {
         // Load next question
         loadQuestion();
     } else {
         // Quiz finished
         finishQuiz();
     }
 }

 // Function to finish the quiz
 function finishQuiz() {
     // Hide question container
     questionEl.textContent = 'Quiz Completed!';
     optionsEl.innerHTML = '';
     submitBtn.style.display = 'none';
     nextBtn.style.display = 'none';

     // Calculate percentage
     const percentage = Math.round((points / quizData.questions.length) * 100);

     // Display final message
     let finalMessage = `You scored ${points} out of ${quizData.questions.length} questions!\n`;
     
     if (percentage >= 80) {
         finalMessage += "Excellent job! You're a superstar learner!";
     } else if (percentage >= 60) {
         finalMessage += "Good work! Keep practicing and you'll get even better!";
     } else {
         finalMessage += "Don't worry! Every quiz is a chance to learn something new.";
     }

     feedbackEl.textContent = finalMessage;
 }

 // Event Listeners
 submitBtn.addEventListener('click', submitAnswer);
 nextBtn.addEventListener('click', nextQuestion);

 // Start loading the quiz data
