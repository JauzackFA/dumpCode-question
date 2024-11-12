const questionCard = document.getElementById("questionCard"); // Kartu pertanyaan
const showQuestionBtn = document.getElementById("showQuestionBtn"); // Tombol untuk menampilkan pertanyaan
const creditBtn = document.getElementById("creditBtn"); // Tombol jawaban 'Credit'
const debitBtn = document.getElementById("debitBtn"); // Tombol jawaban 'Debit'
const resultPopup = document.getElementById("resultPopup"); // Popup hasil jawaban
const resultMessage = document.getElementById("resultMessage"); // Pesan hasil yang ditampilkan pada popup
const resultIcon = document.getElementById("resultIcon"); // Ikon hasil yang ditampilkan pada popup
const nextBtn = document.getElementById("nextBtn"); // Tombol "Next" setelah melihat hasil

let questions = []; // Array untuk menyimpan semua pertanyaan
let currentQuestion = {}; // Objek untuk menyimpan pertanyaan yang sedang ditampilkan

// Fungsi untuk memuat pertanyaan dari file JSON
async function loadQuestions() {
  try {
    // Mengambil pertanyaan dari file 'questionAdmin.json'
    const response = await fetch("All of Question/questionManager.json");
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    // Menyimpan data pertanyaan ke dalam variabel 'questions'
    questions = await response.json();
    console.log("Semua pertanyaan berhasil dimuat:", questions);
    enableShowQuestionButton(); // Mengaktifkan tombol untuk menampilkan pertanyaan setelah berhasil memuat data
  } catch (error) {
    console.error("Error fetching the questions:", error);
  }
}

// Fungsi untuk mengaktifkan tombol "Tampilkan Pertanyaan"
function enableShowQuestionButton() {
  showQuestionBtn.disabled = false; // Mengaktifkan tombol
}

// Fungsi untuk menampilkan pertanyaan acak
function showRandomQuestion() {
  if (questions.length === 0) {
    console.error("Questions are not loaded yet.");
    return; // Keluar dari fungsi jika pertanyaan belum dimuat
  }

  // Memilih pertanyaan secara acak dari array 'questions'
  const randomIndex = Math.floor(Math.random() * questions.length);
  currentQuestion = questions[randomIndex];

  // Jika kartu bertipe 'event', langsung terapkan efek reward
  if (currentQuestion.type === "event") {
    applyEventEffect(currentQuestion);
  } else {
    // Jika bukan event, jalankan logika pertanyaan
    displayQuestion(currentQuestion);
    toggleAnswerButtonsVisibility(currentQuestion.correctAnswer);
  }
}

// Fungsi untuk menampilkan teks pertanyaan pada kartu
function displayQuestion(question) {
  const questionText = document.querySelector(".card-content p");
  questionText.textContent = question.question; // Mengatur teks pertanyaan pada elemen HTML
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
  const { isCorrect, steps, stun } = evaluateAnswer(answer); // Mengevaluasi jawaban pemain
  showResult(isCorrect, steps, stun); // Menampilkan hasil berdasarkan jawaban
  hideQuestionCard(); // Menyembunyikan kartu pertanyaan setelah pemain menjawab
}

// Fungsi untuk mengevaluasi apakah jawaban pemain benar atau salah
function evaluateAnswer(answer) {
  const isCorrect = answer === currentQuestion.correctAnswer; // Cek apakah jawaban sesuai
  const reward = isCorrect ? currentQuestion.reward.correct : currentQuestion.reward.wrong; // Mengambil reward/hukuman

  return {
    isCorrect,
    steps: reward.steps,
    stun: reward.stun,
  };
}

// Fungsi untuk menampilkan popup hasil
function showResult(isCorrect, steps, stun) {
  const message = buildResultMessage(isCorrect, steps, stun); // Membangun pesan hasil
  resultMessage.textContent = message; // Menampilkan pesan hasil pada elemen HTML

  // Mengatur ikon hasil (benar atau salah)
  resultIcon.src = isCorrect ? "Assets/Ikon - Benar Abu.png" : "Assets/Ikon - Salah Abu.png";

  // Menampilkan pop-up hasil
  togglePopupVisibility(resultPopup, true);
}

// Fungsi untuk membangun pesan hasil
function buildResultMessage(isCorrect, steps, stun) {
  let message = "";

  if (isCorrect) {
    message = `Jawaban kamu benar, maju ${steps} langkah.`; // Pesan jika jawaban benar
  } else if (steps !== 0) {
    message = `Jawaban kamu salah, mundur ${Math.abs(steps)} langkah.`; // Pesan jika jawaban salah dan perlu mundur
  }

  if (stun > 0) {
    message += message ? ` Kamu kehilangan giliran untuk ${stun} putaran.` : `Kamu kehilangan giliran untuk ${stun} putaran.`; // Tambahan pesan jika terkena stun
  }

  return message; // Mengembalikan pesan lengkap
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

  // Menentukan apakah event ini menguntungkan atau merugikan
  const isBeneficial = steps > 0 && stun === 0;

  // Menambahkan pesan mengenai langkah dan stun
  if (steps > 0) {
    message += ` Maju ${steps} langkah. `;
  } else if (steps < 0) {
    message += ` Mundur ${Math.abs(steps)} langkah. `;
  }

  if (stun > 0) {
    message += `Kamu kehilangan giliran untuk ${stun} putaran.`;
  }

  // Tampilkan pesan di popup
  resultMessage.textContent = message;

  // Mengubah ikon berdasarkan apakah event menguntungkan atau merugikan
  resultIcon.src = isBeneficial ? "Assets/Ikon - Benar Abu.png" : "Assets/Ikon - Salah Abu.png";

  // Tampilkan popup hasil
  togglePopupVisibility(resultPopup, true);

  // Placeholder untuk logika memindahkan pemain
  movePlayer(steps);
}

// Fungsi placeholder untuk menggerakkan pemain di papan permainan
function movePlayer(steps) {
  console.log(`Pemain bergerak ${steps} langkah.`); // Placeholder untuk logika permainan
}

// Saat tombol "Tampilkan Pertanyaan" diklik
showQuestionBtn.addEventListener("click", () => {
  if (questions.length > 0) {
    toggleElementVisibility(questionCard, true); // Menampilkan kartu pertanyaan
    showRandomQuestion(); // Menampilkan pertanyaan acak
  } else {
    console.error("Questions are not loaded yet. Please try again later."); // Pesan error jika pertanyaan belum tersedia
  }
});

// Saat tombol "Credit" diklik
creditBtn.addEventListener("click", () => handleAnswer("credit")); // Menangani jawaban "Credit"

// Saat tombol "Debit" diklik
debitBtn.addEventListener("click", () => handleAnswer("debit")); // Menangani jawaban "Debit"

// Saat tombol "Next" diklik untuk melanjutkan setelah melihat hasil
nextBtn.addEventListener("click", () => {
  togglePopupVisibility(resultPopup, false); // Menyembunyikan pop-up hasil
  toggleElementVisibility(questionCard, false); // Menyembunyikan kartu pertanyaan
});

loadQuestions();

// // Load Questions from Multiple JSON Files
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
