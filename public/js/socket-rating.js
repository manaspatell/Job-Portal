// Socket.IO client for live rating updates on school dashboard
(function() {
  if (typeof io === 'undefined') return;
  const socket = io();
  socket.on('ratingUpdated', function(data) {
    // Find the row for this applicant and update the rating display
    const row = document.querySelector(`[data-applicant-id="${data.applicantId}"]`);
    if (row) {
      const ratingDiv = row.querySelector('.rating-display');
      if (ratingDiv) {
        let html = '';
        for (let i = 1; i <= 5; i++) {
          html += `<span class="star${data.rating >= i ? '' : ' empty'}">★</span>`;
        }
        ratingDiv.innerHTML = html;
      }
    }
  });
})();
