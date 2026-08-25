/**
 * Sistema de Gestión de Código Azul - Olimpiadas INEP 2026
 * App Frontend Engine
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('⚡ Sistema Código Azul Inicializado');
    
    // UI Elements
    const triggerBtn = document.getElementById('triggerCodeBtn');
    const modalBackdrop = document.getElementById('codeModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const codeForm = document.getElementById('codeBlueForm');
    const timerDisplay = document.getElementById('timerDisplay');
    const activeCodeBanner = document.getElementById('activeCodeBanner');
    const resolveBtn = document.getElementById('resolveCodeBtn');
    const activeRoomLabel = document.getElementById('activeRoomLabel');

    let activeCode = null;
    let timerInterval = null;
    let secondsElapsed = 0;

    // Load initial codes from API or LocalStorage
    fetchActiveCodes();

    // Modal Control
    if (triggerBtn) {
        triggerBtn.addEventListener('click', () => {
            modalBackdrop.classList.add('show');
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            modalBackdrop.classList.remove('show');
        });
    }

    // Form Submit
    if (codeForm) {
        codeForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const location = document.getElementById('locationInput').value;
            const patient = document.getElementById('patientInput').value || 'Paciente No Identificado';
            const teamLeader = document.getElementById('leaderInput').value || 'Dr. Guardia R1';
            const details = document.getElementById('detailsInput').value;

            const payload = {
                location,
                patient,
                team_leader: teamLeader,
                details,
                status: 'ACTIVO',
                created_at: new Date().toISOString()
            };

            try {
                // Try sending to Laravel Backend API
                const res = await fetch('/api/code-blue', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (res.ok) {
                    const data = await res.json();
                    startActiveCode(data.data || payload);
                } else {
                    startActiveCode(payload);
                }
            } catch (err) {
                // Fallback for standalone frontend dev
                startActiveCode(payload);
            }

            modalBackdrop.classList.remove('show');
            codeForm.reset();
        });
    }

    // Resolve Code Blue
    if (resolveBtn) {
        resolveBtn.addEventListener('click', () => {
            if (activeCode) {
                activeCode.status = 'RESUELTO';
                stopTimer();
                activeCodeBanner.style.display = 'none';
                alert('🟢 Código Azul finalizado. Registro guardado exitosamente.');
                addHistoryRow(activeCode);
                activeCode = null;
            }
        });
    }

    function startActiveCode(codeData) {
        activeCode = codeData;
        activeRoomLabel.textContent = `${codeData.location} (${codeData.patient})`;
        activeCodeBanner.style.display = 'flex';
        secondsElapsed = 0;
        
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            secondsElapsed++;
            const mins = String(Math.floor(secondsElapsed / 60)).padStart(2, '0');
            const secs = String(secondsElapsed % 60).padStart(2, '0');
            timerDisplay.textContent = `${mins}:${secs}`;
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
    }

    async function fetchActiveCodes() {
        try {
            const res = await fetch('/api/code-blue');
            if (res.ok) {
                const data = await res.json();
                if (data && data.length > 0) {
                    renderTable(data);
                }
            }
        } catch (e) {
            console.log('Running in client offline mode or API pending');
        }
    }

    function addHistoryRow(code) {
        const tbody = document.getElementById('historyTableBody');
        if (!tbody) return;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${code.location}</strong></td>
            <td>${code.patient}</td>
            <td>${code.team_leader}</td>
            <td><span class="badge badge-resolved">RESUELTO</span></td>
            <td>${timerDisplay.textContent}</td>
            <td>${new Date().toLocaleTimeString()}</td>
        `;
        tbody.prepend(tr);
    }
});
