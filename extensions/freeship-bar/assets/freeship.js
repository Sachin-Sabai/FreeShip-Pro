document.addEventListener('DOMContentLoaded', () => {
  const bar = document.getElementById('freeship-pro-bar');
  if (!bar) return;

  const msgEl = document.getElementById('freeship-pro-msg');
  const progressEl = document.getElementById('freeship-pro-progress');

  const goal = parseFloat(bar.getAttribute('data-goal')) || 50;
  const successMsg = bar.getAttribute('data-success-msg');
  const progressMsg = bar.getAttribute('data-progress-msg') || 'Add $10.00 more to unlock FREE shipping';
  const position = bar.getAttribute('data-position');

  if (position === 'top') {
    document.body.style.paddingTop = bar.offsetHeight + 'px';
  } else if (position === 'bottom') {
    document.body.style.paddingBottom = bar.offsetHeight + 'px';
  }

  const updateBar = (cartTotalCents) => {
    const totalDollars = cartTotalCents / 100;
    const remainingDollars = goal - totalDollars;

    if (remainingDollars > 0) {
      const formattedAmount = remainingDollars.toFixed(2);
      msgEl.innerHTML = progressMsg.replace(/\$10\.00/g, `<strong>$${formattedAmount}</strong>`);
      const percentage = Math.min((totalDollars / goal) * 100, 100);
      progressEl.style.width = `${percentage}%`;
    } else {
      msgEl.innerHTML = successMsg;
      progressEl.style.width = '100%';
    }
  };

  const fetchCart = () => {
    fetch('/cart.js', { cache: 'no-store' })
      .then(response => response.json())
      .then(cart => {
        updateBar(cart.total_price);
      })
      .catch(err => console.error("Error fetching cart", err));
  };

  fetchCart();

  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const response = await originalFetch(...args);
    const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;
    if (url && (url.includes('/cart/add') || url.includes('/cart/change') || url.includes('/cart/clear') || url.includes('/cart/update'))) {
      response.clone().text().then(() => {
        setTimeout(fetchCart, 100);
      }).catch(e => console.error(e));
    }
    return response;
  };

  const originalXHR = window.XMLHttpRequest.prototype.open;
  window.XMLHttpRequest.prototype.open = function(method, url) {
    this.addEventListener('load', function() {
      if (url && (url.includes('/cart/add') || url.includes('/cart/change') || url.includes('/cart/clear') || url.includes('/cart/update'))) {
        setTimeout(fetchCart, 100);
      }
    });
    originalXHR.apply(this, arguments);
  };
});
