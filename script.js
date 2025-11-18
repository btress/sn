let totalHours = 0;
let totalMinutes = 0;
let sessions = [];

document.getElementById('timeForm').addEventListener('submit', function (e) {
    e.preventDefault();
    calculateTime();
});

function calculateTime() {
    const startHour = parseInt(document.getElementById('startHour').value);
    const startMinute = parseInt(document.getElementById('startMinute').value);
    const endHour = parseInt(document.getElementById('endHour').value);
    const endMinute = parseInt(document.getElementById('endMinute').value);

    // Validate input
    if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) {
        showError('Vui lòng nhập đầy đủ thông tin!');
        return;
    }

    if (startHour < 0 || startHour > 23 || endHour < 0 || endHour > 23) {
        showError('Giờ phải từ 0 đến 23!');
        return;
    }

    if (startMinute < 0 || startMinute > 59 || endMinute < 0 || endMinute > 59) {
        showError('Phút phải từ 0 đến 59!');
        return;
    }

    // Calculate work time (same logic as C++ code)
    let h = endHour - startHour;
    let p;

    if (startMinute <= endMinute) {
        p = endMinute - startMinute;
    } else {
        p = 60 - startMinute + endMinute;
        h--;
    }

    // Check if end time is before start time (next day)
    if (h < 0) {
        h += 24;
    }

    // Update totals
    totalHours += h;
    totalMinutes += p;

    if (totalMinutes >= 60) {
        totalMinutes -= 60;
        totalHours++;
    }

    // Add to sessions
    sessions.push({
        start: `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`,
        end: `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`,
        duration: `${h}h ${p}phút`
    });

    // Display results with celebration animation
    document.getElementById('dailyTime').innerHTML = `Hôm nay: <strong>${h}h ${p}phút</strong> 🎉`;
    document.getElementById('totalTime').innerHTML = `<strong>${totalHours}h ${totalMinutes}phút</strong> 💪`;

    const resultDiv = document.getElementById('result');
    resultDiv.style.display = 'block';
    resultDiv.style.animation = 'bounce 0.8s ease-out';

    document.getElementById('error').style.display = 'none';

    // Add celebration effect
    setTimeout(() => {
        resultDiv.style.animation = '';
    }, 800);

    updateSessionList();
    clearForm();
}

function updateSessionList() {
    const sessionListDiv = document.getElementById('sessionList');
    const sessionsDiv = document.getElementById('sessions');

    sessionsDiv.innerHTML = '';

    sessions.forEach((session, index) => {
        const sessionDiv = document.createElement('div');
        sessionDiv.className = 'session-item';
        sessionDiv.innerHTML = `
                    <div class="session-time">${session.start} - ${session.end}</div>
                    <div class="session-duration">Thời gian: ${session.duration}</div>
                `;
        sessionsDiv.appendChild(sessionDiv);
    });

    sessionListDiv.style.display = sessions.length > 0 ? 'block' : 'none';
}

function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = '❌ ' + message;
    errorDiv.style.display = 'block';
    errorDiv.style.animation = 'wiggle 0.5s ease-in-out';
    document.getElementById('result').style.display = 'none';

    setTimeout(() => {
        errorDiv.style.animation = '';
    }, 500);
}

function clearForm() {
    document.getElementById('startHour').value = '';
    document.getElementById('startMinute').value = '';
    document.getElementById('endHour').value = '';
    document.getElementById('endMinute').value = '';
}

function clearAll() {
    if (confirm('🗑️ công chúa có chắc chắn muốn xóa tất cả dữ liệu không? 😢')) {
        totalHours = 0;
        totalMinutes = 0;
        sessions = [];

        // Add farewell animation
        const elements = ['result', 'sessionList'];
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element.style.display !== 'none') {
                element.style.animation = 'fadeOut 0.5s ease-out';
                setTimeout(() => {
                    element.style.display = 'none';
                    element.style.animation = '';
                }, 500);
            }
        });

        document.getElementById('error').style.display = 'none';
        clearForm();

        // Show success message
        setTimeout(() => {
            alert('✨ Đã xóa thành công! Hãy bắt đầu lại nhé! 😊');
        }, 600);
    }
}

// Add fadeOut animation
const style = document.createElement('style');
style.textContent = `
            @keyframes fadeOut {
                from { opacity: 1; transform: scale(1); }
                to { opacity: 0; transform: scale(0.8); }
            }
        `;
document.head.appendChild(style);

// Auto focus on first input
document.getElementById('startHour').focus();