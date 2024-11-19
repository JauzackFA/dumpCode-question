const questionCard = document.getElementById("questionCard");
const showQuestionBtn = document.getElementById("showQuestionBtn");
const creditBtn = document.getElementById("creditBtn");
const debitBtn = document.getElementById("debitBtn");
const resultPopup = document.getElementById("resultPopup");
const resultMessage = document.getElementById("resultMessage");
const resultIcon = document.getElementById("resultIcon");
const nextBtn = document.getElementById("nextBtn");

let questions = []; // Array untuk menyimpan semua pertanyaan
let currentQuestion = {}; // Objek untuk menyimpan pertanyaan yang sedang ditampilkan

// Fungsi untuk memuat pertanyaan dari file JSON
async function loadQuestions() {
  try {
    const response = await fetch("All of Question/questionManager.json");
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    questions = await response.json();
    console.log("Semua pertanyaan berhasil dimuat:", questions);
    enableShowQuestionButton();
  } catch (error) {
    console.error("Error fetching the questions:", error);
  }
}

// Fungsi untuk mengaktifkan tombol "Tampilkan Pertanyaan"
function enableShowQuestionButton() {
  showQuestionBtn.disabled = false;
}

// Fungsi untuk menampilkan pertanyaan acak
function showRandomQuestion() {
  if (questions.length === 0) {
    console.error("Questions are not loaded yet.");
    return;
  }

  const randomIndex = Math.floor(Math.random() * questions.length);
  currentQuestion = questions[randomIndex];

  if (currentQuestion.type === "event") {
    applyEventEffect(currentQuestion);
  } else {
    displayQuestion(currentQuestion);
    toggleAnswerButtonsVisibility(currentQuestion.correctAnswer);
  }
}

// Fungsi untuk menampilkan teks pertanyaan pada kartu
function displayQuestion(question) {
  const questionText = document.querySelector(".card-content p");
  questionText.textContent = question.question;
}

// Fungsi untuk mengatur visibilitas tombol Credit dan Debit
function toggleAnswerButtonsVisibility(correctAnswerExists) {
  if (correctAnswerExists) {
    creditBtn.style.display = "inline-block";
    debitBtn.style.display = "inline-block";
  } else {
    creditBtn.style.display = "none";
    debitBtn.style.display = "none";
  }
}

// Fungsi untuk menangani jawaban yang dipilih pemain
function handleAnswer(answer) {
  const { isCorrect, steps, stun } = evaluateAnswer(answer);
  showResult(isCorrect, steps, stun);
  hideQuestionCard();
}

// Fungsi untuk mengevaluasi apakah jawaban pemain benar atau salah
function evaluateAnswer(answer) {
  const isCorrect = answer === currentQuestion.correctAnswer;
  const reward = isCorrect ? currentQuestion.reward.correct : currentQuestion.reward.wrong;

  return {
    isCorrect,
    steps: reward.steps,
    stun: reward.stun,
  };
}

// Fungsi untuk menampilkan popup hasil
function showResult(isCorrect, steps, stun) {
  const message = buildResultMessage(isCorrect, steps, stun);
  resultMessage.textContent = message;

  resultIcon.src = isCorrect ? "Assets/Ikon - Benar Abu.png" : "Assets/Ikon - Salah Abu.png";

  togglePopupVisibility(resultPopup, true);
}

// Fungsi untuk membangun pesan hasil
function buildResultMessage(isCorrect, steps, stun) {
  let message = "";

  if (isCorrect) {
    message = `Jawaban kamu benar, maju ${steps} langkah.`;
  } else if (steps !== 0) {
    message = `Jawaban kamu salah, mundur ${Math.abs(steps)} langkah.`;
  }

  if (stun > 0) {
    message += message ? ` Kamu kehilangan giliran untuk ${stun} putaran.` : `Kamu kehilangan giliran untuk ${stun} putaran.`;
  }

  return message;
}

// Fungsi untuk menyembunyikan kartu pertanyaan
function hideQuestionCard() {
  toggleElementVisibility(questionCard, false);
}

// Fungsi untuk mengatur visibilitas popup (show/hide)
function togglePopupVisibility(popup, show) {
  popup.classList.toggle("hide", !show);
  popup.classList.toggle("show", show);
}

// Fungsi umum untuk mengatur visibilitas elemen
function toggleElementVisibility(element, show) {
  element.style.display = show ? "block" : "none";
  element.classList.toggle("hide", !show);
  element.classList.toggle("show", show);
}

// Fungsi untuk menerapkan efek kartu event
function applyEventEffect(eventCard) {
  const { steps, stun } = eventCard.reward;
  let message = `${eventCard.question}`;

  const isBeneficial = steps > 0 && stun === 0;

  if (steps > 0) {
    message += ` Maju ${steps} langkah. `;
  } else if (steps < 0) {
    message += ` Mundur ${Math.abs(steps)} langkah. `;
  }

  if (stun > 0) {
    message += `Kamu kehilangan giliran untuk ${stun} putaran.`;
  }

  resultMessage.textContent = message;

  resultIcon.src = isBeneficial ? "Assets/Ikon - Benar Abu.png" : "Assets/Ikon - Salah Abu.png";

  togglePopupVisibility(resultPopup, true);

  movePlayer(steps);
}

// Fungsi placeholder untuk menggerakkan pemain di papan permainan
function movePlayer(steps) {
  console.log(`Pemain bergerak ${steps} langkah.`);
}

// Saat tombol "Tampilkan Pertanyaan" diklik
showQuestionBtn.addEventListener("click", () => {
  if (questions.length > 0) {
    toggleElementVisibility(questionCard, true);
    showRandomQuestion();
  } else {
    console.error("Questions are not loaded yet. Please try again later.");
  }
});

// Saat tombol "Credit" diklik
creditBtn.addEventListener("click", () => handleAnswer("credit"));

// Saat tombol "Debit" diklik
debitBtn.addEventListener("click", () => handleAnswer("debit"));

// Saat tombol "Next" diklik untuk melanjutkan setelah melihat hasil
nextBtn.addEventListener("click", () => {
  togglePopupVisibility(resultPopup, false);
  toggleElementVisibility(questionCard, false);
});

loadQuestions();

// async function loadQuestions() {
//   // Daftar file JSON yang ingin diambil
//   const jsonFiles = [
//     'All of Question/questionAdmin.json',
//     'All of Question/questionAssistantManager.json',
//     'All of Question/questionAssociateDirector.json',
//     'All of Question/questionDirector.json',
//     'All of Question/questionGeneralManager.json',
//     'All of Question/questionManager.json',
//     'All of Question/questionOfficer.json',
//     'All of Question/questionSeniorManager.json',
//     'All of Question/questionStaff.json',
//     'All of Question/questionSupervisor.json'
//   ];

//   try {
//     const responses = await Promise.all(jsonFiles.map(file => fetch(file)));

//     for (const response of responses) {
//       if (!response.ok) {
//         throw new Error(`HTTP error! Status: ${response.status} for file: ${response.url}`);
//       }
//     }

//     const dataPromises = responses.map(response => response.json());
//     const data = await Promise.all(dataPromises);

//     questions = data.flat();

//     console.log('Semua pertanyaan berhasil dimuat:', questions);
//     enableShowQuestionButton();
//   } catch (error) {
//     console.error('Error fetching the questions:', error);
//   }
// }
