/* Outpost Travel — shared site behaviour (v2)
   Newsletter forms: any <form class="js-newsletter"> posts to Netlify Forms in
   the background and swaps in an inline confirmation. Without JS the form still
   works: method="POST" + action="/thanks.html" lets Netlify handle it. */
(function () {
  function encode(form) {
    return new URLSearchParams(new FormData(form)).toString();
  }

  document.querySelectorAll('form.js-newsletter').forEach(function (form) {
    var status = form.parentNode.querySelector('.form-status');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }

      var button = form.querySelector('button[type="submit"]');
      var label = button ? button.textContent : '';
      if (button) { button.disabled = true; button.textContent = 'Sending…'; }

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode(form)
      })
        .then(function (res) {
          if (!res.ok) throw new Error('Status ' + res.status);
          form.hidden = true;
          if (status) {
            status.classList.remove('is-error');
            status.classList.add('is-success');
            status.textContent = "Thank you. You're on the list, and the first Dispatch will find you soon.";
          }
        })
        .catch(function () {
          if (button) { button.disabled = false; button.textContent = label; }
          if (status) {
            status.classList.add('is-error');
            status.innerHTML = 'That didn’t go through. Please try again, or email <a href="mailto:hello@outposttravel.co?subject=Add%20me%20to%20The%20Dispatch">hello@outposttravel.co</a> and we’ll add you.';
          }
        });
    });
  });
})();
