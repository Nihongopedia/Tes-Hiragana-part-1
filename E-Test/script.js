// Daftar kata kasar & variasinya dalam berbagai bahasa
const kataKotor = [
    "anjing", "babi", "monyet", "bangsat", "goblok", "tolol", "kontol", "memek", "ngentot", "fuck", "shit", "bitch",
    "asshole", "bastard", "cunt", "dick", "slut", "whore", "faggot", "pussy", "cock", "wanker", "twat", "idiot",
    "retard", "stupid", "sial", "brengsek", "kampret", "pecundang", "sundala", "setan", "iblis",
    "ajg", "mmk", "ntl", "kntl", "anj", "bgst", "bngst", "tdk sopan", "asw", "ngt", "kmpr", "pntk", "pantek",
    "mmeek", "memekkk", "memeeek", "kontoll", "kuntul", "ngentott", "mmek", "mmmkk", "mmmk", "asuu", "asu", "asuuh"
];

// Validasi username sebelum masuk ke test
function simpanUsername() {
    let username = document.getElementById("username").value.trim();

    if (username === "") {
        alert("Masukkan username terlebih dahulu!");
        return;
    }

    if (/\d/.test(username)) {
        alert("Username tidak boleh mengandung angka!");
        return;
    }

    let usernameLower = username.toLowerCase();
    for (let kata of kataKotor) {
        let regex = new RegExp(`\\b${kata}\\b`, "gi");
        if (regex.test(usernameLower)) {
            alert("Username tidak boleh mengandung kata kasar atau variasinya!");
            return;
        }
    }

    localStorage.setItem("username", username);
    window.location.href = "test.html";
}

// Menampilkan soal di test.html
function mulaiQuiz() {
    fetch("soal.json")
        .then(response => response.json())
        .then(data => {
            let quizContainer = document.getElementById("quiz-container");
            quizContainer.innerHTML = "";

            data.soal.forEach((item, index) => {
                let soalHTML = `<div class='mb-3'>
                    <p class='fw-bold'>Soal ${index + 1}: ${item.pertanyaan}</p>`;
                item.pilihan.forEach(jawaban => {
                    soalHTML += `<div class='form-check'>
                        <input class='form-check-input' type='radio' name='soal${index}' value='${jawaban}'>
                        <label class='form-check-label'>${jawaban}</label>
                    </div>`;
                });
                soalHTML += `</div>`;
                quizContainer.innerHTML += soalHTML;
            });
        });
}

// Simpan & tampilkan leaderboard
function simpanLeaderboard(username, skor) {
    let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    leaderboard.push({ username, skor });
    leaderboard.sort((a, b) => b.skor - a.skor);
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
}

function tampilkanLeaderboard() {
    let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    document.getElementById("leaderboard").innerHTML = leaderboard.length 
        ? leaderboard.map((e, i) => `<li class='list-group-item'>${i+1}. ${e.username} - Skor: ${e.skor}</li>`).join("")
        : "<li class='list-group-item text-center'>Leaderboard kosong</li>";
}

function hapusLeaderboard() {
    let passwordBenar = "12345678901234567890"; // Ganti dengan password yang Anda inginkan
    let passwordInput = prompt("Masukkan password untuk menghapus leaderboard:");

    if (passwordInput === null) {
        return; // Jika pengguna menekan "Batal"
    }

    if (passwordInput === passwordBenar) {
        if (confirm("Yakin ingin menghapus leaderboard?")) {
            localStorage.removeItem("leaderboard");
            tampilkanLeaderboard();
            alert("Leaderboard berhasil dihapus!");
        }
    } else {
        alert("Password salah! Leaderboard tidak dihapus.");
    }
}

// Toggle mode gelap
function toggleDarkMode() {
    let body = document.getElementById("body");
    body.classList.toggle("bg-dark");
    body.classList.toggle("text-white");
}

// Load soal dari soal.json
document.addEventListener("DOMContentLoaded", function() {
    if (document.getElementById("quiz-container")) {
        mulaiQuiz();
        mulaiTimer(2999);
    }
    if (document.getElementById("leaderboard")) {
        tampilkanLeaderboard();
    }
});

// Timer ujian
function mulaiTimer(durasi) {
    let waktu = durasi;
    let timerElement = document.getElementById("timer");

    let hitungMundur = setInterval(() => {
        let jam = Math.floor(waktu / 3600);
        let menit = Math.floor((waktu % 3600) / 60);
        let detik = waktu % 60;

        // Format dua digit untuk menit dan detik
        let jamTampil = jam < 10 ? `0${jam}` : jam;
        let menitTampil = menit < 10 ? `0${menit}` : menit;
        let detikTampil = detik < 10 ? `0${detik}` : detik;

        timerElement.innerText = `Waktu :${jamTampil}h ${menitTampil}m ${detikTampil}s`;
        waktu--;

        if (waktu < 0) {
            clearInterval(hitungMundur);
            alert("Waktu habis! Jawaban telah dikumpulkan.");
            hitungSkor(true); // Paksa submit tanpa konfirmasi
        }
    }, 1000);
}


// Validasi sebelum submit
function hitungSkor(paksaSubmit = false) {
    fetch("soal.json")
        .then(response => response.json())
        .then(data => {
            let skor = 0;
            let belumDijawab = 0;

            data.soal.forEach((item, index) => {
                let jawabanUser = document.querySelector(`input[name='soal${index}']:checked`);
                if (!jawabanUser) {
                    belumDijawab++;
                } else if (jawabanUser.value === item.jawaban) {
                    skor++;
                }
            });

            // Jika soal ada yang belum dijawab & submit bukan dipaksa, tanyakan ke user
            if (!paksaSubmit && belumDijawab > 0) {
                if (!confirm("Ada soal yang belum Anda jawab, yakin ingin submit?")) {
                    return;
                }
            }

            let username = localStorage.getItem("username");
            simpanLeaderboard(username, skor);
            alert("Terima kasih telah mengikuti ujian!");
            window.location.href = "index.html";
        });
}

// ❌ Mencegah Klik Kanan & Beri Notifikasi
document.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    alert("⚠️ Peringatan: Klik kanan dinonaktifkan!");
});

// ❌ Mencegah Kombinasi Keyboard (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U) & Beri Notifikasi
document.addEventListener("keydown", function(event) {
    if (
        event.key === "F12" || 
        (event.ctrlKey && event.shiftKey && (event.key === "I" || event.key === "J")) || 
        (event.ctrlKey && event.key === "U")
    ) {
        event.preventDefault();
        alert("⚠️ Peringatan: Akses ke DevTools dilarang!");
    }
});

// ❌ Deteksi DevTools Terbuka & Beri Peringatan
(function() {
    let threshold = 160; // Ukuran minimum jika DevTools terbuka

    function checkDevTools() {
        let widthThreshold = window.outerWidth - window.innerWidth > threshold;
        let heightThreshold = window.outerHeight - window.innerHeight > threshold;
        if (widthThreshold || heightThreshold) {
            alert("🚨 Peringatan: Inspect Element terdeteksi! Tutup DevTools sekarang!");
            window.location.href = "https://www.google.com"; // Redirect ke halaman lain
        }
    }

    setInterval(checkDevTools, 1000);
})();

// ❌ Deteksi `debugger;` di Console & Beri Peringatan
setInterval(() => {
    let start = performance.now();
    debugger; // Jika DevTools terbuka, ini akan berhenti
    let end = performance.now();
    if (end - start > 100) {
        alert("🚨 Akses terdeteksi! Jangan mencoba mengotak-atik sistem!");
        window.close(); // Menutup tab
    }
}, 2000);
